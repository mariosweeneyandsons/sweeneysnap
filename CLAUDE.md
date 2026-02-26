## DEVLOG.md — Narrative Build Journal

A `DEVLOG.md` file lives in the repo root and serves as a narrative daily build journal. It's
auto-maintained by Claude Code, combining git history with session transcript analysis to tell the real
story of each development day.

### How It Works

**Step 1 — Check for missing days:**
- **Before every response**, Claude Code silently compares today's date against the last DEVLOG.md entry
date.
- If there are **completed days** (yesterday or earlier) with commits that have no entry yet, Claude Code
 backfills them.
- **NEVER summarize the current day.** The current day is always in progress. Its entry only gets written
 once the day is over (i.e., when Claude Code runs on the following day or later).
- Entries are written in reverse chronological order (newest at top, below the header).
- This check should be silent — don't announce it to the user unless entries were actually created, in
 which case briefly mention it (e.g., "Updated the devlog for Feb 10.") and move on.

**Step 2 — Gather git history:**
- Run `git log --after="YYYY-MM-DD 00:00:00" --before="YYYY-MM-DD 23:59:59" --pretty=format:"%h %s
(%ai)"` for each missing day.
- Also check the first few hours of the next day for late-night commits that are part of the same work
session (e.g., commits at 00:04 after a session that started at 22:00).

**Step 3 — Scan session transcripts:**
- Session transcripts are stored as JSONL at:
`~/.claude/projects/-Users-mario-Desktop-Jarvis--Enhance-SweeneySnap/*.jsonl`
- Each line is a JSON object with `type` (human/assistant/tool_use/tool_result), `timestamp`,
`sessionId`, and content.
- For each completed day, identify relevant session files by reading the first and last lines of each
`.jsonl` file and checking if timestamps fall within the target day.
- From matching files, extract only:
  - **User messages** (`type: "human"`) longer than 15 characters (skip tool confirmations like "y",
"yes", "ok")
  - **Assistant text blocks** containing struggle keywords: `error`, `fix`, `workaround`, `failed`,
`broke`, `retry`, `instead`, `problem`, `warning`, `rejected`, `denied`
  - **Assistant decision text** longer than 50 characters that explains reasoning or approach
- **Skip entirely:** `progress` entries, `file-history-snapshot` entries, `system` entries, raw tool I/O
content, and subagent transcripts in subdirectories.
- Cap at 20 files per day. If more exist, process the 10 largest and note the limitation.

**Step 4 — Compose the narrative:**
- Sort extracted transcript items chronologically.
- Group into episodes by time gaps (>15 min) or session boundaries.
- Weave git commits, user intent, problems encountered, and decisions made into a cohesive narrative.

### Entry Format
```markdown
## Day X — YYYY-MM-DD (Day of Week)
**Summary:** One-liner of what was accomplished.

### The Story
3-5 paragraphs narrating the day in third person ("Mario kicked off...").
Captures: goals, multi-terminal coordination, problems hit, decisions made,
learning moments, the arc from start to finish. Casual tone — like a blog post.

### Battles
- [Won] **Short description** — how it was resolved
- [Ongoing] **Short description** — current state
- [Dodged] **Short description** — how it was avoided
(If smooth day with no issues: "No major battles today.")

### What Got Done
- Feature/task description (references commit hashes where relevant)
- Another thing done

### Commits
- `abc1234` — commit message
- `def5678` — commit message

### Notes
Any decisions made, blockers hit, or things to pick up next session.
Enhanced with insights from session transcripts (e.g., why a particular
approach was chosen, what alternatives were considered).

---
```

### Rules
- Keep summaries concise and human-readable — this is a journal, not a changelog
- **The Story** is the heart of the entry. It should read like a development blog post — casual,
engaging, honest about struggles. Third person voice.
- Group related commits into logical bullets rather than listing every single one
- Note any client feedback or design decisions made during the session
- If no commits exist for a day, don't create an entry for it
- Day numbering is sequential (Day 1, Day 2, etc.) based on days with actual work
- **Never include credentials, secrets, or API keys** found in transcripts
- **Paraphrase user messages naturally** — never quote verbatim with typos or garbled text
- When multiple terminals were running simultaneously, narrate the coordination (e.g., "Meanwhile, in
another terminal...")
- Battles should be specific and technical, not generic ("Fixed RLS policies" not "Had some issues")
