import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Calendar, Tag, ArrowRight } from "lucide-react";
import { useActiveOffers } from "@/hooks/useActiveOffers";

const fmt = (v) => (v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "");

const ctaLink = (o) => {
  if (o.cta_action === "Custom URL" && o.cta_url) return o.cta_url;
  return "/contact";
};

export default function OfferPopup() {
  const { data: offers = [] } = useActiveOffers();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const popupOffers = offers.filter((o) => o.show_in_popup !== false);

  useEffect(() => {
    if (popupOffers.length > 0 && !sessionStorage.getItem("offerPopupShown")) {
      const t = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("offerPopupShown", "1");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [popupOffers.length]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) setIndex(0);
  }, [open]);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % popupOffers.length),
    [popupOffers.length]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + popupOffers.length) % popupOffers.length),
    [popupOffers.length]
  );

  useEffect(() => {
    if (!open || popupOffers.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [open, popupOffers.length, next]);

  if (!open || popupOffers.length === 0) return null;

  const offer = popupOffers[Math.min(index, popupOffers.length - 1)];
  const isExternal = offer.cta_action === "Custom URL" && offer.cta_url;
  const ctaClass =
    "inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white text-sm font-medium hover:bg-gold transition-colors rounded-sm";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        <motion.div
          key={offer.id || index}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-500 hover:text-charcoal hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {offer.banner_image && (
            <div className="relative w-full overflow-hidden flex-shrink-0 bg-gray-50">
              <img
                src={offer.banner_image}
                alt={offer.title}
                className="w-full max-h-[50vh] object-contain"
              />
              {offer.discount_percent != null && (
                <span className="absolute top-4 left-4 bg-gold text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                  {offer.discount_percent}% OFF
                </span>
              )}
            </div>
          )}

          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            {!offer.banner_image && offer.discount_percent != null && (
              <span className="inline-block bg-gold text-white text-sm font-bold px-3 py-1.5 rounded-full mb-4">
                {offer.discount_percent}% OFF
              </span>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold uppercase tracking-widest">
                <Tag className="w-3 h-3" /> {offer.offer_type}
              </span>
            </div>

            <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-2">
              {offer.title}
            </h2>

            {offer.short_description && (
              <p className="text-sm text-gray-500 mb-3">{offer.short_description}</p>
            )}

            {offer.detailed_description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {offer.detailed_description}
              </p>
            )}

            {(offer.original_price != null || offer.offer_price != null) && (
              <div className="flex items-baseline gap-3 mb-4">
                {offer.original_price != null && (
                  <span className="text-lg text-gray-400 line-through">
                    {fmt(offer.original_price)}
                  </span>
                )}
                {offer.offer_price != null && (
                  <span className="text-2xl font-heading text-charcoal">
                    {fmt(offer.offer_price)}
                  </span>
                )}
                {offer.discount_percent != null && (
                  <span className="text-sm font-semibold text-gold">
                    {offer.discount_percent}% Off
                  </span>
                )}
              </div>
            )}

            {offer.valid_until && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
                <Calendar className="w-3.5 h-3.5" />
                Valid until {offer.valid_until}
              </div>
            )}

            {isExternal ? (
              <a
                href={offer.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={ctaClass}
              >
                {offer.cta_text || "Get Offer"} <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link
                to={ctaLink(offer)}
                onClick={() => setOpen(false)}
                className={ctaClass}
              >
                {offer.cta_text || "Get Offer"} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {popupOffers.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-500 hover:text-charcoal transition-colors z-10"
                aria-label="Previous offer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-500 hover:text-charcoal transition-colors z-10"
                aria-label="Next offer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                {popupOffers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? "w-6 bg-gold" : "w-2 bg-gray-300"
                    }`}
                    aria-label={`Go to offer ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}