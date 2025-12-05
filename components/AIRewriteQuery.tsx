"use client";

import { useState } from "react";
import { Button } from "./ui/Button";

interface AIRewriteQueryProps {
  currentQuery: string;
  onRewrite: (rewritten: string) => void;
}

export function AIRewriteQuery({ currentQuery, onRewrite }: AIRewriteQueryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRewrite = async () => {
    if (!currentQuery.trim()) {
      setError("Please enter a search query first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/rewrite-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to rewrite query");
      }

      const data = await response.json();
      onRewrite(data.rewritten);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentQuery.trim()) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRewrite}
        disabled={isLoading}
        className="text-xs"
      >
        {isLoading ? "Rewriting..." : "✨ Rewrite my query"}
      </Button>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}

