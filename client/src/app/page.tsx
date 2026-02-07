"use client";

import { GameStateProvider, useGameState } from "@/context/GameStateContext";
import { AudioProvider } from "@/components/AudioManager";
import GameBoard from "@/components/GameBoard";
import Lobby from "@/components/Lobby";
import AuctionOverlay from "@/components/AuctionOverlay";
import Logs from "@/components/Logs";
import ChatPanel from "@/components/ChatPanel";

import BankruptcyModal from "@/components/BankruptcyModal";
import GameInfo from "@/components/GameInfo";
import GameOverModal from "@/components/GameOverModal";
import PlayerPortfolio from "@/components/PlayerPortfolio";
import TradeNotification from "@/components/TradeNotification";

function GameContent() {
  const { state } = useGameState();

  if (state.game_status === "LOBBY") {
    return <Lobby />;
  }

  return (
    <>
      <GameInfo />
      <GameBoard />
      <AuctionOverlay />
      <BankruptcyModal />
      <GameOverModal />
      <PlayerPortfolio />
      <TradeNotification />
      <Logs />
      <ChatPanel />
    </>
  );
}

export default function Home() {
  return (
    <GameStateProvider>
      <AudioProvider>
        <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
          <GameContent />
        </main>
      </AudioProvider>
    </GameStateProvider>
  );
}
