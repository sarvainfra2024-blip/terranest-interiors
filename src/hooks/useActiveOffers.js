import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const today = () => new Date().toISOString().slice(0, 10);

export function useActiveOffers() {
  return useQuery({
    queryKey: ["active-offers"],
    queryFn: async () => {
      const data = await base44.entities.Offer.list("order");
      return (data || [])
        .filter((o) => o.is_active && o.is_public)
        .filter(
          (o) =>
            (!o.valid_from || o.valid_from <= today()) &&
            (!o.valid_until || o.valid_until >= today())
        )
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    staleTime: 60000,
  });
}