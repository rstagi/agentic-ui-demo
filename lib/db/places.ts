import { getDb } from "./index";
import type { Place, PlaceInput } from "../types";

export function getPlacesByTripId(tripId: number): Place[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM places WHERE trip_id = ? ORDER BY visit_order ASC, created_at ASC")
    .all(tripId) as Place[];
}

export function getPlaceById(id: number): Place | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM places WHERE id = ?").get(id) as Place | undefined;
}

export function createPlace(input: PlaceInput): Place {
  const db = getDb();
  const maxOrder = db
    .prepare("SELECT COALESCE(MAX(visit_order), -1) as max FROM places WHERE trip_id = ?")
    .get(input.trip_id) as { max: number };

  const stmt = db.prepare(`
    INSERT INTO places (trip_id, name, address, latitude, longitude, visit_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    input.trip_id,
    input.name,
    input.address,
    input.latitude,
    input.longitude,
    maxOrder.max + 1
  );
  return getPlaceById(result.lastInsertRowid as number)!;
}

export function updatePlace(id: number, input: Partial<PlaceInput>): Place | undefined {
  const db = getDb();
  const existing = getPlaceById(id);
  if (!existing) return undefined;

  const updated = { ...existing, ...input };

  db.prepare(`
    UPDATE places SET name = ?, address = ?, latitude = ?, longitude = ?, visit_order = ?
    WHERE id = ?
  `).run(
    updated.name,
    updated.address,
    updated.latitude,
    updated.longitude,
    updated.visit_order,
    id
  );
  return getPlaceById(id);
}

export function deletePlace(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM places WHERE id = ?").run(id);
  return result.changes > 0;
}
