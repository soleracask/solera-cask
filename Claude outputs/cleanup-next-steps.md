# Solera Cask cleanup — what's done, what's next

## Done (local changes, not yet deployed)

**`netlify.toml` — now the single source of redirects**
Added the `/post/* → /.netlify/functions/post-page` rule (it previously pointed at the dead `post.html` SPA), kept `/api/*`, `/blog`, `/blog/*`, `/admin` and the videos passthrough, and replaced the soft-404 catch-all with a real 404.

**`_redirects` — removed** (moved to `_to_delete/`)
This was the root of two separate bugs. Netlify processes `_redirects` before `netlify.toml`, so its two lines were shadowing the whole config, and its `/*  /index.html 200` was both the soft-404 cause and the reason `/api/*` never reached your functions.

**`404.html` — created**
Matches your header, uses your CSS variables and fonts, `noindex`, and links to Home, Our Casks, All Stories, FAQ and Get a Quote.

**`netlify/functions/post-page.js` — two small patches**
1. Slug now falls back to `?slug=`, so you can preview any CMS post before removing its static file. Path parsing is unchanged for real `/post/<slug>` requests.
2. Added `ul`, `ol`, `li` and `blockquote` styling inside `.post-content`. There was none, so any list in a CMS post rendered with raw browser defaults.

Backups of both originals are in `_to_delete/`.

## Checked and fine — no action

Every pretty URL on the site resolves through Netlify's automatic `.html` matching, not through the catch-all: all seven product pages, `/blog`, the five `/es/` pages, all four legal pages and `/admin` return their own content. Switching the catch-all to a 404 breaks none of them.

I also checked the mixed-case logo paths (`solera-cask-logo.png` on 14 pages vs `Solera-Cask-Logo.png` elsewhere). Netlify serves both cases, same bytes. Not a bug.

## Next: you deploy

Commit and push. Then confirm:

- `soleracask.com/some-nonsense-url` → your new 404 page, **HTTP 404** not 200
- `soleracask.com/api/posts-public` → JSON, not the homepage
- `/blog`, `/admin` and a product page still load

## Then: the two remaining items

### 1. Fix the tequila post in the admin

`Why Sherry Barrels Are Exceptional for Aging Tequila` currently has **The Macallan's** SEO title and description stored on it. Harmless today because the static file shadows it — the moment you delete that file, the page serves the wrong title and description to Google.

Replace with:

```
SEO Title:        Sherry Cask Finishing for Tequila | Solera Cask
SEO Description:  Why ex-sherry casks suit tequila: what Oloroso, PX and
                  Amontillado wood contribute to agave spirit, and how to
                  choose between them.
```

Adjust the wording to match what the article actually argues.

### 2. Retire the five static post files

Once deployed, preview each post as the CMS would render it:

```
/.netlify/functions/post-page?slug=john-sleeman-sons-solera-cask-two-golds-at-the-canadian-whisky-awards
/.netlify/functions/post-page?slug=the-macallan-bets-on-jerez-and-sherry-oak-casks
/.netlify/functions/post-page?slug=why-sherry-barrels-are-exceptional-for-aging-tequila
/.netlify/functions/post-page?slug=welcome-to-solera-cask-stories
/.netlify/functions/post-page?slug=understanding-sherry-types-for-aging
```

Check the full text is there, images render, and the title and description are right. Pay attention to **Understanding Sherry Types for Aging** — its CMS `contentHtml` is 14,010 characters against roughly 463 words in the static file, so the two versions may well have diverged.

Where the CMS version is good, move `post/<slug>.html` into `_to_delete/`. Where it isn't, fix the post in the admin first — copy the better text out of the static file.

Tell me when you've deployed and I'll run the five previews and compare them against the static files properly.

## Left alone deliberately

`post.html` is now dead code — nothing routes to it. Harmless, but it can go later.

`blog.html`'s grid is JS-rendered from the API with five hardcoded cards as the no-JS fallback. They match today and will drift as you add posts. Not worth solving until it bothers you.
