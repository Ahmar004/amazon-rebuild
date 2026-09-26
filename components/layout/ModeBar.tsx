import { ShoppingBag, Store } from "lucide-react";
import { switchMode } from "@/actions/mode";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { getShopMode } from "@/lib/mode-server";
import { SELLER_LINKS, SUBNAV_LINKS } from "@/lib/constants/links";
import { SHOP_MODE, type ShopMode } from "@/lib/constants/mode";

const ROW = "mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-1.5 sm:px-6";
const LINK = "shrink-0 rounded-full px-3 py-1 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg";

// The header's second row (D4): the Buying / Selling switch, then that mode's quick links. It
// reads the mode cookie, so the layout renders it inside <Suspense> with ModeBarFallback.
export async function ModeBar() {
  const mode = await getShopMode();
  const links = mode === SHOP_MODE.selling ? SELLER_LINKS : SUBNAV_LINKS;
  return (
    <div className={ROW}>
      <ModeSwitch mode={mode} />
      <nav aria-label={mode === SHOP_MODE.selling ? "Seller links" : "Quick links"} className="scrollbar-hide flex min-w-0 gap-1 overflow-x-auto">
        {links.map((link, index) => (
          <span key={link.href} className="shrink-0 animate-[fade-in_250ms_ease-out_both]" style={{ animationDelay: `${index * 40}ms` }}>
            <NavAnchor link={link} className={LINK} />
          </span>
        ))}
      </nav>
    </div>
  );
}

export function ModeBarFallback() {
  return (
    <div className={ROW} aria-hidden="true">
      <div className="h-8 w-[178px] shrink-0 rounded-full bg-surface-muted" />
    </div>
  );
}

const OPTIONS = [
  { mode: SHOP_MODE.buying, label: "Buying", Icon: ShoppingBag },
  { mode: SHOP_MODE.selling, label: "Selling", Icon: Store },
] as const;

// A two-option segmented switch. It is a plain form, so it works before JavaScript loads; the
// thumb slides to the chosen side.
function ModeSwitch({ mode }: { mode: ShopMode }) {
  const selling = mode === SHOP_MODE.selling;
  return (
    <form action={switchMode} className="relative grid shrink-0 grid-cols-2 rounded-full bg-surface-muted p-0.5 ring-1 ring-border" aria-label="Shopping mode">
      <span
        aria-hidden="true"
        className={`absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-accent shadow-card transition-transform duration-300 ease-out ${selling ? "translate-x-full" : ""}`}
      />
      {OPTIONS.map(({ mode: option, label, Icon }) => {
        const active = option === mode;
        return (
          <button
            key={option}
            type="submit"
            name="mode"
            value={option}
            aria-pressed={active}
            className={`relative z-10 inline-flex h-7 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors duration-300 ${active ? "text-accent-fg" : "text-fg-muted hover:text-fg"}`}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </form>
  );
}
