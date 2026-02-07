"use client";

import React, { useState } from "react";
import Tile from "./Tile";
import Token from "./Token";
import PropertyModal from "./PropertyModal";
import { useGameState } from "@/context/GameStateContext";

const getGridPosition = (i: number) => {
    if (i <= 15) return { row: 16, col: 16 - i };
    if (i <= 30) return { row: 16 - (i - 15), col: 1 };
    if (i <= 45) return { row: 1, col: 1 + (i - 30) };
    if (i < 60) return { row: 1 + (i - 45), col: 16 };
    return { row: 1, col: 1 };
};

const BOARD_CONFIG: Record<number, { name: string; type: string }> = {
    0: { name: "GO", type: "GO" },
    1: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
    2: { name: "Kathmandu", type: "PROPERTY" },
    3: { name: "Incm Tax", type: "TAX" },
    4: { name: "La Paz", type: "PROPERTY" },
    5: { name: "Reading RR", type: "RAILROAD" },
    6: { name: "Lagos", type: "PROPERTY" },
    7: { name: "Chance", type: "CHANCE" },
    8: { name: "Cairo", type: "PROPERTY" },
    9: { name: "Johburg", type: "PROPERTY" },
    10: { name: "Jail", type: "JAIL" },
    11: { name: "Bogota", type: "PROPERTY" },
    12: { name: "Elec Co.", type: "UTILITY" },
    13: { name: "Lima", type: "PROPERTY" },
    14: { name: "Sao Paulo", type: "PROPERTY" },
    15: { name: "Subway A", type: "SUBWAY" },
    16: { name: "Wellingtn", type: "PROPERTY" },
    17: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
    18: { name: "Canberra", type: "PROPERTY" },
    19: { name: "Sydney", type: "PROPERTY" },
    20: { name: "Penn RR", type: "RAILROAD" },
    21: { name: "Chance", type: "CHANCE" },
    22: { name: "Sofia", type: "PROPERTY" },
    23: { name: "Water Wks", type: "UTILITY" },
    24: { name: "Budapest", type: "PROPERTY" },
    25: { name: "Prague", type: "PROPERTY" },
    26: { name: "Riyadh", type: "PROPERTY" },
    27: { name: "Tel Aviv", type: "PROPERTY" },
    28: { name: "ISP", type: "UTILITY" },
    29: { name: "Dubai", type: "PROPERTY" },
    30: { name: "Parking", type: "FREE_PARKING" },
    31: { name: "Hanoi", type: "PROPERTY" },
    32: { name: "Chance", type: "CHANCE" },
    33: { name: "Bangkok", type: "PROPERTY" },
    34: { name: "Singpore", type: "PROPERTY" },
    35: { name: "B. & O.", type: "RAILROAD" },
    36: { name: "Seoul", type: "PROPERTY" },
    37: { name: "Beijing", type: "PROPERTY" },
    38: { name: "Solar Farm", type: "UTILITY" },
    39: { name: "Tokyo", type: "PROPERTY" },
    40: { name: "Berlin", type: "PROPERTY" },
    41: { name: "Madrid", type: "PROPERTY" },
    42: { name: "Paris", type: "PROPERTY" },
    43: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
    44: { name: "Short Line", type: "RAILROAD" },
    45: { name: "Subway B", type: "SUBWAY" },
    46: { name: "Oslo", type: "PROPERTY" },
    47: { name: "Lux Tax", type: "TAX" },
    48: { name: "Stockhlm", type: "PROPERTY" },
    49: { name: "Chance", type: "CHANCE" },
    50: { name: "Metro RR", type: "RAILROAD" },
    51: { name: "Toronto", type: "PROPERTY" },
    52: { name: "Deposit", type: "BANK_DEPOSIT" },
    53: { name: "Chicago", type: "PROPERTY" },
    54: { name: "San Fran", type: "PROPERTY" },
    55: { name: "Go To Jail", type: "GO_TO_JAIL" },
    56: { name: "London", type: "PROPERTY" },
    57: { name: "New York", type: "PROPERTY" },
    58: { name: "Wealth Tax", type: "TAX" },
    59: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
    // 59: { name: "Comm Chest", type: "COMMUNITY_CHEST" },
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
};

const getAssetPath = (name: string) => {
    if (ASSET_MAP[name]) return `/assets/cities/${ASSET_MAP[name]}`;
    // Default: lowercase and replace spaces/dots with underscores
    const formatted = name.toLowerCase().replace(/[\s.]+/g, "_");
    return `/assets/cities/${formatted}.png`;
};

export default function Board() {
    const { state } = useGameState();
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

    const handleTileClick = (index: number) => {
        if (BOARD_CONFIG[index].type === "PROPERTY") {
            setSelectedProperty(index);
        }
    };

    return (
        <div className="relative">
            <div className="board-grid select-none">
                {Object.entries(BOARD_CONFIG).map(([index, config]) => (
                    <Tile
                        key={index}
                        index={parseInt(index)}
                        config={config}
                        onClick={handleTileClick}
                        image={getAssetPath(config.name)}
                    />
                ))}

                {state.players.map((player) => (
                    <Token
                        key={player.id}
                        color={player.color}
                        tokenId={player.token_id}
                        position={getGridPosition(player.position)}
                    />
                ))}

                <div className="col-start-2 col-end-16 row-start-2 row-end-16 flex flex-col items-center justify-center glass rounded-xl border border-white/5 m-4">
                    <h1 className="text-6xl font-black italic tracking-tighter text-white/20">MEGA-POLY</h1>
                    <div className="mt-8 flex gap-4">
                        <div className="w-16 h-16 glass rounded-lg flex items-center justify-center text-3xl font-bold">
                            {state.dice_roll[0]}
                        </div>
                        <div className="w-16 h-16 glass rounded-lg flex items-center justify-center text-3xl font-bold">
                            {state.dice_roll[1]}
                        </div>
                    </div>
                </div>
            </div>

            {selectedProperty !== null && (
                <PropertyModal index={selectedProperty} onClose={() => setSelectedProperty(null)} />
            )}
        </div>
    );
}
