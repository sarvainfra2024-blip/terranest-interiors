import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

const CATEGORIES = ["Kitchen", "Storage", "Living", "Bedroom", "Ceiling & Lighting", "Smart Home", "Special Rooms", "Outdoor"];
const fmt = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

const CATEGORY_COLORS = {
  Kitchen: "bg-orange-100 text-orange-700",
  Storage: "bg-purple-100 text-purple-700",
  Living: "bg-green-100 text-green-700",
  Bedroom: "bg-blue-100 text-blue-700",
  "Ceiling & Lighting": "bg-yellow-100 text-yellow-700",
  "Smart Home": "bg-cyan-100 text-cyan-700",
  "Special Rooms": "bg-pink-100 text-pink-700",
  Outdoor: "bg-teal-100 text-teal-700",
};

const emptyForm = { name: "", description: "", price: "", category: "Living", is_active: true, sort_order: 0 };

export default function AddOnsManager() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.AddOn.list("sort_order");
    setAddons(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (a) => { setForm({ ...a }); setEditId(a.id); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    const data = { ...form, price: Number(form.price), sort_order: Number(form.sort_order) };
    if (editId) await base44.entities.AddOn.update(editId, data);
    else await base44.entities.AddOn.create(data);
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const toggle = async (a) => {
    await base44.entities.AddOn.update(a.id, { is_active: !a.is_active });
    await load();
  };

  const del = async (a) => {
    if (!confirm(`Delete "${a.name}"?`)) return;
    await base44.entities.AddOn.delete(a.id);
    await load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{addons.length} add-ons configured</p>
        <Button onClick={openCreate} className="bg-charcoal text-white hover:bg-gold gap-2">
          <Plus className="w-4 h-4" /> New Add-on
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
          <h4 className="font-medium text-charcoal">{editId ? "Edit Add-on" : "New Add-on"}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" value={form.price} onChange={e => set("price", e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => set("description", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={e => set("sort_order", e.target.value)} className="mt-1" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Switch checked={form.is_active} onCheckedChange={v => set("is_active", v)} />
              <Label>Active</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="bg-charcoal text-white hover:bg-gold">{saving ? "Saving..." : "Save"}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addons.map((a, i) => (
              <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal">{a.name}</p>
                  {a.description && <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[a.category] || "bg-gray-100 text-gray-600"}`}>{a.category}</span>
                </td>
                <td className="px-4 py-3 font-medium">{fmt(a.price)}</td>
                <td className="px-4 py-3">
                  <Switch checked={a.is_active} onCheckedChange={() => toggle(a)} className="scale-75" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(a)}><Edit2 className="w-4 h-4 text-blue-400 hover:text-blue-600" /></button>
                    <button onClick={() => del(a)}><Trash2 className="w-4 h-4 text-red-300 hover:text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}