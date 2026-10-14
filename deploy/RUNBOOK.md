# Deploying the SEO fixes to fwdpod.com

> Since the blog CMS was added, deploys normally run automatically from GitHub Actions (see [CMS-SETUP.md](CMS-SETUP.md)). This manual zip upload remains the fallback.

This runbook takes the SEO fixes from "working in the build" to "working on the live site". Do the steps in order. Each step says how to tell it worked and what to do if it didn't. Don't continue past a failed step.

It assumes:

- The git repository at `fwdpod final/`, on branch `seo/tab01-critical-fixes`.
- The project folder `fwdpod final/fwdpod (1)/`. **Never build from `fwdpod (1)/fwdpod (1)/`**: that is an old copy without the service pages.
- Git Bash (or any bash with `curl`) for the scripts, and PowerShell for the zip step.

---

## Step 0: Build from the right place

```bash
cd "fwdpod final/fwdpod (1)"
git -C .. branch --show-current     # must print: seo/tab01-critical-fixes
git -C .. status --short            # must show no lines starting with " M"
npm ci
npm run build
```

Run git with `-C ..`. Plain `git` inside `fwdpod (1)` talks to a second, half-merged repository in that folder.

**Pass**

- The build ends with `Prerendered 84 routes + 404 page into dist/_pages; wrote sitemap.xml`.
- This prints the five paths and no error:

  ```bash
  test ! -e dist/index.html && ls -a dist/.htaccess dist/_pages/index.html dist/sitemap.xml dist/robots.txt dist/llms.txt
  ```

**If it fails:** don't upload. A missing `dist/.htaccess` or a surviving `dist/index.html` would bring back the original empty-page problem.

---

## Step 1: Preflight the host (before touching the live site)

1. cPanel → **File Manager** → **Settings** (top right) → tick **Show Hidden Files (dotfiles)** → **Save**.
2. In `public_html`, create a folder named `_preflight`. Upload every file from `deploy/preflight-probe/` into it, **including `.htaccess`**. This does not change the live site.
3. Run:

   ```bash
   scripts/preflight.sh https://www.fwdpod.com
   ```

**Pass:** the last line is `RESULT: PASS`.

**If it fails**, find the message:

| Message contains | What it means | Do this |
|---|---|---|
| `probe not found` | The probe isn't at `public_html/_preflight/` | Re-upload it there, including `.htaccess`, and re-run |
| `.htaccess was not applied` | The server ignores `.htaccess` (nginx, or `AllowOverride None`) | **Stop.** Ask GoDaddy support to allow `.htaccess` overrides (`AllowOverride FileInfo` or `All`) for `public_html`. Without it the redirects and 404s silently do nothing |
| `HTTP 500 from the probe` | A directive the site needs isn't permitted | **Stop.** Same request to GoDaddy support |
| `proxy/CDN response headers`, `DNS is on Cloudflare`, or `TLS-terminating proxy` | A CDN ends HTTPS before Apache. The committed redirect would loop and take the site down | Replace the whole "Canonical URL" block in `public/.htaccess` with `deploy/htaccess-behind-proxy.snippet`, redo Step 0, then run `PROXY_MODE=1 scripts/preflight.sh https://www.fwdpod.com` |
| `HTTPS=off and no X-Forwarded-Proto` | HTTPS reaches the origin in some unknown way | **Stop** and find out how before deploying |
| `%{DOCUMENT_ROOT} check` | The site isn't at the document root (addon domain or subfolder) | **Stop.** Every page would 404. Tell the developer the real folder path |
| `[R=404]` or `ErrorDocument` | Real 404 responses won't work | **Stop** and report the message |

**Checking the host without the script**

cPanel has no screen that shows `AllowOverride`. Two facts help:

- The old site already depends on `.htaccess`: unknown URLs return the site's page instead of a server error, and only a rewrite rule does that.
- **General Information → Server Information** shows the Apache version.

The probe is still the only direct test that the new rules will work.

**One command to check for a proxy or CDN** (no upload needed):

```bash
curl -sI https://www.fwdpod.com/ | grep -iE '^(server|cf-ray|via|x-cache|x-served-by|x-amz-cf-id):'
nslookup -type=NS fwdpod.com
```

- **No proxy:** `Server: Apache`, none of the other headers, and nameservers ending in `domaincontrol.com`. This is what the site shows today.
- **Proxy in front:** any of `server: cloudflare`, `cf-ray`, `via`, `x-cache`, or nameservers ending in `ns.cloudflare.com`.

---

## Step 2: Back up, then remove the old files

1. File Manager → `public_html` → **Select All** → **Compress** → Zip, named `backup-before-seo-YYYYMMDD.zip`. **Download it to your computer.** This is your rollback.
2. Delete from `public_html`:
   - `index.html`
   - `assets/`
   - `sitemap.xml`
   - `robots.txt`
   - `favicon.svg`
   - `manifest.webmanifest`
   - `.htaccess`
   - any old `dist*.zip`
3. Keep:
   - `_preflight/` (until Step 5)
   - `.well-known/`
   - `cgi-bin/`
   - the backup zip
   - anything that isn't part of this website. If you're unsure, ask before deleting.

**Pass:** with hidden files shown, none of the deleted names remain.

**If `index.html` survives:** `https://www.fwdpod.com/index.html` keeps serving the old empty page with HTTP 200, which is the original problem. Delete it before continuing.

The site is offline between Step 2 and Step 3, so go straight on to Step 3.

---

## Step 3: Upload the build, including hidden files

Zip the **contents** of `dist` in **PowerShell**. Use the Windows `tar.exe`; it keeps `.htaccess` and writes paths Linux can extract.

```powershell
cd "C:\Users\ASUS\Downloads\fwdpod final\fwdpod (1)\dist"
tar.exe -a -c -f ..\site.zip .htaccess _pages assets admin.html blog-images favicon.svg llms.txt manifest.webmanifest robots.txt sitemap.xml
tar.exe -t -f ..\site.zip | Select-String -Pattern '^\.htaccess$','^_pages/index\.html$'
```

The last command must print **both** `.htaccess` and `_pages/index.html`. If it doesn't, don't upload.

Then:

1. Upload `site.zip` to `public_html`.
2. Right-click → **Extract** → into `/public_html`.
3. Delete `site.zip`.

**Pass**

- With hidden files shown, `public_html` has `.htaccess`, `_pages/`, `assets/`, `admin.html`, `blog-images/`, `favicon.svg`, `llms.txt`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, and **no** `index.html`.
- Quick checks:

  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' https://www.fwdpod.com/            # 200
  curl -s -o /dev/null -w '%{http_code}\n' https://www.fwdpod.com/index.html  # 404
  curl -sI http://fwdpod.com/ | grep -iE '^(HTTP|Location)'                     # 301, Location: https://www.fwdpod.com/
  ```

**If it fails**

- **`/` errors, or the browser says "too many redirects":** roll back now (see Rollback), then re-run Step 1 to find the cause.
- **`.htaccess` is missing after extraction:** upload `dist/.htaccess` on its own.

---

## Step 4: Automated acceptance

```bash
scripts/seo-check.sh https://www.fwdpod.com
```

**Pass:** the last line is `RESULT: PASS`.

**If it fails:**

| Failing check | Likely cause | Fix |
|---|---|---|
| Any "Canonical host redirects" line | `.htaccess` missing or old | Re-upload `dist/.htaccess`; re-run Step 1 |
| `GET /seo-check-missing-… -> 200` | Same | Same |
| A sitemap URL with `status 404` | `_pages/` incomplete | Re-upload `_pages/` |
| `<h1>` or body copy | Old files still served | Confirm `index.html` is gone; clear any host cache |
| `llms.txt` content-type `text/html` | `llms.txt` not uploaded | Upload it |

If visitors see a broken site at any point, roll back.

---

## Step 5: Remove the probe

Delete `public_html/_preflight/`.

**Pass:** this prints `404`:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://www.fwdpod.com/_preflight/https.txt
```

---

## Step 6: The checks the script cannot do

### 6a. Google Rich Results Test

Test each URL at <https://search.google.com/test/rich-results>, then again at <https://validator.schema.org>. The second tool covers the Organization, WebSite, Service and BlogPosting types that the Rich Results Test doesn't report.

| URL | Expected |
|---|---|
| `https://www.fwdpod.com/` | FAQ detected, **0 errors**. Google only shows FAQ results for well-known government and health sites, so it won't appear in search; that isn't a failure |
| `https://www.fwdpod.com/services/ai-agents` | Breadcrumbs detected, **0 errors** |
| `https://www.fwdpod.com/insights/what-is-a-forward-deployed-engineer` | Article and Breadcrumbs detected, **0 errors**. A warning about a missing `image` is expected: the articles have no images yet |

**Pass:** 0 errors for all three URLs in both tools. Warnings are fine, but write them down.

**If it fails:** send the error text and item name to the developer. Don't mark the structured-data finding Fixed.

### 6b. Google Search Console and Bing Webmaster Tools, both hosts

Public DNS for `fwdpod.com` already has a `google-site-verification=…` record. That means a Search Console **Domain** property was verified at some point. A Domain property covers `https://www.fwdpod.com`, `https://fwdpod.com` and `http://` in one place.

**Google**

1. Open <https://search.google.com/search-console> and check the property list.
   - **If `fwdpod.com` (Domain) is there and you have access:** use it.
   - **Otherwise:** **Add property → Domain → `fwdpod.com`** and verify with the DNS record, either the one already present or a new one added in GoDaddy DNS.
2. For per-host reports, also add **URL prefix** properties `https://www.fwdpod.com/` and `https://fwdpod.com/`. Verify each with **Domain name provider**.
3. **Sitemaps** → submit `https://www.fwdpod.com/sitemap.xml`.
   - **Pass:** status *Success*, 84 discovered URLs.
4. **URL Inspection** → `https://www.fwdpod.com/` → **Test live URL**.
   - **Pass:** "URL is available to Google". **View tested page → HTML** contains the homepage headline text. The user-declared canonical is `https://www.fwdpod.com/`.
   - Then click **Request indexing**.
5. **URL Inspection** → `https://fwdpod.com/` → **Test live URL**.
   - **Pass:** reported as a redirect to `https://www.fwdpod.com/`.

**Bing**

1. <https://www.bing.com/webmasters> → **Import from Google Search Console**. This is quickest; it brings over the verified sites and sitemaps. Or add the sites by hand:
   - Add `https://www.fwdpod.com/` and verify it: a `BingSiteAuth.xml` file in `public_html`, a meta tag, or a CNAME in GoDaddy DNS. Uploaded real files are served normally.
   - Add `https://fwdpod.com/` the same way.
2. Submit `https://www.fwdpod.com/sitemap.xml`.
3. **URL Inspection** on the homepage.
   - **Pass:** no robots.txt block, and the page can be indexed.

**If it fails**

- **"Blocked by robots.txt":** open `https://www.fwdpod.com/robots.txt` and check it matches the build.
- **"Redirect error":** re-run Step 4.
- **"Soft 404":** go back to Step 3 and confirm `index.html` is gone.

### 6c. `og-image.png`

Every page declares `https://www.fwdpod.com/og-image.png` (1200×630) as its share image. The file doesn't exist yet.

1. Export a **1200×630 PNG** named exactly `og-image.png`.
2. Upload it to the **root** of `public_html`. Not `_pages/`, not `assets/`.
3. Verify:

   ```bash
   curl -sI https://www.fwdpod.com/og-image.png | grep -iE '^(HTTP|Content-Type)'
   # expect: HTTP/1.1 200 OK   and   Content-Type: image/png
   curl -s https://www.fwdpod.com/og-image.png -o og-check.png
   python -c "import struct; b=open('og-check.png','rb').read(24); print('png' if b[:8]==bytes([137,80,78,71,13,10,26,10]) else 'NOT png', struct.unpack('>II', b[16:24]))"
   # expect: png (1200, 630)
   ```

4. Refresh social previews with <https://www.linkedin.com/post-inspector/> and <https://developers.facebook.com/tools/debug/> for `https://www.fwdpod.com/`.

**If it fails**

- **404 or `text/html`:** wrong folder, or wrong filename (it's case-sensitive).
- **Size is not `(1200, 630)`:** re-export at the right size.

---

## Rollback

If the live site breaks at any point:

1. File Manager → delete the newly uploaded files.
2. Extract `backup-before-seo-YYYYMMDD.zip` into `public_html`.

That restores the previous site, along with its original SEO problems.

---

## When each finding can be marked Fixed

| Finding | Proven live by |
|---|---|
| Content, one `<h1>` and real links in the server HTML | Step 4 (homepage and link-graph checks), plus the 6b URL Inspection HTML |
| Apex and `http://` redirect to `https://www` | Step 4 redirect checks, plus the 6b apex inspection |
| Real 404 status | Step 4 not-found check |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Step 4, plus 6b sitemap status *Success* |
| Structured data | 6a |
| Metadata: no keywords tag, unique titles, self canonicals | Step 4 sitemap checks |
| Share image | 6c |
