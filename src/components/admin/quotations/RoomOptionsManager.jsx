import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, Check, X, GripVertical } from "lucide-react";

const DEFAULT_ROOMS = [
  "Foyer", "Kitchen", "Utility", "Living", "Dining",
  "Bedroom 1", "Bedroom 2", "Bedroom 3", "Balcony"
];

export default function RoomOptionsManager() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoom, setNewRoom] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.RoomOption.list("order");
    setRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const data = await base44.entities.RoomOption.list();
      if (!data || data.length === 0) {
        await base44.entities.RoomOption.bulkCreate(
          DEFAULT_ROOMS.map((name, i) => ({ name, order: i, is_active: true }))
        );
      }
      load();
    })();
  }, []);

  const addRoom = async () => {
    if (!newRoom.trim()) return;
    await base44.entities.RoomOption.create({ name: newRoom.trim(), order: rooms.length, is_active: true });
    setNewRoom("");
    await load();
  };

  const removeRoom = async (r) => {
    if (!confirm(`Delete room "${r.name}"?`)) return;
    await base44.entities.RoomOption.delete(r.id);
    await load();
  };

  const startEdit = (r) => { setEditingId(r.id); setEditName(r.name); };
  const cancelEdit = () => { setEditingId(null); setEditName(""); };
  const saveEdit = async (r) => {
    const newName = editName.trim();
    if (!newName) { alert("Room name is required."); return; }
    const oldName = r.name;
    if (newName !== oldName) {
      await base44.entities.RoomOption.update(r.id, { name: newName });
      const linked = await base44.entities.QuotationRoom.filter({ room_name: oldName });
      if (linked.length) {
        await base44.entities.QuotationRoom.bulkUpdate(linked.map((qr) => ({ id: qr.id, room_name: newName })));
      }
    }
    cancelEdit();
    await load();
  };

  const toggle = async (r) => {
    await base44.entities.RoomOption.update(r.id, { is_active: !r.is_active });
    await load();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;
    const sorted = [...rooms].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const [moved] = sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved);
    await base44.entities.RoomOption.bulkUpdate(sorted.map((r, i) => ({ id: r.id, order: i })));
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;

  const sorted = [...rooms].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-lg text-charcoal">4. Scope of Work — Room Options</h3>
        <p className="text-xs text-gray-500 mt-1">Manage the room dropdown used when creating a quotation. "Custom" is always available inline. Drag the grip handle to reorder.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Input
            value={newRoom}
            onChange={e => setNewRoom(e.target.value)}
            placeholder="Add a room option (e.g. Study)"
            className="text-sm"
            onKeyDown={e => e.key === "Enter" && addRoom()}
          />
          <Button onClick={addRoom} size="sm" className="flex items-center gap-1 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Room
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="rooms">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {sorted.map((r, index) => (
                  <Draggable key={r.id} draggableId={r.id} index={index}>
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className="flex items-center justify-between bg-gray-50 rounded px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing flex items-center">
                            <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                          </span>
                          <span className="text-xs text-gray-400 w-5">{index + 1}.</span>
                          {editingId === r.id ? (
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm max-w-xs" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(r); if (e.key === "Escape") cancelEdit(); }} />
                          ) : (
                            <span className={`text-sm font-medium ${r.is_active ? "text-charcoal" : "text-gray-400"}`}>{r.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {editingId === r.id ? (
                            <>
                              <button onClick={() => saveEdit(r)} className="text-green-600 hover:text-green-700" title="Save"><Check className="w-4 h-4" /></button>
                              <button onClick={cancelEdit} className="text-gray-400 hover:text-charcoal" title="Cancel"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mr-2">
                                <span className={r.is_active ? "text-green-600" : "text-gray-400"}>{r.is_active ? "Active" : "Hidden"}</span>
                                <Switch checked={r.is_active} onCheckedChange={() => toggle(r)} className="scale-75" />
                              </div>
                              <button onClick={() => startEdit(r)} title="Edit"><Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-charcoal" /></button>
                              <button onClick={() => removeRoom(r)}><Trash2 className="w-4 h-4 text-red-300 hover:text-red-500" /></button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}