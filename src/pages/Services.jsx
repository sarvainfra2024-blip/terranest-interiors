import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { base44 } from "@/api/base44Client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

// icon key → image key mapping for site setting images
const IMG_KEY_MAP = {
  "Complete Home Interiors": "img_service_home",
  "Modular Kitchen": "img_service_kitchen",
  "Bedroom Interiors": "img_service_bedroom",
  "Living Room Design": "img_service_living",
  "Dining Room Design": "img_service_dining",
  "Wardrobe Design": "img_service_wardrobe",
  "False Ceiling": "img_service_ceiling",
  "Lighting Design": "img_service_lighting",
  "Furniture Design": "img_service_furniture",
  "Luxury Villa Interiors": "img_service_villa",
  "Office Interiors": "img_service_space",
  "Commercial Spaces": "img_service_commercial",
  "Renovation": "img_service_renovation",
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { img } = useSiteSettings();

  useEffect(() => {
    base44.entities.Service.list("order", 50)
      .then((recs) => setServices(recs || []))
      .finally(() => setLoading(false));
  }, []);

  const getImage = (service) => {
    if (service.image) return service.image;
    const key = IMG_KEY_MAP[service.title];
    return key ? img(key) : img("img_service_home");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-tech text-gold mb-4 block">
            Our Services
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            Every Space Deserves <span className="italic text-gold">Brilliance</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-body text-lg max-w-xl mt-4"
          >
            Comprehensive interior design solutions for homes, offices, and commercial spaces.
          </motion.p>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-luxe space-y-24">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gold rounded-full animate-spin" />
            </div>
          ) : (
            services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative overflow-hidden rounded-sm group">
                    <img
                      src={getImage(service)}
                      alt={service.title}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-charcoal" />
                    </div>
                  </div>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <span className="label-tech text-gold mb-3 block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-4">
                    {service.title}
                  </h2>
                  <p className="text-gray-500 font-body leading-relaxed mb-6">
                    {service.description || service.short_desc}
                  </p>
                  {service.features && service.features.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {service.features.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />
                          <span className="text-sm font-body text-gray-600">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white font-body font-medium text-sm hover:bg-gold transition-colors rounded-sm"
                  >
                    Get a Quote
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}