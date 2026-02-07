"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface DiceProps {
    values: number[];
    isRolling: boolean;
}

export default function Dice({ values, isRolling }: DiceProps) {
    const [displayValues, setDisplayValues] = useState(values);

    useEffect(() => {
        if (isRolling) {
            const interval = setInterval(() => {
                setDisplayValues([
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1
                ]);
            }, 100);
            return () => clearInterval(interval);
        } else {
            setDisplayValues(values);
        }
    }, [isRolling, values]);

    const dotPositions: Record<number, string[]> = {
        1: ["center"],
        2: ["top-left", "bottom-right"],
        3: ["top-left", "center", "bottom-right"],
        4: ["top-left", "top-right", "bottom-left", "bottom-right"],
        5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
        6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"]
    };

    const getDotStyle = (pos: string) => {
        switch (pos) {
            case "center": return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
            case "top-left": return { top: "15%", left: "15%" };
            case "top-right": return { top: "15%", right: "15%" };
            case "bottom-left": return { bottom: "15%", left: "15%" };
            case "bottom-right": return { bottom: "15%", right: "15%" };
            case "middle-left": return { top: "50%", left: "15%", transform: "translateY(-50%)" };
            case "middle-right": return { top: "50%", right: "15%", transform: "translateY(-50%)" };
            default: return {};
        }
    };

    return (
        <div className="flex gap-[2vmin]">
            {displayValues.map((val, i) => (
                <motion.div
                    key={i}
                    animate={isRolling ? {
                        rotate: [0, 90, 180, 270, 360],
                        scale: [1, 1.1, 1],
                    } : {
                        rotate: 0,
                        scale: 1,
                    }}
                    transition={{ duration: 0.5, ease: "linear", repeat: isRolling ? Infinity : 0 }}
                    className="w-[6vmin] h-[6vmin] bg-white rounded-[1vmin] shadow-lg relative border border-slate-300 flex-shrink-0"
                >
                    {dotPositions[val]?.map((pos, idx) => (
                        <div
                            key={idx}
                            className="absolute w-[1.2vmin] h-[1.2vmin] bg-slate-900 rounded-full shadow-inner"
                            style={getDotStyle(pos)}
                        />
                    ))}
                </motion.div>
            ))}
        </div>
    );
}
