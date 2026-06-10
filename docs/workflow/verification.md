# Verification log

This file is updated by the Hermes cockpit after deterministic checks and deployment verification.

## Local checks
Passed before push:

```text
python3 scripts/validate_static_site.py
OK: static site links, anchors, assets, and workflow artifacts verified

git diff --check
(no output; whitespace check passed)

.nojekyll exists: True
th scope count: 4
```

## Reviewer pass
Gemini reviewer returned `Verdict: APPROVED`.

Follow-up fixes applied:
- Added `.nojekyll` so GitHub Pages serves Markdown artifacts as static files.
- Added `scope="col"` to evidence table headers.

## GitHub Pages deployment
Passed.

- Repository: https://github.com/wink-/ai-workshop-loop-demo
- Live URL: https://wink-.github.io/ai-workshop-loop-demo/
- Commit verified: `306cc92fe45523debac471dc8bbd5b047f5b92a3`
- Actions run: https://github.com/wink-/ai-workshop-loop-demo/actions/runs/27291116744
- Deploy job result: success

Endpoint verification:

```text
curl -I https://wink-.github.io/ai-workshop-loop-demo/
HTTP/2 200
```

Content checks passed for:
- `A small website built by an AI workshop`
- `Each role leaves a receipt`
- `Evidence ledger`
- `GitHub Ops publishes`

Browser verification loaded the page title: `Hermes AI Workshop Loop Demo`.

## v2 Kanban workflow iteration
Passed.

- Board: `ai-workshop-loop-demo`
- Spec card: `t_3f556e8a` — done
- Implement card: `t_b8d4a9d2` — done, recovered after foreground server hang
- Review card: `t_758c23a3` — done, reviewer APPROVED
- Publish card: `t_373c87c3` — recovered after github-ops profile auth fix, then deployed
- Commit verified: `6f98d91dfbd4656a89b6550219352a221d39fabb`
- Actions run: https://github.com/wink-/ai-workshop-loop-demo/actions/runs/27292591347
- Live URL: https://wink-.github.io/ai-workshop-loop-demo/

Lessons captured:
- Kanban card is the source of truth for active status, assignee, dependencies, and comments.
- Markdown task/spec files are durable explanations and receipts, not live schedulers.
- Kanban workers must not run foreground servers as validation unless backgrounded/tracked.
- `github-ops` profile needs GitHub CLI auth available inside its profile HOME.

## v3 loop supervisor publication
Passed.

- Board: `ai-workshop-loop-demo`
- Publish card: `t_790980b9` — done after validation and deploy verification
- Commit verified: `bb9bcf25c0560d6f290f5302a641840fd91f999e`
- Local validation:
  - `python3 scripts/validate_static_site.py`
  - `python3 scripts/loop_supervisor.py --board ai-workshop-loop-demo --dry-run --state-file /tmp/ai-workshop-loop-demo-supervisor-test.json`
  - `git diff --check`
- GitHub Pages run: https://github.com/wink-/ai-workshop-loop-demo/actions/runs/27295079847
- Live URL: https://wink-.github.io/ai-workshop-loop-demo/
- Endpoint check: `HTTP/2 200`
- Content checks passed for:
  - `v3 supervisor`
  - `Script-only board supervision`
  - `scripts/loop_supervisor.py`
  - `loop-supervisor-v3.md`

Notes:
- The v3 supervisor keeps state outside the worktree by default in `~/.hermes/state/ai-workshop-loop-demo/loop-supervisor.json`.
- The supervisor reports only status changes and attention items, and it can skip dispatch entirely in dry-run mode.

## v4 3D bouncing ball publication
Passed.

- Board: `ai-workshop-loop-demo`
- Publish card: `t_60779313`
- Parent review card: `t_0c2a792b` — approved
- Implement card: `t_a27b3f7e`
- Spec card: `t_17994aa7`
- Commit verified: `249ab044bb5dc768a026d1184e6767e467d2a4ad`
- Local validation:
  - `python3 scripts/validate_static_site.py`
  - `node --check scripts/ball_demo.js`
  - `git diff --check`
- GitHub Pages run: https://github.com/wink-/ai-workshop-loop-demo/actions/runs/27296364198
- Live URL: https://wink-.github.io/ai-workshop-loop-demo/
- Endpoint check: `HTTP/2 200`
- Content checks passed for:
  - `v4 3D bouncing ball`
  - `ball-canvas`
  - `ball-play-toggle`
  - `ball-reset`
  - `docs/workflow/3d-bouncing-ball-v4.md`

Notes:
- The v4 demo stays static: Canvas + requestAnimationFrame only, no build step and no runtime dependencies.
- The receipt and task ID list are kept in sync with the published card graph.
