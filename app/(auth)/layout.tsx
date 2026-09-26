import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Footer } from "@/components/layout/Footer";
import { AuthShowcase } from "@/components/auth/AuthShowcase";

// Shell for /signin and /register: the logo and theme switch on top, the photo showcase beside
// (desktop) or above (phones) the auth card, and the compact footer with the demo notice. No links
// into the store, since it needs an account. Teal, violet and amber glows drift behind everything.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-16 h-[28rem] w-[28rem] rounded-full bg-glow-teal blur-3xl animate-[drift_16s_ease-in-out_infinite]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-glow-violet blur-3xl animate-[drift_20s_ease-in-out_infinite_reverse]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/3 -top-24 h-80 w-80 rounded-full bg-glow-amber blur-3xl animate-[drift_24s_ease-in-out_infinite]" />
      <header className="relative mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <ThemeToggle className="text-fg hover:bg-surface-muted" />
      </header>
      <main className="relative mx-auto grid w-full max-w-[1200px] flex-1 content-start items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:content-center lg:gap-12">
        <AuthShowcase />
        <div className="flex justify-center">{children}</div>
      </main>
      <Footer compact />
    </div>
  );
}
