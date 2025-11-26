import { NextRequest, NextResponse } from "next/server";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await client.textSearch({
      params: {
        query: query.trim(),
        key: apiKey,
      },
    });

    const results = (response.data.results || []).slice(0, 8).map((place) => ({
      place_id: place.place_id || "",
      name: place.name || "",
      address: place.formatted_address || "",
      latitude: place.geometry?.location?.lat || 0,
      longitude: place.geometry?.location?.lng || 0,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Google Places search error:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}
