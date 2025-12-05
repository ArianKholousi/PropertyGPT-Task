"use client";

import Link from "next/link";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { Listing } from "@/db/schema";

interface ListingCardProps {
  listing: Listing;
  isSelected?: boolean;
  isNew?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export function ListingCard({
  listing,
  isSelected = false,
  isNew = false,
  onHover,
  onLeave,
}: ListingCardProps) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      data-testid="listing-card"
      className={cn(
        "block p-4 border rounded-lg transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        isSelected && "ring-2 ring-blue-500 border-blue-500",
        isNew && "border-green-500 bg-green-50 animate-pulse"
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      tabIndex={0}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-900 flex-1">
          {listing.address}
        </h3>
        {isNew && (
          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded">
            New
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-3">{listing.city}</p>
      <div className="flex items-center gap-4 mb-2">
        <span className="text-2xl font-bold text-blue-600">
          {formatPrice(listing.price)}
        </span>
        <span className="text-sm text-gray-500">
          {listing.status.replace("_", " ")}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{listing.beds} bed{listing.beds !== 1 ? "s" : ""}</span>
        <span>{listing.baths} bath{listing.baths !== 1 ? "s" : ""}</span>
        <span className="ml-auto text-gray-400">
          {formatDate(listing.updatedAt)}
        </span>
      </div>
    </Link>
  );
}

