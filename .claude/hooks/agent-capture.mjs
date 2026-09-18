#!/usr/bin/env node
// 8x agent capture: logs every prompt and final response to .agent-logs/.
//
// Wired in .claude/settings.json:
//   UserPromptSubmit -> `node agent-capture.mjs prompt`  (logs the prompt as it is sent)
//   Stop             -> `node agent-capture.mjs stop`    (logs the final response of the turn)
//   SessionStart     -> `node agent-capture.mjs session-start` (remembers the model id when given)
// Manual one-off:
//   node agent-capture.mjs backfill <transcript.jsonl>   (logs finished turns from before the hook existed)
//
// Answers given through the AskUserQuestion tool are the user's words too, so they are logged as
// PROMPT entries, preceded by a RESPONSE entry holding the question as it was shown.
// Thinking, tool calls and intermediate steps are never logged.
// Log bodies are append-only; only the frontmatter counters are rewritten.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const AUTHOR = 'Ahmar004';
const PROJECT = 'amazon-rebuild';
const TOOL = 'claude-code';
const INTERRUPTED = '(no final response - the turn ended before the agent replied)';

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const logsDir = path.join(projectDir, '.agent-logs');
const stateDir = path.join(projectDir, '.claude', 'agent-capture');

// ---------- transcript parsing ----------

function readTranscript(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return [];
  return fs
    .readFileSync(transcriptPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null; // a line still being written
      }
    })
    .filter(Boolean);
}

function promptTextOf(entry) {
  if (entry.type !== 'user' || entry.isMeta || entry.isSidechain || entry.isCompactSummary) return null;
  if (entry.origin && entry.origin.kind && entry.origin.kind !== 'human') return null; // e.g. task notifications
  const content = entry.message && entry.message.content;
  if (typeof content === 'string') return content;
  if (!Array.isArray(content) || content.some((c) => c.type === 'tool_result')) return null;
  const parts = content.map((c) => (c.type === 'text' ? c.text : `[${c.type} attached]`));
  return parts.length ? parts.join('\n') : null;
}

// Splits the transcript into turns, each starting at a real user prompt.
function splitTurns(entries) {
  const turns = [];
  for (const entry of entries) {
    const text = promptTextOf(entry);
    if (text !== null) {
      turns.push({ promptId: entry.promptId || entry.uuid, prompt: text, timestamp: entry.timestamp, entries: [] });
    } else if (turns.length && !entry.isSidechain) {
      turns[turns.length - 1].entries.push(entry);
    }
  }
  return turns;
}

function renderQuestions(input) {
  return (input.questions || [])
    .map((q) => {
      const options = (q.options || []).map((o) => {
        const preview = o.preview ? `\n    preview:\n${o.preview.replace(/^/gm, '      ')}` : '';
        return `  - ${o.label}: ${o.description}${preview}`;
      });
      return `[AskUserQuestion${q.multiSelect ? ', multi-select' : ''}] ${q.question}\n${options.join('\n')}`;
    })
    .join('\n\n');
}

function renderAnswers(entry, block) {
  const result = entry.toolUseResult;
  if (result && result.answers) {
    return Object.entries(result.answers)
      .map(([question, answer]) => {
        const notes = result.annotations && result.annotations[question] && result.annotations[question].notes;
        return `[Answer to: ${question}]\n${answer}${notes ? `\n[Notes]\n${notes}` : ''}`;
      })
      .join('\n\n');
  }
  return typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
}

// Walks one turn and returns the question/answer exchanges, the trailing final text and the model.
function analyseTurn(turn) {
  const exchanges = [];
  const askIds = new Set();
  let pendingText = [];
  let model = null;
  for (const entry of turn.entries) {
    if (entry.type === 'assistant' && entry.message) {
      if (entry.message.model && entry.message.model !== '<synthetic>') model = entry.message.model;
      for (const block of entry.message.content || []) {
        if (block.type === 'text' && block.text.trim()) pendingText.push(block.text.trim());
        if (block.type === 'tool_use' && block.name === 'AskUserQuestion') {
          askIds.add(block.id);
          const question = [...pendingText, renderQuestions(block.input || {})].join('\n\n');
          exchanges.push({ type: 'RESPONSE', text: question, timestamp: entry.timestamp, model });
          pendingText = [];
        } else if (block.type === 'tool_use') {
          pendingText = []; // text before an ordinary tool call is an intermediate step
        }
      }
    } else if (entry.type === 'user' && Array.isArray(entry.message && entry.message.content)) {
      for (const block of entry.message.content) {
        if (block.type === 'tool_result' && askIds.has(block.tool_use_id)) {
          exchanges.push({ type: 'PROMPT', text: renderAnswers(entry, block), timestamp: entry.timestamp, model });
        }
      }
    }
  }
  return { exchanges, finalText: pendingText.join('\n\n'), model };
}

function lastModelIn(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const m = entries[i].type === 'assistant' && entries[i].message && entries[i].message.model;
    if (m && m !== '<synthetic>') return m;
  }
  return null;
}

function configuredModel() {
  for (const file of [
    path.join(projectDir, '.claude', 'settings.local.json'),
    path.join(projectDir, '.claude', 'settings.json'),
    path.join(os.homedir(), '.claude', 'settings.json'),
  ]) {
    try {
      const model = JSON.parse(fs.readFileSync(file, 'utf8')).model;
      if (model) return model;
    } catch {
      // missing or unreadable settings file
    }
  }
  return null;
}

// ---------- state and log file ----------

function loadState(sessionId) {
  const file = path.join(stateDir, `${sessionId}.json`);
  try {
    return { file, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch {
    return { file, logFile: null, num: 0, lastModel: null, prompts: {} };
  }
}

function saveState(state) {
  fs.mkdirSync(stateDir, { recursive: true });
  const { file, ...data } = state;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function logFileFor(state, sessionId, firstTimestamp) {
  if (state.logFile && fs.existsSync(state.logFile)) return state.logFile;
  fs.mkdirSync(logsDir, { recursive: true });
  const existing = fs.readdirSync(logsDir).find((f) => f.endsWith(`_${sessionId}.md`));
  if (existing) return (state.logFile = path.join(logsDir, existing));
  const stamp = new Date(firstTimestamp).toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
  state.logFile = path.join(logsDir, `${stamp}_${sessionId}.md`);
  const date = stamp.slice(0, 10);
  const intro = `# Session Log - ${date}\n\nSession: \`${sessionId.slice(0, 8)}\` | Project: \`${PROJECT}\` | Author: \`${AUTHOR}\`\n\n---\n\n`;
  fs.writeFileSync(state.logFile, frontmatter(sessionId, date, '') + intro);
  return state.logFile;
}

function frontmatter(sessionId, date, body) {
  const prompts = [...body.matchAll(/^\[LOG_ENTRY type=PROMPT [^\]]*\]\ntimestamp: (\S+)/gm)].map((m) => m[1]);
  const models = [...new Set([...body.matchAll(/^\[LOG_ENTRY [^\]]*\]\ntimestamp: \S+\nmodel: (.+)/gm)].map((m) => m[1]))];
  return [
    '---',
    `session_id: ${sessionId}`,
    `date: ${date}`,
    `author: ${AUTHOR}`,
    `model: ${models.join(', ') || 'unknown'}`,
    `tool: ${TOOL}`,
    `project: ${PROJECT}`,
    `total_exchanges: ${prompts.length}`,
    `first_prompt_time: ${prompts[0] || ''}`,
    `last_prompt_time: ${prompts[prompts.length - 1] || ''}`,
    '---',
    '',
    '',
  ].join('\n');
}

function appendEntry(state, sessionId, { type, text, timestamp, model }) {
  const file = logFileFor(state, sessionId, timestamp);
  if (type === 'PROMPT') state.num += 1;
  const entry = `[LOG_ENTRY type=${type} num=${state.num} session=${sessionId.slice(0, 8)}]\ntimestamp: ${timestamp}\nmodel: ${model || 'unknown'}\n\n${text}\n\n\n`;
  const current = fs.readFileSync(file, 'utf8');
  const bodyStart = current.indexOf('---\n', 4) + 4; // end of the frontmatter block
  const body = current.slice(bodyStart).replace(/^\n+/, '') + entry;
  const date = /^date: (\S+)$/m.exec(current)[1];
  fs.writeFileSync(file, frontmatter(sessionId, date, body) + body);
}

// ---------- logging turns ----------

function logPrompt(state, sessionId, promptId, text, timestamp, model) {
  appendEntry(state, sessionId, { type: 'PROMPT', text, timestamp, model });
  state.prompts[promptId] = { num: state.num, responded: false, model };
}

function logResponse(state, sessionId, turn, finalText, timestamp) {
  const { exchanges, finalText: transcriptText, model } = analyseTurn(turn);
  // The final message may not be in the transcript yet when Stop fires, so fall back to the prompt's model.
  const turnModel = model || state.lastModel || state.prompts[turn.promptId].model;
  for (const exchange of exchanges) appendEntry(state, sessionId, { ...exchange, model: exchange.model || turnModel });
  const text = (finalText || transcriptText || '').trim() || INTERRUPTED;
  appendEntry(state, sessionId, { type: 'RESPONSE', text, timestamp, model: turnModel });
  state.prompts[turn.promptId].responded = true;
  if (model) state.lastModel = model;
}

// Logs every finished turn that is not in the log yet (or has no response yet).
function syncFinishedTurns(state, sessionId, turns, exceptPromptId) {
  for (const turn of turns) {
    if (turn.promptId === exceptPromptId) continue;
    const logged = state.prompts[turn.promptId];
    if (logged && logged.responded) continue;
    const { model } = analyseTurn(turn);
    if (!logged) logPrompt(state, sessionId, turn.promptId, turn.prompt, turn.timestamp, model || state.lastModel);
    const replies = turn.entries.filter((e) => e.type === 'assistant' && e.timestamp);
    const finishedAt = replies.length ? replies[replies.length - 1].timestamp : turn.timestamp;
    logResponse(state, sessionId, turn, null, finishedAt);
  }
}

function onPrompt(input) {
  const state = loadState(input.session_id);
  const entries = readTranscript(input.transcript_path);
  syncFinishedTurns(state, input.session_id, splitTurns(entries), input.prompt_id);
  const model =
    state.lastModel || lastModelIn(entries) || recentProjectModel(input.transcript_path) || configuredModel();
  if (!state.prompts[input.prompt_id]) {
    logPrompt(state, input.session_id, input.prompt_id, input.prompt, new Date().toISOString(), model);
  }
  saveState(state);
}

function onStop(input) {
  const state = loadState(input.session_id);
  const turns = splitTurns(readTranscript(input.transcript_path));
  syncFinishedTurns(state, input.session_id, turns, input.prompt_id);
  const turn = turns.find((t) => t.promptId === input.prompt_id) || turns[turns.length - 1];
  const now = new Date().toISOString();
  if (turn && !(state.prompts[turn.promptId] && state.prompts[turn.promptId].responded)) {
    if (!state.prompts[turn.promptId]) {
      const model = analyseTurn(turn).model || state.lastModel;
      logPrompt(state, input.session_id, turn.promptId, turn.prompt, turn.timestamp, model);
    }
    logResponse(state, input.session_id, turn, input.last_assistant_message, now);
  } else if (!turn && state.prompts[input.prompt_id] && !state.prompts[input.prompt_id].responded) {
    // Transcript unreadable: still log the final response the hook was handed.
    const text = (input.last_assistant_message || '').trim() || INTERRUPTED;
    const model = state.lastModel || state.prompts[input.prompt_id].model;
    appendEntry(state, input.session_id, { type: 'RESPONSE', text, timestamp: now, model });
    state.prompts[input.prompt_id].responded = true;
  }
  saveState(state);
}

// SessionStart sometimes carries the exact model id; keep it for the first prompt of the session.
function onSessionStart(input) {
  const state = loadState(input.session_id);
  if (input.model) state.lastModel = typeof input.model === 'string' ? input.model : input.model.id || state.lastModel;
  saveState(state);
}

// Newest model id used in any session of this project, for a new session's first prompt.
function recentProjectModel(transcriptPath) {
  if (!transcriptPath) return null;
  const dir = path.dirname(transcriptPath);
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.jsonl'))
      .map((f) => path.join(dir, f))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    for (const file of files) {
      const model = lastModelIn(readTranscript(file));
      if (model) return model;
    }
  } catch {
    // project transcript folder unreadable
  }
  return null;
}

function onBackfill(transcriptPath) {
  const entries = readTranscript(transcriptPath);
  const sessionId = path.basename(transcriptPath, '.jsonl');
  const state = loadState(sessionId);
  const turns = splitTurns(entries);
  const current = turns[turns.length - 1]; // still in progress; its own Stop hook logs it
  syncFinishedTurns(state, sessionId, turns, current && current.promptId);
  saveState(state);
  console.log(`backfilled ${state.num} prompts into ${state.logFile}`);
}

// ---------- entry point ----------

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

const mode = process.argv[2];
try {
  const input = mode === 'backfill' ? null : readStdin();
  if (input && !input.session_id) throw new Error(`hook input has no session_id: ${JSON.stringify(input)}`);
  if (mode === 'backfill') onBackfill(process.argv[3]);
  else if (mode === 'prompt') onPrompt(input);
  else if (mode === 'stop') onStop(input);
  else if (mode === 'session-start') onSessionStart(input);
} catch (error) {
  // Never block the session; record the failure instead.
  fs.mkdirSync(stateDir, { recursive: true });
  fs.appendFileSync(path.join(stateDir, 'errors.log'), `${new Date().toISOString()} ${mode} ${error.stack}\n`);
}
process.exit(0);
