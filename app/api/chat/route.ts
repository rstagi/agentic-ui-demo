import { NextRequest } from "next/server";
import { chatAgent } from "@/lib/mastra/agent";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  const stream = await chatAgent.stream(messages);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream.textStream) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
