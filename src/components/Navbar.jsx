import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/lib/AuthContext";
import OfferTicker from "@/components/home/OfferTicker";
import { useActiveOffers } from "@/hooks/useActiveOffers";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  {
    label: "Services",
    path: "/services",
    children: [],
  },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Process", path: "/process" },
  { label: "Offer Zone", path: "/offers" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [services, setServices] = useState([]);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { settings } = useSiteSettings();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const { data: activeOffers = [] } = useActiveOffers();
  const hasTicker = activeOffers.some((o) => o.show_in_ticker !== false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    base44.entities.Service.list("order", 5)
      .then((recs) => setServices(recs || []))
      .catch(() => {});
  }, []);

  const links = navLinks.map((link) =>
    link.label === "Services"
      ? { ...link, children: services.map((s) => ({ label: s.title, path: "/services" })) }
      : link
  );

  const navBg = "bg-white/95 backdrop-blur-md shadow-sm";

  const textColor = "text-charcoal";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
      >
        <OfferTicker />
        <div className="container-luxe flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.company_name || "Logo"} className="h-10 w-auto object-contain" />
            ) : null}
            <span className={`font-heading text-xl md:text-2xl font-semibold tracking-tight transition-colors duration-300 ${textColor}`}>
              {settings.company_name?.split(" ")[0] || "Terranest"}
            </span>
            <span className="text-gold text-xs font-body font-medium uppercase tracking-widest hidden sm:inline">
              {settings.company_name?.split(" ").slice(1).join(" ") || "Interiors"}
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setHoveredMenu(link.label)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Link
                  to={link.path}
                  className={`text-sm font-body font-medium transition-colors duration-300 hover:text-gold flex items-center gap-1 ${
                    location.pathname === link.path ? "text-gold" : textColor
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown className="w-3 h-3" />}
                </Link>
                <AnimatePresence>
                  {link.children && hoveredMenu === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-52 bg-white rounded shadow-lg border border-gray-100 overflow-hidden"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.path}
                          className="block px-4 py-3 text-sm font-body text-charcoal hover:bg-beige hover:text-gold transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-2.5 bg-charcoal text-white text-sm font-body font-medium hover:bg-gold transition-colors duration-300 rounded-sm"
            >
              Book Consultation
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 transition-colors ${textColor}`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="container-luxe py-6 space-y-1">
                {links.map((link) => (
                  <div key={link.label}>
                    <Link
                      to={link.path}
                      className={`block py-3 text-base font-body font-medium transition-colors ${
                        location.pathname === link.path
                          ? "text-gold"
                          : "text-charcoal hover:text-gold"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.path}
                            className="block py-2 text-sm text-gray-500 hover:text-gold transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-4 space-y-3">
                  <Link
                    to="/contact"
                    className="block w-full text-center py-3 bg-charcoal text-white font-body font-medium text-sm hover:bg-gold transition-colors rounded-sm"
                  >
                    Book Free Consultation
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {!isHome && <div className={hasTicker ? "h-24 md:h-28" : "h-16 md:h-20"} />}
    </>
  );
}