import { NextRequest, NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, gameId, players, date } = body;

    if (!userId || !gameId || !players || !Array.isArray(players)) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId, gameId, players (array of player objects with name and isWinner)",
        },
        { status: 400 },
      );
    }

    if (players.length === 0) {
      return NextResponse.json(
        { error: "players array must contain at least one player" },
        { status: 400 },
      );
    }

    const sessionDate = date ? new Date(date) : new Date();

    // Create session and session players in a transaction
    const session = await prisma.session.create({
      data: {
        userId,
        gameId,
        date: sessionDate,
        players: {
          create: players.map(
            (player: { name: string; isWinner?: boolean }) => ({
              name: player.name,
              isWinner: player.isWinner ?? false,
            }),
          ),
        },
      },
      include: { players: true },
    });

    // Update lastPlayedAt in UserGame
    await prisma.userGame.updateMany({
      where: { userId, gameId },
      data: { lastPlayedAt: sessionDate },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create session." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const gameId = req.nextUrl.searchParams.get("gameId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 },
      );
    }

    const where: { userId: string; gameId?: string } = { userId };
    if (gameId) {
      where.gameId = gameId;
    }

    const sessions = await prisma.session.findMany({
      where,
      include: { game: true, players: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch sessions." },
      { status: 500 },
    );
  }
}
