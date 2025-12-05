"use client";

import { useState, useEffect } from "react";

interface AISummaryProps {
  listingId: string;
}

export function AISummary({ listingId }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ai/summarize?id=${listingId}`);
        if (!response.ok) {
          throw new Error("Failed to generate summary");
        }

        const data = await response.json();
        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load summary");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed">
        <p className="text-sm text-gray-500">Generating AI summary...</p>
      </div>
    );
  }

  if (error) {
    return null; // Fail silently
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start gap-2">
        <span className="text-lg">✨</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">AI Summary</h3>
          <p className="text-sm text-blue-800">{summary}</p>
        </div>
      </div>
    </div>
  );
}

