import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const listings = sqliteTable("listing", {
  id: text("id").primaryKey(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  price: integer("price").notNull(),
  beds: integer("beds").notNull(),
  baths: integer("baths").notNull(),
  status: text("status").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const savedSearches = sqliteTable("saved_search", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  q: text("q"),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  bedsMin: integer("beds_min"),
  bathsMin: integer("baths_min"),
  centerLat: real("center_lat"),
  centerLng: real("center_lng"),
  radiusKm: real("radius_km"),
  createdAt: text("created_at").notNull(),
});

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type NewSavedSearch = typeof savedSearches.$inferInsert;

