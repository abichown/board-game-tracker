import { NextRequest, NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 },
      );
    }

    // Get all sessions for this user
    const sessions = await prisma.session.findMany({
      where: { userId },
      include: { game: true, players: true },
    });

    if (sessions.length === 0) {
      return NextResponse.json({
        userId,
        totalPlaysPerGame: {},
        winsPerPlayer: {},
        totalSessions: 0,
      });
    }

    // Aggregate plays per game
    const totalPlaysPerGame: Record<string, number> = {};
    sessions.forEach((session) => {
      const gameName = session.game.name;
      totalPlaysPerGame[gameName] = (totalPlaysPerGame[gameName] || 0) + 1;
    });

    // Aggregate wins per player
    const winsPerPlayer: Record<string, number> = {};
    sessions.forEach((session) => {
      session.players.forEach((player) => {
        if (player.isWinner) {
          winsPerPlayer[player.name] = (winsPerPlayer[player.name] || 0) + 1;
        }
      });
    });

    // Calculate win percentage per player (if they've played)
    const playerStats: Record<
      string,
      { wins: number; plays: number; winPercentage: number }
    > = {};

    sessions.forEach((session) => {
      session.players.forEach((player) => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = { wins: 0, plays: 0, winPercentage: 0 };
        }
        playerStats[player.name].plays += 1;
        if (player.isWinner) {
          playerStats[player.name].wins += 1;
        }
      });
    });

    // Calculate win percentages
    Object.keys(playerStats).forEach((playerName) => {
      const stats = playerStats[playerName];
      stats.winPercentage =
        stats.plays > 0 ? Math.round((stats.wins / stats.plays) * 100) : 0;
    });

    return NextResponse.json({
      userId,
      totalSessions: sessions.length,
      totalPlaysPerGame,
      winsPerPlayer,
      playerStats,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch stats." },
      { status: 500 },
    );
  }
}
