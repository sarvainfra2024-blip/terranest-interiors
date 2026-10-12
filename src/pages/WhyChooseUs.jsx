import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Factory, UserCheck, Gem, Wrench, BadgeDollarSign, Clock, Shield, Headphones, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AnimatedCounter from "@/components/AnimatedCounter";
import { ArrowRight } from "lucide-react";

const reasons = [
  { icon: Factory, title: "In-house Manufacturing", desc: "Our 15,000 sq ft facility gives us complete control over quality, timelines, and costs. Every piece is precision-crafted using CNC technology." },
  { icon: UserCheck, title: "Dedicated Project Manager", desc: "A single point of contact from day one to handover. Your project manager ensures seamless communication and on-time delivery." },
  { icon: Gem, title: "Premium Materials", desc: "We source materials from trusted global suppliers — BWP plywood, Hettich hardware, and curated finishes that stand the test of time." },
  { icon: Wrench, title: "German Hardware", desc: "Every drawer, hinge, and slide uses premium German hardware from Hettich, Blum, and Hafele for whisper-quiet, lasting performance." },
  { icon: BadgeDollarSign, title: "Transparent Pricing", desc: "No hidden charges, ever. Our itemized quotes break down every cost so you know exactly where your investment goes." },
  { icon: Clock, title: "45-Day Delivery", desc: "Guaranteed on-time delivery with our streamlined process. We respect your time as much as we respect our craft." },
  { icon: Shield, title: "30-Year Warranty", desc: "Industry-leading warranty coverage on all modular installations. We stand behind every product we deliver." },
  { icon: Headphones, title: "Post-Installation Support", desc: "Our relationship doesn't end at handover. Dedicated aftercare support for any adjustments or maintenance needs." },
  { icon: Eye, title: "No Hidden Charges", desc: "Complete transparency in pricing with detailed breakdowns. What we quote is what you pay — guaranteed." },
];

export default function WhyChooseUs() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-tech text-gold mb-4 block">
            Why Choose Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            The Terranest <span className="italic text-gold">Advantage</span>
          </motion.h1>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-luxe">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group p-8 bg-offwhite hover:bg-charcoal rounded-sm transition-all duration-500 border border-transparent hover:border-gray-800"
              >
                <div className="w-14 h-14 rounded-full bg-beige group-hover:bg-gold/20 flex items-center justify-center mb-5 transition-colors duration-500">
                  <reason.icon className="w-6 h-6 text-charcoal group-hover:text-gold transition-colors duration-500" />
                </div>
                <h3 className="font-heading text-xl text-charcoal group-hover:text-white mb-3 transition-colors duration-500">
                  {reason.title}
                </h3>
                <p className="text-sm font-body text-gray-500 group-hover:text-gray-400 leading-relaxed transition-colors duration-500">
                  {reason.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-20 bg-charcoal">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 6000, suffix: "+", label: "Happy Customers" },
            { value: 98, suffix: "%", label: "On-Time Delivery" },
            { value: 4.9, suffix: "/5", label: "Google Rating" },
            { value: 30, suffix: "yr", label: "Warranty" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-heading text-3xl md:text-4xl text-white">
                {stat.value % 1 === 0 ? (
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                ) : (
                  <>{stat.value}{stat.suffix}</>
                )}
              </p>
              <p className="label-tech text-gold text-[10px] mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing bg-beige text-center">
        <div className="container-luxe">
          <h2 className="heading-section text-charcoal mb-6">
            Experience the Difference
          </h2>
          <p className="text-gray-500 font-body text-lg max-w-xl mx-auto mb-8">
            Join 6,000+ homeowners who chose Terranest for their dream home.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white font-body font-medium text-sm hover:bg-yellow-700 transition-colors rounded-sm"
          >
            Book Free Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}