"use client";

/* Search, facets and sort over the full client roster.

   Every card renders on the server first — all 367 are in the HTML — and filtering only
   ever hides. That keeps the page indexable and means it still shows the whole roster
   with JavaScript off; only the controls go inert. The images are `loading="lazy"`, so
   the weight of 367 logos is paid a screen at a time rather than up front. */

import { useMemo, useState } from "react";
import {
  BUSINESS_TYPES,
  REGIONS,
  type BusinessType,
  type Client,
  type Region,
  type Sector,
} from "@/content/clients";
import { ClientCard } from "./ClientCard";

type Sort = "az" | "za" | "region";

const SECTORS: { value: Sector; label: string }[] = [
  { value: "jewellery", label: "Jewellery" },
  { value: "enterprise", label: "Enterprise" },
];

/* Return a new Set rather than mutating — React is holding the old one. */
function toggle<T>(set: ReadonlySet<T>, v: T): Set<T> {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

export function ClientDirectory({ clients }: { clients: readonly Client[] }) {
  const [q, setQ] = useState("");
  const [sectors, setSectors] = useState<ReadonlySet<Sector>>(new Set());
  const [types, setTypes] = useState<ReadonlySet<BusinessType>>(new Set());
  const [regions, setRegions] = useState<ReadonlySet<Region>>(new Set());
  const [sort, setSort] = useState<Sort>("az");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = clients.filter((c) => {
      if (needle && !c.name.toLowerCase().includes(needle) && !c.location.toLowerCase().includes(needle)) {
        return false;
      }
      if (sectors.size && !sectors.has(c.sector)) return false;
      /* ANY, not ALL: the chips read as "show me manufacturers or wholesalers", not
         "manufacturers who are also wholesalers". */
      if (types.size && !c.types.some((t) => types.has(t))) return false;
      if (regions.size && !regions.has(c.region)) return false;
      return true;
    });
    const byName = (a: Client, b: Client) => a.name.localeCompare(b.name, "en");
    if (sort === "za") return [...out].sort((a, b) => byName(b, a));
    if (sort === "region") return [...out].sort((a, b) => a.region.localeCompare(b.region) || byName(a, b));
    return [...out].sort(byName);
  }, [clients, q, sectors, types, regions, sort]);

  const dirty = q !== "" || sectors.size > 0 || types.size > 0 || regions.size > 0;

  const chip = (facet: string, value: string, label: string, on: boolean, onClick: () => void) => (
    <button
      key={facet + value}
      type="button"
      className="swh-filters__chip"
      data-facet={facet}
      data-value={value}
      aria-pressed={on}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <section className="swh-directory">
      <div className="swh-directory__inner">
        <div className="swh-filters">
          <label className="swh-filters__field">
            <span className="swh-filters__label">Search</span>
            <input
              className="swh-filters__search"
              type="search"
              value={q}
              placeholder="Client or location"
              onChange={(e) => setQ(e.target.value)}
            />
          </label>

          <fieldset className="swh-filters__group">
            <legend className="swh-filters__label">Sector</legend>
            {SECTORS.map((s) =>
              chip("sector", s.value, s.label, sectors.has(s.value), () => setSectors(toggle(sectors, s.value))),
            )}
          </fieldset>

          <fieldset className="swh-filters__group">
            <legend className="swh-filters__label">Business</legend>
            {BUSINESS_TYPES.map((t) => chip("type", t, t, types.has(t), () => setTypes(toggle(types, t))))}
          </fieldset>

          <fieldset className="swh-filters__group">
            <legend className="swh-filters__label">Region</legend>
            {REGIONS.map((r) => chip("region", r, r, regions.has(r), () => setRegions(toggle(regions, r))))}
          </fieldset>

          <label className="swh-filters__field">
            <span className="swh-filters__label">Sort</span>
            <select
              className="swh-filters__sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="az">Name A–Z</option>
              <option value="za">Name Z–A</option>
              <option value="region">Region</option>
            </select>
          </label>

          <div className="swh-filters__bar">
            {/* aria-live: the count is the only feedback that a chip did anything, so a
                screen-reader user has to hear it change. */}
            <p className="swh-filters__count" aria-live="polite">
              {shown.length} of {clients.length} clients
            </p>
            {dirty ? (
              <button
                type="button"
                className="swh-filters__reset"
                onClick={() => {
                  setQ("");
                  setSectors(new Set());
                  setTypes(new Set());
                  setRegions(new Set());
                }}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="swh-filters__empty">No clients match those filters. Try clearing one.</p>
        ) : (
          <ul className="swh-client-grid">
            {shown.map((c) => (
              <ClientCard key={c.slug} client={c} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
