"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";

type PasswordInputProps = {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  error?: string;
  hint?: string;
};

// Password field with a show/hide toggle (C11), so a separate "confirm password" field isn't needed.
export function PasswordInput({ label, name, autoComplete, error, hint }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Input
        label={label}
        name={name}
        id={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        error={error}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="rounded-md p-2 text-fg-muted hover:text-fg"
          >
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        }
      />
      {hint && !error && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}
