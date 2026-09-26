"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { submitSupportRequest } from "@/actions/support";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SUPPORT_LIMITS, SUPPORT_TOPICS } from "@/lib/constants/support";

const FIELD = "w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-danger";

type ContactFormProps = {
  /** The shopper's orders to link the request to, newest first. */
  orders: { id: string; label: string }[];
  /** Pre-selected when arriving from an order's "Get help". */
  defaultOrderId?: string;
};

// "Contact us" (C18): what it's about, an optional order, a subject and the message. Saved to
// support_requests; the list below the form shows it straight away.
export function ContactForm({ orders, defaultOrderId }: ContactFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = {
      topic: String(data.get("topic") ?? ""),
      orderId: String(data.get("orderId") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    startTransition(async () => {
      const result = await submitSupportRequest(input);
      if (result.ok) {
        setErrors({});
        setFormKey((k) => k + 1);
        toast("Thanks, we've got your message");
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        if (result.error) toast(result.error, "error");
      }
    });
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} noValidate className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="What is it about?" id="topic" error={errors.topic}>
          <select id="topic" name="topic" defaultValue={defaultOrderId ? "order" : ""} aria-invalid={errors.topic ? true : undefined} className={`${FIELD} h-10`}>
            <option value="" disabled>
              Choose a topic
            </option>
            {SUPPORT_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Order (optional)" id="orderId" error={errors.orderId}>
          <select id="orderId" name="orderId" defaultValue={defaultOrderId ?? ""} aria-invalid={errors.orderId ? true : undefined} className={`${FIELD} h-10`}>
            <option value="">Not about a specific order</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Input label="Subject" name="subject" maxLength={SUPPORT_LIMITS.subjectMax} error={errors.subject} className="mt-4" />
      <Field label="Message" id="message" error={errors.message} className="mt-4">
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={SUPPORT_LIMITS.messageMax}
          aria-invalid={errors.message ? true : undefined}
          placeholder="Tell us what happened and what you'd like us to do."
          className={`${FIELD} py-2`}
        />
      </Field>
      <Button type="submit" className="mt-4 rounded-full" disabled={pending}>
        {pending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}

function Field({ label, id, error, className, children }: { label: string; id: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-fg">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
