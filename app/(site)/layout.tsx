import { PageShell } from "@/components/chrome/PageShell";

/* Server component. `children` is rendered on the server and passed into the client
   PageShell as a prop, so the interior pages stay server components even though the
   shell wrapping them is a client component. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
