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

--- second pass (after first deploy) ---

post/*.html  (5 files, in _to_delete/post/)
    The CMS renders all five at least as completely as these files did.
    They were shadowing the CMS: Netlify serves a static file before any
    redirect, so admin edits to these five never reached the live site.

    TO REVERT any single post:
        mv "_to_delete/post/<slug>.html" post/
    then commit and push. That post goes back to being served statically.

js/book-a-call.js
    Injected a "Book a Call" button into the nav and mobile overlay.
    Removed so Get Quote is the single nav CTA. Its job is now done by
    a text link under the quote form and a button in the success modal.
    To revert: mv _to_delete/js/book-a-call.js js/ and re-add
    <script src="js/book-a-call.js"></script> to each page.
