"use client";

import { useEffect, useState } from "react";

// Shows on every first load/reload (not persisted) per user request - a phishing-avoidance
// disclaimer, same wording as SafetyNotice, plus a contact link.
export function SafetyNoticePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-white p-4 shadow-lg">
        <p className="text-sm text-text">
          Demo clone built for an 8x assessment. Not affiliated with Amazon. Do not enter real
          Amazon credentials. Contact{" "}
          <a
            href="mailto:ahmarali2004@gmail.com"
            className="text-link underline hover:text-link-hover"
          >
            the developer
          </a>{" "}
          for more details.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 rounded bg-btn-yellow px-3 py-1 text-xs font-medium text-text hover:bg-btn-yellow-hover"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
