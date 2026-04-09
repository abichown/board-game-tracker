import { NextRequest, NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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

    // Stats
    const totalPlays = sessions.reduce(
      (acc, session) => {
        acc[session.game.name] = (acc[session.game.name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const wins = sessions.reduce(
      (acc, session) => {
        if (session.winner) {
          acc[session.winner] = (acc[session.winner] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({ sessions, totalPlays, wins });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
