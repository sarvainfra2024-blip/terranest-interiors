import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { base44 } from "@/api/base44Client";

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list("order", 100)
      .then((recs) => setProjects(recs || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  const filtered = activeFilter === "All"
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-tech text-gold mb-4 block">
            Portfolio
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            Spaces That Tell <span className="italic text-gold">Stories</span>
          </motion.h1>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-luxe">
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center text-gray-400 py-20">No projects yet.</div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-12 justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-5 py-2 text-sm font-body font-medium rounded-sm transition-all duration-300 ${
                      activeFilter === cat
                        ? "bg-charcoal text-white"
                        : "bg-offwhite text-gray-500 hover:bg-beige hover:text-charcoal"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Masonry Grid */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((project, i) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="break-inside-avoid group cursor-pointer"
                      onClick={() => setLightbox(project)}
                    >
                      <div className="relative overflow-hidden rounded-sm">
                        <img
                          src={project.image}
                          alt={project.title}
                          className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                            i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <p className="label-tech text-gold text-[10px] mb-1">
                            {project.category}{project.dimensions ? ` · ${project.dimensions}` : ""}
                          </p>
                          <h3 className="font-heading text-lg text-white">
                            {project.title}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 text-white hover:text-gold transition-colors"
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full bg-charcoal rounded-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.image}
                alt={lightbox.title}
                className="w-full aspect-video object-cover"
              />
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-4 mb-4">
                  {[
                    { label: "Style", value: lightbox.category },
                    { label: "Area", value: lightbox.dimensions },
                    { label: "Budget", value: lightbox.budget },
                    { label: "Duration", value: lightbox.duration },
                  ].filter((item) => item.value).map((item) => (
                    <div key={item.label} className="bg-white/5 px-4 py-2 rounded-sm">
                      <p className="label-tech text-gold text-[9px]">{item.label}</p>
                      <p className="text-white text-sm font-body">{item.value}</p>
                    </div>
                  ))}
                </div>
                <h2 className="font-heading text-2xl text-white mb-3">
                  {lightbox.title}
                </h2>
                {lightbox.description && (
                  <p className="text-gray-400 font-body text-sm mb-3">{lightbox.description}</p>
                )}
                {lightbox.testimonial && (
                  <p className="text-gray-400 font-body text-sm italic">
                    "{lightbox.testimonial}"
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}