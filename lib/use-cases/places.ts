import {
  getPlacesByTripId,
  getPlaceById,
  createPlace as dbCreatePlace,
  updatePlace as dbUpdatePlace,
  deletePlace as dbDeletePlace,
} from "@/lib/db/places";
import { getTripById } from "@/lib/db/trips";
import type { Place, PlaceInput } from "@/lib/types";

export function getPlaces(tripId: number): Place[] {
  return getPlacesByTripId(tripId);
}

export function getPlace(id: number): Place | undefined {
  return getPlaceById(id);
}

export function addPlace(
  tripId: number,
  input: Omit<PlaceInput, "trip_id">
): Place {
  const trip = getTripById(tripId);
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }

  return dbCreatePlace({
    ...input,
    trip_id: tripId,
  });
}

export function updatePlace(
  id: number,
  input: Partial<PlaceInput>
): Place | undefined {
  return dbUpdatePlace(id, input);
}

export function deletePlace(id: number): boolean {
  return dbDeletePlace(id);
}

export function reorderPlaces(tripId: number, placeIds: number[]): void {
  const trip = getTripById(tripId);
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }

  const places = getPlacesByTripId(tripId);
  const placeIdSet = new Set(places.map((p) => p.id));

  for (const id of placeIds) {
    if (!placeIdSet.has(id)) {
      throw new Error(`Place ${id} not in trip ${tripId}`);
    }
  }

  placeIds.forEach((placeId, index) => {
    dbUpdatePlace(placeId, { visit_order: index });
  });
}
