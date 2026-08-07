/* Events and team photography.

   Copy is the client's own, from
   `apps/softwarehouse-frontend/Software House Solutions Design System/ui_ux/
    drive-download-20260806T105756Z-1-001/Events time line.docx`.

   It is condensed, not rewritten. The source runs six to seven paragraphs per event and
   repeats "Jewelry ERP System", "Gold ERP Software", "Jewelry Management System" and
   "Jewelry Inventory Software" in near-identical sentences — read straight through, it
   scans as keyword stuffing next to the rest of the site. Every fact, claim and named
   party survives; only the repetition is cut. Spelling is normalised to the site's
   British "jewellery".

   ── Source file map ───────────────────────────────────────────────────────────────
   The originals are Facebook-CDN and iPhone filenames. Kept here so a photo on the page
   can be traced back to the drop it came from.

   nebu-2023-01.jpg      Nebu Expo 2023 _/487144720_1123445913128165_7942164351697695808_n.jpg
   nebu-2023-02.jpg      Nebu Expo 2023 _/487308024_1123445809794842_2166154019887768891_n.jpg
   nebu-2023-03.jpg      Nebu Expo 2023 _/487334524_1123445919794831_4723202617550280395_n.jpg
   nebu-2023-04.jpg      Nebu Expo 2023 _/487587693_1123445889794834_6985588512957964678_n.jpg
   nebu-2024-01.jpg      Nebu expo 2024/489802303_1134700735336016_9052715469415679213_n.jpg
   nebu-2024-02.jpg      Nebu expo 2024/490498626_1134701142002642_2163657602621307729_n.jpg
   nebu-2024-03.jpg      Nebu expo 2024/490719232_1136239138515509_7302791342896217095_n.jpg
   nebu-2024-04.jpg      Nebu expo 2024/490982051_1136239178515505_9087959217344228906_n.jpg
   ramadan-2025-01.jpg   Ramadan outing 2025/652829935_1422194083253345_1308070225260554899_n.jpg
   ramadan-2025-02.jpg   Ramadan outing 2025/653702846_1422193963253357_8070581043952316138_n.jpg
   ramadan-2025-03.jpg   Ramadan outing 2025/653712726_1422193923253361_7495168459331106590_n.jpg
   ramadan-2025-04.jpg   Ramadan outing 2025/654294427_1422193939920026_2543923682766540090_n.jpg
   lewis-opening-01.jpg  Lewis jewelry opening_/IMG_8359.HEIC
   lewis-opening-02.jpg  Lewis jewelry opening_/IMG_8345.HEIC
   lewis-opening-03.jpg  Lewis jewelry opening_/IMG_8354.HEIC
   lewis-opening-04.jpg  Lewis jewelry opening_/IMG_8356.HEIC

   All four Lewis photos were HEIC, which Chrome, Firefox and Edge cannot render. They
   were transcoded to JPEG once and committed; there is no image pipeline in this app and
   deliberately so — see the comment block in next.config.ts.

   Alt text describes what each photograph actually shows, written from the images rather
   than from the folder names. */

import type { Photo, TimelineEntry } from "./pages";

const EV = (f: string) => `/assets/events/${f}`;

const nebu2023: Photo[] = [
  { src: EV("nebu-2023-01.jpg"), alt: "Two Software House Solutions team members at the company stand during NEBU Expo 2023." },
  { src: EV("nebu-2023-02.jpg"), alt: "Four members of the SWH team in front of the stand's display wall at NEBU Expo 2023." },
  { src: EV("nebu-2023-03.jpg"), alt: "The SWH team with visiting jewellery business owners on the exhibition floor at NEBU Expo 2023." },
  { src: EV("nebu-2023-04.jpg"), alt: "Two colleagues beneath the stand's customer wall at NEBU Expo 2023." },
];

const nebu2024: Photo[] = [
  { src: EV("nebu-2024-01.jpg"), alt: "Three SWH colleagues at the company stand during NEBU Expo 2024." },
  { src: EV("nebu-2024-02.jpg"), alt: "Five members of the SWH team in front of the client display at NEBU Expo 2024." },
  { src: EV("nebu-2024-03.jpg"), alt: "SWH colleagues beside the stand's desktop and cloud application panel at NEBU Expo 2024." },
  { src: EV("nebu-2024-04.jpg"), alt: "The full Software House Solutions team under the company sign at NEBU Expo 2024." },
];

const ramadan2025: Photo[] = [
  { src: EV("ramadan-2025-01.jpg"), alt: "Colleagues gathered together at the SWH Ramadan company outing in 2025." },
  { src: EV("ramadan-2025-02.jpg"), alt: "A team member receiving a trophy and certificate of appreciation at the Ramadan outing." },
  { src: EV("ramadan-2025-03.jpg"), alt: "The Software House Solutions team photographed together at the Ramadan outing." },
  { src: EV("ramadan-2025-04.jpg"), alt: "Colleagues holding their certificates of appreciation at the Ramadan outing." },
];

const lewisOpening: Photo[] = [
  { src: EV("lewis-opening-01.jpg"), alt: "The SWH team outside the new Lewis Jewelry storefront on opening day." },
  { src: EV("lewis-opening-02.jpg"), alt: "Two colleagues in front of the Lewis Jewelry brand wall inside the new branch." },
  { src: EV("lewis-opening-03.jpg"), alt: "SWH staff behind the counter at the Lewis Jewelry Egypt opening." },
  { src: EV("lewis-opening-04.jpg"), alt: "The implementation team at the Lewis Jewelry counter during the grand opening." },
];

/* Reverse chronological. The Lewis opening carries no year: the source document places it
   last, after the 2025 outing, but never dates it and the photographs carry no usable
   EXIF. `year` is optional precisely so an undated entry does not force an invented one —
   fill it in once the date is confirmed. */
export const EVENTS: TimelineEntry[] = [
  {
    title: "Lewis Jewelry Egypt grand opening",
    paras: [
      "We joined the grand opening of Lewis Jewelry Egypt at Rock Gold — the second Lewis Jewelry branch implemented by Software House Solutions. After supporting their operations in the United States, we continued the partnership as they expanded into the Egyptian market.",
      "Ahead of the opening, our implementation specialists worked with the Lewis Jewelry team to configure the business end to end: product data, inventory, pricing, barcode systems, sales workflows, accounting processes and operational settings were all prepared so the branch could trade properly from its first day.",
      "Our team was on site through the opening itself to provide technical assistance and monitor operations. Standing beside a client during the event, not only during implementation, is the part of the job that decides whether a launch goes smoothly.",
    ],
    photos: lewisOpening,
  },
  {
    year: "2025",
    title: "Ramadan company outing",
    paras: [
      "Behind every implementation, every satisfied client and every release is a team. Our annual Ramadan outing is where we mark what that team has built over the year.",
      "The evening brought together every department — developers, technical support engineers, sales, marketing, finance, operations and administration — and included recognition for colleagues whose work stood out over the year.",
      "Technology powers the businesses we serve, but people are what deliver it. We continue to invest in ours.",
    ],
    photos: ramadan2025,
  },
  {
    year: "2024",
    title: "NEBU Expo 2024",
    paras: [
      "Following the previous year's exhibition, we returned to NEBU Expo 2024 with the latest version of our jewellery ERP and new capabilities built specifically for the gold and jewellery sector.",
      "Visitors saw how the system handles inventory, production tracking, accounting, purchasing, sales, branch control, customer management and reporting from one platform — and how that removes the inventory discrepancies and manual processes most jewellery businesses are still working around.",
      "The exhibition was also a chance to reconnect with existing clients. Our technical team answered sector-specific questions on the stand and walked through what a migration actually involves.",
    ],
    photos: nebu2024,
  },
  {
    year: "2023",
    title: "NEBU Expo 2023",
    paras: [
      "Software House Solutions took part in NEBU Expo 2023, one of the leading exhibitions for the gold and jewellery industry in Egypt and the Middle East. It gathers manufacturers, retailers, wholesalers, machinery suppliers, precious metal specialists and production technology firms in one place.",
      "We presented our Gold & Diamond ERP with live demonstrations covering inventory, production, purchasing, sales, accounting, workshops, multiple branches and customer relationships. The system is built for the specifics of the trade — karats, weights, manufacturing processes, barcode management and detailed reporting.",
      "Over the course of the exhibition our team met hundreds of business owners looking to replace manual processes and get accurate, real-time visibility of their stock. Several of those conversations became long-term partnerships.",
    ],
    photos: nebu2023,
  },
];

/** The Ramadan set again, for the culture gallery on /life-at-swh. */
export const TEAM_PHOTOS: Photo[] = ramadan2025;
