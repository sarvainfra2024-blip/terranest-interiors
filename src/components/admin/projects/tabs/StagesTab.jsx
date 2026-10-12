import React, { useEffect, useState } from "react";
import { Loader2, Save, Undo2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { STAGE_STATUSES, MILESTONE_BY_NAME, STAGE_STATUS_COLOR } from "@/lib/projectConstants";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { emailSignatureHtml } from "@/lib/emailSignature";

export default function StagesTab({ project }) {
  const { settings } = useSiteSettings();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [user, setUser] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    base44.entities.ProjectStage.filter({ project_id: project.id }, "order", 100)
      .then(setStages)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => { base44.auth.me().then((u) => setUser(u.full_name || u.email || "Admin")).catch(() => {}); }, []);

  const update = (id, field, val) => setStages((s) => s.map((r) => (r.id === id ? { ...r, [field]: val } : r)));

  const sendStageEmail = async (stage) => {
    if (!project.email) return;
    const pct = MILESTONE_BY_NAME[stage.name] ?? 0;
    const subject = `Project Update — ${stage.name} (${stage.status}) — ${project.project_id}`;
    const body = `<p>Hello ${project.client_name},</p><p>Your project stage has been updated.</p><p>Project: <strong>${project.project_id}</strong><br/>Stage: <strong>${stage.name}</strong><br/>Status: <strong>${stage.status}</strong><br/>Overall Progress: ${pct}%</p>${stage.delay_reason ? `<p><em>Delay Reason:</em> ${stage.delay_reason}</p>` : ""}${stage.notes ? `<p><em>Remarks:</em> ${stage.notes}</p>` : ""}<p>Planned: ${stage.planned_start_date || "-"} → ${stage.planned_end_date || "-"}${stage.actual_completion_date ? `<br/>Completed On: ${new Date(stage.actual_completion_date).toLocaleString()}` : ""}</p><p>Track your project: <a href="${window.location.origin}/project-track/${project.tracking_token}">${window.location.origin}/project-track/${project.tracking_token}</a></p>${emailSignatureHtml(settings)}`;
    try { await base44.integrations.Core.SendEmail({ to: project.email, subject, body }); } catch (e) { console.error(e); }
  };

  const syncProject = async (stagesList) => {
    const ordered = [...stagesList].sort((a, b) => (a.order || 0) - (b.order || 0));
    let maxCompleted = 0;
    for (const s of ordered) {
      if (s.status === "Completed") maxCompleted = Math.max(maxCompleted, MILESTONE_BY_NAME[s.name] ?? 0);
    }
    const inProg = ordered.find((s) => s.status === "In Progress");
    const firstNotDone = ordered.find((s) => s.status !== "Completed" && s.status !== "Cancelled");
    const current = inProg || firstNotDone || ordered[ordered.length - 1] || { name: "Project Created" };
    await base44.entities.ClientProject.update(project.id, { status_stage: current.name, overall_progress: maxCompleted });
  };

  const shiftDates = (list, fromId, days) => {
    const ordered = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = ordered.findIndex((s) => s.id === fromId);
    const ids = new Set(ordered.slice(idx).map((s) => s.id));
    return list.map((s) => {
      if (!ids.has(s.id) || !s.planned_start_date || !s.planned_end_date) return s;
      const ns = new Date(s.planned_start_date); ns.setDate(ns.getDate() + days);
      const ne = new Date(s.planned_end_date); ne.setDate(ne.getDate() + days);
      return { ...s, planned_start_date: ns.toISOString().slice(0, 10), planned_end_date: ne.toISOString().slice(0, 10) };
    });
  };

  const save = async (stage) => {
    setSaving(stage.id);
    const isComplete = stage.status === "Completed";
    const isDelayed = stage.status === "Delayed";
    const payload = { status: stage.status, notes: stage.notes, delay_reason: isDelayed ? stage.delay_reason : "", updated_by: user };
    if (isComplete && !stage.actual_completion_date) { payload.actual_completion_date = new Date().toISOString(); payload.completed_at = new Date().toISOString(); }
    try {
      await base44.entities.ProjectStage.update(stage.id, payload);
      let working = stages.map((s) => (s.id === stage.id ? { ...s, ...payload } : s));
      if (isDelayed) {
        const daysStr = prompt(`Push "${stage.name}" and all following milestones by how many days?`, "7");
        if (daysStr) {
          const days = parseInt(daysStr, 10);
          if (days > 0) {
            working = shiftDates(working, stage.id, days);
            await base44.entities.ProjectStage.bulkUpdate(working.map((s) => ({ id: s.id, planned_start_date: s.planned_start_date, planned_end_date: s.planned_end_date })));
          }
        }
      }
      setStages(working);
      await syncProject(working);
      await sendStageEmail({ ...stage, ...payload });
      setMsg(`Updated "${stage.name}" and emailed ${project.email}.`);
    } finally { setSaving(null); }
  };

  const undo = async (stage) => {
    if (!confirm(`Revert "${stage.name}" back to Not Started?`)) return;
    setSaving(stage.id);
    const payload = { status: "Not Started", notes: "", delay_reason: "", started_at: null, completed_at: null, actual_completion_date: null, updated_by: user };
    try {
      await base44.entities.ProjectStage.update(stage.id, payload);
      const updated = stages.map((s) => (s.id === stage.id ? { ...s, ...payload } : s));
      setStages(updated);
      await syncProject(updated);
      setMsg(`Reverted "${stage.name}".`);
    } finally { setSaving(null); }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-7 h-7 border-4 border-gray-200 border-t-gold rounded-full animate-spin" /></div>;

  const inputCls = "text-sm border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gold";

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">Milestone dates are auto-generated from the project start date & duration. Mark a milestone <strong>Completed</strong> to update overall progress & notify the client. Set <strong>Delayed</strong> to reschedule following milestones.</p>
      {msg && <p className="text-xs text-green-600">{msg}</p>}
      {stages.map((s, i) => {
        const pct = MILESTONE_BY_NAME[s.name] ?? 0;
        const color = STAGE_STATUS_COLOR[s.status] || STAGE_STATUS_COLOR["Not Started"];
        return (
          <div key={s.id} className="bg-white rounded-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-beige text-charcoal text-xs font-semibold flex items-center justify-center">{i + 1}</span>
              <span className="font-heading text-charcoal flex-1 min-w-[160px]">{s.name}</span>
              <span className="text-xs text-gold font-semibold">{pct}%</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${color.badge}`}>{s.status}</span>
              <select value={s.status} onChange={(e) => update(s.id, "status", e.target.value)} className={inputCls}>
                {STAGE_STATUSES.map((st) => <option key={st}>{st}</option>)}
              </select>
              <button onClick={() => save(s)} disabled={saving === s.id} className="inline-flex items-center gap-1 text-sm text-gold hover:text-charcoal disabled:opacity-50">
                {saving === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
              {s.status !== "Not Started" && (
                <button onClick={() => undo(s)} disabled={saving === s.id} className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-600 disabled:opacity-50"><Undo2 className="w-3.5 h-3.5" /> Undo</button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Planned Start</label>
                <input type="date" value={s.planned_start_date || ""} onChange={(e) => update(s.id, "planned_start_date", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Planned End</label>
                <input type="date" value={s.planned_end_date || ""} onChange={(e) => update(s.id, "planned_end_date", e.target.value)} className={inputCls} />
              </div>
            </div>
            {s.status === "Delayed" && (
              <input value={s.delay_reason || ""} onChange={(e) => update(s.id, "delay_reason", e.target.value)} placeholder="Delay reason…" className="mt-3 w-full text-sm px-2 py-1 border border-red-200 rounded-sm focus:outline-none focus:border-gold" />
            )}
            {s.actual_completion_date && <p className="text-xs text-green-500 mt-2">Completed on {new Date(s.actual_completion_date).toLocaleString()} by {s.updated_by || "Admin"}</p>}
            <input value={s.notes || ""} onChange={(e) => update(s.id, "notes", e.target.value)} placeholder="Remarks…" className="mt-3 w-full text-sm px-2 py-1 border border-gray-100 rounded-sm focus:outline-none focus:border-gold" />
          </div>
        );
      })}
    </div>
  );
}