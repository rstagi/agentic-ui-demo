"use client";

import { useEffect, useState } from "react";
import { useTripContext } from "@/contexts/TripContext";
import { TripCard } from "./TripCard";
import { TripForm } from "./TripForm";
import type { Trip } from "@/lib/types";

export function TripList() {
  const { trips, loading, fetchTrips, addTrip, updateTrip, removeTrip } =
    useTripContext();
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleSubmit = async (name: string, description: string) => {
    if (editingTrip) {
      await updateTrip(editingTrip.id, { name, description });
    } else {
      await addTrip(name, description);
    }
    setShowForm(false);
    setEditingTrip(null);
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      await removeTrip(id);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingTrip(null);
  };

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">
            Your Trips
          </h2>
          <p className="text-clay mt-1">
            {trips.length === 0
              ? "Start planning your next adventure"
              : `${trips.length} trip${trips.length !== 1 ? "s" : ""} planned`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-terracotta text-cream rounded-full font-medium hover:bg-rust transition-colors shadow-lg shadow-terracotta/20"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-sand/50 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-clay"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-serif text-xl text-charcoal mb-2">
            No trips yet
          </h3>
          <p className="text-clay mb-6 max-w-sm mx-auto">
            Create your first trip and start adding places to your itinerary
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sage text-cream rounded-full font-medium hover:bg-moss transition-colors"
          >
            Plan Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TripForm
          trip={editingTrip}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
