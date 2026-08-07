/* Where each region's marker sits on the map, and the Web Mercator maths that puts it
   there.

   ── WHY THIS FILE EXISTS AT ALL ─────────────────────────────────────────────────────

   A Google Maps `<iframe>` is cross-origin. There is no API to read its centre, its zoom,
   or its pan offset, and no event when the user drags it. So markers drawn on top of a
   PANNABLE embed come unstuck from their locations the moment anyone touches it — the map
   moves and the pins do not. Airbnb does not have this problem because it uses the Maps
   JavaScript API, which needs a billed API key.

   The way to get the look honestly without a key is to make the embed a fixed backdrop:
   locked centre, locked zoom, `pointer-events: none`. Once the viewport can never change,
   its geometry is known, and a marker's pixel position follows from the same projection
   Google itself uses. The map is then a picture of Egypt that our own interactive layer is
   registered to, rather than a live map we are guessing at.

   If a key is ever added, swap the iframe for the JS API and feed the same MARKERS array
   to real map markers — nothing else here needs to change.

   ── THE PROJECTION ──────────────────────────────────────────────────────────────────

   Web Mercator, the standard used by Google, OSM and every slippy map. `project` returns
   normalised world coordinates in 0..1; at zoom z the world is `TILE * 2^z` pixels across,
   so a marker's offset from the centre is just the difference scaled by that. */

export const TILE = 256;

/** Centre the embed is locked to. The zoom is DERIVED — see fitZoom.

    The centre is the midpoint of the anchor spread rather than the country's centroid: the
    map exists to hold the pins, and half of Egypt is empty desert with no clients in it. */
export const MAP = { lat: 28.9, lng: 31.5 } as const;

export type LatLng = { lat: number; lng: number };

/** Normalised Web Mercator world coordinates, both in 0..1. */
export function project({ lat, lng }: LatLng): { x: number; y: number } {
  const s = Math.sin((lat * Math.PI) / 180);
  return {
    x: (lng + 180) / 360,
    y: 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI),
  };
}

/** Marker offset from the container's centre, in CSS pixels, at a given zoom. */
export function offsetFromCentre(point: LatLng, zoom: number) {
  const p = project(point);
  const c = project(MAP);
  const world = TILE * Math.pow(2, zoom);
  return { dx: (p.x - c.x) * world, dy: (p.y - c.y) * world };
}

/* Label anchors, not true centroids.

   Greater Cairo and Giza share a river bank, and Alexandria and the Delta share a coast —
   four honest centroids would stack four pills into one unreadable clump. Each anchor is
   therefore pushed towards the part of its own region with the most room: Giza south-west
   into the governorate's desert extension, the Delta east towards Ismailia. Both are still
   inside the thing they name, which is the whole rule for map labels — a label sits where
   it can be read, within its own area.

   Some overlap between neighbouring pills remains and is fine; it is what Airbnb's own
   price pills do. CSS raises the hovered and selected pill above its neighbours so any
   pill can always be read and clicked.

   "International" and "Other" have no place on a map of Egypt and are deliberately absent;
   ClientMap renders them as chips beneath it instead of inventing coordinates. */
export const REGION_ANCHORS: Record<string, LatLng> = {
  "Greater Cairo": { lat: 30.05, lng: 31.25 },
  Giza: { lat: 29.15, lng: 30.35 },
  Alexandria: { lat: 31.25, lng: 29.85 },
  "Delta & Canal": { lat: 30.95, lng: 32.05 },
  "Upper Egypt": { lat: 26.1, lng: 32.6 },
  "Sinai & Red Sea": { lat: 28.55, lng: 33.95 },
};

/* Room a pill needs around its own anchor, so the outermost ones are not half-clipped by
   the frame. Proportional, not fixed: a flat 220px is right for a desktop pill and far too
   much of a 358px phone frame — it cost a whole zoom level there, which squeezed six pills
   into a third of the picture. The pills are correspondingly smaller at that width (see
   chrome.css), so the allowance should shrink with them. */
const pads = (w: number, h: number) => ({
  x: Math.min(220, w * 0.42),
  /* Vertical is the binding constraint on a wide, short window — the anchors span more
     screen vertically than horizontally. A 76px allowance for a ~34px pill was costing a
     whole zoom level on a laptop, which pulled Libya and Iraq into frame around a small
     Egypt. Half the pill plus a little is enough. */
  y: Math.min(52, h * 0.14),
});

/* How far the anchors spread, in normalised world units. Computed once at module scope. */
const SPREAD = (() => {
  const pts = Object.values(REGION_ANCHORS).map(project);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return { x: Math.max(...xs) - Math.min(...xs), y: Math.max(...ys) - Math.min(...ys) };
})();

/** Zoom bounds. Below 5 the country is a smudge; above 8 the pills stop overlapping but
    half the regions fall outside any sane frame. */
const MIN_ZOOM = 5;
const MAX_ZOOM = 8;

/**
 * The largest integer zoom at which every anchor still fits inside a `w` x `h` frame.
 *
 * The zoom cannot simply be a constant. It sets how many pixels apart the anchors are, and
 * a short viewport made "Upper Egypt" land below the frame's bottom edge — the pin was
 * computed correctly and drawn outside the box. Deriving it means the map reframes itself
 * rather than silently dropping a region, and it needs no per-breakpoint tuning.
 *
 * The result also goes into the embed URL, so the backdrop and the pins always agree.
 */
export function fitZoom(w: number, h: number): number {
  const pad = pads(w, h);
  for (let z = MAX_ZOOM; z > MIN_ZOOM; z--) {
    const world = TILE * Math.pow(2, z);
    if (SPREAD.x * world <= w - pad.x && SPREAD.y * world <= h - pad.y) return z;
  }
  return MIN_ZOOM;
}

/** The locked embed URL for a given zoom. */
export function embedUrl(zoom: number): string {
  return `https://www.google.com/maps?ll=${MAP.lat},${MAP.lng}&z=${zoom}&output=embed&hl=en&t=m`;
}
