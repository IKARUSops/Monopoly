"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface TurnTimerProps {
    endTimestamp: number | null;
    maxTime?: number;
}

export default function TurnTimer({ endTimestamp, maxTime = 60 }: TurnTimerProps) {
    const [remaining, setRemaining] = useState(maxTime);

    useEffect(() => {
        if (!endTimestamp) {
            setRemaining(maxTime);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            // Server sends seconds, Date.now() is ms
            const diff = Math.max(0, (endTimestamp * 1000) - now);
            setRemaining(Math.ceil(diff / 1000));
        }, 100);

        return () => clearInterval(interval);
    }, [endTimestamp, maxTime]);

    const percentage = (remaining / maxTime) * 100;
    const isLow = remaining <= 10;
    const isCritical = remaining <= 5;

    return (
        <div className="glass rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/60" />
                    <span className="text-sm text-white/60">Turn Timer</span>
                </div>
                <motion.span
                    className={`text-2xl font-bold tabular-nums ${isCritical ? 'text-red-400' :
                        isLow ? 'text-yellow-400' :
                            'text-white'
                        }`}
                    animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    {remaining}s
                </motion.span>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                    className={`h-full ${isCritical ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        isLow ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-400 to-blue-500'
                        }`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.1 }}
                />

                {/* Pulse effect when critical */}
                {isCritical && (
                    <motion.div
                        className="absolute inset-0 bg-red-400/30"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                )}
            </div>

            {/* Warning text */}
            {isLow && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs mt-2 text-center ${isCritical ? 'text-red-400' : 'text-yellow-400'
                        }`}
                >
                    {isCritical ? '⚠️ Time running out!' : 'Hurry up!'}
                </motion.p>
            )}
        </div>
    );
}
