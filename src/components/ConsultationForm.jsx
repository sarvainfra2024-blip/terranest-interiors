import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
const PROPERTY_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa"];

export default function ConsultationForm({ compact = false, glass = false }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedProp, setSelectedProp] = useState("");
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    base44.entities.PricingPackage.filter({ is_active: true }).then(setPackages);
  }, []);

  const budgetOptions = selectedProp
    ? packages
        .filter(p => p.property_type === selectedProp)
        .sort((a, b) => ["Essential", "Premium", "Luxury"].indexOf(a.tier) - ["Essential", "Premium", "Luxury"].indexOf(b.tier))
        .map(p => ({
          value: `${p.tier}-${p.property_type}`,
          label: `${p.tier} — ${fmt(p.discounted_price || p.base_price)}`,
        }))
    : [];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await base44.entities.Lead.create({
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        location: data.location || "",
        property_type: data.propertyType || "",
        budget: data.budget || "",
        message: data.message || "",
        status: "New",
      });
    } catch (err) {
      console.error("Lead save error:", err);
    }
    setLoading(false);
    setSubmitted(true);
  };

  const containerClass = glass
    ? "glass-dark rounded-sm p-6 md:p-8"
    : "bg-white rounded-sm p-6 md:p-8 shadow-lg border border-gray-100";

  return (
    <div className={containerClass}>
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-gold" />
            </div>
            <h3 className={`font-heading text-xl mb-2 ${glass ? "text-white" : "text-charcoal"}`}>
              Thank You!
            </h3>
            <p className={`text-sm font-body ${glass ? "text-gray-300" : "text-gray-500"}`}>
              Our design consultant will reach out within 24 hours.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <h3 className={`font-heading text-lg mb-1 ${glass ? "text-white" : "text-charcoal"}`}>
              Book Free Consultation
            </h3>
            <p className={`text-xs font-body mb-4 ${glass ? "text-gray-300" : "text-gray-500"}`}>
              Get a personalized design plan for your space
            </p>

            <div className={compact ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
              <Input
                placeholder="Full Name *"
                {...register("name", { required: true })}
                className={`${glass ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400" : ""} ${errors.name ? "border-red-400" : ""}`}
              />
              <Input
                placeholder="Phone Number *"
                {...register("phone", { required: true })}
                className={`${glass ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400" : ""} ${errors.phone ? "border-red-400" : ""}`}
              />
              <Input
                placeholder="Email Address"
                type="email"
                {...register("email")}
                className={glass ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400" : ""}
              />
              <Input
                placeholder="City / Location"
                {...register("location")}
                className={glass ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400" : ""}
              />
              {!compact && (
                <>
                  <Select onValueChange={(v) => { setSelectedProp(v); setValue("propertyType", v); setValue("budget", ""); }}>
                    <SelectTrigger className={glass ? "bg-white/10 border-white/20 text-white" : ""}>
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map(pt => (
                        <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                      ))}
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(v) => setValue("budget", v)} disabled={budgetOptions.length === 0}>
                    <SelectTrigger className={glass ? "bg-white/10 border-white/20 text-white" : ""}>
                      <SelectValue placeholder={selectedProp && budgetOptions.length === 0 ? "No packages available" : "Budget Range (Package)"} />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {!compact && (
              <Textarea
                placeholder="Tell us about your project..."
                {...register("message")}
                rows={3}
                className={glass ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400" : ""}
              />
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-yellow-700 text-white font-body font-medium py-3 rounded-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {loading ? "Submitting..." : "Get Free Quote"}
            </Button>

            <p className={`text-xs text-center ${glass ? "text-gray-400" : "text-gray-400"}`}>
              No spam. 100% free consultation.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}