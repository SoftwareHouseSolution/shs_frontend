/* Content for the 17 interior routes.

   Keyed `Record<PageSlug, …>` against content/nav.ts, so adding a nav link without a page
   record — or misspelling either — is a TYPE ERROR at build time, not a runtime 404.

   Copy is drawn from SWH's own material: extract/impeccable_frontend_prd/product.md and
   PRODUCT.md. PRODUCT.md forbids fabricating case studies, certifications, awards, named
   customer outcomes, pricing, or timelines — so pages that would need those ship an honest
   "not published yet" body rather than invented filler. Replace these bodies with real
   content as it becomes available; the page structure does not need to change. */

import type { PageSlug } from "./nav";
import { SITE } from "./site";
import { EVENTS, TEAM_PHOTOS } from "./events";
import { CLIENTS } from "./clients";

export type StubBlock =
  | { kind: "intro"; eyebrow?: string; heading: string; body: string }
  | { kind: "cards"; heading?: string; items: { title: string; body: string }[] }
  | { kind: "numbered"; heading?: string; items: { title: string; body: string }[] }
  | { kind: "steps"; heading?: string; items: { n: string; title: string; body: string }[] }
  /* Full paths, not filenames: the old shape hardcoded /assets/clients/ and derived alt
     text from the slug ("el-handasia"). Partner marks live elsewhere and need real names. */
  | { kind: "logos"; label: string; logos: { src: string; alt: string }[] }
  | { kind: "hardware"; heading?: string; items: { n: string; title: string; image: string }[] }
  | {
      kind: "spec";
      heading?: string;
      columns: { label: string; highlight?: boolean }[];
      rows: { cells: { ok: boolean; text: string }[] }[];
    }
  | { kind: "timeline"; items: TimelineEntry[] }
  | { kind: "gallery"; heading?: string; items: Photo[] }
  | { kind: "cta"; heading: string; body: string; label: string; href: string };

export type Photo = { src: string; alt: string };

export type TimelineEntry = {
  /** Shown as the marker label. Omitted when the date is not established — see events.ts. */
  year?: string;
  title: string;
  /** One <p> each. */
  paras: string[];
  photos: Photo[];
};

export type PageContent = {
  /** <h1> and the breadcrumb leaf. */
  title: string;
  /** Mono label above the h1 — normally the parent nav group. */
  eyebrow: string;
  /** One sentence under the h1. */
  lede: string;
  /** Public path to the header image. */
  image: string;
  metaDescription: string;
  blocks: StubBlock[];
};

const IMG = {
  about: "/assets/imagery/slider_01.jpg",
  solutions: "/assets/imagery/slider_02.jpg",
  /* Was parallax_04.jpg. That file is a pre-darkened parallax plate — the black wash is
     BAKED INTO the pixels, so the page header's own scrim darkened an already-darkened
     image and the transparent navbar over it rendered as a solid black bar. No scrim value
     could fix that; the file itself was the problem. about_02 is unretouched, bright, and
     happens to be four hands joined over a desk, which is a better Partners image anyway. */
  partners: "/assets/imagery/about_02.jpg",
  customers: "/assets/imagery/slider_03.jpg",
  careers: "/assets/services/hardware.jpeg",
  /* Real photography now that it exists — the team under the stand sign, and the whole
     company at the Ramadan outing. Both beat the stock crops these pages used before. */
  events: "/assets/events/nebu-2024-04.jpg",
  team: "/assets/events/ramadan-2025-03.jpg",
} as const;

/** Reused wherever a page has nothing left to say but a next step. */
const contactCta = (heading: string, body: string): StubBlock => ({
  kind: "cta",
  heading,
  body,
  label: "Talk to us",
  href: SITE.demoHref,
});

/** For pages whose real content would require claims PRODUCT.md says not to invent. */
const notPublishedYet = (what: string): StubBlock => ({
  kind: "intro",
  heading: "Being prepared",
  body: `We are assembling ${what} for publication. Rather than fill this page with placeholder claims, we would rather show you the real material — get in touch and we will walk you through it directly.`,
});

export const PAGES: Record<PageSlug, PageContent> = {
  /* ---------------- About ---------------- */
  "about-company": {
    title: "About Company",
    eyebrow: "About",
    lede: `A regional market leader and solution provider, developing cutting-edge IT solutions for businesses across many industries since ${SITE.since}.`,
    image: IMG.about,
    metaDescription: `Software House Solutions has led the market since ${SITE.since}, building ERP and custom software for businesses across Egypt, Dubai, KSA and the USA.`,
    blocks: [
      {
        kind: "intro",
        eyebrow: "Who we are",
        heading: "Technology and business solutions, since 1988.",
        body: "Software House Solutions is committed to providing state-of-the-art development services to clients worldwide. Backed by a team of highly skilled and experienced developers, we extend those services using cutting-edge technologies, follow a structured development process, and deliver projects on time.",
      },
      {
        kind: "cards",
        heading: "What we do",
        items: [
          { title: "Enterprise ERP", body: "General ledger, inventory and asset tracking, manufacturing, membership and payroll in one connected system." },
          { title: "Gold & Diamond ERP", body: "A POS-integrated ERP built for retailers, manufacturers, wholesalers and bullion traders." },
          { title: "Hardware & Networking", body: "Premium quality hardware and networking solutions, backed by lifetime support." },
          { title: "Web & Mobile", body: "We give your product access to every device with the most cutting-edge technologies." },
        ],
      },
      {
        kind: "cards",
        heading: "Mission and vision",
        items: [
          { title: "Our edge", body: "Innovative, competitive and premium services are the main edge we have over the competition, and the commitment behind delivering our projects accurately, efficiently and on time." },
          { title: "Where we are going", body: "Having become the preferred software provider for most jewellery, retail and distribution companies in Egypt, we now aim to lead the ERP and mobility market across the Middle East and Africa." },
          { title: "Our people", body: "Our employees are our most crucial fixed asset. We help them grow individually in order to build a stronger company." },
        ],
      },
      contactCta("Want the longer version?", "We are happy to talk through our history, our team and how we work."),
    ],
  },

  "background-capabilities": {
    title: "Background & Capabilities",
    eyebrow: "About",
    lede: "Four decades of domain depth in the jewellery trade, alongside a full-stack IT practice.",
    image: IMG.about,
    metaDescription: "SWH's background in Gold & Diamond ERP and its wider capabilities across software, hardware, networking, and web and mobile development.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Background",
        heading: "Empowering jewellery businesses with technology.",
        body: "Our ERP is a comprehensive jewellery system that empowers retailers, manufacturers, wholesalers and bullion traders. This POS-integrated platform supports business management across jewellery and precious-stone segments, and we have helped hundreds of clients move from traditional to technology-driven management.",
      },
      {
        kind: "numbered",
        heading: "Core capabilities",
        items: [
          { title: "ERP Systems & General Ledger", body: "Financials, GL and reporting built for jewellery and enterprise alike." },
          { title: "Inventory & Asset Tracking", body: "Track every gram and asset across retail, manufacturing and wholesale." },
          { title: "Manufacturing & Payroll", body: "Production, membership management and payroll in one connected system." },
          { title: "POS Integration", body: "Point-of-sale integrated across gold, diamond and precious-stone segments." },
        ],
      },
      {
        kind: "numbered",
        heading: "Key achievements",
        items: [
          { title: "First to specialise in gold", body: "The first company to build an ERP for the gold sector alone, rather than adapting a general system to it." },
          { title: "First across every platform", body: "The first Egyptian company to issue gold accounting software as a desktop application, a cloud application, and iPhone and Android apps." },
          { title: "Authorised Zebra agents in Egypt", body: "We supply and support Zebra hardware directly, so the scanners and printers on your counter come from the same people who run your software." },
          { title: "We manufacture the consumables", body: "Jewellery reels are made in our own factories to high precision and constant weight, so the labels match the system." },
          { title: "Built for the region", body: "Value-added customisation and add-on packages developed for the way Middle East businesses actually trade." },
          { title: "Egypt and Dubai", body: "We have expanded beyond Egypt into Dubai, with further expansion planned." },
        ],
      },
      {
        kind: "spec",
        heading: "Where we differ",
        columns: [{ label: "SWH", highlight: true }, { label: "Generic vendor" }, { label: "In-house" }],
        rows: [
          { cells: [{ ok: true, text: "40 yrs Gold & Diamond domain" }, { ok: false, text: "Generic ERP" }, { ok: false, text: "Build from zero" }] },
          { cells: [{ ok: true, text: "POS-integrated ERP" }, { ok: true, text: "Add-on POS" }, { ok: false, text: "Manual entry" }] },
          { cells: [{ ok: true, text: "Local support + training" }, { ok: false, text: "Remote only" }, { ok: false, text: "None" }] },
          { cells: [{ ok: true, text: "Regional presence" }, { ok: false, text: "Single market" }, { ok: false, text: "None" }] },
        ],
      },
    ],
  },

  "our-team": {
    title: "Our Team",
    eyebrow: "About",
    lede: "Skilled, experienced developers and consultants who stay with your project after it goes live.",
    image: IMG.about,
    metaDescription: "The people behind Software House Solutions — development, implementation, support and training.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Our team",
        heading: "The people who deliver.",
        body: "We are pioneers in tackling software development and ERP systems, and our experts handle assigned projects prudently. Implementation, local support and training are handled by the same people who build the software.",
      },
      {
        kind: "steps",
        heading: "Our departments",
        items: [
          { n: "01", title: "Technical Team", body: "Implementation, migration and the onsite support agreements — the people who are there on opening day." },
          { n: "02", title: "Sales Team", body: "Scoping the business before anything is configured, so the system matches how you already trade." },
          { n: "03", title: "Programming Department", body: "Builds the ERP across desktop, cloud, iPhone and Android, including customisation for individual clients." },
          { n: "04", title: "Networking Department", body: "Designs and installs the network the branches and point of sale run on." },
          { n: "05", title: "Hardware Department", body: "Supplies and services the scanners, printers, POS machines and consumables, backed by lifetime support." },
        ],
      },
      contactCta("Meet the team", "We can introduce you to the people who would run your implementation."),
    ],
  },

  certificates: {
    title: "Certificates",
    eyebrow: "About",
    lede: "Our accreditations and partner certifications.",
    image: IMG.about,
    metaDescription: "Accreditations and partner certifications held by Software House Solutions.",
    blocks: [
      notPublishedYet("our current certificates and partner accreditations"),
      contactCta("Need documentation?", "We can send current certificates and accreditation details on request."),
    ],
  },

  /* ---------------- Solutions ---------------- */
  solutions: {
    title: "All Solutions",
    eyebrow: "Solutions",
    lede: "One comprehensive, POS-integrated ERP that turns your operation into clear, connected data.",
    image: IMG.solutions,
    metaDescription: "ERP and business solutions from Software House Solutions, including the specialist Gold & Diamond jewellery platform.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Solutions",
        heading: "Unlimited solutions to every business need.",
        body: "Cutting-edge technology for maximum satisfaction and measurable benefit to your business development — from a full-stack IT vendor.",
      },
      {
        kind: "cards",
        items: [
          { title: "Gold & Diamond ERP", body: "40 years servicing Gold & Diamond retail — the market leader in the G&D industry." },
          { title: "Enterprise ERP", body: "Financials, inventory, manufacturing, membership and payroll for businesses of any size." },
          { title: "POS Integration", body: "Point-of-sale integrated across gold, diamond and precious-stone segments." },
          { title: "Custom Software", body: "We develop the finest quality software, in a manner satisfying your business needs." },
        ],
      },
      contactCta("See it working", "Book a walkthrough and we will show you the modules that match your operation."),
    ],
  },

  services: {
    title: "All Services",
    eyebrow: "Solutions",
    lede: "Software, hardware, networking, and web and mobile development — from one vendor.",
    image: IMG.solutions,
    metaDescription: "Services from Software House Solutions: software development, hardware and networking, and web and mobile builds.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Services",
        heading: "A full-stack IT vendor.",
        body: "Our service: unlimited solutions to all your business needs. We offer cutting-edge technologies to ensure maximum satisfaction and benefit for your business development.",
      },
      {
        kind: "cards",
        items: [
          { title: "Software", body: "Manufacturing, wholesale and management programs, branch management, the Gold & Diamond program, and electronic invoice and receipt handling." },
          { title: "Hardware", body: "Scanners, card, thermal and barcode printers, printers and cartridges, point-of-sale machines, servers, PCs and laptops, rat-tail barcode papers and ribbons." },
          { title: "Network", body: "The network your branches and point of sale run on, designed and installed alongside the system that uses it." },
          { title: "Support & Training", body: "Reliable local support and prompt training assistance through the transition and beyond." },
        ],
      },
      {
        kind: "hardware",
        heading: "Our hardware services",
        items: [
          { n: "01", title: "POS & Laptops", image: "/assets/hardware/pos-laptops.webp" },
          { n: "02", title: "Scanners & Handheld", image: "/assets/hardware/scanners-handheld.webp" },
          { n: "03", title: "Printers", image: "/assets/hardware/printers.webp" },
          { n: "04", title: "Rat-tail Colour Ribbons", image: "/assets/hardware/rat-tail-ribbons.webp" },
        ],
      },
      {
        kind: "steps",
        heading: "How we work",
        items: [
          { n: "01", title: "Get Started", body: "Onboard your catalogue and POS in days — a smooth transition from traditional management." },
          { n: "02", title: "Configure & Migrate", body: "We adapt the ERP to your segment, then migrate your data with local support and training." },
          { n: "03", title: "Grow Your Business", body: "Make informed decisions from one connected view and scale across every location." },
        ],
      },
      {
        kind: "numbered",
        heading: "Onsite service agreements",
        items: [
          { title: "Parts and labour included", body: "Cover includes both parts and labour costs." },
          { title: "Six days a week, around the clock", body: "Technical assistance is available six days a week, 24 hours a day." },
          { title: "Repair or replace within 24 hours", body: "Repair or replacement happens within 24 hours of the initial call at the latest." },
          { title: "Accidental damage covered", body: "Cover extends to accidental physical damage across all non-consumable components." },
          { title: "Refresher training when you need it", body: "Training is repeated for existing or new members of your team whenever it is needed." },
          { title: "Reinstallation as you change", body: "We reinstall the solution as your needs change — a new location, a new back office." },
          { title: "Loan equipment in an emergency", body: "Temporary equipment is provided free of rent where your business would otherwise stop, arranged case by case." },
        ],
      },
    ],
  },

  /* ---------------- Partners ---------------- */
  "technology-partners": {
    title: "Technology Partners",
    eyebrow: "Partners",
    lede: "The platforms and hardware vendors our solutions are built on.",
    image: IMG.partners,
    metaDescription: "Technology partners of Software House Solutions — Microsoft, HP, Dell, Zebra and Bixolon — and authorised Zebra agency in Egypt.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Technology partners",
        heading: "The platforms we build on.",
        body: "Our systems are delivered on hardware and platforms from the industry's established vendors, and we are authorised agents for Zebra in Egypt — so the scanners and label printers on your counter come from the same people who run your software.",
      },
      {
        kind: "logos",
        label: "Our technology partners",
        logos: [
          { src: "/assets/partners/microsoft.webp", alt: "Microsoft" },
          { src: "/assets/partners/hp.webp", alt: "HP" },
          { src: "/assets/partners/dell.webp", alt: "Dell" },
          { src: "/assets/partners/zebra.webp", alt: "Zebra" },
          { src: "/assets/partners/bixolon.webp", alt: "Bixolon" },
        ],
      },
      contactCta("Partner with us", "Tell us about your platform and we will find the fit."),
    ],
  },

  "business-partners": {
    title: "Business Partners",
    eyebrow: "Partners",
    lede: "Resellers and implementation partners across the region.",
    image: IMG.partners,
    metaDescription: "Business partners, resellers and implementation partners of Software House Solutions.",
    blocks: [
      notPublishedYet("our current business partner list"),
      contactCta("Become a reseller", "We work with partners across Egypt and the wider region."),
    ],
  },

  "become-a-partner": {
    title: "Become A Partner",
    eyebrow: "Partners",
    lede: "Bring our ERP to your market, with our support behind you.",
    image: IMG.partners,
    metaDescription: "Partner with Software House Solutions to bring specialist ERP to your market.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Become a partner",
        heading: "Let's build something together.",
        body: `We work with technology and business partners across ${SITE.regions.join(", ")}. If you serve businesses that need ERP, point-of-sale or jewellery-specific systems, we would like to hear from you.`,
      },
      {
        kind: "steps",
        heading: "How it works",
        items: [
          { n: "01", title: "Get in touch", body: "Tell us about your market, your customers and what you already sell." },
          { n: "02", title: "Enablement", body: "We train your team on the platform and the implementation process." },
          { n: "03", title: "Go to market", body: "You sell and implement, with our support behind you." },
        ],
      },
      contactCta("Start the conversation", `Email ${SITE.salesEmail} or call ${SITE.phone}.`),
    ],
  },

  /* ---------------- Customers ---------------- */
  /* This record supplies the page header only. The body is the searchable directory in
     app/(site)/customers/page.tsx, which wins over [slug] because a static route segment
     beats a dynamic one. The record has to stay: PageSlug is derived from NAV, so
     deleting it breaks the Record<PageSlug, PageContent> typecheck. */
  customers: {
    title: "Our Clients",
    eyebrow: "Customers",
    lede: `${CLIENTS.length} jewellery and enterprise businesses running on our systems across ${SITE.regions.join(", ")}.`,
    image: IMG.customers,
    metaDescription: `The ${CLIENTS.length} jewellery retailers, manufacturers, wholesalers and enterprises running on Software House Solutions systems. Search and filter by sector, business type and region.`,
    blocks: [],
  },

  testimonials: {
    title: "Testimonials",
    eyebrow: "Customers",
    lede: "What our clients say about working with us.",
    image: IMG.customers,
    metaDescription: "Client testimonials for Software House Solutions.",
    blocks: [
      notPublishedYet("verified client testimonials"),
      contactCta("Talk to a client", "We can arrange a conversation with a customer in your segment."),
    ],
  },

  "case-studies": {
    title: "Case Studies",
    eyebrow: "Customers",
    lede: "Detailed accounts of implementations and their outcomes.",
    image: IMG.customers,
    metaDescription: "Implementation case studies from Software House Solutions.",
    blocks: [
      notPublishedYet("written case studies with verified figures"),
      contactCta("Ask for detail", "We can walk you through comparable implementations directly."),
    ],
  },

  /* ---------------- Standalone ---------------- */
  "news-events": {
    title: "News & Events",
    eyebrow: "Company",
    lede: "Exhibitions, client launches and the occasions we mark as a team.",
    image: IMG.events,
    metaDescription: "Software House Solutions at NEBU Expo, client store openings, and company events.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "News & events",
        heading: "Where you will find us.",
        body: "We exhibit at the trade's own events, and we turn up on site when a client opens their doors. What follows is a record of both.",
      },
      { kind: "timeline", items: EVENTS },
      contactCta("Meeting us in person?", "Tell us which event you are attending and we will make time for you."),
    ],
  },

  /* `blogs` was removed on 2026-08-07 along with its nav entry — see content/nav.ts. */

  /* ---------------- Careers ---------------- */
  vacancies: {
    title: "Vacancies",
    eyebrow: "Careers",
    lede: "We are always in search of great, enthusiastic minds who share our vision.",
    image: IMG.careers,
    metaDescription: "Open roles at Software House Solutions.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Vacancies",
        heading: "Join the team.",
        body: `We are always in search of great, enthusiastic minds who share our vision. If you are interested in joining our team, we would gladly receive your resume at ${SITE.careersEmail}.`,
      },
      notPublishedYet("our current list of open roles"),
      { kind: "cta", heading: "Send us your CV", body: `Email ${SITE.careersEmail} with your resume and the kind of work you are looking for.`, label: "Email careers", href: `mailto:${SITE.careersEmail}` },
    ],
  },

  internships: {
    title: "Internships",
    eyebrow: "Careers",
    lede: "Learn the trade on real systems, alongside the people who build them.",
    image: IMG.careers,
    metaDescription: "Internship opportunities at Software House Solutions.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Internships",
        heading: "Start here.",
        body: "Interns work alongside our development and implementation teams on real systems, not sample projects. If that sounds like the start you want, we would like to hear from you.",
      },
      notPublishedYet("details of our current intake"),
      { kind: "cta", heading: "Apply", body: `Email ${SITE.careersEmail} and tell us what you are studying and what interests you.`, label: "Email careers", href: `mailto:${SITE.careersEmail}` },
    ],
  },

  "life-at-swh": {
    title: "Life At SWH",
    eyebrow: "Careers",
    lede: "How we work, and what it is like here.",
    image: IMG.team,
    metaDescription: "Working at Software House Solutions — culture, teams and how we build.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "Life at SWH",
        heading: "Built by people who stay.",
        body: "We follow a structured process of development and offer timely project delivery. The same team that builds a system implements it, supports it and trains the people using it — which means the work you do here stays yours.",
      },
      {
        kind: "gallery",
        heading: "Our Ramadan outing",
        items: TEAM_PHOTOS,
      },
      contactCta("Curious?", "Ask us anything about working here."),
    ],
  },
};

/** Derived from PAGES so the route list and the content can never disagree. */
export const PAGE_SLUGS = Object.keys(PAGES) as PageSlug[];
