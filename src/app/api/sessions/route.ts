import { NextRequest, NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, userId, winner, date, players } = body;

    if (!gameId || !userId || !players) {
      return NextResponse.json(
        { error: "Missing required fields: gameId, userId, players" },
        { status: 400 },
      );
    }

    // Convert date or default to now
    const sessionDate = date ? new Date(date) : new Date();

    // Create session AND update lastPlayed in one transaction
    const [session, updatedGame] = await prisma.$transaction([
      prisma.session.create({
        data: {
          gameId,
          userId,
          winner,
          date: sessionDate,
          players,
        },
      }),
      prisma.game.update({
        where: { id: gameId },
        data: { lastPlayed: sessionDate },
      }),
    ]);

    return NextResponse.json(session);
  } catch (err) {
    console.error("Prisma error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const sessions = await prisma.session.findMany({
      where: { userId },
      include: { game: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
