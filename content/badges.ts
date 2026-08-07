/* Certification / partner badges shown in the navbar's right cluster.

   DELIBERATELY EMPTY. No certificate assets exist anywhere in this repo (verified:
   `find . -iname "*cert*"` returns nothing). BadgeSlot renders NOTHING at all while this
   array is empty — not a broken image, not a placeholder box, not a stray flex gap.

   To populate: drop SWH's own certificate or partner-badge files into
   public/assets/badges/ and add an entry per file. Only add badges SWH actually holds —
   a certification mark asserts a credential, so an unearned one is a false claim, not a
   design placeholder. */

export type Badge = {
  /** Public path, e.g. "/assets/badges/example.png" */
  src: string;
  /** Describes the credential for screen readers. Never leave empty — these are meaningful. */
  alt: string;
  /** Optional link to the issuer's verification page. */
  href?: string;
};

export const BADGES: readonly Badge[] = [];
