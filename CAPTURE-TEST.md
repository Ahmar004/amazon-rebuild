# Capture Test

Status: passing. Both canaries, sent in two separate sessions, landed in `.agent-logs/` with the prompt and the final response, without any manual step.

## 1. Tool and model

- Tool: Claude Code 2.1.277 (CLI) on Windows 11.
- Planning and the main session: Claude Opus 5 (`claude-opus-5`).
- Execution: during the build step (roadmap Step-6), the main agent stays on Opus 5 and hands tasks to implementer subagents on Claude Sonnet 5 (`claude-sonnet-5`).
- Automatic mechanism: yes. Claude Code has lifecycle hooks configured in `.claude/settings.json`, checked against the hooks reference at https://code.claude.com/docs/en/hooks before building anything.

## 2. Mechanism and config files

- `.claude/settings.json` wires three hooks to one Node script, `.claude/hooks/agent-capture.mjs`:
  - `UserPromptSubmit`: appends the prompt word for word, with a UTC timestamp, as soon as it is sent.
  - `Stop` (end of turn): appends the final response from the hook's `last_assistant_message` field, taking the model id from the session transcript at `transcript_path`.
  - `SessionStart`: records the model id when Claude Code includes it.
- Only prompts and final responses are logged. Thinking, tool calls and intermediate steps are left out.
- Answers given through Claude Code's multiple-choice question tool (`AskUserQuestion`) are the user's own words and often carry key decisions, so each one is logged as a PROMPT entry. It follows a RESPONSE entry holding the question exactly as it was shown.
- Log bodies are append-only. Only the frontmatter counters (`total_exchanges`, `last_prompt_time`, `model`) are rewritten as entries are added.
- If a turn ends without a `Stop` event, for example because it was interrupted, the next hook call reads the transcript and logs that turn with a note saying no final response was given.
- A hook failure is written to `.claude/agent-capture/errors.log` (git-ignored) and never blocks the session.
- The planning turns that ran before the hook existed (prompts 1 to 8 of the first session) were extracted once from Claude Code's own session transcript with `node .claude/hooks/agent-capture.mjs backfill <transcript>`, keeping their original timestamps. Every entry after that was written by the hooks.
- `.gitattributes` keeps LF line endings, so Git on Windows cannot turn the logs into CRLF and break the script's parsing.

## 3. Log files

- Session 1 (interactive): `.agent-logs/2026-09-18_21-16-01_cd46fb24-5a38-4874-881a-642da2c499a1.md`
- Session 2 (a separate `claude -p` session started from the shell): `.agent-logs/2026-09-18_22-34-41_5ea1e4fd-58fb-47d3-9878-eb65a488b61c.md`

## 4. Canary entries, pasted raw

Session 1:

````text
[LOG_ENTRY type=PROMPT num=12 session=cd46fb24]
timestamp: 2026-09-18T22:35:33.830Z
model: claude-opus-5

CAPTURE TEST — 8x assignment, Ahmar Ali


[LOG_ENTRY type=RESPONSE num=12 session=cd46fb24]
timestamp: 2026-09-18T22:35:47.198Z
model: claude-opus-5

Your canary prompt was captured word for word as entry #12 in this session's log, with no errors. My reply to it is logged by the `Stop` hook as soon as this message ends. That's why `CAPTURE-TEST.md` can't be written in this same turn: it needs this reply pasted in raw.

Send any short message next (for example `go`). I'll then confirm this reply landed as RESPONSE #12, write `CAPTURE-TEST.md` with both canary entries pasted raw, and commit and push it with the logs.
````

Session 2:

````text
[LOG_ENTRY type=PROMPT num=1 session=5ea1e4fd]
timestamp: 2026-09-18T22:34:41.380Z
model: claude-opus-5

CAPTURE TEST — 8x assignment, Ahmar Ali


[LOG_ENTRY type=RESPONSE num=1 session=5ea1e4fd]
timestamp: 2026-09-18T22:34:45.069Z
model: unknown

I got your capture test message. I didn't change anything in the repo, so the capture hooks should have logged just this exchange. You can check it in `.agent-logs/`.

I'm ready for the next step. Add the requirements document under `docs/` whenever you want to start.
````

## 5. What did not work at first

- **`model: unknown` in the session 2 canary response.** In the headless session, `Stop` fired before the final message had been written to the transcript, so the script found no model id for the response. Fixed in commit `131ff8c`: the response now falls back to the model recorded with the prompt. The entry above is left as it was captured.
- **Wrong model name for a brand-new session's first prompt.** No hook event reliably includes the model, and the first test fell back to the settings value `opus`, which is an alias rather than an exact model id. Fixed before going live: the script now takes the model from the `SessionStart` input when present, otherwise from the newest transcript in this project, and uses the settings value only as a last resort.
- **Wrong timestamp on backfilled responses.** The first backfill stamped a response with the time of the transcript's last line, which for one turn was the prompt's own time. Fixed to use the time of the last assistant message in that turn.
- **A `sed` edit that silently did nothing.** It was meant to anchor the entry-counting regex to line starts, because the pasted 8x guide contains an example `[LOG_ENTRY ...]` block that could have been counted as a real entry. The escaping didn't match, so it was redone with a direct file edit and checked.
- **Test inputs corrupted by bash `echo`.** Hand-built JSON with Windows paths reached the script without a `session_id`. The test payloads were rebuilt with Node, and the script now logs a clear error for input like that instead of failing silently.
- **Misread test output.** The backfilled responses looked cut off, but that came from the `sed -n` line ranges used to print them. The transcript held the full text, and the log did too.
