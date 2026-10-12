import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit2, Check, X, Plus, Trash2 } from "lucide-react";

const fmt = (v, unit) => unit === "%" ? `${v}%` : `₹${Number(v).toLocaleString("en-IN")}`;
const emptyNew = { key: "", label: "", value: "", unit: "%" };

export default function PricingConfigPanel() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState(emptyNew);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PricingConfig.list();
    setConfigs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (c) => setEditing({ id: c.id, label: c.label, value: c.value });

  const saveEdit = async (c) => {
    setSaving(true);
    await base44.entities.PricingConfig.update(c.id, {
      label: editing.label,
      value: Number(editing.value),
    });
    setEditing(null);
    await load();
    setSaving(false);
  };

  const addNew = async () => {
    if (!newItem.key || !newItem.value) return;
    setSaving(true);
    await base44.entities.PricingConfig.create({
      key: newItem.key.trim(),
      label: (newItem.label || newItem.key).trim(),
      value: Number(newItem.value),
      unit: newItem.unit,
      is_active: true,
    });
    setAdding(false);
    setNewItem(emptyNew);
    await load();
    setSaving(false);
  };

  const removeItem = async (c) => {
    if (!window.confirm(`Delete "${c.label || c.key}"?`)) return;
    await base44.entities.PricingConfig.delete(c.id);
    await load();
  };

  const toggle = async (c) => {
    await base44.entities.PricingConfig.update(c.id, { is_active: !c.is_active });
    await load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Configure taxes, charges, and component prices used in the pricing calculator.</p>
        {!adding && (
          <Button onClick={() => setAdding(true)} variant="outline" size="sm" className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add New
          </Button>
        )}
      </div>

      {adding && (
        <div className="bg-white rounded-lg border border-gold p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <Label className="text-xs text-gray-500">Key</Label>
            <Input value={newItem.key} onChange={e => setNewItem(p => ({ ...p, key: e.target.value }))} placeholder="gst" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Label</Label>
            <Input value={newItem.label} onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))} placeholder="GST" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Value</Label>
            <Input type="number" value={newItem.value} onChange={e => setNewItem(p => ({ ...p, value: e.target.value }))} placeholder="18" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Unit</Label>
            <select value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))} className="w-full h-8 border border-gray-200 rounded-sm text-sm px-2 bg-white">
              <option value="%">%</option>
              <option value="₹">₹</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={addNew} disabled={saving} size="sm" className="flex items-center gap-1"><Check className="w-4 h-4" /> Save</Button>
            <Button onClick={() => { setAdding(false); setNewItem(emptyNew); }} variant="ghost" size="sm"><X className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Charge / Tax</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Value</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Active</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c, i) => {
              const isEditing = editing?.id === c.id;
              return (
                <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {isEditing ? (
                      <Input
                        value={editing.label}
                        onChange={e => setEditing(prev => ({ ...prev, label: e.target.value }))}
                        className="w-full h-8 text-sm"
                      />
                    ) : (c.label || c.key)}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editing.value}
                          onChange={e => setEditing(prev => ({ ...prev, value: e.target.value }))}
                          className="w-28 h-8 text-sm"
                        />
                        <span className="text-gray-400 text-xs">{c.unit}</span>
                        <button onClick={() => saveEdit(c)} disabled={saving}><Check className="w-4 h-4 text-green-600" /></button>
                        <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-red-400" /></button>
                      </div>
                    ) : (
                      <span className={`font-medium ${c.is_active ? "text-charcoal" : "text-gray-400"}`}>
                        {fmt(c.value, c.unit)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={c.is_active} onCheckedChange={() => toggle(c)} className="scale-75" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isEditing ? (
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => startEdit(c)}><Edit2 className="w-4 h-4 text-blue-400 hover:text-blue-600" /></button>
                        <button onClick={() => removeItem(c)}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}