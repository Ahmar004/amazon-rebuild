import { getCurrentUser } from "@/lib/auth/current-user";
import { getRecentlyViewed } from "@/lib/data/history";
import { getBuyAgain } from "@/lib/data/orders";
import { ProductRail } from "@/components/home/ProductRail";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";

// The signed-in rails on the home page (frontend-rebuild.md C6). They read the session, so the
// page renders them inside <Suspense>, outside the cached catalogue sections. A rail with nothing
// in it is simply not shown.
export async function PersonalRails() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [recent, buyAgain] = await Promise.all([getRecentlyViewed(user.id), getBuyAgain(user.id)]);

  return (
    <>
      {recent.length > 0 && (
        <Reveal>
          <ProductRail title="Recently viewed" subtitle={`Pick up where you left off, ${user.firstName}`}>
            {recent.map((item) => (
              <ProductCard key={item.asin} item={item} />
            ))}
          </ProductRail>
        </Reveal>
      )}
      {buyAgain.length > 0 && (
        <Reveal>
          <ProductRail title="Buy again" subtitle="Items from your past orders">
            {buyAgain.map((item) => (
              <ProductCard key={item.asin} item={item} />
            ))}
          </ProductRail>
        </Reveal>
      )}
    </>
  );
}
