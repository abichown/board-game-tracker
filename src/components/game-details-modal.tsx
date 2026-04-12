"use client";

import { UserGame } from "@/generated/prisma/browser";
import { useEffect } from "react";
import type { UserGameUI } from "@/types/user-game";

type GameDetailsModalProps = {
  game: UserGameUI | null;
  onClose: () => void;
};

export default function GameDetailsModal({
  game,
  onClose,
}: GameDetailsModalProps) {
  useEffect(() => {
    if (!game) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [game, onClose]);

  if (!game) return null;

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">{game.boardGame.name}</h2>

          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* Collection Info */}
        <div className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold text-gray-600">Collection</h3>

          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <span className="font-medium">Source:</span> {game.source ?? "—"}
            </p>
            <p>
              <span className="font-medium">Acquired:</span>{" "}
              {formatDate(game.acquiredAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold text-gray-600">Stats</h3>

          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <span className="font-medium">Plays:</span> {game.plays ?? 0}
            </p>
            <p>
              <span className="font-medium">Last played:</span>{" "}
              {formatDate(game.lastPlayedAt)}
            </p>
          </div>
        </div>

        {/* Rating (UI placeholder) */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-600">Rating</h3>

          <div className="mt-1 flex gap-1 text-gray-300">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
