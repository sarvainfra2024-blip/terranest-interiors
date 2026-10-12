import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const categories = ["All", "Interior Trends", "Kitchen Ideas", "Living Room", "Space Saving", "Luxury Homes", "Color Psychology", "Lighting Guide"];

const articles = [
  {
    title: "10 Interior Design Trends Dominating 2024",
    category: "Interior Trends",
    excerpt: "From warm minimalism to biophilic design, discover the trends that are reshaping modern Indian homes this year.",
    readTime: "8 min read",
    date: "Dec 15, 2024",
    image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/e40b0b8df_generated_92a3ebf5.png",
    featured: true,
  },
  {
    title: "The Ultimate Guide to Modular Kitchen Layouts",
    category: "Kitchen Ideas",
    excerpt: "L-shaped, U-shaped, island, or parallel? Find the perfect kitchen layout for your home's footprint.",
    readTime: "6 min read",
    date: "Dec 10, 2024",
    image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/6a45725a1_generated_d0acb857.png",
    featured: false,
  },
  {
    title: "How to Make a Small Living Room Look Larger",
    category: "Space Saving",
    excerpt: "Expert tricks using mirrors, lighting, and furniture placement to visually expand compact living spaces.",
    readTime: "5 min read",
    date: "Dec 5, 2024",
    image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/e40b0b8df_generated_92a3ebf5.png",
    featured: false,
  },
  {
    title: "Color Psychology: Choosing the Right Palette for Each Room",
    category: "Color Psychology",
    excerpt: "How different colors affect mood, productivity, and relaxation — and which ones work best where.",
    readTime: "7 min read",
    date: "Nov 28, 2024",
    image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/75eab5d34_generated_082a0cc5.png",
    featured: false,
  },
  {
    title: "Luxury Villa Interior Design: A Complete Guide",
    category: "Luxury Homes",
    excerpt: "From double-height living rooms to spa-inspired bathrooms, everything you need for a villa that impresses.",
    readTime: "10 min read",
    date: "Nov 20, 2024",
    image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/2a24f5443_generated_ca680039.png",
    featured: false,
  },
  {
    title: "Layered Lighting: The Secret to a Well-Designed Room",
    category: "Lighting Guide",
    excerpt: "Master the art of ambient, task, and accent lighting to transform the atmosphere of any space.",
    readTime: "6 min read",
    date: "Nov 15, 2024",
    image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/b7b02bc36_generated_6832446d.png",
    featured: false,
  },
  {
    title: "Living Room Inspiration: 20 Ideas for Indian Homes",
    category: "Living Room",
    excerpt: "Curated living room designs that blend Indian sensibilities with global aesthetics for the modern homeowner.",
    readTime: "9 min read",
    date: "Nov 8, 2024",
    image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/92c8c11fb_generated_6a4bab6f.png",
    featured: false,
  },
  {
    title: "Space-Saving Furniture Ideas for Compact Apartments",
    category: "Space Saving",
    excerpt: "Innovative multi-functional furniture solutions that maximize utility without compromising on style.",
    readTime: "5 min read",
    date: "Oct 30, 2024",
    image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/e54c7a3b6_generated_67436102.png",
    featured: false,
  },
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const featured = filtered.find((a) => a.featured) || filtered[0];
  const rest = filtered.filter((a) => a !== featured);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-tech text-gold mb-4 block">
            Blog
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            Design <span className="italic text-gold">Inspiration</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-body text-lg max-w-xl mt-4"
          >
            Ideas, trends, and expert insights for your interior design journey.
          </motion.p>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-luxe">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-body rounded-sm transition-all ${
                  activeCategory === cat
                    ? "bg-charcoal text-white"
                    : "bg-offwhite text-gray-500 hover:text-charcoal"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Article */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 cursor-pointer group"
            >
              <div className="overflow-hidden rounded-sm">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="label-tech text-gold mb-3">{featured.category}</span>
                <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-4 group-hover:text-gold transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 font-body leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm font-body text-gray-400">
                  <span>{featured.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {featured.readTime}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((article, i) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group cursor-pointer"
              >
                <div className="overflow-hidden rounded-sm mb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <span className="label-tech text-gold text-[10px] mb-2 block">
                  {article.category}
                </span>
                <h3 className="font-heading text-lg text-charcoal mb-2 group-hover:text-gold transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm font-body text-gray-500 leading-relaxed mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs font-body text-gray-400">
                  <span>{article.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}