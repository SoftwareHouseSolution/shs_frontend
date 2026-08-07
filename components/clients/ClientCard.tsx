/* One client in the directory grid. Presentational — all the state lives in
   ClientDirectory. Not a link: the roster carries no per-client content beyond these four
   fields, so a detail page would be an empty shell. */

import type { Client } from "@/content/clients";

export function ClientCard({ client }: { client: Client }) {
  return (
    <li className="swh-client-card">
      <div className="swh-client-card__logo">
        <img src={client.logo} alt={`${client.name} logo`} loading="lazy" decoding="async" />
      </div>
      <p className="swh-client-card__name">{client.name}</p>
      {client.location ? <p className="swh-client-card__loc">{client.location}</p> : null}
      {client.types.length ? (
        <ul className="swh-client-card__types">
          {client.types.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
