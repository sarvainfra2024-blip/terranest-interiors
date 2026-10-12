import React, { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-6 mb-6">
      <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ServiceEditor({ service, onUpdate, onSave, onDelete }) {
  const [open, setOpen] = useState(false);

  const updateFeature = (i, val) => {
    const features = [...(service.features || [])];
    features[i] = val;
    onUpdate("features", features);
  };
  const addFeature = () => onUpdate("features", [...(service.features || []), ""]);
  const removeFeature = (i) => onUpdate("features", (service.features || []).filter((_, idx) => idx !== i));

  return (
    <div className="border border-gray-100 rounded-sm mb-3">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setOpen(!open)}>
        {service.image && <img src={service.image} alt="" className="w-10 h-10 object-cover rounded-sm flex-shrink-0" />}
        <span className="flex-1 text-sm font-medium text-charcoal">{service.title || "Untitled Service"}</span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-400 hover:bg-red-50 rounded-sm"><Trash2 className="w-4 h-4" /></button>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>
      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <input type="text" value={service.title || ""} onChange={(e) => onUpdate("title", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Icon (lucide name)</label>
              <input type="text" value={service.icon || ""} onChange={(e) => onUpdate("icon", e.target.value)} placeholder="Home"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Short Description</label>
            <input type="text" value={service.short_desc || ""} onChange={(e) => onUpdate("short_desc", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Full Description</label>
            <textarea rows={3} value={service.description || ""} onChange={(e) => onUpdate("description", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Display Order</label>
            <input type="number" value={service.order ?? 0} onChange={(e) => onUpdate("order", Number(e.target.value))}
              className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <ImageUpload label="Service Image" value={service.image} onChange={(v) => onUpdate("image", v)} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Features</label>
            <div className="space-y-1">
              {(service.features || []).map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={f} onChange={(e) => updateFeature(i, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
                  <button onClick={() => removeFeature(i)} className="p-1 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <button onClick={addFeature} className="mt-1 text-xs text-gold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Feature</button>
          </div>
          <button onClick={onSave} className="flex items-center gap-1 px-4 py-2 bg-gold text-white text-sm rounded-sm hover:bg-yellow-700 transition-colors">
            <Save className="w-4 h-4" /> Save Service
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Service.list("order", 50).then((recs) => { setServices(recs || []); setLoading(false); });
  }, []);

  const add = async () => {
    const rec = await base44.entities.Service.create({ title: "New Service", short_desc: "", order: services.length + 1 });
    setServices((s) => [...s, rec]);
  };

  const update = (id, field, val) => setServices((s) => s.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const save = async (service) => {
    await base44.entities.Service.update(service.id, { title: service.title, short_desc: service.short_desc, description: service.description, image: service.image, icon: service.icon, features: service.features, order: service.order });
  };

  const remove = async (id) => {
    if (!confirm("Delete this service?")) return;
    await base44.entities.Service.delete(id);
    setServices((s) => s.filter((r) => r.id !== id));
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <Card title="🛋️ Services">
        {services.map((s) => (
          <ServiceEditor key={s.id} service={s}
            onUpdate={(field, val) => update(s.id, field, val)}
            onSave={() => save(s)}
            onDelete={() => remove(s.id)}
          />
        ))}
        <button onClick={add} className="mt-2 flex items-center gap-1 text-sm text-gold hover:underline"><Plus className="w-4 h-4" /> Add Service</button>
      </Card>
    </div>
  );
}