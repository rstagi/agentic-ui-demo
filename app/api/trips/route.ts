import { NextRequest, NextResponse } from "next/server";
import { getAllTrips, createTrip } from "@/lib/db/trips";

export async function GET() {
  const trips = getAllTrips();
  return NextResponse.json(trips);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const trip = createTrip({ name, description: description || null });
  return NextResponse.json(trip, { status: 201 });
}
