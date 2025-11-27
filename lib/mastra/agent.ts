import { createTool } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";

export const addTripTool = createTool({
  id: "add_trip",
  description: "Add a new trip to the user's trip list. Use this when user wants to create/add a trip.",
  inputSchema: z.object({
    name: z.string().describe("Name of the trip"),
    description: z.string().optional().describe("Optional description of the trip"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      success: true,
      message: `Trip "${context.name}" will be added.`,
    };
  },
});

export const chatAgent = new Agent({
  name: "chat-agent",
  instructions: "You are a helpful assistant.",
  model: "openai/gpt-5-mini",
  tools: { add_trip: addTripTool },
});
