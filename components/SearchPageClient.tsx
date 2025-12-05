"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ListingsGrid } from "./ListingsGrid";
import { MiniMap } from "./MiniMap";
import { useRealtimeListings } from "@/hooks/useRealtimeListings";
import type { Listing } from "@/db/schema";

interface SearchPageClientProps {
  initialListings: Listing[];
  total: number;
}

export function SearchPageClient({ initialListings, total }: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState(initialListings);
  const [currentTotal, setCurrentTotal] = useState(total);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sync with server data when initialListings changes (e.g., after filter application)
  useEffect(() => {
    setListings(initialListings);
    setCurrentTotal(total);
  }, [initialListings, total]);

  // Also fetch client-side when searchParams change (for immediate updates)
  useEffect(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const bedsMin = searchParams.get("beds_min");
    const bathsMin = searchParams.get("baths_min");

    if (q) params.set("q", q);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (bedsMin) params.set("beds_min", bedsMin);
    if (bathsMin) params.set("baths_min", bathsMin);

    const fetchListings = async () => {
      try {
        const response = await fetch(`/api/listings?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setListings(data.items);
          setCurrentTotal(data.total);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [searchParams.toString()]);

  const currentFilters = {
    q: searchParams.get("q") || undefined,
    minPrice: searchParams.get("min_price")
      ? parseInt(searchParams.get("min_price")!)
      : undefined,
    maxPrice: searchParams.get("max_price")
      ? parseInt(searchParams.get("max_price")!)
      : undefined,
    bedsMin: searchParams.get("beds_min")
      ? parseInt(searchParams.get("beds_min")!)
      : undefined,
    bathsMin: searchParams.get("baths_min")
      ? parseInt(searchParams.get("baths_min")!)
      : undefined,
  };

  const { newListingIds, connectionStatus } = useRealtimeListings(
    currentFilters,
    (newListing) => {
      // Add new listing to the top of the list
      setListings((prev) => {
        // Remove if already exists, then add to top
        const filtered = prev.filter((l) => l.id !== newListing.id);
        return [newListing, ...filtered];
      });
    }
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connectionStatus === "connected"
              ? "bg-green-500"
              : connectionStatus === "error"
                ? "bg-red-500"
                : "bg-yellow-500"
              }`}
            title={
              connectionStatus === "connected"
                ? "Realtime updates active"
                : connectionStatus === "error"
                  ? "Connection error"
                  : "Connecting..."
            }
          />
          <span className="text-xs text-gray-500">
            {connectionStatus === "connected"
              ? "Live"
              : connectionStatus === "error"
                ? "Offline"
                : "Connecting"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ListingsGrid
            listings={listings}
            total={currentTotal}
            newListingIds={newListingIds}
            selectedId={selectedId}
            onListingHover={setSelectedId}
          />
        </div>
        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Map View</h2>
            <MiniMap
              listings={listings}
              selectedId={selectedId || undefined}
              onMarkerClick={(listing) => {
                window.location.href = `/listing/${listing.id}`;
              }}
              onMarkerHover={(listing) => {
                setSelectedId(listing?.id || null);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

