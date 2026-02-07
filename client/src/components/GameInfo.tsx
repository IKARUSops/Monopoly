"use client";

import React from "react";
import { useGameState } from "@/context/GameStateContext";
import { User, DollarSign, Home, Flag } from "lucide-react";

export default function GameInfo() {
    const { state, socket } = useGameState();
    const currentPlayer = state.players[state.current_turn_index];

    return (
        <div className="fixed top-[2vmin] left-[2vmin] w-[35vmin] h-auto max-h-[90vmin] bg-black/40 backdrop-blur-md rounded-[1vmin] p-[1.5vmin] flex flex-col border border-emerald-500/30 z-30 shadow-[0_0_20px_rgba(16,185,129,0.1)] pointer-events-auto">
            {/* Header: Room Code */}
            <div className="border-b border-emerald-500/20 pb-[1vmin] mb-[1.5vmin]">
                <div className="text-[1vmin] text-emerald-500/60 uppercase font-bold tracking-wider">ROOM CODE</div>
                <div className="text-[2vmin] font-black text-white tracking-widest">{state.room_id}</div>
            </div>

            {/* Players List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-[2vmin]">
                <div className="text-[1.2vmin] text-emerald-500 uppercase font-black mb-[1vmin] tracking-widest">
                    PLAYERS
                </div>
                <div className="space-y-[1vmin]">
                    {state.players.map(player => {
                        const isCurrentTurn = currentPlayer?.id === player.id;
                        const isMe = socket?.id === player.id;

                        return (
                            <div
                                key={player.id}
                                className={`
                                    p-[1vmin] rounded-[0.5vmin] border transition-all
                                    ${isCurrentTurn
                                        ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                        : "bg-white/5 border-white/5"}
                                `}
                            >
                                <div className="flex justify-between items-center mb-[0.5vmin]">
                                    <div className="flex items-center gap-[0.5vmin]">
                                        <div className="w-[1vmin] h-[1vmin] rounded-full" style={{ backgroundColor: player.color }} />
                                        <span className={`text-[1.1vmin] font-bold ${isCurrentTurn ? "text-white" : "text-white/70"}`}>
                                            {player.name} {isMe && "(YOU)"}
                                        </span>
                                    </div>
                                    {isCurrentTurn && <span className="text-[0.8vmin] bg-emerald-500 text-black font-bold px-[0.5vmin] rounded">TURN</span>}
                                </div>

                                <div className="flex justify-between text-[0.9vmin] text-white/50">
                                    <div className="flex items-center gap-[0.3vmin]">
                                        <DollarSign size="1vmin" />
                                        <span>{player.cash}</span>
                                    </div>
                                    <div className="flex items-center gap-[0.3vmin]">
                                        <Home size="1vmin" />
                                        <span>{player.properties.length} props</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Basic Rules */}
            <div className="bg-white/5 rounded-[1vmin] p-[1vmin] border border-white/5">
                <div className="text-[1vmin] text-emerald-500 uppercase font-bold mb-[0.5vmin] flex items-center gap-[0.5vmin]">
                    <Flag size="1.2vmin" /> Quick Rules
                </div>
                <ul className="text-[0.9vmin] text-white/60 space-y-[0.5vmin] list-disc list-inside">
                    <li>Roll doubles to go again (3x = Jail).</li>
                    <li>Land on unowned property to Buy or Auction.</li>
                    <li>Pay rent when landing on others' property.</li>
                    <li>Collect valid color sets to build houses.</li>
                    <li>Bankruptcy eliminates you from the game.</li>
                </ul>
            </div>
        </div>
    );
}
