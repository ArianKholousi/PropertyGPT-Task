import { NextRequest, NextResponse } from "next/server";
import { getListingById } from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

// Deterministic stub when OpenAI is not available
function generateStubSummary(listing: any): string {
  const status = listing.status === "for_sale" ? "for sale" : listing.status === "for_rent" ? "for rent" : "available";
  const location = listing.city || "Dubai";
  const price = new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
  }).format(listing.price);

  return `This ${listing.beds}-bedroom, ${listing.baths}-bathroom property in ${location} is ${status} at ${price}. Located at ${listing.address}, this property offers excellent value in a prime location.`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get("id");

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const listing = await getListingById(listingId);
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      // Return deterministic stub
      const summary = generateStubSummary(listing);
      return NextResponse.json({ summary });
    }

    // Call OpenAI API
    try {
      const prompt = `Write a 2-sentence marketing blurb for this property listing:
- Address: ${listing.address}
- City: ${listing.city}
- Price: ${listing.price} AED
- Bedrooms: ${listing.beds}
- Bathrooms: ${listing.baths}
- Status: ${listing.status}

Make it engaging and highlight the key selling points.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a real estate marketing copywriter. Write concise, engaging property descriptions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("OpenAI API error");
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content?.trim() || generateStubSummary(listing);

      return NextResponse.json({ summary });
    } catch (error) {
      console.error("OpenAI API error:", error);
      // Fallback to stub
      const summary = generateStubSummary(listing);
      return NextResponse.json({ summary });
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

