# AI Workshop Loop Demo

A GitHub Pages demo site showing a Hermes AI-workshop workflow: cockpit planning, researcher discovery, coder implementation, reviewer gate, GitHub ops publication, and deterministic verification.

Live site after deployment:

https://wink-.github.io/ai-workshop-loop-demo/

## Workflow receipts

- Cockpit plan: `docs/workflow/cockpit-plan.md`
- Researcher artifact: `artifacts/researcher-discovery.md`
- Coder artifact: `artifacts/coder-implementation-note.md`
- GitHub Ops artifact: `artifacts/github-ops-publication.md`
- Reviewer report: `docs/workflow/reviewer-report.md`
- Verification log: `docs/workflow/verification.md`

## Local validation

```bash
python3 scripts/validate_static_site.py
python3 -m http.server 8000
```
