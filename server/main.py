import os
import time
import asyncio
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from server.game_engine import GameEngine

# Initialize FastAPI
app = FastAPI()

# Socket.IO setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# CORS Middleware (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory game rooms
games: dict[str, GameEngine] = {}

async def auction_monitor():
    while True:
        await asyncio.sleep(1)
        for room_id, engine in list(games.items()):
            if engine.state.turn_phase == "AUCTION" and engine.state.active_auction:
                if time.time() > engine.state.active_auction.end_time:
                    success, message = engine.resolve_auction()
                    if success:
                        await sio.emit("game_state_update", engine.get_state(), room=room_id)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(auction_monitor())

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


@sio.event
async def join_room(sid, data):
    room_id = data.get("room_id")
    player_name = data.get("player_name")
    color = data.get("color", "#FFFFFF")
    token_id = data.get("token_id", "cyber_car")
    existing_player_id = data.get("existing_player_id")
    
    if not room_id or not player_name:
        await sio.emit("error", {"code": "INVALID_JOIN", "message": "Room ID and Name required."}, to=sid)
        return

    if room_id not in games:
        games[room_id] = GameEngine(room_id)

    engine = games[room_id]
    
    # Check if reconnecting with existing player ID
    if existing_player_id:
        existing_player = next((p for p in engine.state.players if p.id == existing_player_id), None)
        if existing_player:
            # Update the player's socket ID for reconnection
            existing_player.id = sid
            existing_player.is_connected = True
            await sio.enter_room(sid, room_id)
            await sio.emit("game_state_update", engine.get_state(), room=room_id)
            return
    
    # Check if player with same name already exists
    existing_by_name = next((p for p in engine.state.players if p.name == player_name), None)
    if existing_by_name:
        await sio.emit("error", {"code": "NAME_TAKEN", "message": "A player with this name already exists in the lobby."}, to=sid)
        return
    
    # Add new player
    engine.add_player(sid, player_name, color, token_id)
    
    await sio.enter_room(sid, room_id)
    await sio.emit("game_state_update", engine.get_state(), room=room_id)

@sio.event
async def leave_lobby(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games:
        return
    
    engine = games[room_id]
    
    # Remove player from game
    engine.state.players = [p for p in engine.state.players if p.id != sid]
    
    await sio.leave_room(sid, room_id)
    await sio.emit("game_state_update", engine.get_state(), room=room_id)
    
    # Clean up empty rooms
    if len(engine.state.players) == 0:
        del games[room_id]

@sio.event
async def start_game(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.start_game()
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "START_FAILED", "message": message}, to=sid)

@sio.event
async def roll_dice(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.roll_dice(sid)
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "ROLL_FAILED", "message": message}, to=sid)

@sio.event
async def buy_property(sid, data):
    try:
        room_id = next((r for r in sio.rooms(sid) if r != sid), None)
        if not room_id or room_id not in games: return
        index = data.get("index")
        print(f"[BUY_DEBUG] Player {sid} trying to buy index {index} in room {room_id}")
        
        engine = games[room_id]
        success, message = engine.buy_property(sid, index)
        print(f"[BUY_DEBUG] Result: success={success}, message={message}")
        
        if success:
            await sio.emit("game_state_update", engine.get_state(), room=room_id)
        else:
            print(f"[BUY_DEBUG] Emitting error: code=BUY_FAILED, message={message}")
            await sio.emit("error", {"code": "BUY_FAILED", "message": message}, to=sid)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[BUY_DEBUG] EXCEPTION: {e}")
        await sio.emit("error", {"code": "SERVER_ERROR", "message": f"Server Error: {str(e)}"}, to=sid)

@sio.event
async def build_house(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    index = data.get("index")
    engine = games[room_id]
    success, message = engine.build_house(sid, index)
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "BUILD_FAILED", "message": message}, to=sid)

@sio.event
async def sell_building(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    index = data.get("index")
    engine = games[room_id]
    success, message = engine.sell_building(sid, index)
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "SELL_FAILED", "message": message}, to=sid)

@sio.event
async def skip_purchase(sid, data):
    try:
        room_id = next((r for r in sio.rooms(sid) if r != sid), None)
        if not room_id or room_id not in games: return
        engine = games[room_id]
        print(f"[AUCTION_DEBUG] {sid} skipping purchase to start auction")
        success, message = engine.skip_purchase(sid)
        if success:
            await sio.emit("game_state_update", engine.get_state(), room=room_id)
        else:
            print(f"[AUCTION_DEBUG] Skip failed: {message}")
            await sio.emit("error", {"code": "SKIP_FAILED", "message": message}, to=sid)
    except Exception as e:
        import traceback
        traceback.print_exc()
        await sio.emit("error", {"code": "SERVER_ERROR", "message": str(e)}, to=sid)

@sio.event
async def place_bid(sid, data):
    try:
        room_id = next((r for r in sio.rooms(sid) if r != sid), None)
        if not room_id or room_id not in games: return
        amount = data.get("amount")
        print(f"[AUCTION_DEBUG] {sid} placing bid: {amount}")
        engine = games[room_id]
        success, message = engine.place_bid(sid, amount)
        if success:
            await sio.emit("game_state_update", engine.get_state(), room=room_id)
        else:
            print(f"[AUCTION_DEBUG] Bid failed: {message}")
            await sio.emit("error", {"code": "BID_FAILED", "message": message}, to=sid)
    except Exception as e:
        import traceback
        traceback.print_exc()
        await sio.emit("error", {"code": "SERVER_ERROR", "message": str(e)}, to=sid)

@sio.event
async def end_turn(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.end_turn(sid)
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "END_TURN_FAILED", "message": message}, to=sid)

@sio.event
async def mortgage_property(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    index = data.get("index")
    engine = games[room_id]
    success, message = engine.mortgage_property(sid, index)
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "MORTGAGE_FAILED", "message": message}, to=sid)

@sio.event
async def unmortgage_property(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    index = data.get("index")
    engine = games[room_id]
    success, message = engine.unmortgage_property(sid, index)
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "UNMORTGAGE_FAILED", "message": message}, to=sid)

@sio.event
async def trade_offer(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.create_trade_offer(
        sid,
        data.get("target_player_id"),
        data.get("offer_cash", 0),
        data.get("offer_properties", []),
        data.get("request_cash", 0),
        data.get("request_properties", [])
    )
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "TRADE_FAILED", "message": message}, to=sid)

@sio.event
async def respond_trade(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.respond_to_trade(sid, data.get("accept", False))
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "TRADE_RESPONSE_FAILED", "message": message}, to=sid)

@sio.event
async def take_loan(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.take_bank_loan(sid, data.get("amount", 0))
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "LOAN_FAILED", "message": message}, to=sid)

@sio.event
async def repay_loan(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.repay_loan(sid, data.get("loan_id"))
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "REPAY_FAILED", "message": message}, to=sid)

@sio.event
async def declare_bankruptcy(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.declare_bankruptcy(sid, data.get("creditor_id", "BANK"))
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "BANKRUPTCY_FAILED", "message": message}, to=sid)

@sio.event
async def toggle_ready(sid, data):
    print(f"toggle_ready called by {sid}")
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games:
        print(f"No room found for {sid}")
        return
    engine = games[room_id]
    
    # Find player and toggle ready status
    player = next((p for p in engine.state.players if p.id == sid), None)
    if player:
        player.ready = not player.ready
        print(f"Player {player.name} ready status: {player.ready}")
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        print(f"Player not found for sid {sid}")

@sio.event
async def send_chat(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    
    message = data.get("message", "").strip()
    if not message:
        return
    
    # Add chat message
    from server.models import ChatMessage
    chat_msg = ChatMessage(
        sender_id=sid,
        text=message,
        timestamp=time.time(),
        is_system=False
    )
    engine.state.chat_messages.append(chat_msg)
    await sio.emit("game_state_update", engine.get_state(), room=room_id)


@sio.event
async def restart_game(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    success, message = engine.restart_game()
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "RESTART_FAILED", "message": message}, to=sid)

@sio.event
async def create_trade_offer(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    
    target_id = data.get("target_id")
    offer_cash = data.get("offer_cash", 0)
    offer_props = data.get("offer_props", [])
    request_cash = data.get("request_cash", 0)
    request_props = data.get("request_props", [])
    
    success, message = engine.create_trade_offer(sid, target_id, offer_cash, offer_props, request_cash, request_props)
    
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
        # Notify target? Game state update handles it if UI reacts to active_trade
        target_sid = target_id # Verify if we need to emit specifically? No, broadcast state is fine.
    else:
        await sio.emit("error", {"code": "TRADE_FAILED", "message": message}, to=sid)

@sio.event
async def respond_to_trade(sid, data):
    room_id = next((r for r in sio.rooms(sid) if r != sid), None)
    if not room_id or room_id not in games: return
    engine = games[room_id]
    
    accept = data.get("accept", False)
    success, message = engine.respond_to_trade(sid, accept)
    
    if success:
        await sio.emit("game_state_update", engine.get_state(), room=room_id)
    else:
        await sio.emit("error", {"code": "TRADE_RESPONSE_FAILED", "message": message}, to=sid)


@app.get("/health")
async def health():
    return {"status": "ok"}

if os.path.exists("./client/out"):
    app.mount("/", StaticFiles(directory="./client/out", html=True), name="static")
elif os.path.exists("../client/out"): # Fallback for Docker pathing
    app.mount("/", StaticFiles(directory="../client/out", html=True), name="static")
elif os.path.exists("client/out"): # Fallback for Docker pathing
    app.mount("/", StaticFiles(directory="client/out", html=True), name="static")
app = socket_app
