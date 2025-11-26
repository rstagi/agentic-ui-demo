import { NextRequest, NextResponse } from "next/server";
import { getTripById, updateTrip, deleteTrip } from "@/lib/db/trips";

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
  return NextResponse.json(trip);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const body = await request.json();
  const trip = updateTrip(id, body);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  return NextResponse.json(trip);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const deleted = deleteTrip(id);
  if (!deleted) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
