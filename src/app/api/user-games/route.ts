import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

const validRelationships = ["OWNED", "PLAYED_ELSEWHERE", "WISHLIST"] as const;

type Relationship = (typeof validRelationships)[number];

//
// ======================
// POST - Add user game
// ======================
//
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId, boardGameId, relationship, source, acquiredAt } = body;

    if (!userId || !boardGameId || !relationship) {
      return NextResponse.json(
        { error: "Missing required fields: userId, boardGameId, relationship" },
        { status: 400 },
      );
    }

    if (!validRelationships.includes(relationship)) {
      return NextResponse.json(
        {
          error: "relationship must be OWNED, PLAYED_ELSEWHERE, or WISHLIST",
        },
        { status: 400 },
      );
    }

    const userGame = await prisma.userGame.create({
      data: {
        userId,
        boardGameId: Number(boardGameId),
        relationship: relationship as Relationship,
        source,
        acquiredAt: acquiredAt ? new Date(acquiredAt) : null,
      },
      include: {
        boardGame: true,
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
      { error: "Failed to add game to library." },
      { status: 500 },
    );
  }
}

//
// ======================
// GET - Fetch user games
// ======================
//
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
      include: {
        boardGame: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(userGames);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch user games." },
      { status: 500 },
    );
  }
}
