import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

//
// ======================
// POST - Create session
// ======================
//
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userGameId, players, date } = body;

    if (!userId || !userGameId || !players || !Array.isArray(players)) {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, userGameId, players (array)",
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

    const session = await prisma.session.create({
      data: {
        userId,
        userGameId,
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
      include: {
        userGame: {
          include: {
            boardGame: true,
          },
        },
        players: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create session." },
      { status: 500 },
    );
  }
}

//
// ======================
// GET - Fetch sessions
// ======================
//
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const userGameId = req.nextUrl.searchParams.get("userGameId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 },
      );
    }

    const where: { userId: string; userGameId?: string } = { userId };

    if (userGameId) {
      where.userGameId = userGameId;
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        userGame: {
          include: {
            boardGame: true,
          },
        },
        players: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch sessions." },
      { status: 500 },
    );
  }
}
