"use client";

import { useState, useEffect, useRef } from "react";
import type { PlaceSearchResult } from "@/lib/types";

interface PlaceSearchProps {
  onSelect: (place: PlaceSearchResult) => void;
}

export function PlaceSearch({ onSelect }: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/places/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (place: PlaceSearchResult) => {
    onSelect(place);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a place..."
          className="w-full pl-11 pr-4 py-3 rounded-lg bg-bone border border-sand focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all text-charcoal placeholder-clay/50"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 text-clay"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-[500] top-full left-0 right-0 mt-2 bg-cream border border-sand rounded-lg shadow-xl overflow-hidden">
          {results.map((place, index) => (
            <button
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="w-full px-4 py-3 text-left hover:bg-sand/50 transition-colors flex items-start gap-3 border-b border-sand/50 last:border-0"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="mt-1 w-8 h-8 rounded-full bg-terracotta/10 flex-shrink-0 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-terracotta"
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
              <div className="min-w-0">
                <p className="font-medium text-charcoal truncate">
                  {place.name}
                </p>
                <p className="text-sm text-clay truncate">{place.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
