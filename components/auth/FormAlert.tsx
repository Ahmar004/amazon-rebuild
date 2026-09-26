import { CircleAlert } from "lucide-react";

// A form-level error shown above the fields, e.g. a wrong email or password.
export function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-danger bg-danger-soft p-3 text-sm text-fg">
      <CircleAlert size={18} className="mt-px shrink-0 text-danger" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
