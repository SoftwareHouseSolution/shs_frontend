/* The location dropdown beside the client search: a button that opens a panel holding a
   search field and a list of every region with its areas beneath it.

   The panel is a real combobox rather than a styled <select>, because a native select
   cannot be searched and 65 areas need it. Focus stays in the search field the whole time
   the panel is open; the arrow keys move a highlight through aria-activedescendant, so a
   screen reader follows the list while typing still goes to the field.

   The panel is only rendered while open. It is chrome, not content, so there is nothing in
   it a crawler or a JS-off visitor is missing: the full roster is in the HTML regardless.

   No "use client": ClientMap, its only caller, already carries it. */

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, PinIcon, SearchIcon } from "@/components/feedback/icons";
import { foldText } from "./clientAreas";

export type LocationOption = {
  id: string;
  kind: "region" | "area";
  key: string;
  label: string;
  count: number;
  /** Already folded — see foldText. */
  search: string;
};

export function LocationFilter({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly LocationOption[];
  value: string | null;
  onChange: (option: LocationOption | null) => void;
  labels: { title: string; all: string; search: string; none: string };
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const selected = options.find((o) => o.id === value) ?? null;
  const needle = foldText(query.trim());
  /* null is the "All locations" row. Hidden while searching: it matches nothing typed, and
     it would otherwise be the row Enter picks. */
  const rows = useMemo<readonly (LocationOption | null)[]>(
    () => (needle ? options.filter((o) => o.search.includes(needle)) : [null, ...options]),
    [options, needle],
  );

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    setQuery("");
    // preventScroll: a pick is about to scroll to the results, and must not fight this.
    if (refocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const show = () => {
    // Opens on the current choice. -1 + 1 lands on "All locations" when there is none.
    setCursor(options.findIndex((o) => o.id === value) + 1);
    setOpen(true);
  };

  const pick = (option: LocationOption | null) => {
    close(true);
    onChange(option);
  };

  /* Before paint, and inside the tap that opened the panel: iOS only raises the keyboard
     for a focus that happens during the user's own gesture. */
  useLayoutEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector('[data-cursor="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, cursor]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (rows.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setCursor((c) => (c + step + rows.length) % rows.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cursor < rows.length) pick(rows[cursor]);
    } else if (e.key === "Escape") {
      /* Marked as handled so ClientMap's listener does not also clear the filter: Escape
         closes one thing at a time. preventDefault, not stopPropagation: the app hydrates
         on `document`, so React's listener shares a node with that one and cannot stop it. */
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      // Not prevented: focus returns to the button, and Tab then moves on from there.
      close(true);
    }
  };

  return (
    <div className="swh-loc" ref={rootRef}>
      <span className="swh-filters__label" id={`${id}-label`}>
        {labels.title}
      </span>
      <button
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        className="swh-loc__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-trigger`}
        onClick={() => (open ? close(false) : show())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            show();
          }
        }}
      >
        <span className="swh-loc__icon" aria-hidden="true">
          <PinIcon />
        </span>
        <span className="swh-loc__value">{selected?.label ?? labels.all}</span>
        <span className="swh-loc__chevron" aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </button>

      {open ? (
        <div className="swh-loc__panel">
          <span className="swh-search">
            <span className="swh-search__icon" aria-hidden="true">
              <SearchIcon />
            </span>
            {/* type="text", not "search": a search input's native Escape clears the field,
                which would swallow the first press instead of closing the panel. */}
            <input
              ref={inputRef}
              className="swh-filters__search swh-search__input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              aria-controls={`${id}-list`}
              aria-activedescendant={cursor < rows.length ? `${id}-opt-${cursor}` : undefined}
              aria-label={labels.search}
              placeholder={labels.search}
              value={query}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={onSearchKey}
            />
          </span>
          <ul
            ref={listRef}
            id={`${id}-list`}
            className="swh-loc__list"
            role="listbox"
            aria-labelledby={`${id}-label`}
            data-searching={needle !== ""}
          >
            {rows.map((o, i) => (
              <li
                key={o?.id ?? "all"}
                id={`${id}-opt-${i}`}
                className="swh-loc__opt"
                role="option"
                aria-selected={(o?.id ?? null) === value}
                data-kind={o?.kind ?? "region"}
                data-location={o?.id ?? ""}
                data-cursor={i === cursor}
                /* mousemove, not mouseenter: a row sliding under a still pointer while the
                   arrow keys scroll the list must not take the highlight away from them. */
                onMouseMove={() => setCursor(i)}
                onClick={() => pick(o)}
              >
                <span className="swh-loc__opt-name">{o?.label ?? labels.all}</span>
                {o ? <span className="swh-loc__opt-n">{o.count}</span> : null}
              </li>
            ))}
          </ul>
          {rows.length === 0 ? (
            <p className="swh-loc__none" role="status">
              {labels.none}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
