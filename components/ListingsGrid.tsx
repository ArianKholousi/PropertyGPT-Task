"use client";

import { ListingCard } from "./ListingCard";
import type { Listing } from "@/db/schema";

interface ListingsGridProps {
  listings: Listing[];
  total: number;
  newListingIds?: Set<string>;
  selectedId?: string | null;
  onListingHover?: (id: string | null) => void;
}

export function ListingsGrid({
  listings,
  total,
  newListingIds = new Set(),
  selectedId,
  onListingHover,
}: ListingsGridProps) {

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No listings found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        Showing {listings.length} of {total} listings
      </div>
      <div className="space-y-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isSelected={selectedId === listing.id}
            isNew={newListingIds.has(listing.id)}
            onHover={() => onListingHover?.(listing.id)}
            onLeave={() => onListingHover?.(null)}
          />
        ))}
      </div>
    </div>
  );
}

