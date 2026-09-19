type EmptyResultsProps = {
  query?: string;
};

// Amazon's no-results message; the sidebar still shows around this (docs/design.md 6.3).
export function EmptyResults({ query }: EmptyResultsProps) {
  return (
    <div className="py-8">
      <p className="text-lg text-text">
        {query ? (
          <>
            No results for <span className="font-bold text-results-query">&quot;{query}&quot;</span>.
          </>
        ) : (
          "No results."
        )}
      </p>
      <p className="mt-2 text-sm text-text">Try checking your spelling or use more general terms</p>
    </div>
  );
}
