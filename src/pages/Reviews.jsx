import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SectionHeader from "@/components/SectionHeader";

const reviews = [
  {
    name: "Priya Sharma",
    location: "Bengaluru",
    project: "3 BHK Apartment · Whitefield",
    rating: 5,
    text: "UrbanNest transformed our apartment into a dream home. Every detail was carefully considered — from the custom wardrobe design to the ambient lighting. The team delivered ahead of schedule, and the quality exceeded our expectations. Arjun and his team were professional throughout.",
  },
  {
    name: "Rajesh & Meera Patel",
    location: "Mumbai",
    project: "Luxury Villa · Juhu",
    rating: 5,
    text: "Working with UrbanNest was a seamless experience. They understood our vision for a contemporary villa and brought it to life with impeccable craftsmanship. The 3D visualizations helped us see the result before any work began. Highly recommended for villa projects.",
  },
  {
    name: "Ananya Krishnan",
    location: "Hyderabad",
    project: "2 BHK Renovation · Banjara Hills",
    rating: 5,
    text: "I was amazed at how UrbanNest maximized the space in our compact apartment. The modular kitchen is a masterpiece, and the living room feels twice as large. Their transparent pricing made the entire process stress-free. Worth every rupee.",
  },
  {
    name: "Vikram Malhotra",
    location: "Bengaluru",
    project: "Office Interior · Koramangala",
    rating: 5,
    text: "Our office redesign by UrbanNest has boosted team morale significantly. The open-plan concept with private meeting pods was exactly what we needed. They delivered on time and the finish quality is commercial-grade. Our clients are always impressed.",
  },
  {
    name: "Deepika Nair",
    location: "Chennai",
    project: "4 BHK Apartment · Adyar",
    rating: 5,
    text: "From the first consultation to the final handover, UrbanNest made the entire process enjoyable. Their attention to detail is remarkable — even the switch plates were coordinated with our color scheme. The warranty gives us complete peace of mind.",
  },
  {
    name: "Amit & Sunita Verma",
    location: "Pune",
    project: "3 BHK · Koregaon Park",
    rating: 4,
    text: "We're thrilled with our new home interiors. The wardrobe organization system is genius, and the false ceiling lighting creates the perfect ambiance. The team was responsive to all our change requests and maintained quality throughout.",
  },
];

const caseStudies = [
  {
    title: "Modern Family Home",
    desc: "A complete 3 BHK transformation in Bengaluru — from concept to handover in 42 days.",
    area: "1,600 sq ft",
    budget: "₹22 Lakhs",
    before: "Dated interiors with poor lighting and storage",
    after: "Modern, well-lit space with custom storage solutions",
  },
  {
    title: "Compact Smart Living",
    desc: "Maximizing a 950 sq ft 2 BHK with intelligent multi-functional furniture.",
    area: "950 sq ft",
    budget: "₹14 Lakhs",
    before: "Cramped layout with wasted corner spaces",
    after: "Open, airy feel with 40% more usable storage",
  },
];

export default function Reviews() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-tech text-gold mb-4 block">
            Reviews
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            Trusted by <span className="italic text-gold">6,000+</span> Homeowners
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mt-6"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-current" />
              ))}
            </div>
            <span className="font-body text-lg text-charcoal font-semibold">4.9/5</span>
            <span className="text-sm font-body text-gray-500">on Google Reviews</span>
          </motion.div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="section-spacing bg-white">
        <div className="container-luxe">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-offwhite p-6 md:p-8 rounded-sm hover:shadow-md transition-shadow duration-300"
              >
                <Quote className="w-6 h-6 text-gold/30 mb-4" />
                <p className="text-gray-600 font-body text-sm leading-relaxed mb-6">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-gold fill-current" />
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-heading text-base text-charcoal">{review.name}</p>
                  <p className="text-xs font-body text-gray-400">
                    {review.project} · {review.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="section-spacing bg-offwhite">
        <div className="container-luxe">
          <SectionHeader
            label="Case Studies"
            title="Transformation Stories"
            subtitle="Detailed look at how we bring visions to life."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseStudies.map((cs, i) => (
              <motion.div
                key={cs.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-sm shadow-sm"
              >
                <h3 className="font-heading text-xl text-charcoal mb-2">{cs.title}</h3>
                <p className="text-sm font-body text-gray-500 mb-6">{cs.desc}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-beige p-3 rounded-sm">
                    <p className="label-tech text-gold text-[9px]">Area</p>
                    <p className="text-sm font-body text-charcoal">{cs.area}</p>
                  </div>
                  <div className="bg-beige p-3 rounded-sm">
                    <p className="label-tech text-gold text-[9px]">Budget</p>
                    <p className="text-sm font-body text-charcoal">{cs.budget}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="label-tech text-[10px] text-red-400 mb-1">Before</p>
                    <p className="text-sm font-body text-gray-500">{cs.before}</p>
                  </div>
                  <div>
                    <p className="label-tech text-[10px] text-green-500 mb-1">After</p>
                    <p className="text-sm font-body text-gray-500">{cs.after}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}