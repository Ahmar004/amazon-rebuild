import { getCurrentUser } from "@/lib/auth/current-user";
import { SideMenu } from "@/components/layout/SideMenu";
import type { Department } from "@/lib/data/departments";

type SideMenuSessionProps = {
  departments: Department[];
  variant?: "desktop" | "mobile";
};

// Reads the session (getCurrentUser is React.cache-deduped per request, so this and Greeting
// share one query) and feeds it to the client SideMenu. Used by both SubNav (desktop) and
// HeaderMobile (mobile), each wrapping it in its own <Suspense> since it reads cookies().
export async function SideMenuSession({ departments, variant }: SideMenuSessionProps) {
  const user = await getCurrentUser();
  return <SideMenu departments={departments} variant={variant} user={user} />;
}
