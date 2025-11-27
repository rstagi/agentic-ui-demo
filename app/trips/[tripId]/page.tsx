"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePlaceContext } from "@/contexts/PlaceContext";
import { useTripContext } from "@/contexts/TripContext";
import { useChatContext } from "@/contexts/ChatContext";
import { PlaceSearch } from "@/components/PlaceSearch";
import { MapContainerWrapper } from "@/components/MapContainer";
import { TripForm } from "@/components/TripForm";
import type { Trip, Place, PlaceSearchResult } from "@/lib/types";

function SortablePlaceCard({
  place,
  index,
  isHighlighted,
  onHover,
  onDelete,
}: {
  place: Place;
  index: number;
  isHighlighted: boolean;
  onHover: (id: number | null) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        group relative flex-shrink-0 w-24 h-24 rounded-lg
        flex flex-col items-center justify-center p-2 transition-all
        ${isDragging ? "opacity-50 scale-105 z-50" : ""}
        ${
          isHighlighted
            ? "bg-sage/30 border-2 border-sage shadow-md"
            : "bg-cream border border-sand hover:border-terracotta/50 hover:shadow-sm"
        }
      `}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        {...listeners}
        className={`
          cursor-grab active:cursor-grabbing w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1
          ${isHighlighted ? "bg-sage text-cream" : "bg-terracotta/20 text-terracotta"}
        `}
      >
        {index + 1}
      </div>
      <span className="text-xs text-charcoal text-center leading-tight line-clamp-2 w-full">
        {place.name}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(place.id);
        }}
        className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rust/20 text-clay hover:text-rust transition-all"
        title="Delete place"
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

function TripDetailContent({ tripId }: { tripId: number }) {
  const router = useRouter();
  const { trips, updateTrip, removeTrip } = useTripContext();
  const { isOpen, toggleOpen, setCurrentTripId } = useChatContext();
  const {
    places,
    loading,
    fetchPlaces,
    addPlace,
    reorderPlaces,
    removePlace,
    highlightedPlaceId,
    highlightPlace,
  } = usePlaceContext();
  const [fetchedTrip, setFetchedTrip] = useState<Trip | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const trip = useMemo(() => {
    return trips.find((t) => t.id === tripId) ?? fetchedTrip;
  }, [trips, tripId, fetchedTrip]);

  // Set current trip context for chat agent
  useEffect(() => {
    setCurrentTripId(tripId);
    return () => setCurrentTripId(null);
  }, [tripId, setCurrentTripId]);

  useEffect(() => {
    fetchPlaces(tripId);
  }, [tripId, fetchPlaces]);

  useEffect(() => {
    if (!trips.find((t) => t.id === tripId)) {
      fetch(`/api/trips/${tripId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setFetchedTrip(data))
        .catch(() => setFetchedTrip(null));
    }
  }, [tripId, trips]);

  const handlePlaceSelect = async (place: PlaceSearchResult) => {
    await addPlace(tripId, {
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = places.findIndex((p) => p.id === active.id);
      const newIndex = places.findIndex((p) => p.id === over.id);
      const newOrder = arrayMove(places, oldIndex, newIndex);
      reorderPlaces(tripId, newOrder.map((p) => p.id));
    }
  };

  const handleEditSubmit = async (name: string, description: string) => {
    await updateTrip(tripId, { name, description });
    setShowEditForm(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this trip and all its places?")) {
      await removeTrip(tripId);
      router.push("/");
    }
  };

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-sand/50 bg-cream/80 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-full hover:bg-sand transition-colors"
                title="Back to trips"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="font-serif text-xl font-semibold text-charcoal">
                  {trip.name}
                </h1>
                {trip.description && (
                  <p className="text-sm text-clay truncate max-w-md">
                    {trip.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleOpen}
                className={`p-2 rounded-full transition-colors ${
                  isOpen ? "bg-terracotta text-cream" : "hover:bg-sand text-charcoal"
                }`}
                title="Toggle chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowEditForm(true)}
                className="p-2 rounded-full hover:bg-sand text-charcoal transition-colors"
                title="Edit trip"
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
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-rust/20 text-charcoal hover:text-rust transition-colors"
                title="Delete trip"
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
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className="flex-shrink-0 p-3 border-b border-sand/50 bg-cream/50">
        <div className="max-w-2xl mx-auto">
          <PlaceSearch onSelect={handlePlaceSelect} />
        </div>
      </div>

      {/* Map - takes remaining space minus itinerary */}
      <div className="flex-1 relative min-h-0">
        <MapContainerWrapper
          places={places}
          highlightedPlaceId={highlightedPlaceId}
          onPlaceClick={highlightPlace}
        />
      </div>

      {/* Itinerary strip */}
      <div className="flex-shrink-0 h-40 bg-bone/50 border-t border-sand/50">
        <div className="h-full px-4 flex items-center gap-4">
          <div className="flex-shrink-0 flex flex-col justify-center">
            <h2 className="font-serif text-lg font-semibold text-charcoal">Itinerary</h2>
            <span className="text-xs text-clay">{places.length} place{places.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="h-16 w-px bg-sand/70 flex-shrink-0" />
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
            </div>
          ) : places.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-clay text-sm">
              Search for places to build your itinerary
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={places.map((p) => p.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-3 overflow-x-auto py-2 px-1 flex-1">
                  {places.map((place, index) => (
                    <SortablePlaceCard
                      key={place.id}
                      place={place}
                      index={index}
                      isHighlighted={place.id === highlightedPlaceId}
                      onHover={highlightPlace}
                      onDelete={() => removePlace(tripId, place.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {showEditForm && (
        <TripForm
          trip={trip}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}

export default function TripDetailPage() {
  const params = useParams();
  const tripId = parseInt(params.tripId as string, 10);

  if (isNaN(tripId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-clay">Invalid trip ID</p>
      </div>
    );
  }

  return <TripDetailContent tripId={tripId} />;
}
