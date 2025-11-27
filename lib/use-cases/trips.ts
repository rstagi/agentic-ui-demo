import {
  getAllTrips,
  getTripById,
  createTrip as dbCreateTrip,
  updateTrip as dbUpdateTrip,
  deleteTrip as dbDeleteTrip,
} from "@/lib/db/trips";
import type { Trip, TripInput } from "@/lib/types";

export function listTrips(): Trip[] {
  return getAllTrips();
}

export function getTrip(id: number): Trip | undefined {
  return getTripById(id);
}

export function createTrip(input: TripInput): Trip {
  return dbCreateTrip(input);
}

export function updateTrip(
  id: number,
  input: Partial<TripInput>
): Trip | undefined {
  return dbUpdateTrip(id, input);
}

export function deleteTrip(id: number): boolean {
  return dbDeleteTrip(id);
}
