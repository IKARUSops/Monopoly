"use client";

import React, { useState, useEffect } from "react";
import { useGameState } from "@/context/GameStateContext";
import { useAudio } from "@/components/AudioManager";
import TurnTimer from "./TurnTimer";
import Dice from "./Dice";

export default function Controls() {
    const { state, socket } = useGameState();
    const { play } = useAudio();
    const [isRolling, setIsRolling] = useState(false);

    const me = state.players.find(p => p.id === socket?.id);
    const isMyTurn = state.players[state.current_turn_index]?.id === socket?.id;

    // Detect dice change to stop rolling
    useEffect(() => {
        if (state.dice_roll && isRolling) {
            // Add a small delay for effect or stop immediately
            const timer = setTimeout(() => setIsRolling(false), 500);
            return () => clearTimeout(timer);
        }
    }, [state.dice_roll]);

    // TIMER ENFORCEMENT
    useEffect(() => {
        if (!isMyTurn || !state.turn_end_timestamp || state.game_status !== "PLAYING") return;

        const interval = setInterval(() => {
            const now = Date.now() / 1000;
            if (now > state.turn_end_timestamp!) {
                console.log("Timer expired! Auto-ending turn...");
                if (me.cash < 0) {
                    socket?.emit("declare_bankruptcy", {});
                } else {
                    socket?.emit("end_turn", {});
                }
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isMyTurn, state.turn_end_timestamp, state.game_status, me.cash, socket]);

    const rollDice = () => {
        setIsRolling(true);
        play("roll_dice");
        socket?.emit("roll_dice", {});
    };

    const buyProperty = () => {
        play("buy_property");
        socket?.emit("buy_property", { index: me?.position });
    };

    const skipPurchase = () => {
        socket?.emit("skip_purchase", {});
    };

    const endTurn = () => {
        socket?.emit("end_turn", {});
    };

    if (!me) return null;

    return (
        <div className="flex flex-col items-center gap-[2vmin] w-full max-w-[60vmin]">
            {/* Dice Display */}
            <div className="mb-[1vmin]">
                <Dice values={state.dice_roll || [1, 1]} isRolling={isRolling} />
            </div>

            {/* Status Header */}
            <div className="text-[1.5vmin] text-white/60 uppercase font-black tracking-widest text-center mb-[1vmin]">
                {isMyTurn ? <span className="text-emerald-400 glow-text">Your Turn</span> : `${state.players[state.current_turn_index]?.name}'s Turn`}
            </div>

            {/* Main Action Bar */}
            <div className="flex gap-[1.5vmin] w-full justify-center">
                <button
                    disabled={!isMyTurn || state.turn_phase !== "ROLL"}
                    onClick={rollDice}
                    className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 px-[2vmin] py-[1.5vmin] rounded-[1.5vmin] font-bold transition-all active:scale-95 text-[1.2vmin] border border-white/10"
                >
                    ROLL DICE
                </button>

                <button
                    disabled={!isMyTurn || state.turn_phase !== "ACTION"}
                    onClick={buyProperty}
                    className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 disabled:opacity-30 px-[2vmin] py-[1.5vmin] rounded-[1.5vmin] font-bold transition-all text-[1.2vmin]"
                >
                    BUY
                </button>

                <button
                    disabled={!isMyTurn || state.turn_phase !== "ACTION"}
                    onClick={skipPurchase}
                    className="flex-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 disabled:opacity-30 px-[2vmin] py-[1.5vmin] rounded-[1.5vmin] font-bold transition-all text-[1.2vmin]"
                >
                    SKIP
                </button>

                <button
                    disabled={!isMyTurn || state.turn_phase !== "END"}
                    onClick={endTurn}
                    className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 px-[2vmin] py-[1.5vmin] rounded-[1.5vmin] font-bold transition-all text-[1.2vmin] border border-white/10"
                >
                    END
                </button>
            </div>

            {/* Secondary Info Bar (Timer & Cash) */}
            <div className="flex items-center gap-[3vmin] mt-[2vmin] px-[3vmin] py-[1.5vmin] glass rounded-full relative group">
                {state.game_status === "PLAYING" && (
                    <div className="flex items-center gap-[1vmin]">
                        <div className="w-[1vmin] h-[1vmin] rounded-full bg-red-500 animate-pulse" />
                        <div className="text-[1.2vmin] font-mono font-bold text-white">
                            <TurnTimer endTimestamp={state.turn_end_timestamp} />
                        </div>
                    </div>
                )}

                <div className="w-[1px] h-[2vmin] bg-white/20" />

                <div className="flex flex-col items-center">
                    <div className="text-[0.8vmin] text-white/40 uppercase font-bold">Cash Balance</div>
                    <div className="text-[2vmin] font-mono text-emerald-400 font-bold tracking-tight text-shadow-glow">
                        ${me.cash.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Danger Zone: Declare Bankruptcy */}
            <button
                onClick={() => {
                    if (confirm("Are you sure you want to declare bankruptcy? You will lose everything and leave the game.")) {
                        socket?.emit("declare_bankruptcy", {});
                    }
                }}
                className="mt-[2vmin] px-[2vmin] py-[1vmin] bg-red-950/30 hover:bg-red-900/50 border border-red-900/30 hover:border-red-500/50 text-red-500/70 hover:text-red-400 font-bold uppercase tracking-widest text-[0.9vmin] rounded-[0.5vmin] transition-all duration-300"
            >
                Declare Bankruptcy
            </button>
        </div>
    );
}
