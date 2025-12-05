"use client";

import { useEffect, useRef, useState } from "react";
import type { Listing } from "@/db/schema";
import { formatPrice, cn } from "@/lib/utils";

interface MiniMapProps {
  listings: Listing[];
  selectedId?: string;
  onMarkerClick?: (listing: Listing) => void;
  onMarkerHover?: (listing: Listing | null) => void;
  className?: string;
}

export function MiniMap({
  listings,
  selectedId,
  onMarkerClick,
  onMarkerHover,
  className,
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || listings.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate bounding box
    const lats = listings.map((l) => l.lat);
    const lngs = listings.map((l) => l.lng);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);
    const lngMin = Math.min(...lngs);
    const lngMax = Math.max(...lngs);

    // Add padding
    const latRange = latMax - latMin || 0.01;
    const lngRange = lngMax - lngMin || 0.01;
    const padding = 0.1;
    const paddedLatMin = latMin - latRange * padding;
    const paddedLatMax = latMax + latRange * padding;
    const paddedLngMin = lngMin - lngRange * padding;
    const paddedLngMax = lngMax + lngRange * padding;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);

    // Draw markers
    listings.forEach((listing) => {
      const x = ((listing.lng - paddedLngMin) / (paddedLngMax - paddedLngMin)) * width;
      const y =
        (1 - (listing.lat - paddedLatMin) / (paddedLatMax - paddedLatMin)) * height;

      const isSelected = listing.id === selectedId;
      const isHovered = listing.id === hoveredId;

      // Draw marker
      ctx.beginPath();
      ctx.arc(x, y, isSelected || isHovered ? 8 : 6, 0, 2 * Math.PI);
      ctx.fillStyle =
        isSelected
          ? "#2563eb"
          : isHovered
            ? "#3b82f6"
            : "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [listings, selectedId, hoveredId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || listings.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate bounding box (same as in useEffect)
    const lats = listings.map((l) => l.lat);
    const lngs = listings.map((l) => l.lng);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);
    const lngMin = Math.min(...lngs);
    const lngMax = Math.max(...lngs);

    const latRange = latMax - latMin || 0.01;
    const lngRange = lngMax - lngMin || 0.01;
    const padding = 0.1;
    const paddedLatMin = latMin - latRange * padding;
    const paddedLatMax = latMax + latRange * padding;
    const paddedLngMin = lngMin - lngRange * padding;
    const paddedLngMax = lngMax + lngRange * padding;

    const width = canvas.width;
    const height = canvas.height;

    // Check which marker is under cursor
    let found: Listing | null = null;
    for (const listing of listings) {
      const markerX = ((listing.lng - paddedLngMin) / (paddedLngMax - paddedLngMin)) * width;
      const markerY =
        (1 - (listing.lat - paddedLatMin) / (paddedLatMax - paddedLatMin)) * height;
      const distance = Math.sqrt((x - markerX) ** 2 + (y - markerY) ** 2);
      if (distance < 10) {
        found = listing;
        break;
      }
    }

    if (found) {
      setHoveredId(found.id);
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        text: `${found.address} - ${formatPrice(found.price)}`,
      });
      onMarkerHover?.(found);
    } else {
      setHoveredId(null);
      setTooltip(null);
      onMarkerHover?.(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !hoveredId) return;

    const listing = listings.find((l) => l.id === hoveredId);
    if (listing) {
      onMarkerClick?.(listing);
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setTooltip(null);
    onMarkerHover?.(null);
  };

  if (listings.length === 0) {
    return (
      <div className={cn("bg-gray-100 rounded-lg flex items-center justify-center", className)}>
        <p className="text-gray-500">No listings to display on map</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-full rounded-lg border cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
        aria-label="Property listings map"
        role="img"
      />
      {tooltip && (
        <div
          className="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm pointer-events-none z-10"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

