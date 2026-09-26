type AboutThisItemProps = {
  features: string[];
};

// "About this item" bullets (docs/spec.md 5.5).
export function AboutThisItem({ features }: AboutThisItemProps) {
  if (features.length === 0) return null;

  return (
    <div>
      <h2 className="text-base font-bold text-fg">About this item</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg">
        {features.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}
