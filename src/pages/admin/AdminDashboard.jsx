import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Wrench, Star, FileText, Settings, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ projects: 0, services: 0, testimonials: 0, blog: 0 });

  useEffect(() => {
    Promise.all([
      base44.entities.Project.list().catch(() => []),
      base44.entities.Service.list().catch(() => []),
      base44.entities.Testimonial.list().catch(() => []),
      base44.entities.BlogPost.list().catch(() => []),
    ]).then(([p, s, t, b]) => {
      setCounts({
        projects: p.length || 0,
        services: s.length || 0,
        testimonials: t.length || 0,
        blog: b.length || 0,
      });
    });
  }, []);

  const cards = [
    { label: "Projects", count: counts.projects, path: "/admin/projects", icon: FolderKanban },
    { label: "Services", count: counts.services, path: "/admin/services", icon: Wrench },
    { label: "Testimonials", count: counts.testimonials, path: "/admin/testimonials", icon: Star },
    { label: "Blog Posts", count: counts.blog, path: "/admin/blog", icon: FileText },
  ];

  return (
    <div>
      <h2 className="font-heading text-2xl text-charcoal mb-2">Welcome back</h2>
      <p className="text-sm text-gray-500 mb-8">Manage all content shown on your public website from here.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.path}
            className="bg-white p-6 rounded-sm border border-gray-100 hover:border-gold transition-colors group"
          >
            <c.icon className="w-6 h-6 text-gold mb-3" />
            <p className="font-heading text-3xl text-charcoal">{c.count}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      <Link
        to="/admin/settings"
        className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white text-sm font-body rounded-sm hover:bg-gold transition-colors"
      >
        <Settings className="w-4 h-4" />
        Edit Site Settings
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}