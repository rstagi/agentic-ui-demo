import { NextRequest, NextResponse } from "next/server";
import { getTrip, getPlaces, addPlace } from "@/lib/use-cases";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const trip = getTrip(id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const places = getPlaces(id);
  return NextResponse.json(places);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const body = await request.json();
  const { name, address, latitude, longitude } = body;

  if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "Name, latitude, and longitude are required" },
      { status: 400 }
    );
  }

  try {
    const place = addPlace(id, {
      name,
      address: address || null,
      latitude,
      longitude,
    });
    return NextResponse.json(place, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
