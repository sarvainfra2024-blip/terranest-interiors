import { X } from "lucide-react";

const fmt = (v) => v ? `₹${Number(v).toLocaleString("en-IN")}` : "";

export default function OfferPreviewModal({ offer, onClose }) {
  if (!offer) return null;
  const today = new Date().toISOString().slice(0, 10);
  const expired = offer.valid_until && offer.valid_until < today;
  const upcoming = offer.valid_from && offer.valid_from > today;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-heading text-lg text-charcoal">Preview</h3>
            <p className="text-xs text-gray-400">This is how the offer appears publicly — preview does not publish.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-charcoal"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            {offer.banner_image && (
              <div className="relative h-56 bg-gray-100">
                <img src={offer.banner_image} alt={offer.title} className="w-full h-full object-cover" />
                {offer.discount_percent != null && (
                  <span className="absolute top-4 right-4 bg-gold text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                    {offer.discount_percent}% OFF
                  </span>
                )}
                {(expired || upcoming) && (
                  <span className="absolute top-4 left-4 bg-charcoal/80 text-white text-xs px-3 py-1.5 rounded-full">
                    {expired ? "Expired" : "Upcoming"}
                  </span>
                )}
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gold uppercase tracking-wide">{offer.offer_type}</span>
              </div>
              <h2 className="font-heading text-2xl text-charcoal mb-2">{offer.title}</h2>
              {offer.short_description && <p className="text-sm text-gray-500 mb-3">{offer.short_description}</p>}
              {offer.detailed_description && <p className="text-sm text-gray-600 mb-4 leading-relaxed">{offer.detailed_description}</p>}

              {(offer.original_price != null || offer.offer_price != null) && (
                <div className="flex items-baseline gap-3 mb-4">
                  {offer.original_price != null && <span className="text-lg text-gray-400 line-through">{fmt(offer.original_price)}</span>}
                  {offer.offer_price != null && <span className="text-2xl font-heading text-charcoal">{fmt(offer.offer_price)}</span>}
                  {offer.discount_percent != null && <span className="text-sm font-semibold text-gold">{offer.discount_percent}% Off</span>}
                </div>
              )}

              <div className="text-xs text-gray-500 mb-4">
                {offer.valid_from && <span>Valid from {offer.valid_from}</span>}
                {offer.valid_until && <span> until {offer.valid_until}</span>}
              </div>

              <button className="inline-flex items-center px-6 py-2.5 bg-charcoal text-white text-sm font-medium hover:bg-gold transition-colors rounded-sm">
                {offer.cta_text || "Get Offer"}
              </button>

              {offer.terms_conditions && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Terms & Conditions</p>
                  <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{offer.terms_conditions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}