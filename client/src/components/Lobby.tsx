"use client";

import React, { useState } from "react";
import { useGameState } from "@/context/GameStateContext";
import { Check, X } from "lucide-react";

const TOKENS = [
    { id: "cyber_car", name: "Cyber Car", emoji: "🏎️" },
    { id: "jet_stream", name: "Jet Stream", emoji: "✈️" },
    { id: "mecha_rex", name: "Mecha Rex", emoji: "🦖" },
    { id: "ufo", name: "UFO", emoji: "🛸" },
    { id: "catamaran", name: "Catamaran", emoji: "⛵" },
    { id: "rocket", name: "Rocket", emoji: "🚀" }
];

export default function Lobby() {
    const { state, socket, clearPlayer } = useGameState();
    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("ABCD");
    const [selectedToken, setSelectedToken] = useState("cyber_car");

    const me = state.players.find(p => p.id === socket?.id);
    const usedTokens = state.players.map(p => p.token_id);
    const allReady = state.players.length >= 2 && state.players.every((p: any) => p.ready);

    const joinGame = () => {
        if (!name || !socket || !socket.connected) {
            return;
        }
        socket.emit("join_room", {
            room_id: roomId,
            player_name: name,
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
            token_id: selectedToken
        });
    };

    const toggleReady = () => {
        if (!socket) return;
        socket.emit("toggle_ready", {});
    };

    const startGame = () => {
        if (!socket) return;
        socket.emit("start_game", {});
    };


    const leaveLobby = () => {
        if (!socket || !socket.id) return;

        // Clear player from local state immediately
        clearPlayer(socket.id);

        // Emit leave event
        socket.emit("leave_lobby", {});

        // Clear localStorage
        localStorage.removeItem("monopoly_room_id");
        localStorage.removeItem("monopoly_player_id");
        localStorage.removeItem("monopoly_player_name");
        localStorage.removeItem("monopoly_player_color");
        localStorage.removeItem("monopoly_token_id");

        // Reset local state
        setName("");
        setRoomId("ABCD");
    };


    if (!me) {
        return (
            <div className="glass p-12 rounded-3xl flex flex-col items-center gap-6 max-w-md w-full shadow-2xl">
                <h1 className="text-4xl font-black italic tracking-tighter text-white">MEGA-POLY</h1>
                <p className="text-white/60 mb-4">60-Space World Tour Edition</p>

                <div className="w-full flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Enter Your Name"
                        className="bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-white/30 transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Room Code"
                        className="bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-white/30 transition-all uppercase font-mono tracking-widest"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                        maxLength={4}
                    />

                    {/* Token Selection */}
                    <div className="w-full">
                        <p className="text-white/60 text-sm mb-2">Select Token</p>
                        <div className="grid grid-cols-3 gap-2">
                            {TOKENS.map(token => (
                                <button
                                    key={token.id}
                                    onClick={() => setSelectedToken(token.id)}
                                    disabled={usedTokens.includes(token.id)}
                                    className={`p-3 rounded-lg border transition-all ${selectedToken === token.id
                                        ? "border-blue-500 bg-blue-500/20"
                                        : usedTokens.includes(token.id)
                                            ? "border-white/10 bg-white/5 opacity-30 cursor-not-allowed"
                                            : "border-white/10 bg-white/5 hover:border-white/30"
                                        }`}
                                >
                                    <div className="text-2xl">{token.emoji}</div>
                                    <div className="text-xs text-white/60 mt-1">{token.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={joinGame}
                    disabled={!name.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                    JOIN LOBBY
                </button>
            </div>
        );
    }

    return (
        <div className="glass p-12 rounded-3xl flex flex-col items-center gap-6 max-w-2xl w-full shadow-2xl">
            <div className="w-full flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white">LOBBY</h1>
                    <p className="text-white/60">Room: <span className="font-mono font-bold">{state.room_id}</span></p>
                </div>
                <button
                    onClick={leaveLobby}
                    className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg transition-all text-sm font-bold"
                >
                    LEAVE
                </button>
            </div>

            {/* Players List */}
            <div className="w-full">
                <p className="text-white/40 text-sm mb-3">Players ({state.players.length}/6)</p>
                <div className="grid grid-cols-2 gap-3">
                    {state.players.map((p: any) => (
                        <div key={p.id} className="glass px-4 py-3 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                <div>
                                    <div className="font-bold">{p.name}</div>
                                    <div className="text-xs text-white/40">
                                        {TOKENS.find(t => t.id === p.token_id)?.emoji} {TOKENS.find(t => t.id === p.token_id)?.name}
                                    </div>
                                </div>
                            </div>
                            {p.ready ? (
                                <Check className="w-5 h-5 text-green-400" />
                            ) : (
                                <X className="w-5 h-5 text-white/20" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Ready Button */}
            <button
                onClick={toggleReady}
                className={`w-full font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg ${me.ready
                    ? "bg-green-600 hover:bg-green-500 shadow-green-500/20"
                    : "bg-white/10 hover:bg-white/20"
                    }`}
            >
                {me.ready ? "✓ READY" : "READY UP"}
            </button>

            {/* Start Game (Host Only) */}
            {state.players[0]?.id === socket?.id && (
                <button
                    onClick={startGame}
                    disabled={!allReady}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                    {allReady ? "START GAME" : `WAITING FOR PLAYERS (${state.players.filter((p: any) => p.ready).length}/${state.players.length} ready)`}
                </button>
            )}

            {state.players.length < 2 && (
                <p className="text-white/40 text-sm">Waiting for at least 2 players...</p>
            )}
        </div>
    );
}
