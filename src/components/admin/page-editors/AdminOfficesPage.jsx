import React, { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminOfficesPage() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.Office.list("order", 50)
      .then(setOffices)
      .finally(() => setLoading(false));
  }, []);

  const addOffice = async () => {
    const rec = await base44.entities.Office.create({
      city: "New Office",
      address: "Address here",
      phone: "",
      email: "",
      order: offices.length,
      is_active: true,
    });
    setOffices((o) => [...o, rec]);
  };

  const updateLocal = (id, key, val) => {
    setOffices((o) => o.map((item) => item.id === id ? { ...item, [key]: val } : item));
  };

  const saveOffice = async (office) => {
    setSaving(office.id);
    await base44.entities.Office.update(office.id, {
      city: office.city,
      address: office.address,
      phone: office.phone,
      email: office.email,
      hours: office.hours,
      map_url: office.map_url,
      order: office.order,
      is_active: office.is_active,
    });
    setSaving(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteOffice = async (id) => {
    if (!confirm("Delete this office?")) return;
    await base44.entities.Office.delete(id);
    setOffices((o) => o.filter((item) => item.id !== id));
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Manage office locations shown on the Contact page.</p>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>

      <div className="space-y-4">
        {offices.map((office) => (
          <div key={office.id} className="bg-white border border-gray-100 rounded-sm p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">City / Location</label>
                <input
                  type="text"
                  value={office.city || ""}
                  onChange={(e) => updateLocal(office.id, "city", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Phone</label>
                <input
                  type="text"
                  value={office.phone || ""}
                  onChange={(e) => updateLocal(office.id, "phone", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-charcoal mb-1">Address</label>
              <textarea
                rows={2}
                value={office.address || ""}
                onChange={(e) => updateLocal(office.id, "address", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Email</label>
                <input
                  type="text"
                  value={office.email || ""}
                  onChange={(e) => updateLocal(office.id, "email", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Office Hours (optional)</label>
                <input
                  type="text"
                  value={office.hours || ""}
                  onChange={(e) => updateLocal(office.id, "hours", e.target.value)}
                  placeholder="Mon–Sat: 10AM–7PM"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-charcoal mb-1">Google Maps Embed URL (optional)</label>
              <input
                type="text"
                value={office.map_url || ""}
                onChange={(e) => updateLocal(office.id, "map_url", e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={office.is_active !== false}
                    onChange={(e) => updateLocal(office.id, "is_active", e.target.checked)}
                    className="accent-gold"
                  />
                  Active
                </label>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500">Order:</label>
                  <input
                    type="number"
                    value={office.order ?? 0}
                    onChange={(e) => updateLocal(office.id, "order", Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteOffice(office.id)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-400 text-xs rounded-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button
                  onClick={() => saveOffice(office)}
                  disabled={saving === office.id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gold text-white text-xs rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {saving === office.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addOffice}
        className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 text-gray-500 text-sm rounded-sm hover:border-gold hover:text-gold transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" /> Add Office
      </button>
    </div>
  );
}