# Loop supervisor v3

This document describes the script-only supervisor layer that turns the v3 loop into a polling and dispatching process instead of a human-driven chat loop.

## Trigger

Run the supervisor on demand, or wire it into a future cron job after the dry-run verification passes.

Recommended command:

```bash
python3 scripts/loop_supervisor.py --board ai-workshop-loop-demo --state-file ~/.hermes/state/ai-workshop-loop-demo/loop-supervisor.json
```

Use `--dry-run` when you want to inspect the board without dispatching any work.

## Scope

The supervisor is intentionally narrow:

- it reads the Hermes Kanban board for the `ai-workshop-loop-demo` slug
- it stores previous task snapshots in a JSON state file outside the repository tree
- it reports only status transitions, blocked cards, newly detectable failed/crashed runs, and running cards that exceed the stuck threshold
- it can dispatch at most a bounded number of ready tasks per tick
- it does not edit repository files and it does not start a foreground server

## State

Default state location:

```text
~/.hermes/state/ai-workshop-loop-demo/loop-supervisor.json
```

The state file records:

- the board slug
- the last captured board statistics
- task snapshots with status, timestamps, and titles
- the latest run outcome seen for each task
- which running cards were already reported as stuck

That state lets the supervisor stay quiet when nothing has changed and avoids repeating the same alert on every tick.

## Notifications

The supervisor prints a concise report only when something needs attention:

- status changes, such as `todo -> running` or `running -> done`
- newly blocked cards
- failed or crashed runs when the latest task run exposes them
- stuck running cards that have exceeded `--stuck-minutes`
- dispatch summaries when a tick is allowed to spawn work

If `--dry-run` or `--no-dispatch` is set, the supervisor skips dispatch entirely.

## Limits

The implementation is deliberately constrained so the cockpit does not become the event loop:

- Python standard library only
- `subprocess.run(...)` with explicit argv, never `shell=True`
- no foreground HTTP server
- no implicit repo edits
- dispatch capped by `--dispatch-max`
- state stored outside the worktree by default

## Why this exists

V2 made the Kanban board the source of truth for work. V3 adds a thin script-only supervisor so the human cockpit can stay out of the hot path unless the board actually changes or a task needs attention.
