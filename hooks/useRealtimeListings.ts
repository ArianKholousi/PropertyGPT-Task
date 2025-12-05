"use client";

import { useEffect, useState, useRef } from "react";
import type { Listing } from "@/db/schema";

interface RealtimeEvent {
  type: "connected" | "heartbeat" | "listing_updated";
  listing?: Listing;
  timestamp?: number;
}

export function useRealtimeListings(
  currentFilters: {
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    bedsMin?: number;
    bathsMin?: number;
  },
  onNewListing?: (listing: Listing) => void
) {
  const [newListingIds, setNewListingIds] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/stream/listings");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus("connected");
    };

    eventSource.onerror = () => {
      setConnectionStatus("error");
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        setConnectionStatus("connecting");
      }, 3000);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);

        if (data.type === "listing_updated" && data.listing) {
          const listing = data.listing;

          // Check if listing matches current filters
          const matches =
            (!currentFilters.q || listing.address.toLowerCase().includes(currentFilters.q.toLowerCase())) &&
            (!currentFilters.minPrice || listing.price >= currentFilters.minPrice) &&
            (!currentFilters.maxPrice || listing.price <= currentFilters.maxPrice) &&
            (!currentFilters.bedsMin || listing.beds >= currentFilters.bedsMin) &&
            (!currentFilters.bathsMin || listing.baths >= currentFilters.bathsMin);

          if (matches) {
            setNewListingIds((prev) => new Set([...prev, listing.id]));
            onNewListing?.(listing);

            // Remove "new" badge after 5 seconds
            setTimeout(() => {
              setNewListingIds((prev) => {
                const next = new Set(prev);
                next.delete(listing.id);
                return next;
              });
            }, 5000);
          }
        }
      } catch (error) {
        console.error("Error parsing SSE event:", error);
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [currentFilters, onNewListing]);

  return { newListingIds, connectionStatus };
}

