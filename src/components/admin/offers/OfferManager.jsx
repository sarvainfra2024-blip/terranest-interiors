import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Plus, Pencil, Trash2, Copy, Eye, Gift, Megaphone, Sparkles } from "lucide-react";
import OfferFormModal from "./OfferFormModal";
import OfferPreviewModal from "./OfferPreviewModal";

const today = new Date().toISOString().slice(0, 10);

const statusBadge = (o) => {
  if (!o.is_active) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>;
  if (o.valid_until && o.valid_until < today) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">Expired</span>;
  if (o.valid_from && o.valid_from > today) return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Upcoming</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">Live</span>;
};

export default function OfferManager() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);

  const load = async () => {
    const data = await base44.entities.Offer.list("order");
    setOffers((data || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (form) => {
    if (editing) {
      await base44.entities.Offer.update(editing.id, form);
    } else {
      const maxOrder = offers.reduce((mx, o) => Math.max(mx, o.order ?? 0), -1);
      await base44.entities.Offer.create({ ...form, order: maxOrder + 1 });
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this offer?")) return;
    await base44.entities.Offer.delete(id);
    load();
  };

  const duplicate = async (o) => {
    const { id, created_date, updated_date, created_by_id, order, ...rest } = o;
    const maxOrder = offers.reduce((mx, of) => Math.max(mx, of.order ?? 0), -1);
    await base44.entities.Offer.create({ ...rest, title: `${o.title} (Copy)`, order: maxOrder + 1 });
    load();
  };

  const toggle = async (o, field) => {
    await base44.entities.Offer.update(o.id, { [field]: !o[field] });
    load();
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    const sorted = [...offers];
    const [moved] = sorted.splice(from, 1);
    sorted.splice(to, 0, moved);
    setOffers(sorted);
    await base44.entities.Offer.bulkUpdate(sorted.map((o, i) => ({ id: o.id, order: i })));
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl text-charcoal">Offer Zone</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage promotional offers for the public site.</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Offer
        </Button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Gift className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">No offers yet. Click "Add Offer" to create your first promotional offer.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="offers">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {offers.map((o, index) => (
                  <Draggable key={o.id} draggableId={o.id} index={index}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
                        <div {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                        </div>
                        {o.banner_image ? (
                          <img src={o.banner_image} alt="" className="w-14 h-14 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded bg-beige flex items-center justify-center flex-shrink-0"><Gift className="w-5 h-5 text-gray-300" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-charcoal truncate">{o.title}</p>
                            {statusBadge(o)}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{o.offer_type} {o.valid_until && `· Valid until ${o.valid_until}`}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5 px-2">
                            <span className="text-[10px] text-gray-400">Active</span>
                            <Switch checked={o.is_active} onCheckedChange={() => toggle(o, "is_active")} className="scale-75" />
                          </div>
                          <div className="flex items-center gap-1.5 px-2">
                            <span className="text-[10px] text-gray-400">Public</span>
                            <Switch checked={o.is_public} onCheckedChange={() => toggle(o, "is_public")} className="scale-75" />
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button onClick={() => toggle(o, "show_in_popup")} className={`p-1.5 rounded transition-colors ${o.show_in_popup !== false ? "text-gold" : "text-gray-300 hover:text-gray-400"}`} title="Show in Popup"><Sparkles className="w-4 h-4" /></button>
                            <button onClick={() => toggle(o, "show_in_ticker")} className={`p-1.5 rounded transition-colors ${o.show_in_ticker !== false ? "text-gold" : "text-gray-300 hover:text-gray-400"}`} title="Show in Ticker"><Megaphone className="w-4 h-4" /></button>
                            <button onClick={() => setPreviewing(o)} className="p-1.5 text-gray-400 hover:text-blue-500" title="Preview"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => duplicate(o)} className="p-1.5 text-gray-400 hover:text-gold" title="Duplicate"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => { setEditing(o); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-charcoal" title="Edit"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => remove(o.id)} className="p-1.5 text-gray-400 hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
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
      )}

      {showForm && <OfferFormModal offer={editing} onSave={save} onClose={() => { setShowForm(false); setEditing(null); }} />}
      {previewing && <OfferPreviewModal offer={previewing} onClose={() => setPreviewing(null)} />}
    </div>
  );
}