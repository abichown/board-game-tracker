import { NextRequest, NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const validRelationships = ["OWNED", "PLAYED_ELSEWHERE", "WISHLIST"] as const;

type Relationship = (typeof validRelationships)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      gameId,
      relationship,
      lastPlayedAt,
      source,
      acquiredAt,
      game,
    } = body;

    if (!userId || !gameId || !relationship) {
      return NextResponse.json(
        { error: "Missing required fields: userId, gameId, relationship" },
        { status: 400 },
      );
    }

    if (!validRelationships.includes(relationship)) {
      return NextResponse.json(
        {
          error:
            "relationship must be one of OWNED, PLAYED_ELSEWHERE, WISHLIST",
        },
        { status: 400 },
      );
    }

    let existingGame = await prisma.game.findUnique({ where: { id: gameId } });

    if (!existingGame) {
      if (!game?.name) {
        return NextResponse.json(
          {
            error:
              "Game not found in database. Include game.name to create a new Game record.",
          },
          { status: 400 },
        );
      }

      existingGame = await prisma.game.create({
        data: {
          id: gameId,
          name: game.name,
          imageUrl: game.imageUrl,
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          playTime: game.playTime,
        },
      });
    }

    const userGame = await prisma.userGame.create({
      data: {
        userId,
        gameId,
        relationship: relationship as Relationship,
        lastPlayedAt: lastPlayedAt ? new Date(lastPlayedAt) : undefined,
        source,
        acquiredAt: acquiredAt ? new Date(acquiredAt) : undefined,
      },
    });

    return NextResponse.json(userGame, { status: 201 });
  } catch (error) {
    console.error(error);

    if ((error as any)?.code === "P2002") {
      return NextResponse.json(
        { error: "This game is already in the user library." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || "Failed to add game to library." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 },
      );
    }

    const userGames = await prisma.userGame.findMany({
      where: { userId },
      include: { game: true },
      orderBy: { lastPlayedAt: "desc" },
    });

    return NextResponse.json(userGames);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch user games." },
      { status: 500 },
    );
  }
}
