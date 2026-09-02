/* One client in the directory grid. Presentational — all the state lives in
   ClientDirectory. Not a link: the roster carries no per-client content beyond these four
   fields, so a detail page would be an empty shell. */

import type { Client } from "@/content/clients";
import { BUSINESS_TYPE_LABEL } from "@/content/clients";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";

/* Name and location stay as the company profile records them, in both languages — see the
   note above REGION_LABEL in content/clients.ts. The business-type chips are a closed set
   of three, so those do translate. */
export function ClientCard({ client, lang }: { client: Client; lang: Locale }) {
  return (
    <li className="swh-client-card">
      <div className="swh-client-card__logo">
        <img src={client.logo} alt={UI[lang].clientLogoAlt(client.name)} loading="lazy" decoding="async" />
      </div>
      <p className="swh-client-card__name">{client.name}</p>
      {client.location ? <p className="swh-client-card__loc">{client.location}</p> : null}
      {client.types.length ? (
        <ul className="swh-client-card__types">
          {client.types.map((t) => (
            <li key={t}>{BUSINESS_TYPE_LABEL[lang][t]}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
