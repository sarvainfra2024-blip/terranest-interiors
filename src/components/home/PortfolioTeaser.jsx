import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { base44 } from "@/api/base44Client";

const FALLBACK = [
  { title: "Serene Urban Apartment", style: "Modern Minimal", area: "1,800 sq ft", imgKey: "img_portfolio_1", span: "md:col-span-2 md:row-span-2" },
  { title: "Contemporary Kitchen", style: "Scandinavian", area: "320 sq ft", imgKey: "img_portfolio_2", span: "" },
  { title: "Luxury Master Suite", style: "Contemporary", area: "450 sq ft", imgKey: "img_portfolio_3", span: "" },
  { title: "Executive Villa", style: "Luxury", area: "4,200 sq ft", imgKey: "img_portfolio_4", span: "" },
  { title: "Elegant Dining Space", style: "Traditional", area: "280 sq ft", imgKey: "img_portfolio_5", span: "" },
];

export default function PortfolioTeaser() {
  const { settings, img } = useSiteSettings();
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    base44.entities.Project.filter({ featured: true }, "order", 5)
      .then((recs) => setProjects(recs || []))
      .catch(() => setProjects([]));
  }, []);

  const featured = (projects || []).slice(0, 5).map((p, i) => ({
    title: p.title,
    style: p.style || p.category,
    area: p.dimensions,
    image: p.image,
    span: i === 0 ? "md:col-span-2 md:row-span-2" : "",
  }));

  const list = featured.length > 0
    ? featured
    : FALLBACK.map((p, i) => ({ ...p, image: img(p.imgKey) }));

  if (!projects) return null;

  return (
    <section className="section-spacing bg-offwhite">
      <div className="container-luxe">
        <SectionHeader
          label={settings.portfolio_label || "Our Work"}
          title={settings.portfolio_title || "Spaces We've Transformed"}
          subtitle={settings.portfolio_subtitle || "Each project is a unique story of vision meeting craftsmanship."}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px] md:auto-rows-[260px]">
          {list.map((project, i) => (
            <motion.div
              key={project.title + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative group overflow-hidden rounded-sm cursor-pointer ${project.span}`}
            >
              <img
                src={project.image || img(`img_portfolio_${i + 1}`)}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                {project.style && project.area && (
                  <p className="label-tech text-gold text-[10px] mb-1">{project.style} · {project.area}</p>
                )}
                <h3 className="font-heading text-lg text-white">{project.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-3 bg-charcoal text-white font-body font-medium text-sm hover:bg-gold transition-colors rounded-sm"
          >
            View Full Portfolio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}