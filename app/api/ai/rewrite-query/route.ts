import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Deterministic stub when OpenAI is not available
function generateStubRewrite(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "Dubai";

  const words = trimmed.split(/\s+/);
  const capitalized = words.map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(" ");

  // Only add "Dubai" if not already present, just complete the address
  const lowerQuery = capitalized.toLowerCase();
  if (!lowerQuery.includes("dubai") && !lowerQuery.includes("uae") && !lowerQuery.includes("united arab emirates")) {
    return `${capitalized}, Dubai`;
  }

  return capitalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      // Return deterministic stub
      const rewritten = generateStubRewrite(query);
      return NextResponse.json({ rewritten });
    }

    // Call OpenAI API
    try {
      const prompt = `Complete this address query for Dubai real estate search. Only add the missing location context (like "Dubai" or area name) to make it a complete address. Do NOT add any extra words like "properties", "apartments", "for sale", etc. Just complete the address.

Examples:
- "Downto" → "Downtown Dubai"
- "Marin" → "Dubai Marina"
- "Jume" → "Jumeirah"

Original query: "${query}"

Return only the completed address, nothing else.`;

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
              content: "You are an address completion assistant for Dubai real estate. Your only job is to complete partial addresses by adding location context (like 'Dubai' or area names). Never add descriptive words like 'properties', 'apartments', 'for sale', etc. Only complete the address.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 50,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error("OpenAI API error");
      }

      const data = await response.json();
      let rewritten = data.choices[0]?.message?.content?.trim() || generateStubRewrite(query);

      // Remove quotes if present
      rewritten = rewritten.replace(/^["']|["']$/g, '').trim();

      return NextResponse.json({ rewritten });
    } catch (error) {
      console.error("OpenAI API error:", error);
      // Fallback to stub
      const rewritten = generateStubRewrite(query);
      return NextResponse.json({ rewritten });
    }
  } catch (error) {
    console.error("Error rewriting query:", error);
    return NextResponse.json(
      { error: "Failed to rewrite query" },
      { status: 500 }
    );
  }
}

