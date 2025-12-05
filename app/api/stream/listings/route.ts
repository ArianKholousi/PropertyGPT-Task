import { NextRequest } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Send initial connection message
      send(JSON.stringify({ type: "connected" }));

      // Heartbeat interval
      const heartbeatInterval = setInterval(() => {
        send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));
      }, 15000);

      // Simulate new listing events
      const eventInterval = setInterval(async () => {
        try {
          // Get a random existing listing and update it
          const allListings = await db.select().from(listings).limit(100);
          if (allListings.length === 0) return;

          const randomListing = allListings[Math.floor(Math.random() * allListings.length)];

          const newPrice = Math.max(
            50000,
            randomListing.price + Math.floor((Math.random() - 0.5) * 100000)
          );

          await db
            .update(listings)
            .set({
              price: newPrice,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(listings.id, randomListing.id));

          const updated = await db
            .select()
            .from(listings)
            .where(eq(listings.id, randomListing.id))
            .limit(1);

          if (updated[0]) {
            send(
              JSON.stringify({
                type: "listing_updated",
                listing: updated[0],
              })
            );
          }
        } catch (error) {
          console.error("Error in SSE stream:", error);
        }
      }, 10000 + Math.random() * 5000); // 10-15 seconds

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        clearInterval(eventInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

