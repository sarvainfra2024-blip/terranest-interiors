import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";

/**
 * Reusable admin CRUD page.
 * Props:
 *   entityName: string
 *   title: string
 *   fields: [{ key, label, type: 'text'|'textarea'|'number'|'select'|'image'|'list', options?, placeholder? }]
 *   listColumns: [{ key, label }] — shown in the table
 */
export default function CrudPage({ entityName, title, fields, listColumns }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities[entityName]
      .list("-created_date", 100)
      .then((recs) => setItems(recs || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const blank = () => {
    const obj = {};
    fields.forEach((f) => {
      if (f.type === "list") obj[f.key] = [];
      else if (f.type === "number") obj[f.key] = f.default ?? 0;
      else if (f.type === "boolean") obj[f.key] = false;
      else obj[f.key] = "";
    });
    return obj;
  };

  const handleNew = () => setEditing(blank());
  const handleEdit = (item) => setEditing({ ...item });
  const handleClose = () => setEditing(null);

  const update = (key, val) => setEditing((e) => ({ ...e, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        const { id, created_date, updated_date, created_by_id, ...data } = editing;
        await base44.entities[entityName].update(editing.id, data);
      } else {
        await base44.entities[entityName].create(editing);
      }
      setEditing(null);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      await base44.entities[entityName].delete(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const renderField = (f) => {
    const val = editing?.[f.key];
    switch (f.type) {
      case "textarea":
        return (
          <textarea
            value={val || ""}
            onChange={(e) => update(f.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={val ?? 0}
            onChange={(e) => update(f.key, Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
          />
        );
      case "boolean":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!val}
              onChange={(e) => update(f.key, e.target.checked)}
              className="w-4 h-4 accent-yellow-600"
            />
            <span className="text-sm text-gray-600">Yes</span>
          </label>
        );
      case "select":
        return (
          <select
            value={val || ""}
            onChange={(e) => update(f.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
          >
            <option value="">Select...</option>
            {f.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        );
      case "image":
        return (
          <ImageUpload
            label={f.label}
            value={val}
            onChange={(v) => update(f.key, v)}
          />
        );
      case "list":
        return (
          <div>
            <div className="space-y-2 mb-2">
              {(val || []).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const arr = [...(val || [])];
                      arr[i] = e.target.value;
                      update(f.key, arr);
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                  />
                  <button
                    onClick={() => update(f.key, (val || []).filter((_, idx) => idx !== i))}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => update(f.key, [...(val || []), ""])}
              className="text-xs text-gold hover:underline"
            >
              + Add item
            </button>
          </div>
        );
      default:
        return (
          <input
            type="text"
            value={val || ""}
            onChange={(e) => update(f.key, e.target.value)}
            placeholder={f.placeholder || ""}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
          />
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-charcoal">{title}</h2>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-white text-sm font-body rounded-sm hover:bg-gold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No items yet. Click "Add New" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-offwhite">
                {listColumns.map((c) => (
                  <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {c.label}
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-offwhite transition-colors">
                  {listColumns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-sm text-charcoal">
                      {c.key === "image" && item[c.key] ? (
                        <div className="w-12 h-12 rounded-sm overflow-hidden bg-beige">
                          <img src={item[c.key]} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : c.key === "featured" ? (
                        item[c.key] ? "★" : "—"
                      ) : (
                        <span className="line-clamp-1">{String(item[c.key] ?? "—")}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-gold transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-sm w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-heading text-lg text-charcoal">
                {editing.id ? "Edit" : "Add New"} {title.replace(/s$/, "")}
              </h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {fields.map((f) => (
                <div key={f.key}>
                  {f.type !== "image" && f.type !== "list" && f.type !== "boolean" && (
                    <label className="block text-sm font-medium text-charcoal mb-1">{f.label}</label>
                  )}
                  {f.type === "boolean" ? (
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">{f.label}</label>
                      {renderField(f)}
                    </div>
                  ) : (
                    renderField(f)
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-500 hover:text-charcoal">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gold text-white text-sm font-body rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}