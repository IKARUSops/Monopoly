"use client";

import React, { useState } from "react";
import { useGameState } from "@/context/GameStateContext";
import PropertyCard from "./PropertyCard";
import PlayerToken from "./PlayerToken";
import Controls from "./Controls";
import PropertyModal from "./PropertyModal";

// --- CONFIGURATION ---
// Copied from Board.tsx to keep self-contained for now
const BOARD_CONFIG: Record<number, { name: string; type: string; group?: string; price?: number }> = {
    0: { name: "GO", type: "GO" },
    1: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
    2: { name: "Kathmandu", type: "PROPERTY", group: "Gray", price: 60 },
    3: { name: "Incm Tax", type: "TAX" },
    4: { name: "La Paz", type: "PROPERTY", group: "Gray", price: 60 },
    5: { name: "Reading RR", type: "RAILROAD", price: 200 },
    6: { name: "Lagos", type: "PROPERTY", group: "Brown", price: 100 },
    7: { name: "Chance", type: "CHANCE" },
    8: { name: "Cairo", type: "PROPERTY", group: "Brown", price: 100 },
    9: { name: "Johburg", type: "PROPERTY", group: "Brown", price: 100 },
    10: { name: "Jail", type: "JAIL" },
    11: { name: "Bogota", type: "PROPERTY", group: "Lt. Blue", price: 120 },
    12: { name: "Elec Co.", type: "UTILITY", price: 150 },
    13: { name: "Lima", type: "PROPERTY", group: "Lt. Blue", price: 120 },
    14: { name: "Sao Paulo", type: "PROPERTY", group: "Lt. Blue", price: 120 },
    15: { name: "Subway A", type: "SUBWAY" },
    16: { name: "Wellingtn", type: "PROPERTY", group: "Pink", price: 140 },
    17: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
    18: { name: "Canberra", type: "PROPERTY", group: "Pink", price: 140 },
    19: { name: "Sydney", type: "PROPERTY", group: "Pink", price: 140 },
    20: { name: "Penn RR", type: "RAILROAD", price: 200 },
    21: { name: "Chance", type: "CHANCE" },
    22: { name: "Sofia", type: "PROPERTY", group: "Teal", price: 160 },
    23: { name: "Water Wks", type: "UTILITY", price: 150 },
    24: { name: "Budapest", type: "PROPERTY", group: "Teal", price: 160 },
    25: { name: "Prague", type: "PROPERTY", group: "Teal", price: 160 },
    26: { name: "Riyadh", type: "PROPERTY", group: "Orange", price: 180 },
    27: { name: "Tel Aviv", type: "PROPERTY", group: "Orange", price: 180 },
    28: { name: "ISP", type: "UTILITY", price: 150 },
    29: { name: "Dubai", type: "PROPERTY", group: "Orange", price: 180 },
    30: { name: "Parking", type: "FREE_PARKING" },
    31: { name: "Hanoi", type: "PROPERTY", group: "Red", price: 220 },
    32: { name: "Chance", type: "CHANCE" },
    33: { name: "Bangkok", type: "PROPERTY", group: "Red", price: 220 },
    34: { name: "Singpore", type: "PROPERTY", group: "Red", price: 220 },
    35: { name: "B. & O.", type: "RAILROAD", price: 200 },
    36: { name: "Seoul", type: "PROPERTY", group: "Yellow", price: 260 },
    37: { name: "Beijing", type: "PROPERTY", group: "Yellow", price: 260 },
    38: { name: "Solar Farm", type: "UTILITY", price: 150 },
    39: { name: "Tokyo", type: "PROPERTY", group: "Yellow", price: 260 },
    40: { name: "Berlin", type: "PROPERTY", group: "Green", price: 300 },
    41: { name: "Madrid", type: "PROPERTY", group: "Green", price: 300 },
    42: { name: "Paris", type: "PROPERTY", group: "Green", price: 300 },
    43: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
    44: { name: "Short Line", type: "RAILROAD", price: 200 },
    45: { name: "Subway B", type: "SUBWAY" },
    46: { name: "Oslo", type: "PROPERTY", group: "Indigo", price: 350 },
    47: { name: "Lux Tax", type: "TAX" },
    48: { name: "Stockhlm", type: "PROPERTY", group: "Indigo", price: 350 },
    49: { name: "Chance", type: "CHANCE" },
    50: { name: "Metro RR", type: "RAILROAD", price: 200 },
    51: { name: "Toronto", type: "PROPERTY", group: "Violet", price: 400 },
    52: { name: "Deposit", type: "BANK_DEPOSIT" },
    53: { name: "Chicago", type: "PROPERTY", group: "Violet", price: 400 },
    54: { name: "San Fran", type: "PROPERTY", group: "Violet", price: 400 },
    55: { name: "Go To Jail", type: "GO_TO_JAIL" },
    56: { name: "London", type: "PROPERTY", group: "Dk. Blue", price: 500 },
    57: { name: "New York", type: "PROPERTY", group: "Dk. Blue", price: 500 },
    58: { name: "Wealth Tax", type: "TAX" },
    59: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
};

const ASSET_MAP: Record<string, string> = {
    "GO": "go.png",
    "Comm Chest": "community_chest.png",
    "Incm Tax": "income_tax.png",
    "Reading RR": "reading_rr.png",
    "Chance": "chance.png",
    "Jail": "jail.png",
    "Elec Co.": "electric_co.png",
    "Subway A": "subway_station_a.png",
    "Subway B": "subway_station_b.png",
    "Penn RR": "pennsylvania_rr.png",
    "Water Wks": "water_works.png",
    "ISP": "isp.png",
    "Parking": "free_parking.png",
    "B. & O.": "bo_rr.png",
    "Solar Farm": "solar_farm.png",
    "Short Line": "short_line_rr.png",
    "Lux Tax": "luxury_tax.png",
    "Metro RR": "metro_rr.png",
    "Deposit": "bank_deposit.png",
    "Go To Jail": "go_to_jail.png",
    "Wealth Tax": "wealth_tax.png",
    // Fix typo/shortened names
    "Johburg": "johannesburg.png",
    "Wellingtn": "wellington.png",
    "San Fran": "san_francisco.png",
    "Stockhlm": "stockholm.png",
    "Singpore": "singapore.png",
    "La Paz": "la_paz.png",
};

const getAssetPath = (name: string) => {
    if (ASSET_MAP[name]) return `/assets/cities/${ASSET_MAP[name]}`;
    const formatted = name.toLowerCase().replace(/[\s.]+/g, "_");
    return `/assets/cities/${formatted}.png`;
};

// --- GRID HELPERS (18x18) ---
// Corners are 2x2. Properties are 1x2 (vertical relative to side).
// Side length = 18 units.
// Corner 0:     Rows 17-18, Cols 17-18 (Bottom Right)
// Bottom Row:   Rows 17-18, Cols 16..3 (14 items)
// Corner 15:    Rows 17-18, Cols 1-2 (Bottom Left)
// Left Col:     Rows 16..3, Cols 1-2
// Corner 30:    Rows 1-2,   Cols 1-2 (Top Left)
// Top Row:      Rows 1-2,   Cols 3..16
// Corner 45:    Rows 1-2,   Cols 17-18 (Top Right)
// Right Col:    Rows 3..16, Cols 17-18

const getGridArea = (index: number) => {
    // 0: GO (Bottom Right Corner)
    if (index === 0) return { gridRow: "17 / span 2", gridColumn: "17 / span 2" };

    // 1-14: Bottom Row (Right to Left)
    // 1 is at 16. 14 is at 3.
    if (index >= 1 && index <= 14) return { gridRow: "17 / span 2", gridColumn: `${17 - index} / span 1` };

    // 15: Subway A (Bottom Left Corner)
    if (index === 15) return { gridRow: "17 / span 2", gridColumn: "1 / span 2" };

    // 16-29: Left Column (Bottom to Top)
    // 16 is at 16. 29 is at 3.
    if (index >= 16 && index <= 29) return { gridRow: `${17 - (index - 15)} / span 1`, gridColumn: "1 / span 2" };

    // 30: Parking (Top Left Corner)
    if (index === 30) return { gridRow: "1 / span 2", gridColumn: "1 / span 2" };

    // 31-44: Top Row (Left to Right)
    // 31 is at 3. 44 is at 16.
    if (index >= 31 && index <= 44) return { gridRow: "1 / span 2", gridColumn: `${index - 30 + 2} / span 1` };

    // 45: Subway B (Top Right Corner)
    if (index === 45) return { gridRow: "1 / span 2", gridColumn: "17 / span 2" };

    // 46-59: Right Column (Top to Bottom)
    // 46 is at 3. 59 is at 16.
    if (index >= 46 && index < 60) return { gridRow: `${index - 45 + 2} / span 1`, gridColumn: "17 / span 2" };

    return { gridRow: 1, gridColumn: 1 };
};

const getRotation = (index: number) => {
    // Corners don't strictly need rotation if square, but nice for alignment
    if (index === 0) return "-rotate-45"; // GO arrow often points in
    if (index === 15) return "rotate-45";
    if (index === 30) return "rotate-135";
    if (index === 45) return "-rotate-135";

    if (index > 0 && index < 15) return ""; // Bottom: upright
    if (index > 15 && index < 30) return "rotate-90"; // Left: Top points Right
    if (index > 30 && index < 45) return "rotate-180"; // Top: Top points Down
    if (index > 45) return "-rotate-90"; // Right: Top points Left
    return "";
};

export default function GameBoard() {
    const { state } = useGameState();
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="board-grid grid-cols-18 grid-rows-18 relative bg-slate-950/30 border-[1.5vmin] border-slate-900/80 rounded-[3vmin] shadow-[0_0_100px_rgba(0,0,0,0.6)] backdrop-blur-sm">

                {/* 1. RENDER TILES */}
                {/* 1. RENDER TILES */}
                {Object.entries(BOARD_CONFIG).map(([key, config]) => {
                    const index = parseInt(key);
                    const style = getGridArea(index);

                    // Rotation Logic
                    let rotationClass = "";
                    let isSide = false;

                    if (index > 0 && index <= 14) {
                        // Bottom Row
                        rotationClass = "";
                    } else if (index >= 16 && index <= 29) {
                        // Left Column
                        rotationClass = "rotate-90";
                        isSide = true;
                    } else if (index >= 31 && index <= 44) {
                        // Top Row
                        rotationClass = "rotate-180";
                    } else if (index >= 46 && index < 60) {
                        // Right Column
                        rotationClass = "-rotate-90";
                        isSide = true;
                    } else {
                        // Corners
                        if (index === 0) rotationClass = "-rotate-45";
                        if (index === 15) rotationClass = "rotate-45";
                        if (index === 30) rotationClass = "rotate-135";
                        if (index === 45) rotationClass = "-rotate-135";
                    }

                    return (
                        <div
                            key={index}
                            style={style}
                            className="relative flex items-center justify-center p-[0.1vmin]"
                            onClick={() => setSelectedProperty(index)}
                        >
                            {/* Inner Wrapper handles Rotation and Dimensions */}
                            {/* For sides (Wide Slot), we want the card to be TALL (Portrait) then Rotated. 
                                So we force the wrapper to be TALL (h-full of parent? No parent is Wide).
                                We want wrapper to be W=ParentHeight, H=ParentWidth approximately?
                                Actually, since PropertyCard is aspect 2/3, we just need to size the wrapper such that 2/3 fits.
                                Top/Bottom (Tall Slot 1x2): Wrapper fills.
                                Side (Wide Slot 2x1): Wrapper must be Tall (1x2) then rotated 90.
                                If we rotate 90, W becomes H. 
                                So we want Wrapper H = Slot W. Wrapper W = Slot H.
                            */}
                            <div
                                className={`
                                    relative transition-transform duration-300 hover:scale-110 hover:z-50 cursor-pointer shadow-lg
                                    ${rotationClass}
                                    ${isSide ? 'w-[100%] h-[200%]' : 'w-full h-full'}
                                    flex items-center justify-center
                                `}
                                style={isSide ? { width: '5.33vmin', height: '10.66vmin' } : undefined}
                            >
                                <PropertyCard
                                    config={config}
                                    state={state.board_state[index]}
                                    image={getAssetPath(config.name)}
                                    ownerColor={state.players.find(p => p.id === state.board_state[index]?.owner_id)?.color}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* 2. CENTER DASHBOARD */}
                {/* Center is cols 3-16, rows 3-16 */}
                <div
                    className="col-start-3 col-end-17 row-start-3 row-end-17 z-10 p-8 flex items-center justify-center pointer-events-none"
                >
                    <div className="pointer-events-auto">
                        <Controls />
                    </div>
                </div>

                {/* Center Decorations */}
                <div className="col-start-6 col-end-13 row-start-6 row-end-13 absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <h1 className="text-[15vmin] font-black italic tracking-tighter text-white rotate-[-45deg] whitespace-nowrap">MEGA-POLY</h1>
                </div>

                {/* 3. PLAYER TOKENS (ABSOLUTE OVERLAY) */}
                <div className="absolute inset-0 pointer-events-none z-30">
                    {(() => {
                        // Group players by position to handle collisions
                        const playersByPosition: Record<number, any[]> = {};
                        state.players.forEach(p => {
                            if (!playersByPosition[p.position]) playersByPosition[p.position] = [];
                            playersByPosition[p.position].push(p);
                        });

                        return Object.entries(playersByPosition).flatMap(([pos, players]) => {
                            const positionIndex = parseInt(pos);
                            const count = players.length;

                            return players.map((player, i) => {
                                // Calculate Offset
                                // If 1 player: (0,0)
                                // If >1: Distribute in a small circle or grid
                                let offset = { x: 0, y: 0 };
                                if (count > 1) {
                                    // Simple distribution pattern: circle
                                    const radius = 20; // px
                                    const angle = (2 * Math.PI * i) / count;
                                    offset = {
                                        x: Math.cos(angle) * radius,
                                        y: Math.sin(angle) * radius
                                    };
                                }

                                return (
                                    <PlayerToken
                                        key={player.id}
                                        positionIndex={player.position}
                                        color={player.color}
                                        tokenId={player.token_id}
                                        offset={offset}
                                    />
                                );
                            });
                        });
                    })()}
                </div>

            </div>

            {/* MODALS */}
            {selectedProperty !== null && (
                <PropertyModal index={selectedProperty} onClose={() => setSelectedProperty(null)} />
            )}
        </div>
    );
}
