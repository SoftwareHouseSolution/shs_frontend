/* The client directory.

   A static route segment beats the dynamic [slug] one, so this file wins for /customers.
   Its header copy and intro video are the CMS page with slug "customers" (template
   "Customers"); the roster, the region map data and the featured strip come from the
   clients API.

   Server component. Only ClientMap, CustomerVideoModal and Contact carry "use client";
   the header, the metadata and the 367-client fetch all stay on the server. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/hero/PageHeader";
import { ClientMap } from "@/components/clients/ClientMap";
import { CustomerVideoModal } from "@/components/clients/CustomerVideoModal";
import { Contact } from "@/components/sections/Contact";
import { UI } from "@/content/ui";
import { href as localeHref, isLocale } from "@/content/i18n";
import { getClientTaxonomy, getClients, getPage } from "@/lib/api/content";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const page = await getPage(lang, "customers");
  return {
    title: page.metaTitle,
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
  const [page, clients, taxonomy] = await Promise.all([
    getPage(lang, "customers"),
    getClients(lang),
    getClientTaxonomy(lang),
  ]);

  return (
    <>
      <PageHeader
        title={page.title}
        eyebrow={page.eyebrow}
        lede={page.lede}
        image={page.headerImage}
        crumbs={[
          { label: UI[lang].crumbHome, href: localeHref(lang, "/") },
          ...(page.breadcrumbParent ? [{ label: page.breadcrumbParent }] : []),
          { label: page.title },
        ]}
        lang={lang}
      />
      <ClientMap clients={clients} taxonomy={taxonomy} lang={lang} />
      {/* The same #contact section the home page closes with, so the nav's "Book a demo"
          scrolls in-page here — see CONTACT_ROUTES in content/site.ts. */}
      <Contact lang={lang} />
      {/* Returns null until it opens, so it costs nothing on the server render. */}
      {page.video ? <CustomerVideoModal lang={lang} video={page.video} /> : null}
    </>
  );
}
