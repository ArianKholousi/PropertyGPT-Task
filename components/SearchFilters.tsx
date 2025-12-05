"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { AIRewriteQuery } from "./AIRewriteQuery";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [bedsMin, setBedsMin] = useState(searchParams.get("beds_min") || "");
  const [bathsMin, setBathsMin] = useState(searchParams.get("baths_min") || "");

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (bedsMin) params.set("beds_min", bedsMin);
    if (bathsMin) params.set("baths_min", bathsMin);

    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setBedsMin("");
    setBathsMin("");
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyFilters();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" onKeyDown={handleKeyDown}>
        <div>
          <label htmlFor="q" className="block text-sm font-medium text-gray-700 mb-1">
            Address Search
          </label>
          <Input
            id="q"
            type="text"
            placeholder="Search address..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <AIRewriteQuery
            currentQuery={q}
            onRewrite={(rewritten) => setQ(rewritten)}
          />
        </div>
        <div>
          <label htmlFor="min_price" className="block text-sm font-medium text-gray-700 mb-1">
            Min Price (AED)
          </label>
          <Input
            id="min_price"
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price (AED)
          </label>
          <Input
            id="max_price"
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="beds_min" className="block text-sm font-medium text-gray-700 mb-1">
            Min Bedrooms
          </label>
          <Input
            id="beds_min"
            type="number"
            min="0"
            placeholder="Min beds"
            value={bedsMin}
            onChange={(e) => setBedsMin(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="baths_min" className="block text-sm font-medium text-gray-700 mb-1">
            Min Bathrooms
          </label>
          <Input
            id="baths_min"
            type="number"
            min="0"
            placeholder="Min baths"
            value={bathsMin}
            onChange={(e) => setBathsMin(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

