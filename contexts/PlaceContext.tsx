"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import type { Place } from "@/lib/types";

interface PlaceState {
  places: Place[];
  loading: boolean;
  error: string | null;
  highlightedPlaceId: number | null;
}

type PlaceAction =
  | { type: "SET_PLACES"; payload: Place[] }
  | { type: "ADD_PLACE"; payload: Place }
  | { type: "UPDATE_PLACE"; payload: Place }
  | { type: "DELETE_PLACE"; payload: number }
  | { type: "REORDER_PLACES"; payload: number[] }
  | { type: "HIGHLIGHT_PLACE"; payload: number | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: PlaceState = {
  places: [],
  loading: false,
  error: null,
  highlightedPlaceId: null,
};

function placeReducer(state: PlaceState, action: PlaceAction): PlaceState {
  switch (action.type) {
    case "SET_PLACES":
      return { ...state, places: action.payload, loading: false };
    case "ADD_PLACE":
      return { ...state, places: [...state.places, action.payload] };
    case "UPDATE_PLACE":
      return {
        ...state,
        places: state.places.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "DELETE_PLACE":
      return {
        ...state,
        places: state.places.filter((p) => p.id !== action.payload),
      };
    case "REORDER_PLACES": {
      const orderMap = new Map(action.payload.map((id, idx) => [id, idx]));
      const reordered = [...state.places].sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      );
      return { ...state, places: reordered };
    }
    case "HIGHLIGHT_PLACE":
      return { ...state, highlightedPlaceId: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface PlaceContextValue extends PlaceState {
  fetchPlaces: (tripId: number) => Promise<void>;
  addPlace: (
    tripId: number,
    data: { name: string; address?: string; latitude: number; longitude: number }
  ) => Promise<Place | null>;
  updatePlace: (
    tripId: number,
    placeId: number,
    data: Partial<Place>
  ) => Promise<Place | null>;
  removePlace: (tripId: number, placeId: number) => Promise<boolean>;
  reorderPlaces: (tripId: number, placeIds: number[]) => Promise<boolean>;
  highlightPlace: (placeId: number | null) => void;
}

const PlaceContext = createContext<PlaceContextValue | null>(null);

export function PlaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(placeReducer, initialState);

  const fetchPlaces = useCallback(async (tripId: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await fetch(`/api/trips/${tripId}/places`);
      if (!res.ok) throw new Error("Failed to fetch places");
      const data = await res.json();
      dispatch({ type: "SET_PLACES", payload: data });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: (err as Error).message });
    }
  }, []);

  const addPlace = useCallback(
    async (
      tripId: number,
      data: { name: string; address?: string; latitude: number; longitude: number }
    ) => {
      try {
        const res = await fetch(`/api/trips/${tripId}/places`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to add place");
        const place = await res.json();
        dispatch({ type: "ADD_PLACE", payload: place });
        return place;
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: (err as Error).message });
        return null;
      }
    },
    []
  );

  const updatePlace = useCallback(
    async (tripId: number, placeId: number, data: Partial<Place>) => {
      try {
        const res = await fetch(`/api/trips/${tripId}/places/${placeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update place");
        const place = await res.json();
        dispatch({ type: "UPDATE_PLACE", payload: place });
        return place;
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: (err as Error).message });
        return null;
      }
    },
    []
  );

  const removePlace = useCallback(async (tripId: number, placeId: number) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/places/${placeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete place");
      dispatch({ type: "DELETE_PLACE", payload: placeId });
      return true;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: (err as Error).message });
      return false;
    }
  }, []);

  const reorderPlaces = useCallback(async (tripId: number, placeIds: number[]) => {
    dispatch({ type: "REORDER_PLACES", payload: placeIds });
    try {
      const res = await fetch(`/api/trips/${tripId}/places/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder places");
      return true;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: (err as Error).message });
      return false;
    }
  }, []);

  const highlightPlace = useCallback((placeId: number | null) => {
    dispatch({ type: "HIGHLIGHT_PLACE", payload: placeId });
  }, []);

  return (
    <PlaceContext.Provider
      value={{
        ...state,
        fetchPlaces,
        addPlace,
        updatePlace,
        removePlace,
        reorderPlaces,
        highlightPlace,
      }}
    >
      {children}
    </PlaceContext.Provider>
  );
}

export function usePlaceContext() {
  const ctx = useContext(PlaceContext);
  if (!ctx)
    throw new Error("usePlaceContext must be used within PlaceProvider");
  return ctx;
}
