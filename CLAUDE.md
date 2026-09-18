# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Amazon Clone - AI Rules

**What this repository is: a fully working clone of https://amazon.com, built as a one-day practical assessment.** The requirements document will be added under `docs/` when the assessment starts. Until the scope, tech stack and architecture are recorded in `docs/`, treat every such decision as an open question for the user, not a choice to make alone.

## Source of Truth and Roadmap Discipline

- Follow `roadmap.md` in root at all costs. DO NOT edit `roadmap.md` unless the user approves the exact change.
- `roadmap.md` governs the order of work. Do one step at a time. DO NOT start a later step, and DO NOT invent a new step - propose it in `roadmap.md` and wait for approval first.
- Every specification document lives in `docs/`. The only docs at the repository root are `roadmap.md`, this file and `README.md`; project config files also belong at the root. Where a comment or doc names a spec file without a directory, it means the copy in `docs/`.
- DO NOT invent requirements. If something the product needs is not in the specification documents, it is an open question for the user, not a decision to make alone. Where the specs are silent on how something looks or behaves, the reference is how amazon.com does it.

## Time Budget

- The whole build has a one-day deadline. Pick the simplest option that fully works over an elaborate one, and flag early any requirement that puts the deadline at risk.
- Build complete, working flows before polishing extras. A feature that works end-to-end matters more than a half-built feature that looks finished.

## Amazon Fidelity

- The UI must match amazon.com exactly: layout, colours, typography, spacing, iconography, copy tone and interaction behaviour. Apart from the URL, a user should not be able to tell it is a clone.
- Check the live amazon.com page for each screen before building it, rather than recreating it from memory.
- Every visible control must work. No dead links, placeholder buttons or fake states. Which controls get built follows the scope ranking in `docs/spec.md`; ask the user only about controls the spec does not cover, batched into one round.

## Writing Rules (apply to code, UI copy and docs)

- No emojis anywhere - not in code, comments, commit messages, or UI. Icons come from SVGs or an icon library that match Amazon's icons, never from unicode emoji.
- No long hyphens anywhere. Use a single hyphen "-" where a dash is needed.
- In docs, spell out technical justifications in plain sentences: state the claim, then the reason behind it.
- DO NOT bloat any doc. Every line must prevent a concrete mistake or answer a real question; cut anything that does neither.
- Use one agreed domain vocabulary (for example: product, category, cart, order, address, review) once it is defined in the specs. Import these terms from a constants module and DO NOT invent synonyms.

## Architecture Rules

- Keep data access behind one data layer whose shapes match the real API payloads. Components consume that layer, never inline fixtures, so mock data can be swapped for a real backend without touching the views.
- DO NOT embed data fetching, timers, or business logic in UI components. Extract to hooks or controllers, keep components pure (data in via props, actions out via callbacks), and lift shared state to the nearest common parent.
- DO NOT duplicate JSX blocks, hook logic, or utility patterns - extract to `components/`, `hooks/`, or `utils/` at the second cross-file use or the third repetition within the same file.
- DO NOT hardcode domain enum literals (order statuses, payment states, sort options, user roles if the specs define any); import them from a constants module.
- DO NOT hardcode design tokens inline. Amazon's colours, spacing and typography live in one theme definition, so one edit restyles every surface consistently.
- Derive every signed-in or role-dependent UI decision from one session object, never from ad hoc checks scattered through components. Never rely on the UI alone for authorisation; the backend must enforce the same rules.
- Money is calculated on the server (cart totals, tax, shipping, order totals). The client displays those values and never computes the charged amount itself.
- Prefer open source, openly licensed, or free-tier dependencies. Ask before adding anything that needs a paid plan or billing details.

## Responsive and Input Design

- Match Amazon's desktop layout and its mobile web layout as separate, deliberate designs rather than reflowing one into the other.
- Forms and dialogs: Enter submits, Esc cancels. Implement with a real `<form onSubmit={...}>` calling `event.preventDefault()`, `type='submit'` on the primary button, and `type='button'` on every other button.
- Meet basic accessibility: labelled inputs, visible focus states, sufficient contrast, and meaningful empty, loading and error states on every screen, styled the way Amazon styles them.

## Commands

Not yet defined. Add the install, dev, build, lint and test commands here once the project is scaffolded.

## Workflow

- Interview and ask me questions about things when you are having any confusion or when you have to take any important decision, do not take important decisions based on self-assumptions.
- Invoke the skill named in the roadmap step before starting that step, and announce which skill is being used.
- When writing utils, hooks, API routes or money logic, use test-driven-development before writing implementation code. Presentational components are verified by the visual check against the live amazon.com page instead.
- When using subagent-driven-development, use Opus for the main agent and Sonnet for the subagents to avoid hitting token limits.
- Git: make one commit per finished slice with a clear message. Never commit `.env.local` or any secret.
- When library or framework documentation is needed (APIs, versions, migration details), fetch current docs rather than relying on training data.
- When an answer, decision or clarification is needed, ask via the AskUserQuestion tool and keep looping with follow-up rounds until every open point is resolved. DO NOT end a turn with questions posed only in prose.
