import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getTripById } from "@/lib/db/trips";

type Params = { params: Promise<{ tripId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
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
  const { placeIds } = body;

  if (!Array.isArray(placeIds)) {
    return NextResponse.json(
      { error: "placeIds must be an array" },
      { status: 400 }
    );
  }

  const db = getDb();
  const updateStmt = db.prepare(
    "UPDATE places SET visit_order = ? WHERE id = ? AND trip_id = ?"
  );

  const updateMany = db.transaction((ids: number[]) => {
    ids.forEach((placeId, index) => {
      updateStmt.run(index, placeId, id);
    });
  });

  updateMany(placeIds);

  return NextResponse.json({ success: true });
}
