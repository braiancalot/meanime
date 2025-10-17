import { NextResponse } from "next/server";

import animeService from "@/lib/services/animeService";

export async function GET() {
  try {
    const randomAnime = await animeService.getRandom();
    return NextResponse.json(randomAnime);
  } catch (error) {
    console.error("Error getting random anime:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
