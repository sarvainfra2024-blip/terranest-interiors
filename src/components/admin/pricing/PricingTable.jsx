import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit2, Check, X, Plus, Trash2, Star, Copy } from "lucide-react";
import PackageEditModal from "./PackageEditModal";

const ROW_GROUPS = ["1 BHK", "2 BHK", "3 BHK", ["4 BHK", "Villa"]];
const TIERS = ["Essential", "Premium", "Luxury"];

const TIER_COLORS = {
  Essential: "bg-gray-100 text-gray-700",
  Premium: "bg-blue-100 text-blue-700",
  Luxury: "bg-amber-100 text-amber-700",
};

const fmt = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function PricingTable() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState(null); // {id, value}
  const [editModal, setEditModal] = useState(null); // package obj
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PricingPackage.list();
    setPackages(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getPackage = (pt, tier) => packages.find(p => p.property_type === pt && p.tier === tier);

  const startEdit = (pkg) => setEditingPrice({ id: pkg.id, value: pkg.base_price });

  const savePrice = async (pkg) => {
    setSaving(true);
    await base44.entities.PricingPackage.update(pkg.id, { base_price: Number(editingPrice.value) });
    setEditingPrice(null);
    await load();
    setSaving(false);
  };

  const toggleActive = async (pkg) => {
    await base44.entities.PricingPackage.update(pkg.id, { is_active: !pkg.is_active });
    await load();
  };

  const togglePopular = async (pkg) => {
    await base44.entities.PricingPackage.update(pkg.id, { is_popular: !pkg.is_popular });
    await load();
  };

  const duplicatePackage = async (pkg) => {
    const { id, created_date, updated_date, created_by_id, ...rest } = pkg;
    await base44.entities.PricingPackage.create({ ...rest, promotional_label: "Copy" });
    await load();
  };

  const deletePackage = async (pkg) => {
    if (!confirm(`Delete ${pkg.property_type} ${pkg.tier}?`)) return;
    await base44.entities.PricingPackage.delete(pkg.id);
    await load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Pricing Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Property Type</th>
                {TIERS.map(t => (
                  <th key={t} className="px-4 py-3 text-center font-medium text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs ${TIER_COLORS[t]}`}>{t}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROW_GROUPS.map((group, i) => {
                const pts = Array.isArray(group) ? group : [group];
                const label = pts.join(" / ");
                return (
                  <tr key={label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-4 font-medium text-charcoal">{label}</td>
                    {TIERS.map(tier => {
                      const pkgs = pts.map(p => getPackage(p, tier)).filter(Boolean);
                      if (pkgs.length === 0) return (
                        <td key={tier} className="px-4 py-4 text-center text-gray-400 text-xs">—</td>
                      );
                      return (
                        <td key={tier} className="px-4 py-4">
                          <div className="flex flex-col gap-3">
                            {pkgs.map(pkg => {
                              const isEditing = editingPrice?.id === pkg.id;
                              const subLabel = pkgs.length > 1 ? pkg.property_type : null;
                              return (
                                <div key={pkg.id} className="flex flex-col items-center gap-2">
                                  {subLabel && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{subLabel}</span>}
                                  {isEditing ? (
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="number"
                                        value={editingPrice.value}
                                        onChange={e => setEditingPrice(prev => ({ ...prev, value: e.target.value }))}
                                        className="w-28 h-8 text-xs text-center"
                                      />
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => savePrice(pkg)} disabled={saving}>
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setEditingPrice(null)}>
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <span className={`font-semibold ${pkg.is_active ? "text-charcoal" : "text-gray-400 line-through"}`}>
                                        {fmt(pkg.base_price)}
                                      </span>
                                      <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-gold" onClick={() => startEdit(pkg)}>
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Switch checked={pkg.is_active} onCheckedChange={() => toggleActive(pkg)} className="scale-75" />
                                    <button onClick={() => togglePopular(pkg)} title="Toggle Popular">
                                      <Star className={`w-3 h-3 ${pkg.is_popular ? "text-gold fill-gold" : "text-gray-300"}`} />
                                    </button>
                                    <button onClick={() => setEditModal(pkg)} title="Edit Details">
                                      <Edit2 className="w-3 h-3 text-blue-400 hover:text-blue-600" />
                                    </button>
                                    <button onClick={() => duplicatePackage(pkg)} title="Duplicate">
                                      <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                    </button>
                                    <button onClick={() => deletePackage(pkg)} title="Delete">
                                      <Trash2 className="w-3 h-3 text-red-300 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500 font-body">
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> Popular</span>
        <span className="flex items-center gap-1"><Switch checked={true} className="scale-75 pointer-events-none" /> Active / Inactive</span>
        <span className="flex items-center gap-1"><Edit2 className="w-3 h-3 text-blue-400" /> Edit full details</span>
        <span className="flex items-center gap-1"><Copy className="w-3 h-3 text-gray-400" /> Duplicate</span>
      </div>

      {editModal && (
        <PackageEditModal
          pkg={editModal}
          onClose={() => setEditModal(null)}
          onSave={async (data) => {
            await base44.entities.PricingPackage.update(editModal.id, data);
            setEditModal(null);
            await load();
          }}
        />
      )}
    </div>
  );
}