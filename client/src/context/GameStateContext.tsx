"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from "react";
import { io, Socket } from "socket.io-client";
import ToastContainer from "@/components/ToastContainer";

interface Toast {
    id: string;
    message: string;
    code: string;
    type?: "error" | "success" | "info";
}

export interface TradeOffer {
    id: string;
    proposer_id: string;
    target_player_id: string;
    offer_cash: number;
    offer_properties: number[];
    request_cash: number;
    request_properties: number[];
    status: "PENDING" | "ACCEPTED" | "REJECTED";
}

interface GameState {
    room_id: string;
    players: any[];
    board_state: Record<number, any>;
    current_turn_index: number;
    total_turns_played: number;
    dice_roll: number[];
    turn_phase: string;
    game_status: string;
    logs: string[];
    turn_end_timestamp: number | null;
    active_trade: TradeOffer | null;
    [key: string]: any;
}

type Action =
    | { type: "UPDATE_STATE"; payload: GameState }
    | { type: "CLEAR_PLAYER"; payload: string }
    | { type: "SET_SOCKET"; payload: Socket };

interface ContextProps {
    state: GameState;
    socket: Socket | null;
    dispatch: React.Dispatch<Action>;
    addToast: (message: string, code: string, type?: "error" | "success" | "info") => void;
    clearPlayer: (playerId: string) => void;
}

const initialState: GameState = {
    room_id: "",
    players: [],
    board_state: {},
    current_turn_index: 0,
    total_turns_played: 0,
    dice_roll: [1, 1],
    turn_phase: "LOBBY",
    game_status: "LOBBY",
    logs: [],
    turn_end_timestamp: null,
    active_trade: null,
};

const GameStateContext = createContext<ContextProps | undefined>(undefined);

const reducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case "UPDATE_STATE":
            return { ...state, ...action.payload };
        case "CLEAR_PLAYER":
            return {
                ...state,
                players: state.players.filter(p => p.id !== action.payload)
            };
        default:
            return state;
    }
};

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, code: string, type: "error" | "success" | "info" = "error") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, code, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearPlayer = (playerId: string) => {
        dispatch({ type: "CLEAR_PLAYER", payload: playerId });
    };

    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === "production" ? undefined : "http://localhost:8000";
        const newSocket = io(socketUrl, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            setSocket(newSocket);

            // Reconnection protocol: Check localStorage for existing session
            const savedRoomId = localStorage.getItem("monopoly_room_id");
            const savedPlayerId = localStorage.getItem("monopoly_player_id");

            if (savedRoomId && savedPlayerId) {
                console.log("Attempting reconnection...", { savedRoomId, savedPlayerId });
                newSocket.emit("join_room", {
                    room_id: savedRoomId,
                    existing_player_id: savedPlayerId,
                    player_name: localStorage.getItem("monopoly_player_name") || "Reconnected Player",
                    color: localStorage.getItem("monopoly_player_color") || "#FFFFFF",
                    token_id: localStorage.getItem("monopoly_token_id") || "cyber_car"
                });
                addToast("Reconnected to game", "RECONNECTION_SUCCESS", "success");
            }
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
            setSocket(null);
            addToast("Disconnected from server", "DISCONNECTED", "info");
        });

        newSocket.on("game_state_update", (data: GameState) => {
            console.log("Received game_state_update:", data);
            console.log("Players in update:", data.players);
            dispatch({ type: "UPDATE_STATE", payload: data });

            // Save session data to localStorage
            if (data.room_id) {
                localStorage.setItem("monopoly_room_id", data.room_id);
            }
        });

        newSocket.on("error", (err: any) => {
            console.error("Socket Error Raw:", err);
            const message = err?.message || "Unknown socket error";
            const code = err?.code || "UNKNOWN_ERROR";
            addToast(message, code, "error");
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Helper to save player info when joining
    useEffect(() => {
        if (socket && state.players.length > 0) {
            const currentPlayer = state.players.find((p: any) => p.id === socket.id);
            if (currentPlayer) {
                localStorage.setItem("monopoly_player_id", currentPlayer.id);
                localStorage.setItem("monopoly_player_name", currentPlayer.name);
                localStorage.setItem("monopoly_player_color", currentPlayer.color);
                localStorage.setItem("monopoly_token_id", currentPlayer.token_id);
            }
        }
    }, [socket, state.players]);

    return (
        <GameStateContext.Provider value={{ state, socket, dispatch, addToast, clearPlayer }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </GameStateContext.Provider>
    );
};

export const useGameState = () => {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error("useGameState must be used within a GameStateProvider");
    }
    return context;
};
