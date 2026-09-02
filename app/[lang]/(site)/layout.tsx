import { PageShell } from "@/components/chrome/PageShell";
import { isLocale, DEFAULT_LOCALE } from "@/content/i18n";

/* Server component. `children` is rendered on the server and passed into the client
   PageShell as a prop, so the interior pages stay server components even though the
   shell wrapping them is a client component.

   The locale is re-read from params here rather than threaded down from the [lang] layout:
   a layout cannot pass props to the layout below it, only to its children as a slot. The
   validity check already happened one level up — this one only narrows the type, so the
   fallback is unreachable in practice. */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PageShell lang={isLocale(lang) ? lang : DEFAULT_LOCALE}>{children}</PageShell>;
}
