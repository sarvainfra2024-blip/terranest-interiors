import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, MapPin, Palette, Box, Layers, Factory, Wrench, Home, Star, CheckCircle, Clock, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { base44 } from "@/api/base44Client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const ICON_MAP = { MessageSquare, MapPin, Palette, Box, Layers, Factory, Wrench, Home, Star, CheckCircle, Clock, Award };

const DEFAULT_STEPS = [
  { icon: "MessageSquare", title: "Consultation", desc: "We begin with a detailed discussion about your vision, lifestyle, preferences, and budget to understand exactly what you need.", detail: "Free of charge · 1-2 hours" },
  { icon: "MapPin", title: "Site Visit", desc: "Our team visits your space to take precise measurements, assess structural elements, and understand the natural light and ventilation.", detail: "Within 48 hours of consultation" },
  { icon: "Palette", title: "Concept Design", desc: "Our designers create mood boards, floor plans, and material palettes tailored to your aesthetic and functional requirements.", detail: "2-3 design concepts presented" },
  { icon: "Box", title: "3D Visualization", desc: "Experience your future home through photorealistic 3D renders and virtual walkthroughs before any construction begins.", detail: "Photorealistic rendering" },
  { icon: "Layers", title: "Material Selection", desc: "Visit our experience center to touch, feel, and choose from our curated collection of premium materials, finishes, and hardware.", detail: "200+ material options" },
  { icon: "Factory", title: "Manufacturing", desc: "Your custom furniture and fittings are precision-crafted in our 15,000 sq ft in-house manufacturing facility using CNC technology.", detail: "Quality-checked at every stage" },
  { icon: "Wrench", title: "Installation", desc: "Our skilled installation team brings everything together on-site with minimal disruption, following strict quality protocols.", detail: "Professional installation crew" },
  { icon: "Home", title: "Handover", desc: "We conduct a thorough walkthrough with you, ensure every detail meets your expectations, and hand over your dream home.", detail: "30-year warranty activated" },
];

export default function Process() {
  const { settings } = useSiteSettings();
  const [steps, setSteps] = useState(DEFAULT_STEPS);

  useEffect(() => {
    base44.entities.ProcessStep.list("order", 20).then((recs) => {
      if (recs && recs.length > 0) setSteps(recs);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-tech text-gold mb-4 block">
            {settings.process_label || "Our Process"}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            {settings.process_title || "From Vision to Reality"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-body text-lg max-w-xl mt-4"
          >
            {settings.process_subtitle || "A transparent, 8-step journey designed for a stress-free experience."}
          </motion.p>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-luxe">
          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-beige" />

            {steps.map((step, i) => {
              const IconComp = ICON_MAP[step.icon] || Home;
              return (
              <motion.div
                key={step.title + i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative pl-20 md:pl-24 pb-16 last:pb-0"
              >
                {/* Step number */}
                <div className="absolute left-0 md:left-2 top-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-charcoal flex items-center justify-center z-10">
                  <IconComp className="w-5 h-5 md:w-6 md:h-6 text-gold" />
                </div>

                {/* Content */}
                <div className="bg-offwhite p-6 md:p-8 rounded-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="label-tech text-gold text-[10px] block mb-1">
                        Step {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-xl md:text-2xl text-charcoal">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-500 font-body text-sm leading-relaxed mb-3">
                    {step.desc}
                  </p>
                  <span className="inline-block px-3 py-1 bg-beige text-xs font-body text-charcoal rounded-sm">
                    {step.detail}
                  </span>
                </div>
              </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-20">
            <p className="text-gray-500 font-body mb-6">
              Ready to start your design journey?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white font-body font-medium text-sm hover:bg-yellow-700 transition-colors rounded-sm"
            >
              Book Free Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}