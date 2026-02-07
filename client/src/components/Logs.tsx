"use client";

import React, { useEffect, useRef } from "react";
import { useGameState } from "@/context/GameStateContext";

export default function Logs() {
    const { state } = useGameState();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [state.logs]);

    return (
        <div className="fixed top-[2vmin] right-[2vmin] w-[35vmin] h-[35vmin] bg-black/40 backdrop-blur-md rounded-[1vmin] p-[1.5vmin] flex flex-col border border-emerald-500/30 z-30 shadow-[0_0_20px_rgba(16,185,129,0.1)] pointer-events-auto">
            <div className="text-[1.5vmin] text-emerald-500 uppercase font-black mb-[1vmin] tracking-widest border-b border-emerald-500/20 pb-[0.5vmin]">
                SYSTEM LOGS
            </div>
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-[0.8vmin] pr-[0.5vmin] custom-scrollbar font-mono"
            >
                {state.logs.map((log, i) => (
                    <div key={i} className="text-[1.3vmin] text-emerald-100/80 leading-snug">
                        <span className="text-emerald-600 mr-[0.5vmin]">{">"}</span>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
