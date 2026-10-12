import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TestimonialSubmitForm() {
  const [form, setForm] = useState({ client_name: "", location: "", project_type: "", rating: 5, quote: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name || !form.quote) return;
    setLoading(true);
    await base44.entities.Testimonial.create({ ...form, is_approved: false, is_public: false });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-sm p-8 shadow-sm">
      <h3 className="font-heading text-2xl text-charcoal mb-2">Share Your Experience</h3>
      <p className="text-sm font-body text-gray-400 mb-6">Your review will be displayed after our team reviews it.</p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-12 h-12 text-gold mx-auto mb-4" />
            <p className="font-heading text-xl text-charcoal mb-2">Thank You!</p>
            <p className="text-sm font-body text-gray-500">Your testimonial has been submitted for review.</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-body font-medium text-charcoal mb-1">Your Name *</label>
                <input
                  value={form.client_name}
                  onChange={(e) => update("client_name", e.target.value)}
                  required
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-charcoal mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-charcoal mb-1">Project Type</label>
              <input
                value={form.project_type}
                onChange={(e) => update("project_type", e.target.value)}
                placeholder="e.g. 3 BHK, Villa, Modular Kitchen"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-charcoal mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => update("rating", star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl transition-colors"
                  >
                    <span className={(hoverRating || form.rating) >= star ? "text-gold" : "text-gray-300"}>★</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-charcoal mb-1">Your Review *</label>
              <textarea
                value={form.quote}
                onChange={(e) => update("quote", e.target.value)}
                required
                rows={4}
                placeholder="Share your experience with TerranNest Interiors..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-charcoal text-white text-sm font-body font-medium hover:bg-gold transition-colors rounded-sm disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}