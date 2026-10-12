import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Factory, UserCheck, Gem, Wrench, BadgeDollarSign, Clock, Shield,
  Headphones, Star, Home, Zap, Award, Heart, Leaf, Eye, Settings, Phone
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { base44 } from "@/api/base44Client";

const ICON_MAP = {
  Factory, UserCheck, Gem, Wrench, BadgeDollarSign, Clock, Shield,
  Headphones, Star, Home, Zap, Award, Heart, Leaf, Eye, Settings, Phone
};

const DEFAULT_FEATURES = [
  { id: "d1", icon: "Factory", title: "In-house Manufacturing", desc: "Complete control over quality with our own production facility." },
  { id: "d2", icon: "UserCheck", title: "Dedicated Project Manager", desc: "A single point of contact from start to finish." },
  { id: "d3", icon: "Gem", title: "Premium Materials", desc: "Handpicked materials from trusted global suppliers." },
  { id: "d4", icon: "Wrench", title: "German Hardware", desc: "Hettich, Blum, and Hafele fittings for lasting durability." },
  { id: "d5", icon: "BadgeDollarSign", title: "Transparent Pricing", desc: "No hidden charges. What you see is what you pay." },
  { id: "d6", icon: "Clock", title: "45-Day Delivery", desc: "On-time project completion, guaranteed." },
  { id: "d7", icon: "Shield", title: "30-Year Warranty", desc: "Industry-leading warranty on all installations." },
  { id: "d8", icon: "Headphones", title: "Post-Installation Support", desc: "Dedicated aftercare for peace of mind." },
];

function DynamicIcon({ name }) {
  const Icon = ICON_MAP[name] || Star;
  return <Icon className="w-5 h-5 text-charcoal group-hover:text-gold transition-colors duration-500" />;
}

export default function WhyChoosePreview() {
  const { settings } = useSiteSettings();
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  useEffect(() => {
    base44.entities.WhyChooseFeature.filter({ is_active: true }, "order", 50)
      .then((recs) => { if (recs && recs.length > 0) setFeatures(recs); })
      .catch(() => {});
  }, []);

  return (
    <section className="section-spacing bg-white">
      <div className="container-luxe">
        <div className="text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="label-tech text-gold mb-4 block"
          >
            {settings.why_choose_label || "Why Terranest"}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-section text-charcoal"
          >
            {settings.why_choose_title || "The Terranest Difference"}
          </motion.h2>
          <div className="gold-line w-16 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id || feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group p-6 bg-offwhite hover:bg-charcoal rounded-sm transition-colors duration-500 cursor-default"
            >
              <div className="w-12 h-12 rounded-full bg-beige group-hover:bg-gold/20 flex items-center justify-center mb-4 transition-colors duration-500">
                <DynamicIcon name={feature.icon} />
              </div>
              <h3 className="font-heading text-lg text-charcoal group-hover:text-white mb-2 transition-colors duration-500">
                {feature.title}
              </h3>
              <p className="text-sm font-body text-gray-500 group-hover:text-gray-400 leading-relaxed transition-colors duration-500">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/why-choose-us"
            className="inline-flex items-center gap-2 text-sm font-body font-medium text-gold hover:text-yellow-700 transition-colors"
          >
            Discover More Reasons
            <span className="text-xs">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}