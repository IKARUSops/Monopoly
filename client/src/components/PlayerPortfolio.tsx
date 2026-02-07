"use client";

import React, { useState } from "react";
import { useGameState } from "@/context/GameStateContext";
import { Briefcase, DollarSign, ArrowRightLeft } from "lucide-react";
import TradeInterface from "./TradeInterface";

export default function PlayerPortfolio() {
    const { state, socket } = useGameState();
    const [isTradeOpen, setIsTradeOpen] = useState(false);

    const me = state.players.find(p => p.id === socket?.id);
    const currentPlayer = state.players[state.current_turn_index];
    const isMyTurn = currentPlayer?.id === me?.id; // && state.game_status === "PLAYING";

    if (!me) return null;

    // Calculate Net Worth
    const calculateNetWorth = () => {
        let total = me.cash;
        me.properties.forEach((pid: number) => {
            const prop = state.board_state[pid];
            if (prop) {
                total += prop.is_mortgaged ? prop.price / 2 : prop.price;
                total += prop.houses * prop.house_cost;
            }
        });
        return total;
    };

    const netWorth = calculateNetWorth();

    return (
        <>
            <div className="fixed bottom-[2vmin] left-[2vmin] w-[35vmin] bg-slate-900/90 backdrop-blur-md rounded-[1vmin] border border-white/10 shadow-2xl p-[1.5vmin] z-40 pointer-events-auto flex flex-col gap-[1.5vmin]">
                {/* Header Stats */}
                <div className="flex justify-between items-end border-b border-white/10 pb-[1vmin]">
                    <div>
                        <div className="text-[1vmin] text-white/50 uppercase font-bold tracking-wider mb-[0.2vmin]">Net Worth</div>
                        <div className="text-[2.5vmin] font-mono font-bold text-emerald-400 flex items-center leading-none">
                            <span className="text-[1.5vmin] mr-[0.2vmin]">$</span>
                            {netWorth.toLocaleString()}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[1vmin] text-white/50 uppercase font-bold tracking-wider mb-[0.2vmin]">Cash</div>
                        <div className="text-[1.8vmin] font-mono font-bold text-white leading-none">
                            ${me.cash.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Properties List (Compact) */}
                <div className="max-h-[15vmin] overflow-y-auto custom-scrollbar space-y-[0.5vmin]">
                    {me.properties.length === 0 ? (
                        <div className="text-center text-[1vmin] text-white/30 italic py-[1vmin]">
                            No assets yet.
                        </div>
                    ) : (
                        me.properties.map((pid: number) => {
                            const prop = state.board_state[pid];
                            return (
                                <div key={pid} className="flex items-center justify-between bg-white/5 px-[1vmin] py-[0.5vmin] rounded-[0.5vmin]">
                                    <div className="flex items-center gap-[0.5vmin]">
                                        <div className={`w-[0.5vmin] h-[2vmin] rounded-full group-${prop.group.toLowerCase().replace(" ", "-")}`} style={{ backgroundColor: getGroupColor(prop.group) }} />
                                        <span className={`text-[1vmin] font-bold ${prop.is_mortgaged ? "text-white/40 line-through" : "text-white"}`}>
                                            {prop.name}
                                        </span>
                                    </div>
                                    {prop.houses > 0 && (
                                        <div className="flex gap-[0.2vmin]">
                                            {[...Array(prop.houses)].map((_, i) => (
                                                <div key={i} className={`w-[0.6vmin] h-[0.6vmin] ${prop.houses === 5 ? "bg-red-500" : "bg-emerald-500"} rounded-full`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Trade Button */}
                <div className="relative group/trade">
                    <button
                        disabled={!isMyTurn}
                        onClick={() => setIsTradeOpen(true)}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold py-[1.2vmin] rounded-[0.8vmin] text-[1.2vmin] flex items-center justify-center gap-[0.8vmin] transition-all"
                    >
                        <ArrowRightLeft size="1.2vmin" />
                        MAKE TRADE
                    </button>
                    {!isMyTurn && (
                        <div className="absolute bottom-full mb-[1vmin] left-1/2 -translate-x-1/2 w-max px-[1vmin] py-[0.5vmin] bg-black text-white text-[1vmin] rounded opacity-0 group-hover/trade:opacity-100 transition-opacity pointer-events-none">
                            Trades can only be initiated during your turn.
                        </div>
                    )}
                </div>
            </div>

            {/* Trade Modal */}
            {isTradeOpen && <TradeInterface onClose={() => setIsTradeOpen(false)} />}
        </>
    );
}

function getGroupColor(group: string) {
    const colors: Record<string, string> = {
        "Gray": "#94a3b8", "Brown": "#78350f", "Lt. Blue": "#38bdf8", "Pink": "#f472b6",
        "Teal": "#2dd4bf", "Orange": "#fb923c", "Red": "#f87171", "Yellow": "#facc15",
        "Green": "#4ade80", "Indigo": "#818cf8", "Violet": "#a78bfa", "Dk. Blue": "#2563eb",
    };
    return colors[group] || "#ffffff";
}
