import React from "react";
import { motion } from "framer-motion";
import { Car, Send, Zap, Star } from "lucide-react";

interface PlayerTokenProps {
    positionIndex: number; // 0-59
    color: string;
    tokenId: string; // "cyber_car" etc.
    offset?: { x: number, y: number }; // To prevent overlapping
}

// Helper to convert board index (0-59) to percentage coordinates on 18x18 grid
const getCoordinates = (index: number) => {
    // Grid: 18x18
    // Cell unit = 100/18 %
    const unit = 100 / 18;

    let x = 0; // horizontal unit units from left (0..18)
    let y = 0; // vertical unit units from top (0..18)

    // Corner 0 (Bottom Right): Grid 17-18, 17-18 -> Center is 17
    if (index === 0) { x = 17; y = 17; }

    // Bottom Row (1-14): Grid Row 17-18 (Center Y=17).
    // Index 1 (Grid Col 16, Center X=15.5) -> Index 14 (Grid Col 3, Center X=2.5)
    else if (index >= 1 && index <= 14) {
        x = 15.5 - (index - 1);
        y = 17;
    }

    // Corner 15 (Bottom Left): Grid 1-2, 17-18 -> Center X=1, Y=17
    else if (index === 15) { x = 1; y = 17; }

    // Left Column (16-29): Grid Col 1-2 (Center X=1).
    // Index 16 (Grid Row 16, Center Y=15.5) -> Index 29 (Grid Row 3, Center Y=2.5)
    else if (index >= 16 && index <= 29) {
        x = 1;
        y = 15.5 - (index - 16);
    }

    // Corner 30 (Top Left): Grid 1-2, 1-2 -> Center X=1, Y=1
    else if (index === 30) { x = 1; y = 1; }

    // Top Row (31-44): Grid Row 1-2 (Center Y=1).
    // Index 31 (Grid Col 3, Center X=2.5) -> Index 44 (Grid Col 16, Center X=15.5)
    else if (index >= 31 && index <= 44) {
        x = 2.5 + (index - 31);
        y = 1;
    }

    // Corner 45 (Top Right): Grid 17-18, 1-2 -> Center X=17, Y=1
    else if (index === 45) { x = 17; y = 1; }

    // Right Column (46-59): Grid Col 17-18 (Center X=17).
    // Index 46 (Grid Row 3, Center Y=2.5) -> Index 59 (Grid Row 16, Center Y=15.5)
    else if (index >= 46 && index <= 59) {
        x = 17;
        y = 2.5 + (index - 46);
    }

    return {
        top: `${y * unit}%`,
        left: `${x * unit}%`
    };
};

const TokenIcons: Record<string, any> = {
    "cyber_car": Car,
    "neon_ship": Send, // close enough
    "data_dog": Zap,
    "default": Star,
};

export default function PlayerToken({ positionIndex, color, tokenId, offset = { x: 0, y: 0 } }: PlayerTokenProps) {
    const coords = getCoordinates(positionIndex);
    const Icon = TokenIcons[tokenId] || TokenIcons["default"];

    return (
        <motion.div
            className="absolute w-[4vmin] h-[4vmin] z-50 flex items-center justify-center drop-shadow-[0_0_1vmin_rgba(0,0,0,0.8)]"
            initial={false}
            animate={{
                top: `calc(${coords.top} + ${offset.y}px)`,
                left: `calc(${coords.left} + ${offset.x}px)`
            }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
        >
            <div
                className="w-full h-full rounded-full border-[0.3vmin] border-white flex items-center justify-center bg-black/50 backdrop-blur-sm"
                style={{ borderColor: color, boxShadow: `0 0 10px ${color}` }}
            >
                <Icon size="60%" color={color} fill={color} className="opacity-80" />
            </div>
        </motion.div>
    );
}
