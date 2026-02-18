# Mega-Poly - 60-Space Multiplayer Monopoly

A modern, real-time multiplayer board game featuring an expanded 60-space board with advanced gameplay mechanics.

## Live Game:

https://monopoly-b56j.onrender.com/
 
## 🎮 Features

### Core Gameplay
- ✅ **60-Space Board** - Expanded from standard 40 spaces
- ✅ **2-6 Players** - Real-time multiplayer via WebSocket
- ✅ **32 Unique Cards** - 16 Chance + 16 Community Chest
- ✅ **Special Spaces** - Subway teleportation, Bank Deposit, Taxes
- ✅ **Advanced Mechanics** - Trading, Loans, Mortgages, Bankruptcy

### Tech Stack
- **Backend**: Python 3.11+ with FastAPI & python-socketio
- **Frontend**: Next.js 16 with TypeScript & Tailwind CSS
- **Animations**: Framer Motion for smooth token movement
- **Deployment**: Docker with multi-stage build

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Development Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Monopoly
```

#### 2. Backend Setup
```bash
cd server
pip install -r requirements.txt
```

#### 3. Frontend Setup
```bash
cd client
npm install
```

#### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
# Run from project root directory
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Access the game**: http://localhost:3000

### Production Deployment (Docker)

```bash
# Build and start
docker-compose up --build

# Access at http://localhost:8000
```

## 📖 How to Play

### Game Setup
1. **Create/Join Room** - Enter a room code to create or join a game
2. **Select Token** - Choose from 6 holographic tokens
3. **Wait for Players** - 2-6 players required
4. **Start Game** - Host clicks "Start Game"

### Gameplay
1. **Roll Dice** - Click "ROLL DICE" on your turn
2. **Buy Properties** - Click "BUY" to purchase unowned properties
3. **Auction** - Click "SKIP" to start an auction
4. **Build Houses** - Own full color group to build
5. **Trade** - Negotiate with other players
6. **End Turn** - Click "END" to pass to next player

### Special Features

#### Card System
- **Chance Cards**: Movement, cash, repairs, jail
- **Community Chest**: Bank errors, fees, bonuses
- **Get Out of Jail Free**: Keep or sell to other players

#### Advanced Mechanics
- **Mortgages**: Get 50% of property value, pay 55% to unmortgage
- **Trading**: Exchange properties and cash with players
- **Bank Loans**: Borrow up to 50% of property equity (20% interest)
- **Bankruptcy**: Automatic asset liquidation when cash < 0

#### Special Spaces
- **Subway Stations (15 & 45)**: Instant teleportation
- **Bank Deposit (52)**: Collect $500
- **Taxes**: Income ($200), Luxury ($100), Wealth ($200)

## 🎯 Game Mechanics

### Rent Calculations
- **Properties**: Base rent, 2x with color set, up to 125x with hotel
- **Railroads**: $25/$50/$100/$200/$300 for 1-5 owned
- **Utilities**: 4x/10x/20x/40x dice roll for 1-4 owned

### Win Conditions
1. **Last Tycoon**: All other players bankrupt
2. **Time Limit**: Highest net worth when time expires

## 🛠️ Development

### Project Structure
```
Monopoly/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages & layouts
│   │   ├── components/    # React components
│   │   └── context/       # State management
│   └── public/            # Static assets
├── server/                # FastAPI backend
│   ├── cards.py          # Card system
│   ├── config.py         # Board configuration
│   ├── game_engine.py    # Core game logic
│   ├── main.py           # WebSocket handlers
│   └── models.py         # Pydantic models
├── Dockerfile            # Multi-stage build
└── docker-compose.yml    # Orchestration
```

### WebSocket Events

#### Client → Server
- `join_room` - Join/create game room
- `start_game` - Begin the game (host only)
- `roll_dice` - Roll dice on your turn
- `buy_property` - Purchase property
- `skip_purchase` - Start auction
- `place_bid` - Bid in auction
- `end_turn` - End your turn
- `mortgage_property` - Mortgage a property
- `unmortgage_property` - Unmortgage a property
- `trade_offer` - Propose a trade
- `respond_trade` - Accept/reject trade
- `take_loan` - Take bank loan
- `repay_loan` - Repay loan
- `declare_bankruptcy` - Declare bankruptcy

#### Server → Client
- `game_state_update` - Full game state
- `error` - Error message with code

### Adding New Features

1. **Backend**: Add method to `GameEngine` class
2. **WebSocket**: Add event handler in `main.py`
3. **Frontend**: Emit event from component
4. **UI**: Update components to reflect state changes

## 🧪 Testing

### Backend Tests
```bash
cd server
python -m pytest tests/
```

### Frontend Tests
```bash
cd client
npm run test
```

### Manual Testing Checklist
- [ ] Create and join rooms
- [ ] Roll dice and move tokens
- [ ] Buy properties and build houses
- [ ] Draw Chance/Community Chest cards
- [ ] Complete trades
- [ ] Take and repay loans
- [ ] Mortgage properties
- [ ] Declare bankruptcy
- [ ] Win the game

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows
```

**Module not found:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

**Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**WebSocket connection failed:**
- Check backend is running on port 8000
- Verify CORS settings in `main.py`
- Check browser console for errors

## 📊 Performance

- **Players**: 2-6 simultaneous
- **Latency**: <100ms for local network
- **Memory**: ~50MB per game room
- **Reconnection**: Automatic with localStorage

## 🔒 Security Notes

- No authentication required (local/LAN play)
- Room codes are random 4-character strings
- No persistent database (in-memory only)
- For production: Add authentication, rate limiting, input validation

## 📝 License

This project is for educational purposes. Monopoly is a trademark of Hasbro.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Support

For issues and questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review [WebSocket Events](#websocket-events)
- Check browser console for errors
- Verify backend logs

## 🎨 Customization

### Change Board Theme
Edit `server/config.py` to modify property names and groups.

### Adjust Game Rules
Modify `server/game_engine.py`:
- Starting cash: `Player.cash = 2500`
- Turn timer: `settings["turn_timer"] = 60`
- Loan interest: `total_due = int(amount * 1.2)`

### Update UI Theme
Edit `client/src/app/globals.css` for color schemes and glassmorphism effects.

---

**Built with ❤️ using FastAPI, Next.js, and Socket.IO**
