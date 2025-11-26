"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/lib/types";

function createNumberedIcon(number: number, isHighlighted: boolean) {
  const size = isHighlighted ? 36 : 28;
  const bgColor = isHighlighted
    ? "linear-gradient(135deg, #7d9074 0%, #5a6b52 100%)"
    : "linear-gradient(135deg, #c4703f 0%, #a65d3f 100%)";
  const borderWidth = isHighlighted ? 3 : 2;

  return L.divIcon({
    className: "custom-marker-numbered",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${bgColor};
          border: ${borderWidth}px solid #faf6f1;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(61, 61, 61, 0.3);
          ${isHighlighted ? "animation: pulse-marker 1s ease-in-out infinite;" : ""}
        "></div>
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #faf6f1;
          font-weight: bold;
          font-size: ${isHighlighted ? 14 : 12}px;
          font-family: system-ui, sans-serif;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">${number}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

interface MapViewProps {
  places: Place[];
  highlightedPlaceId: number | null;
  onPlaceClick: (placeId: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

function MapBoundsHandler({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length > 0) {
      const bounds = L.latLngBounds(
        places.map((p) => [p.latitude, p.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [places, map]);

  return null;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function HighlightHandler({
  places,
  highlightedPlaceId,
}: {
  places: Place[];
  highlightedPlaceId: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (highlightedPlaceId) {
      const place = places.find((p) => p.id === highlightedPlaceId);
      if (place) {
        map.setView([place.latitude, place.longitude], map.getZoom(), {
          animate: true,
        });
      }
    }
  }, [highlightedPlaceId, places, map]);

  return null;
}

export function MapView({
  places,
  highlightedPlaceId,
  onPlaceClick,
  onMapClick,
}: MapViewProps) {
  const mapRef = useRef<L.Map>(null);

  const defaultCenter: [number, number] =
    places.length > 0
      ? [places[0].latitude, places[0].longitude]
      : [48.8566, 2.3522]; // Default to Paris

  return (
    <MapContainer
      center={defaultCenter}
      zoom={places.length > 0 ? 12 : 4}
      className="h-full w-full rounded-xl"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapBoundsHandler places={places} />
      <MapClickHandler onMapClick={onMapClick} />
      <HighlightHandler places={places} highlightedPlaceId={highlightedPlaceId} />

      {places.map((place, index) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={createNumberedIcon(index + 1, place.id === highlightedPlaceId)}
          eventHandlers={{
            click: () => onPlaceClick(place.id),
          }}
        >
          <Popup>
            <div className="font-sans">
              <p className="font-semibold text-charcoal">{place.name}</p>
              {place.address && (
                <p className="text-sm text-clay mt-1">{place.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
