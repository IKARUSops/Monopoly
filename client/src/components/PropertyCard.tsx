import React from "react";
import { motion } from "framer-motion";

interface PropertyCardProps {
    config: {
        name: string;
        type: string;
        group?: string;
        price?: number;
    };
    state?: {
        owner_id: string | null;
        houses: number;
        is_mortgaged: boolean;
        price: number;
    };
    image?: string;
    ownerColor?: string;
}

const GROUP_COLORS: Record<string, string> = {
    "Gray": "#94a3b8",
    "Brown": "#78350f",
    "Lt. Blue": "#38bdf8",
    "Pink": "#f472b6",
    "Teal": "#2dd4bf",
    "Orange": "#fb923c",
    "Red": "#f87171",
    "Yellow": "#facc15",
    "Green": "#4ade80",
    "Indigo": "#818cf8",
    "Violet": "#a78bfa",
    "Dk. Blue": "#2563eb",
};

export default function PropertyCard({ config, state, image, ownerColor }: PropertyCardProps) {
    const isProperty = config.type === "PROPERTY" || config.type === "RAILROAD" || config.type === "UTILITY";
    const color = config.group ? GROUP_COLORS[config.group] : "#ffffff";

    // Fallback image if none provided
    const bgImage = image || "/assets/placeholder.png";

    return (
        <div
            className="relative aspect-[2/3] max-h-full max-w-full rounded-[0.5vmin] overflow-hidden bg-slate-900/90 backdrop-blur-sm shadow-lg flex flex-col group transition-all hover:scale-105 hover:z-20 hover:shadow-2xl"
            style={{
                border: ownerColor ? `0.4vmin solid ${ownerColor}` : '1px solid rgba(255,255,255,0.1)',
                boxShadow: ownerColor ? `0 0 1.5vmin ${ownerColor}40` : ''
            }}
        >
            {/* Top Image Section - 55% height */}
            <div className="h-[55%] w-full relative overflow-hidden">
                <img
                    src={bgImage}
                    alt={config.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Owner Overlay Banner */}
                {ownerColor && (
                    <div
                        className="absolute top-0 right-0 left-0 h-[1.5vmin] flex items-center justify-center shadow-lg transform translate-y-[-1px]"
                        style={{ backgroundColor: ownerColor }}
                    >
                        <span className="text-[0.8vmin] font-black text-white/90 uppercase tracking-widest drop-shadow-md">OWNED</span>
                    </div>
                )}

                {/* Mortgaged Overlay */}
                {state?.is_mortgaged && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                        <p className="text-red-500 font-black tracking-widest -rotate-12 border-[0.3vmin] border-red-500 p-[0.5vmin] rounded-[1vmin] text-[1vmin]">MORTGAGED</p>
                    </div>
                )}

                {/* House Indicator */}
                {state && state.houses > 0 && (
                    <div className="absolute bottom-[0.5vmin] left-[0.5vmin] flex gap-[0.2vmin] z-10">
                        {Array.from({ length: state.houses }).map((_, i) => (
                            <div key={i} className={`w-[0.8vmin] h-[0.8vmin] ${state.houses === 5 ? 'bg-red-500' : 'bg-green-400'} rounded-[0.2vmin] shadow-md border border-black/50`} />
                        ))}
                    </div>
                )}
            </div>

            {/* Neon Strip */}
            {config.group && (
                <div
                    className="h-[0.5vmin] w-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: color, color: color }}
                />
            )}

            {/* Bottom Info Section */}
            <div className="flex-1 flex flex-col justify-between p-[0.5vmin] text-center bg-slate-900/50">
                <div className="flex flex-col justify-center h-full gap-[0.2vmin]">
                    <p className="text-[0.6vmin] leading-tight font-black text-white uppercase tracking-wider truncate px-[0.2vmin]">
                        {config.name}
                    </p>
                    {isProperty && (config.price || state?.price) && (
                        <p className="text-[0.6vmin] font-mono text-emerald-400 bg-emerald-900/20 rounded-[0.2vmin] mx-auto px-[1vmin]">
                            ${state?.price || config.price}
                        </p>
                    )}
                </div>
            </div>

            {/* Selection/Hover Glow */}
            <div className="absolute inset-0 border-[0.2vmin] border-transparent group-hover:border-white/20 rounded-[0.5vmin] pointer-events-none" />
        </div>
    );
}
