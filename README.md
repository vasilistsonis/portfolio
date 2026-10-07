# vasilis-tsonis portfolio

A scroll-driven 3D portfolio. Scrolling flies one continuous camera through seven connected scenes (platform stack, client work, products, open source, credentials, contact). No build step, no framework: plain HTML/CSS/JS with Three.js vendored locally, so it works on networks that block CDNs.

## Edit the content
Everything lives in `js/data.js`: profile, skills, engagements, ventures, repos, credentials and the section copy. The world rebuilds from it.

The CV behind the Download CV buttons is `assets/Vasilis-Tsonis-CV.pdf` (or change `profile.cv`).

## Run locally
Any static server works, e.g. `npx serve .` or `python3 -m http.server 8080`, then open the printed URL. (Opening `index.html` directly from disk won't work because the page uses ES modules.)

## Deploy
**Vercel (live):** https://portfolio-zeta-ten-65.vercel.app. Deploy from this folder with `npx vercel deploy --prod`, or connect the GitHub repo in the Vercel dashboard (framework "Other", no build command, output directory `.`) so every push to `main` deploys.

**Netlify / GitHub Pages:** any static host works; no build step.

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
