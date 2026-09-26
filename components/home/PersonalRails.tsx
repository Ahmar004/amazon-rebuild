import { getCurrentUser } from "@/lib/auth/current-user";
import { getRecentlyViewed } from "@/lib/data/history";
import { getBuyAgain } from "@/lib/data/orders";
import { ProductCardRail } from "@/components/product/ProductCardRail";

// The signed-in rails on the home page (frontend-rebuild.md C6). They read the session, so the
// page renders them inside <Suspense>, outside the cached catalogue sections. A rail with nothing
// in it is simply not shown.
export async function PersonalRails() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [recent, buyAgain] = await Promise.all([getRecentlyViewed(user.id), getBuyAgain(user.id)]);

  return (
    <>
      <ProductCardRail title="Recently viewed" subtitle={`Pick up where you left off, ${user.firstName}`} items={recent} />
      <ProductCardRail title="Buy again" subtitle="Items from your past orders" items={buyAgain} />
    </>
  );
}
