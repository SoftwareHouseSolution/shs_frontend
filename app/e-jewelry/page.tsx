/* /e-jewelry/ — the E-Jewelry install page, Arabic. English is /e-jewelry/en/.
   The page itself is components/ejewelry/InstallPage.tsx. */

import type { Metadata } from "next";
import { InstallPage } from "@/components/ejewelry/InstallPage";

export const metadata: Metadata = {
  title: "E-Jewelry — حمّل التطبيق",
  description: "المخزون والجرد والفواتير في إيدك",
  alternates: { canonical: "/e-jewelry/", languages: { ar: "/e-jewelry/", en: "/e-jewelry/en/" } },
};

export default function Page() {
  return <InstallPage lang="ar" />;
}
