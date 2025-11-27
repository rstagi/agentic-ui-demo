import { createUIResource } from "@mcp-ui/server";
import type { Trip, Place } from "@/lib/types";

// Generate a simple itinerary list view (no external dependencies)
function generateItineraryHtml(trip: Trip, places: Place[]): string {
  const placeItems = places.map((p, i) => `
    <div class="place-item">
      <div class="place-number">${i + 1}</div>
      <div class="place-info">
        <div class="place-name">${p.name}</div>
        ${p.address ? `<div class="place-address">${p.address}</div>` : ""}
        <div class="place-coords">${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>
      </div>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trip.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #faf6f1; }
    .header { padding: 16px; background: linear-gradient(135deg, #c4703f 0%, #a65d3f 100%); color: white; }
    .header h1 { font-size: 18px; margin: 0; }
    .header p { font-size: 13px; opacity: 0.9; margin-top: 4px; }
    .places { padding: 8px; }
    .place-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .place-number {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #c4703f 0%, #a65d3f 100%);
      border-radius: 50%;
      color: white;
      font-weight: bold;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .place-info { flex: 1; min-width: 0; }
    .place-name { font-weight: 600; color: #3d3d3d; font-size: 14px; }
    .place-address { color: #666; font-size: 12px; margin-top: 2px; }
    .place-coords { color: #999; font-size: 11px; margin-top: 4px; font-family: monospace; }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${trip.name}</h1>
    <p>${places.length} place${places.length !== 1 ? "s" : ""} in itinerary</p>
  </div>
  ${places.length > 0
    ? `<div class="places">${placeItems}</div>`
    : '<div class="empty-state">No places added yet</div>'}
</body>
</html>`;
}

export function createMapUIResource(trip: Trip, places: Place[]) {
  const html = generateItineraryHtml(trip, places);

  return createUIResource({
    uri: `ui://wanderlust/trip-map/${trip.id}`,
    content: { type: "rawHtml", htmlString: html },
    encoding: "text",
  });
}
