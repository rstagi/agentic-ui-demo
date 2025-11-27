import { NextRequest } from "next/server";
import { MastraAgent } from "@ag-ui/mastra";
import { createChatAgent } from "@/lib/mastra/agent";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, threadId, runId, tools, context, forwardedProps } = body;

  // Extract context from AG-UI context array
  const allTripsCtx = context?.find((c: { description: string }) => c.description === "allTrips");
  const currentTripCtx = context?.find((c: { description: string }) => c.description === "currentTrip");
  const placesCtx = context?.find((c: { description: string }) => c.description === "tripPlaces");

  const allTrips = allTripsCtx ? JSON.parse(allTripsCtx.value) : null;
  const currentTrip = currentTripCtx ? JSON.parse(currentTripCtx.value) : null;
  const places = placesCtx ? JSON.parse(placesCtx.value) : null;

  const chatAgent = createChatAgent({ allTrips, currentTrip, places });

  const aguiAgent = new MastraAgent({
    agent: chatAgent,
    threadId: threadId || crypto.randomUUID(),
  });

  aguiAgent.messages = messages || [];

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const observable = aguiAgent.run({
          threadId: aguiAgent.threadId,
          runId: runId || crypto.randomUUID(),
          messages: aguiAgent.messages,
          tools: tools || [],
          context: context || [],
          forwardedProps: forwardedProps || {},
          state: {},
        });

        await new Promise<void>((resolve, reject) => {
          observable.subscribe({
            next: (event) => {
              const data = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(data));
            },
            error: (err) => {
              console.error("AG-UI stream error:", err);
              reject(err);
            },
            complete: () => {
              resolve();
            },
          });
        });
      } catch (error) {
        console.error("AG-UI error:", error);
        const errorEvent = {
          type: "RUN_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
