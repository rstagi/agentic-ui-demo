"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import type { Trip } from "@/lib/types";

interface TripState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

type TripAction =
  | { type: "SET_TRIPS"; payload: Trip[] }
  | { type: "ADD_TRIP"; payload: Trip }
  | { type: "UPDATE_TRIP"; payload: Trip }
  | { type: "DELETE_TRIP"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: TripState = {
  trips: [],
  loading: false,
  error: null,
};

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case "SET_TRIPS":
      return { ...state, trips: action.payload, loading: false };
    case "ADD_TRIP":
      return { ...state, trips: [action.payload, ...state.trips] };
    case "UPDATE_TRIP":
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TRIP":
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface TripContextValue extends TripState {
  fetchTrips: () => Promise<void>;
  addTrip: (name: string, description?: string) => Promise<Trip | null>;
  updateTrip: (id: number, data: Partial<Trip>) => Promise<Trip | null>;
  removeTrip: (id: number) => Promise<boolean>;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  const fetchTrips = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await fetch("/api/trips");
      if (!res.ok) throw new Error("Failed to fetch trips");
      const data = await res.json();
      dispatch({ type: "SET_TRIPS", payload: data });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: (err as Error).message });
    }
  }, []);

  const addTrip = useCallback(async (name: string, description?: string) => {
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      const trip = await res.json();
      dispatch({ type: "ADD_TRIP", payload: trip });
      return trip;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: (err as Error).message });
      return null;
    }
  }, []);

  const updateTrip = useCallback(async (id: number, data: Partial<Trip>) => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update trip");
      const trip = await res.json();
      dispatch({ type: "UPDATE_TRIP", payload: trip });
      return trip;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: (err as Error).message });
      return null;
    }
  }, []);

  const removeTrip = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete trip");
      dispatch({ type: "DELETE_TRIP", payload: id });
      return true;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: (err as Error).message });
      return false;
    }
  }, []);

  return (
    <TripContext.Provider
      value={{ ...state, fetchTrips, addTrip, updateTrip, removeTrip }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTripContext must be used within TripProvider");
  return ctx;
}
