import { SavedSearchPageClient } from "./SavedSearchPageClient";
import { getSavedSearches } from "@/lib/db-helpers";

export const revalidate = 60;

export default async function SavedSearchPage() {
  const savedSearches = await getSavedSearches("guest");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Saved Searches</h1>
      <SavedSearchPageClient initialSearches={savedSearches} />
    </div>
  );
}
