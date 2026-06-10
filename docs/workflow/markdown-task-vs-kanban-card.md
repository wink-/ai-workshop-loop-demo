# Markdown task vs Kanban card

This repo uses both Markdown and Kanban, but they are not interchangeable.

## Use a Markdown task when

- you need a readable spec, checklist, or handoff note
- the content is meant to be reviewed later as documentation
- the work is informational rather than stateful
- you want a durable explanation that can be linked from the site

## Use a Kanban card when

- the work needs an assignee
- the task has live status changes
- the task depends on parent/child ordering
- the task needs progress tracking, comments, or heartbeats
- the work should move through a board-backed workflow

## Practical difference

A Markdown task describes the work. A Kanban card manages the work.

For this demo:

- Markdown lives in `docs/workflow/` and explains the process.
- The Kanban board slug is `ai-workshop-loop-demo`.
- The card is the operational source of truth for active work.
- The Markdown document is the readable explanation and receipt.

## Rule of thumb

If someone needs to know what the work means, write Markdown.
If someone needs to know what happens next, use a Kanban card.
