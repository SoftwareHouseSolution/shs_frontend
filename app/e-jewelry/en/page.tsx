/* /e-jewelry/en/ — the E-Jewelry install page, English. */

import type { Metadata } from "next";
import { InstallPage } from "@/components/ejewelry/InstallPage";

export const metadata: Metadata = {
  title: "E-Jewelry — Download the app",
  description: "Stock, stock-takes and invoices in your hand",
  alternates: { canonical: "/e-jewelry/en/", languages: { ar: "/e-jewelry/", en: "/e-jewelry/en/" } },
};

export default function Page() {
  return <InstallPage lang="en" />;
}
