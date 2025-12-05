import { notFound } from "next/navigation";
import Link from "next/link";
import { getListingById, getNearbyListings } from "@/lib/db-helpers";
import { formatPrice, formatDate } from "@/lib/utils";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/Button";
import { AISummary } from "@/components/AISummary";
import type { Metadata } from "next";

export const revalidate = 60;

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return {
      title: "Listing Not Found",
    };
  }

  return {
    title: `${listing.address} - ${formatPrice(listing.price)}`,
    description: `${listing.beds} bed, ${listing.baths} bath property in ${listing.city}`,
    openGraph: {
      title: `${listing.address} - ${formatPrice(listing.price)}`,
      description: `${listing.beds} bed, ${listing.baths} bath property in ${listing.city}`,
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const nearbyListings = await getNearbyListings(listing.lat, listing.lng, 5, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          ← Back to Search
        </Button>
      </Link>

      <article className="bg-white rounded-lg border p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{listing.address}</h1>
        <p className="text-gray-600 mb-6">{listing.city}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {formatPrice(listing.price)}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {listing.status.replace("_", " ")}
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold mb-1">{listing.beds}</div>
            <div className="text-sm text-gray-500">Bedrooms</div>
          </div>
          <div>
            <div className="text-2xl font-semibold mb-1">{listing.baths}</div>
            <div className="text-sm text-gray-500">Bathrooms</div>
          </div>
        </div>

        <AISummary listingId={listing.id} />

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Address</dt>
              <dd className="font-medium">{listing.address}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">City</dt>
              <dd className="font-medium">{listing.city}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Location</dt>
              <dd className="font-medium">
                {listing.lat.toFixed(4)}, {listing.lng.toFixed(4)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Last Updated</dt>
              <dd className="font-medium">{formatDate(listing.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </article>

      {nearbyListings.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Similar Nearby Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyListings
              .filter((l) => l.id !== listing.id)
              .slice(0, 3)
              .map((nearbyListing) => (
                <ListingCard key={nearbyListing.id} listing={nearbyListing} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

