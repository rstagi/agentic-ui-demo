"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/lib/types";

const MapView = dynamic(() => import("./MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-sand/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-3 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        <p className="text-clay text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface MapContainerProps {
  places: Place[];
  highlightedPlaceId: number | null;
  onPlaceClick: (placeId: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export function MapContainerWrapper({
  places,
  highlightedPlaceId,
  onPlaceClick,
  onMapClick,
}: MapContainerProps) {
  return (
    <MapView
      places={places}
      highlightedPlaceId={highlightedPlaceId}
      onPlaceClick={onPlaceClick}
      onMapClick={onMapClick}
    />
  );
}
