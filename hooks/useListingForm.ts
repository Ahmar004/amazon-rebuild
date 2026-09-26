"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveListing } from "@/actions/listings";
import { useToast } from "@/components/ui/Toast";
import { productHref, ROUTES } from "@/lib/constants/links";

// Submits the "Sell an item" / edit form: reads the fields, sends them with the uploaded photo
// URLs, shows the server's field errors, and on success returns to "Your listings" with a toast
// that links to the live product page.
export function useListingForm({ asin, photos, uploading }: { asin?: string; photos: string[]; uploading: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) {
      toast("Wait for the photos to finish uploading.", "error");
      return;
    }
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "");
    const input = {
      asin,
      title: text("title"),
      brand: text("brand"),
      categorySlug: text("categorySlug"),
      price: text("price"),
      listPrice: text("listPrice"),
      stock: text("stock"),
      description: text("description"),
      features: data.getAll("features").map(String),
      photos,
    };
    startTransition(async () => {
      const result = await saveListing(input);
      if (result.ok) {
        setErrors({});
        const href = productHref(result.asin);
        toast(asin ? "Changes saved" : "Your item is live", "success", { label: "View listing", onClick: () => router.push(href) });
        router.push(ROUTES.sellerListings);
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        if (result.error) toast(result.error, "error");
        else toast("Check the highlighted fields.", "error");
      }
    });
  }

  // A field's error clears as soon as the seller changes that field.
  function clearError(name: string) {
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  return { errors, pending, handleSubmit, clearError };
}
