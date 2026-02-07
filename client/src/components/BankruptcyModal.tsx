"use client";

import React, { useEffect, useState } from "react";
import { useGameState } from "@/context/GameStateContext";

export default function BankruptcyModal() {
    const { state, socket } = useGameState();
    const me = state.players.find(p => p.id === socket?.id);

    if (!me || me.cash >= 0) return null;

    const debtAmount = Math.abs(me.cash);

    const handleSellHouse = (index: number) => {
        socket?.emit("sell_building", { index });
    };

    const handleMortgage = (index: number) => {
        socket?.emit("mortgage_property", { index });
    };

    const handleBankruptcy = () => {
        if (confirm("Are you sure you want to declare bankruptcy? This will eliminate you from the game.")) {
            socket?.emit("declare_bankruptcy", {});
        }
    };

    // Filter properties that can be liquidated
    const ownedProperties = me.properties.map((idx: number) => state.board_state[idx]);

    // Group by color for better UI
    const propertiesByGroup: Record<string, any[]> = {};
    ownedProperties.forEach((p: any) => {
        const group = p.group || "Railroad/Utility";
        if (!propertiesByGroup[group]) propertiesByGroup[group] = [];
        propertiesByGroup[group].push(p);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="w-[60vmin] bg-slate-900 border-[0.5vmin] border-red-500 rounded-[2vmin] shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col overflow-hidden animate-pulse-slow">

                {/* Header */}
                <div className="bg-red-600 p-[2vmin] text-center">
                    <h1 className="text-[3vmin] font-black text-white uppercase tracking-widest leading-none">
                        ⚠️ INSUFFICIENT FUNDS ⚠️
                    </h1>
                    <p className="text-[1.5vmin] text-white/90 font-bold mt-[1vmin]">
                        YOU OWE <span className="text-yellow-300 border-b-2 border-yellow-300 pb-1">${debtAmount}</span>
                    </p>
                </div>

                {/* Body */}
                <div className="p-[3vmin] flex-1 overflow-y-auto max-h-[50vmin]">
                    <p className="text-center text-white/70 mb-[2vmin] text-[1.2vmin]">
                        You must raise funds by selling buildings or mortgaging properties.
                        Or, you can surrender.
                    </p>

                    {/* Asset List */}
                    <div className="space-y-[2vmin]">
                        {Object.entries(propertiesByGroup).map(([group, props]) => (
                            <div key={group} className="bg-white/5 rounded-[1vmin] p-[1.5vmin] border border-white/10">
                                <h3 className="text-[1.2vmin] font-bold text-white/60 mb-[1vmin] uppercase tracking-wider">{group}</h3>
                                <div className="space-y-[1vmin]">
                                    {props.map(prop => (
                                        <div key={prop.index} className="flex items-center justify-between bg-black/40 p-[1vmin] rounded-[0.5vmin]">
                                            <div className="flex items-center gap-[1vmin]">
                                                {/* Color Strip */}
                                                <div className="w-[0.5vmin] h-[3vmin] rounded-full" style={{ backgroundColor: getGroupColor(group) }} />
                                                <div className="flex flex-col">
                                                    <span className="text-[1.2vmin] font-bold text-white">{prop.name}</span>
                                                    <span className="text-[1vmin] text-white/50">
                                                        {prop.is_mortgaged
                                                            ? "MORTGAGED"
                                                            : `Value: $${prop.price / 2}`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-[1vmin]">
                                                {/* Sell House Button */}
                                                {prop.houses > 0 && (
                                                    <button
                                                        onClick={() => handleSellHouse(prop.index)}
                                                        className="px-[1.5vmin] py-[0.5vmin] bg-amber-600 hover:bg-amber-500 text-white text-[1vmin] font-bold rounded shadow-sm hover:scale-105 transition-all"
                                                    >
                                                        SELL HOUSE (+${prop.house_cost / 2})
                                                    </button>
                                                )}

                                                {/* Mortgage Button */}
                                                {!prop.is_mortgaged && prop.houses === 0 && (
                                                    <button
                                                        onClick={() => handleMortgage(prop.index)}
                                                        className="px-[1.5vmin] py-[0.5vmin] bg-emerald-600 hover:bg-emerald-500 text-white text-[1vmin] font-bold rounded shadow-sm hover:scale-105 transition-all"
                                                    >
                                                        MORTGAGE (+${prop.price / 2})
                                                    </button>
                                                )}

                                                {/* Status Only */}
                                                {prop.is_mortgaged && (
                                                    <span className="text-red-500 text-[1vmin] font-bold px-[1vmin] border border-red-500/50 rounded">
                                                        MORTGAGED
                                                    </span>
                                                )}

                                                {/* Warning if houses prevent mortgage */}
                                                {!prop.is_mortgaged && prop.houses === 0 && hasGroupHouses(state, prop) && (
                                                    <span className="text-amber-500 text-[1vmin] italic pr-2">
                                                        Sell group houses first
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-[2vmin] bg-slate-950/50 border-t border-white/10 flex justify-between items-center">
                    <div className="text-[1.2vmin] text-white/50">
                        Total Liquidatable: <span className="text-emerald-400 font-mono">${calculateLiquidatable(me, state)}</span>
                    </div>

                    <button
                        onClick={handleBankruptcy}
                        className="px-[3vmin] py-[1.5vmin] bg-red-600 hover:bg-red-700 text-white font-black text-[1.2vmin] tracking-widest rounded-[1vmin] shadow-lg hover:shadow-red-900/50 transition-all border border-red-400"
                    >
                        DECLARE BANKRUPTCY
                    </button>
                </div>
            </div>
        </div>
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

function hasGroupHouses(state: any, prop: any) {
    // Check if any property in same group has houses (prevents mortgage)
    const groupProps = Object.values(state.board_state).filter((p: any) => p.group === prop.group);
    return groupProps.some((p: any) => p.houses > 0);
}

function calculateLiquidatable(player: any, state: any) {
    let total = 0;
    player.properties.forEach((pid: number) => {
        const p = state.board_state[pid];
        if (!p.is_mortgaged) total += (p.price / 2);
        total += (p.houses * (p.house_cost / 2));
    });
    return total;
}
