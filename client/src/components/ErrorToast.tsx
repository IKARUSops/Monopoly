"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useEffect } from "react";

interface ErrorToastProps {
    message: string;
    code: string;
    type?: "error" | "success" | "info";
    onClose: () => void;
}

export default function ErrorToast({ message, code, type = "error", onClose }: ErrorToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        error: {
            border: "border-red-500/50",
            icon: "text-red-400",
            title: "text-red-300",
            Icon: AlertCircle
        },
        success: {
            border: "border-green-500/50",
            icon: "text-green-400",
            title: "text-green-300",
            Icon: CheckCircle
        },
        info: {
            border: "border-blue-500/50",
            icon: "text-blue-400",
            title: "text-blue-300",
            Icon: Info
        }
    };

    const config = colors[type];
    const IconComponent = config.Icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`glass ${config.border} border rounded-lg p-4 max-w-md shadow-2xl`}
        >
            <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 ${config.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                    <p className={`font-semibold ${config.title}`}>{code}</p>
                    <p className="text-sm text-white/80 mt-1">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress bar */}
            <motion.div
                className="h-1 bg-white/20 rounded-full mt-3 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    className={`h-full ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                />
            </motion.div>
        </motion.div>
    );
}
