import React, { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminWhyChoosePage() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.WhyChooseFeature.list("order", 50)
      .then(setFeatures)
      .finally(() => setLoading(false));
  }, []);

  const addFeature = async () => {
    const rec = await base44.entities.WhyChooseFeature.create({
      title: "New Feature",
      desc: "Description here",
      icon: "Star",
      order: features.length,
      is_active: true,
    });
    setFeatures((f) => [...f, rec]);
  };

  const updateLocal = (id, key, val) => {
    setFeatures((f) => f.map((item) => item.id === id ? { ...item, [key]: val } : item));
  };

  const saveFeature = async (feature) => {
    setSaving(feature.id);
    await base44.entities.WhyChooseFeature.update(feature.id, {
      title: feature.title,
      desc: feature.desc,
      icon: feature.icon,
      order: feature.order,
      is_active: feature.is_active,
    });
    setSaving(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteFeature = async (id) => {
    if (!confirm("Delete this feature card?")) return;
    await base44.entities.WhyChooseFeature.delete(id);
    setFeatures((f) => f.filter((item) => item.id !== id));
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Manage the feature cards in the "Why Terranest" section on the home page.</p>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>

      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.id} className="bg-white border border-gray-100 rounded-sm p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Title</label>
                <input
                  type="text"
                  value={feature.title || ""}
                  onChange={(e) => updateLocal(feature.id, "title", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Icon (lucide name)</label>
                <input
                  type="text"
                  value={feature.icon || ""}
                  onChange={(e) => updateLocal(feature.id, "icon", e.target.value)}
                  placeholder="e.g. Star, Shield, Clock"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-charcoal mb-1">Description</label>
              <textarea
                rows={2}
                value={feature.desc || ""}
                onChange={(e) => updateLocal(feature.id, "desc", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feature.is_active !== false}
                    onChange={(e) => updateLocal(feature.id, "is_active", e.target.checked)}
                    className="accent-gold"
                  />
                  Active
                </label>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500">Order:</label>
                  <input
                    type="number"
                    value={feature.order ?? 0}
                    onChange={(e) => updateLocal(feature.id, "order", Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteFeature(feature.id)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-400 text-xs rounded-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button
                  onClick={() => saveFeature(feature)}
                  disabled={saving === feature.id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gold text-white text-xs rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {saving === feature.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addFeature}
        className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 text-gray-500 text-sm rounded-sm hover:border-gold hover:text-gold transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" /> Add Feature Card
      </button>
    </div>
  );
}