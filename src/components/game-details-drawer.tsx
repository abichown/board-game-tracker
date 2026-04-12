"use client";

import { useEffect } from "react";
import type { UserGameUI } from "@/types/user-game";

type Props = {
  game: UserGameUI | null;
  onClose: () => void;
};

export default function GameDetailsDrawer({ game, onClose }: Props) {
  useEffect(() => {
    if (!game) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [game, onClose]);

  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-md bg-slate-900 text-slate-100 shadow-2xl p-6 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{game.boardGame.name}</h2>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Collection */}
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            Collection
          </h3>

          <div className="text-sm space-y-1">
            <p>
              <span className="text-slate-400">Source:</span>{" "}
              {game.source ?? "—"}
            </p>
            <p>
              <span className="text-slate-400">Acquired:</span>{" "}
              {game.acquiredAt
                ? new Date(game.acquiredAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            Stats
          </h3>

          <div className="text-sm space-y-1">
            <p>
              <span className="text-slate-400">Plays:</span>{" "}
              {game.plays ?? game.sessions.length}
            </p>
            <p>
              <span className="text-slate-400">Last played:</span>{" "}
              {game.lastPlayedAt
                ? new Date(game.lastPlayedAt).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        </div>

        {/* Rating placeholder */}
        <div>
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            Rating
          </h3>

          <div className="flex gap-1 text-slate-600">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
