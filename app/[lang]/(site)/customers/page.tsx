/* The client directory.

   A static route segment beats the dynamic [slug] one, so this file wins over
   app/[lang]/(site)/[slug]/page.tsx automatically and that file needed no change. The
   `customers` record stays in content/pages.en.ts and pages.ar.ts because PageSlug is
   derived from NAV — removing it would break the Record<PageSlug, PageContent> typecheck —
   and its header fields are reused here so the copy still lives in one place.

   Server component. Only ClientMap, CustomerVideoModal and Contact's own children carry
   "use client"; the header, the metadata and the 367-item array all stay on the server.

   It has no generateStaticParams of its own: the `lang` param comes from
   app/[lang]/layout.tsx, so this page is emitted once per locale automatically. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/hero/PageHeader";
import { ClientMap } from "@/components/clients/ClientMap";
import { CustomerVideoModal } from "@/components/clients/CustomerVideoModal";
import { Contact } from "@/components/sections/Contact";
import { CLIENTS } from "@/content/clients";
import { PAGES } from "@/content/pages";
import { UI } from "@/content/ui";
import { href as localeHref, isLocale } from "@/content/i18n";
import { PARENT_OF } from "@/content/nav";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const page = PAGES[lang].customers;
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `/${lang}/customers`,
      languages: { en: "/en/customers", ar: "/ar/customers", "x-default": "/en/customers" },
    },
  };
}

export default async function CustomersPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const page = PAGES[lang].customers;
  const parent = PARENT_OF["/customers"];

  return (
    <>
      <PageHeader
        title={page.title}
        eyebrow={page.eyebrow}
        lede={page.lede}
        image={page.image}
        crumbs={[
          { label: UI[lang].crumbHome, href: localeHref(lang, "/") },
          ...(parent ? [{ label: parent[lang] }] : []),
          { label: page.title },
        ]}
        lang={lang}
      />
      {/* Was ClientDirectory — five rows of filter chips. ClientMap replaces the facets
          with a map of where the clients actually are; that file is kept on disk for
          reference and is no longer imported anywhere. */}
      <ClientMap clients={CLIENTS} lang={lang} />
      {/* The same #contact section the home page closes with. It is duplicated rather
          than linked because the nav's "Book a demo" scrolls in-page here instead of
          bouncing to the home page — see demoHrefFor / CONTACT_ROUTES in content/site.ts,
          which must list every route that mounts this. Contact's own children carry
          "use client", so this page stays a server component. */}
      <Contact lang={lang} />
      {/* Client component, and the only one that renders on top of the page. It returns
          null until it opens, so it costs nothing on the server render. */}
      <CustomerVideoModal lang={lang} />
    </>
  );
}
