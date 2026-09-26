"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import type { AccountResult } from "@/actions/account";

// Runs one /account action, confirms it with a toast (or shows the error), and re-renders the
// server page so lists reflect the change.
export function useAccountAction() {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function run(call: () => Promise<AccountResult>, success: string, onResult?: (result: AccountResult) => void) {
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
