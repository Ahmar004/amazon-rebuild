// Remounts on every page change (unlike the layout), so each page's content fades up as the
// shopper navigates (point 18). The header, drawers and providers stay in the layout, untouched.
export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
