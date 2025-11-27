import { Client } from "@googlemaps/google-maps-services-js";
import type { PlaceSearchResult } from "@/lib/types";

const googleMapsClient = new Client({});

export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key not configured");
  }

  const response = await googleMapsClient.textSearch({
    params: {
      query: query.trim(),
      key: apiKey,
    },
  });

  return (response.data.results || []).slice(0, 8).map((place) => ({
    place_id: place.place_id || "",
    name: place.name || "",
    address: place.formatted_address || "",
    latitude: place.geometry?.location?.lat || 0,
    longitude: place.geometry?.location?.lng || 0,
  }));
}
