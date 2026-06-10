# Cockpit plan: manual AI-workshop pilot

## Task
Create and publish a public GitHub Pages site that demonstrates the new Hermes AI-workshop workflow.

## Repo
`wink-/ai-workshop-loop-demo`

## Goal
Show the loop itself: which profile or CLI produced each artifact, how maker/checker separation works, and what deterministic evidence proves the result.

## Roles
- `default` Hermes cockpit: planning, orchestration, final verification.
- `researcher`: loop-engineering framing artifact.
- `coder` / claude-zai: implementation plan artifact.
- `github-ops` / Copilot + gh: publication path artifact and repo operations.
- `reviewer` / Gemini: independent diff review.

## Acceptance criteria
- Public GitHub repository exists.
- Static site source is committed.
- GitHub Pages deploy workflow exists.
- Site links to workflow artifacts.
- Local HTML/link checks pass.
- Reviewer artifact exists.
- Live Pages URL is verified after push.

## Human gate
The user explicitly asked to implement this demo. Future autonomous merge/deploy loops still require approval until relaxed.
