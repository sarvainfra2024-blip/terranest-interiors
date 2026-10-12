import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Check, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROPERTY_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK / Villa"];
const TIERS = ["Essential", "Premium", "Luxury"];
const fmt = (v) => `₹${Math.round(v).toLocaleString("en-IN")}`;

const CATEGORY_COLORS = {
  Kitchen: "bg-orange-50 border-orange-200",
  Storage: "bg-purple-50 border-purple-200",
  Living: "bg-green-50 border-green-200",
  Bedroom: "bg-blue-50 border-blue-200",
  "Ceiling & Lighting": "bg-yellow-50 border-yellow-200",
  "Smart Home": "bg-cyan-50 border-cyan-200",
  "Special Rooms": "bg-pink-50 border-pink-200",
  Outdoor: "bg-teal-50 border-teal-200",
};

export default function PricingCalculator() {
  const [propType, setPropType] = useState("2 BHK");
  const [tier, setTier] = useState("Premium");
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PricingPackage.filter({ is_active: true }),
      base44.entities.AddOn.filter({ is_active: true }, "sort_order"),
      base44.entities.PricingConfig.filter({ is_active: true }),
    ]).then(([pkgs, ads, cfgs]) => {
      setPackages(pkgs);
      setAddons(ads);
      setConfigs(cfgs);
      setLoading(false);
    });
  }, []);

  const selectedPkg = propType === "4 BHK / Villa"
    ? (packages.find(p => p.property_type === "4 BHK" && p.tier === tier) || packages.find(p => p.property_type === "Villa" && p.tier === tier))
    : packages.find(p => p.property_type === propType && p.tier === tier);
  const basePrice = selectedPkg ? (selectedPkg.discounted_price || selectedPkg.base_price) : 0;

  const getConfig = (key) => configs.find(c => c.key === key);
  const gst = getConfig("gst_percent");
  const serviceCharge = getConfig("service_charge_percent");

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const a = addons.find(x => x.id === id);
    return sum + (a ? a.price : 0);
  }, 0);

  const subtotal = basePrice + addonsTotal;
  const serviceAmount = serviceCharge ? subtotal * (serviceCharge.value / 100) : 0;
  const gstAmount = gst ? (subtotal + serviceAmount) * (gst.value / 100) : 0;
  const total = subtotal + serviceAmount + gstAmount;

  const toggleAddon = (id) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const groupedAddons = addons.reduce((acc, a) => {
    acc[a.category] = acc[a.category] || [];
    acc[a.category].push(a);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Left: Selectors + Add-ons */}
        <div className="lg:col-span-2 p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Property Type</label>
              <Select value={propType} onValueChange={v => { setPropType(v); setSelectedAddons([]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROPERTY_TYPES.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Package</label>
              <Select value={tier} onValueChange={v => { setTier(v); setSelectedAddons([]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-1">
              <Tag className="w-3 h-3" /> Optional Add-ons
            </label>
            <div className="space-y-4">
              {Object.entries(groupedAddons).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-xs font-medium text-gray-400 mb-2">{cat}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {items.map(a => {
                      const selected = selectedAddons.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => toggleAddon(a.id)}
                          className={`flex items-start gap-3 p-3 rounded border text-left transition-all ${
                            selected
                              ? "border-gold bg-gold/5"
                              : `border-gray-200 hover:border-gray-300 ${CATEGORY_COLORS[cat] || "bg-white"}`
                          }`}
                        >
                          <div className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selected ? "bg-gold border-gold" : "border-gray-300"}`}>
                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-charcoal">{a.name}</p>
                            <p className="text-xs text-gray-400">{fmt(a.price)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="p-6 bg-gray-50 flex flex-col">
          <h3 className="font-heading text-lg text-charcoal mb-4">Estimate Summary</h3>

          <div className="space-y-3 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{propType} — {tier} Package</span>
              <span className="font-medium">{fmt(basePrice)}</span>
            </div>

            {selectedAddons.length > 0 && (
              <div>
                {selectedAddons.map(id => {
                  const a = addons.find(x => x.id === id);
                  return a ? (
                    <div key={id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-500 truncate pr-2">{a.name}</span>
                      <span>{fmt(a.price)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {serviceCharge && serviceAmount > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Service Charges ({serviceCharge.value}%)</span>
                  <span>{fmt(serviceAmount)}</span>
                </div>
              )}
              {gst && gstAmount > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">GST ({gst.value}%)</span>
                  <span>{fmt(gstAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-charcoal pt-3">
              <div className="flex justify-between items-center">
                <span className="font-heading text-charcoal text-lg">Grand Total</span>
                <span className="font-heading text-2xl text-charcoal">{fmt(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link to="/contact">
              <Button className="w-full bg-charcoal text-white hover:bg-gold">Get Free Quote</Button>
            </Link>
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              * Estimate only. Final price after site visit & material selection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}