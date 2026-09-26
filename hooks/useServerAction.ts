"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

/** The result shape every account and listing Server Action returns. */
type ActionResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

// Runs one Server Action (account, listings), confirms it with a toast (or shows the error), and
// re-renders the server page so lists reflect the change.
export function useServerAction() {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function run(call: () => Promise<ActionResult>, success: string, onResult?: (result: ActionResult) => void) {
    startTransition(async () => {
      const result = await call();
      onResult?.(result);
      if (result.ok) {
        toast(success);
        router.refresh();
      } else if (result.error) {
        toast(result.error, "error");
      }
    });
  }

  return { pending, run };
}
