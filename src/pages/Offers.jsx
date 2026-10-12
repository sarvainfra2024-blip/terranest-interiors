import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Gift, Tag, Calendar, ArrowRight, Phone } from "lucide-react";

const fmt = (v) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "";
const today = new Date().toISOString().slice(0, 10);

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Offer.list("order");
        const valid = (data || [])
          .filter((o) => o.is_active && o.is_public)
          .filter((o) => (!o.valid_from || o.valid_from <= today) && (!o.valid_until || o.valid_until >= today))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setOffers(valid);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const ctaLink = (o) => {
    if (o.cta_action === "Custom URL" && o.cta_url) return o.cta_url;
    if (o.cta_action === "Book Consultation") return "/contact";
    if (o.cta_action === "Contact") return "/contact";
    return "/contact";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite pt-16">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite pt-16 md:pt-20">
      {/* Hero */}
      <div className="bg-charcoal text-white py-16 md:py-24">
        <div className="container-luxe text-center">
          <div className="inline-flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            <Gift className="w-4 h-4" /> Limited Time
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">Offer Zone</h1>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
            Exclusive interior design offers and seasonal promotions. Premium spaces, exceptional value.
          </p>
        </div>
      </div>

      {/* Offers */}
      <div className="container-luxe py-16 md:py-24">
        {offers.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-heading text-xl text-charcoal mb-2">No Current Offers</p>
            <p className="text-sm text-gray-500 mb-6">Check back soon for exclusive promotions and seasonal deals.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white text-sm font-medium hover:bg-gold transition-colors rounded-sm">
              Book a Consultation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {offers.map((o) => (
              <div key={o.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
                {o.banner_image && (
                  <div className="relative h-56 md:h-64 overflow-hidden bg-gray-100">
                    <img src={o.banner_image} alt={o.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {o.discount_percent != null && (
                      <span className="absolute top-4 right-4 bg-gold text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                        {o.discount_percent}% OFF
                      </span>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-charcoal text-xs font-medium px-3 py-1 rounded-full">
                        {o.offer_type}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  {!o.banner_image && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold uppercase tracking-wide">
                        <Tag className="w-3 h-3" /> {o.offer_type}
                      </span>
                    </div>
                  )}
                  <h2 className="font-heading text-2xl text-charcoal mb-2">{o.title}</h2>
                  {o.short_description && <p className="text-sm text-gray-500 mb-3">{o.short_description}</p>}
                  {o.detailed_description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {expanded === o.id ? o.detailed_description : o.detailed_description.length > 120 ? o.detailed_description.slice(0, 120) + "..." : o.detailed_description}
                      {o.detailed_description.length > 120 && (
                        <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="text-gold hover:underline ml-1">
                          {expanded === o.id ? "less" : "more"}
                        </button>
                      )}
                    </p>
                  )}

                  {(o.original_price != null || o.offer_price != null) && (
                    <div className="flex items-baseline gap-3 mb-4">
                      {o.original_price != null && <span className="text-lg text-gray-400 line-through">{fmt(o.original_price)}</span>}
                      {o.offer_price != null && <span className="text-2xl font-heading text-charcoal">{fmt(o.offer_price)}</span>}
                      {o.discount_percent != null && <span className="text-sm font-semibold text-gold">{o.discount_percent}% Off</span>}
                    </div>
                  )}

                  {(o.valid_from || o.valid_until) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {o.valid_from && <span>From {o.valid_from}</span>}
                      {o.valid_until && <span>{o.valid_from ? " until " : "Until "}{o.valid_until}</span>}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Link
                      to={ctaLink(o)}
                      {...(o.cta_action === "Custom URL" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white text-sm font-medium hover:bg-gold transition-colors rounded-sm"
                    >
                      {o.cta_text || "Get Offer"} <ArrowRight className="w-4 h-4" />
                    </Link>
                    {settings.phone && (
                      <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold transition-colors">
                        <Phone className="w-4 h-4" /> Enquire
                      </a>
                    )}
                  </div>

                  {o.terms_conditions && expanded === o.id && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Terms & Conditions</p>
                      <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{o.terms_conditions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}