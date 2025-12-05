import { Suspense } from "react";
import { SearchFilters } from "@/components/SearchFilters";
import { SearchPageClient } from "@/components/SearchPageClient";
import { getListings } from "@/lib/db-helpers";
import type { SearchFilters as SearchFiltersType } from "@/lib/db-helpers";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const title = params.q
    ? `Properties in ${params.q} - Property Search`
    : "Property Search - Dubai Real Estate";
  return {
    title,
    description: "Search and explore property listings in Dubai",
  };
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    min_price?: string;
    max_price?: string;
    beds_min?: string;
    baths_min?: string;
    page?: string;
    sort_by?: string;
    sort_order?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const filters: SearchFiltersType = {
    q: params.q,
    minPrice: params.min_price ? parseInt(params.min_price) : undefined,
    maxPrice: params.max_price ? parseInt(params.max_price) : undefined,
    bedsMin: params.beds_min ? parseInt(params.beds_min) : undefined,
    bathsMin: params.baths_min ? parseInt(params.baths_min) : undefined,
    page: params.page ? parseInt(params.page) : 1,
    sortBy: (params.sort_by as "updated_at" | "price") || "updated_at",
    sortOrder: (params.sort_order as "asc" | "desc") || "desc",
  };

  const { items, total } = await getListings(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Property Search</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
        <SearchFilters />
      </Suspense>
      <Suspense fallback={<div>Loading listings...</div>}>
        <SearchPageClient initialListings={items} total={total} />
      </Suspense>
    </div>
  );
}

