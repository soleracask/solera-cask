Files moved here by Claude during the CMS cleanup (2026-09-29).
Nothing here is served by the site any more. Delete the folder
once the live site is confirmed working.

_redirects
    Removed. It was processed BEFORE netlify.toml, so it silently
    shadowed netlify.toml's rules. Its /*  /index.html 200 line was
    also the cause of the soft-404 problem and it swallowed the
    /api/* rule. All redirects now live in netlify.toml.

netlify.toml.bak      original netlify.toml
post-page.js.bak      original netlify/functions/post-page.js
