import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2, Edit2, Check } from "lucide-react";

export default function PackageEditModal({ pkg, onClose, onSave }) {
  const [form, setForm] = useState({
    base_price: pkg.base_price || 0,
    discounted_price: pkg.discounted_price || "",
    discount_percent: pkg.discount_percent || "",
    warranty_months: pkg.warranty_months || 12,
    delivery_days: pkg.delivery_days || 45,
    promotional_label: pkg.promotional_label || "",
    is_active: pkg.is_active ?? true,
    is_popular: pkg.is_popular ?? false,
    features: pkg.features ? [...pkg.features] : [],
    image_url: pkg.image_url || "",
  });
  const [newFeature, setNewFeature] = useState("");
  const [saving, setSaving] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addFeature = () => {
    if (!newFeature.trim()) return;
    set("features", [...form.features, newFeature.trim()]);
    setNewFeature("");
  };

  const removeFeature = (i) => set("features", form.features.filter((_, idx) => idx !== i));

  const startEdit = (i) => { setEditIdx(i); setEditVal(form.features[i]); };
  const cancelEdit = () => { setEditIdx(null); setEditVal(""); };
  const saveEdit = (i) => {
    if (!editVal.trim()) { cancelEdit(); return; }
    const next = [...form.features];
    next[i] = editVal.trim();
    set("features", next);
    cancelEdit();
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...form,
      base_price: Number(form.base_price),
      discounted_price: form.discounted_price ? Number(form.discounted_price) : null,
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      warranty_months: Number(form.warranty_months),
      delivery_days: Number(form.delivery_days),
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-heading text-lg text-charcoal">
            Edit — {pkg.property_type} {pkg.tier}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Base Price (₹)</Label>
              <Input type="number" value={form.base_price} onChange={e => set("base_price", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Discounted Price (₹)</Label>
              <Input type="number" value={form.discounted_price} onChange={e => set("discounted_price", e.target.value)} placeholder="Optional" className="mt-1" />
            </div>
            <div>
              <Label>Discount (%)</Label>
              <Input type="number" value={form.discount_percent} onChange={e => set("discount_percent", e.target.value)} placeholder="Optional" className="mt-1" />
            </div>
            <div>
              <Label>Warranty (years)</Label>
              <Input type="number" value={form.warranty_months} onChange={e => set("warranty_months", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Delivery (days)</Label>
              <Input type="number" value={form.delivery_days} onChange={e => set("delivery_days", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Promotional Label</Label>
              <Input value={form.promotional_label} onChange={e => set("promotional_label", e.target.value)} placeholder="e.g. Best Value" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Image URL</Label>
            <Input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://..." className="mt-1" />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => set("is_active", v)} />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_popular} onCheckedChange={v => set("is_popular", v)} />
              <Label>Popular</Label>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Features</Label>
            <div className="space-y-2 mb-3">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                  {editIdx === i ? (
                    <>
                      <Input
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && saveEdit(i)}
                        className="flex-1 h-7 text-sm"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(i)}><Check className="w-3.5 h-3.5 text-green-600" /></button>
                      <button onClick={cancelEdit}><X className="w-3.5 h-3.5 text-red-400" /></button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{f}</span>
                      <button onClick={() => startEdit(i)}><Edit2 className="w-3 h-3 text-blue-400 hover:text-blue-600" /></button>
                      <button onClick={() => removeFeature(i)}><Trash2 className="w-3 h-3 text-red-400" /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newFeature} onChange={e => setNewFeature(e.target.value)} placeholder="Add feature..." className="flex-1" onKeyDown={e => e.key === "Enter" && addFeature()} />
              <Button variant="outline" size="sm" onClick={addFeature}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-charcoal text-white hover:bg-gold">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}