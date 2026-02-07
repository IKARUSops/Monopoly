"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface TokenProps {
    color: string;
    tokenId: string;
    position: { row: number; col: number };
}

export default function Token({ color, tokenId, position }: TokenProps) {
    return (
        <motion.div
            className="absolute z-50 pointer-events-none"
            initial={false}
            animate={{
                gridRow: position.row,
                gridColumn: position.col,
                x: "-50%",
                y: "-50%",
                left: "50%",
                top: "50%"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="relative group">
                {/* Shadow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 blur-sm rounded-full" />

                {/* Token SVG */}
                <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-12 h-12"
                    style={{
                        filter: `drop-shadow(0 0 8px ${color}88)`,
                    }}
                >
                    <Image
                        src={`/assets/tokens/${tokenId}.svg`}
                        alt={tokenId}
                        width={48}
                        height={48}
                        className="w-full h-full"
                        style={{
                            filter: `hue-rotate(${getHueRotation(color)}deg) saturate(1.2)`,
                        }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}

// Helper to adjust SVG color based on player color
function getHueRotation(color: string): number {
    // Convert hex to hue rotation (simplified)
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate hue (simplified formula)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue = 0;

    if (max !== min) {
        if (max === r) {
            hue = ((g - b) / (max - min)) * 60;
        } else if (max === g) {
            hue = (2 + (b - r) / (max - min)) * 60;
        } else {
            hue = (4 + (r - g) / (max - min)) * 60;
        }
    }

    return hue < 0 ? hue + 360 : hue;
}
