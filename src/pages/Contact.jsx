import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ConsultationForm from "@/components/ConsultationForm";
import OurOffices from "@/components/home/OurOffices";
import { useSiteSettings } from "@/hooks/useSiteSettings";



export default function Contact() {
  const { settings } = useSiteSettings();
  const phone = settings.phone || "+91 98765 43210";
  const whatsapp = settings.whatsapp_number || "919876543210";
  const email = settings.email || "hello@urbannest.in";
  const hoursWeekday = settings.business_hours_weekday || "10:00 AM – 7:00 PM";
  const hoursSunday = settings.business_hours_sunday || "By Appointment Only";

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-tech text-gold mb-4 block">
            Contact
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            Let's Start Your <span className="italic text-gold">Project</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-body text-lg max-w-xl mt-4"
          >
            Reach out for a free consultation. We'd love to hear about your vision.
          </motion.p>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <ConsultationForm />
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="font-heading text-xl text-charcoal mb-6">
                  Get in Touch
                </h3>
                <div className="space-y-5">
                  <a href={`tel:${phone}`} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-beige rounded-full flex items-center justify-center group-hover:bg-gold transition-colors">
                      <Phone className="w-5 h-5 text-charcoal group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="label-tech text-[10px] text-gray-400">Phone</p>
                      <p className="text-sm font-body text-charcoal">{phone}</p>
                    </div>
                  </a>
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-beige rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                      <MessageCircle className="w-5 h-5 text-charcoal group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="label-tech text-[10px] text-gray-400">WhatsApp</p>
                      <p className="text-sm font-body text-charcoal">{phone}</p>
                    </div>
                  </a>
                  <a href={`mailto:${email}`} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-beige rounded-full flex items-center justify-center group-hover:bg-gold transition-colors">
                      <Mail className="w-5 h-5 text-charcoal group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="label-tech text-[10px] text-gray-400">Email</p>
                      <p className="text-sm font-body text-charcoal">{email}</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-4 h-4 text-gold" />
                  <h4 className="text-sm font-body font-semibold text-charcoal">
                    Business Hours
                  </h4>
                </div>
                <p className="text-sm font-body text-gray-500 ml-7">
                  Monday – Saturday: {hoursWeekday}
                </p>
                <p className="text-sm font-body text-gray-500 ml-7">
                  Sunday: {hoursSunday}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offices */}
      <OurOffices />

      {/* Map */}
      <section className="h-[400px] bg-beige relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0082675780387!2d77.6065!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzYnMjMuNCJF!5e0!3m2!1sen!2sin!4v1640000000000"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="UrbanNest Interiors Location"
          className="grayscale"
        />
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}