# Blog CMS: setup and operation

The admin at **https://www.fwdpod.com/admin** writes posts to Supabase. The public site stays static: every build pulls the posts the database says are public, prerenders them next to the markdown articles in `content/blog/`, and GitHub Actions uploads the result to GoDaddy. Supabase asks for that build automatically when something public changes.

```
admin (/admin) ──writes──> Supabase (blogs, RLS)
                               │  pg_cron every 3 min: "anything public changed?"
                               ▼
                     GitHub Actions (repository_dispatch: cms-publish)
                               │  npm test → npm run build (reads posts with the anon key)
                               ▼
                     FTPS upload of dist/ to GoDaddy public_html
```

**Visibility rule** (one definition, in the database: `public.blog_is_public()` in `supabase/migrations/0001_cms_schema.sql`): a post is public when `status = 'published'`, or `status = 'scheduled'` and `publish_at <= now()`. Nothing ever rewrites a scheduled post's status; it goes live because the clock passed its time.

Do the steps in order.

---

## 1. Local `.env`

In `fwdpod (1)/.env` (git-ignored):

```env
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
# Optional. Nothing uses it to talk to Supabase; the build only checks that it
# never appears in dist/. Never prefix it with VITE_.
SUPABASE_SECRET_KEY="sb_secret_..."
```

Where to find them: Supabase dashboard → **Project Settings → Data API** (URL) and **Project Settings → API Keys** (publishable and secret).

## 2. Database

Supabase → **SQL Editor → New query**, paste `supabase/migrations/0001_cms_schema.sql`, **Run**.

Then add the admin account:

1. **Authentication → Users → Add user → Create new user**: email + password, tick **Auto Confirm User**.
2. SQL Editor:
   ```sql
   insert into public.admin_users (email) values ('you@example.com');
   ```
3. **Authentication → Sign In / Providers**: turn **Allow new users to sign up** off. (Even if left on, a new sign-up can't touch the CMS: every policy checks `admin_users`.)

### Check that drafts can't leak (acceptance tests 1 and 2)

Run in the SQL Editor. It creates test rows, reads them as the public anon role, and rolls everything back:

```sql
begin;
insert into public.blogs (slug, title, status) values ('rls-test-draft', 'RLS test', 'draft');
insert into public.blogs (slug, title, status, publish_at) values ('rls-test-archived', 'RLS test', 'archived', now() - interval '1 day');
insert into public.blogs (slug, title, status, publish_at) values ('rls-test-future', 'RLS test', 'scheduled', now() + interval '1 day');
insert into public.blogs (slug, title, status, publish_at) values ('rls-test-due', 'RLS test', 'scheduled', now() - interval '1 minute');
set local role anon;
select slug, status from public.blogs where slug like 'rls-test-%';
rollback;
```

**Pass:** exactly one row, `rls-test-due | scheduled`. The draft, the archived post and the future-scheduled post are invisible, and the due post is public with its status still `scheduled`.

## 3. Try the admin locally

```bash
cd "fwdpod (1)"
npm run dev
```

Open http://localhost:3000/admin, sign in, write a post and save it as a draft. `npm run build` then shows `fetch-cms-posts: N public CMS post(s)`.

## 4. Automatic deploys

### 4a. GitHub secrets

GitHub → repository **priyasingh-ai/fwdpod.com** → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | same as `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | same as `.env` (the **publishable** key, never the secret one; the build refuses a secret key) |
| `FTP_SERVER` | GoDaddy cPanel → **FTP Accounts**, e.g. `ftp.fwdpod.com` |
| `FTP_USERNAME` | the FTP account's username |
| `FTP_PASSWORD` | its password |
| `FTP_SERVER_DIR` | the site's folder as that FTP account sees it, ending in `/`, usually `public_html/` (or `./` if the account is rooted at public_html) |

### 4b. First deploy, by hand

GitHub → **Actions → Build & deploy fwdpod.com → Run workflow**. Then run `scripts/seo-check.sh` from the [RUNBOOK](RUNBOOK.md) (Step 4) against the live site.

The first run uploads every file (about the size of the zip upload). After that only changed files go up. The action keeps its record in `public_html/.ftp-deploy-sync-state.json`; leave that file alone.

### 4c. Let Supabase trigger builds

1. Create a token: GitHub → your avatar → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
   - Resource owner: **priyasingh-ai**. Repository access: **Only select repositories → fwdpod.com**.
   - Repository permissions: **Contents: Read and write** (what `repository_dispatch` needs). Nothing else.
   - Set an expiry and diarise renewing it. When it expires, builds stop being requested; the dashboard card shows "Changes waiting".
2. Store it in Supabase Vault (SQL Editor):
   ```sql
   select vault.create_secret('github_pat_...', 'github_dispatch_token');
   ```
   To replace it later: `select vault.update_secret((select id from vault.secrets where name = 'github_dispatch_token'), 'github_pat_new...');`
3. Paste and run `supabase/migrations/0002_auto_deploy.sql`.

**Check:** publish a test post, wait about 5 minutes, then:

```sql
select * from public.deploy_state;
select status_code, content from net._http_response
 where id = (select last_request_id from public.deploy_state);   -- 204 = GitHub accepted it
```

A new run appears under GitHub **Actions**.

### Timing

- **Publish / edit a live post / unpublish / delete:** the change waits for 2 quiet minutes (so a burst of edits costs one build), the next 3-minute cron tick requests the build, and the build plus upload takes about 4–6 minutes. Expect it **live within about 10 minutes**.
- **Scheduled post:** requested on the first tick after its time, then the same build time.
- Builds are at least 5 minutes apart.

## 5. Writing posts

- **Publish Now** goes live at once with today's date. Re-publishing a live post keeps its original date.
- **Schedule** takes a date, time and time zone (default Asia/Kolkata) and must be in the future.
- **Import .md** fills every field from a markdown file: YAML frontmatter or a leading `<!-- Key: value -->` block. `SEO title:` fills the SEO title (never the H1), `Primary query:` fills the focus keyword, `## FAQ` becomes the FAQ, `## Related` the related posts.
- **SEO score:** live under the SEO title and meta description. The title is measured as Google shows it, with ` | Fwdpod` added. **Suggest** lists each failing rule, why it matters, and rewrites that pass every rule.
- **Links to other sites** are shown as plain text on the site (the articles never link off fwdpod.com). The editor warns about them.
- **Slug:** locked once a post is live. "Change URL" unlocks it, and the old URL 301-redirects to the new one from the next deploy.
- **Categories** are the five in `src/data/blogCategories.ts`. Each has its own page and SEO copy, so a new category is a code change.

## 6. Rollback and pausing

- **Site without the CMS posts:** GitHub → **Settings → Secrets and variables → Actions → Variables → New repository variable** `CMS_ENABLED` = `false`, then run the workflow. Delete the variable to restore.
- **Stop automatic builds:** `select cron.unschedule('cms-auto-deploy');` (re-run 0002 to restore).
- **Supabase down during a build:** the build fails before uploading, so the live site keeps its last good version.
- **Manual deploy:** still possible with the zip upload in [RUNBOOK.md](RUNBOOK.md).

## 7. Notes

- A **free** Supabase project pauses after a week without activity, which also stops the cron. Open the admin regularly or use a paid plan.
- `npm test` runs the acceptance tests: SEO scoring, the block-to-markdown conversion, the build with fixture posts (SEO tags, sitemap, ordering, slug clash, redirects, 404, no Supabase code on public pages, no secrets), and the outage behaviour. It runs before every deploy.
