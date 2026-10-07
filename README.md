# vasilis-tsonis portfolio

A scroll-driven 3D portfolio. Scrolling flies one continuous camera through seven connected scenes (platform stack, client work, products, open source, credentials, contact). No build step, no framework: plain HTML/CSS/JS with Three.js vendored locally, so it works on networks that block CDNs.

## Edit the content
Everything lives in `js/data.js`: profile, skills, engagements, ventures, repos, credentials and the section copy. The world rebuilds from it.

Before publishing:
- Replace the `PL-000` placeholders in `credentials.certifications` with your real certification titles.
- Confirm `profile.linkedin`.
- Drop your CV at `assets/Vasilis-Tsonis-CV.pdf` (or change `profile.cv`).

## Run locally
Any static server works, e.g. `npx serve .` or `python3 -m http.server 8080`, then open the printed URL. (Opening `index.html` directly from disk won't work because the page uses ES modules.)

## Deploy
**GitHub Pages (included):** push this folder to a repo's `main` branch, then in Settings → Pages set Source to "GitHub Actions". The workflow in `.github/workflows/pages.yml` publishes on every push. Your URL will be `https://<user>.github.io/<repo>/`.

**Vercel / Netlify:** import the repo, framework "Other", no build command, output directory `.`.

**Custom domain:** add it in the host's settings and point a CNAME at it; some corporate web filters block `*.github.io`, `*.vercel.app` and `*.azurestaticapps.net`, so a domain of your own is the safest link for a CV.

## Structure
```
index.html        page shell and fixed chrome
styles.css        tokens, copy panels, rail, drawer
js/data.js        all content
js/world.js       Three.js scenes, camera path, scroll mapping, picking
js/main.js        copy blocks, rail, drawer, cursor, preloader
vendor/           three.module.js, CSS2DRenderer.js
```

Accessibility: keyboard-reachable rail and buttons, visible focus, `prefers-reduced-motion` keeps the scroll-driven camera but drops idle motion, parallax and the custom cursor.
