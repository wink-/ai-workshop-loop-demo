# v4 3D bouncing ball workflow receipt

This receipt records the v4 demo card graph, the intended handoffs, and the static-artifact checks that keep the page honest.

## Repository

- Repo: `wink-/ai-workshop-loop-demo`
- Demo page: `index.html`
- Demo script: `scripts/ball_demo.js`
- Style updates: `styles.css`

## Card graph

```text
t_17994aa7 (spec / parent)
  └─ t_a27b3f7e (implement / this card)
       └─ t_0c2a792b (review)
            └─ t_60779313 (publish + verify)
```

## Expected handoffs

1. Spec card defines the v4 demo scope and acceptance criteria.
2. Implement card adds the static 3D bouncing ball demo, navigation link, controls, and validator updates.
3. Review card checks the diff for correctness, accessibility, static-asset hygiene, and documentation completeness.
4. Publish card carries the approved artifact to the live Pages site and records the verification evidence.

## Artifact expectations

- The demo must remain static: no build step, no runtime server, no hidden API dependency.
- The interactive surface must expose pause/resume, reset, and tunable physics controls.
- The landing page must link to this receipt and the demo must be reachable from the primary nav.
- `scripts/validate_static_site.py` must assert the new section, controls, and receipt exist.
- `README.md` must mention the v4 demo and the local validation command set.

## Deterministic validation

Run these commands from the repo root:

```bash
python3 scripts/validate_static_site.py
node --check scripts/ball_demo.js
git diff --check
```

## Notes for future workers

- Keep the demo implementation in `scripts/ball_demo.js` rather than inline HTML so future adjustments stay readable.
- If the card graph changes, update this receipt and `docs/workflow/kanban-v4-task-ids.txt` together.
- If the demo gains more controls, keep the UI labels and validator in sync.
