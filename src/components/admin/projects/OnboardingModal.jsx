import React, { useState } from "react";
import { X, Loader2, CheckCircle, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { generateProjectId, genTrackingToken, DEFAULT_STAGES, PROPERTY_TYPES, PACKAGES, PROJECT_DURATIONS, generateMilestoneDates } from "@/lib/projectConstants";
import { emailSignatureHtml } from "@/lib/emailSignature";

export default function OnboardingModal({ lead, onClose }) {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({
    client_name: lead?.name || "",
    email: lead?.email || "",
    mobile: lead?.phone || "",
    alt_mobile: "",
    address: "",
    city: lead?.location || "",
    state: "",
    pincode: "",
    project_name: "",
    property_type: lead?.property_type || "2 BHK",
    interior_package: lead?.budget || "Premium",
    project_duration: 45,
    project_manager: "",
    designer_assigned: "",
    sales_executive: "",
    estimated_value: 0,
    start_date: "",
    completion_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.client_name || !form.email || !form.mobile) {
      setError("Client name, email and mobile are required.");
      return;
    }
    setSubmitting(true);
    try {
      const project_id = await generateProjectId();
      const tracking_token = genTrackingToken();
      const project = await base44.entities.ClientProject.create({
        ...form,
        project_id,
        tracking_token,
        status: "Planning",
        status_stage: "Project Created",
        overall_progress: 0,
        lead_id: lead?.id || "",
      });
      const milestoneData = generateMilestoneDates(form.start_date, form.project_duration || 45);
      await base44.entities.ProjectStage.bulkCreate(
        milestoneData.map((m, i) => ({
          project_id: project.id,
          name: m.name,
          status: m.status,
          order: i + 1,
          planned_start_date: m.planned_start_date,
          planned_end_date: m.planned_end_date,
          actual_completion_date: m.status === "Completed" ? new Date().toISOString() : null,
          completed_at: m.status === "Completed" ? new Date().toISOString() : null,
        }))
      );
      const origin = window.location.origin;
      const trackLink = `${origin}/project-track/${tracking_token}`;
      const welcomeTitle = settings.welcome_onboard_title || "Welcome Onboard";
      const welcomeMsg = settings.welcome_onboard_message || `Welcome to ${settings.company_name || "our Interior Design Family"}. Your project has been successfully created.`;
      await base44.integrations.Core.SendEmail({
        to: form.email,
        subject: settings.welcome_onboard_subject || `Welcome Onboard! Your Project ${project_id} Has Been Created`,
        body: `<p>Hello ${form.client_name},</p>
          <h2>${welcomeTitle}</h2>
          <p>${welcomeMsg}</p>
          <h3>Project Details</h3>
          <p><strong>Project ID:</strong> ${project_id}<br/>
          <strong>Project Name:</strong> ${form.project_name || "-"}<br/>
          <strong>Project Manager:</strong> ${form.project_manager || "-"}<br/>
          <strong>Designer:</strong> ${form.designer_assigned || "-"}<br/>
          <strong>Start Date:</strong> ${form.start_date || "-"}<br/>
          <strong>Estimated Completion:</strong> ${form.completion_date || "-"}</p>
          <p><strong>Track Your Project:</strong><br/><a href="${trackLink}">${trackLink}</a></p>
          <p><strong>Need Assistance?</strong><br/>Phone: ${settings.phone || "-"}<br/>Email: ${settings.email || "-"}</p>
          <p>Thank you for choosing us.</p>${emailSignatureHtml(settings)}`,
      });
      if (lead?.id) {
        await base44.entities.Lead.update(lead.id, { status: "Converted" });
      }
      setResult({ project_id, tracking_token, trackLink });
    } catch (e) {
      setError(e.message || "Failed to onboard client.");
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (txt) => navigator.clipboard?.writeText(txt);
  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-heading text-lg text-charcoal">Onboard New Client</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-charcoal"><X className="w-5 h-5" /></button>
        </div>

        {result ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h4 className="font-heading text-xl">Client Onboarded Successfully!</h4>
            <p className="text-sm text-gray-500">Project ID: <strong className="text-charcoal">{result.project_id}</strong></p>
            <div className="bg-offwhite rounded p-3 text-left text-sm">
              <p className="mb-1 text-gray-500">Tracking Link (sent to client email):</p>
              <div className="flex items-center gap-2">
                <span className="break-all text-gold">{result.trackLink}</span>
                <button onClick={() => copy(result.trackLink)} className="text-gold hover:text-charcoal flex-shrink-0"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
            <button onClick={onClose} className="px-5 py-2 bg-gold text-white rounded-sm text-sm">Done</button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">Client Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Client Name *"><input className={inputCls} value={form.client_name} onChange={(e) => set("client_name", e.target.value)} /></Field>
                <Field label="Email *"><input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                <Field label="Mobile *"><input className={inputCls} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field>
                <Field label="Alternate Mobile"><input className={inputCls} value={form.alt_mobile} onChange={(e) => set("alt_mobile", e.target.value)} /></Field>
                <Field label="Property Address" full><input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
                <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
                <Field label="State"><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
                <Field label="Pincode"><input className={inputCls} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></Field>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">Project Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Project Name"><input className={inputCls} value={form.project_name} onChange={(e) => set("project_name", e.target.value)} /></Field>
                <Field label="Property Type"><select className={inputCls} value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>{PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}</select></Field>
                <Field label="Interior Package"><select className={inputCls} value={form.interior_package} onChange={(e) => set("interior_package", e.target.value)}>{PACKAGES.map((p) => <option key={p}>{p}</option>)}</select></Field>
                <Field label="Project Duration"><select className={inputCls} value={form.project_duration} onChange={(e) => set("project_duration", Number(e.target.value))}>{PROJECT_DURATIONS.map((d) => <option key={d} value={d}>{d} Days</option>)}</select></Field>
                <Field label="Project Manager"><input className={inputCls} value={form.project_manager} onChange={(e) => set("project_manager", e.target.value)} /></Field>
                <Field label="Designer Assigned"><input className={inputCls} value={form.designer_assigned} onChange={(e) => set("designer_assigned", e.target.value)} /></Field>
                <Field label="Sales Executive"><input className={inputCls} value={form.sales_executive} onChange={(e) => set("sales_executive", e.target.value)} /></Field>
                <Field label="Estimated Project Value (₹)"><input type="number" className={inputCls} value={form.estimated_value} onChange={(e) => set("estimated_value", Number(e.target.value))} /></Field>
                <Field label="Estimated Start Date"><input type="date" className={inputCls} value={form.start_date} onChange={(e) => set("start_date", e.target.value)} /></Field>
                <Field label="Estimated Completion Date"><input type="date" className={inputCls} value={form.completion_date} onChange={(e) => set("completion_date", e.target.value)} /></Field>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-charcoal">Cancel</button>
              <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 bg-gold text-white rounded-sm text-sm disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Onboard & Send Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}