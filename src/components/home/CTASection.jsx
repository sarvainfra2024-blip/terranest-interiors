import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function CTASection() {
  const { img } = useSiteSettings();
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-charcoal">
      <div className="absolute inset-0 opacity-10">
        <img
          src={img("cta_bg_image")}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container-luxe relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="label-tech text-gold mb-6"
        >
          Start Your Journey
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-3xl md:text-5xl text-white mb-6"
        >
          Ready to Transform Your Space?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 font-body text-lg max-w-xl mx-auto mb-10"
        >
          Book a free consultation with our expert designers and take the first
          step toward your dream home.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-white font-body font-medium text-sm hover:bg-yellow-700 transition-colors rounded-sm"
          >
            Book Free Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>

        </motion.div>
      </div>
    </section>
  );
}