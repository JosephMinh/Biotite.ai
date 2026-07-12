# AGENTS.md - NTM Agent Instructions

<INSTRUCTIONS>
## Project
- Name: Biotite.ai
- Language: Generic
- Generated: 2026-07-12T04:47:55Z

## Workflow
- Read AGENTS.md and README.md before starting work.
- Make focused, logical commits with detailed messages explaining the "why".
- Push after committing so other agents and CI can see your work.
- Use br for issue tracking; do not edit .beads files directly.
- Use bv --robot-triage to pick the next bead.
- Use Agent Mail (MCP) for coordination and file reservations.
- Use cass and cm to reuse prior context when needed.

## Issue Tracking (br)
- br ready --json
- br update <id> --status in_progress --json
- br close <id> --reason "Completed" --json
- br sync --flush-only before git commit

## Closeout Audit
- Run br-closeout-audit before closing high-risk beads and re-run it after closing verification-heavy work.
- Example: br-closeout-audit --issue <id>
- Optional repo-local overrides: .ntm/closeout-audit.json, .beads/closeout-audit.json, .br-closeout-audit.json

## Triage (bv)
- bv --robot-triage

## Agent Mail (MCP)
- ensure_project then register_agent using the absolute project path
- reserve files before editing (file_reservation_paths)
- fetch_inbox, acknowledge_message, send_message for coordination

## Context Tools
- cass search "query" --robot --limit 5
- cm context "task" --json

## Context Efficiency
- When available, prefer context-mode MCP tools for large outputs or repeated repo inspection.
- Use ctx_batch_execute for multi-file inspection, ctx_execute for large command output, and ctx_execute_file for large files or logs.
- Use ctx_fetch_and_index or ctx_index plus ctx_search when you need indexed, searchable documentation.
- Use rtk wrappers for shell-native compact output: rtk read <file>, rtk git diff, rtk test <command>, rtk err <command>, rtk find ...
- Avoid dumping large raw command output into agent context; use context-mode for indexed/queryable results and rtk for compact shell summaries.

## Language-Specific Rules
- Use the project's documented build/test/format commands
- Do not introduce new toolchains without approval

## Safety

### Destructive Git Operations — BANNED
- NEVER run: git reset --hard, git clean -fd, git push --force, git checkout -- .
- These destroy work from concurrent agents and are unrecoverable.
- If you need to undo changes, use git revert to create a new commit instead.

### Destructive Filesystem Operations
- NEVER run rm -rf on project directories or broad glob patterns.
- Bulk deletes (removing multiple files) require explicit user approval.
- Never delete files or directories without explicit approval.

### Dirty Worktree Discipline
- Never stash or revert other agents' uncommitted work.
- Treat unknown/unexpected changes in the worktree as someone else's work in progress.
- Multiple agents work concurrently — files change constantly during sessions.

### No File Proliferation
- Prefer editing existing files over creating new ones.
- Do not create documentation files (*.md, README) unless explicitly requested.
- Avoid bulk mechanical edits; make small, reviewed changes.

### Verification
- Test after substantive changes using the project's test commands.
- Check git status after committing — more changes may appear from concurrent agents.
- Never claim something is "clean" or "passing" without actually verifying.

### Coordination
- Respect Agent Mail locks when present.
- Check beads/bv for task assignments before starting new work.
- Do not merge PRs — mine them for ideas, implement independently, close with explanation.
</INSTRUCTIONS>
