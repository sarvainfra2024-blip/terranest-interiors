import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, X, ChevronDown, ChevronUp, Package, Check, GripVertical } from "lucide-react";
import { RATE_UNITS } from "@/lib/pricingEngine";

const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const UNCAT = "Uncategorized";

const emptyItem = (category = "") => ({
  rate_type: "Accessory",
  name: "",
  category,
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

export default function AccessoryManager({ rates, onReload }) {
  const accessories = (rates || []).filter((r) => r.rate_type === "Accessory");
  const categories = [...new Set(accessories.map((r) => (r.category || "").trim()).filter(Boolean))];

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [openCat, setOpenCat] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [pendingCats, setPendingCats] = useState([]);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState("");

  const hasUncat = accessories.some((r) => !(r.category || "").trim());
  const allCategories = [...new Set([...categories, ...pendingCats])];

  const itemsFor = (cat) => {
    if (cat === UNCAT) return accessories.filter((r) => !(r.category || "").trim()).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    return accessories.filter((r) => (r.category || "").trim() === cat).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  };

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
  const pendingOnly = sortedCategories.filter((c) => itemsFor(c).length === 0 && c !== UNCAT);
  const displayCats = [...orderedCats];
  if (hasUncat && !displayCats.includes(UNCAT)) displayCats.push(UNCAT);

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
      const cat = source.droppableId.replace("acc-items-", "");
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

  const startAdd = (category) => {
    const cat = category === UNCAT ? "" : category;
    setForm(emptyItem(cat));
    setEditing({ new: true });
    if (category !== UNCAT) setOpenCat(category);
  };
  const startEdit = (r) => { setForm({ ...r }); setEditing({ id: r.id }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form.name.trim()) { alert("Item name is required."); return; }
    const savedCat = (form.category || "").trim();
    if (editing.new) {
      const catItems = itemsFor(savedCat || UNCAT);
      const catIdx = sortedCategories.indexOf(savedCat);
      const base = catIdx >= 0 ? catIdx * 1000 : orderedCats.length * 1000;
      await base44.entities.RateMaster.create({ ...form, category: savedCat, order: base + catItems.length });
    } else {
      await base44.entities.RateMaster.update(editing.id, form);
    }
    cancel();
    setPendingCats((prev) => prev.filter((c) => c !== savedCat));
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

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat) return;
    if (allCategories.includes(cat) || cat === UNCAT) { alert("Category already exists."); return; }
    setNewCategory("");
    setPendingCats((prev) => (prev.includes(cat) ? prev : [...prev, cat]));
    setOpenCat(cat);
    setForm(emptyItem(cat));
    setEditing({ new: true });
  };

  const startEditCat = (cat) => { setEditingCat(cat); setCatName(cat === UNCAT ? "" : cat); };
  const cancelEditCat = () => { setEditingCat(null); setCatName(""); };

  const saveEditCat = async (oldCat) => {
    const newName = catName.trim();
    if (!newName) { alert("Category name is required."); return; }
    if (newName !== oldCat && allCategories.includes(newName)) { alert("Category name already exists."); return; }
    const items = itemsFor(oldCat);
    if (items.length) {
      await base44.entities.RateMaster.bulkUpdate(items.map((it) => ({ id: it.id, category: newName })));
    }
    cancelEditCat();
    onReload();
  };

  const deleteCat = async (cat) => {
    const items = itemsFor(cat);
    if (!confirm(`Delete category "${cat}" and all ${items.length} item(s) in it?`)) return;
    for (const it of items) { await base44.entities.RateMaster.delete(it.id); }
    setPendingCats((prev) => prev.filter((c) => c !== cat));
    onReload();
  };

  const renderCategoryCard = (cat, isDraggable, dragProps = {}, handleProps = {}, ref = null) => {
    const isUncat = cat === UNCAT;
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
            {editingCat === cat ? (
              <div className="flex items-center gap-1">
                <Input value={catName} onChange={(e) => setCatName(e.target.value)} className="h-7 text-xs w-40" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEditCat(cat); if (e.key === "Escape") cancelEditCat(); }} placeholder={isUncat ? "New category name" : cat} />
                <button onClick={() => saveEditCat(cat)} className="text-green-600 hover:text-green-700" title="Save"><Check className="w-4 h-4" /></button>
                <button onClick={cancelEditCat} className="text-gray-400 hover:text-charcoal" title="Cancel"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                {!isUncat && <button onClick={() => startEditCat(cat)} className="text-gray-400 hover:text-charcoal p-1" title="Rename category"><Pencil className="w-3.5 h-3.5" /></button>}
                <button onClick={() => deleteCat(cat)} className="text-red-300 hover:text-red-500 p-1" title="Delete category"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}
            <Button onClick={() => startAdd(cat)} size="sm" variant="outline" className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Rate</Button>
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
                      <th className="px-3 py-2 text-left font-medium">Thickness</th>
                      <th className="px-3 py-2 text-left font-medium">Brand</th>
                      <th className="px-3 py-2 text-right font-medium">Rate</th>
                      <th className="px-3 py-2 text-left font-medium">Unit</th>
                      <th className="px-3 py-2 text-center font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <Droppable droppableId={`acc-items-${cat}`} type="item">
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
                                <td className="px-3 py-2 text-gray-500">{r.thickness || "—"}</td>
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
          <Label className="text-xs text-gray-500">Add New Accessory Category</Label>
          <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="mt-1 text-sm" placeholder="e.g. Kitchen Accessories, Wardrobe Accessories, Lighting" onKeyDown={(e) => e.key === "Enter" && addCategory()} />
        </div>
        <Button onClick={addCategory} size="sm" className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>

      {form && (
        <div className="bg-white border border-gold/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-charcoal">
              {editing.new ? "Add" : "Edit"} Accessory
              {form.category && <span className="text-gray-400 font-normal"> · {form.category}</span>}
            </h4>
            <button onClick={cancel}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Category</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-8 text-sm mt-1" placeholder="Kitchen Accessories" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Item Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-8 text-sm mt-1" placeholder="Acrylic Back Panel" />
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
            <Button size="sm" onClick={save}>{editing.new ? "Add Rate" : "Save Changes"}</Button>
          </div>
        </div>
      )}

      {displayCats.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No accessory categories yet. Add a category above to start.</p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="acc-categories" type="category">
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

      {hasUncat && !orderedCats.includes(UNCAT) && renderCategoryCard(UNCAT, false)}
      {pendingOnly.map((cat) => renderCategoryCard(cat, false))}
    </div>
  );
}