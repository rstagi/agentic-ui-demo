export interface Trip {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Place {
  id: number;
  trip_id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  visit_order: number;
  created_at: string;
}

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export type TripInput = Omit<Trip, "id" | "created_at">;
export type PlaceInput = Omit<Place, "id" | "created_at" | "visit_order"> & { visit_order?: number };
