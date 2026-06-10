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

