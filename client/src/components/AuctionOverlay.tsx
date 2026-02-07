"use client";

import React, { useState, useEffect } from "react";
import { useGameState } from "@/context/GameStateContext";

export default function AuctionOverlay() {
    const { state, socket } = useGameState();
    const [bidAmount, setBidAmount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    const auction = state.active_auction;

    useEffect(() => {
        if (auction) {
            setBidAmount(auction.current_bid + 10);
        }
    }, [auction]);

    useEffect(() => {
        if (!auction) return;
        const interval = setInterval(() => {
            const diff = Math.max(0, Math.floor(auction.end_time - Date.now() / 1000));
            setTimeLeft(diff);
        }, 100);
        return () => clearInterval(interval);
    }, [auction]);

    if (state.turn_phase !== "AUCTION" || !auction) return null;

    const property = state.board_state[auction.property_index];

    const placeBid = () => {
        socket?.emit("place_bid", { amount: bidAmount });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass p-[2vmin] rounded-[3vmin] flex flex-col items-center gap-[1.5vmin] border-[0.3vmin] border-amber-500/50 shadow-2xl shadow-amber-500/10 w-[40vmin]">
                <h2 className="text-[2.5vmin] font-black italic text-amber-500">PROPERTY AUCTION</h2>
                <div className="text-center">
                    <p className="text-white/60 text-[1vmin] uppercase font-bold">Bidding for</p>
                    <p className="text-[2vmin] font-bold text-white tracking-tight">{property?.name}</p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-[4vmin] font-mono font-black text-amber-500 mb-[0.5vmin]">${auction.current_bid}</div>
                    <p className="text-white/40 text-[0.8vmin] font-bold uppercase">Current High Bid</p>
                    {auction.highest_bidder_id && (
                        <p className="text-emerald-400 text-[1vmin] mt-[0.5vmin]">
                            Leading: {state.players.find(p => p.id === auction.highest_bidder_id)?.name}
                        </p>
                    )}
                </div>

                <div className="w-full bg-white/5 p-[1vmin] rounded-[2vmin] flex flex-col items-center gap-[1vmin]">
                    <div className="text-[0.8vmin] text-white/40 uppercase font-bold">Your Bid</div>
                    <div className="flex gap-[1vmin] items-center">
                        <button onClick={() => setBidAmount(m => Math.max(auction.current_bid + 1, m - 10))} className="w-[4vmin] h-[4vmin] glass rounded-full flex items-center justify-center text-[2vmin] hover:bg-white/10">-</button>
                        <div className="text-[2.5vmin] font-mono font-bold text-white min-w-[10vmin] text-center">${bidAmount}</div>
                        <button onClick={() => setBidAmount(m => m + 10)} className="w-[4vmin] h-[4vmin] glass rounded-full flex items-center justify-center text-[2vmin] hover:bg-white/10">+</button>
                    </div>
                </div>

                <button
                    onClick={placeBid}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-[1.5vmin] rounded-[1.5vmin] transition-all active:scale-95 text-[1.5vmin]"
                >
                    PLACE BID
                </button>

                <div className="w-full h-[0.8vmin] bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 transition-all duration-1000"
                        style={{ width: `${(timeLeft / 15) * 100}%` }}
                    />
                </div>
                <p className="text-white/40 text-[0.8vmin] font-bold">{timeLeft}s REMAINING</p>
            </div>
        </div>
    );
}
