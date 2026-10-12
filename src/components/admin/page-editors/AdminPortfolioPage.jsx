import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";

const CATEGORIES = ["Modern", "Minimal", "Luxury", "Traditional", "Industrial", "Scandinavian"];

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-6 mb-6">
      <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ProjectEditor({ project, onUpdate, onSave, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-sm mb-3">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setOpen(!open)}>
        {project.image && <img src={project.image} alt="" className="w-10 h-10 object-cover rounded-sm flex-shrink-0" />}
        <span className="flex-1 text-sm font-medium text-charcoal">{project.title || "Untitled Project"}</span>
        <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-50 rounded-sm">{project.category}</span>
        {project.featured && <span className="text-xs text-gold px-2 py-0.5 bg-gold/10 rounded-sm">Featured</span>}
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-400 hover:bg-red-50 rounded-sm"><Trash2 className="w-4 h-4" /></button>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>
      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <input type="text" value={project.title || ""} onChange={(e) => onUpdate("title", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select value={project.category || ""} onChange={(e) => onUpdate("category", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Location</label>
              <input type="text" value={project.location || ""} onChange={(e) => onUpdate("location", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Style</label>
              <input type="text" value={project.style || ""} onChange={(e) => onUpdate("style", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dimensions</label>
              <input type="text" value={project.dimensions || ""} onChange={(e) => onUpdate("dimensions", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Budget</label>
              <input type="text" value={project.budget || ""} onChange={(e) => onUpdate("budget", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration</label>
              <input type="text" value={project.duration || ""} onChange={(e) => onUpdate("duration", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Display Order</label>
              <input type="number" value={project.order ?? 0} onChange={(e) => onUpdate("order", Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea rows={3} value={project.description || ""} onChange={(e) => onUpdate("description", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Client Name</label>
            <input type="text" value={project.client_name || ""} onChange={(e) => onUpdate("client_name", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Client Testimonial</label>
            <textarea rows={2} value={project.testimonial || ""} onChange={(e) => onUpdate("testimonial", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id={`feat-${project.id}`} checked={!!project.featured} onChange={(e) => onUpdate("featured", e.target.checked)} className="accent-gold" />
            <label htmlFor={`feat-${project.id}`} className="text-sm text-charcoal">Featured on Home Page</label>
          </div>
          <ImageUpload label="Project Image" value={project.image} onChange={(v) => onUpdate("image", v)} />
          <button onClick={onSave} className="flex items-center gap-1 px-4 py-2 bg-gold text-white text-sm rounded-sm hover:bg-yellow-700 transition-colors">
            <Save className="w-4 h-4" /> Save Project
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list("order", 100).then((recs) => { setProjects(recs || []); setLoading(false); });
  }, []);

  const add = async () => {
    const rec = await base44.entities.Project.create({ title: "New Project", category: "Modern", order: projects.length + 1 });
    setProjects((p) => [...p, rec]);
  };
  const update = (id, field, val) => setProjects((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const save = async (project) => { await base44.entities.Project.update(project.id, project); };
  const remove = async (id) => {
    if (!confirm("Delete this project?")) return;
    await base44.entities.Project.delete(id);
    setProjects((p) => p.filter((r) => r.id !== id));
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <Card title="🖼️ Portfolio Projects">
        {projects.map((p) => (
          <ProjectEditor key={p.id} project={p}
            onUpdate={(field, val) => update(p.id, field, val)}
            onSave={() => save(p)}
            onDelete={() => remove(p.id)}
          />
        ))}
        <button onClick={add} className="mt-2 flex items-center gap-1 text-sm text-gold hover:underline"><Plus className="w-4 h-4" /> Add Project</button>
      </Card>
    </div>
  );
}