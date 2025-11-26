"use client";

import { usePlaceContext } from "@/contexts/PlaceContext";
import { PlaceCard } from "./PlaceCard";

interface PlaceListProps {
  tripId: number;
}

export function PlaceList({ tripId }: PlaceListProps) {
  const { places, highlightedPlaceId, highlightPlace, removePlace } =
    usePlaceContext();

  const handleDelete = async (placeId: number) => {
    if (confirm("Remove this place from your itinerary?")) {
      await removePlace(tripId, placeId);
    }
  };

  if (places.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sand/50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-clay"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="font-serif text-lg text-charcoal mb-1">No places yet</h3>
        <p className="text-sm text-clay">
          Search above to add places to your itinerary
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {places.map((place, index) => (
        <PlaceCard
          key={place.id}
          place={place}
          index={index}
          isHighlighted={place.id === highlightedPlaceId}
          onHover={highlightPlace}
          onClick={highlightPlace}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
