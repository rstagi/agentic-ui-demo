import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/use-cases";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchPlaces(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Google Places search error:", error);
    const message = error instanceof Error ? error.message : "Failed to search places";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
