"use client";

import { useState } from "react";
import { SavedSearchForm } from "@/components/SavedSearchForm";
import { SavedSearchesList } from "@/components/SavedSearchesList";
import type { SavedSearch } from "@/db/schema";

interface SavedSearchPageClientProps {
  initialSearches: SavedSearch[];
}

export function SavedSearchPageClient({ initialSearches }: SavedSearchPageClientProps) {
  const [searches, setSearches] = useState(initialSearches);

  const handleOptimisticAdd = (search: SavedSearch) => {
    setSearches((prev) => [search, ...prev]);
  };

  const handleRollback = (tempId: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== tempId));
  };

  return (
    <>
      <SavedSearchForm
        onOptimisticAdd={handleOptimisticAdd}
        onRollback={handleRollback}
      />
      <SavedSearchesList initialSearches={searches} />
    </>
  );
}

