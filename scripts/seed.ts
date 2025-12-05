import { db } from "../db";
import { listings } from "../db/schema";
import listingsData from "../sample-data.json";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  db.delete(listings).run();

  // Insert listings
  for (const listing of listingsData) {
    db.insert(listings).values({
      id: listing.id,
      address: listing.address,
      city: listing.city,
      lat: listing.lat,
      lng: listing.lng,
      price: listing.price,
      beds: listing.beds,
      baths: listing.baths,
      status: listing.status,
      updatedAt: listing.updated_at,
    }).run();
  }

  console.log(`Seeded ${listingsData.length} listings`);
}

seed().catch(console.error);

