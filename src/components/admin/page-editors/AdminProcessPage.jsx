import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ICON_OPTIONS = ["MessageSquare", "MapPin", "Palette", "Box", "Layers", "Factory", "Wrench", "Home", "Star", "CheckCircle", "Clock", "Award"];

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-6 mb-6">
      <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminProcessPage() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState({ process_label: "", process_title: "", process_subtitle: "" });
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSaved, setHeroSaved] = useState(false);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.ProcessStep.list("order", 20),
      base44.entities.SiteSetting.list(),
    ]).then(([recs, settings]) => {
      setSteps(recs || []);
      const s = settings[0] || {};
      setHero({
        process_label: s.process_label || "",
        process_title: s.process_title || "",
        process_subtitle: s.process_subtitle || "",
      });
      setLoading(false);
    });
  }, []);

  const saveHero = async () => {
    setHeroSaving(true);
    const existing = (await base44.entities.SiteSetting.list())[0];
    if (existing) {
      await base44.entities.SiteSetting.update(existing.id, { ...hero });
    } else {
      await base44.entities.SiteSetting.create({ company_name: "Terranest Interiors", ...hero });
    }
    setHeroSaving(false);
    setHeroSaved(true);
    setTimeout(() => setHeroSaved(false), 2000);
  };

  const add = async () => {
    const rec = await base44.entities.ProcessStep.create({ title: "New Step", desc: "Description", detail: "Detail", icon: "Home", order: steps.length + 1 });
    setSteps((s) => [...s, rec]);
  };

  const update = (id, field, val) => setSteps((s) => s.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const save = async (step) => {
    setSaving(step.id);
    await base44.entities.ProcessStep.update(step.id, { title: step.title, desc: step.desc, detail: step.detail, icon: step.icon, order: step.order });
    setSaving(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = async (id) => {
    if (!confirm("Delete this step?")) return;
    await base44.entities.ProcessStep.delete(id);
    setSteps((s) => s.filter((r) => r.id !== id));
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <Card title="Hero Section">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Label</label>
            <input
              type="text"
              value={hero.process_label}
              onChange={(e) => setHero((h) => ({ ...h, process_label: e.target.value }))}
              placeholder="Our Process"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Heading</label>
            <input
              type="text"
              value={hero.process_title}
              onChange={(e) => setHero((h) => ({ ...h, process_title: e.target.value }))}
              placeholder="From Vision to Reality"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Subtitle</label>
            <textarea
              rows={2}
              value={hero.process_subtitle}
              onChange={(e) => setHero((h) => ({ ...h, process_subtitle: e.target.value }))}
              placeholder="A transparent, 8-step journey designed for a stress-free experience."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            {heroSaved && <span className="text-sm text-green-600">Saved!</span>}
            <button
              onClick={saveHero}
              disabled={heroSaving}
              className="flex items-center gap-1 px-4 py-2 bg-gold text-white text-xs rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {heroSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Hero
            </button>
          </div>
        </div>
      </Card>

      <Card title="🔄 Process Steps">
        <p className="text-xs text-gray-400 mb-4">
          If no steps are added here, the Process page uses its built-in default steps. Add steps here to override them.
        </p>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="border border-gray-100 rounded-sm p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono w-6">#{i + 1}</span>
                <input type="text" value={step.title} onChange={(e) => update(step.id, "title", e.target.value)}
                  placeholder="Step Title"
                  className="flex-1 px-2 py-1.5 text-sm font-medium border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
                <select value={step.icon || "Home"} onChange={(e) => update(step.id, "icon", e.target.value)}
                  className="w-36 px-2 py-1.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-gold">
                  {ICON_OPTIONS.map((ic) => <option key={ic}>{ic}</option>)}
                </select>
                <input type="number" value={step.order ?? i + 1} onChange={(e) => update(step.id, "order", Number(e.target.value))}
                  className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" placeholder="Order" />
                <button onClick={() => save(step)} disabled={saving === step.id} className="p-1.5 text-gold hover:bg-gold/10 rounded-sm disabled:opacity-50">
                  {saving === step.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(step.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm"><Trash2 className="w-4 h-4" /></button>
              </div>
              <textarea rows={2} value={step.desc} onChange={(e) => update(step.id, "desc", e.target.value)}
                placeholder="Step description"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
              <input type="text" value={step.detail || ""} onChange={(e) => update(step.id, "detail", e.target.value)}
                placeholder="Detail label (e.g. Free of charge · 1-2 hours)"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
          ))}
        </div>
        <button onClick={add} className="mt-4 flex items-center gap-1 text-sm text-gold hover:underline"><Plus className="w-4 h-4" /> Add Step</button>
      </Card>
    </div>
  );
}