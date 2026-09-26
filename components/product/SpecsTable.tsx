// The Specs tab: the product's details as a two-column table.
export function SpecsTable({ details }: { details: Record<string, string> }) {
  const entries = Object.entries(details);
  if (entries.length === 0) {
    return <p className="text-sm text-fg-muted">No specifications are listed for this product.</p>;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm text-fg">
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b border-border last:border-b-0 even:bg-surface-muted/60">
              <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-semibold text-fg-muted">
                {key}
              </th>
              <td className="break-words px-4 py-2.5">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
