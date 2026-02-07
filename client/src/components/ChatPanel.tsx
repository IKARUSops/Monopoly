"use client";

import { motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useGameState } from "@/context/GameStateContext";

export default function ChatPanel() {
    const { state, socket } = useGameState();
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [state.chat_messages]);

    const sendMessage = () => {
        if (!message.trim() || !socket) return;

        socket.emit("send_chat", { message: message.trim() });
        setMessage("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-[2vmin] right-[2vmin] w-[35vmin] h-[35vmin] bg-black/40 backdrop-blur-md rounded-[1vmin] flex flex-col border border-emerald-500/30 z-30 shadow-[0_0_20px_rgba(16,185,129,0.1)] pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-[1.5vmin] border-b border-emerald-500/20">
                <div className="flex items-center gap-[1vmin]">
                    <MessageCircle className="w-[2vmin] h-[2vmin] text-emerald-500" />
                    <h3 className="font-black text-[1.5vmin] text-emerald-500 uppercase tracking-widest">Chat</h3>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-[1.5vmin] space-y-[1vmin]">
                {state.chat_messages && state.chat_messages.length > 0 ? (
                    state.chat_messages.map((msg: any, idx: number) => (
                        <div
                            key={idx}
                            className={`${msg.is_system
                                ? "text-center text-[1vmin] text-white/40 italic"
                                : "flex flex-col gap-[0.2vmin]"
                                }`}
                        >
                            {!msg.is_system && (
                                <>
                                    <div className="flex items-center gap-[0.5vmin]">
                                        <span className="text-[1vmin] font-bold text-white/80">
                                            {state.players.find((p: any) => p.id === msg.sender_id)?.name || "Unknown"}
                                        </span>
                                        <span className="text-[0.8vmin] text-white/40">
                                            {new Date(msg.timestamp * 1000).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="bg-white/5 rounded-[1vmin] px-[1vmin] py-[0.5vmin] text-[1.2vmin]">
                                        {msg.text}
                                    </div>
                                </>
                            )}
                            {msg.is_system && <span>{msg.text}</span>}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-white/40 text-[1.2vmin] mt-[4vmin]">
                        No messages yet. Start chatting!
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-[1.5vmin] border-t border-white/10">
                <div className="flex gap-[1vmin]">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-[1vmin] px-[1vmin] py-[0.8vmin] text-[1.2vmin] focus:outline-none focus:border-white/30 transition-colors"
                        maxLength={200}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed px-[1.5vmin] py-[0.8vmin] rounded-[1vmin] transition-all"
                    >
                        <Send className="w-[1.5vmin] h-[1.5vmin]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
