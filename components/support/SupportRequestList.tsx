"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { closeRequest } from "@/actions/support";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { SUPPORT_STATUS, SUPPORT_TOPICS } from "@/lib/constants/support";
import { ROUTES } from "@/lib/constants/links";
import type { SupportRequest } from "@/lib/data/support";

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

// The shopper's own requests and their status (C18), newest first. An open request can be marked
// resolved.
export function SupportRequestList({ requests }: { requests: SupportRequest[] }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  if (requests.length === 0) {
    return <p className="rounded-xl border border-border bg-surface p-5 text-sm text-fg-muted">You haven&apos;t contacted us yet. Messages you send show up here.</p>;
  }

  function resolve(id: string) {
    startTransition(async () => {
      const result = await closeRequest(id);
      if (result.ok) {
        toast("Marked as resolved");
        router.refresh();
      } else toast(result.error ?? "Please try again.", "error");
    });
  }

  return (
    <ul className="space-y-3">
      {requests.map((request) => {
        const open = request.status === SUPPORT_STATUS.open;
        return (
          <li key={request.id} className="rounded-xl border border-border bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold text-fg">{request.subject}</p>
              <Badge tone={open ? "accent" : "neutral"}>{open ? "Open" : "Resolved"}</Badge>
            </div>
            <p className="mt-1 text-xs text-fg-muted">
              {SUPPORT_TOPICS.find((t) => t.id === request.topic)?.label} &middot; Sent {DATE.format(request.createdAt)}
              {request.orderId && (
                <>
                  {" "}
                  &middot;{" "}
                  <Link href={`${ROUTES.orders}/${request.orderId}`} className="text-accent hover:underline">
                    Order # {request.orderId}
                  </Link>
                </>
              )}
            </p>
            <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-fg">{request.message}</p>
            {!open && request.closedAt && <p className="mt-2 text-xs text-fg-muted">Resolved {DATE.format(request.closedAt)}</p>}
            {open && (
              <button type="button" disabled={pending} onClick={() => resolve(request.id)} className="mt-2 text-sm font-semibold text-accent hover:underline disabled:opacity-50">
                Mark as resolved
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
