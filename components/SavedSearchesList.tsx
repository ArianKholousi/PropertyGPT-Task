"use client";

import type { SavedSearch } from "@/db/schema";

interface SavedSearchesListProps {
  initialSearches: SavedSearch[];
}

export function SavedSearchesList({ initialSearches }: SavedSearchesListProps) {
  if (initialSearches.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Saved Searches</h2>
      <div className="space-y-2">
        {initialSearches.map((search) => (
          <SavedSearchItem key={search.id} search={search} />
        ))}
      </div>
    </div>
  );
}

function SavedSearchItem({ search }: { search: SavedSearch }) {
  const params = new URLSearchParams();
  if (search.q) params.set("q", search.q);
  if (search.minPrice) params.set("min_price", search.minPrice.toString());
  if (search.maxPrice) params.set("max_price", search.maxPrice.toString());
  if (search.bedsMin) params.set("beds_min", search.bedsMin.toString());
  if (search.bathsMin) params.set("baths_min", search.bathsMin.toString());

  const isTemp = search.id.startsWith("temp-");

  return (
    <div
      className={`bg-white border rounded-lg p-4 flex items-center justify-between ${
        isTemp ? "opacity-75 border-yellow-300 bg-yellow-50" : ""
      }`}
    >
      <div>
        <h3 className="font-semibold">
          {search.name}
          {isTemp && (
            <span className="ml-2 text-xs text-yellow-600 font-normal">(Saving...)</span>
          )}
        </h3>
        <p className="text-sm text-gray-500">
          {search.q && `Address: ${search.q}`}
          {search.minPrice && ` • Min: ${search.minPrice}`}
          {search.maxPrice && ` • Max: ${search.maxPrice}`}
        </p>
      </div>
      <a
        href={`/?${params.toString()}`}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Apply
      </a>
    </div>
  );
}

