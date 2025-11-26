"use client";

import Link from "next/link";
import type { Trip } from "@/lib/types";

interface TripCardProps {
  trip: Trip;
  index: number;
  onEdit: (trip: Trip) => void;
  onDelete: (id: number) => void;
}

export function TripCard({ trip, index, onEdit, onDelete }: TripCardProps) {
  return (
    <div
      className="animate-fade-slide-up group relative bg-bone border border-sand rounded-lg p-5 hover:shadow-lg hover:shadow-terracotta/10 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link href={`/trips/${trip.id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-terracotta"
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
        </div>

        <h3 className="font-serif text-xl font-semibold text-charcoal mb-2 group-hover:text-terracotta transition-colors">
          {trip.name}
        </h3>

        {trip.description && (
          <p className="text-clay text-sm line-clamp-2 mb-3">
            {trip.description}
          </p>
        )}

        <div className="flex items-center text-xs text-clay/70">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {new Date(trip.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </Link>

      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit(trip);
          }}
          className="p-2 rounded-full bg-cream hover:bg-sand text-charcoal transition-colors"
          title="Edit trip"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(trip.id);
          }}
          className="p-2 rounded-full bg-cream hover:bg-rust/20 text-charcoal hover:text-rust transition-colors"
          title="Delete trip"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
