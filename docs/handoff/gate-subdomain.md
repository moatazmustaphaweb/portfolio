# `gate.moatazmustapha.com` — subdomain handoff

Task `021230826`, 2026-08-23. Two things live here: **the brief to send to Cloud CoWork**, and
**the slots it fills in when it comes back**.

**Nothing in this file launches the site.** The subdomain can resolve, verify and hold a valid
certificate while the project is still behind Vercel's deployment protection — a visitor gets a
Vercel login, not the portfolio. **Turning that off is the launch**, it is one switch, and it is
Moataz's. It is deliberately outside the brief below.

---

## Facts the brief depends on

Measured 2026-08-23, not remembered. Re-run `list_teams` / `list_projects` if this is being read
later.

| | |
|---|---|
| Registrar | **GoDaddy** |
| Apex | `moatazmustapha.com` — **registered, and already serving a site** |
| New subdomain | `gate.moatazmustapha.com` |
| Vercel team | `Moataz Portfolio` · `moataz-portfolio` · `team_9wIC827xg9APrboIsvjeTOiA` · Hobby |
| Vercel project | `portfolio` · `prj_V6FGgXOikzQaXpysT1WJcJmRlwVq` |
| Git link | `moatazmustaphaweb/portfolio`, builds on every push to `main` |

**The apex being live is the whole reason this brief is written defensively.** A subdomain is a
purely additive change — one new record, nothing else touched — and every instruction below exists
to keep it that way.

---

## THE BRIEF — send this verbatim

> **Goal:** make `gate.moatazmustapha.com` resolve to the Vercel project `portfolio`, verified, with
> a valid TLS certificate. Add nothing else and change nothing else.
>
> **Registrar:** GoDaddy, under Moataz's account.
> **Vercel team:** `moataz-portfolio` (`team_9wIC827xg9APrboIsvjeTOiA`), Hobby plan.
> **Vercel project:** `portfolio` (`prj_V6FGgXOikzQaXpysT1WJcJmRlwVq`).
>
> ⚠️ **`moatazmustapha.com` is a live domain serving an existing site, and its DNS is hosted at
> GoDaddy.** You are adding one subdomain to it. You are not migrating it, not re-pointing it, and
> not tidying it.
>
> ### Step 1 — Vercel first, GoDaddy second
>
> Add the domain to the project **before** touching DNS:
>
> ```
> vercel domains add gate.moatazmustapha.com --scope moataz-portfolio
> vercel domains inspect gate.moatazmustapha.com --scope moataz-portfolio
> ```
>
> (Or: Vercel dashboard → project `portfolio` → Settings → Domains → Add.)
>
> **`inspect` prints the exact record Vercel wants. Use what it prints.** Vercel's own docs
> currently disagree with themselves about the CNAME target — one page says `cname.vercel-dns.com`,
> the newer CLI reference says `cname.vercel-dns-0.com`, and the value is per-project in some
> accounts. **Do not copy a value out of a tutorial, including this one.** Read it from `inspect`
> or from the dashboard's Domains panel and report which one you were given.
>
> ### Step 2 — GoDaddy: create exactly one record
>
> GoDaddy → Domain Portfolio → `moatazmustapha.com` → **DNS** → Add New Record.
>
> | Field | Value |
> |---|---|
> | Type | `CNAME` |
> | Name | `gate` |
> | Value | *whatever step 1 printed* |
> | TTL | `600` seconds (custom) if the UI allows, else the default hour |
>
> **The Name field takes `gate`, not `gate.moatazmustapha.com`.** GoDaddy appends the zone itself;
> entering the full name creates `gate.moatazmustapha.com.moatazmustapha.com`, which resolves for
> nobody and looks correct in the table. This is the single most common way this task fails.
>
> **Before you save, look at the existing records for two interceptors:**
> - a wildcard `*` CNAME or A record — it will answer for `gate` and can mask your record
> - GoDaddy **Domain Forwarding** or a Parked/"Website Builder" entry — it can override subdomains
>
> If either is present, **stop and report it**. Do not remove it.
>
> ### Step 3 — verify, and wait properly
>
> ```
> dig CNAME gate.moatazmustapha.com +short
> dig gate.moatazmustapha.com +short
> curl -sSI https://gate.moatazmustapha.com | head -1
> ```
>
> Then confirm in Vercel that the domain reads **Valid Configuration** and that a certificate has
> been issued (`vercel certs ls --scope moataz-portfolio`).
>
> A `401` or a Vercel login page at the end is **the expected, correct result** — the project is
> behind deployment protection on purpose. It proves the domain is wired. Do not try to get past it.
>
> ### Report back, with the actual strings
>
> 1. The exact CNAME target Vercel asked for
> 2. The record as GoDaddy saved it — type, name, value, TTL — copied from the table, not from memory
> 3. `dig` output for both queries
> 4. Vercel's configuration status and certificate status
> 5. Anything you found and did not touch
>
> ### DO NOT
>
> - **Do not change the nameservers.** GoDaddy hosts this zone. Moving DNS to Vercel — which some
>   Vercel flows suggest — takes the existing apex site and its email offline.
> - Do not edit or delete any existing record. In particular the apex `A`/`CNAME`, any `MX`, and any
>   `TXT` (SPF, DKIM, verification tokens).
> - Do not add `www`, the apex, or any redirect.
> - Do not disable Deployment Protection, and do not create a protection bypass.
> - Do not add, edit or remove environment variables.
> - Do not deploy, redeploy, promote, roll back, or push to `main`.
> - Do not buy, transfer or renew anything.
>
> If a step cannot be completed as written, **stop and report** rather than choosing an alternative.

---

## FILL IN WHEN IT COMES BACK

Replace each `…`. Leave a line blank rather than guessing — a wrong value here gets quoted into a
brief later, which is how three separate claims in `CLAUDE.md` went stale this month.

```yaml
# ── returned by Cloud CoWork ────────────────────────────────────────────────
subdomain:          gate.moatazmustapha.com
cname_target:       …    # exactly what `vercel domains inspect` printed
godaddy_record:
  type:             CNAME
  name:             …    # should read `gate`
  value:            …
  ttl:              …
dig_cname:          …
vercel_status:      …    # "Valid Configuration" / "Invalid Configuration"
certificate:        …    # issued? for which names?
https_response:     …    # 401 behind protection is correct
found_but_untouched: …   # wildcards, forwarding, anything odd
date_completed:     …
```

---

## THE VERCEL SIDE — what is actually needed from Moataz

**One thing: an API token.** Everything else is either already reachable or already on this machine.

```
vercel.com/account/settings/tokens  →  Create Token
   name   anything
   scope  Moataz Portfolio          ← must be the team, not "Personal Account"
   expiry 90 days is fine
```

**Where it goes:** `.env.vercel.local` in the repo root, as `VERCEL_TOKEN=…`. That path is already
gitignored by the `.env*` rule, and the reason is practical rather than cautious — **GitHub and
Vercel both scan pushed commits for Vercel tokens and revoke them automatically**, so a token
written into a tracked `.md` is dead before it is used.

**What the token unlocks, none of which is available through the MCP connection I already have:**

| | |
|---|---|
| `vercel domains add` | attaching the subdomain — the MCP exposes no add-domain tool |
| environment variables | the ten below; no MCP tool for these either |
| deployment protection | the launch switch — MCP *can* do this one, so the token is not required for it |

**If you would rather not issue a token at all**, the alternative costs four clicks in the dashboard
and no credential leaves your hands. Say so and I will write the exact click path instead.

### The environment variables, and the three that stay here

Ten go to Vercel, **Production** scope. **Eight of them I already hold** in `.env.local` and need
nothing from you.

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | have it |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | have it |
| `SUPABASE_SERVICE_ROLE_KEY` | have it |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | have it |
| `RESEND_API_KEY` | have it |
| `CONTACT_NOTIFY_TO` | have it |
| `CONTACT_NOTIFY_FROM` | have it |
| `NEXT_PUBLIC_GA_ID` | have it |
| `REVALIDATE_SECRET` | **empty locally** — I generate one; it is ours to invent, not yours to supply |
| `NEXT_PUBLIC_SITE_URL` | `https://gate.moatazmustapha.com` — **pending the apex decision below** |

**Three secrets never need to leave this machine, and that is a finding rather than a preference:**

- **`NOTION_API_KEY`** — read only by `scripts/sync-notion.ts`, which runs locally. Nothing on the
  server touches Notion.
- **`CLOUDINARY_API_SECRET`** and **`NEXT_PUBLIC_CLOUDINARY_API_KEY`** — read by **no application
  code at all**. They exist for the signed-upload script. Rule 3 means the site only ever *builds*
  Cloudinary URLs, and building a delivery URL needs the cloud name and nothing else.

**And one must stay unset:** `NEXT_PUBLIC_PREVIEW_STUBS`. Setting it in Production ships the
coming-soon stub pages as if they were real routes.

---

## The one decision still open, held back deliberately

`NEXT_PUBLIC_SITE_URL` is what every canonical tag, `og:url`, `sitemap.xml` and `llms.txt` is built
from — `lib/seo/site.ts` resolves it, and it overrides Vercel's own `VERCEL_PROJECT_PRODUCTION_URL`.
Whatever goes in it becomes the address search engines and shared links treat as the real one.

So it depends on something not yet decided: **is `gate.` the portfolio's permanent home, or a
staging address while `moatazmustapha.com` still serves the existing site?** The DNS work is
identical either way, which is why the brief above does not wait on it.

**This is not a question being asked in this file** — it is recorded here so it does not get
silently defaulted. It will be asked on its own, after the subdomain exists.
