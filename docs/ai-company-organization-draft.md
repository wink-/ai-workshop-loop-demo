# Hermes Multi-Profile Company OS — Draft Organization

Status: draft
Owner: Rob / CEO
Repository: ai-workshop-loop-demo

## Operating thesis

Hermes profiles should behave like a small company, not a pile of interchangeable bots.

- The human sets direction, priorities, taste, and budget.
- The cockpit profile turns goals into routed work.
- Senior agents handle ambiguity and hard thinking.
- Mid-level agents implement scoped work cost-effectively.
- Reviewers gate quality before release.
- Ops/release profiles touch production surfaces.
- Knowledge profiles preserve decisions and durable context.

## Executive layer

| Role | Profile | Responsibility |
|---|---|---|
| CEO / Product Owner | Rob | Final priority, taste, budget, and go/no-go authority. |
| COO / Chief of Staff / Cockpit | default | Decomposes work, routes tasks, checks boards, summarizes status, verifies final outputs. Keeps interaction concise and context-efficient. |
| Supervisor | supervisor / cron watcher | Watches boards, alerts on transitions/blockers, suggests next actions. Does not make major product or architecture decisions. |

## Engineering layer

| Role | Current profile | Current provider/model | Best use |
|---|---|---|---|
| Senior Engineer | coder | openai-codex / gpt-5.5 | Architecture, hard reasoning, ambiguous specs, tricky debugging, high-stakes implementation, rescue work. |
| Mid-Level Multimodal Engineer | coder-opencode | opencode-go / mimo-v2.5-pro | Scoped UI/code implementation, screenshot-informed work, large-context/multimodal tasks, cheaper first attempts. |
| Mid-Level Text Engineer | coder-zai | zai / glm-5.1 | Scoped text-only implementation, refactors, docs/code repair, alternate lower-cost attempts. |
| Staff Reviewer / QA Engineer | reviewer | openai-codex / gpt-5.5 | Reviews diffs, specs, validation evidence, architecture, security, accessibility basics, and scope control. |
| Design QA / Taste Reviewer | visual-reviewer | openai-codex / gpt-5.5 | Reviews screenshots/previews for first-glance impact, hierarchy, polish, responsiveness, and human preference. |
| Release Engineer | github-ops | openai-codex / gpt-5.5 | GitHub issues, PRs, CI, release notes, gh/Copilot handoffs, static preview publishing after review gates pass. |

## Research, creative, and operations layer

| Role | Current profile | Responsibility |
|---|---|---|
| Research Analyst | researcher | Web/docs/repo research, option comparisons, evidence summaries, planning inputs. |
| Creative Director / Asset Specialist | artist | Visual concepts, style direction, illustrations, diagrams, infographics, sketches, pixel-art briefs, asset guidance. Not the default code implementer. |
| Infrastructure Engineer | ops | VPS, Hostinger, DNS, Nginx, permissions, services, deploy paths, operational troubleshooting. |
| Knowledge Manager | librarian | GBrain/notes, durable knowledge, receipts/docs organization, sync jobs, information hygiene. |
| Finance Analyst | finance | Read-only Schwab data, candle analysis, FI planning, portfolio research, personal finance workflows. |
| Trading/Investing Analyst | trader | Read-only market/account research, Schwab/candle analysis, portfolio/FI reasoning, GBrain-backed notes. No trade execution. |
| Dormant Godot Specialist | godot | Available for cleanup/archive tasks only. Do not route new coding work here by default. |

## Routing policy

### Send to Senior Engineer (`coder`) when

- Requirements are ambiguous.
- Architecture or design decisions matter.
- Debugging is tricky or expensive to get wrong.
- The task is high-stakes or quality-sensitive.
- A cheaper implementation lane failed validation or produced weak architecture/visual quality.
- Reviewer finds deep design issues.

### Send to Mid-Level Multimodal Engineer (`coder-opencode`) when

- The task is well-scoped.
- UI, visual polish, screenshots, or multimodal context matter.
- The repo/context is large and benefits from a large context window.
- A cheaper first implementation attempt is desirable.
- The output will be reviewed before release.

### Send to Mid-Level Text Engineer (`coder-zai`) when

- The task is well-scoped and text/code-only.
- The work is a refactor, docs change, repair pass, or alternate implementation.
- A lower-cost parallel attempt is useful.
- No image/screenshot/multimodal understanding is required.

### Use reviewers when

- Any code changes are non-trivial.
- Visual quality matters.
- A preview is about to be published.
- A mid-level lane produced output that may need escalation.

## Default workflow

```text
CEO/user
  -> default cockpit/COO
  -> researcher or coder for clarification/spec if needed
  -> coder-opencode or coder-zai for scoped implementation
  -> reviewer and/or visual-reviewer gates
  -> repair pass if needed
  -> github-ops release/publish
  -> librarian captures durable decisions when useful
```

## Cost-control rule

Use expensive senior reasoning only where it changes outcomes.

- Prefer `coder-opencode` or `coder-zai` for clear implementation from a good spec.
- Use `coder` for hard thinking, architecture, rescue, and final quality-sensitive work.
- Let reviewers decide whether a mid-level attempt is good enough or should escalate.

## Kanban lifecycle rule

If an implementation card has downstream reviewer, visual-reviewer, or verifier children:

- Complete the implementation card when the artifact is built and required validation commands pass.
- Do not block with `review-required` just because review is needed.
- The child review cards are the review gate.
- Block only for true blockers: failed validation, missing credentials, unclear requirement, unsafe operation, or no downstream review card exists.

## Future profile rename candidates

Current names are functional. More polished aliases may be better for long-term board readability:

| Current | Candidate |
|---|---|
| coder | senior-engineer or principal-engineer |
| coder-opencode | multimodal-engineer |
| coder-zai | text-engineer |
| reviewer | qa-engineer |
| visual-reviewer | design-qa |
| github-ops | release-engineer |
| researcher | research-analyst |
| artist | creative-director |
| ops | infra-engineer |

Recommendation: clone to new names later, keep old names temporarily as aliases until active boards finish.
