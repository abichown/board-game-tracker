import { NextRequest, NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ownerId, source } = body;

    if (!name || !ownerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const game = await prisma.game.create({
      data: {
        name,
        ownerId,
        source,
      },
    });

    return NextResponse.json(game);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 },
    );
  }
}
