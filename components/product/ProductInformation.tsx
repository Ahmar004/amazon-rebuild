"use client";

import { useState } from "react";

type ProductInformationProps = {
  details: Record<string, string>;
  description: string;
};

// "Product information": an "Item details" accordion (two-column table) plus the description
// paragraphs, in the recon's style (docs/spec.md 5.5).
export function ProductInformation({ details, description }: ProductInformationProps) {
  const [open, setOpen] = useState(true);
  const entries = Object.entries(details);

  return (
    <section id="product-information">
      <h2 className="text-lg font-bold text-text">Product information</h2>

      {entries.length > 0 && (
        <div className="mt-3 border-t border-border">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center justify-between border-b border-border py-3 text-left text-base font-bold text-text"
          >
            Item details
            <CaretIcon open={open} />
          </button>
          {open && (
            <table className="w-full text-sm text-text">
              <tbody>
                {entries.map(([key, value]) => (
                  <tr key={key} className="border-b border-border">
                    <th scope="row" className="w-1/2 py-2 pr-4 text-left font-normal text-text-muted">
                      {key}
                    </th>
                    <td className="py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {description && (
        <div className="mt-4 space-y-2 text-sm text-text">
          {description.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </section>
  );
}

function CaretIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      aria-hidden="true"
      className={open ? "rotate-180" : undefined}
    >
      <path d="M1 1 L6 7 L11 1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
