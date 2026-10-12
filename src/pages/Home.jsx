import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SectionHeader from "@/components/SectionHeader";
import AnimatedCounter from "@/components/AnimatedCounter";
import ConsultationForm from "@/components/ConsultationForm";
import HeroSection from "@/components/home/HeroSection";
import ServicePreview from "@/components/home/ServicePreview";
import PortfolioTeaser from "@/components/home/PortfolioTeaser";
import WhyChoosePreview from "@/components/home/WhyChoosePreview";
import TestimonialPreview from "@/components/home/TestimonialPreview";
import TestimonialSubmitForm from "@/components/home/TestimonialSubmitForm";
import CTASection from "@/components/home/CTASection";
import BrandMarquee from "@/components/home/BrandMarquee";
import OfferPopup from "@/components/home/OfferPopup";

export default function Home() {
  const { settings } = useSiteSettings();

  const stats = [
    { value: settings.stat_customers ?? 6000, suffix: settings.stat_customers_suffix ?? "+", label: "Happy Customers" },
    { value: settings.stat_experience ?? 12, suffix: settings.stat_experience_suffix ?? "+", label: "Years Experience" },
    { value: settings.stat_warranty ?? 30, suffix: settings.stat_warranty_suffix ?? "", label: settings.stat_warranty_label || "Years Warranty" },
    { value: settings.stat_delivery ?? 45, suffix: settings.stat_delivery_suffix ?? "", label: settings.stat_delivery_label || "Days Delivery" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* Stats */}
      <section className="bg-charcoal py-16 md:py-20 relative overflow-hidden">
        <div className="container-luxe">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="font-heading text-3xl md:text-4xl text-white mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix || ""} />
                </p>
                <p className="label-tech text-gold text-[10px]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ServicePreview />
      <PortfolioTeaser />
      <WhyChoosePreview />
      <TestimonialPreview />

      {/* Submit Testimonial */}
      <section className="section-spacing bg-white">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="label-tech text-gold mb-4 block">Client Reviews</span>
              <h2 className="heading-section text-charcoal mb-4">Loved Your Experience?</h2>
              <div className="gold-line w-16 mb-6" />
              <p className="text-base font-body text-gray-500 leading-relaxed">
                We'd love to hear from you! Share your experience with TerranNest Interiors and help other homeowners make confident design decisions.
              </p>
            </div>
            <TestimonialSubmitForm />
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="section-spacing bg-beige">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                label="Free Consultation"
                title="Let's Design Your Dream Space"
                subtitle="Share your vision with us, and our expert designers will create a personalized plan that brings your dream home to life."
                align="left"
              />
              <div className="space-y-4 mt-8">
                {["Personalized design consultation", "3D visualization of your space", "Detailed cost estimation", "Material and finish selection"].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />
                    <span className="text-sm font-body text-gray-600">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <ConsultationForm />
          </div>
        </div>
      </section>

      <BrandMarquee />
      <CTASection />
      <Footer />
      <WhatsAppButton />
      <OfferPopup />
    </div>
  );
}