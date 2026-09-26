"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { FAQ, SUPPORT_TOPICS, type SupportTopic } from "@/lib/constants/support";

// Searchable help topics (C18): a search box and topic chips narrow the questions, and each one
// opens in place. Matching is on the question and the answer, case-insensitive.
export function FaqBrowser() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<SupportTopic | null>(null);

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const entries = FAQ.filter(
    (entry) =>
      (!topic || entry.topic === topic) &&
      words.every((word) => `${entry.question} ${entry.answer}`.toLowerCase().includes(word)),
  );
  const topics = SUPPORT_TOPICS.filter((t) => FAQ.some((entry) => entry.topic === t.id));

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-bold text-fg">
        Help topics
      </h2>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative mt-3">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search help, e.g. refund, shipping cost, password"
          aria-label="Search help topics"
          className="h-12 w-full rounded-full border border-border-strong bg-surface pl-11 pr-4 text-sm text-fg outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </form>

      <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto" role="group" aria-label="Filter by topic">
        {[{ id: null, label: "All" } as const, ...topics].map((t) => (
          <button
            key={t.id ?? "all"}
            type="button"
            aria-pressed={topic === t.id}
            onClick={() => setTopic(t.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              topic === t.id ? "border-accent bg-accent text-accent-fg" : "border-border-strong text-fg hover:bg-surface-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-surface p-5 text-sm text-fg-muted">
          Nothing matches &quot;{query}&quot;. Try other words, or send us a message below.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          {entries.map((entry) => (
            <li key={entry.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-fg hover:bg-surface-muted">
                  {entry.question}
                  <ChevronDown size={16} className="shrink-0 text-fg-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-4 pb-4 text-sm leading-6 text-fg-muted">{entry.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
