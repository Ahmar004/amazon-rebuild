import { FLAG_SPRITE, NAV_SPRITE, SPRITES } from "@/lib/assets";

type SpriteProps = {
  name: keyof typeof SPRITES;
  className?: string;
  /** Accessible label. Omit to keep the sprite decorative (aria-hidden). */
  label?: string;
};

// Renders one icon from Amazon's nav sprite sheet (or the flag sheet for usFlag) as a
// fixed-size span with the right background position, per lib/assets.ts SPRITES.
export function Sprite({ name, className, label }: SpriteProps) {
  const { position, width, height } = SPRITES[name];
  const sheet = name === "usFlag" ? FLAG_SPRITE : NAV_SPRITE;

  return (
    <span
      className={`inline-block shrink-0 bg-no-repeat ${className ?? ""}`}
      style={{
        backgroundImage: `url(${sheet})`,
        backgroundPosition: position,
        width,
        height,
      }}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    />
  );
}
