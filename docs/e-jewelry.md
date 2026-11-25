# E-Jewelry install page

## 1. What it is

A public page where shops install the E-Jewelry Android app.

| URL | What it does |
| --- | --- |
| `https://www.softwarehouse-sol.com/e-jewelry/` | Install page, Arabic |
| `https://www.softwarehouse-sol.com/e-jewelry/en/` | Install page, English |
| `https://www.softwarehouse-sol.com/e-jewelry/download` | Short link that the QR code points to. It reads `latest.json` and sends the phone straight to the newest APK. |
| `https://www.softwarehouse-sol.com/e-jewelry/android/latest.json` | Says which version is the newest and which APK file to get |
| `https://www.softwarehouse-sol.com/e-jewelry/android/EJewelry-<versionCode>.apk` | The app file itself |

The page reads `latest.json` in the browser, so a new version shows up without rebuilding the site.

**Never rename these.** Apps already installed on phones check
`/e-jewelry/android/latest.json` and then download the APK it names **from the same folder**.
If the folder, the `latest.json` name, or the `EJewelry-<versionCode>.apk` pattern changes, those
apps stop updating.

The APK and `latest.json` are **not** in git and **not** in the Docker image. They live on the
server in `/srv/e-jewelry/android/` and nginx serves them directly (Next.js never sees these
requests). For local development you may copy them into `public/e-jewelry/android/`, which is
gitignored.

`latest.json` looks like this:

```json
{"versionCode":2,"version":"1.2.0","apk":"EJewelry-2.apk","md5":"…","size":57727981,"minVersionCode":1,"notes":{}}
```

## 2. nginx (one-time setup)

Add this block to the **HTTPS** (`listen 443`) server block for `www.softwarehouse-sol.com`, above
the `location /` that does `proxy_pass http://127.0.0.1:8330`. Do not add it to the port-80 block:
that block should keep redirecting everything to HTTPS, so the files are only ever served over HTTPS.

```nginx
# E-Jewelry Android app files: served from disk, not by Next.js.
# ^~ means: once this prefix matches, nginx does not try the server's other regex locations.
location ^~ /e-jewelry/android/ {
    # root, not alias: the file for /e-jewelry/android/X is /srv/e-jewelry/android/X.
    # Same result as "alias /srv/e-jewelry/android/;" with none of alias's edge cases.
    root /srv;
    autoindex off;              # never list the folder

    # The version file. Must always be fresh, and readable from any origin.
    location = /e-jewelry/android/latest.json {
        types { }                               # drop the global mime map ...
        default_type application/json;          # ... so this is the only type
        add_header Cache-Control "no-cache" always;
        add_header Access-Control-Allow-Origin "*" always;
        add_header X-Content-Type-Options "nosniff" always;
        try_files $uri =404;
    }

    # The app files. A given file name never changes content, so cache it forever.
    location ~ ^/e-jewelry/android/EJewelry-[0-9]+\.apk$ {
        types { application/vnd.android.package-archive apk; }
        add_header Content-Disposition "attachment" always;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        add_header X-Content-Type-Options "nosniff" always;
        try_files $uri =404;
    }

    # Anything else under /e-jewelry/android/ (the bare folder, old names, guesses): 404.
    return 404;
}
```

Notes for nginx 1.18 (Ubuntu's version):

- **`add_header` does not add up.** A block that has its own `add_header` lines drops every
  `add_header` from the blocks around it (the server block included). If the server block sets
  headers such as `Strict-Transport-Security`, copy those lines into both inner blocks above too.
- **`types { }` replaces, it does not add.** That is why each inner block declares its own type.
  Without it, nginx 1.18's `mime.types` does not know `.apk` and would send `application/octet-stream`.
- **`return 404;` in the outer block** only runs when neither inner block matched. A request that
  hits an inner block never runs it.
- The `/e-jewelry/` page itself and `/e-jewelry/download` are not touched: they still go to Next.js.

Apply and check:

```bash
sudo nginx -t && sudo systemctl reload nginx

curl -I https://www.softwarehouse-sol.com/e-jewelry/android/latest.json
#  200, Content-Type: application/json, Cache-Control: no-cache, Access-Control-Allow-Origin: *

curl -I https://www.softwarehouse-sol.com/e-jewelry/android/EJewelry-2.apk
#  200, Content-Type: application/vnd.android.package-archive,
#  Content-Disposition: attachment, Cache-Control: public, max-age=31536000, immutable,
#  Content-Length matches "size" in latest.json

curl -I https://www.softwarehouse-sol.com/e-jewelry/android/
#  404 (no folder listing)
```

## 3. First release (one time)

The first two files are ready on the office PC in
`C:\Users\Admin\Desktop\07-archive\scratch\shs_frontend\e-jewelry\android\`:
`EJewelry-2.apk` and `latest.json`.

On the server, create the folder once:

```bash
sudo mkdir -p /srv/e-jewelry/android
sudo chmod 755 /srv /srv/e-jewelry /srv/e-jewelry/android
```

From the PC, copy both files to the server (APK first):

```bash
scp EJewelry-2.apk latest.json <ssh-login>@<server>:/tmp/
```

On the server, move them in (APK first, `latest.json` last), readable by nginx (`www-data`):

```bash
sudo install -m 644 /tmp/EJewelry-2.apk /srv/e-jewelry/android/EJewelry-2.apk
sudo install -m 644 /tmp/latest.json   /srv/e-jewelry/android/latest.json
rm /tmp/EJewelry-2.apk /tmp/latest.json
```

Then run the `curl -I` checks from section 2 and open `https://www.softwarehouse-sol.com/e-jewelry/`
on a phone.

## 4. Every new app build (native change)

Only needed when the app itself has to be reinstalled (new native code, new permissions, Expo SDK
upgrade). The website is not rebuilt.

1. Build the APK with EAS in the Gold-inventory repo.
2. Rename it `EJewelry-<versionCode>.apk`, e.g. `EJewelry-3.apk`. The number must be higher than
   the one in the current `latest.json`.
3. In Gold-inventory, write the new `latest.json` next to it:
   ```bash
   node scripts/write-latest-json.js path/to/EJewelry-3.apk 3 1.3.0
   # optional 4th argument: minVersionCode (oldest version still allowed to run)
   ```
4. Upload **the APK first**, then **`latest.json` last**, so a phone never reads a `latest.json`
   that points at a file that is not there yet. Same commands as section 3. On the server, put
   `latest.json` in place with `install` (or copy to a temp name and `mv`), so it switches in one step.
5. Done. The install page and the installed apps see the new version on their next check.

Keep the previous APK in the folder for a while (a few weeks), so a phone that read the old
`latest.json` a moment earlier can still finish its download. Delete old ones later by hand.

**JS-only fixes do not touch this page or this folder.** Ship them over the air from Gold-inventory:

```bash
npx eas-cli@latest update --channel handheld
```

## 5. If the site moves to Bluehost (static export)

Put the same two files in `public_html/e-jewelry/android/`, next to this `.htaccess`:

```apache
# public_html/e-jewelry/android/.htaccess
Options -Indexes

RewriteEngine On
# HTTPS only
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
# Only latest.json and EJewelry-<n>.apk exist here; everything else is 404
RewriteRule !^(latest\.json|EJewelry-[0-9]+\.apk)$ - [R=404,L]

<Files "latest.json">
    ForceType application/json
    Header set Cache-Control "no-cache"
    Header set Access-Control-Allow-Origin "*"
    Header set X-Content-Type-Options "nosniff"
</Files>

<FilesMatch "^EJewelry-[0-9]+\.apk$">
    ForceType application/vnd.android.package-archive
    Header set Content-Disposition "attachment"
    Header set Cache-Control "public, max-age=31536000, immutable"
    Header set X-Content-Type-Options "nosniff"
</FilesMatch>
```

The release steps are the same; only the upload target changes (File Manager or SFTP into that folder).

## 6. QR code

The QR code on the page encodes `https://www.softwarehouse-sol.com/e-jewelry/download`.
It was generated once (Python `qrcode`, error correction level M) and is inlined in
`components/ejewelry/qr.ts`. It never changes between builds: `/e-jewelry/download` always forwards
to whatever APK `latest.json` names. Printed QR codes keep working forever, as long as that URL stays.
