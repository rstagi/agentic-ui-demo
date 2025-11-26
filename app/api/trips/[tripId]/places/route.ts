import { NextRequest, NextResponse } from "next/server";
import { getPlacesByTripId, createPlace } from "@/lib/db/places";
import { getTripById } from "@/lib/db/trips";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const trip = getTripById(id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const places = getPlacesByTripId(id);
  return NextResponse.json(places);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const trip = getTripById(id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, address, latitude, longitude } = body;

  if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "Name, latitude, and longitude are required" },
      { status: 400 }
    );
  }

  const place = createPlace({
    trip_id: id,
    name,
    address: address || null,
    latitude,
    longitude,
    visit_order: 0,
  });
  return NextResponse.json(place, { status: 201 });
}
