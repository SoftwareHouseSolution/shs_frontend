/* A testimonial's picture: the shop photo (or a logo) whole, over a blurred copy of itself.

   Testimonials carry both kinds — a client review's shop photo and a company's square logo —
   and no single object-fit suits both: `cover` crops a logo, `contain` leaves a photo in
   bars. The blurred backdrop fills the frame in the image's own colours, so either kind
   sits in the same frame without bars or crops. Without a picture, the author's initial.

   No hooks and no "use client": safe in server and client trees alike. */

/* Honorifics an author's name often starts with; the initial skips them. */
const TITLES = new Set(["الحاج", "الحاجة", "الأستاذ", "الأستاذة", "المهندس", "الدكتور", "عم", "Mr", "Mrs", "Ms", "Dr", "Eng"]);

/** "الحاج طارق" → "ط", "أ. منى" → "م", "الشربيني" → "ش", "Mr. Mohammed" → "M". */
export function initialOf(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => !w.endsWith(".") && !TITLES.has(w.replace(/\.$/, "")));
  const word = (words[0] ?? name.trim()).replace(/^ال(?=\p{L}{2})/u, "");
  return word.slice(0, 1).toUpperCase();
}

export function Portrait({ src, name, className = "" }: { src: string | null; name: string; className?: string }) {
  if (!src) {
    return (
      <span className={`swh-portrait swh-portrait--initial ${className}`} aria-hidden="true">
        {initialOf(name)}
      </span>
    );
  }
  return (
    <span className={`swh-portrait ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="swh-portrait__backdrop" src={src} alt="" decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="swh-portrait__img" src={src} alt="" decoding="async" />
    </span>
  );
}
