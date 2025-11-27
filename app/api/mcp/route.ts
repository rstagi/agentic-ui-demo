import { NextRequest } from "next/server";
import {
  tools,
  handleAddTrip,
  handleGetTrip,
  handleGetTrips,
  addTripSchema,
  getTripSchema,
} from "@/lib/mcp/tools";

// Simple JSON-RPC handler for MCP
// Handles: initialize, tools/list, tools/call

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

function jsonRpcResponse(id: string | number, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: string | number, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as JsonRpcRequest;
  const { id, method, params } = body;

  try {
    switch (method) {
      case "initialize": {
        return Response.json(
          jsonRpcResponse(id, {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "wanderlust-mcp",
              version: "1.0.0",
            },
          })
        );
      }

      case "notifications/initialized": {
        // Client acknowledgment, no response needed for notifications
        return new Response(null, { status: 204 });
      }

      case "tools/list": {
        return Response.json(jsonRpcResponse(id, { tools }));
      }

      case "tools/call": {
        const toolName = params?.name as string;
        const args = params?.arguments as Record<string, unknown>;

        let result;
        switch (toolName) {
          case "add_trip":
            result = await handleAddTrip(addTripSchema.parse(args));
            break;
          case "get_trip":
            result = await handleGetTrip(getTripSchema.parse(args));
            break;
          case "get_trips":
            result = await handleGetTrips();
            break;
          default:
            return Response.json(
              jsonRpcError(id, -32601, `Unknown tool: ${toolName}`)
            );
        }

        return Response.json(jsonRpcResponse(id, result));
      }

      default:
        return Response.json(jsonRpcError(id, -32601, `Unknown method: ${method}`));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return Response.json(jsonRpcError(id, -32603, message));
  }
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
