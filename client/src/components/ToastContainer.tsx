"use client";

import { motion, AnimatePresence } from "framer-motion";
import ErrorToast from "./ErrorToast";

interface ToastContainerProps {
    toasts: Array<{
        id: string;
        message: string;
        code: string;
        type?: "error" | "success" | "info";
    }>;
    onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ErrorToast
                            message={toast.message}
                            code={toast.code}
                            type={toast.type}
                            onClose={() => onRemove(toast.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
