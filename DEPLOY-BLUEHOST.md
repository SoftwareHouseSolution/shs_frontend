# Deploying to Bluehost

The site is fully static — no Node.js, no database, no server process. Bluehost only has to
serve files.

## Build

```
pnpm install
pnpm build:static
```

That writes **`out/`** — about 550 files, ~23 MB, everything included: HTML for all 17
routes, the JS/CSS bundles, fonts, all imagery and video, and the client logos.

## Upload

Upload the **contents** of `out/` into `public_html` — not the `out` folder itself.
`public_html/index.html` must exist when you are done, not `public_html/out/index.html`.

Via cPanel File Manager: zip `out/`, upload the zip to `public_html`, Extract, then move the
files up one level and delete the empty folder and the zip.

Via FTP: point the client at `public_html` and drag everything inside `out/`.

### Two things that are easy to lose

1. **`.htaccess`** is a dotfile. Some FTP clients hide dotfiles by default and cPanel's File
   Manager hides them until you tick *Show Hidden Files* in Settings. If it does not arrive,
   the site still works but 404s fall through to Bluehost's default error page instead of
   the site's own, and nothing gets cache headers.
2. **Upload everything, including `_next/`.** That folder holds the JS and CSS. Without it
   you get unstyled HTML.

## What the routes look like

The site is bilingual, and the language is part of the URL. Every page exists twice, once
under `/en/` and once under `/ar/`, and each is a folder with an `index.html` — so Apache
resolves all of them with no rewrite rules:

```
public_html/index.html                  ->  /              language gate (see below)
public_html/en/index.html               ->  /en/           English home
public_html/en/about-company/index.html ->  /en/about-company/
public_html/ar/index.html               ->  /ar/           Arabic home
public_html/ar/about-company/index.html ->  /ar/about-company/
public_html/404.html                    ->  any unknown URL
```

**The bare `/` is a language gate, not a page.** It is a tiny HTML file that forwards the
visitor to `/en/` or `/ar/` depending on what their browser asks for, falling back to
English. It exists because `output: "export"` produces plain files — there is no server to
issue a redirect and no middleware to run — so the forward has to happen in the document
itself. It works with JavaScript off (a `<meta http-equiv="refresh">` inside `<noscript>`)
and, failing even that, shows two links.

If you would rather Apache did the redirect, `.htaccess` can do it and the gate becomes
harmless dead weight; nothing else in the build depends on it.

`out/index.html` must therefore survive the upload like any other file. Deleting it because
"the home page is under /en/ now" leaves the domain root serving a directory listing or a
404, which is the first thing anyone typing the bare domain will hit.

## Updating the site later

Re-run `pnpm build:static` and re-upload. Delete the old `_next/` folder first — its
filenames contain content hashes, so old builds leave orphaned files behind that accumulate
but are never served.

## Notes

- `out/` is gitignored. It is a build artifact and goes stale as soon as content changes.
- `pnpm build` and `pnpm start` are unchanged and still work — the static export is gated
  behind `STATIC_EXPORT=1`, which `pnpm build:static` sets. This is deliberate: `output:
  "export"` disables `next start`, which `tools/check-home.mjs` and `tools/check-nav.mjs`
  need. Those scripts check English by default; set `SITE_LANG=ar` to run them against the
  Arabic build.
- The contact form is markup only. Nothing on the site posts to a backend, so there is
  nothing to configure server-side. If a working form is wanted later, that is the one part
  of this deploy that needs more than static files.
