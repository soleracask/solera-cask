# SEO fields to fill in the admin

Five of six posts have **empty** `seoTitle` and `seoDescription`, so the function falls back to `<post title> - Solera Cask` and the first 160 characters of the body. That mostly works, but four titles now exceed what Google displays (~60 characters), and the tequila post has a broken stored title.

Paste these into each post's SEO section in `/admin.html`. Character counts in brackets.

---

## 1. Sherry Cask Finishing: Turning Slow Stock Into a Premium Release

Current title tag is 78 characters — Google will cut it.

```
SEO Title [58]
Sherry Cask Finishing: Turn Slow Stock Into Premium Spirit

SEO Description [152]
Consumers are drinking less but better. How sherry cask finishing turns slow-moving spirit stock into a premium release, with 2025-26 market data.
```

## 2. John Sleeman & Sons × Solera Cask: Two Golds at the Canadian Whisky Awards

Current title tag is 88 characters — the worst of the six.

```
SEO Title [57]
Two Golds for Sleeman Whiskies Finished in Solera Casks

SEO Description [138]
Two John Sleeman & Sons sherry-finished whiskies took gold at the 2026 Canadian Whisky Awards, both matured in Solera Cask barrels from Jerez.
```

## 3. The Macallan Bets on Jerez and Sherry Oak Casks

Title is fine at 61. The description is **293 characters** — roughly double what Google shows.

```
SEO Description [149]
Why The Macallan invests in Jerez sherry oak, and what its commitment to
seasoned cask supply signals for distillers sourcing sherry wood today.
```

Check that against what the article actually argues before saving.

## 4. Why Sherry Barrels Are Exceptional for Aging Tequila

The stored SEO title is literally `Why Sherry Barrels Are Exceptional for Aging Tequila - So...` — the old auto-generator truncated "Solera Cask" into a fragment. The description is already correct at 150 characters.

```
SEO Title [52]
Why Sherry Barrels Are Exceptional for Aging Tequila
```

## 5. Welcome to Solera Cask Stories

Title 44, description 110. Fine as they are.

## 6. Understanding Sherry Types for Aging

Title 50, description 110. Fine as they are.

---

## Why the tequila title happened

`generateSEOTitle()` in `admin.html` built `"<title> - Solera Cask"` and then, if that exceeded 60 characters, chopped it at 57 and appended `...` — which cut mid-way through the brand name.

I've changed it: the brand suffix is kept only when the whole thing fits in 60, otherwise it's dropped, and only a genuinely long post title gets truncated (on a word boundary, no ellipsis). New posts won't produce fragments like that again. It doesn't retro-fix the tequila post — that value is already saved in the database, so replace it by hand using the text above.

The field has `maxlength="60"`, so anything you paste is capped at 60 characters. All the titles above fit.
