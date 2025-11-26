import { NextRequest, NextResponse } from "next/server";
import { getPlaceById, updatePlace, deletePlace } from "@/lib/db/places";

type Params = { params: Promise<{ tripId: string; placeId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { placeId } = await params;
  const id = parseInt(placeId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid place ID" }, { status: 400 });
  }

  const place = getPlaceById(id);
  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }
  return NextResponse.json(place);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { placeId } = await params;
  const id = parseInt(placeId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid place ID" }, { status: 400 });
  }

  const body = await request.json();
  const place = updatePlace(id, body);
  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }
  return NextResponse.json(place);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { placeId } = await params;
  const id = parseInt(placeId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid place ID" }, { status: 400 });
  }

  const deleted = deletePlace(id);
  if (!deleted) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
