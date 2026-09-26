import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Footer } from "@/components/layout/Footer";

// Shell for /signin and /register: the logo and theme switch on top, the centred auth card, and
// the compact footer with the demo notice. No links into the store, since it needs an account.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <ThemeToggle className="text-fg hover:bg-surface-muted" />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-6 sm:items-center">{children}</main>
      <Footer compact />
    </div>
  );
}
