"use client";

import { useEffect, useState } from "react";
import Card from "@/components/card";
import Button from "@/components/button";
import PageHeader from "@/components/page-header";
import { useToast } from "@/components/toast/toast-provider";
import GameDetailsDrawer from "@/components/game-details-drawer";
import type { UserGameUI } from "@/types/user-game";

const headingStyle = {
  fontFamily: "var(--font-geist-sans)",
  fontWeight: 700,
  color: "#f9fafb",
};

const subheadingStyle = {
  fontFamily: "var(--font-geist-sans)",
  fontWeight: 600,
  color: "#f9fafb",
};

const labelStyle = {
  color: "#94a3b8",
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  margin: "10px 0 2px",
};

const valueStyle = {
  color: "#e2e8f0",
  fontWeight: 400,
  margin: "0 0 6px",
};

type UserGame = {
  id: string;
  relationship: string;
  source?: string | null;
  acquiredAt?: string | null;
  boardGame: {
    name: string;
  };
  sessions: {
    id: string;
    date: string;
  }[];
};

const textStyle = {
  color: "#cbd5e1",
  margin: "4px 0",
};

export default function UserGamesPage() {
  const [games, setGames] = useState<UserGameUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGameId, setLoadingGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<UserGameUI | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/user-games?userId=1")
      .then((r) => r.json())
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  async function logSession(userGameId: string) {
    try {
      setLoadingGameId(userGameId);

      await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "1",
          userGameId,
          players: [{ name: "Abi", isWinner: true }],
        }),
      });

      showToast("Session logged successfully", "success");

      // Optional: refresh UI so plays + last played update immediately
      const res = await fetch("/api/user-games?userId=1");
      const updated = await res.json();
      setGames(updated);
    } catch (err) {
      showToast("Failed to log session", "error");
    } finally {
      setLoadingGameId(null);
    }
  }

  if (loading) return <p style={{ color: "#cbd5e1" }}>Loading...</p>;

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <PageHeader title="My Games" subtitle="Your board game collection" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {games.map((game) => {
          const totalPlays = game.sessions.length;

          const lastPlayed =
            game.sessions.length > 0
              ? new Date(
                  Math.max(
                    ...game.sessions.map((s) => new Date(s.date).getTime()),
                  ),
                )
              : null;

          const isLoading = loadingGameId === game.id;

          return (
            <Card key={game.id}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <h3
                  style={{
                    ...subheadingStyle,
                    fontSize: 18,
                    margin: "0 0 12px",
                  }}
                >
                  {game.boardGame.name}
                </h3>

                <div>
                  <div style={labelStyle}>Plays</div>
                  <div style={valueStyle}>{totalPlays}</div>

                  <div style={labelStyle}>Last Played</div>
                  <div style={valueStyle}>
                    {lastPlayed ? lastPlayed.toLocaleDateString() : "Never"}
                  </div>

                  {/* {game.source && (
                    <>
                      <div style={labelStyle}>Source</div>
                      <div style={valueStyle}>{game.source}</div>
                    </>
                  )}

                  {game.acquiredAt && (
                    <>
                      <div style={labelStyle}>Acquired</div>
                      <div style={valueStyle}>
                        {new Date(game.acquiredAt).toLocaleDateString()}
                      </div>
                    </>
                  )} */}
                </div>

                <div style={{ flexGrow: 1 }} />

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Button
                    onClick={() =>
                      setSelectedGame({
                        ...game,
                        plays: totalPlays,
                        lastPlayedAt: lastPlayed
                          ? lastPlayed.toISOString()
                          : null,
                      })
                    }
                    variant="secondary"
                  >
                    View details
                  </Button>

                  <Button
                    onClick={() => logSession(game.id)}
                    isLoading={isLoading}
                  >
                    Log Session
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <GameDetailsDrawer
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  );
}
