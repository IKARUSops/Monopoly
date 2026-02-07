"use client";

import React from "react";
import { useGameState } from "@/context/GameStateContext";
import { Trophy, RefreshCw } from "lucide-react";

export default function GameOverModal() {
    const { state, socket } = useGameState();

    if (state.game_status !== "ENDED") return null;

    // Winner is the last remaining player
    const winner = state.players[0];

    const handleRestart = () => {
        socket?.emit("restart_game", {});
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
            <div className="flex flex-col items-center animate-bounce-slow">
                <Trophy size="15vmin" className="text-yellow-400 drop-shadow-[0_0_5vmin_rgba(250,204,21,0.5)] mb-[4vmin]" />

                <h1 className="text-[8vmin] font-black text-white tracking-widest leading-none mb-[2vmin] text-shadow-glow">
                    WINNER!
                </h1>

                <div className="text-[4vmin] font-bold text-emerald-400 mb-[6vmin]">
                    {winner?.name || "Unknown"}
                </div>

                <button
                    onClick={handleRestart}
                    className="group relative px-[4vmin] py-[2vmin] bg-white text-black font-black text-[2vmin] tracking-widest uppercase rounded-full hover:scale-110 transition-transform duration-300"
                >
                    <span className="flex items-center gap-[1vmin]">
                        <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
                        Play Again
                    </span>
                    <div className="absolute inset-0 rounded-full border-[0.5vmin] border-white/50 animate-ping" />
                </button>
            </div>
        </div>
    );
}
