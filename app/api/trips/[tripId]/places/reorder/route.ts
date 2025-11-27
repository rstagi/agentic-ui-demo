import { NextRequest, NextResponse } from "next/server";
import { reorderPlaces } from "@/lib/use-cases";

type Params = { params: Promise<{ tripId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const body = await request.json();
  const { placeIds } = body;

  if (!Array.isArray(placeIds)) {
    return NextResponse.json(
      { error: "placeIds must be an array" },
      { status: 400 }
    );
  }

  try {
    reorderPlaces(id, placeIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
