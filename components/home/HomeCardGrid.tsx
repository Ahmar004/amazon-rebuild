import { HomeCard } from "@/components/home/HomeCard";
import type { HomeCard as HomeCardData } from "@/lib/content/home";

type HomeCardGridProps = {
  cards: HomeCardData[];
};

// Desktop card grid: overlaps the hero by about 250px (negative margin on this relative
// container), 4 cards per row at 1280px+, 20px gap and side padding (plan task 1).
export function HomeCardGrid({ cards }: HomeCardGridProps) {
  return (
    <div className="relative z-10 mx-auto -mt-[250px] max-w-[1500px] px-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <HomeCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}
