import { NextRequest } from "next/server";
import { server } from "@/lib/mcp/server";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

/**
 * Stateless transport for Next.js App Router
 * Handles single request-response cycles
 */
class NextJsTransport implements Transport {
  private responsePromise: Promise<JSONRPCMessage>;
  private resolveResponse!: (message: JSONRPCMessage) => void;

  constructor() {
    this.responsePromise = new Promise((resolve) => {
      this.resolveResponse = resolve;
    });
  }

  async start(): Promise<void> {}

  async send(message: JSONRPCMessage): Promise<void> {
    this.resolveResponse(message);
  }

  async close(): Promise<void> {}

  async handleMessage(message: JSONRPCMessage): Promise<JSONRPCMessage> {
    this.onmessage?.(message);
    return this.responsePromise;
  }

  onmessage?: (message: JSONRPCMessage) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Handle notifications (no response expected)
  if (!("id" in body)) {
    const transport = new NextJsTransport();
    await server.connect(transport);
    transport.onmessage?.(body);
    return new Response(null, { status: 204 });
  }

  const transport = new NextJsTransport();
  await server.connect(transport);

  const response = await transport.handleMessage(body);

  return Response.json(response);
}

// CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
