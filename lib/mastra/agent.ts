import { Agent } from "@mastra/core/agent";

export const chatAgent = new Agent({
  name: "chat-agent",
  instructions: "You are a helpful assistant.",
  model: "openai/gpt-5-mini",
});
