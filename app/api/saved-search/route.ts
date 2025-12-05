import { NextRequest, NextResponse } from "next/server";
import { createSavedSearch, getSavedSearches } from "@/lib/db-helpers";
import { z } from "zod";

export const dynamic = "force-dynamic";

const savedSearchSchema = z.object({
  name: z.string().min(1),
  q: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  bedsMin: z.number().optional(),
  bathsMin: z.number().optional(),
  centerLat: z.number().optional(),
  centerLng: z.number().optional(),
  radiusKm: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "guest";
    const searches = await getSavedSearches(userId);
    return NextResponse.json({ items: searches });
  } catch (error) {
    console.error("Error fetching saved searches:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved searches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || "guest";

    const validated = savedSearchSchema.parse(body);

    if (validated.minPrice && validated.maxPrice && validated.minPrice > validated.maxPrice) {
      return NextResponse.json(
        { error: "Min price must be less than or equal to max price" },
        { status: 400 }
      );
    }

    const savedSearch = await createSavedSearch({
      ...validated,
      userId,
    });

    return NextResponse.json(savedSearch, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating saved search:", error);
    return NextResponse.json(
      { error: "Failed to create saved search" },
      { status: 500 }
    );
  }
}

