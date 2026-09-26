// Remounts on navigation, so the checkout and thank-you pages fade up like the store's (point 18).
export default function CheckoutTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
