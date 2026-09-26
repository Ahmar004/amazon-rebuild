"use client";

import { useState } from "react";

type ReviewBodyProps = {
  body: string;
};

const CLAMP_LENGTH = 500;

// A review's text, clamped to a few lines with a "Read more" toggle (docs/spec.md 5.5).
export function ReviewBody({ body }: ReviewBodyProps) {
  const [expanded, setExpanded] = useState(false);
  const needsClamp = body.length > CLAMP_LENGTH;

  return (
    <div>
      <p className={`whitespace-pre-line text-sm text-fg ${!expanded && needsClamp ? "line-clamp-4" : ""}`}>
        {body}
      </p>
      {needsClamp && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-sm text-accent hover:text-accent-hover hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
