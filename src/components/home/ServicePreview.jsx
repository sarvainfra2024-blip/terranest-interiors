import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { base44 } from "@/api/base44Client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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

export default function ServicePreview() {
  const [services, setServices] = useState([]);
  const { img } = useSiteSettings();

  useEffect(() => {
    base44.entities.Service.list("order", 6)
      .then((recs) => setServices((recs || []).slice(0, 6)));
  }, []);

  const getImage = (service) => {
    if (service.image) return service.image;
    const key = IMG_KEY_MAP[service.title];
    return key ? img(key) : img("img_service_home");
  };

  return (
    <section className="section-spacing bg-white">
      <div className="container-luxe">
        <SectionHeader
          label="Our Services"
          title="Crafting Spaces That Inspire"
          subtitle="From concept to completion, we deliver tailored interior solutions for every room and every style."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link to="/services" className="group block">
                <div className="relative overflow-hidden rounded-sm aspect-[4/3] mb-5">
                  <img
                    src={getImage(service)}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <Home className="w-5 h-5 text-charcoal" />
                  </div>
                </div>
                <h3 className="font-heading text-xl text-charcoal mb-2 group-hover:text-gold transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm font-body text-gray-500 leading-relaxed mb-3">
                  {service.short_desc || service.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-body font-semibold text-gold uppercase tracking-wider">
                  Learn More <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-8 py-3 border border-charcoal text-charcoal font-body font-medium text-sm hover:bg-charcoal hover:text-white transition-all duration-300 rounded-sm"
          >
            View All Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}