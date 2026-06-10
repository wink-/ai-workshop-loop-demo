# Coder worker: implementation plan

## File structure

```
index.html          # Landing page — pipeline overview diagram
css/style.css       # Site-wide styles
js/main.js          # Minimal vanilla JS (tab nav, scroll spy)
docs/
  cockpit.md        # Planning phase output
  researcher.md     # Discovery notes
  coder.md          # Implementation notes
  reviewer.md       # Gate checklist
  github-ops.md     # Publication runbook
assets/             # SVG diagrams, screenshots
```

## Visual style

- **Palette**: dark charcoal `#1a1a2e` background, amber `#f0a500` accents, white text — inspired by the Hermes branding in `README.md`.
- **Font**: Inter via Google Fonts CDN; monospace `JetBrains Mono` for code blocks.
- **Layout**: single-column responsive, max-width 48rem, sticky top nav with phase links. No framework — pure CSS Grid/Flexbox.
- **Diagrams**: inline SVG pipeline flow in `index.html`, matching the six workflow stages described in the README.

## Validation commands

```bash
# HTML well-formedness
npx html-validate index.html docs/*.html
# CSS lint
npx stylelint "css/**/*.css"
# Dead links & anchors
npx linkchecker http://localhost:8000
# Accessibility baseline
npx pa11y index.html --standard WCAG2AA
# Local preview
python3 -m http.server 8000
```

Deploy is handled by the existing `.github/workflows/pages.yml` — push to `main` triggers it.
