import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Check, Star, Clock, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const PROPERTY_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK / Villa"];
const TIERS = ["Essential", "Premium", "Luxury"];

const TIER_STYLES = {
  Essential: {
    card: "border-gray-200 bg-white",
    badge: "bg-gray-100 text-gray-600",
    btn: "bg-charcoal text-white hover:bg-charcoal/90",
    accent: "text-gray-700",
  },
  Premium: {
    card: "border-gold bg-white shadow-lg shadow-gold/10 scale-[1.02]",
    badge: "bg-gold text-white",
    btn: "bg-gold text-white hover:bg-gold/90",
    accent: "text-gold",
  },
  Luxury: {
    card: "border-gray-800 bg-charcoal text-white",
    badge: "bg-gray-700 text-gray-200",
    btn: "bg-white text-charcoal hover:bg-gray-100",
    accent: "text-gray-300",
  },
};

const fmt = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function Pricing() {
  const [selectedProp, setSelectedProp] = useState("2 BHK");
  const [packages, setPackages] = useState([]);
  const [tierFeatures, setTierFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const showEstimate = settings.show_instant_estimate ?? true;

  useEffect(() => {
    Promise.all([
      base44.entities.PricingPackage.filter({ is_active: true }),
      base44.entities.TierFeature.filter({ is_active: true }, "order"),
    ]).then(([pkgs, tfs]) => {
      setPackages(pkgs);
      setTierFeatures(tfs || []);
      setLoading(false);
    });
  }, []);

  const tierFeaturesFor = (tier) => tierFeatures.filter(f => f.tier === tier).map(f => f.feature);

  const getPackage = (tier) => {
    if (selectedProp === "4 BHK / Villa") {
      return packages.find(p => p.property_type === "4 BHK" && p.tier === tier)
          || packages.find(p => p.property_type === "Villa" && p.tier === tier);
    }
    return packages.find(p => p.property_type === selectedProp && p.tier === tier);
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-offwhite py-20 px-4 text-center">
          <p className="text-gold text-xs font-body uppercase tracking-widest mb-3">Transparent Pricing</p>
          <h1 className="font-heading text-4xl md:text-5xl text-charcoal mb-4">Interior Design Packages</h1>
          <p className="text-gray-500 font-body max-w-xl mx-auto text-sm leading-relaxed">
            Honest, all-inclusive pricing with no hidden costs. Choose the package that fits your lifestyle and budget.
          </p>
        </section>

        {/* Property Type Tabs */}
        <section className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30">
          <div className="container-luxe">
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
              {PROPERTY_TYPES.map(pt => (
                <button
                  key={pt}
                  onClick={() => setSelectedProp(pt)}
                  className={`flex-shrink-0 px-5 py-2 rounded-sm text-sm font-body font-medium transition-all ${
                    selectedProp === pt
                      ? "bg-charcoal text-white"
                      : "text-gray-500 hover:text-charcoal hover:bg-gray-100"
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="container-luxe">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 items-start">
                {TIERS.map(tier => {
                  const pkg = getPackage(tier);
                  const styles = TIER_STYLES[tier];
                  const isLuxury = tier === "Luxury";
                  if (!pkg) return null;
                  return (
                    <div key={tier} className={`rounded-lg border-2 p-7 relative transition-all ${styles.card}`}>
                      {pkg.is_popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-gold text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> Most Popular
                          </span>
                        </div>
                      )}
                      {pkg.promotional_label && (
                        <div className="absolute top-4 right-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${styles.badge}`}>{pkg.promotional_label}</span>
                        </div>
                      )}

                      <div className="mb-6">
                        <span className={`text-xs font-body font-medium uppercase tracking-widest ${styles.accent}`}>{tier}</span>
                        <h3 className={`font-heading text-2xl mt-1 ${isLuxury ? "text-white" : "text-charcoal"}`}>{tier} Package</h3>
                        <p className={`text-xs mt-1 ${isLuxury ? "text-gray-400" : "text-gray-500"}`}>
                          {tier === "Essential" ? "For budget-conscious homeowners" : tier === "Premium" ? "For modern premium homes" : "For luxury residences & villas"}
                        </p>
                      </div>

                      <div className="mb-6">
                        {pkg.discounted_price ? (
                          <>
                            <p className={`text-sm line-through ${isLuxury ? "text-gray-500" : "text-gray-400"}`}>{fmt(pkg.base_price)}</p>
                            <p className={`font-heading text-4xl ${isLuxury ? "text-white" : "text-charcoal"}`}>{fmt(pkg.discounted_price)}</p>
                          </>
                        ) : (
                          <p className={`font-heading text-4xl ${isLuxury ? "text-white" : "text-charcoal"}`}>{fmt(pkg.base_price)}</p>
                        )}
                        <p className={`text-xs mt-1 ${isLuxury ? "text-gray-400" : "text-gray-500"}`}>Starting price for {selectedProp}</p>
                      </div>

                      <div className="flex items-center gap-4 mb-6 text-xs">
                        <span className={`flex items-center gap-1 ${isLuxury ? "text-gray-300" : "text-gray-500"}`}>
                          <Shield className="w-3 h-3" /> {pkg.warranty_months}yr Warranty
                        </span>
                        <span className={`flex items-center gap-1 ${isLuxury ? "text-gray-300" : "text-gray-500"}`}>
                          <Clock className="w-3 h-3" /> {pkg.delivery_days} Days
                        </span>
                      </div>

                      <Link to={`/contact?package=${encodeURIComponent(tier)}&property=${encodeURIComponent(selectedProp)}`}>
                        <Button className={`w-full mb-6 ${styles.btn}`}>
                          Book {tier} Consultation
                        </Button>
                      </Link>

                      <div className="space-y-2.5">
                        {[...(pkg.features || []), ...tierFeaturesFor(tier)].map((f, i) => (
                          <div key={i} className={`flex items-start gap-2 text-sm ${isLuxury ? "text-gray-300" : "text-gray-600"}`}>
                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isLuxury ? "text-gold" : "text-green-500"}`} />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-center text-xs text-gray-400 font-body mt-8">
              * Prices are approximate and indicative. Final pricing depends on site inspection, material selection, and customization requirements.
              GST and other charges are applicable as per government norms.
            </p>
          </div>
        </section>

        {/* Calculator */}
        {showEstimate && (
        <section className="bg-offwhite py-16 px-4">
          <div className="container-luxe">
            <div className="text-center mb-10">
              <p className="text-gold text-xs font-body uppercase tracking-widest mb-2">Instant Estimate</p>
              <h2 className="font-heading text-3xl text-charcoal">Pricing Calculator</h2>
              <p className="text-gray-500 text-sm mt-2">Select your property type, package & add-ons to get an instant estimate</p>
            </div>
            <PricingCalculator />
          </div>
        </section>
        )}
      </main>
      <Footer />
    </>
  );
}