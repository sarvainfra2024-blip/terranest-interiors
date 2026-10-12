import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GripVertical, Layers } from "lucide-react";

export default function SubModuleManager() {
  const [moduleTypes, setModuleTypes] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "" });

  const load = async () => {
    const [mtData, smData] = await Promise.all([
      base44.entities.ModuleType.list("order"),
      base44.entities.SubModule.list("order"),
    ]);
    setModuleTypes(mtData || []);
    setSubModules(smData || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const selectedType = moduleTypes.find((mt) => mt.id === selectedTypeId);
  const filteredSubs = subModules
    .filter((sm) => sm.module_type_id === selectedTypeId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const resetForm = () => { setForm({ name: "" }); setEditingId(null); };

  const save = async () => {
    if (!form.name.trim()) return;
    if (!selectedTypeId || !selectedType) { alert("Select a module type first."); return; }
    if (editingId) {
      await base44.entities.SubModule.update(editingId, { name: form.name.trim() });
    } else {
      const maxOrder = filteredSubs.reduce((mx, sm) => Math.max(mx, sm.order ?? 0), -1);
      await base44.entities.SubModule.create({
        module_type_id: selectedTypeId,
        module_type_name: selectedType.name,
        name: form.name.trim(),
        order: maxOrder + 1,
        is_active: true,
      });
    }
    resetForm();
    load();
  };

  const edit = (sm) => {
    setEditingId(sm.id);
    setForm({ name: sm.name });
  };

  const remove = async (id) => {
    if (!confirm("Delete this sub module?")) return;
    await base44.entities.SubModule.delete(id);
    load();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;
    const sorted = [...filteredSubs];
    const [moved] = sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved);
    await base44.entities.SubModule.bulkUpdate(sorted.map((sm, i) => ({ id: sm.id, order: i })));
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-heading text-base text-charcoal mb-2">Sub Module Configuration</h3>
        <p className="text-xs text-gray-500 mb-3">Select a Module Type to manage its Sub Modules. Sub Modules replace manual module naming in the Module Generator.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <Label className="text-xs text-gray-500">Module Type</Label>
            <select value={selectedTypeId} onChange={(e) => { setSelectedTypeId(e.target.value); resetForm(); }} className="w-full h-9 text-sm border border-gray-200 rounded px-2 mt-1 bg-white">
              <option value="">Select Module Type...</option>
              {moduleTypes.filter((mt) => mt.is_active !== false).map((mt) => <option key={mt.id} value={mt.id}>{mt.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedTypeId && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium text-sm text-charcoal mb-3">{editingId ? "Edit Sub Module" : "Add Sub Module"}{selectedType && <span className="text-gray-400 font-normal"> · {selectedType.name}</span>}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-3">
                <Label className="text-xs text-gray-500">Sub Module Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 text-sm" placeholder="e.g. Drawer Unit, Sink Unit, Corner Unit" onKeyDown={(e) => e.key === "Enter" && save()} />
              </div>
              <div className="flex gap-2">
                <Button onClick={save} size="sm">{editingId ? "Update" : "Add"}</Button>
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
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Sub Module</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                {filteredSubs.length === 0 ? (
                  <tbody>
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-xs">No sub modules configured for this module type. Add one above.</td></tr>
                  </tbody>
                ) : (
                  <Droppable droppableId="sub-modules">
                    {(provided) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {filteredSubs.map((sm, index) => (
                          <Draggable key={sm.id} draggableId={sm.id} index={index}>
                            {(prov) => (
                              <tr ref={prov.innerRef} {...prov.draggableProps} className="border-b border-gray-100 last:border-0">
                                <td className="px-2 py-2.5 text-center w-8" {...prov.dragHandleProps}>
                                  <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500 inline-block cursor-grab active:cursor-grabbing" />
                                </td>
                                <td className="px-4 py-2.5 font-medium text-charcoal">{sm.name}</td>
                                <td className="px-4 py-2.5 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => edit(sm)} className="text-gold hover:underline text-xs">Edit</button>
                                    <button onClick={() => remove(sm.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
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
        </>
      )}

      {!selectedTypeId && moduleTypes.length > 0 && (
        <div className="text-center py-10 text-gray-400">
          <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Select a module type above to manage its sub modules.</p>
        </div>
      )}

      {moduleTypes.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No module types configured. Add module types first in the Module Types tab.</p>
        </div>
      )}
    </div>
  );
}