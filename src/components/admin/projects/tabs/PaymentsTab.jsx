import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";

const PAY_TYPES = ["Advance", "Milestone", "Final"];
const METHODS = ["Cash", "UPI", "Bank Transfer", "Card", "Cheque"];

export default function PaymentsTab({ project }) {
  const [pays, setPays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: 0, payment_type: "Advance", method: "UPI", date: new Date().toISOString().slice(0, 10), receipt_url: "", notes: "" });
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.ProjectPayment.filter({ project_id: project.id }, "-created_date", 200).then(setPays).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!form.amount) return alert("Enter amount.");
    setAdding(true);
    try {
      await base44.entities.ProjectPayment.create({ project_id: project.id, ...form });
      setForm((f) => ({ ...f, amount: 0, receipt_url: "", notes: "" }));
      load();
    } finally {
      setAdding(false);
    }
  };
  const remove = async (id) => { if (!confirm("Delete?")) return; await base44.entities.ProjectPayment.delete(id); load(); };

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold";
  const total = project.estimated_value || 0;
  const paid = pays.reduce((s, p) => s + (p.amount || 0), 0);
  const pending = Math.max(total - paid, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total Cost" value={`₹${total.toLocaleString()}`} />
        <Stat label="Paid" value={`₹${paid.toLocaleString()}`} cls="text-green-600" />
        <Stat label="Pending" value={`₹${pending.toLocaleString()}`} cls="text-red-500" />
      </div>
      <div className="bg-white rounded-sm border border-gray-100 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-gold uppercase tracking-wide">Record Payment</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-600 mb-1">Amount (₹)</label><input type="number" className={inputCls} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Type</label><select className={inputCls} value={form.payment_type} onChange={(e) => setForm((f) => ({ ...f, payment_type: e.target.value }))}>{PAY_TYPES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="block text-xs text-gray-600 mb-1">Method</label><select className={inputCls} value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}>{METHODS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="block text-xs text-gray-600 mb-1">Date</label><input type="date" className={inputCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
        </div>
        <input className={inputCls} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Notes" />
        <ImageUpload label="Receipt (optional)" value={form.receipt_url} onChange={(v) => setForm((f) => ({ ...f, receipt_url: v }))} />
        <button onClick={add} disabled={adding} className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-sm text-sm disabled:opacity-50">{adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Record</button>
      </div>
      {loading ? <div className="flex justify-center py-8"><div className="w-7 h-7 border-4 border-gray-200 border-t-gold rounded-full animate-spin" /></div> :
        <div className="space-y-2">
          {pays.map((p) => (
            <div key={p.id} className="bg-white rounded-sm border border-gray-100 p-3 flex items-center gap-3">
              <span className="text-sm font-semibold text-charcoal w-24">₹{p.amount?.toLocaleString()}</span>
              <span className="text-xs text-gold">{p.payment_type}</span>
              <span className="text-xs text-gray-400 flex-1">{p.method} • {p.date}</span>
              {p.receipt_url && <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-gold"><Download className="w-4 h-4" /></a>}
              <button onClick={() => remove(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>}
    </div>
  );
}

function Stat({ label, value, cls }) {
  return (
    <div className="bg-white rounded-sm border border-gray-100 p-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`font-heading text-lg ${cls || "text-charcoal"}`}>{value}</p>
    </div>
  );
}