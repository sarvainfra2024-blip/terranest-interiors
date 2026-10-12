import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, Search, X, GripVertical } from "lucide-react";
import { RATE_UNITS } from "@/lib/pricingEngine";

const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const empty = (rateType) => ({
  rate_type: rateType,
  name: "",
  category: "",
  thickness: "",
  brand: "",
  model: "",
  rate: 0,
  rate_unit: "Sq.ft",
  gst_percent: 0,
  effective_from: "",
  effective_until: "",
  is_active: true,
});

export default function RateTable({ rateType, rates, onReload }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const list = (rates || [])
    .filter((r) => r.rate_type === rateType)
    .filter((r) => {
      const s = search.toLowerCase();
      if (!s) return true;
      return (
        (r.name || "").toLowerCase().includes(s) ||
        (r.category || "").toLowerCase().includes(s) ||
        (r.brand || "").toLowerCase().includes(s) ||
        (r.model || "").toLowerCase().includes(s)
      );
    })
    .filter((r) => !filterUnit || r.rate_unit === filterUnit)
    .filter((r) => !filterStatus || (filterStatus === "Active" ? r.is_active : !r.is_active))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;
    const reordered = [...list];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updates = reordered.map((item, i) => ({ id: item.id, order: i }));
    await base44.entities.RateMaster.bulkUpdate(updates);
    onReload();
  };

  const startAdd = () => { setForm(empty(rateType)); setEditing({ new: true }); };
  const startEdit = (r) => { setForm({ ...r }); setEditing({ id: r.id }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form.name.trim()) { alert("Name is required."); return; }
    if (editing.new) {
      await base44.entities.RateMaster.create(form);
    } else {
      await base44.entities.RateMaster.update(editing.id, form);
    }
    cancel();
    onReload();
  };

  const remove = async (r) => {
    if (!confirm(`Delete "${r.name}"?`)) return;
    await base44.entities.RateMaster.delete(r.id);
    onReload();
  };

  const toggle = async (r) => {
    await base44.entities.RateMaster.update(r.id, { is_active: !r.is_active });
    onReload();
  };

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, category, brand..." className="pl-9 text-sm h-9" />
        </div>
        <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className="h-9 border border-gray-200 rounded-md text-sm px-2 bg-white">
          <option value="">All Units</option>
          {RATE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 border border-gray-200 rounded-md text-sm px-2 bg-white">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <Button onClick={startAdd} size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Rate
        </Button>
      </div>

      {form && (
        <div className="bg-gold/5 border border-gold/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-charcoal">{editing.new ? "Add" : "Edit"} {rateType} Rate</h4>
            <button onClick={cancel}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Category</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-8 text-sm mt-1" placeholder="Carcass / Shutter" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Thickness</Label>
              <Input value={form.thickness} onChange={(e) => set("thickness", e.target.value)} className="h-8 text-sm mt-1" placeholder="18mm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Brand</Label>
              <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Model</Label>
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Rate</Label>
              <Input type="number" value={form.rate} onChange={(e) => set("rate", Number(e.target.value))} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Rate Unit</Label>
              <select value={form.rate_unit} onChange={(e) => set("rate_unit", e.target.value)} className="w-full h-8 text-sm border border-gray-200 rounded px-2 mt-1 bg-white">
                {RATE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">GST (%)</Label>
              <Input type="number" value={form.gst_percent} onChange={(e) => set("gst_percent", Number(e.target.value))} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Effective From</Label>
              <Input type="date" value={form.effective_from || ""} onChange={(e) => set("effective_from", e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Effective Until</Label>
              <Input type="date" value={form.effective_until || ""} onChange={(e) => set("effective_until", e.target.value)} className="h-8 text-sm mt-1" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="ghost" size="sm" onClick={cancel}>Cancel</Button>
            <Button size="sm" onClick={save}>Save Rate</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="px-3 py-2.5 text-center font-medium w-8"></th>
                <th className="px-3 py-2.5 text-left font-medium">Name</th>
                <th className="px-3 py-2.5 text-left font-medium">Category</th>
                <th className="px-3 py-2.5 text-left font-medium">Thickness</th>
                <th className="px-3 py-2.5 text-left font-medium">Brand</th>
                <th className="px-3 py-2.5 text-right font-medium">Rate</th>
                <th className="px-3 py-2.5 text-left font-medium">Unit</th>
                <th className="px-3 py-2.5 text-left font-medium">Effective</th>
                <th className="px-3 py-2.5 text-center font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            {list.length === 0 ? (
              <tbody>
                <tr><td colSpan={10} className="px-3 py-6 text-center text-gray-400 text-xs">No {rateType} rates yet. Click "Add Rate".</td></tr>
              </tbody>
            ) : (
              <Droppable droppableId="rates">
                {(provided) => (
                  <tbody ref={provided.innerRef} {...provided.droppableProps}>
                    {list.map((r, index) => (
                      <Draggable key={r.id} draggableId={r.id} index={index}>
                        {(prov) => (
                          <tr
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                          >
                            <td className="px-2 py-2 text-center w-8" {...prov.dragHandleProps}>
                              <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500 inline-block cursor-grab active:cursor-grabbing" />
                            </td>
                            <td className="px-3 py-2 font-medium text-charcoal">{r.name}</td>
                            <td className="px-3 py-2 text-gray-500">{r.category || "—"}</td>
                            <td className="px-3 py-2 text-gray-500">{r.thickness || "—"}</td>
                            <td className="px-3 py-2 text-gray-500">{r.brand || "—"}</td>
                            <td className="px-3 py-2 text-right font-medium">{fmt(r.rate)}</td>
                            <td className="px-3 py-2 text-gray-500">{r.rate_unit}</td>
                            <td className="px-3 py-2 text-gray-500 text-xs">{r.effective_from || "—"}{r.effective_until ? ` → ${r.effective_until}` : ""}</td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`text-xs ${r.is_active ? "text-green-600" : "text-gray-400"}`}>{r.is_active ? "Active" : "Inactive"}</span>
                                <Switch checked={r.is_active} onCheckedChange={() => toggle(r)} className="scale-75" />
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => startEdit(r)}><Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-charcoal" /></button>
                                <button onClick={() => remove(r)}><Trash2 className="w-3.5 h-3.5 text-red-300 hover:text-red-500" /></button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            )}
          </table>
        </DragDropContext>
      </div>
    </div>
  );
}