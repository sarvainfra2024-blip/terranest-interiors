import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";

export default function ModuleTypeManager({ rates: propRates }) {
  const [moduleTypes, setModuleTypes] = useState([]);
  const [rates, setRates] = useState(propRates || []);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", default_carcass_material: "", default_shutter_material: "", order: 0 });

  const load = async () => {
    const mtData = await base44.entities.ModuleType.list("order");
    setModuleTypes(mtData || []);
    if (!propRates || !propRates.length) {
      const rData = await base44.entities.RateMaster.list();
      setRates(rData || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const activeRates = (rates || []).filter((r) => r.is_active !== false);
  const carcassOptions = [...new Set(activeRates.filter((r) => r.rate_type === "Carcass Material").map((r) => r.name))];
  const shutterOptions = [...new Set(activeRates.filter((r) => r.rate_type === "Shutter Material").map((r) => r.name))];

  const resetForm = () => { setForm({ name: "", default_carcass_material: "", default_shutter_material: "", order: 0 }); setEditingId(null); };

  const save = async () => {
    if (!form.name.trim()) return;
    if (editingId) {
      await base44.entities.ModuleType.update(editingId, form);
    } else {
      const maxOrder = moduleTypes.reduce((mx, mt) => Math.max(mx, mt.order ?? 0), -1);
      await base44.entities.ModuleType.create({ ...form, order: maxOrder + 1 });
    }
    resetForm();
    load();
  };

  const edit = (mt) => {
    setEditingId(mt.id);
    setForm({ name: mt.name, default_carcass_material: mt.default_carcass_material || "", default_shutter_material: mt.default_shutter_material || "", order: mt.order || 0 });
  };

  const remove = async (id) => {
    if (!confirm("Delete this module type?")) return;
    await base44.entities.ModuleType.delete(id);
    load();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;
    const sorted = [...moduleTypes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const [moved] = sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved);
    await base44.entities.ModuleType.bulkUpdate(sorted.map((mt, i) => ({ id: mt.id, order: i })));
    load();
  };

  const selectCls = "w-full h-9 text-sm border border-gray-200 rounded px-2 bg-white";
  const sorted = [...moduleTypes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-heading text-base text-charcoal mb-3">{editingId ? "Edit Module Type" : "Add Module Type"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <Label className="text-xs text-gray-500">Module Type Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 text-sm" placeholder="e.g. Kitchen Tall unit" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Default Carcass Material</Label>
            <select value={form.default_carcass_material} onChange={(e) => setForm({ ...form, default_carcass_material: e.target.value })} className={selectCls + " mt-1"}>
              <option value="">Select...</option>
              {carcassOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Default Shutter Material</Label>
            <select value={form.default_shutter_material} onChange={(e) => setForm({ ...form, default_shutter_material: e.target.value })} className={selectCls + " mt-1"}>
              <option value="">Select...</option>
              {shutterOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} size="sm" className="flex items-center gap-1">{editingId ? "Update" : "Add Type"}</Button>
            {editingId && <Button onClick={resetForm} variant="outline" size="sm">Cancel</Button>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-center px-2 py-2 w-8"></th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Module Type</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Default Carcass</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Default Shutter</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            {sorted.length === 0 ? (
              <tbody>
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-xs">No module types configured. Add one above.</td></tr>
              </tbody>
            ) : (
              <Droppable droppableId="module-types">
                {(provided) => (
                  <tbody ref={provided.innerRef} {...provided.droppableProps}>
                    {sorted.map((mt, index) => (
                      <Draggable key={mt.id} draggableId={mt.id} index={index}>
                        {(prov) => (
                          <tr ref={prov.innerRef} {...prov.draggableProps} className="border-b border-gray-100 last:border-0">
                            <td className="px-2 py-2.5 text-center w-8" {...prov.dragHandleProps}>
                              <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500 inline-block cursor-grab active:cursor-grabbing" />
                            </td>
                            <td className="px-4 py-2.5 font-medium text-charcoal">{mt.name}</td>
                            <td className="px-4 py-2.5 text-gray-600">{mt.default_carcass_material || "—"}</td>
                            <td className="px-4 py-2.5 text-gray-600">{mt.default_shutter_material || "—"}</td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button onClick={() => edit(mt)} className="text-gold hover:underline text-xs">Edit</button>
                                <button onClick={() => remove(mt.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
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