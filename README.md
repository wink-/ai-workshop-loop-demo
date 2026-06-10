# AI Workshop Loop Demo

A GitHub Pages demo site showing a Hermes AI-workshop workflow: cockpit planning, researcher discovery, coder implementation, reviewer gate, GitHub ops publication, deterministic verification, the v2 Kanban-backed workflow, the v3 script-only loop supervisor, and the v4 interactive 3D bouncing ball demo.

Live site after deployment:

https://wink-.github.io/ai-workshop-loop-demo/

## Workflow receipts

- Cockpit plan: `docs/workflow/cockpit-plan.md`
- Kanban workflow guide: `docs/workflow/kanban-backed-workflow.md`
- Markdown task guide: `docs/workflow/markdown-task-vs-kanban-card.md`
- v3 supervisor guide: `docs/workflow/loop-supervisor-v3.md`
- v4 3D ball receipt: `docs/workflow/3d-bouncing-ball-v4.md`
- Researcher artifact: `artifacts/researcher-discovery.md`
- Coder artifact: `artifacts/coder-implementation-note.md`
- GitHub Ops artifact: `artifacts/github-ops-publication.md`
- Reviewer report: `docs/workflow/reviewer-report.md`
- Verification log: `docs/workflow/verification.md`

## Local validation

```bash
python3 scripts/validate_static_site.py
python3 scripts/loop_supervisor.py --board ai-workshop-loop-demo --dry-run --state-file /tmp/ai-workshop-loop-demo-supervisor-test.json
node --check scripts/ball_demo.js
git diff --check
```
