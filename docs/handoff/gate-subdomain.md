# `gate.moatazmustapha.com` — subdomain handoff

Task `021230826`, 2026-08-23. **Updated the same day, task `022230826`: the Vercel half is done.**
Moataz supplied a team-scoped API token, so steps that were written as instructions for Cloud CoWork
have been executed here instead. **What is left is one DNS record at GoDaddy.**

**Nothing here launches the site.** The subdomain can resolve, verify and hold a valid certificate
while the project stays behind Vercel's deployment protection — a visitor gets a Vercel login, not
the portfolio. **Turning that off is the launch**, it is one switch, and it is Moataz's.

---

## State, measured

| | |
|---|---|
| Registrar | **GoDaddy** — nameservers `ns51.domaincontrol.com`, `ns52.domaincontrol.com` |
| Apex | `moatazmustapha.com` — **registered, already serving a site** |
| Subdomain | `gate.moatazmustapha.com` — **attached to the Vercel project, `verified: true`** |
| Vercel team | `Moataz Portfolio` · `team_9wIC827xg9APrboIsvjeTOiA` · Hobby |
| Vercel project | `portfolio` · `prj_V6FGgXOikzQaXpysT1WJcJmRlwVq` |
| DNS status | **`misconfigured: true`** — expected; the record below does not exist yet |
| Env vars | **22 set**, all ten the app reads |
| Deployment protection | **untouched, still on** |

---

## THE RECORD — this is the whole remaining task

```
Type   CNAME
Name   gate
Value  adc7fd9cd7faf2df.vercel-dns-017.com
TTL    600
```

### That value was worth waiting for

The first version of this brief deliberately refused to name a CNAME target, because Vercel's own
docs contradict themselves — `cname.vercel-dns.com` on the platform-elements page,
`cname.vercel-dns-0.com` in the CLI reference. **Both would have been wrong.**

`GET /v6/domains/gate.moatazmustapha.com/config` returns a **per-project** target,
`adc7fd9cd7faf2df.vercel-dns-017.com`, ranked above the generic `cname.vercel-dns.com` fallback.
A guessed value copied from a tutorial would have produced a record that looks correct in GoDaddy's
table and is not the one Vercel wants.

**The lesson generalises and is the same one this repo keeps relearning:** the value was not
derivable. It had to be asked for. See `docs/learn.md` Part 7 on Cloudinary public IDs — same shape,
different service.

---

## THE BRIEF — send this verbatim

> **Goal:** create one DNS record at GoDaddy so `gate.moatazmustapha.com` resolves to Vercel.
> The Vercel side is already done — the domain is attached and verified. **Do not touch Vercel.**
>
> **Registrar:** GoDaddy, Moataz's account. **Domain:** `moatazmustapha.com`.
>
> ⚠️ **`moatazmustapha.com` is live and serving an existing site, and GoDaddy hosts its DNS.**
> You are adding one subdomain record. You are not migrating, re-pointing, or tidying anything.
>
> ### The record
>
> GoDaddy → Domain Portfolio → `moatazmustapha.com` → **DNS** → Add New Record.
>
> | Field | Value |
> |---|---|
> | Type | `CNAME` |
> | Name | `gate` |
> | Value | `adc7fd9cd7faf2df.vercel-dns-017.com` |
> | TTL | `600` seconds (custom) |
>
> **The Name field takes `gate`, not `gate.moatazmustapha.com`.** GoDaddy appends the zone itself;
> the full name creates `gate.moatazmustapha.com.moatazmustapha.com`, which resolves for nobody and
> looks correct in the table. This is the single most common way this task fails.
>
> **Before saving, check the existing records for two interceptors:** a wildcard `*` CNAME or A
> record, and GoDaddy **Domain Forwarding** or a Parked / Website Builder entry. Either can answer
> for `gate` and mask your record. **If either is present, stop and report it. Do not remove it.**
>
> ### Verify
>
> ```
> dig CNAME gate.moatazmustapha.com +short
> curl -sSI https://gate.moatazmustapha.com | head -1
> ```
>
> **A `401`, or a Vercel login page, is the expected and correct result.** The project is behind
> deployment protection on purpose. Reaching it proves the DNS works. Do not try to get past it.
>
> ### Report back, with actual strings
>
> The record as GoDaddy saved it — type, name, value, TTL — copied from the table rather than from
> memory · the `dig` output · the HTTP status · anything you found and did not touch.
>
> ### DO NOT
>
> - **Do not change the nameservers.** GoDaddy hosts this zone. Moving DNS to Vercel — which some
>   Vercel flows suggest — takes the existing apex site **and its email** offline.
> - Do not edit or delete any existing record: the apex `A`/`CNAME`, any `MX`, any `TXT`
>   (SPF, DKIM, verification tokens).
> - Do not add `www`, the apex, or any redirect.
> - Do not log into Vercel, disable Deployment Protection, or create a bypass.
> - Do not add, edit or remove environment variables.
> - Do not deploy, redeploy, promote, roll back, or push to `main`.
>
> If a step cannot be completed as written, **stop and report** rather than choosing an alternative.

---

## FILL IN WHEN IT COMES BACK

```yaml
godaddy_record:
  type:             CNAME
  name:             …    # should read `gate`
  value:            …
  ttl:              …
dig_cname:          …
https_response:     …    # 401 behind protection is correct
found_but_untouched: …   # wildcards, forwarding, anything odd
date_completed:     …
```

Then, on this side: re-run `GET /v6/domains/gate.moatazmustapha.com/config` and confirm
`misconfigured` has flipped to `false`, and that a certificate has been issued.

---

## What was done with the token, and what was not

**Token:** team-scoped, stored at `.env.vercel.local` (gitignored by the `.env*` rule, mode 600).
It authenticates against team endpoints and 404s on `/v2/user` — correct for a team token, which
carries no user identity.

### Done

1. **`gate.moatazmustapha.com` attached** to project `portfolio`, returned `verified: true`.
2. **Six environment variables added** to Production and Preview.

### Two things found while doing it

**A Supabase integration was already installed** and had supplied sixteen variables, including all
three the app needs. Nothing to add there — worth knowing before someone adds duplicates by hand.

**`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` was missing from Vercel** across all twenty previous
deployments. It **was not breaking images**, and the reason is a deliberate one: `lib/media/cloud.ts`
carries a hardcoded fallback, `?? "vewhrkzj"`, with a comment explaining that an imported constant
depends on the bundler for nothing. It is now set explicitly as well; the fallback stays as the
belt-and-braces it was written to be.

### Deliberately not done

- **Deployment protection is untouched.** It is the launch, and it is Moataz's switch.
- **No deploy, no promote, no push.** Environment variables do not take effect until the next build,
  so nothing about the running site changed.
- **`NEXT_PUBLIC_SITE_URL` is not set** — see below.

### Which variables never need to reach Vercel

Traced through the code, not assumed:

- **`NOTION_API_KEY`** — read only by `scripts/sync-notion.ts`, which runs locally.
- **`CLOUDINARY_API_SECRET`** and **`NEXT_PUBLIC_CLOUDINARY_API_KEY`** — read by **no application
  code at all**. Rule 3 means the site only ever *builds* delivery URLs, which needs the cloud name
  alone. They exist for the signed-upload script.

And **`NEXT_PUBLIC_PREVIEW_STUBS` must stay unset**, or the coming-soon stub pages ship as real
routes.

`REVALIDATE_SECRET` was empty locally — it is ours to invent rather than Moataz's to supply. One was
generated, set on Vercel, and written back to `.env.local` so both sides match. The route
**fails closed** on a missing secret (500, not open), so the previous gap was never a hole.

---

## The one decision still open

`NEXT_PUBLIC_SITE_URL` decides every canonical tag, `og:url`, `sitemap.xml` and `llms.txt` —
`lib/seo/site.ts` resolves it and it overrides Vercel's own `VERCEL_PROJECT_PRODUCTION_URL`.
Whatever goes in it becomes the address search engines treat as real.

So it turns on something undecided: **is `gate.` the portfolio's permanent home, or a staging
address while `moatazmustapha.com` keeps its current site?**

**It is deliberately left unset, and that is safe rather than merely deferred.** With it absent,
`siteUrl()` falls back to `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel supplies automatically — so
absolute URLs stay correct for the `.vercel.app` address in the meantime. Setting it wrong would be
worse than leaving it, because a wrong canonical is the kind of thing that gets indexed before
anyone notices.
