// The Overview tab: the feature bullets, then the description paragraphs.
export function ProductOverview({ features, description }: { features: string[]; description: string }) {
  if (features.length === 0 && !description) {
    return <p className="text-sm text-fg-muted">The seller has not added an overview for this product yet.</p>;
  }
  return (
    <div className="space-y-5 text-sm leading-6 text-fg">
      {features.length > 0 && (
        <div>
          <h2 className="text-base font-bold">About this item</h2>
          <ul className="mt-2 space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {description && (
        <div>
          <h2 className="text-base font-bold">Description</h2>
          <div className="mt-2 space-y-2">
            {description.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
