/* One client in the directory grid. Presentational — all the state lives in
   ClientMap. Not a link: the roster carries no per-client content beyond these four
   fields, so a detail page would be an empty shell. */

import type { Client } from "@/lib/api/types";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";

/* Name and location stay as the company profile records them, in both languages — see the
   note on Client in backend/apps/clients/models.py. The business-type chips are a closed set
   of three, so those do translate. */
export function ClientCard({
  client,
  lang,
  typeName,
}: {
  client: Client;
  lang: Locale;
  /** Localised business-type name for a key (from the CMS taxonomy). */
  typeName: (key: string) => string;
}) {
  return (
    <li className="swh-client-card">
      <div className="swh-client-card__logo">
        <img src={client.logo} alt={UI[lang].clientLogoAlt(client.name)} loading="lazy" decoding="async" />
      </div>
      <p className="swh-client-card__name">{client.name}</p>
      {client.location ? <p className="swh-client-card__loc">{client.location}</p> : null}
      {client.businessTypes.length ? (
        <ul className="swh-client-card__types">
          {client.businessTypes.map((t) => (
            <li key={t}>{typeName(t)}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
