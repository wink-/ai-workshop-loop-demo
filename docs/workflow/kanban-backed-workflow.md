# Kanban-backed workflow v2

This repo’s v2 workflow uses a Hermes Kanban card as the live unit of work and a Markdown document as the readable companion artifact.

## Board slug

- Board: `ai-workshop-loop-demo`
- Card state, assignment, parent/child links, and comments live on the board.
- The board is the source of truth for active work.

## Source-of-truth rules

1. The Kanban card wins for live status, assignee, and dependency order.
2. The latest card comment wins over older notes when the task needs clarification.
3. Markdown files in `docs/workflow/` explain the process, but they do not replace the card.
4. The implementation files in the worktree are the source of truth for the code or site itself.
5. If a Markdown receipt conflicts with the board, update the receipt to match the board, not the other way around.

## v2 loop

1. Create or promote a Kanban card for the requested work.
2. Claim the card and work inside the assigned worktree.
3. Record durable notes in Markdown receipts when the work needs explanation or handoff context.
4. Verify the result with deterministic checks.
5. Keep the board updated until the card is complete.

## Why this matters

This version makes the workflow legible to humans and machines at the same time. The board carries the live state; the Markdown docs explain the rules; the site shows the resulting workflow to visitors.
