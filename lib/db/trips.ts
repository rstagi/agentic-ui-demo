import { getDb } from "./index";
import type { Trip, TripInput } from "../types";

export function getAllTrips(): Trip[] {
  const db = getDb();
  return db.prepare("SELECT * FROM trips ORDER BY created_at DESC").all() as Trip[];
}

export function getTripById(id: number): Trip | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM trips WHERE id = ?").get(id) as Trip | undefined;
}

export function createTrip(input: TripInput): Trip {
  const db = getDb();
  const stmt = db.prepare("INSERT INTO trips (name, description) VALUES (?, ?)");
  const result = stmt.run(input.name, input.description);
  return getTripById(result.lastInsertRowid as number)!;
}

export function updateTrip(id: number, input: Partial<TripInput>): Trip | undefined {
  const db = getDb();
  const existing = getTripById(id);
  if (!existing) return undefined;

  const name = input.name ?? existing.name;
  const description = input.description ?? existing.description;

  db.prepare("UPDATE trips SET name = ?, description = ? WHERE id = ?").run(
    name,
    description,
    id
  );
  return getTripById(id);
}

export function deleteTrip(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM trips WHERE id = ?").run(id);
  return result.changes > 0;
}
