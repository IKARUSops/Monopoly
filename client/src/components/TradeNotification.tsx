"use client";

import React from "react";
import { useGameState } from "@/context/GameStateContext";
import { Check, X, ArrowRightLeft } from "lucide-react";

export default function TradeNotification() {
    const { state, socket } = useGameState();
    const trade = state.active_trade;
    const me = state.players.find(p => p.id === socket?.id);

    // Only show if there is an active trade and I am the target
    if (!trade || trade.status !== "PENDING" || trade.target_player_id !== me?.id) return null;

    const proposer = state.players.find(p => p.id === trade.proposer_id);

    const handleResponse = (accept: boolean) => {
        socket?.emit("respond_to_trade", { accept });
    };

    return (
        <div className="fixed top-[10vmin] left-1/2 -translate-x-1/2 z-[160] w-[50vmin] bg-slate-900 border-[0.3vmin] border-amber-500 rounded-[1.5vmin] shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="bg-amber-600 p-[1.5vmin] flex justify-between items-center">
                <h3 className="text-[1.5vmin] font-black text-white uppercase tracking-widest flex items-center gap-[1vmin]">
                    <ArrowRightLeft /> Incoming Trade
                </h3>
                <span className="text-[1.2vmin] font-bold text-white/80">from {proposer?.name}</span>
            </div>

            {/* Content */}
            <div className="p-[2vmin] flex gap-[2vmin]">

                {/* They Offer */}
                <div className="flex-1 bg-white/5 rounded-[1vmin] p-[1vmin]">
                    <div className="text-[1vmin] text-emerald-400 font-bold uppercase mb-[1vmin] border-b border-white/10 pb-[0.5vmin]">You Receive</div>
                    <div className="space-y-[0.5vmin]">
                        {trade.offer_cash > 0 && (
                            <div className="text-[1.2vmin] font-mono font-bold text-white bg-emerald-500/20 px-[0.5vmin] rounded">
                                +${trade.offer_cash}
                            </div>
                        )}
                        {trade.offer_properties.length > 0 ? (
                            trade.offer_properties.map((pid: number) => {
                                const prop = state.board_state[pid];
                                return (
                                    <div key={pid} className="text-[1vmin] text-white flex items-center gap-[0.5vmin]">
                                        <div className="w-[0.5vmin] h-[0.5vmin] rounded-full" style={{ backgroundColor: getGroupColor(prop.group) }} />
                                        {prop.name}
                                    </div>
                                );
                            })
                        ) : (
                            trade.offer_cash === 0 && <div className="text-[1vmin] text-white/30 italic">Nothing</div>
                        )}
                    </div>
                </div>

                {/* They Request */}
                <div className="flex-1 bg-white/5 rounded-[1vmin] p-[1vmin]">
                    <div className="text-[1vmin] text-amber-400 font-bold uppercase mb-[1vmin] border-b border-white/10 pb-[0.5vmin]">You Give</div>
                    <div className="space-y-[0.5vmin]">
                        {trade.request_cash > 0 && (
                            <div className="text-[1.2vmin] font-mono font-bold text-white bg-amber-500/20 px-[0.5vmin] rounded">
                                -${trade.request_cash}
                            </div>
                        )}
                        {trade.request_properties.length > 0 ? (
                            trade.request_properties.map((pid: number) => {
                                const prop = state.board_state[pid];
                                return (
                                    <div key={pid} className="text-[1vmin] text-white flex items-center gap-[0.5vmin]">
                                        <div className="w-[0.5vmin] h-[0.5vmin] rounded-full" style={{ backgroundColor: getGroupColor(prop.group) }} />
                                        {prop.name}
                                    </div>
                                );
                            })
                        ) : (
                            trade.request_cash === 0 && <div className="text-[1vmin] text-white/30 italic">Nothing</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2">
                <button
                    onClick={() => handleResponse(false)}
                    className="p-[1.5vmin] bg-slate-800 hover:bg-red-900/50 text-white/70 hover:text-white font-bold text-[1.2vmin] transition-colors flex justify-center items-center gap-[1vmin]"
                >
                    <X size="1.5vmin" /> REJECT
                </button>
                <button
                    onClick={() => handleResponse(true)}
                    className="p-[1.5vmin] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[1.2vmin] transition-colors flex justify-center items-center gap-[1vmin]"
                >
                    <Check size="1.5vmin" /> ACCEPT
                </button>
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
