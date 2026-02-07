"use client";

import React, { useState, useMemo } from "react";
import { useGameState } from "@/context/GameStateContext";
import { X, DollarSign, Check, AlertTriangle } from "lucide-react";

interface TradeInterfaceProps {
    onClose: () => void;
}

export default function TradeInterface({ onClose }: TradeInterfaceProps) {
    const { state, socket } = useGameState();
    const me = state.players.find(p => p.id === socket?.id);

    // State
    const [targetPlayerId, setTargetPlayerId] = useState<string>("");
    const [offerCash, setOfferCash] = useState(0);
    const [requestCash, setRequestCash] = useState(0);
    const [offerProps, setOfferProps] = useState<number[]>([]);
    const [requestProps, setRequestProps] = useState<number[]>([]);

    if (!me) return null;

    // Filter potential trade partners
    const opponents = state.players.filter(p => p.id !== me.id);

    // Auto-select first opponent if not selected
    if (!targetPlayerId && opponents.length > 0) {
        setTargetPlayerId(opponents[0].id);
    }

    const targetPlayer = state.players.find(p => p.id === targetPlayerId);

    // Helpers
    const toggleOfferProp = (idx: number) => {
        setOfferProps(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    const toggleRequestProp = (idx: number) => {
        setRequestProps(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    const hasHouses = (idx: number) => {
        const prop = state.board_state[idx];
        // Check entire group for houses (standard rule: cant trade if any houses in group)
        // Actually typical rule is you cannot trade a property if IT has houses. 
        // But usually you must sell houses before trading ANY property in the group.
        // GameEngine check: "Cannot trade properties with houses on color group"
        // So we check group.
        const groupProps = Object.values(state.board_state).filter((p: any) => p.group === prop.group);
        return groupProps.some((p: any) => p.houses > 0);
    };

    const handleSubmit = () => {
        if (!targetPlayerId) return;
        socket?.emit("create_trade_offer", {
            target_id: targetPlayerId,
            offer_cash: offerCash,
            offer_props: offerProps,
            request_cash: requestCash,
            request_props: requestProps
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-[2vmin]">
            <div className="w-[80vmin] max-h-[90vh] bg-slate-900 border border-white/20 rounded-[2vmin] shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-[2vmin] bg-slate-950 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-[2vmin] font-black text-white uppercase tracking-widest flex items-center gap-[1vmin]">
                        <span className="text-blue-500">Trade Proposal</span>
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white"><X size="2vmin" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                    {/* Column: YOU OFFER */}
                    <div className="flex-1 p-[2vmin] bg-blue-900/10 border-r border-white/10 flex flex-col gap-[2vmin]">
                        <div className="text-[1.5vmin] font-bold text-blue-300 uppercase tracking-wider text-center">
                            You Offer
                        </div>

                        {/* Cash Slider */}
                        <div className="bg-black/20 p-[1.5vmin] rounded-[1vmin]">
                            <div className="flex justify-between text-[1vmin] text-white/70 mb-[0.5vmin]">
                                <span>Cash</span>
                                <span>Max: ${me.cash}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={me.cash}
                                value={offerCash}
                                onChange={(e) => setOfferCash(parseInt(e.target.value))}
                                className="w-full h-[0.5vmin] bg-blue-500/30 rounded-lg appearance-none cursor-pointer mb-[1vmin]"
                            />
                            <div className="text-center font-mono font-bold text-[1.5vmin] text-blue-400">
                                ${offerCash}
                            </div>
                        </div>

                        {/* Properties */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-[0.5vmin]">
                            <div className="text-[1vmin] text-white/50 uppercase font-bold mb-[0.5vmin]">Properties</div>
                            {me.properties.map((pid: number) => {
                                const prop = state.board_state[pid];
                                const locked = hasHouses(pid);
                                return (
                                    <label key={pid} className={`flex items-center gap-[1vmin] p-[1vmin] rounded-[0.5vmin] border ${offerProps.includes(pid) ? "bg-blue-600/30 border-blue-500" : "bg-white/5 border-transparent hover:bg-white/10"} ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                        <input
                                            type="checkbox"
                                            checked={offerProps.includes(pid)}
                                            onChange={() => toggleOfferProp(pid)}
                                            disabled={locked}
                                            className="accent-blue-500 w-[1.5vmin] h-[1.5vmin]"
                                        />
                                        <div className="flex-1">
                                            <div className="text-[1vmin] font-bold text-white">{prop.name}</div>
                                            {locked && <div className="text-[0.8vmin] text-amber-500 flex items-center gap-[0.2vmin]"><AlertTriangle size="0.8vmin" /> Sell buildings first</div>}
                                        </div>
                                        <div className="w-[0.5vmin] h-[2vmin] rounded-full" style={{ backgroundColor: getGroupColor(prop.group) }} />
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* Column: PLAYERS & REQUEST */}
                    <div className="flex-1 p-[2vmin] bg-amber-900/10 flex flex-col gap-[2vmin]">

                        {/* Target Selector */}
                        <div className="flex justify-center mb-[1vmin]">
                            <select
                                value={targetPlayerId}
                                onChange={(e) => setTargetPlayerId(e.target.value)}
                                className="bg-slate-800 text-white border border-white/20 rounded-[0.5vmin] px-[2vmin] py-[1vmin] text-[1.2vmin] font-bold w-full focus:outline-none focus:border-amber-500"
                            >
                                {opponents.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="text-[1.5vmin] font-bold text-amber-300 uppercase tracking-wider text-center">
                            You Request
                        </div>

                        {targetPlayer && (
                            <>
                                {/* Cash Slider */}
                                <div className="bg-black/20 p-[1.5vmin] rounded-[1vmin]">
                                    <div className="flex justify-between text-[1vmin] text-white/70 mb-[0.5vmin]">
                                        <span>Cash</span>
                                        <span>Max: ${targetPlayer.cash}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={targetPlayer.cash}
                                        value={requestCash}
                                        onChange={(e) => setRequestCash(parseInt(e.target.value))}
                                        className="w-full h-[0.5vmin] bg-amber-500/30 rounded-lg appearance-none cursor-pointer mb-[1vmin]"
                                    />
                                    <div className="text-center font-mono font-bold text-[1.5vmin] text-amber-400">
                                        ${requestCash}
                                    </div>
                                </div>

                                {/* Properties */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-[0.5vmin]">
                                    <div className="text-[1vmin] text-white/50 uppercase font-bold mb-[0.5vmin]">Their Properties</div>
                                    {targetPlayer.properties.map((pid: number) => {
                                        const prop = state.board_state[pid];
                                        const locked = hasHouses(pid);
                                        return (
                                            <label key={pid} className={`flex items-center gap-[1vmin] p-[1vmin] rounded-[0.5vmin] border ${requestProps.includes(pid) ? "bg-amber-600/30 border-amber-500" : "bg-white/5 border-transparent hover:bg-white/10"} ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={requestProps.includes(pid)}
                                                    onChange={() => toggleRequestProp(pid)}
                                                    disabled={locked}
                                                    className="accent-amber-500 w-[1.5vmin] h-[1.5vmin]"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-[1vmin] font-bold text-white">{prop.name}</div>
                                                    {locked && <div className="text-[0.8vmin] text-amber-500 flex items-center gap-[0.2vmin]"><AlertTriangle size="0.8vmin" /> Sell buildings first</div>}
                                                </div>
                                                <div className="w-[0.5vmin] h-[2vmin] rounded-full" style={{ backgroundColor: getGroupColor(prop.group) }} />
                                            </label>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-[2vmin] bg-slate-950/50 border-t border-white/10 flex justify-end gap-[1vmin]">
                    <button onClick={onClose} className="px-[2vmin] py-[1vmin] text-white/50 hover:text-white font-bold text-[1vmin]">
                        CANCEL
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!targetPlayer}
                        className="px-[3vmin] py-[1.5vmin] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-[1.2vmin] rounded-[0.5vmin] shadow-lg flex items-center gap-[0.5vmin]"
                    >
                        SEND OFFER <Check size="1.2vmin" />
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
