import { z } from "zod";
import { createTrip, getTripById, getAllTrips, updateTrip, deleteTrip } from "@/lib/db/trips";
import { getPlacesByTripId, createPlace, deletePlace, updatePlace } from "@/lib/db/places";
import { createMapUIResource, createSearchResultsUIResource } from "./ui-resources";
import { Client } from "@googlemaps/google-maps-services-js";

export const addTripSchema = z.object({
  name: z.string().describe("Name of the trip"),
  description: z.string().optional().describe("Optional description"),
});

export const getTripSchema = z.object({
  tripId: z.number().describe("ID of the trip to retrieve"),
});

export const getTripsSchema = z.object({});

export const editTripSchema = z.object({
  tripId: z.number().describe("ID of the trip to edit"),
  name: z.string().optional().describe("New name"),
  description: z.string().optional().describe("New description"),
});

export const deleteTripSchema = z.object({
  tripId: z.number().describe("ID of the trip to delete"),
});

export const addPlaceSchema = z.object({
  tripId: z.number().describe("ID of the trip to add place to"),
  name: z.string().describe("Name of the place"),
  address: z.string().optional().describe("Address of the place"),
  latitude: z.number().describe("Latitude coordinate"),
  longitude: z.number().describe("Longitude coordinate"),
});

export const deletePlaceSchema = z.object({
  placeId: z.number().describe("ID of the place to delete"),
});

export const reorderPlacesSchema = z.object({
  tripId: z.number().describe("ID of the trip"),
  placeIds: z.array(z.number()).describe("Ordered array of place IDs"),
});

export const searchPlacesSchema = z.object({
  query: z.string().describe("Search query (e.g. 'coffee shops in Paris')"),
});

export const getPlacesSchema = z.object({
  tripId: z.number().describe("ID of the trip"),
});

export async function handleAddTrip(args: z.infer<typeof addTripSchema>) {
  const trip = createTrip({
    name: args.name,
    description: args.description ?? null,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: `Created trip "${trip.name}" (ID: ${trip.id})`,
      },
    ],
  };
}

export async function handleGetTrip(args: z.infer<typeof getTripSchema>) {
  const trip = getTripById(args.tripId);
  if (!trip) {
    return {
      content: [{ type: "text" as const, text: `Trip ${args.tripId} not found` }],
      isError: true,
    };
  }

  const places = getPlacesByTripId(trip.id);
  const mapResource = createMapUIResource(trip, places);

  return {
    content: [
      {
        type: "text" as const,
        text: `Trip: ${trip.name}${trip.description ? ` - ${trip.description}` : ""}\nPlaces: ${places.length}`,
      },
      mapResource,
    ],
  };
}

export async function handleGetTrips() {
  const trips = getAllTrips();

  if (trips.length === 0) {
    return {
      content: [{ type: "text" as const, text: "No trips found" }],
    };
  }

  const tripList = trips.map(t => `- ${t.name} (ID: ${t.id})`).join("\n");
  return {
    content: [
      {
        type: "text" as const,
        text: `Found ${trips.length} trips:\n${tripList}`,
      },
    ],
  };
}

export async function handleEditTrip(args: z.infer<typeof editTripSchema>) {
  const trip = updateTrip(args.tripId, {
    name: args.name ?? undefined,
    description: args.description ?? undefined,
  });

  if (!trip) {
    return {
      content: [{ type: "text" as const, text: `Trip ${args.tripId} not found` }],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: `Updated trip "${trip.name}" (ID: ${trip.id})`,
      },
    ],
  };
}

export async function handleDeleteTrip(args: z.infer<typeof deleteTripSchema>) {
  const success = deleteTrip(args.tripId);

  if (!success) {
    return {
      content: [{ type: "text" as const, text: `Trip ${args.tripId} not found` }],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: `Deleted trip ${args.tripId}`,
      },
    ],
  };
}

export async function handleAddPlace(args: z.infer<typeof addPlaceSchema>) {
  const trip = getTripById(args.tripId);
  if (!trip) {
    return {
      content: [{ type: "text" as const, text: `Trip ${args.tripId} not found` }],
      isError: true,
    };
  }

  const place = createPlace({
    trip_id: args.tripId,
    name: args.name,
    address: args.address ?? null,
    latitude: args.latitude,
    longitude: args.longitude,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: `Added "${place.name}" to trip "${trip.name}" (Place ID: ${place.id})`,
      },
    ],
  };
}

export async function handleDeletePlace(args: z.infer<typeof deletePlaceSchema>) {
  const success = deletePlace(args.placeId);

  if (!success) {
    return {
      content: [{ type: "text" as const, text: `Place ${args.placeId} not found` }],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: `Deleted place ${args.placeId}`,
      },
    ],
  };
}

export async function handleReorderPlaces(args: z.infer<typeof reorderPlacesSchema>) {
  const trip = getTripById(args.tripId);
  if (!trip) {
    return {
      content: [{ type: "text" as const, text: `Trip ${args.tripId} not found` }],
      isError: true,
    };
  }

  const places = getPlacesByTripId(args.tripId);
  const placeIdSet = new Set(places.map(p => p.id));

  for (const id of args.placeIds) {
    if (!placeIdSet.has(id)) {
      return {
        content: [{ type: "text" as const, text: `Place ${id} not in trip ${args.tripId}` }],
        isError: true,
      };
    }
  }

  args.placeIds.forEach((placeId, index) => {
    updatePlace(placeId, { visit_order: index });
  });

  return {
    content: [
      {
        type: "text" as const,
        text: `Reordered ${args.placeIds.length} places in trip "${trip.name}"`,
      },
    ],
  };
}

const googleMapsClient = new Client({});

export async function handleSearchPlaces(args: z.infer<typeof searchPlacesSchema>) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return {
      content: [{ type: "text" as const, text: "Google Maps API key not configured" }],
      isError: true,
    };
  }

  try {
    const response = await googleMapsClient.textSearch({
      params: {
        query: args.query.trim(),
        key: apiKey,
      },
    });

    const results = (response.data.results || []).slice(0, 8).map((place) => ({
      place_id: place.place_id || "",
      name: place.name || "",
      address: place.formatted_address || "",
      latitude: place.geometry?.location?.lat || 0,
      longitude: place.geometry?.location?.lng || 0,
    }));

    if (results.length === 0) {
      return {
        content: [{ type: "text" as const, text: `No results found for "${args.query}"` }],
      };
    }

    const resultList = results.map((r, i) =>
      `${i + 1}. ${r.name} - ${r.address} (${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)})`
    ).join("\n");

    const uiResource = createSearchResultsUIResource(args.query, results);

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${results.length} results for "${args.query}":\n${resultList}`,
        },
        uiResource,
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: "Failed to search places" }],
      isError: true,
    };
  }
}

export async function handleGetPlaces(args: z.infer<typeof getPlacesSchema>) {
  const trip = getTripById(args.tripId);
  if (!trip) {
    return {
      content: [{ type: "text" as const, text: `Trip ${args.tripId} not found` }],
      isError: true,
    };
  }

  const places = getPlacesByTripId(args.tripId);

  if (places.length === 0) {
    return {
      content: [{ type: "text" as const, text: `No places in trip "${trip.name}"` }],
    };
  }

  const placeList = places.map((p, i) =>
    `${i + 1}. ${p.name}${p.address ? ` - ${p.address}` : ""} (ID: ${p.id})`
  ).join("\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Places in "${trip.name}":\n${placeList}`,
      },
    ],
  };
}

export const tools = [
  {
    name: "add_trip",
    description: "Create a new trip. Returns the created trip ID.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the trip" },
        description: { type: "string", description: "Optional description" },
      },
      required: ["name"],
    },
  },
  {
    name: "get_trip",
    description: "Get details of a trip including its places. Returns a map UI showing the itinerary.",
    inputSchema: {
      type: "object",
      properties: {
        tripId: { type: "number", description: "ID of the trip to retrieve" },
      },
      required: ["tripId"],
    },
  },
  {
    name: "get_trips",
    description: "List all available trips with their IDs and names.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "edit_trip",
    description: "Update a trip's name or description.",
    inputSchema: {
      type: "object",
      properties: {
        tripId: { type: "number", description: "ID of the trip to edit" },
        name: { type: "string", description: "New name" },
        description: { type: "string", description: "New description" },
      },
      required: ["tripId"],
    },
  },
  {
    name: "delete_trip",
    description: "Delete a trip and all its places.",
    inputSchema: {
      type: "object",
      properties: {
        tripId: { type: "number", description: "ID of the trip to delete" },
      },
      required: ["tripId"],
    },
  },
  {
    name: "add_place",
    description: "Add a place to a trip. Requires coordinates.",
    inputSchema: {
      type: "object",
      properties: {
        tripId: { type: "number", description: "ID of the trip to add place to" },
        name: { type: "string", description: "Name of the place" },
        address: { type: "string", description: "Address of the place" },
        latitude: { type: "number", description: "Latitude coordinate" },
        longitude: { type: "number", description: "Longitude coordinate" },
      },
      required: ["tripId", "name", "latitude", "longitude"],
    },
  },
  {
    name: "delete_place",
    description: "Remove a place from a trip.",
    inputSchema: {
      type: "object",
      properties: {
        placeId: { type: "number", description: "ID of the place to delete" },
      },
      required: ["placeId"],
    },
  },
  {
    name: "reorder_places",
    description: "Reorder places in a trip's itinerary.",
    inputSchema: {
      type: "object",
      properties: {
        tripId: { type: "number", description: "ID of the trip" },
        placeIds: {
          type: "array",
          items: { type: "number" },
          description: "Ordered array of place IDs",
        },
      },
      required: ["tripId", "placeIds"],
    },
  },
  {
    name: "search_places",
    description: "Search for places by query using Google Maps. Returns results with coordinates.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (e.g. 'coffee shops in Paris')" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_places",
    description: "Get all places in a trip's itinerary.",
    inputSchema: {
      type: "object",
      properties: {
        tripId: { type: "number", description: "ID of the trip" },
      },
      required: ["tripId"],
    },
  },
];
