# **Project Specification: Mega-Poly (60-Space Edition)**

## **1\. Executive Summary**

"Mega-Poly" is a web-based, real-time multiplayer board game designed for 2–6 players. It features an expanded 60-space board (vs. standard 40), allowing for a longer, more strategic game suitable for larger groups. The application uses a Python backend for game logic and a Next.js frontend for the user interface.

## **2\. Tech Stack & Architecture**

### **2.1 Backend (Game Logic & State)**

* **Language:** Python 3.10+  
* **Framework:** FastAPI  
* **Real-time:** python-socketio (AsyncServer)  
* **Data Validation:** Pydantic Models (Strict typing is required to prevent hallucinations).  
* **Persistence:** In-memory GameState dictionary keyed by room\_id. (Optional: Redis for production).

### **2.2 Frontend (UI & Interaction)**

* **Framework:** Next.js 14+ (App Router)  
* **Language:** TypeScript (Strict mode)  
* **Styling:** Tailwind CSS \+ clsx / tailwind-merge  
* **Animations:** framer-motion (Critical for smooth token movement and UI transitions).  
* **Icons:** lucide-react  
* **State:** React Context \+ useReducer.  
* **Graphics:** CSS Grid for board layout (no Canvas API required for 2D MVP).

### **2.3 Network Protocol**

* **Connection:** WebSocket.  
* **Pattern:** Event-Driven. Client emits actions (roll\_dice, buy\_property); Server processes and emits game\_state\_update.

### **2.4 Infrastructure & DevOps**

* **Containerization:** Docker (Multi-stage build).  
* **Deployment Target:** Render, Railway, or Fly.io (Free Tier compatible).  
* **Strategy:** Single-container deployment (FastAPI serves the Next.js static build) to minimize cost.

## **3\. The 60-Space Board Layout (Source of Truth)**

The board consists of 60 unique indices (0 to 59).

* **Geometry:** Square board.  
* **Side Length:** 16 tiles per side (Corners overlap).  
  * Bottom: 0–15  
  * Left: 15–30  
  * Top: 30–45  
  * Right: 45–0

### **3.1 Map & Property Groups (World Tour Theme)**

**Group 1: The Mountains (Gray)**

* **Indices:** 2, 4  
* **Theme:** High Altitude

**Group 2: African Hubs (Brown)**

* **Indices:** 6, 8, 9  
* **Theme:** Emerging Markets

**Group 3: South America (Light Blue)**

* **Indices:** 11, 13, 14  
* **Theme:** Latin Rhythm

**Group 4: Oceania (Pink)**

* **Indices:** 16, 18, 19  
* **Theme:** Island Life

**Group 5: Eastern Europe (Teal)**

* **Indices:** 22, 24, 25  
* **Theme:** Historic Centers

**Group 6: The Middle East (Orange)**

* **Indices:** 26, 27, 29  
* **Theme:** Desert Luxury

**Group 7: Southeast Asia (Red)**

* **Indices:** 31, 33, 34  
* **Theme:** Tropical Metros

**Group 8: East Asia (Yellow)**

* **Indices:** 36, 37, 39  
* **Theme:** Tech Giants

**Group 9: Western Europe (Green)**

* **Indices:** 40, 41, 42  
* **Theme:** Cultural Capitals

**Group 10: Nordic Region (Indigo)**

* **Indices:** 46, 48  
* **Theme:** Northern Lights

**Group 11: North American Metros (Violet)**

* **Indices:** 51, 53, 54  
* **Theme:** Urban Sprawl

**Group 12: Global Capitals (Dark Blue)**

* **Indices:** 56, 57  
* **Theme:** Financial Powerhouses

### **3.2 Full Index Map (0-59)**

* **0:** GO (Collect $200)  
* **1:** Community Chest  
* **2:** Kathmandu  
* **3:** Income Tax  
* **4:** La Paz  
* **5:** Reading RR (Railroad A)  
* **6:** Lagos  
* **7:** Chance  
* **8:** Cairo  
* **9:** Johannesburg  
* **10:** Jail (Visiting)  
* **11:** Bogota  
* **12:** Electric Co. (Utility A)  
* **13:** Lima  
* **14:** Sao Paulo  
* **15:** **Subway Station A (Teleport)**  
* **16:** Wellington  
* **17:** Community Chest  
* **18:** Canberra  
* **19:** Sydney  
* **20:** Pennsylvania RR (Railroad B)  
* **21:** Chance  
* **22:** Sofia  
* **23:** Water Works (Utility B)  
* **24:** Budapest  
* **25:** Prague  
* **26:** Riyadh  
* **27:** Tel Aviv  
* **28:** Internet Service Provider (Utility C)  
* **29:** Dubai  
* **30:** Free Parking  
* **31:** Hanoi  
* **32:** Chance  
* **33:** Bangkok  
* **34:** Singapore  
* **35:** B. & O. RR (Railroad C)  
* **36:** Seoul  
* **37:** Beijing  
* **38:** Solar Farm (Utility D)  
* **39:** Tokyo  
* **40:** Berlin  
* **41:** Madrid  
* **42:** Paris  
* **43:** Community Chest  
* **44:** Short Line RR (Railroad D)  
* **45:** **Subway Station B (Teleport)**  
* **46:** Oslo  
* **47:** Luxury Tax (EU VAT)  
* **48:** Stockholm  
* **49:** Chance  
* **50:** Metro RR (Railroad E \- Bullet Train)  
* **51:** Toronto  
* **52:** Bank Deposit (Free Money Space)  
* **53:** Chicago  
* **54:** San Francisco  
* **55:** Go To Jail  
* **56:** London  
* **57:** New York  
* **58:** Wealth Tax  
* **59:** Community Chest

### **3.3 Property Economics (Configuration Source of Truth)**

To prevent hallucinations, use these EXACT base values.  
Rent calculation logic: Base Rent \-\> 1 House (5x) \-\> 2 Houses (15x) \-\> 3 Houses (45x) \-\> 4 Houses (80x) \-\> Hotel (125x).

| Group | Color | Purchase Price | House Cost | Base Rent |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Gray | $60 | $50 | $2 |
| 2 | Brown | $100 | $50 | $6 |
| 3 | Lt. Blue | $120 | $50 | $8 |
| 4 | Pink | $140 | $100 | $10 |
| 5 | Teal | $160 | $100 | $12 |
| 6 | Orange | $180 | $100 | $14 |
| 7 | Red | $220 | $150 | $18 |
| 8 | Yellow | $260 | $150 | $22 |
| 9 | Green | $300 | $200 | $26 |
| 10 | Indigo | $350 | $200 | $35 |
| 11 | Violet | $400 | $200 | $50 |
| 12 | Dk. Blue | $500 | $200 | $75 |
| \-- | RR | $200 | N/A | $25 |
| \-- | Utility | $150 | N/A | 4x Dice |

## **4\. Data Structures**

### **4.1 Player Object**

class Player(BaseModel):  
    id: str  
    name: str  
    color: str  \# Hex code  
    token\_id: str \# e.g., "cyber\_car"  
    position: int \= 0  \# 0-59  
    cash: int \= 2500  
    properties: List\[int\] \= \[\]  
    loans: List\[Loan\] \= \[\] \# Track active debts  
    in\_jail: bool \= False  
    jail\_turns: int \= 0  
    is\_connected: bool \= True  
    missed\_turns: int \= 0 \# For AFK kicking

### **4.2 Property Object**

class PropertyCard(BaseModel):  
    index: int  
    name: str \# e.g. "Tokyo"  
    group: str \# e.g. "Yellow"  
    price: int  
    rent: List\[int\] \# \[Base, 1H, 2H, 3H, 4H, Hotel\]  
    house\_cost: int  
    owner\_id: Optional\[str\] \= None  
    houses: int \= 0 \# 5 \= Hotel  
    is\_mortgaged: bool \= False  
    image\_url: str \# Path to city image

### **4.3 Loan Object**

class Loan(BaseModel):  
    id: str  
    lender\_id: str \# "BANK" or player\_id  
    borrower\_id: str  
    principal: int \# Original amount borrowed  
    total\_due: int \# Principal \+ Interest  
    due\_turn: Optional\[int\] \# Specific turn number or None (for Bank)  
    status: str \# "ACTIVE", "PAID", "DEFAULTED"

### **4.4 Game State**

class GameState(BaseModel):  
    room\_id: str  
    players: List\[Player\]  
    board\_state: Dict\[int, PropertyCard\]  
    current\_turn\_index: int  
    total\_turns\_played: int \# Global turn counter  
    dice\_roll: List\[int\] \# Two 6-sided dice  
    consecutive\_doubles: int \= 0 \# Track doubles for speeding rule  
    turn\_phase: str \# "ROLL", "ACTION", "AUCTION", "END"  
    turn\_end\_timestamp: Optional\[float\] \= None \# For frontend timer sync  
    active\_auction: Optional\[AuctionState\] \= None  
    game\_status: str \# "LOBBY", "PLAYING", "ENDED"  
    settings: Dict\[str, Any\] \# e.g., { "max\_time": 120, "turn\_timer": 60 }  
    logs: List\[str\]  
    chat\_messages: List\[ChatMessage\] \# Player-to-player chat  
    active\_trade: Optional\[TradeOffer\] \= None \# Current trade being negotiated

### **4.5 Auction State Object**

class AuctionState(BaseModel):  
    property\_index: int  
    current\_bid: int  
    highest\_bidder\_id: Optional\[str\]  
    participants: List\[str\] \# List of player IDs still in the auction  
    end\_time: float \# Timestamp for auction timeout

### **4.6 Chat & Trade Objects (New)**

class ChatMessage(BaseModel):  
    sender\_id: str  
    text: str  
    timestamp: float  
    is\_system: bool \= False

class TradeOffer(BaseModel):  
    id: str  
    proposer\_id: str  
    target\_player\_id: str  
    offer\_cash: int  
    offer\_properties: List\[int\] \# Indices  
    request\_cash: int  
    request\_properties: List\[int\] \# Indices  
    status: str \# "PENDING", "ACCEPTED", "REJECTED"

## **5\. API & Events**

* **POST /create\_game**  
* **WebSocket Events:**  
  * join\_room: { room\_id, player\_name, token\_id, existing\_player\_id? } (See Section 8.1)  
  * start\_game: {} (Host only)  
  * roll\_dice: {}  
  * end\_turn: {}  
  * buy\_property: { index: int }  
  * place\_bid: { amount: int }  
  * fold\_auction: {}  
  * trade\_offer: TradeOffer (JSON)  
  * respond\_trade: { trade\_id: str, accept: bool }  
  * take\_loan: { lender\_id: "BANK" | "player\_id", amount: int, interest\_rate: float }  
  * repay\_loan: { loan\_id: str }  
  * send\_chat: { message: str }  
* **Server Responses (New):**  
  * error: { code: str, message: str } (Displayed as Toast on frontend)  
  * game\_state\_update: Full state payload.

## **6\. Frontend UI/UX Specifications (Modern & Smooth)**

### **6.1 Design Language: "Dark Glassmorphism"**

* **Background:** Deep charcoal/navy gradient (bg-slate-900 to bg-slate-950).  
* **Panels:** Translucent white/black with blur (backdrop-blur-md, bg-white/10, border-white/20).  
* **Typography:** Sans-serif (Inter or Geist Sans), clean and readable.  
* **Accents:** Neon glows for active player turns and property highlights.

### **6.2 The Board Visuals**

* **Property Cards:**  
  * MUST display a high-quality **photograph** of the city.  
  * Gradient overlay at the bottom for text readability.  
  * Owner indicator: A glowing border or "Sold" sash.  
* **Center Area:** A stylized, low-poly or wireframe map of the world.

### **6.3 Animation & Interaction (framer-motion)**

* **Token Movement:** Tokens must **slide** smoothly from tile A to tile B (linear interpolation).  
* **Dice:** 3D rolling animation.  
* **Hover Effects:** Scale up (scale-110) and z-index bump.  
* **Modals:** Smooth fade-in/slide-up.

### **6.4 Assets**

* **City Images:** Use high-quality, royalty-free images (Unsplash/Pexels) stored in /public/assets/cities/{city\_name}.jpg.  
* **Tokens:** See Section 6.6 for detailed token specifications.

### **6.5 Audio Experience (SFX & BGM)**

* **Source:** All audio assets must be CC0 (Public Domain) or MIT licensed. Recommended source: freesound.org.  
* **Sound Cues:** roll\_dice.mp3, token\_slide.mp3, cash\_register.mp3, payment.mp3, buy\_property.mp3, jail\_slam.mp3, fanfare.mp3, bankruptcy.mp3, notification.mp3.  
* **Background Music (BGM):** Toggleable low-fidelity hip-hop or ambient "Cityscape" noise.

### **6.6 Player Token Design**

Tokens are the primary representation of the player on the board. They must adhere to a specific visual identity to match the "Dark Glassmorphism" theme.

* **Visual Style:** "Holographic Chess Pieces".  
  * **Material:** Matte metallic silver base (\#E2E8F0) with a "frosted glass" upper body (opacity-80).  
  * **Emission:** Strong neon rim lighting matching the Player.color property.  
  * **Shadow:** Dynamic drop shadow that moves with the token to simulate floating height.  
* **Available Models (SVG/GLB):**  
  1. **The Cyber-Car:** A low-poly, Tron-inspired light cycle.  
  2. **The Jet Stream:** A sleek, delta-wing supersonic aircraft.  
  3. **The Mecha-Rex:** A geometric, robotic T-Rex silhouette.  
  4. **The UFO:** A classic flying saucer with a rotating neon ring.  
  5. **The Catamaran:** A futuristic, dual-hull high-speed boat.  
  6. **The Rocket:** A vertical-landing starship (SpaceX style).  
* **Behavioral Animation:**  
  * **Idle:** Slow, vertical sine-wave bobbing (floating effect).  
  * **Moving:** Tilts forward 15 degrees into the direction of travel.  
  * **Jail:** Token turns grayscale and lowers slightly (loses "floating" status).

## **7\. Detailed Game Mechanics & Logic**

### **7.1 The Turn Lifecycle (State Machine)**

The backend GameEngine will enforce a strict state machine for the current player:

1. **IDLE:** Waiting for the previous player to finish.  
2. **ROLL\_PHASE:** Current player must emit roll\_dice.  
3. **ANIMATION\_WAIT:** Server pauses state updates briefly while frontend animates.  
4. **ACTION\_PHASE:** Player landed on a space.  
   * *Unowned Property:* Actions \= \[BUY, AUCTION\].  
   * *Owned Property:* Auto-deduct rent. If bankrupt, trigger BANKRUPTCY.  
   * *Chance/Community:* Draw card, apply effect immediately.  
   * *Tax/Fee:* Auto-deduct.  
5. **AUCTION\_PHASE:** If a property is declined, entering global bidding.  
6. **END\_PHASE:** Player can build houses, mortgage, trade, or emit end\_turn.  
   * If doubles were rolled, return to ROLL\_PHASE.  
   * **Restriction:** Cannot end\_turn if cash \< 0\. Must sell/mortgage/trade to solve debt or declare bankruptcy.  
   * **Exception (Speeding):** If doubles are rolled **3 consecutive times** in one turn, the player is immediately moved to Jail, and their turn ends.

### **7.2 Movement & Position**

* **Dice:** Two standard 6-sided dice (2d6).  
* **Standard Move:** new\_pos \= (old\_pos \+ die1 \+ die2) % 60\.  
* **Passing Go:** If old\_pos \> new\_pos (wrapping around 59-\>0), add $200.  
* **Direct Teleport:** Do *not* pass Go, do *not* collect $200.  
* **Speeding Rule:** 3x doubles \= Immediate Jail, Turn Over.  
* **Jail Logic:**  
  * Rent Collection: **FORBIDDEN** (Hardcore rule).  
  * Escape: Pay $50 or roll doubles. If doubles, move immediately and end turn (no bonus roll).

### **7.3 Rent & Economy Rules**

* **Standard Rent:** See Table in Section 3.3.  
* **Color Set Bonus:** Double base rent if group owned & 0 houses.  
* **Railroads:** $25 / $50 / $100 / $200 / $300 (for 5).  
* **Utilities:** 4x / 10x / 20x / 40x (for 4).

### **7.4 Special Spaces**

* **Subway (15 & 45):** Teleport 15 \<-\> 45\.  
* **Bank Deposit (52):** Collect $500 flat.  
* **Taxes:** Income ($200), Luxury ($100), Wealth ($200).

### **7.5 Housing & Mortgages**

* **Building:** Must own full color group. Even building rule applies.  
* **Mortgaging:** Get 50% price. No rent collection.  
* **Unmortgaging:** Pay Mortgage Value \+ 10% Interest.

### **7.6 Bankruptcy**

* **Trigger:** cash \< 0 and no assets left to liquidate.  
* **Resolution:** Assets transfer to creditor (Player or Bank). If Bank, assets are reset to unowned.

### **7.7 Credit & Loan System**

* **Bank Loans:** Max 50% Equity. 20% flat interest fee. First priority in bankruptcy.  
* **Player Loans:** Custom terms via Trade. Enforced by forced bankruptcy on default.

### **7.8 Auction Protocol**

* **Trigger:** Player declines purchase or times out on "Buy" decision.  
* **Start:** $10 bid.  
* **Timer:** 10s reset on new bid.  
* **End:** Highest bidder pays immediately.

### **7.9 Trading Constraints**

1. **Building Rule:** No trades if houses exist on that color group.  
2. **Mortgaged Property:** Tradeable (new owner pays 10% interest fee immediately).  
3. **Loan Trading:** Forbidden.

### **7.10 Card System**

* **Deck:** 16 Chance / 16 Community Chest.  
* **Effects:** MOVE\_REL, MOVE\_ABS, GET\_CASH, PAY\_CASH, GET\_OUT\_JAIL, REPAIR.

### **7.11 Win Conditions & Game Over**

1. **Last Tycoon:** All others bankrupt.  
2. **Time Limit:** Max Net Worth wins after time expires.

### **7.12 AFK & Disconnection Handling**

1. **Turn Timer:** 60s hard limit. Auto-pass if 0\.  
2. **Auto-Kick:** 3 consecutive timeouts \= Disconnected status.  
3. **Auction Timeout:** 15s hard limit per bid.

## **8\. Resilience & UX Protocols (The Smoothness Factor)**

This section ensures the game feels professional and handles real-world internet issues.

### **8.1 Reconnection Protocol**

* **Storage:** The Frontend MUST store room\_id and player\_id in localStorage.  
* **On Load:** Check for existing credentials. If found, emit join\_room with existing\_player\_id.  
* **Server Logic:** If an existing ID connects, update their socket SID but keep their GameState object (Cash, properties) intact. Do NOT create a duplicate player.

### **8.2 Timer Synchronization**

* **Timestamping:** The server tracks turn\_end\_timestamp (Unix time).  
* **Sync:** This timestamp is sent in every game\_state\_update.  
* **Visuals:** The frontend calculates remaining \= turn\_end\_timestamp \- Date.now() to render the progress bar. This prevents timer drift between client and server.

### **8.3 Error Feedback Loop**

* **Scenario:** User attempts to build a house with insufficient funds.  
* **Server Action:** Do NOT mutate state. Emit error event: { code: "INSUFFICIENT\_FUNDS", message: "You need $150 to build here." }.  
* **Client Action:** Display a red "Toast" notification (top-right or center).

### **8.4 Lobby User Experience**

* **Room Codes:** Generate short, 4-character alphabetic codes (e.g., "ABCD") for easy sharing, rather than long UUIDs.  
* **Ready Check:** Players must click "Ready" in the lobby. The game cannot start until all players are Ready.  
* **Token Selection:** The lobby must visually disable tokens already selected by other players to prevent duplicates.

### **8.5 Announcement System (Central Broadcasts)**

* **Purpose:** Inform all players of critical game events via the logs array and ephemeral toasts.  
* **Event Types:**  
  * GAME\_START: "The game has begun\!"  
  * TURN\_CHANGE: "It is now \[Player Name\]'s turn."  
  * MOVEMENT: "\[Player\] rolled \[X\] and moved to \[Space\]."  
  * PURCHASE: "\[Player\] bought \[Property\] for $\[Amount\]."  
  * RENT: "\[Player\] paid $\[Amount\] rent to \[Owner\]."  
  * JAIL\_ENTER: "\[Player\] has been sent to Jail\!"  
  * JAIL\_EXIT: "\[Player\] has been released from Jail."  
  * AUCTION\_START: "Auction started for \[Property\]\!"  
  * AUCTION\_WIN: "\[Player\] won \[Property\] for $\[Amount\]."  
  * TRADE: "\[Player A\] traded with \[Player B\]."  
  * BANKRUPTCY: "\[Player\] has declared bankruptcy\!"

### **8.6 Error Code Registry (Strict Enums)**

To ensure frontend handles errors gracefully, use these specific codes:

* ERR\_NOT\_YOUR\_TURN: "It is not your turn."  
* ERR\_INSUFFICIENT\_FUNDS: "You do not have enough cash."  
* ERR\_ALREADY\_OWNED: "This property is already owned."  
* ERR\_INVALID\_MOVE: "You cannot move there."  
* ERR\_IN\_JAIL: "You cannot do this while in Jail."  
* ERR\_MUST\_ROLL: "You must roll the dice first."  
* ERR\_AUCTION\_ACTIVE: "Cannot perform action during an auction."  
* ERR\_TRADE\_LOCKED: "Trade is invalid or locked."  
* ERR\_BUILDING\_UNEVEN: "You must build evenly."  
* ERR\_MAX\_HOUSES: "You cannot build more houses here."

### **8.7 Frontend Error Boundaries (React)**

* **Component Level:** Wrap the GameBoard and TradeInterface in Error Boundaries.  
* **Fallback UI:** If the renderer crashes, show a "Reload Board" button that attempts to re-sync with latest\_game\_state from the server without refreshing the full page.

## **9\. Deployment & Docker Strategy (Free Tier Optimized)**

### **9.1 File Structure**

/  
├── client/          (Next.js)  
├── server/          (FastAPI)  
├── Dockerfile       (Unified)  
└── requirements.txt

### **9.2 Unified Dockerfile**

\# \--- Stage 1: Build Frontend \---  
FROM node:18-alpine AS frontend-builder  
WORKDIR /app/client  
COPY client/package\*.json ./  
RUN npm install  
COPY client/ .  
RUN npm run build 

\# \--- Stage 2: Setup Backend \---  
FROM python:3.11-slim  
WORKDIR /app  
COPY server/requirements.txt .  
RUN pip install \--no-cache-dir \-r requirements.txt  
COPY server/ ./server  
COPY \--from=frontend-builder /app/client/out ./client/out  
ENV PORT=8000  
EXPOSE 8000  
CMD \["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"\]

### **9.3 Backend Changes for Static Serving**

In server/main.py, mount the static files:

from fastapi.staticfiles import StaticFiles  
app.mount("/", StaticFiles(directory="../client/out", html=True), name="static")  
