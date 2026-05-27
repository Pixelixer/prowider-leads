import { NextResponse } from "next/server";

type Client = ReadableStreamDefaultController<Uint8Array>;

const clients = new Set<Client>();
const encoder = new TextEncoder();

export function sendSSEUpdate(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoded = encoder.encode(message);
  clients.forEach((client) => {
    try {
      client.enqueue(encoded);
    } catch {
      clients.delete(client);
    }
  });
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`)
      );
    },
    cancel(controller) {
      clients.delete(controller);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}