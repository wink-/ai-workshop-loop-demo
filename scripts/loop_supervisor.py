#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

DEFAULT_BOARD = "ai-workshop-loop-demo"
DEFAULT_STUCK_MINUTES = 60
DEFAULT_DISPATCH_MAX = 1
ATTENTION_RUN_OUTCOMES = {"blocked", "crashed", "failed", "reclaimed", "spawn_failed", "timed_out"}
DEFAULT_STATE_DIR = Path.home() / ".hermes" / "state" / DEFAULT_BOARD
DEFAULT_STATE_FILE = DEFAULT_STATE_DIR / "loop-supervisor.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Hermes Kanban loop supervisor")
    parser.add_argument("--board", default=DEFAULT_BOARD, help="Kanban board slug to supervise")
    parser.add_argument(
        "--state-file",
        default=str(DEFAULT_STATE_FILE),
        help="Path to the persisted supervisor state JSON",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Poll and report without dispatching",
    )
    parser.add_argument(
        "--dispatch-max",
        type=int,
        default=DEFAULT_DISPATCH_MAX,
        help="Maximum number of tasks to dispatch in one tick",
    )
    parser.add_argument(
        "--stuck-minutes",
        type=int,
        default=DEFAULT_STUCK_MINUTES,
        help="Report running cards that stay active longer than this many minutes",
    )
    parser.add_argument(
        "--no-dispatch",
        action="store_true",
        help="Poll and report without dispatching",
    )
    return parser.parse_args()


def run_hermes(board: str, *args: str) -> Any:
    cmd = ["hermes", "kanban", "--board", board, *args]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        message = proc.stderr.strip() or proc.stdout.strip() or "unknown hermes kanban failure"
        raise RuntimeError(f"{' '.join(cmd)} failed: {message}")
    output = proc.stdout.strip()
    if not output:
        return None
    return json.loads(output)


def load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save_state(path: Path, state: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def normalize_task(task: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": task.get("id"),
        "title": task.get("title", ""),
        "status": task.get("status", ""),
        "assignee": task.get("assignee"),
        "started_at": task.get("started_at"),
        "completed_at": task.get("completed_at"),
        "priority": task.get("priority"),
    }


def latest_run_id(run: dict[str, Any] | None) -> Any:
    if not run:
        return None
    return run.get("id")


def summarize_run(run: dict[str, Any]) -> str:
    status = run.get("status") or run.get("outcome") or "unknown"
    parts = [f"latest run {status}"]
    error = run.get("error")
    if error:
        parts.append(str(error))
    summary = run.get("summary")
    if summary:
        parts.append(str(summary))
    return "; ".join(parts)


def is_attention_run(run: dict[str, Any]) -> bool:
    status = str(run.get("status") or "").lower()
    outcome = str(run.get("outcome") or "").lower()
    return status in ATTENTION_RUN_OUTCOMES or outcome in ATTENTION_RUN_OUTCOMES


def collect_snapshot(board: str) -> dict[str, Any]:
    stats = run_hermes(board, "stats", "--json") or {}
    tasks = run_hermes(board, "list", "--json") or []
    runs_by_task: dict[str, dict[str, Any] | None] = {}
    for task in tasks:
        task_id = task.get("id")
        if not task_id:
            continue
        task_runs = run_hermes(board, "runs", str(task_id), "--json") or []
        runs_by_task[str(task_id)] = task_runs[-1] if task_runs else None
    return {
        "captured_at": int(time.time()),
        "stats": stats,
        "tasks": [normalize_task(task) for task in tasks],
        "runs": runs_by_task,
    }


def build_reports(previous: dict[str, Any], snapshot: dict[str, Any], stuck_minutes: int) -> list[str]:
    previous_tasks = {str(task["id"]): task for task in previous.get("tasks", []) if task.get("id")}
    previous_runs = {str(task_id): run for task_id, run in previous.get("runs", {}).items()}
    previous_stuck = {str(task_id): started_at for task_id, started_at in previous.get("stuck", {}).items()}
    current_tasks = {str(task["id"]): task for task in snapshot.get("tasks", []) if task.get("id")}
    current_runs = snapshot.get("runs", {})
    now = int(snapshot.get("captured_at") or time.time())
    stuck_seconds = max(stuck_minutes, 0) * 60
    reports: list[str] = []
    baseline = not previous_tasks

    for task_id in sorted(current_tasks):
        task = current_tasks[task_id]
        title = task.get("title", task_id)
        status = task.get("status", "unknown")
        prev_task = previous_tasks.get(task_id)
        prev_status = prev_task.get("status") if prev_task else None

        if prev_task and prev_status != status:
            reports.append(f"status {task_id} {title!r}: {prev_status} -> {status}")

        if not baseline and not prev_task and status in {"blocked", "running"}:
            reports.append(f"new {task_id} {title!r}: {status}")

        if status == "blocked" and prev_status != "blocked":
            reports.append(f"blocked {task_id} {title!r}")

        if status == "running" and task.get("started_at"):
            age_seconds = max(0, now - int(task["started_at"]))
            if age_seconds >= stuck_seconds:
                previous_started_at = previous_stuck.get(task_id)
                if previous_started_at != task.get("started_at"):
                    age_minutes = age_seconds // 60
                    reports.append(
                        f"stuck {task_id} {title!r}: running for {age_minutes}m (threshold {stuck_minutes}m)"
                    )

        run = current_runs.get(task_id)
        prev_run = previous_runs.get(task_id)
        if run and is_attention_run(run):
            run_id = latest_run_id(run)
            prev_run_id = latest_run_id(prev_run)
            if run_id != prev_run_id or run.get("outcome") != (prev_run or {}).get("outcome"):
                reports.append(f"run {task_id} {title!r}: {summarize_run(run)}")

    return reports


def dispatch(board: str, dispatch_max: int) -> dict[str, Any]:
    payload = run_hermes(board, "dispatch", "--max", str(dispatch_max), "--json")
    if isinstance(payload, dict):
        return payload
    return {}


def main() -> int:
    args = parse_args()
    state_path = Path(args.state_file).expanduser()
    previous_state = load_state(state_path)
    snapshot = collect_snapshot(args.board)
    reports = build_reports(previous_state, snapshot, args.stuck_minutes)
    dispatch_result: dict[str, Any] = {}

    if not args.dry_run and not args.no_dispatch:
        dispatch_result = dispatch(args.board, args.dispatch_max)
        refreshed = collect_snapshot(args.board)
        snapshot = refreshed
        previous_state = load_state(state_path)
        reports.extend(build_reports(previous_state, refreshed, args.stuck_minutes))

    next_state = {
        "board": args.board,
        "captured_at": snapshot["captured_at"],
        "stats": snapshot.get("stats", {}),
        "tasks": snapshot.get("tasks", []),
        "runs": snapshot.get("runs", {}),
        "stuck": {
            task["id"]: task["started_at"]
            for task in snapshot.get("tasks", [])
            if task.get("id") and task.get("status") == "running" and task.get("started_at")
            and max(0, int(snapshot["captured_at"]) - int(task["started_at"])) >= max(args.stuck_minutes, 0) * 60
        },
    }
    save_state(state_path, next_state)

    if dispatch_result:
        spawned = dispatch_result.get("spawned") or []
        reclaimed = dispatch_result.get("reclaimed") or 0
        promoted = dispatch_result.get("promoted") or 0
        auto_blocked = dispatch_result.get("auto_blocked") or []
        crashed = dispatch_result.get("crashed") or []
        timed_out = dispatch_result.get("timed_out") or []
        if spawned or reclaimed or promoted or auto_blocked or crashed or timed_out:
            bits = []
            if reclaimed:
                bits.append(f"reclaimed={reclaimed}")
            if promoted:
                bits.append(f"promoted={promoted}")
            if spawned:
                bits.append("spawned=" + ",".join(str(item.get("task_id", item)) for item in spawned))
            if auto_blocked:
                bits.append("auto_blocked=" + ",".join(str(item.get("task_id", item)) for item in auto_blocked))
            if crashed:
                bits.append("crashed=" + ",".join(str(item.get("task_id", item)) for item in crashed))
            if timed_out:
                bits.append("timed_out=" + ",".join(str(item.get("task_id", item)) for item in timed_out))
            reports.append("dispatch " + "; ".join(bits))

    deduped: list[str] = []
    seen: set[str] = set()
    for line in reports:
        if line not in seen:
            deduped.append(line)
            seen.add(line)

    if deduped:
        print(f"board {args.board}:\n  " + "\n  ".join(deduped))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
