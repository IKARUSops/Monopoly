from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Loan(BaseModel):
    id: str
    lender_id: str  # "BANK" or player_id
    borrower_id: str
    principal: int
    total_due: int
    due_turn: Optional[int] = None
    status: str  # "ACTIVE", "PAID", "DEFAULTED"

class Player(BaseModel):
    id: str
    name: str
    color: str  # Hex code
    token_id: str # e.g., "cyber_car"
    position: int = 0
    cash: int = 2500
    properties: List[int] = []
    loans: List[Loan] = []
    in_jail: bool = False
    jail_turns: int = 0
    is_connected: bool = True
    missed_turns: int = 0
    get_out_of_jail_cards: int = 0
    ready: bool = False

class PropertyCard(BaseModel):
    index: int
    name: str
    group: str
    price: int
    rent: List[int] # [Base, 1H, 2H, 3H, 4H, Hotel]
    house_cost: int
    owner_id: Optional[str] = None
    houses: int = 0 # 5 = Hotel
    is_mortgaged: bool = False
    image_url: str

class AuctionState(BaseModel):
    property_index: int
    current_bid: int
    highest_bidder_id: Optional[str] = None
    participants: List[str]
    end_time: float

class ChatMessage(BaseModel):
    sender_id: str
    text: str
    timestamp: float
    is_system: bool = False

class TradeOffer(BaseModel):
    id: str
    proposer_id: str
    target_player_id: str
    offer_cash: int
    offer_properties: List[int]
    request_cash: int
    request_properties: List[int]
    status: str # "PENDING", "ACCEPTED", "REJECTED"

class GameState(BaseModel):
    room_id: str
    players: List[Player] = []
    board_state: Dict[int, PropertyCard] = {}
    current_turn_index: int = 0
    total_turns_played: int = 0
    dice_roll: List[int] = [1, 1]
    consecutive_doubles: int = 0
    turn_phase: str = "LOBBY" # "ROLL", "ACTION", "AUCTION", "END", "LOBBY"
    turn_end_timestamp: Optional[float] = None
    active_auction: Optional[AuctionState] = None
    game_status: str = "LOBBY" # "LOBBY", "PLAYING", "ENDED"
    settings: Dict[str, Any] = { "max_time": 3600, "turn_timer": 60 }
    logs: List[str] = []
    chat_messages: List[ChatMessage] = []
    active_trade: Optional[TradeOffer] = None
