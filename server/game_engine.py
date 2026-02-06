import random
import time
from typing import Dict, List, Optional, Tuple, Any
from server.models import GameState, Player, PropertyCard, AuctionState, ChatMessage, TradeOffer, Loan
from server.config import BOARD_CONFIG
from server.cards import create_chance_deck, create_community_chest_deck, CardDeck

class GameEngine:
    def __init__(self, room_id: str):
        self.state = GameState(room_id=room_id)
        self.initialize_board()
        self.chance_deck = create_chance_deck()
        self.community_deck = create_community_chest_deck()

    def initialize_board(self):
        for index, config in BOARD_CONFIG.items():
            if config["type"] in ["PROPERTY", "RAILROAD", "UTILITY"]:
                # Default values for non-standard properties
                rent = config.get("rent", [])
                house_cost = config.get("house_cost", 0)
                group = config.get("group", config["type"])
                
                self.state.board_state[index] = PropertyCard(
                    index=index,
                    name=config["name"],
                    group=group,
                    price=config["price"],
                    rent=rent,
                    house_cost=house_cost,
                    image_url=f"/assets/cities/{config['name'].lower().replace(' ', '_')}.jpg"
                )

    def add_player(self, player_id: str, name: str, color: str, token_id: str):
        if any(p.id == player_id for p in self.state.players):
            return # Player already exists (reconnection case handled elsewhere)
        
        new_player = Player(
            id=player_id,
            name=name,
            color=color,
            token_id=token_id
        )
        self.state.players.append(new_player)
        self.log(f"{name} joined the game with ${new_player.cash}.")

    def start_game(self):
        if len(self.state.players) < 2:
            return False, "Need at least 2 players to start."
        
        self.state.game_status = "PLAYING"
        self.state.turn_phase = "ROLL"
        self.state.current_turn_index = 0
        self.set_turn_timer()
        self.log("The game has begun!")
        return True, "Game started."

    def set_turn_timer(self):
        self.state.turn_end_timestamp = time.time() + self.state.settings["turn_timer"]

    def log(self, message: str):
        self.state.logs.append(message)
        if len(self.state.logs) > 50:
            self.state.logs.pop(0)

    def roll_dice(self, player_id: str) -> Tuple[bool, str]:
        player = self.get_current_player()
        if not player or player.id != player_id:
            return False, "Not your turn."
        
        if self.state.turn_phase != "ROLL":
            return False, "Already rolled."

        die1 = random.randint(1, 6)
        die2 = random.randint(1, 6)
        self.state.dice_roll = [die1, die2]
        
        is_doubles = die1 == die2
        if is_doubles:
            self.state.consecutive_doubles += 1
        else:
            self.state.consecutive_doubles = 0

        self.log(f"{player.name} rolled {die1} and {die2}.")

        if self.state.consecutive_doubles >= 3:
            self.go_to_jail(player)
            self.state.turn_phase = "END"
            return True, "Speeding! Go to jail."

        self.move_player(player, die1 + die2)
        return True, "Dice rolled."

    def move_player(self, player: Player, steps: int):
        old_pos = player.position
        new_pos = (old_pos + steps) % 60
        
        # Pass GO check
        if new_pos < old_pos:
            player.cash += 200
            self.log(f"{player.name} passed GO and collected $200.")
            
        player.position = new_pos
        self.handle_landing(player, new_pos)

    def go_to_jail(self, player: Player):
        player.position = 10 # Jail (Visiting) is at 10, but we'll mark in_jail
        player.in_jail = True
        player.jail_turns = 0
        self.log(f"{player.name} was sent to jail!")

    def handle_landing(self, player: Player, position: int):
        config = BOARD_CONFIG.get(position)
        if not config:
            return

        # Default to END, only set to ACTION if player needs to make a decision (Buy/Skip)
        self.state.turn_phase = "END"
        
        tile_type = config["type"]
        if tile_type in ["PROPERTY", "RAILROAD", "UTILITY"]:
            prop = self.state.board_state[position]
            if prop.owner_id is None:
                self.state.turn_phase = "ACTION"
                # Offer to buy
                pass 
            elif prop.owner_id != player.id:
                self.pay_rent(player, prop)
        elif tile_type == "TAX":
            player.cash -= config["amount"]
            self.log(f"{player.name} paid ${config['amount']} in {config['name']}.")
        elif tile_type == "GO_TO_JAIL":
            self.go_to_jail(player)
        elif tile_type == "SUBWAY":
            # Teleport logic
            target = 45 if position == 15 else 15
            player.position = target
            self.log(f"{player.name} took the subway to {target}.")
        elif tile_type == "CHANCE":
            self.draw_card(player, "CHANCE")
        elif tile_type == "COMMUNITY_CHEST":
            self.draw_card(player, "COMMUNITY")
        elif tile_type == "BANK_DEPOSIT":
            player.cash += 500
            self.log(f"{player.name} found a bank deposit of $500!")

    def draw_card(self, player: Player, card_type: str):
        """Draw and apply a card from the specified deck"""
        deck = self.chance_deck if card_type == "CHANCE" else self.community_deck
        card = deck.draw()
        
        self.log(f"{player.name} drew {card_type}: {card['text']}")
        self.apply_card_effect(player, card)
    
    def apply_card_effect(self, player: Player, card: Dict[str, Any]):
        """Apply the effect of a drawn card"""
        card_type = card["type"]
        
        if card_type == "MOVE_ABS":
            # Move to absolute position
            old_pos = player.position
            new_pos = card["position"]
            player.position = new_pos
            
            # Check if passed GO
            if new_pos < old_pos or new_pos == 0:
                player.cash += 200
                self.log(f"{player.name} passed GO and collected $200.")
            
            self.handle_landing(player, new_pos)
        
        elif card_type == "MOVE_REL":
            # Move relative steps
            self.move_player(player, card["steps"])
        
        elif card_type == "GET_CASH":
            # Receive cash from bank
            player.cash += card["amount"]
        
        elif card_type == "PAY_CASH":
            # Pay cash to bank
            player.cash -= card["amount"]
        
        elif card_type == "GET_OUT_JAIL":
            # Get out of jail free card
            player.get_out_of_jail_cards += 1
            self.log(f"{player.name} received a Get Out of Jail Free card!")
        
        elif card_type == "GO_TO_JAIL":
            # Go directly to jail
            self.go_to_jail(player)
        
        elif card_type == "REPAIR":
            # Pay for property repairs
            total_cost = 0
            for prop_idx in player.properties:
                prop = self.state.board_state[prop_idx]
                if prop.houses < 5:
                    total_cost += prop.houses * card["house_cost"]
                else:  # Hotel
                    total_cost += card["hotel_cost"]
            player.cash -= total_cost
            self.log(f"{player.name} paid ${total_cost} in repairs.")
        
        elif card_type == "COLLECT_FROM_ALL":
            # Collect from all players
            amount_per_player = card["amount"]
            total_collected = 0
            for p in self.state.players:
                if p.id != player.id:
                    p.cash -= amount_per_player
                    total_collected += amount_per_player
            player.cash += total_collected
            self.log(f"{player.name} collected ${total_collected} from other players.")
        
        elif card_type == "PAY_TO_ALL":
            # Pay to all players
            amount_per_player = card["amount"]
            total_paid = 0
            for p in self.state.players:
                if p.id != player.id:
                    p.cash += amount_per_player
                    total_paid += amount_per_player
            player.cash -= total_paid
            self.log(f"{player.name} paid ${total_paid} to other players.")

    def move_to(self, player: Player, position: int):
        player.position = position
        self.handle_landing(player, position)

    def add_cash(self, player: Player, amount: int):
        player.cash += amount

    def collect_from_all(self, player: Player, amount: int):
        for p in self.state.players:
            if p.id != player.id:
                p.cash -= amount
                player.cash += amount

    def start_auction(self, property_index: int):
        self.state.turn_phase = "AUCTION"
        self.state.active_auction = AuctionState(
            property_index=property_index,
            current_bid=10,
            participants=[p.id for p in self.state.players],
            end_time=time.time() + 15
        )
        prop = self.state.board_state[property_index]
        self.log(f"Auction started for {prop.name}! Starting bid: $10.")

    def place_bid(self, player_id: str, amount: int) -> Tuple[bool, str]:
        if self.state.turn_phase != "AUCTION" or not self.state.active_auction:
            return False, "No active auction."
        
        auction = self.state.active_auction
        if amount <= auction.current_bid:
            return False, f"Bid must be higher than current bid (${auction.current_bid})."
        
        player = next((p for p in self.state.players if p.id == player_id), None)
        if not player:
            return False, "Player not found."
            
        if player.cash < amount:
            return False, f"Insufficient funds. You have ${player.cash}, bid is ${amount}."
        
        auction.current_bid = amount
        auction.highest_bidder_id = player_id
        auction.end_time = time.time() + 10 # Reset timer
        self.log(f"{player.name} bid ${amount}.")
        return True, "Bid placed."

    def pay_rent(self, player: Player, prop: PropertyCard):
        owner = next((p for p in self.state.players if p.id == prop.owner_id), None)
        if not owner or owner.in_jail: # Hardcore rule: no rent in jail
            return

        rent_amount = self.calculate_rent(prop)
        player.cash -= rent_amount
        owner.cash += rent_amount
        self.log(f"{player.name} paid ${rent_amount} rent to {owner.name}.")

    def calculate_rent(self, prop: PropertyCard) -> int:
        """Calculate rent according to specification"""
        if prop.is_mortgaged:
            return 0
        
        # Get property config to check type
        config = BOARD_CONFIG.get(prop.index, {})
        prop_type = config.get("type", "PROPERTY")
        
        # Railroad rent: $25/$50/$100/$200/$300 for 1-5 RRs owned
        if prop_type == "RAILROAD":
            rr_count = sum(1 for idx, p in self.state.board_state.items() 
                          if BOARD_CONFIG.get(idx, {}).get("type") == "RAILROAD" 
                          and p.owner_id == prop.owner_id)
            rent_levels = [25, 50, 100, 200, 300]
            return rent_levels[min(rr_count - 1, 4)]
        
        # Utility rent: 4x/10x/20x/40x dice roll for 1-4 utilities owned
        if prop_type == "UTILITY":
            util_count = sum(1 for idx, p in self.state.board_state.items() 
                            if BOARD_CONFIG.get(idx, {}).get("type") == "UTILITY" 
                            and p.owner_id == prop.owner_id)
            multipliers = [4, 10, 20, 40]
            return sum(self.state.dice_roll) * multipliers[min(util_count - 1, 3)]
        
        # Property rent with houses
        if prop.houses > 0:
            return prop.rent[prop.houses]
        
        # Base rent with color set bonus (2x if full group owned with no houses)
        group_props = [p for idx, p in self.state.board_state.items() 
                      if p.group == prop.group and BOARD_CONFIG.get(idx, {}).get("type") == "PROPERTY"]
        
        if all(p.owner_id == prop.owner_id for p in group_props):
            return prop.rent[0] * 2  # Double base rent for color set
        
        return prop.rent[0]  # Base rent

    def skip_purchase(self, player_id: str) -> Tuple[bool, str]:
        player = self.get_current_player()
        if not player or player.id != player_id:
            return False, "Not your turn."
        
        if self.state.turn_phase != "ACTION":
            return False, "Nothing to skip."
        
        prop = self.state.board_state.get(player.position)
        if prop and prop.owner_id is None:
            self.start_auction(player.position)
            return True, "Auction started."
        
        return False, "No property to auction."

    def buy_property(self, player_id: str, index: int) -> Tuple[bool, str]:
        player = self.get_current_player()
        if not player or player.id != player_id:
            return False, "Not your turn."
        
        if player.position != index:
            return False, "You are not on this property."
        
        prop = self.state.board_state.get(index)
        if not prop or prop.owner_id is not None:
            return False, "Property not available."
        
        if player.cash < prop.price:
            return False, f"Insufficient funds. You have ${player.cash}, need ${prop.price}."
        
        player.cash -= prop.price
        prop.owner_id = player.id
        player.properties.append(index)
        self.log(f"{player.name} bought {prop.name} for ${prop.price}.")
        self.state.turn_phase = "END"
        return True, "Property bought."

    def end_turn(self, player_id: str) -> Tuple[bool, str]:
        player = self.get_current_player()
        if not player or player.id != player_id:
            return False, "Not your turn."
        
        if player.cash < 0:
            return False, "You are in debt! Sell assets or declare bankruptcy."

        # Handle doubles
        if self.state.dice_roll[0] == self.state.dice_roll[1] and self.state.consecutive_doubles > 0 and not player.in_jail:
            self.state.turn_phase = "ROLL"
            self.set_turn_timer()
            self.log(f"{player.name} gets another roll for doubles!")
            return True, "Roll again."

        # Next player
        self.state.current_turn_index = (self.state.current_turn_index + 1) % len(self.state.players)
        self.state.turn_phase = "ROLL"
        self.state.consecutive_doubles = 0
        self.state.total_turns_played += 1
        self.set_turn_timer()
        
        next_player = self.get_current_player()
        self.log(f"It is now {next_player.name}'s turn.")
        return True, "Turn ended."

    def get_current_player(self) -> Optional[Player]:
        if not self.state.players:
            return None
        return self.state.players[self.state.current_turn_index]

    def resolve_auction(self) -> Tuple[bool, str]:
        if not self.state.active_auction:
            return False, "No active auction."
        
        auction = self.state.active_auction
        if auction.highest_bidder_id is None:
            self.state.active_auction = None
            self.state.turn_phase = "END"
            self.log("Auction ended with no bids.")
            return True, "No winner."
        
        winner = next((p for p in self.state.players if p.id == auction.highest_bidder_id), None)
        prop = self.state.board_state[auction.property_index]
        
        if winner and winner.cash >= auction.current_bid:
            winner.cash -= auction.current_bid
            prop.owner_id = winner.id
            winner.properties.append(auction.property_index)
            self.log(f"{winner.name} won the auction for {prop.name} at ${auction.current_bid}!")
        else:
            self.log(f"Auction winner {winner.name if winner else 'Unknown'} could not pay.")
            
        self.state.active_auction = None
        self.state.turn_phase = "END"
        return True, "Auction resolved."

    def build_house(self, player_id: str, property_index: int) -> Tuple[bool, str]:
        player = next((p for p in self.state.players if p.id == player_id), None)
        if not player:
            return False, "Player not found."
        
        prop = self.state.board_state.get(property_index)
        if not prop or prop.owner_id != player_id:
            return False, "You don't own this property."
        
        if prop.houses >= 5:
            return False, "Max houses reached."
        
        if player.cash < prop.house_cost:
            return False, "Insufficient funds."
        
        # Check color group ownership
        group_props = [p for i, p in self.state.board_state.items() if p.group == prop.group]
        if any(p.owner_id != player_id for p in group_props):
            return False, "You must own the full color group to build."
        
        # Build evenly rule
        if any(p.houses < prop.houses for p in group_props):
            return False, "You must build evenly."

        player.cash -= prop.house_cost
        prop.houses += 1
        self.log(f"{player.name} built a {'hotel' if prop.houses == 5 else 'house'} on {prop.name}.")
        return True, "Built successfully."

    def sell_building(self, player_id: str, property_index: int) -> Tuple[bool, str]:
        player = next((p for p in self.state.players if p.id == player_id), None)
        if not player:
            return False, "Player not found."
        
        prop = self.state.board_state.get(property_index)
        if not prop or prop.owner_id != player_id:
            return False, "You don't own this property."
        
        if prop.houses <= 0:
            return False, "No buildings to sell."
            
        # Sell evenly rule: Cannot sell if other props have more houses (difference > 0, so actually if any other > this)
        # Actually standard rule: Must sell from property with MOST houses.
        # So we can't sell if another property in group has MORE houses (impossible if built evenly)
        # We can't sell if another property has SAME houses but we would become LESS.
        # Wait, rule is: difference max 1. 3,3,3 -> sell 1 -> 2,3,3 (ok). 2,3,3 -> sell 3 -> 2,3,2 (ok).
        # We cannot sell if result violates "difference <= 1".
        # So if we have 3, and another has 3. If we go to 2, diff 1. OK.
        # If we have 3, and another has 4. If we go to 2, diff 2. Fail.
        
        group_props = [p for i, p in self.state.board_state.items() if p.group == prop.group]
        
        # If we reduce houses by 1, will min and max diff be > 1?
        current_houses = prop.houses
        projected_houses = current_houses - 1
        
        # Check against all others
        for p in group_props:
            if p.index == property_index: continue
            if p.houses > projected_houses + 1: # If another has 4 and we go to 2, 4 > 2+1.
               return False, "Must break down evenly from highest buildings."
               
        refund = prop.house_cost // 2
        player.cash += refund
        prop.houses -= 1
        self.log(f"{player.name} sold a building on {prop.name} for ${refund}.")
        return True, "Building sold."
    
    # ===== BANKRUPTCY SYSTEM =====
    
    def check_bankruptcy(self, player: Player) -> bool:
        """Check if player is bankrupt (cash < 0 and no liquidatable assets)"""
        if player.cash >= 0:
            return False
        
        # Calculate total liquidatable assets
        total_value = 0
        for prop_idx in player.properties:
            prop = self.state.board_state[prop_idx]
            if not prop.is_mortgaged:
                total_value += prop.price // 2  # Mortgage value
            total_value += prop.houses * prop.house_cost // 2  # House sell value
        
        return player.cash + total_value < 0
    
    def declare_bankruptcy(self, player_id: str, creditor_id: str = "BANK") -> Tuple[bool, str]:
        """Handle bankruptcy - transfer assets to creditor or bank"""
        player = next((p for p in self.state.players if p.id == player_id), None)
        if not player:
            return False, "Player not found"
        
        # Transfer properties
        for prop_idx in list(player.properties):
            prop = self.state.board_state[prop_idx]
            if creditor_id == "BANK":
                # Reset to unowned
                prop.owner_id = None
                prop.houses = 0
                prop.is_mortgaged = False
            else:
                # Transfer to creditor
                prop.owner_id = creditor_id
                creditor = next(p for p in self.state.players if p.id == creditor_id)
                creditor.properties.append(prop_idx)
        
        # Remove player from game
        self.state.players = [p for p in self.state.players if p.id != player_id]
        self.log(f"{player.name} has declared bankruptcy!")
        
        # Check win condition
        if len(self.state.players) == 1:
            self.state.game_status = "ENDED"
            self.log(f"🏆 {self.state.players[0].name} wins the game!")
        
        return True, "Bankruptcy declared"
    
    # ===== MORTGAGE SYSTEM =====
    
    def mortgage_property(self, player_id: str, property_index: int) -> Tuple[bool, str]:
        """Mortgage a property for 50% of purchase price"""
        player = next((p for p in self.state.players if p.id == player_id), None)
        if not player or property_index not in player.properties:
            return False, "You don't own this property"
        
        prop = self.state.board_state[property_index]
        if prop.is_mortgaged:
            return False, "Property already mortgaged"
        if prop.houses > 0:
            return False, "Cannot mortgage property with houses"
        
        mortgage_value = prop.price // 2
        player.cash += mortgage_value
        prop.is_mortgaged = True
        self.log(f"{player.name} mortgaged {prop.name} for ${mortgage_value}")
        return True, f"Mortgaged for ${mortgage_value}"
    
    def unmortgage_property(self, player_id: str, property_index: int) -> Tuple[bool, str]:
        """Unmortgage a property for mortgage value + 10% interest"""
        player = next((p for p in self.state.players if p.id == player_id), None)
        if not player or property_index not in player.properties:
            return False, "You don't own this property"
        
        prop = self.state.board_state[property_index]
        if not prop.is_mortgaged:
            return False, "Property not mortgaged"
        
        unmortgage_cost = int(prop.price * 0.55)  # 50% + 10%
        if player.cash < unmortgage_cost:
            return False, f"Need ${unmortgage_cost} to unmortgage"
        
        player.cash -= unmortgage_cost
        prop.is_mortgaged = False
        self.log(f"{player.name} unmortgaged {prop.name} for ${unmortgage_cost}")
        return True, f"Unmortgaged for ${unmortgage_cost}"
    
    # ===== TRADING SYSTEM =====
    
    def create_trade_offer(self, proposer_id: str, target_id: str, 
                          offer_cash: int, offer_props: List[int],
                          request_cash: int, request_props: List[int]) -> Tuple[bool, str]:
        """Create a trade offer"""
        import uuid
        
        # Validate properties have no houses
        for prop_idx in offer_props + request_props:
            if prop_idx not in self.state.board_state:
                continue
            prop = self.state.board_state[prop_idx]
            group_props = [p for p in self.state.board_state.values() if p.group == prop.group]
            if any(p.houses > 0 for p in group_props):
                return False, "Cannot trade properties with houses on color group"
        
        trade = TradeOffer(
            id=str(uuid.uuid4()),
            proposer_id=proposer_id,
            target_player_id=target_id,
            offer_cash=offer_cash,
            offer_properties=offer_props,
            request_cash=request_cash,
            request_properties=request_props,
            status="PENDING"
        )
        self.state.active_trade = trade
        proposer = next(p for p in self.state.players if p.id == proposer_id)
        target = next(p for p in self.state.players if p.id == target_id)
        self.log(f"{proposer.name} proposed a trade to {target.name}")
        return True, "Trade offer created"
    
    def respond_to_trade(self, player_id: str, accept: bool) -> Tuple[bool, str]:
        """Accept or reject trade"""
        if not self.state.active_trade:
            return False, "No active trade"
        
        trade = self.state.active_trade
        if trade.target_player_id != player_id:
            return False, "Not your trade"
        
        if accept:
            # Execute trade
            proposer = next(p for p in self.state.players if p.id == trade.proposer_id)
            target = next(p for p in self.state.players if p.id == trade.target_player_id)
            
            # Validate funds
            if proposer.cash < trade.offer_cash or target.cash < trade.request_cash:
                self.state.active_trade = None
                return False, "Insufficient funds for trade"
            
            # Transfer cash
            proposer.cash -= trade.offer_cash
            proposer.cash += trade.request_cash
            target.cash += trade.offer_cash
            target.cash -= trade.request_cash
            
            # Transfer properties
            for prop_idx in trade.offer_properties:
                if prop_idx in proposer.properties:
                    proposer.properties.remove(prop_idx)
                    target.properties.append(prop_idx)
                    self.state.board_state[prop_idx].owner_id = target.id
            
            for prop_idx in trade.request_properties:
                if prop_idx in target.properties:
                    target.properties.remove(prop_idx)
                    proposer.properties.append(prop_idx)
                    self.state.board_state[prop_idx].owner_id = proposer.id
            
            self.log(f"✅ Trade completed between {proposer.name} and {target.name}")
            trade.status = "ACCEPTED"
        else:
            trade.status = "REJECTED"
            proposer = next(p for p in self.state.players if p.id == trade.proposer_id)
            target = next(p for p in self.state.players if p.id == trade.target_player_id)
            self.log(f"❌ {target.name} rejected trade from {proposer.name}")
        
        self.state.active_trade = None
        return True, "Trade completed" if accept else "Trade rejected"
    
    # ===== LOAN SYSTEM =====
    
    def take_bank_loan(self, player_id: str, amount: int) -> Tuple[bool, str]:
        """Take loan from bank (max 50% equity, 20% interest)"""
        import uuid
        
        player = next((p for p in self.state.players if p.id == player_id), None)
        if not player:
            return False, "Player not found"
        
        # Calculate equity (property value)
        equity = sum(self.state.board_state[idx].price for idx in player.properties)
        max_loan = equity // 2
        
        if amount > max_loan:
            return False, f"Max loan is ${max_loan} (50% of equity: ${equity})"
        
        loan = Loan(
            id=str(uuid.uuid4()),
            lender_id="BANK",
            borrower_id=player_id,
            principal=amount,
            total_due=int(amount * 1.2),  # 20% interest
            due_turn=None,  # Bank loans have no turn limit
            status="ACTIVE"
        )
        
        player.loans.append(loan)
        player.cash += amount
        self.log(f"{player.name} took a ${amount} loan from the bank (repay ${loan.total_due})")
        return True, f"Loan approved: ${amount}"
    
    def repay_loan(self, player_id: str, loan_id: str) -> Tuple[bool, str]:
        """Repay a loan"""
        player = next((p for p in self.state.players if p.id == player_id), None)
        if not player:
            return False, "Player not found"
        
        loan = next((l for l in player.loans if l.id == loan_id), None)
        if not loan:
            return False, "Loan not found"
        
        if player.cash < loan.total_due:
            return False, f"Need ${loan.total_due} to repay"
        
        player.cash -= loan.total_due
        loan.status = "PAID"
        player.loans = [l for l in player.loans if l.id != loan_id]
        self.log(f"{player.name} repaid loan of ${loan.total_due}")
        return True, "Loan repaid"

    def restart_game(self) -> Tuple[bool, str]:
        """Reset the game state to play again"""
        self.state.game_status = "LOBBY"
        self.state.turn_phase = "LOBBY"
        self.state.current_turn_index = 0
        self.state.total_turns_played = 0
        self.state.dice_roll = [1, 1]
        self.state.consecutive_doubles = 0
        self.state.logs = []
        self.state.active_auction = None
        self.state.active_trade = None
        
        # Reset Board
        self.initialize_board()
        
        # Reset Players
        for p in self.state.players:
            p.cash = 1500
            p.position = 0
            p.properties = []
            p.in_jail = False
            p.jail_turns = 0
            p.get_out_of_jail_cards = 0
            p.loans = []
            p.ready = False # Make them ready up again
            
        self.log("Game has been reset! Waiting for players to ready up.")
        return True, "Game reset"


    def get_state(self) -> dict:
        """Serialize the game state for transmission to clients."""
        return {
            "room_id": self.state.room_id,
            "players": [
                {
                    "id": p.id,
                    "name": p.name,
                    "color": p.color,
                    "token_id": p.token_id,
                    "cash": p.cash,
                    "position": p.position,
                    "properties": p.properties,
                    "in_jail": p.in_jail,
                    "jail_turns": p.jail_turns,
                    "ready": p.ready,
                }
                for p in self.state.players
            ],
            "board_state": {
                index: {
                    "index": prop.index,
                    "name": prop.name,
                    "group": prop.group,
                    "price": prop.price,
                    "rent": prop.rent,
                    "house_cost": prop.house_cost,
                    "owner_id": prop.owner_id,
                    "houses": prop.houses,
                    "is_mortgaged": prop.is_mortgaged,
                    "image_url": prop.image_url,
                }
                for index, prop in self.state.board_state.items()
            },
            "current_turn_index": self.state.current_turn_index,
            "total_turns_played": self.state.total_turns_played,
            "dice_roll": self.state.dice_roll,
            "turn_phase": self.state.turn_phase,
            "game_status": self.state.game_status,
            "logs": self.state.logs,
            "turn_end_timestamp": self.state.turn_end_timestamp,
            "consecutive_doubles": self.state.consecutive_doubles,
            "active_auction": {
                "property_index": self.state.active_auction.property_index,
                "current_bid": self.state.active_auction.current_bid,
                "highest_bidder_id": self.state.active_auction.highest_bidder_id,
                "participants": self.state.active_auction.participants,
                "end_time": self.state.active_auction.end_time,
            } if self.state.active_auction else None,
            "settings": self.state.settings,
        }
