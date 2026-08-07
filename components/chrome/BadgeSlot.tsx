import { BADGES } from "@/content/badges";

/* Certification / partner badges.

   Renders NOTHING when BADGES is empty — no wrapper element, so there is no stray flex
   gap in the nav cluster, and no broken-image box. That is the shipped state today: the
   repo contains no certificate assets. See content/badges.ts. */
export function BadgeSlot({ className = "swh-badges" }: { className?: string }) {
  if (BADGES.length === 0) return null;

  return (
    <div className={className}>
      {BADGES.map((b) => {
        const img = <img src={b.src} alt={b.alt} />;
        return b.href ? (
          <a key={b.src} href={b.href} target="_blank" rel="noopener noreferrer">
            {img}
          </a>
        ) : (
          <span key={b.src}>{img}</span>
        );
      })}
    </div>
  );
}
