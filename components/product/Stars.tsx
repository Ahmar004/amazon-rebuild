import { useId } from "react";

const STAR_COUNT = 5;

type StarsProps = {
  rating: number;
  size?: number;
};

// One star SVG, filled 0/50/100% via a clip-path so half stars render without a sprite
// (docs/design.md 6.3: "Stars come from Stars ... with half-star support"). useId (not
// Math.random) keeps this deterministic and safe to prerender under cacheComponents.
function Star({ fill, size }: { fill: number; size: number }) {
  const id = `star-clip-${useId()}`;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={20 * fill} height="20" />
        </clipPath>
      </defs>
      <path
        d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z"
        fill="var(--color-border)"
      />
      <path
        d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z"
        fill="var(--color-star)"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}

// The star rating row: full, half and empty stars in --color-star.
export function Stars({ rating, size = 14 }: StarsProps) {
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
    const fill = Math.max(0, Math.min(1, rating - i));
    return <Star key={i} fill={fill} size={size} />;
  });

  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className="inline-flex items-center gap-px">
      {stars}
    </span>
  );
}
