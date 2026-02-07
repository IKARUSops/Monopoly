"use client";

import React from "react";
import { useGameState } from "@/context/GameStateContext";
import { X } from "lucide-react";

interface PropertyModalProps {
    index: number;
    onClose: () => void;
}

export default function PropertyModal({ index, onClose }: PropertyModalProps) {
    const { state, socket } = useGameState();
    const property = state.board_state[index];
    const me = state.players.find(p => p.id === socket?.id);
    const isOwner = property?.owner_id === me?.id;

    if (!property) return null;

    const buildHouse = () => {
        socket?.emit("build_house", { index });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="glass p-[3vmin] rounded-[3vmin] w-[35vmin] relative border border-white/20">
                <button onClick={onClose} className="absolute top-[1.5vmin] right-[1.5vmin] text-white/40 hover:text-white">
                    <X size="3vmin" />
                </button>

                <div className={`h-[10vmin] w-full rounded-[1.5vmin] group-${property.group.toLowerCase().replace(/ /g, "-")} flex items-center justify-center shadow-lg mb-[2vmin] border-[0.2vmin] border-white/10`}>
                    <h2 className="text-white font-black text-[2.5vmin] drop-shadow-lg text-center leading-tight px-[1vmin]">{property.name}</h2>
                </div>

                <div className="flex flex-col gap-[1vmin]">
                    <div className="flex justify-between text-[1.2vmin]">
                        <span className="text-white/60 uppercase font-bold">Base Rent</span>
                        <span className="text-white font-mono">${property.rent[0]}</span>
                    </div>
                    <div className="flex justify-between text-[1.2vmin]">
                        <span className="text-white/60">With 1 House</span>
                        <span className="text-white font-mono">${property.rent[1]}</span>
                    </div>
                    <div className="flex justify-between text-[1.2vmin] font-bold text-amber-500">
                        <span className="uppercase">With Hotel</span>
                        <span className="font-mono">${property.rent[5]}</span>
                    </div>
                </div>

                <div className="mt-[3vmin] pt-[2vmin] border-t border-white/10 space-y-[1vmin]">
                    <div className="flex justify-between items-center mb-[2vmin]">
                        <span className="text-white/40 text-[1vmin] uppercase font-bold">House Cost</span>
                        <span className="text-emerald-400 font-mono font-bold text-[1.5vmin]">${property.house_cost}</span>
                    </div>

                    {isOwner && (
                        <>
                            {/* Build / Sell Buttons Row */}
                            <div className="flex gap-[1vmin]">
                                <button
                                    onClick={buildHouse}
                                    disabled={property.houses >= 5 || property.is_mortgaged}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white font-bold py-[1.5vmin] rounded-[1vmin] transition-all shadow-lg text-[1vmin]"
                                >
                                    BUILD ({property.houses}/5)
                                </button>

                                <button
                                    onClick={() => socket?.emit("sell_building", { index })}
                                    disabled={property.houses <= 0}
                                    className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600 text-white font-bold py-[1.5vmin] rounded-[1vmin] transition-all shadow-lg text-[1vmin]"
                                >
                                    SELL HOUSE
                                </button>
                            </div>

                            {/* Mortgage / Unmortgage Row */}
                            <div className="flex gap-[1vmin]">
                                {!property.is_mortgaged ? (
                                    <button
                                        onClick={() => socket?.emit("mortgage_property", { index })}
                                        disabled={property.houses > 0}
                                        className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 text-white font-bold py-[1.5vmin] rounded-[1vmin] transition-all shadow-lg text-[1vmin]"
                                    >
                                        MORTGAGE (+${property.price / 2})
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => socket?.emit("unmortgage_property", { index })}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-[1.5vmin] rounded-[1vmin] transition-all shadow-lg text-[1vmin]"
                                    >
                                        UNMORTGAGE (-${Math.ceil(property.price * 0.55)})
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
