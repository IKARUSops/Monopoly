"""
Card System for Mega-Poly
Defines Chance and Community Chest card decks with 16 cards each.
"""

from typing import Dict, List, Any
import random

# Card effect types
CARD_TYPES = {
    "MOVE_ABS": "Move to absolute position",
    "MOVE_REL": "Move relative steps",
    "GET_CASH": "Receive cash from bank",
    "PAY_CASH": "Pay cash to bank",
    "GET_OUT_JAIL": "Get out of jail free card",
    "GO_TO_JAIL": "Go directly to jail",
    "REPAIR": "Pay for property repairs",
    "COLLECT_FROM_ALL": "Collect from all players",
    "PAY_TO_ALL": "Pay to all players"
}

CHANCE_CARDS: List[Dict[str, Any]] = [
    {"type": "MOVE_ABS", "position": 0, "text": "Advance to GO (Collect $200)"},
    {"type": "MOVE_ABS", "position": 39, "text": "Advance to Tokyo - If you pass Go, collect $200"},
    {"type": "MOVE_ABS", "position": 56, "text": "Advance to London - If you pass Go, collect $200"},
    {"type": "MOVE_ABS", "position": 5, "text": "Take a trip to Reading Railroad - If you pass Go, collect $200"},
    {"type": "MOVE_ABS", "position": 15, "text": "Advance to Subway Station A"},
    {"type": "MOVE_REL", "steps": -3, "text": "Go back 3 spaces"},
    {"type": "GET_CASH", "amount": 150, "text": "Bank pays you dividend of $150"},
    {"type": "GET_CASH", "amount": 50, "text": "Your building loan matures - Collect $50"},
    {"type": "PAY_CASH", "amount": 50, "text": "Speeding fine - Pay $50"},
    {"type": "PAY_CASH", "amount": 15, "text": "Poor tax - Pay $15"},
    {"type": "GET_OUT_JAIL", "text": "Get out of jail free - This card may be kept until needed or sold"},
    {"type": "GO_TO_JAIL", "text": "Go directly to jail - Do not pass Go, do not collect $200"},
    {"type": "REPAIR", "house_cost": 25, "hotel_cost": 100, "text": "Make general repairs on all your property - For each house pay $25, for each hotel pay $100"},
    {"type": "REPAIR", "house_cost": 40, "hotel_cost": 115, "text": "You have been elected chairman of the board - Pay each player $50"},
    {"type": "COLLECT_FROM_ALL", "amount": 50, "text": "You have been elected chairman of the board - Collect $50 from each player"},
    {"type": "PAY_TO_ALL", "amount": 50, "text": "Pay each player $50 for their consultation fees"}
]

COMMUNITY_CHEST_CARDS: List[Dict[str, Any]] = [
    {"type": "GET_CASH", "amount": 200, "text": "Bank error in your favor - Collect $200"},
    {"type": "GET_CASH", "amount": 100, "text": "Holiday fund matures - Collect $100"},
    {"type": "GET_CASH", "amount": 100, "text": "Income tax refund - Collect $100"},
    {"type": "GET_CASH", "amount": 50, "text": "From sale of stock you get $50"},
    {"type": "GET_CASH", "amount": 25, "text": "Receive $25 consultancy fee"},
    {"type": "GET_CASH", "amount": 20, "text": "You inherit $20"},
    {"type": "GET_CASH", "amount": 10, "text": "You have won second prize in a beauty contest - Collect $10"},
    {"type": "PAY_CASH", "amount": 100, "text": "Doctor's fees - Pay $100"},
    {"type": "PAY_CASH", "amount": 50, "text": "Pay hospital fees of $50"},
    {"type": "PAY_CASH", "amount": 50, "text": "Pay school fees of $50"},
    {"type": "MOVE_ABS", "position": 0, "text": "Advance to GO (Collect $200)"},
    {"type": "GO_TO_JAIL", "text": "Go directly to jail - Do not pass Go, do not collect $200"},
    {"type": "GET_OUT_JAIL", "text": "Get out of jail free - This card may be kept until needed or sold"},
    {"type": "REPAIR", "house_cost": 40, "hotel_cost": 115, "text": "You are assessed for street repairs - $40 per house, $115 per hotel"},
    {"type": "COLLECT_FROM_ALL", "amount": 10, "text": "It is your birthday - Collect $10 from each player"},
    {"type": "PAY_CASH", "amount": 150, "text": "Pay your insurance premium - $150"}
]

class CardDeck:
    """Manages a deck of cards with shuffling and drawing"""
    
    def __init__(self, cards: List[Dict[str, Any]]):
        self.cards = cards.copy()
        self.discard_pile: List[Dict[str, Any]] = []
        self.shuffle()
    
    def shuffle(self):
        """Shuffle the deck"""
        random.shuffle(self.cards)
    
    def draw(self) -> Dict[str, Any]:
        """Draw a card from the deck"""
        if not self.cards:
            # Reshuffle discard pile back into deck
            self.cards = self.discard_pile.copy()
            self.discard_pile = []
            self.shuffle()
        
        card = self.cards.pop(0)
        
        # Get Out of Jail Free cards are kept by player, not discarded
        if card["type"] != "GET_OUT_JAIL":
            self.discard_pile.append(card)
        
        return card
    
    def return_card(self, card: Dict[str, Any]):
        """Return a Get Out of Jail Free card to the deck"""
        self.discard_pile.append(card)


def create_chance_deck() -> CardDeck:
    """Create and return a shuffled Chance deck"""
    return CardDeck(CHANCE_CARDS)


def create_community_chest_deck() -> CardDeck:
    """Create and return a shuffled Community Chest deck"""
    return CardDeck(COMMUNITY_CHEST_CARDS)
