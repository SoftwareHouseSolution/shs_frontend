"use client";

import { useSite } from "./SiteContext";

/* Certification / partner badges.

   Renders NOTHING when no badge is configured — no wrapper element, so there is no stray flex
   gap in the nav cluster, and no broken-image box. Badges are managed in the CMS (admin → Badges);
   none are configured until the company supplies documented credentials. */
export function BadgeSlot({ className = "swh-badges" }: { className?: string }) {
  const { badges } = useSite();
  if (badges.length === 0) return null;

  return (
    <div className={className}>
      {badges.map((b) => {
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
