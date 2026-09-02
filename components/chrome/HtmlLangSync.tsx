"use client";

import { useEffect } from "react";

/* Copies the active locale's `lang` and `dir` onto the <html> element.

   WHY THIS EXISTS. app/[lang]/layout.tsx already puts both attributes on #app, server-side,
   and #app wraps every visible element — so the page reads and lays out correctly with
   JavaScript disabled and there is no direction flash. What #app cannot reach is the
   document element itself, and three things are decided there and nowhere else:

     - which side the browser puts the scrollbar on,
     - the direction the UA applies to text selection and to find-in-page,
     - what `document.documentElement.lang` reports to an extension or a screen reader
       that reads the document node rather than the focused subtree.

   A root layout cannot see route params (it sits above the [lang] segment), so those three
   are corrected here on mount instead. Everything user-visible is already right before this
   runs; this only tidies up the document node.

   Renders nothing. It is an effect with a component's shape, mounted once per layout. */
export function HtmlLangSync({ lang, dir }: { lang: string; dir: "ltr" | "rtl" }) {
  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = dir;
  }, [lang, dir]);

  return null;
}
