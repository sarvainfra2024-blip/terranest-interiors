import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, X, ChevronDown, ChevronUp, Wrench, GripVertical } from "lucide-react";
import { RATE_UNITS } from "@/lib/pricingEngine";

const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const emptyItem = (category = "") => ({
  rate_type: "Hardware",
  name: "",
  category,
  brand: "",
  model: "",
  rate: 0,
  rate_unit: "Per Piece",
  gst_percent: 0,
  effective_from: "",
  effective_until: "",
  is_active: true,
});

export default function HardwareManager({ rates, onReload }) {
  const hardware = (rates || []).filter((r) => r.rate_type === "Hardware");
  const categories = [...new Set(hardware.map((r) => (r.category || "").trim()).filter(Boolean))];

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [openCat, setOpenCat] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [pendingCats, setPendingCats] = useState([]);

  const allCategories = [...new Set([...categories, ...pendingCats])];

  const itemsFor = (cat) => hardware.filter((r) => (r.category || "").trim() === cat).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  const sortedCategories = [...allCategories].sort((a, b) => {
    const aItems = itemsFor(a);
    const bItems = itemsFor(b);
    if (aItems.length === 0) return 1;
    if (bItems.length === 0) return -1;
    const aMin = aItems.reduce((min, i) => Math.min(min, i.order ?? 9999), Infinity);
    const bMin = bItems.reduce((min, i) => Math.min(min, i.order ?? 9999), Infinity);
    return aMin - bMin;
  });
  const orderedCats = sortedCategories.filter((c) => itemsFor(c).length > 0);
  const pendingOnly = sortedCategories.filter((c) => itemsFor(c).length === 0);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    if (type === "category") {
      const fromIdx = source.index;
      const toIdx = destination.index;
      if (fromIdx === toIdx) return;
      const reordered = [...orderedCats];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      const updates = [];
      reordered.forEach((c, ci) => {
        itemsFor(c).forEach((item, ii) => {
          updates.push({ id: item.id, order: ci * 1000 + ii });
        });
      });
      await base44.entities.RateMaster.bulkUpdate(updates);
      onReload();
    } else if (type === "item") {
      if (source.droppableId !== destination.droppableId) return;
      const cat = source.droppableId.replace("hw-items-", "");
      const items = itemsFor(cat);
      const fromIdx = source.index;
      const toIdx = destination.index;
      if (fromIdx === toIdx) return;
      const reordered = [...items];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      const catIdx = orderedCats.indexOf(cat);
      const base = catIdx >= 0 ? catIdx * 1000 : 0;
      const updates = reordered.map((item, ii) => ({ id: item.id, order: base + ii }));
      await base44.entities.RateMaster.bulkUpdate(updates);
      onReload();
    }
  };

  const startAdd = (category) => { setForm(emptyItem(category)); setEditing({ new: true }); };
  const startEdit = (r) => { setForm({ ...r }); setEditing({ id: r.id }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form.name.trim()) { alert("Item name is required."); return; }
    if (!form.category || !form.category.trim()) { alert("Category is required."); return; }
    const savedCat = form.category.trim();
    if (editing.new) {
      const catItems = itemsFor(savedCat);
      const catIdx = sortedCategories.indexOf(savedCat);
      const base = catIdx >= 0 ? catIdx * 1000 : orderedCats.length * 1000;
      await base44.entities.RateMaster.create({ ...form, order: base + catItems.length });
    } else {
      await base44.entities.RateMaster.update(editing.id, form);
    }
    cancel();
    setPendingCats((prev) => prev.filter((c) => c !== savedCat));
    onReload();
  };

  const remove = async (r) => {
    if (!confirm(`Delete "${r.name}" from ${r.category}?`)) return;
    await base44.entities.RateMaster.delete(r.id);
    onReload();
  };

  const toggle = async (r) => {
    await base44.entities.RateMaster.update(r.id, { is_active: !r.is_active });
    onReload();
  };

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addCategory = () => {
    const cat = newCategory.trim();
    if (cat && allCategories.includes(cat)) { alert("Category already exists."); return; }
    setNewCategory("");
    if (cat) setPendingCats((prev) => (prev.includes(cat) ? prev : [...prev, cat]));
    setOpenCat(cat || null);
    setForm(emptyItem(cat));
    setEditing({ new: true });
    setTimeout(() => {
      const el = document.querySelector("input[placeholder='Soft Close Hinges']");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const renderCategoryCard = (cat, isDraggable, dragProps = {}, handleProps = {}, ref = null) => {
    const items = itemsFor(cat);
    return (
      <div key={cat} ref={ref} {...dragProps} className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {isDraggable && (
              <span {...handleProps} className="cursor-grab active:cursor-grabbing flex items-center">
                <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500" />
              </span>
            )}
            <button onClick={() => setOpenCat(openCat === cat ? null : cat)} className="flex items-center gap-2 text-sm font-medium text-charcoal">
              {openCat === cat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {cat}
              <span className="text-xs text-gray-400">({items.length} items)</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => startAdd(cat)} size="sm" variant="outline" className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Item</Button>
          </div>
        </div>
        {openCat === cat && (
          <div className="p-3">
            {items.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No items in this category yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <th className="px-2 py-2 w-8"></th>
                      <th className="px-3 py-2 text-left font-medium">Item Name</th>
                      <th className="px-3 py-2 text-left font-medium">Brand</th>
                      <th className="px-3 py-2 text-right font-medium">Rate</th>
                      <th className="px-3 py-2 text-left font-medium">Unit</th>
                      <th className="px-3 py-2 text-center font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <Droppable droppableId={`hw-items-${cat}`} type="item">
                    {(provided) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {items.map((r, i) => (
                          <Draggable key={r.id} draggableId={r.id} index={i}>
                            {(prov) => (
                              <tr ref={prov.innerRef} {...prov.draggableProps} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                <td {...prov.dragHandleProps} className="px-2 py-2 cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                                </td>
                                <td className="px-3 py-2 font-medium text-charcoal">{r.name}</td>
                                <td className="px-3 py-2 text-gray-500">{r.brand || "—"}</td>
                                <td className="px-3 py-2 text-right font-medium">{fmt(r.rate)}</td>
                                <td className="px-3 py-2 text-gray-500">{r.rate_unit}</td>
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
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 bg-gold/5 border border-gold/30 rounded-lg p-3">
        <div className="flex-1 min-w-[220px]">
          <Label className="text-xs text-gray-500">Add New Hardware Category</Label>
          <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="mt-1 text-sm" placeholder="e.g. Hinges, Channels, Liftup" />
        </div>
        <Button onClick={addCategory} size="sm" className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>

      {form && (
        <div className="bg-white border border-gold/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-charcoal">
              {editing.new ? "Add" : "Edit"} Hardware Item
              {form.category && <span className="text-gray-400 font-normal"> · {form.category}</span>}
            </h4>
            <button onClick={cancel}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Category *</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-8 text-sm mt-1" placeholder="Hinges" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Item Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-8 text-sm mt-1" placeholder="Soft Close Hinges" />
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
            <Button size="sm" onClick={save}>{editing.new ? "Add Item" : "Save Changes"}</Button>
          </div>
        </div>
      )}

      {allCategories.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Wrench className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No hardware categories yet. Add a category above to start.</p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="hw-categories" type="category">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
              {orderedCats.map((cat, index) => (
                <Draggable key={cat} draggableId={cat} index={index}>
                  {(prov) => renderCategoryCard(cat, true, prov.draggableProps, prov.dragHandleProps, prov.innerRef)}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {pendingOnly.map((cat) => renderCategoryCard(cat, false))}
    </div>
  );
}