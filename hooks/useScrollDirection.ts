import { useEffect, useState } from "react";

const HIDE_AFTER_PX = 100;

// Used only on /s (docs/design.md 6.1, 6.3): hides the header after scrolling down past
// HIDE_AFTER_PX and shows it again as soon as the user scrolls up.
export function useScrollDirection(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      if (y > lastY && y > HIDE_AFTER_PX) {
        setHidden(true);
      } else if (y < lastY) {
        setHidden(false);
      }
      lastY = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
