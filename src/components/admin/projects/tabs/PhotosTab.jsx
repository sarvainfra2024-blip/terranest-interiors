import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";
import { PHOTO_TYPES, DEFAULT_STAGES } from "@/lib/projectConstants";

export default function PhotosTab({ project }) {
  const [photos, setPhotos] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ stage: DEFAULT_STAGES[0], photo_type: "Before", image_url: "", caption: "" });
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.ProjectPhoto.filter({ project_id: project.id }, "-created_date", 200).then(setPhotos).finally(() => setLoading(false));
    base44.entities.ProjectStage.filter({ project_id: project.id }, "order", 100).then(setStages);
  };
  useEffect(load, []);

  const add = async () => {
    if (!form.image_url) return alert("Upload an image first.");
    setAdding(true);
    try {
      await base44.entities.ProjectPhoto.create({ project_id: project.id, ...form, date: new Date().toISOString().slice(0, 10) });
      setForm((f) => ({ ...f, image_url: "", caption: "" }));
      load();
    } finally {
      setAdding(false);
    }
  };
  const remove = async (id) => { if (!confirm("Delete photo?")) return; await base44.entities.ProjectPhoto.delete(id); load(); };

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold";
  const stageNames = stages.length ? stages.map((s) => s.name) : DEFAULT_STAGES;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-sm border border-gray-100 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-gold uppercase tracking-wide">Add Progress Photo</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-600 mb-1">Stage</label><select className={inputCls} value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}>{stageNames.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="block text-xs text-gray-600 mb-1">Type</label><select className={inputCls} value={form.photo_type} onChange={(e) => setForm((f) => ({ ...f, photo_type: e.target.value }))}>{PHOTO_TYPES.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
        <ImageUpload label="Photo" value={form.image_url} onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} />
        <input className={inputCls} value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} placeholder="Caption" />
        <button onClick={add} disabled={adding} className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-sm text-sm disabled:opacity-50">{adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Photo</button>
      </div>
      {loading ? <div className="flex justify-center py-8"><div className="w-7 h-7 border-4 border-gray-200 border-t-gold rounded-full animate-spin" /></div> :
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="bg-white rounded-sm border border-gray-100 overflow-hidden">
              <img src={p.image_url} alt={p.caption || ""} className="w-full h-32 object-cover" />
              <div className="p-2">
                <p className="text-xs font-semibold text-charcoal">{p.stage}</p>
                <p className="text-xs text-gold">{p.photo_type}</p>
                {p.caption && <p className="text-xs text-gray-500 mt-0.5">{p.caption}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{p.date}</p>
                <button onClick={() => remove(p.id)} className="mt-1 text-xs text-red-400 hover:text-red-600 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}