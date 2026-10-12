import { Link } from "react-router-dom";
import { useActiveOffers } from "@/hooks/useActiveOffers";

export default function OfferTicker() {
  const { data: offers = [] } = useActiveOffers();
  const tickerOffers = offers.filter((o) => o.show_in_ticker !== false);

  if (tickerOffers.length === 0) return null;

  const segments = tickerOffers.map((o) => {
    const parts = [];
    if (o.title) parts.push(o.title);
    if (o.short_description) parts.push(o.short_description);
    else if (o.discount_percent != null) parts.push(`Get ${o.discount_percent}% OFF`);
    return parts.join(" – ");
  });

  const text = segments.join("    |    ");
  const duration = Math.max(25, Math.min(80, text.length * 0.2));

  return (
    <Link
      to="/offers"
      className="block bg-charcoal text-white overflow-hidden h-8 group relative z-10"
    >
      <div
        className="flex items-center h-full whitespace-nowrap animate-marquee"
        style={{ "--marquee-duration": `${duration}s` }}
      >
        <span className="text-xs font-body font-medium px-4 flex items-center gap-2">
          <span className="text-gold">🔥</span> {text} <span className="text-gold ml-2">Enquire Now →</span>
        </span>
        <span className="text-xs font-body font-medium px-4 flex items-center gap-2" aria-hidden="true">
          <span className="text-gold">🔥</span> {text} <span className="text-gold ml-2">Enquire Now →</span>
        </span>
      </div>
    </Link>
  );
}