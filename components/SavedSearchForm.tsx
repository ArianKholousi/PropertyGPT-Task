"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

const savedSearchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  q: z.string().optional(),
  minPrice: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Min price must be a valid positive number"),
  maxPrice: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Max price must be a valid positive number"),
  bedsMin: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
  }, "Bedrooms must be a valid whole number (0 or greater)"),
  bathsMin: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
  }, "Bathrooms must be a valid whole number (0 or greater)"),
  centerLat: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  }, "Latitude must be between -90 and 90"),
  centerLng: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  }, "Longitude must be between -180 and 180"),
  radiusKm: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Radius must be a valid positive number"),
}).refine((data) => {
  const minPrice = data.minPrice ? parseFloat(data.minPrice) : undefined;
  const maxPrice = data.maxPrice ? parseFloat(data.maxPrice) : undefined;
  if (minPrice !== undefined && maxPrice !== undefined && !isNaN(minPrice) && !isNaN(maxPrice)) {
    return minPrice <= maxPrice;
  }
  return true;
}, {
  message: "Min price must be less than or equal to max price",
  path: ["maxPrice"],
});

type SavedSearchFormData = z.infer<typeof savedSearchSchema>;

interface SavedSearchFormProps {
  onOptimisticAdd?: (search: any) => void;
  onRollback?: (tempId: string) => void;
}

export function SavedSearchForm({ onOptimisticAdd, onRollback }: SavedSearchFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tempId, setTempId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SavedSearchFormData>({
    resolver: zodResolver(savedSearchSchema),
  });

  const onSubmit = async (data: SavedSearchFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Convert string inputs to numbers
    const payload = {
      name: data.name,
      q: data.q || undefined,
      minPrice: data.minPrice ? parseFloat(data.minPrice) : undefined,
      maxPrice: data.maxPrice ? parseFloat(data.maxPrice) : undefined,
      bedsMin: data.bedsMin ? parseFloat(data.bedsMin) : undefined,
      bathsMin: data.bathsMin ? parseFloat(data.bathsMin) : undefined,
      centerLat: data.centerLat ? parseFloat(data.centerLat) : undefined,
      centerLng: data.centerLng ? parseFloat(data.centerLng) : undefined,
      radiusKm: data.radiusKm ? parseFloat(data.radiusKm) : undefined,
    };

    // Optimistically add to UI
    const optimisticSearch = {
      id: `temp-${Date.now()}`,
      userId: "guest",
      name: payload.name,
      q: payload.q,
      minPrice: payload.minPrice,
      maxPrice: payload.maxPrice,
      bedsMin: payload.bedsMin,
      bathsMin: payload.bathsMin,
      centerLat: payload.centerLat,
      centerLng: payload.centerLng,
      radiusKm: payload.radiusKm,
      createdAt: new Date().toISOString(),
    };

    setTempId(optimisticSearch.id);
    onOptimisticAdd?.(optimisticSearch);

    try {
      const response = await fetch("/api/saved-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save search");
      }

      const savedSearch = await response.json();
      setSuccess(true);
      reset();
      
      // Update optimistic search with real ID
      if (tempId && onRollback) {
        onRollback(tempId);
        onOptimisticAdd?.(savedSearch);
      }

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err) {
      // Rollback optimistic update
      if (tempId && onRollback) {
        onRollback(tempId);
      }
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
      setTempId(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Create Saved Search</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          Search saved successfully! Redirecting...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Search Name *
          </label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g., Downtown Apartments"
            className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="q" className="block text-sm font-medium text-gray-700 mb-1">
            Address Search
          </label>
          <Input id="q" {...register("q")} placeholder="Search address..." />
        </div>

        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Min Price (AED)
          </label>
          <Input
            id="minPrice"
            type="number"
            {...register("minPrice")}
            placeholder="Min price"
            className={errors.minPrice ? "border-red-500 focus:ring-red-500" : ""}
            aria-invalid={errors.minPrice ? "true" : "false"}
            aria-describedby={errors.minPrice ? "minPrice-error" : undefined}
          />
          {errors.minPrice && (
            <p id="minPrice-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.minPrice.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price (AED)
          </label>
          <Input
            id="maxPrice"
            type="number"
            {...register("maxPrice")}
            placeholder="Max price"
            className={errors.maxPrice ? "border-red-500 focus:ring-red-500" : ""}
            aria-invalid={errors.maxPrice ? "true" : "false"}
            aria-describedby={errors.maxPrice ? "maxPrice-error" : undefined}
          />
          {errors.maxPrice && (
            <p id="maxPrice-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.maxPrice.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bedsMin" className="block text-sm font-medium text-gray-700 mb-1">
            Min Bedrooms
          </label>
          <Input
            id="bedsMin"
            type="number"
            min="0"
            {...register("bedsMin")}
            placeholder="Min beds"
            className={errors.bedsMin ? "border-red-500 focus:ring-red-500" : ""}
            aria-invalid={errors.bedsMin ? "true" : "false"}
            aria-describedby={errors.bedsMin ? "bedsMin-error" : undefined}
          />
          {errors.bedsMin && (
            <p id="bedsMin-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.bedsMin.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bathsMin" className="block text-sm font-medium text-gray-700 mb-1">
            Min Bathrooms
          </label>
          <Input
            id="bathsMin"
            type="number"
            min="0"
            {...register("bathsMin")}
            placeholder="Min baths"
            className={errors.bathsMin ? "border-red-500 focus:ring-red-500" : ""}
            aria-invalid={errors.bathsMin ? "true" : "false"}
            aria-describedby={errors.bathsMin ? "bathsMin-error" : undefined}
          />
          {errors.bathsMin && (
            <p id="bathsMin-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.bathsMin.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="centerLat" className="block text-sm font-medium text-gray-700 mb-1">
            Center Latitude
          </label>
          <Input
            id="centerLat"
            type="number"
            step="0.0001"
            {...register("centerLat")}
            placeholder="25.1935"
            className={errors.centerLat ? "border-red-500 focus:ring-red-500" : ""}
            aria-invalid={errors.centerLat ? "true" : "false"}
            aria-describedby={errors.centerLat ? "centerLat-error" : undefined}
          />
          {errors.centerLat && (
            <p id="centerLat-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.centerLat.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="centerLng" className="block text-sm font-medium text-gray-700 mb-1">
            Center Longitude
          </label>
          <Input
            id="centerLng"
            type="number"
            step="0.0001"
            {...register("centerLng")}
            placeholder="55.2782"
            className={errors.centerLng ? "border-red-500 focus:ring-red-500" : ""}
            aria-invalid={errors.centerLng ? "true" : "false"}
            aria-describedby={errors.centerLng ? "centerLng-error" : undefined}
          />
          {errors.centerLng && (
            <p id="centerLng-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.centerLng.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="radiusKm" className="block text-sm font-medium text-gray-700 mb-1">
            Radius (km)
          </label>
          <Input
            id="radiusKm"
            type="number"
            step="0.1"
            {...register("radiusKm")}
            placeholder="5"
            className={errors.radiusKm ? "border-red-500 focus:ring-red-500" : ""}
            aria-invalid={errors.radiusKm ? "true" : "false"}
            aria-describedby={errors.radiusKm ? "radiusKm-error" : undefined}
          />
          {errors.radiusKm && (
            <p id="radiusKm-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.radiusKm.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Search"}
        </Button>
      </div>
    </form>
  );
}

