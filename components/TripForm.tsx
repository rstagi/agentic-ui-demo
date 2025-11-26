"use client";

import { useState } from "react";
import type { Trip } from "@/lib/types";

interface TripFormProps {
  trip?: Trip | null;
  onSubmit: (name: string, description: string) => void;
  onClose: () => void;
}

export function TripForm({ trip, onSubmit, onClose }: TripFormProps) {
  const [name, setName] = useState(trip?.name ?? "");
  const [description, setDescription] = useState(trip?.description ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-cream rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fade-slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">
              {trip ? "Edit Trip" : "New Adventure"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-sand transition-colors"
            >
              <svg
                className="w-5 h-5 text-charcoal"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-charcoal mb-2"
              >
                Trip Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Weekend in Paris"
                className="w-full px-4 py-3 rounded-lg bg-bone border border-sand focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all text-charcoal placeholder-clay/50"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-charcoal mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A romantic getaway to the city of lights..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-bone border border-sand focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all text-charcoal placeholder-clay/50 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-sand text-charcoal font-medium hover:bg-sand transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 px-4 py-3 rounded-lg bg-terracotta text-cream font-medium hover:bg-rust transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {trip ? "Save Changes" : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
