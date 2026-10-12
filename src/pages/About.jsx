import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Target, Eye, Heart, Users, CheckCircle, Star, Zap, Shield, Globe, Lightbulb } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SectionHeader from "@/components/SectionHeader";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { base44 } from "@/api/base44Client";

const ICON_MAP = { Target, Heart, Eye, Users, Star, Award, Zap, Shield, Globe, Lightbulb };

export default function About() {
  const { img, settings } = useSiteSettings();
  const [team, setTeam] = useState([]);
  const [values, setValues] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    base44.entities.TeamMember.list("order", 50).then(setTeam);
    base44.entities.CompanyValue.list("order", 20).then(setValues);
    base44.entities.Milestone.list("order", 50).then(setTimeline);
    base44.entities.StoryBadge.list("order", 20).then(setBadges);
  }, []);

  const storyBadges = badges.length > 0
    ? badges.map((b) => b.title)
    : ["ISO 9001 Certified", "IIID Registered", "Green Building Council", "Award Winning"];
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="label-tech text-gold mb-4 block"
          >
            About Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            Crafting Stories in Space <span className="italic text-gold">&</span> Light
          </motion.h1>
        </div>
      </section>

      {/* Story */}
      <section className="section-spacing bg-white">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <img
                  src={img("about_image")}
                  alt="UrbanNest design studio — close-up of premium fabric selection"
                  className="w-full rounded-sm"
                />
                <div className="absolute -bottom-6 -right-6 bg-gold text-white p-6 rounded-sm hidden md:block">
                  <p className="font-heading text-3xl font-semibold">{settings.stat_experience ?? 12}{settings.stat_experience_suffix ?? "+"}</p>
                  <p className="text-xs font-body uppercase tracking-widest">{settings.hero_stat_label || "YEARS"}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="label-tech text-gold mb-4 block">{settings.story_label || "Our Story"}</span>
              <h2 className="heading-section text-charcoal mb-6">
                {settings.story_heading || "Born from a Love of Thoughtful Design"}
              </h2>
              <p className="text-gray-500 font-body leading-relaxed mb-4">
                {settings.story_para1 || "UrbanNest Interiors was founded in 2012 by architect Arjun Mehta with a singular belief: that beautiful, functional spaces should be accessible to every homeowner, not just the privileged few."}
              </p>
              <p className="text-gray-500 font-body leading-relaxed mb-6">
                {settings.story_para2 || "What began as a boutique studio in Bengaluru has grown into one of India's most trusted interior design firms, with over 6,000 homes transformed and a 15,000 sq ft in-house manufacturing facility. Our approach marries architectural rigor with artistic sensitivity — every project receives the same obsessive attention to detail, from a compact studio apartment to a sprawling luxury villa."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {storyBadges.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="text-sm font-body text-charcoal">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-charcoal">
        <div className="container-luxe grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 border border-gray-800 rounded-sm"
          >
            <Target className="w-8 h-8 text-gold mb-4" />
            <h3 className="font-heading text-2xl text-white mb-4">Our Mission</h3>
            <p className="text-gray-400 font-body leading-relaxed">
              To democratize premium interior design by combining innovative technology,
              sustainable materials, and master craftsmanship — delivering homes that
              inspire joy and reflect the unique personality of every client.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 border border-gray-800 rounded-sm"
          >
            <Eye className="w-8 h-8 text-gold mb-4" />
            <h3 className="font-heading text-2xl text-white mb-4">Our Vision</h3>
            <p className="text-gray-400 font-body leading-relaxed">
              To be India's most loved interior design brand — recognized globally for
              setting new standards in design innovation, customer experience, and
              environmental responsibility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-spacing bg-white">
        <div className="container-luxe">
          <SectionHeader
            label="Our Values"
            title="What Drives Every Design"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => {
              const IconComp = ICON_MAP[v.icon] || Star;
              return (
                <motion.div
                  key={v.id || v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-beige flex items-center justify-center mx-auto mb-4">
                    <IconComp className="w-7 h-7 text-charcoal" />
                  </div>
                  <h3 className="font-heading text-xl text-charcoal mb-2">{v.title}</h3>
                  <p className="text-sm font-body text-gray-500">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-spacing bg-offwhite">
        <div className="container-luxe">
          <SectionHeader label="Our Journey" title="Milestones Along the Way" />
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-beige md:-translate-x-px" />
            {timeline.map((item, i) => (
              <motion.div
                key={item.id || item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative pl-12 md:pl-0 mb-10 last:mb-0 ${
                  i % 2 === 0 ? "md:pr-[55%]" : "md:pl-[55%]"
                }`}
              >
                <div className="absolute left-2.5 md:left-1/2 top-1 w-3 h-3 rounded-full bg-gold md:-translate-x-1.5 z-10" />
                <div className="bg-white p-5 rounded-sm shadow-sm">
                  <span className="label-tech text-gold text-[11px] block mb-1">{item.year}</span>
                  <p className="text-sm font-body text-gray-600">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-spacing bg-white">
        <div className="container-luxe">
          <SectionHeader
            label="The Team"
            title="Meet Our Design Leaders"
            subtitle="Passionate experts who bring decades of experience to every project."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.id || member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-32 h-32 rounded-full bg-beige mx-auto mb-5 overflow-hidden flex items-center justify-center">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading text-3xl text-charcoal/30">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-lg text-charcoal">{member.name}</h3>
                <p className="text-sm font-body text-gold">{member.role}</p>
                <p className="text-xs font-body text-gray-400 mt-1">{member.experience} experience</p>
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