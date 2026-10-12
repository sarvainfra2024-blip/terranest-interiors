import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULT_OFFICES = [
  {
    id: "d1",
    city: "Bengaluru",
    address: "12th Floor, Design Tower, MG Road, Bengaluru 560001",
    phone: "+91 98765 43210",
    email: "bengaluru@terranest.in",
  },
  {
    id: "d2",
    city: "Mumbai",
    address: "8th Floor, Crescent Bay, Parel, Mumbai 400012",
    phone: "+91 98765 43211",
    email: "mumbai@terranest.in",
  },
  {
    id: "d3",
    city: "Hyderabad",
    address: "3rd Floor, Cyber Towers, HITEC City, Hyderabad 500081",
    phone: "+91 98765 43212",
    email: "hyderabad@terranest.in",
  },
];

export default function OurOffices() {
  const [offices, setOffices] = useState(DEFAULT_OFFICES);

  useEffect(() => {
    base44.entities.Office.filter({ is_active: true }, "order", 50)
      .then((recs) => { if (recs && recs.length > 0) setOffices(recs); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-offwhite">
      <div className="container-luxe">
        <h2 className="font-heading text-2xl text-charcoal text-center mb-12">
          Our Offices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offices.map((office, i) => (
            <motion.div
              key={office.id || office.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-sm shadow-sm"
            >
              <h3 className="font-heading text-xl text-charcoal mb-3">
                {office.city}
              </h3>
              <div className="space-y-2 text-sm font-body text-gray-500">
                <a
                  href={office.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 group"
                >
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span className="group-hover:text-charcoal transition-colors">{office.address}</span>
                </a>
                {office.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                    <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="hover:text-charcoal transition-colors">
                      {office.phone}
                    </a>
                  </div>
                )}
                {office.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                    <a href={`mailto:${office.email}`} className="hover:text-charcoal transition-colors">
                      {office.email}
                    </a>
                  </div>
                )}
                {office.hours && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>{office.hours}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}