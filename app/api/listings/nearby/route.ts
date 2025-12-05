import { NextRequest, NextResponse } from "next/server";
import { getNearbyListings } from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radiusKm = parseFloat(searchParams.get("radius_km") || "5");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "5"),
      20
    );

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng are required" },
        { status: 400 }
      );
    }

    const listings = await getNearbyListings(lat, lng, radiusKm, limit);

    return NextResponse.json(
      { items: listings },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching nearby listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby listings" },
      { status: 500 }
    );
  }
}

