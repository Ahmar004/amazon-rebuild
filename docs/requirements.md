# Requirements

The 8x assignment brief and the agent capture setup guide it links to, copied word for word from the assignment page (2026-09-18). Nothing below this line has been edited.

## Part 1 - Assignment brief

````text
A note on this assignment
You’re competing with exceptional talent from around the world, including San Francisco and top universities. This is your opportunity to stand out—bring your best thinking, care, and effort to the assignment.

Brief
Rebuild a live product in 24 hours. Better than the original if you want.

That window is deliberately generous and we do not expect you to use all of it. The clock is tracked, never enforced.

The product
amazon.com

Start by using it. Sign up and go through the flows properly, every one of them, end to end. Take screenshots as you go. Understand the product fully before you write any code.

Then rebuild it.

Before you write anything
Run through this so your agent captures its prompts and responses into the repository: 8x agent capture setup

It takes about ten minutes. Do not start building until the capture test passes, and commit the `.agent-logs/` directory as you go rather than in one lump at the end.

What you hand in
A live link. Deployed and open, not a localhost recording.
A public repository. With `.agent-logs/` committed in it.
A walkthrough. Loom or anything similar, five minutes at most, camera on.
Put it in the walkthrough field.

Paste the live link and the repository into the links field, and label each one.

How it is judged
Speed. How much working product you got to in the time.
Product judgement. What you chose to build first, and what you left out.
UX and UI. Whether the thing you shipped is good to use.
Before you send it
The live link opens for somebody who is not signed in as you.
The repository is public, and `.agent-logs/` is in it.
Your camera is on in the walkthrough, and it is under five minutes.
Send your work

Check the highlighted fields before sending. Your work is still here.

Files

No file chosen
No files attached.
Attach files
PDF, PNG, JPEG, ZIP, MOV or MP4, up to 2 GB each.
Mandatory: camera on and voiceover
Walkthrough recordingRequired
Public HTTPS video link.

This item is required for this assignment.

Links

GitHubRequired
This item is required for this assignment.

Live Deployed URLOptional
Add a link
Anything you want to sayOptional
````

## Part 2 - 8x agent capture setup

````markdown
# 8x Assignment — Agent Capture Setup

Paste this entire file into your coding agent as your **first message**, before any
other work on the assignment. Do not start building until the check in step 4 passes.

We are not checking whether you used AI. We assume you did. We are checking *how* you
work with it, and the only way to see that is the raw prompt-and-response record.

---

## 1. Identify your setup

State, in your first reply:

- The tool you are using (Claude Code, Cursor, Codex CLI, Windsurf, Aider, other)
- The exact model or models, including which one plans and which one executes
- Whether that tool has a hook, lifecycle-event, or rules mechanism that can run a
  command automatically on every prompt and every response

If you do not know whether your tool has one, look it up before answering. Do not
guess, and do not fall back to manual logging until you have checked.

---

## 2. Install the capture hook

Set up automatic capture for your tool. **Whatever the mechanism, it must fire on its
own.** If you have to remember to run it, it is wrong.

Roughly, by tool:

- **Claude Code** — hooks in `.claude/settings.json` in the repo. Wire the prompt event
  and the end-of-turn event to a script that appends to the log. The end-of-turn hook
  receives a path to the session transcript on stdin.
- **Cursor / Windsurf** — a project rules file, plus whatever export or history
  mechanism the app provides. Check whether the app writes a session store on disk you
  can read from.
- **Codex CLI / Aider / other** — check for a session log, a transcript flag, or a
  config hook. Most write a session file somewhere; find it and extract from it.

If your tool genuinely has no automatic mechanism, say so explicitly, name what you
checked, and wrap the session instead. Saying "my tool cannot do this" without having
checked is the wrong answer.

---

## 3. What to capture

Write captures to `.agent-logs/` in the repo root. These are committed and ship with
your repo, publicly, so treat them as part of the submission.

**We want the prompt and the final response. Nothing in between.**

Not the thinking. Not the tool calls. Not the intermediate steps, the file reads, the
diffs, or the retries the model made on its own. Just: what you asked, and what came
back at the end of that turn.

Capture, per turn:

- The prompt, verbatim and in full. No truncation, no paraphrase, no cleanup.
- The final response for that prompt, in full, including the ones where it got it wrong.
- A UTC timestamp.
- The model name, so a switch mid-build is visible.

Do not:

- Add `.agent-logs/` to `.gitignore`. It ships with the repo.
- Edit, tidy, summarise, or delete an entry after the fact. A messy honest log scores
  better than a clean one, and we can tell the difference.

Commit the logs as you go, interleaved with the code they produced, not in one dump at
the end. The commit order shows the order you actually worked in.

### Format

Match this. It is the format we use internally, so it is the one we can read fastest.
One file per session, named `YYYY-MM-DD_HH-MM-SS_<session-id>.md`.

    ---
    session_id: 3f9c1a20-77bd-4e51-9a0e-1c2f83b4de77
    date: 2026-08-28
    author: your-github-handle
    model: claude-opus-5
    tool: claude-code
    project: naano-rebuild
    total_exchanges: 34
    first_prompt_time: 2026-08-28T09:14:02.118Z
    last_prompt_time: 2026-08-28T21:47:35.902Z
    ---

    # Session Log - 2026-08-28

    Session: `3f9c1a20` | Project: `naano-rebuild` | Author: `your-github-handle`

    ---

    [LOG_ENTRY type=PROMPT num=1 session=3f9c1a20]
    timestamp: 2026-08-28T09:14:02.118Z
    model: claude-opus-5

    Read the screenshots in /recon and map out the two sides of the product before
    writing any code. I want the data model first.


    [LOG_ENTRY type=RESPONSE num=1 session=3f9c1a20]
    timestamp: 2026-08-28T09:15:40.663Z
    model: claude-opus-5

    There are two distinct roles and they barely share a surface...


    [LOG_ENTRY type=PROMPT num=2 session=3f9c1a20]
    timestamp: 2026-08-28T09:31:11.204Z
    model: claude-opus-5

    The brief builder is wrong. A brand cannot see projected outcomes before
    committing budget, which is the whole point. Redo it.

---

## 4. Verify it works, then prove it

Do not start the assignment until you have done this.

1. Send yourself a canary prompt: `CAPTURE TEST — 8x assignment, <your name>`
2. Confirm the prompt **and** the response both appear in `.agent-logs/`
3. Start a second session, send another canary, and confirm that one lands too. A hook
   that only works in the session that created it is not installed.
4. Create `CAPTURE-TEST.md` in the repo root containing:
   - Your tool and model, from step 1
   - The mechanism you used, and the config file you changed
   - The path to the log file the canaries landed in
   - Both canary entries, pasted raw
   - Anything you tried first that did not work

`CAPTURE-TEST.md` is the first thing we open. If capture is not working the rest of the
submission is not assessable, so get this green before you build anything.

---

## 5. Then build

Once capture is verified, start the assignment in the same repo. Everything from here
is recorded automatically and you can stop thinking about it.

One thing worth knowing: we are not scoring the log for tidiness or for looking
impressive. Dead ends, wrong turns, and the moment you realised the first approach was
wrong are the most useful things in it. Leave them in.
````
