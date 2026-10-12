import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Download, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";
import { DOC_TYPES } from "@/lib/projectConstants";
import { getSiteSettings, emailSignatureHtml } from "@/lib/emailSignature";

export default function DocumentsTab({ project }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ doc_type: DOC_TYPES[0], file_url: "" });
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.ProjectDocument.filter({ project_id: project.id }, "-created_date", 200).then(setDocs).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!form.file_url) return alert("Upload a file first.");
    setAdding(true);
    try {
      await base44.entities.ProjectDocument.create({ project_id: project.id, ...form, date: new Date().toISOString().slice(0, 10) });
      setForm({ doc_type: form.doc_type, file_url: "" });
      load();
    } finally {
      setAdding(false);
    }
  };
  const remove = async (id) => { if (!confirm("Delete?")) return; await base44.entities.ProjectDocument.delete(id); load(); };

  const [sendingId, setSendingId] = useState(null);
  const sendQuote = async (doc, skipConfirm) => {
    if (!project.email) return alert("Client email is missing. Add it in the Info tab.");
    if (!skipConfirm && !confirm(`Send this ${doc.doc_type} to ${project.email}?`)) return;
    setSendingId(doc.id);
    try {
      const link = `${window.location.origin}/project-track/${project.tracking_token}`;
      const site = await getSiteSettings();
      await base44.integrations.Core.SendEmail({
        to: project.email,
        subject: `${doc.doc_type} for ${project.project_id} - ${project.project_name || project.property_type}`,
        body: `<p>Hello ${project.client_name},</p><p>Please find your <strong>${doc.doc_type}</strong> for project <strong>${project.project_id}</strong> attached below.</p><p><a href="${doc.file_url}" target="_blank" rel="noreferrer" style="display:inline-block;padding:10px 20px;background-color:#C89B3C;color:#fff;text-decoration:none;border-radius:4px;font-weight:600;">View ${doc.doc_type}</a></p><p>You can also track your project progress here: <a href="${link}">${link}</a></p>${emailSignatureHtml(site)}`,
      });
      alert(`${doc.doc_type} sent to ${project.email}.`);
    } catch (e) {
      alert("Failed to send: " + (e.message || e));
    } finally {
      setSendingId(null);
    }
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold";

  const [quoteFile, setQuoteFile] = useState("");
  const [sendingNew, setSendingNew] = useState(false);
  const latestQuote = docs.find((d) => d.doc_type === "Quotation");

  const uploadAndSend = async () => {
    if (!quoteFile) return alert("Please upload a quotation file first.");
    if (!project.email) return alert("Client email is missing. Add it in the Info tab.");
    if (!confirm(`Send this Quotation to ${project.email}?`)) return;
    setSendingNew(true);
    try {
      const saved = await base44.entities.ProjectDocument.create({ project_id: project.id, doc_type: "Quotation", file_url: quoteFile, date: new Date().toISOString().slice(0, 10) });
      await sendQuote(saved, true);
      setQuoteFile("");
      load();
    } finally {
      setSendingNew(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-sm border border-gold/40 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-charcoal">Send Quotation to Client</h4>
            <p className="text-xs text-gray-500">{latestQuote ? `Latest Quotation (${latestQuote.date}) ready to send.` : "Upload a new quotation below to send it."}</p>
          </div>
          {latestQuote && (
            <button onClick={() => sendQuote(latestQuote)} disabled={sendingId === latestQuote.id} className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-sm text-sm disabled:opacity-50">
              {sendingId === latestQuote.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Resend Latest
            </button>
          )}
        </div>
        <div className="pt-3 border-t border-gray-100">
          <ImageUpload label="Upload new Quotation (PDF / Image)" value={quoteFile} onChange={setQuoteFile} />
          <button onClick={uploadAndSend} disabled={!quoteFile || sendingNew} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-sm text-sm disabled:opacity-50">
            {sendingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Upload & Send Quotation
          </button>
        </div>
      </div>
      <div className="bg-white rounded-sm border border-gray-100 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-gold uppercase tracking-wide">Add Document</h4>
        <div><label className="block text-xs text-gray-600 mb-1">Type</label><select className={inputCls} value={form.doc_type} onChange={(e) => setForm((f) => ({ ...f, doc_type: e.target.value }))}>{DOC_TYPES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <ImageUpload label="Document File (PDF / Image)" value={form.file_url} onChange={(v) => setForm((f) => ({ ...f, file_url: v }))} />
        <button onClick={add} disabled={adding} className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-sm text-sm disabled:opacity-50">{adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Document</button>
      </div>
      {loading ? <div className="flex justify-center py-8"><div className="w-7 h-7 border-4 border-gray-200 border-t-gold rounded-full animate-spin" /></div> :
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="bg-white rounded-sm border border-gray-100 p-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-charcoal w-40">{d.doc_type}</span>
              <span className="text-xs text-gray-400 flex-1">{d.date}</span>
              <a href={d.file_url} target="_blank" rel="noreferrer" className="text-gold hover:text-charcoal"><Download className="w-4 h-4" /></a>
              <button onClick={() => sendQuote(d)} disabled={sendingId === d.id} title={`Email this ${d.doc_type} to client`} className="inline-flex items-center gap-1 px-2 py-1 rounded-sm border border-gold text-gold text-xs disabled:opacity-50">
                {sendingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Email
              </button>
              <button onClick={() => remove(d.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>}
    </div>
  );
}