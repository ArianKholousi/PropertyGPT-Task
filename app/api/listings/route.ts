import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
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
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: Math.min(
        searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
        50
      ),
      sortBy: (searchParams.get("sort_by") as "updated_at" | "price") || "updated_at",
      sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
    };

    const { items, total } = await getListings(filters);

    return NextResponse.json(
      { items, total },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

