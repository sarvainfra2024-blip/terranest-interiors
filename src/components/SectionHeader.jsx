import React from "react";
import { motion } from "framer-motion";

export default function SectionHeader({ label, title, subtitle, align = "center", light = false }) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7 }}
      className={`flex flex-col ${alignment} mb-16 md:mb-20`}
    >
      {label && (
        <span className="label-tech text-gold mb-4">{label}</span>
      )}
      <h2 className={`heading-section ${light ? "text-white" : "text-charcoal"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base md:text-lg font-body font-light max-w-2xl leading-relaxed ${light ? "text-gray-300" : "text-gray-500"}`}>
          {subtitle}
        </p>
      )}
      <div className="gold-line w-16 mt-6" />
    </motion.div>
  );
}