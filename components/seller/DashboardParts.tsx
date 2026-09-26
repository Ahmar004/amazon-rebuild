import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { PackageX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { editListingHref, productHref } from "@/lib/constants/links";
import { formatPrice } from "@/lib/pricing/money";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import type { RecentSale, TopListing } from "@/lib/data/seller";

// Presentational pieces of the seller dashboard (point 15, D4). Data comes in through props.

export function DashboardCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5 ${className ?? ""}`}>
      <h2 className="text-base font-bold text-fg">{title}</h2>
      {subtitle && <p className="text-xs text-fg-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatTile({ icon: Icon, label, value, index }: { icon: LucideIcon; label: string; value: string; index: number }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-card animate-[rise-in_500ms_cubic-bezier(0.2,0.7,0.2,1)_both]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-fg-muted">{label}</p>
        <p className="text-2xl font-semibold text-fg">{value}</p>
      </div>
    </div>
  );
}

// Best sellers among the seller's listings: one series, so each bar is labelled with its value
// at the tip instead of a legend. Bars are scaled to the best listing.
export function TopListings({ listings }: { listings: TopListing[] }) {
  if (listings.length === 0) return <p className="py-8 text-center text-sm text-fg-muted">Your best sellers show up here after your first sale.</p>;
  const max = Math.max(...listings.map((l) => l.cents));
  return (
    <ol className="space-y-3">
      {listings.map((listing, index) => (
        <li key={listing.asin}>
          <Link href={productHref(listing.asin)} className="group block">
            <p className="truncate text-sm text-fg group-hover:text-accent">{listing.title}</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-3 flex-1">
                <div
                  className="h-full origin-left rounded-r-[4px] bg-chart animate-[grow-right_700ms_cubic-bezier(0.2,0.7,0.2,1)_both]"
                  style={{ width: `${Math.max(2, (listing.cents / max) * 100)}%`, animationDelay: `${index * 80}ms` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-xs tabular-nums text-fg">
                <span className="font-semibold">{formatPrice(listing.cents)}</span>
                <span className="text-fg-muted"> · {listing.units}</span>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function RecentSales({ sales }: { sales: RecentSale[] }) {
  if (sales.length === 0) return <p className="py-8 text-center text-sm text-fg-muted">No sales yet. Share your listings and they&apos;ll appear here.</p>;
  return (
    <ul className="divide-y divide-border">
      {sales.map((sale) => (
        <li key={`${sale.orderId}-${sale.asin}`} className="flex items-center gap-3 py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sale.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-md border border-border bg-white object-contain" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-fg">{sale.title}</p>
            <p className="text-xs text-fg-muted">
              {formatDeliveryDate(sale.placedAt)} · Qty {sale.quantity} · to {sale.shipTo}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${sale.cancelled ? "text-fg-muted line-through" : "text-fg"}`}>{formatPrice(sale.cents)}</p>
            {sale.cancelled && <Badge>Cancelled</Badge>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NeedsAttention({ outOfStock }: { outOfStock: { asin: string; title: string }[] }) {
  if (outOfStock.length === 0) {
    return <p className="py-6 text-center text-sm text-fg-muted">All caught up. Nothing needs your attention.</p>;
  }
  return (
    <ul className="space-y-2">
      {outOfStock.map((listing) => (
        <li key={listing.asin} className="flex items-center gap-3 rounded-lg bg-surface-muted px-3 py-2">
          <PackageX size={18} className="shrink-0 text-deal" aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate text-sm text-fg">
            <span className="sr-only">Out of stock: </span>
            {listing.title}
          </p>
          <Link href={editListingHref(listing.asin)} className="shrink-0 text-xs font-semibold text-accent hover:underline">
            Restock
          </Link>
        </li>
      ))}
    </ul>
  );
}

