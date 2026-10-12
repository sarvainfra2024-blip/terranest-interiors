import React, { useState } from "react";
import { Loader2, Save, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PROPERTY_TYPES, PACKAGES, PROJECT_STATUSES, PROJECT_MILESTONES, MILESTONE_BY_NAME, PROJECT_DURATIONS, generateMilestoneDates } from "@/lib/projectConstants";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { emailSignatureHtml } from "@/lib/emailSignature";

export default function ProjectInfoTab({ project }) {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ ...project });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold";

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.ClientProject.update(project.id, form);
      if (form.start_date && form.project_duration && form.project_duration !== project.project_duration) {
        const stages = await base44.entities.ProjectStage.filter({ project_id: project.id }, "order", 100);
        const dates = generateMilestoneDates(form.start_date, form.project_duration);
        const updates = stages.map((s) => {
          const d = dates[(s.order || 1) - 1];
          if (!d || s.status === "Completed" || s.status === "Cancelled") return null;
          return { id: s.id, planned_start_date: d.planned_start_date, planned_end_date: d.planned_end_date };
        }).filter(Boolean);
        if (updates.length) await base44.entities.ProjectStage.bulkUpdate(updates);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const notify = async () => {
    setSending(true);
    try {
      const link = `${window.location.origin}/project-track/${project.tracking_token}`;
      await base44.integrations.Core.SendEmail({
        to: project.email,
        subject: `Project Update: ${project.project_id}`,
        body: `<p>Hello ${project.client_name},</p><p>Your project <strong>${project.project_id}</strong> status is now <strong>${form.status}</strong> (${form.overall_progress || 0}% complete).</p><p>Track here: <a href="${link}">${link}</a></p>${emailSignatureHtml(settings)}`,
      });
      alert("Notification sent to client.");
    } catch (e) {
      alert("Failed: " + (e.message || e));
    } finally {
      setSending(false);
    }
  };

  const fields = [
    ["client_name", "Client Name", "text"], ["email", "Email", "email"], ["mobile", "Mobile", "text"], ["alt_mobile", "Alt Mobile", "text"],
    ["address", "Address", "text"], ["city", "City", "text"], ["state", "State", "text"], ["pincode", "Pincode", "text"],
    ["project_name", "Project Name", "text"], ["project_manager", "Project Manager", "text"], ["designer_assigned", "Designer", "text"], ["sales_executive", "Sales Executive", "text"],
    ["estimated_value", "Estimated Value (₹)", "number"], ["start_date", "Start Date", "date"], ["completion_date", "Completion Date", "date"],
  ];

  return (
    <div className="bg-white rounded-sm border border-gray-100 p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(([k, l, t]) => (
          <div key={k}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
            <input type={t} className={inputCls} value={form[k] || ""} onChange={(e) => set(k, t === "number" ? Number(e.target.value) : e.target.value)} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
          <select className={inputCls} value={form.property_type || "2 BHK"} onChange={(e) => set("property_type", e.target.value)}>{PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Package</label>
          <select className={inputCls} value={form.interior_package || "Premium"} onChange={(e) => set("interior_package", e.target.value)}>{PACKAGES.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Project Duration (days)</label>
          <select className={inputCls} value={form.project_duration || 45} onChange={(e) => set("project_duration", Number(e.target.value))}>{PROJECT_DURATIONS.map((d) => <option key={d} value={d}>{d} Days</option>)}</select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select className={inputCls} value={form.status || "Planning"} onChange={(e) => set("status", e.target.value)}>{PROJECT_STATUSES.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Project Stage</label>
          <select className={inputCls} value={form.status_stage || "Project Created"} onChange={(e) => { const stage = e.target.value; set("status_stage", stage); set("overall_progress", MILESTONE_BY_NAME[stage] ?? form.overall_progress); }}>{PROJECT_MILESTONES.map((m) => <option key={m.stage} value={m.stage}>{m.stage} ({m.progress}%)</option>)}</select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Overall Progress (%)</label>
          <input type="number" min={0} max={100} className={inputCls} value={form.overall_progress || 0} onChange={(e) => set("overall_progress", Number(e.target.value))} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-gold text-white rounded-sm text-sm disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button>
        <button onClick={notify} disabled={sending} className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold rounded-sm text-sm disabled:opacity-50">{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Update Email</button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}