import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const quickLinks = [
  { label: "About Us", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Design Process", path: "/process" },
  { label: "Pricing", path: "/pricing" },
  { label: "Blog", path: "/blog" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const { settings } = useSiteSettings();
  const [services, setServices] = useState([]);

  useEffect(() => {
    base44.entities.Service.list("order", 50)
      .then((recs) => setServices((recs || []).map((s) => s.title)))
      .catch(() => setServices([]));
  }, []);

  const socials = [
    { name: "Instagram", url: settings.instagram_url, letter: "I" },
    { name: "Facebook", url: settings.facebook_url, letter: "F" },
    { name: "LinkedIn", url: settings.linkedin_url, letter: "L" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-charcoal text-white relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
        <span className="font-heading text-[20vw] font-bold whitespace-nowrap">
          {settings.company_name?.split(" ")[0] || "Terranest"}
        </span>
      </div>

      <div className="container-luxe relative z-10">
        <div className="pt-20 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div>
            <h3 className="font-heading text-2xl font-semibold mb-2">
              {settings.company_name?.split(" ")[0] || "Terranest"}
            </h3>
            <p className="text-gold text-xs font-body font-semibold uppercase tracking-widest mb-6">
              {settings.company_name?.split(" ").slice(1).join(" ") || "Interiors"}
            </p>
            <p className="text-gray-400 text-sm font-body leading-relaxed mb-6">
              {settings.footer_text || "Designing homes that reflect your lifestyle. Premium interior design solutions crafted with precision and passion."}
            </p>
            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-colors text-xs font-body font-medium"
                  aria-label={social.name}
                >
                  {social.letter}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest text-gold mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-gray-400 text-sm font-body hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest text-gold mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="text-gray-400 text-sm font-body hover:text-white transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest text-gold mb-6">
              Get In Touch
            </h4>
            <div className="space-y-4">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-3 text-gray-400 text-sm font-body hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                {settings.phone || "+91 98765 43210"}
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-3 text-gray-400 text-sm font-body hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                {settings.email || "hello@terranest.in"}
              </a>
              <div className="flex items-start gap-3 text-gray-400 text-sm font-body">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  {settings.address || "Bengaluru, India"}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 font-body mb-2">Business Hours</p>
              <p className="text-sm text-gray-400 font-body">
                Mon – Sat: 10:00 AM – 7:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm font-body">
            © {new Date().getFullYear()} {settings.company_name || "Terranest Interiors"}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/faq" className="text-gray-500 text-sm font-body hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/faq" className="text-gray-500 text-sm font-body hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-charcoal border border-gray-700 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 shadow-lg"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}