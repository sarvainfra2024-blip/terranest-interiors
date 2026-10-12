import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TestimonialPreview() {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    base44.entities.Testimonial.filter({ is_public: true }, "order", 50).then(setTestimonials);
  }, []);

  if (testimonials.length === 0) return null;

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[current];

  return (
    <section className="section-spacing bg-beige">
      <div className="container-luxe">
        <div className="text-center mb-16">
          <span className="label-tech text-gold mb-4 block">Testimonials</span>
          <h2 className="heading-section text-charcoal">What Our Clients Say</h2>
          <div className="gold-line w-16 mx-auto mt-6" />
        </div>

        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-sm p-8 md:p-12 text-center shadow-sm"
            >
              <Quote className="w-8 h-8 text-gold/30 mx-auto mb-6" />
              <p className="font-body text-gray-600 text-base md:text-lg leading-relaxed mb-8 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <span key={i} className="text-gold text-sm">★</span>
                ))}
              </div>
              <p className="font-heading text-lg text-charcoal">{t.client_name}</p>
              <p className="text-sm font-body text-gray-400">
                {[t.project_type, t.location].filter(Boolean).join(" · ")}
              </p>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={prev} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-gold" : "bg-gray-300"}`}
                  />
                ))}
              </div>
              <button onClick={next} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}