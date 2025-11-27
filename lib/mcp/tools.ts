import { z } from "zod";
import { createTrip, getTripById, getAllTrips } from "@/lib/db/trips";
import { getPlacesByTripId } from "@/lib/db/places";
import { createMapUIResource } from "./ui-resources";

export const addTripSchema = z.object({
  name: z.string().describe("Name of the trip"),
  description: z.string().optional().describe("Optional description"),
});

export const getTripSchema = z.object({
  tripId: z.number().describe("ID of the trip to retrieve"),
});

export const getTripsSchema = z.object({});

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
];
