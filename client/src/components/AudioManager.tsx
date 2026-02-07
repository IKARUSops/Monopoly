"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

const SOUNDS = {
    roll_dice: "/assets/audio/roll_dice.mp3",
    token_slide: "/assets/audio/token_slide.mp3",
    cash_register: "/assets/audio/cash_register.mp3",
    buy_property: "/assets/audio/buy_property.mp3",
    payment: "/assets/audio/payment.mp3",
    jail_slam: "/assets/audio/jail_slam.mp3",
    fanfare: "/assets/audio/fanfare.mp3",
    bankruptcy: "/assets/audio/bankruptcy.mp3",
    notification: "/assets/audio/notification.mp3",
};

const BGM_PATH = "/assets/audio/bgm_cityscape.mp3";

interface AudioContextType {
    play: (sound: keyof typeof SOUNDS) => void;
    toggleBGM: () => void;
    toggleMute: () => void;
    isMuted: boolean;
    bgmEnabled: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [bgmEnabled, setBgmEnabled] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Initialize Audio objects only on client side
        if (typeof window !== "undefined") {
            Object.entries(SOUNDS).forEach(([key, src]) => {
                const audio = new Audio(src);
                audio.volume = 0.5;
                audioRef.current[key] = audio;
            });

            const bgm = new Audio(BGM_PATH);
            bgm.loop = true;
            bgm.volume = 0.2;
            bgmRef.current = bgm;
            setLoaded(true);
        }

        return () => {
            Object.values(audioRef.current).forEach(audio => {
                audio.pause();
                audio.src = "";
            });
            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.src = "";
            }
        };
    }, []);

    const play = (sound: keyof typeof SOUNDS) => {
        if (isMuted || !loaded) return;

        const audio = audioRef.current[sound];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(err => console.log("Audio play failed:", err));
        }
    };

    const toggleBGM = () => {
        if (!bgmRef.current || !loaded) return;

        if (bgmEnabled) {
            bgmRef.current.pause();
            setBgmEnabled(false);
        } else {
            bgmRef.current.play().catch(err => console.log("BGM play failed:", err));
            setBgmEnabled(true);
        }
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        if (bgmRef.current) {
            bgmRef.current.muted = newMuted;
        }
        Object.values(audioRef.current).forEach(audio => {
            audio.muted = newMuted;
        });
    };

    return (
        <AudioContext.Provider value={{ play, toggleBGM, toggleMute, isMuted, bgmEnabled }}>
            <div className="fixed top-4 left-4 flex gap-2 z-50">
                <button
                    onClick={toggleMute}
                    className="glass w-10 h-10 flex items-center justify-center rounded-lg border border-white/20 hover:border-white/40 transition-all text-xl"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? "🔇" : "🔊"}
                </button>
                <button
                    onClick={toggleBGM}
                    className="glass w-10 h-10 flex items-center justify-center rounded-lg border border-white/20 hover:border-white/40 transition-all text-xl"
                    title={bgmEnabled ? "Stop Music" : "Play Music"}
                >
                    {bgmEnabled ? "🎵" : "🎶"}
                </button>
            </div>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error("useAudio must be used within an AudioProvider");
    }
    return context;
}
