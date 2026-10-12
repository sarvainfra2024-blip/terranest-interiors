import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit2, Check, X, GripVertical } from "lucide-react";

const TIERS = ["Essential", "Premium", "Luxury"];

const TIER_BADGE = {
  Essential: "bg-gray-100 text-gray-700",
  Premium: "bg-gold/15 text-gold",
  Luxury: "bg-charcoal text-white",
};

export default function TierFeaturesManager() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState("Essential");
  const [newText, setNewText] = useState("");
  const [editing, setEditing] = useState(null); // { id, value }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.TierFeature.list("order");
    setFeatures(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addFeature = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    const tierItems = features.filter(f => f.tier === activeTier);
    await base44.entities.TierFeature.create({
      tier: activeTier,
      feature: newText.trim(),
      order: tierItems.length,
      is_active: true,
    });
    setNewText("");
    await load();
    setSaving(false);
  };

  const saveEdit = async (f) => {
    setSaving(true);
    await base44.entities.TierFeature.update(f.id, { feature: editing.value.trim() });
    setEditing(null);
    await load();
    setSaving(false);
  };

  const toggle = async (f) => {
    await base44.entities.TierFeature.update(f.id, { is_active: !f.is_active });
    await load();
  };

  const remove = async (f) => {
    if (!confirm("Delete this feature?")) return;
    await base44.entities.TierFeature.delete(f.id);
    await load();
  };

  const move = async (f, dir) => {
    const tierItems = features.filter(x => x.tier === f.tier).sort((a, b) => a.order - b.order);
    const idx = tierItems.findIndex(x => x.id === f.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= tierItems.length) return;
    const other = tierItems[swapIdx];
    setSaving(true);
    await base44.entities.TierFeature.bulkUpdate([
      { id: f.id, order: other.order },
      { id: other.id, order: f.order },
    ]);
    await load();
    setSaving(false);
  };

  const tierItems = features.filter(f => f.tier === activeTier).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Add and edit the features shown on each tier's pricing card (Essential, Premium, Luxury). These appear alongside any package-specific features.
      </p>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TIERS.map(t => (
          <button
            key={t}
            onClick={() => { setActiveTier(t); setEditing(null); }}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              activeTier === t ? "bg-white text-charcoal shadow-sm" : "text-gray-500 hover:text-charcoal"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2">
            <Input
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addFeature()}
              placeholder={`Add a feature for ${activeTier} tier...`}
              className="flex-1"
            />
            <Button onClick={addFeature} disabled={saving || !newText.trim()} className="bg-charcoal text-white hover:bg-gold">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" />
          </div>
        ) : tierItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No features yet for {activeTier}. Add one above.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tierItems.map((f, i) => {
              const isEditing = editing?.id === f.id;
              return (
                <li key={f.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex flex-col">
                    <button onClick={() => move(f, -1)} disabled={i === 0 || saving} className="text-gray-300 hover:text-charcoal disabled:opacity-30 text-xs leading-none">▲</button>
                    <button onClick={() => move(f, 1)} disabled={i === tierItems.length - 1 || saving} className="text-gray-300 hover:text-charcoal disabled:opacity-30 text-xs leading-none">▼</button>
                  </div>
                  <GripVertical className="w-3 h-3 text-gray-200" />
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editing.value}
                        onChange={e => setEditing(prev => ({ ...prev, value: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && saveEdit(f)}
                        className="flex-1 h-8 text-sm"
                      />
                      <button onClick={() => saveEdit(f)} disabled={saving}><Check className="w-4 h-4 text-green-600" /></button>
                      <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-red-400" /></button>
                    </div>
                  ) : (
                    <span className={`flex-1 text-sm ${f.is_active ? "text-charcoal" : "text-gray-400 line-through"}`}>{f.feature}</span>
                  )}
                  {!isEditing && (
                    <>
                      <Switch checked={f.is_active} onCheckedChange={() => toggle(f)} className="scale-75" />
                      <button onClick={() => setEditing({ id: f.id, value: f.feature })} className="text-blue-400 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(f)} className="text-red-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}