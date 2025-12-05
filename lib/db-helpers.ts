import { db } from "@/db";
import { listings, savedSearches } from "@/db/schema";
import { eq, and, gte, lte, like, sql } from "drizzle-orm";
import type { Listing, SavedSearch } from "@/db/schema";

export interface SearchFilters {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  bedsMin?: number;
  bathsMin?: number;
  page?: number;
  limit?: number;
  sortBy?: "updated_at" | "price";
  sortOrder?: "asc" | "desc";
}

export async function getListings(filters: SearchFilters = {}) {
  const {
    q,
    minPrice,
    maxPrice,
    bedsMin,
    bathsMin,
    page = 1,
    limit = 20,
    sortBy = "updated_at",
    sortOrder = "desc",
  } = filters;

  const conditions = [];

  if (q) {
    conditions.push(like(listings.address, `%${q}%`));
  }
  if (minPrice !== undefined) {
    conditions.push(gte(listings.price, minPrice));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(listings.price, maxPrice));
  }
  if (bedsMin !== undefined) {
    conditions.push(gte(listings.beds, bedsMin));
  }
  if (bathsMin !== undefined) {
    conditions.push(gte(listings.baths, bathsMin));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sortBy === "price"
      ? sortOrder === "asc"
        ? listings.price
        : sql`${listings.price} DESC`
      : sortOrder === "asc"
      ? listings.updatedAt
      : sql`${listings.updatedAt} DESC`;

  const offset = (page - 1) * limit;

  const items = await db
    .select()
    .from(listings)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(listings)
    .where(whereClause);

  const total = totalResult[0]?.count || 0;

  return { items, total };
}

export async function getListingById(id: string): Promise<Listing | null> {
  const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return result[0] || null;
}

export async function getNearbyListings(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  limit: number = 5
): Promise<Listing[]> {
  const allListings = await db.select().from(listings);
  
  // Calculate distances and filter
  const withDistance = allListings
    .map((listing) => {
      const distance = haversineDistance(lat, lng, listing.lat, listing.lng);
      return { ...listing, distance };
    })
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return withDistance.map(({ distance, ...listing }) => listing);
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getSavedSearches(userId: string = "guest"): Promise<SavedSearch[]> {
  return await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId));
}

export async function createSavedSearch(data: {
  userId?: string;
  name: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  bedsMin?: number;
  bathsMin?: number;
  centerLat?: number;
  centerLng?: number;
  radiusKm?: number;
}): Promise<SavedSearch> {
  const id = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userId = data.userId || "guest";
  const createdAt = new Date().toISOString();

  const result = await db
    .insert(savedSearches)
    .values({
      id,
      userId,
      name: data.name,
      q: data.q || null,
      minPrice: data.minPrice || null,
      maxPrice: data.maxPrice || null,
      bedsMin: data.bedsMin || null,
      bathsMin: data.bathsMin || null,
      centerLat: data.centerLat || null,
      centerLng: data.centerLng || null,
      radiusKm: data.radiusKm || null,
      createdAt,
    })
    .returning();

  return result[0];
}

