import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createTrip, getTripById, getAllTrips, updateTrip, deleteTrip } from "@/lib/db/trips";
import { getPlacesByTripId, createPlace, deletePlace, updatePlace } from "@/lib/db/places";
import { createMapUIResource, createSearchResultsUIResource } from "./ui-resources";
import { Client } from "@googlemaps/google-maps-services-js";

const googleMapsClient = new Client({});

export const server = new McpServer({
  name: "wanderlust-mcp",
  version: "1.0.0",
});

// Trip tools

server.registerTool(
  "add_trip",
  {
    description: "Create a new trip. Returns the created trip ID.",
    inputSchema: {
      name: z.string().describe("Name of the trip"),
      description: z.string().optional().describe("Optional description"),
    },
  },
  async ({ name, description }) => {
    const trip = createTrip({
      name,
      description: description ?? null,
    });

    return {
      content: [{ type: "text", text: `Created trip "${trip.name}" (ID: ${trip.id})` }],
    };
  }
);

server.registerTool(
  "get_trip",
  {
    description: "Get details of a trip including its places. Returns a map UI showing the itinerary.",
    inputSchema: {
      tripId: z.number().describe("ID of the trip to retrieve"),
    },
  },
  async ({ tripId }) => {
    const trip = getTripById(tripId);
    if (!trip) {
      return {
        content: [{ type: "text", text: `Trip ${tripId} not found` }],
        isError: true,
      };
    }

    const places = getPlacesByTripId(trip.id);
    const mapResource = createMapUIResource(trip, places);

    return {
      content: [
        { type: "text", text: `Trip: ${trip.name}${trip.description ? ` - ${trip.description}` : ""}\nPlaces: ${places.length}` },
        mapResource,
      ],
    };
  }
);

server.registerTool(
  "get_trips",
  {
    description: "List all available trips with their IDs and names.",
    inputSchema: {},
  },
  async () => {
    const trips = getAllTrips();

    if (trips.length === 0) {
      return { content: [{ type: "text", text: "No trips found" }] };
    }

    const tripList = trips.map(t => `- ${t.name} (ID: ${t.id})`).join("\n");
    return {
      content: [{ type: "text", text: `Found ${trips.length} trips:\n${tripList}` }],
    };
  }
);

server.registerTool(
  "edit_trip",
  {
    description: "Update a trip's name or description.",
    inputSchema: {
      tripId: z.number().describe("ID of the trip to edit"),
      name: z.string().optional().describe("New name"),
      description: z.string().optional().describe("New description"),
    },
  },
  async ({ tripId, name, description }) => {
    const trip = updateTrip(tripId, {
      name: name ?? undefined,
      description: description ?? undefined,
    });

    if (!trip) {
      return {
        content: [{ type: "text", text: `Trip ${tripId} not found` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: `Updated trip "${trip.name}" (ID: ${trip.id})` }],
    };
  }
);

server.registerTool(
  "delete_trip",
  {
    description: "Delete a trip and all its places.",
    inputSchema: {
      tripId: z.number().describe("ID of the trip to delete"),
    },
  },
  async ({ tripId }) => {
    const success = deleteTrip(tripId);

    if (!success) {
      return {
        content: [{ type: "text", text: `Trip ${tripId} not found` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: `Deleted trip ${tripId}` }],
    };
  }
);

// Place tools

server.registerTool(
  "add_place",
  {
    description: "Add a place to a trip. Requires coordinates.",
    inputSchema: {
      tripId: z.number().describe("ID of the trip to add place to"),
      name: z.string().describe("Name of the place"),
      address: z.string().optional().describe("Address of the place"),
      latitude: z.number().describe("Latitude coordinate"),
      longitude: z.number().describe("Longitude coordinate"),
    },
  },
  async ({ tripId, name, address, latitude, longitude }) => {
    const trip = getTripById(tripId);
    if (!trip) {
      return {
        content: [{ type: "text", text: `Trip ${tripId} not found` }],
        isError: true,
      };
    }

    const place = createPlace({
      trip_id: tripId,
      name,
      address: address ?? null,
      latitude,
      longitude,
    });

    return {
      content: [{ type: "text", text: `Added "${place.name}" to trip "${trip.name}" (Place ID: ${place.id})` }],
    };
  }
);

server.registerTool(
  "delete_place",
  {
    description: "Remove a place from a trip.",
    inputSchema: {
      placeId: z.number().describe("ID of the place to delete"),
    },
  },
  async ({ placeId }) => {
    const success = deletePlace(placeId);

    if (!success) {
      return {
        content: [{ type: "text", text: `Place ${placeId} not found` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: `Deleted place ${placeId}` }],
    };
  }
);

server.registerTool(
  "reorder_places",
  {
    description: "Reorder places in a trip's itinerary.",
    inputSchema: {
      tripId: z.number().describe("ID of the trip"),
      placeIds: z.array(z.number()).describe("Ordered array of place IDs"),
    },
  },
  async ({ tripId, placeIds }) => {
    const trip = getTripById(tripId);
    if (!trip) {
      return {
        content: [{ type: "text", text: `Trip ${tripId} not found` }],
        isError: true,
      };
    }

    const places = getPlacesByTripId(tripId);
    const placeIdSet = new Set(places.map(p => p.id));

    for (const id of placeIds) {
      if (!placeIdSet.has(id)) {
        return {
          content: [{ type: "text", text: `Place ${id} not in trip ${tripId}` }],
          isError: true,
        };
      }
    }

    placeIds.forEach((placeId, index) => {
      updatePlace(placeId, { visit_order: index });
    });

    return {
      content: [{ type: "text", text: `Reordered ${placeIds.length} places in trip "${trip.name}"` }],
    };
  }
);

server.registerTool(
  "search_places",
  {
    description: "Search for places by query using Google Maps. Returns results with coordinates.",
    inputSchema: {
      query: z.string().describe("Search query (e.g. 'coffee shops in Paris')"),
    },
  },
  async ({ query }) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return {
        content: [{ type: "text", text: "Google Maps API key not configured" }],
        isError: true,
      };
    }

    try {
      const response = await googleMapsClient.textSearch({
        params: {
          query: query.trim(),
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
        return { content: [{ type: "text", text: `No results found for "${query}"` }] };
      }

      const resultList = results.map((r, i) =>
        `${i + 1}. ${r.name} - ${r.address} (${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)})`
      ).join("\n");

      const uiResource = createSearchResultsUIResource(query, results);

      return {
        content: [
          { type: "text", text: `Found ${results.length} results for "${query}":\n${resultList}` },
          uiResource,
        ],
      };
    } catch {
      return {
        content: [{ type: "text", text: "Failed to search places" }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "get_places",
  {
    description: "Get all places in a trip's itinerary.",
    inputSchema: {
      tripId: z.number().describe("ID of the trip"),
    },
  },
  async ({ tripId }) => {
    const trip = getTripById(tripId);
    if (!trip) {
      return {
        content: [{ type: "text", text: `Trip ${tripId} not found` }],
        isError: true,
      };
    }

    const places = getPlacesByTripId(tripId);

    if (places.length === 0) {
      return { content: [{ type: "text", text: `No places in trip "${trip.name}"` }] };
    }

    const placeList = places.map((p, i) =>
      `${i + 1}. ${p.name}${p.address ? ` - ${p.address}` : ""} (ID: ${p.id})`
    ).join("\n");

    return {
      content: [{ type: "text", text: `Places in "${trip.name}":\n${placeList}` }],
    };
  }
);
