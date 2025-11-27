import { createTool } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";

// Trip Tools
export const addTripTool = createTool({
  id: "add_trip",
  description: "Add a new trip. Use when user wants to create a trip.",
  inputSchema: z.object({
    name: z.string().describe("Name of the trip"),
    description: z.string().optional().describe("Optional description"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => ({
    success: true,
    message: `Trip "${context.name}" will be added.`,
  }),
});

export const editTripTool = createTool({
  id: "edit_trip",
  description: "Edit an existing trip's name or description.",
  inputSchema: z.object({
    tripId: z.number().describe("ID of the trip to edit"),
    name: z.string().optional().describe("New name"),
    description: z.string().optional().describe("New description"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => ({
    success: true,
    message: `Trip ${context.tripId} will be updated.`,
  }),
});

export const deleteTripTool = createTool({
  id: "delete_trip",
  description: "Delete a trip. Use when user wants to remove a trip.",
  inputSchema: z.object({
    tripId: z.number().describe("ID of the trip to delete"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => ({
    success: true,
    message: `Trip ${context.tripId} will be deleted.`,
  }),
});

export const getTripTool = createTool({
  id: "get_trip",
  description: "Get details of a specific trip.",
  inputSchema: z.object({
    tripId: z.number().describe("ID of the trip"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => ({
    success: true,
    message: `Fetching trip ${context.tripId}.`,
  }),
});

export const getTripsTool = createTool({
  id: "get_trips",
  description: "List all user's trips.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async () => ({
    success: true,
    message: "Fetching all trips.",
  }),
});

// Place Tools
export const addPlaceTool = createTool({
  id: "add_place",
  description: "Add a place to the current trip. Requires coordinates.",
  inputSchema: z.object({
    name: z.string().describe("Name of the place"),
    address: z.string().optional().describe("Address"),
    latitude: z.number().describe("Latitude coordinate"),
    longitude: z.number().describe("Longitude coordinate"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => ({
    success: true,
    message: `Place "${context.name}" will be added to the trip.`,
  }),
});

export const deletePlaceTool = createTool({
  id: "delete_place",
  description: "Remove a place from the current trip.",
  inputSchema: z.object({
    placeId: z.number().describe("ID of the place to remove"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => ({
    success: true,
    message: `Place ${context.placeId} will be removed.`,
  }),
});

export const reorderPlacesTool = createTool({
  id: "reorder_places",
  description: "Reorder places in the current trip's itinerary.",
  inputSchema: z.object({
    placeIds: z.array(z.number()).describe("Ordered array of place IDs"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async () => ({
    success: true,
    message: "Places will be reordered.",
  }),
});

export const searchPlacesTool = createTool({
  id: "search_places",
  description: "Search for places by query. Use to help user find places to add.",
  inputSchema: z.object({
    query: z.string().describe("Search query (e.g. 'coffee shops in Paris')"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => ({
    success: true,
    message: `Searching for "${context.query}".`,
  }),
});

export const getPlacesTool = createTool({
  id: "get_places",
  description: "Get all places in the current trip.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async () => ({
    success: true,
    message: "Fetching places for current trip.",
  }),
});

const BASE_INSTRUCTIONS = `You are a helpful travel planning assistant for Wanderlust, a trip planner app.

You have access to tools to manage trips and places:

TRIP TOOLS:
- add_trip: Create a new trip
- edit_trip: Update trip name/description (needs tripId)
- delete_trip: Remove a trip (needs tripId)
- get_trip: Get trip details (needs tripId)
- get_trips: List all trips

PLACE TOOLS (operate on current trip context):
- add_place: Add a place (needs name, latitude, longitude)
- delete_place: Remove a place (needs placeId)
- reorder_places: Change place order (needs placeIds array)
- search_places: Search for places by query
- get_places: List places in current trip

For search_places, present results to user so they can choose which to add.
Be concise and helpful.`;

const agentTools = {
  add_trip: addTripTool,
  edit_trip: editTripTool,
  delete_trip: deleteTripTool,
  get_trip: getTripTool,
  get_trips: getTripsTool,
  add_place: addPlaceTool,
  delete_place: deletePlaceTool,
  reorder_places: reorderPlacesTool,
  search_places: searchPlacesTool,
  get_places: getPlacesTool,
};

interface AgentContext {
  allTrips?: { id: number; name: string }[] | null;
  currentTrip?: { id: number; name: string } | null;
  places?: { id: number; name: string }[] | null;
}

export function createChatAgent(ctx: AgentContext = {}) {
  const { allTrips, currentTrip, places } = ctx;

  let contextInfo = "\n\nCURRENT CONTEXT:";

  if (currentTrip) {
    // On trip page
    contextInfo += `\nViewing trip: "${currentTrip.name}" (ID: ${currentTrip.id})`;
    if (places && places.length > 0) {
      contextInfo += "\nPlaces in trip:";
      places.forEach(p => {
        contextInfo += `\n  - ${p.name} (ID: ${p.id})`;
      });
    } else {
      contextInfo += "\nNo places added yet.";
    }
  } else if (allTrips && allTrips.length > 0) {
    // On homepage with trips
    contextInfo += "\nUser is on homepage. Their trips:";
    allTrips.forEach(t => {
      contextInfo += `\n  - ${t.name} (ID: ${t.id})`;
    });
  } else {
    // On homepage, no trips
    contextInfo += "\nUser is on homepage. No trips created yet.";
  }

  return new Agent({
    name: "chat-agent",
    instructions: BASE_INSTRUCTIONS + contextInfo,
    model: "openai/gpt-4o-mini",
    tools: agentTools,
  });
}

// Default agent for backwards compatibility
export const chatAgent = createChatAgent();


