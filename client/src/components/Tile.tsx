"use client";

import React from "react";
import { useGameState } from "@/context/GameStateContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TileProps {
    index: number;
    config: any;
    onClick: (index: number) => void;
    image?: string;
}

export default function Tile({ index, config, onClick, image }: TileProps) {
    const { state } = useGameState();
    const property = state.board_state[index];

    const getGridPosition = (i: number) => {
        if (i <= 15) return { row: 16, col: 16 - i }; // Bottom
        if (i <= 30) return { row: 16 - (i - 15), col: 1 }; // Left
        if (i <= 45) return { row: 1, col: 1 + (i - 30) }; // Top
        if (i < 60) return { row: 1 + (i - 45), col: 16 }; // Right
        return { row: 1, col: 1 };
    };

    const { row, col } = getGridPosition(index);
    const isCorner = index % 15 === 0;

    return (
        <div
            onClick={() => onClick(index)}
            className={cn(
                "relative flex flex-col items-center justify-between border-[0.5px] border-white/10 p-0 overflow-hidden glass transition-all duration-300 cursor-pointer hover:bg-white/10 hover:z-10 hover:scale-105",
                isCorner ? "aspect-square" : "aspect-[2/3]",
                property?.group && `group-${property.group.toLowerCase().replace(/ /g, "-")}`
            )}
            style={{
                gridRow: row,
                gridColumn: col,
            }}
        >
            {image ? (
                <img
                    src={image}
                    alt={config.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
            ) : (
                <div className="text-[8px] font-bold uppercase text-white/70 text-center leading-tight p-1 z-10">
                    {config.name}
                </div>
            )}

            {property && !image && (
                <div className="mt-auto text-[10px] font-mono text-emerald-400 p-1 z-10">
                    ${property.price}
                </div>
            )}

            {/* Price overlay for image tiles if needed, or remove if price is on image */}
            {property && image && (
                <div className="absolute bottom-0 w-full bg-black/60 text-[8px] font-mono text-emerald-400 text-center py-0.5 backdrop-blur-sm">
                    ${property.price}
                </div>
            )}
        </div>
    );
}
