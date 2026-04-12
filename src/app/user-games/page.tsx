"use client";

import { useEffect, useState } from "react";

type Game = {
  id: string;
  game: {
    name: string;
  };
  lastPlayed?: string | null;
};

export default function UserGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch("/api/user-games?userId=1");

        if (!res.ok) {
          throw new Error("Failed to fetch games");
        }

        const data = await res.json();
        setGames(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  if (loading) return <p>Loading games...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: 16 }}>
      <header style={{ marginBottom: 16 }}>
        <h1>My Games</h1>
      </header>

      <main>
        {games.length === 0 ? (
          <p>No games yet.</p>
        ) : (
          <ul>
            {games.map((game) => (
              <li key={game.id}>
                <strong>{game.game.name}</strong>
                <div>
                  Last played:{" "}
                  {game.lastPlayed
                    ? new Date(game.lastPlayed).toLocaleDateString()
                    : "Never"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
