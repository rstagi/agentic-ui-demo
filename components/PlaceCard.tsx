"use client";

import type { Place } from "@/lib/types";

interface PlaceCardProps {
  place: Place;
  index: number;
  isHighlighted: boolean;
  onHover: (id: number | null) => void;
  onClick: (id: number) => void;
  onDelete: (id: number) => void;
}

export function PlaceCard({
  place,
  index,
  isHighlighted,
  onHover,
  onClick,
  onDelete,
}: PlaceCardProps) {
  return (
    <div
      className={`
        animate-fade-slide-up group relative rounded-lg p-4 cursor-pointer transition-all duration-200
        ${
          isHighlighted
            ? "bg-sage/20 border-2 border-sage shadow-md"
            : "bg-bone border border-sand hover:border-terracotta/50"
        }
      `}
      style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(place.id)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
            ${isHighlighted ? "bg-sage text-cream" : "bg-terracotta/20 text-terracotta"}
          `}
        >
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-charcoal truncate group-hover:text-terracotta transition-colors">
            {place.name}
          </h4>
          {place.address && (
            <p className="text-sm text-clay truncate mt-0.5">{place.address}</p>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(place.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rust/20 text-clay hover:text-rust transition-all"
        title="Remove place"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
