/* The client directory.

   A static route segment beats the dynamic [slug] one, so this file wins over
   app/(site)/[slug]/page.tsx automatically and that file needed no change. The
   `customers` record stays in content/pages.ts because PageSlug is derived from NAV —
   removing it would break the Record<PageSlug, PageContent> typecheck — and its header
   fields are reused here so the copy still lives in one place.

   Server component. Only ClientDirectory carries "use client"; the header, the metadata
   and the 367-item array all stay on the server. */

import type { Metadata } from "next";
import { PageHeader } from "@/components/hero/PageHeader";
import { ClientDirectory } from "@/components/clients/ClientDirectory";
import { CLIENTS } from "@/content/clients";
import { PAGES } from "@/content/pages";

const page = PAGES.customers;

export const metadata: Metadata = {
  title: page.title,
  description: page.metaDescription,
};

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title={page.title}
        eyebrow={page.eyebrow}
        lede={page.lede}
        image={page.image}
        crumbs={[{ label: "Home", href: "/" }, { label: "Customers" }, { label: page.title }]}
      />
      <ClientDirectory clients={CLIENTS} />
    </>
  );
}
