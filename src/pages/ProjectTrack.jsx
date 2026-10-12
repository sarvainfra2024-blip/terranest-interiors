import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Loader2, AlertCircle, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { MILESTONE_BY_NAME, STAGE_STATUS_COLOR } from "@/lib/projectConstants";

const STATUS_ICON = { "Not Started": Clock, "In Progress": Loader2, "Completed": CheckCircle, "Delayed": AlertCircle };
const STATUS_COLOR = { "Not Started": "text-gray-400", "In Progress": "text-blue-500", "Completed": "text-green-500", "Delayed": "text-red-500" };

export default function ProjectTrack() {
  const { token } = useParams();
  const { settings } = useSiteSettings();
  const [project, setProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [docs, setDocs] = useState([]);
  const [pays, setPays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const recs = await base44.entities.ClientProject.filter({ tracking_token: token }, undefined, 5);
        if (!recs || recs.length === 0) {
          setError("Invalid or expired tracking link.");
          setLoading(false);
          return;
        }
        const p = recs[0];
        setProject(p);
        const pid = p.id;
        const [st, ph, dc, py] = await Promise.all([
          base44.entities.ProjectStage.filter({ project_id: pid }, "order", 100),
          base44.entities.ProjectPhoto.filter({ project_id: pid }, "-created_date", 200),
          base44.entities.ProjectDocument.filter({ project_id: pid }, "-created_date", 200),
          base44.entities.ProjectPayment.filter({ project_id: pid }, "-created_date", 200),
        ]);
        setStages(st || []); setPhotos(ph || []); setDocs(dc || []); setPays(py || []);
      } catch (e) {
        setError("Could not load project.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <Full><div className="w-10 h-10 border-4 border-gray-200 border-t-gold rounded-full animate-spin" /></Full>;
  if (error) return <Full><div className="text-center"><AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" /><p className="text-gray-500">{error}</p><Link to="/" className="text-gold text-sm mt-4 inline-block">Back to Home</Link></div></Full>;

  const total = project.estimated_value || 0;
  const paid = pays.reduce((s, p) => s + (p.amount || 0), 0);
  const pending = Math.max(total - paid, 0);
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="pt-24 md:pt-28 container-luxe py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <p className="label-tech text-gold mb-2">Welcome, {project.client_name}</p>
          <h1 className="font-heading text-3xl text-charcoal mb-1">{project.project_id}</h1>
          <p className="text-gray-500">{project.project_name || project.property_type} • {project.interior_package}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
            <Info label="Designer" value={project.designer_assigned || "-"} />
            <Info label="Project Manager" value={project.project_manager || "-"} />
            <Info label="Start Date" value={project.start_date || "-"} />
            <Info label="Completion" value={project.completion_date || "-"} />
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Overall Progress</span><span className="text-gold font-semibold">{project.overall_progress || 0}% — {project.status_stage || "Project Created"}</span></div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${project.overall_progress || 0}%` }} transition={{ duration: 1 }} className="h-full bg-gold rounded-full" /></div>
          </div>
        </motion.div>

        <Section title={settings.welcome_onboard_title || "Welcome Onboard"}>
          <div className="bg-white rounded-lg border border-gold/30 p-6">
            <p className="text-gray-600 leading-relaxed">{settings.welcome_onboard_message || "Welcome to your dedicated project portal. Track every stage of your interior journey here, from initial measurement to final handover."}</p>
          </div>
        </Section>

        <Section title="Project Milestones">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stages.map((s) => {
              const pct = MILESTONE_BY_NAME[s.name] ?? 0;
              const current = s.name === (project.status_stage || "Project Created");
              const done = s.status === "Completed";
              return (
                <div key={s.id} className={`rounded-sm border p-3 text-center ${current ? "border-gold bg-gold/10" : done ? "border-green-200 bg-green-50" : "border-gray-100 bg-white"}`}>
                  <p className="text-xs font-semibold text-charcoal">{s.name}</p>
                  <p className={`text-xs ${current || done ? "text-green-500" : "text-gray-400"}`}>{pct}%{current ? " • Current" : done ? " • Done" : ""}</p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Project Timeline">
          <div className="space-y-3">
            {stages.map((s, i) => {
              const pct = MILESTONE_BY_NAME[s.name] ?? 0;
              const color = STAGE_STATUS_COLOR[s.status] || STAGE_STATUS_COLOR["Not Started"];
              const isCurrent = s.name === (project.status_stage || "Project Created");
              const stagePhotos = photos.filter((p) => p.stage === s.name);
              return (
                <div key={s.id} className={`flex items-start gap-3 bg-white rounded-sm border p-4 ${isCurrent ? "border-gold" : "border-gray-100"}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color.dot}`}><span className="text-white text-xs font-semibold">{i + 1}</span></div>
                    {i < stages.length - 1 && <div className="w-px h-6 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-charcoal">{s.name}</p>
                      {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold font-semibold">Current</span>}
                      <span className={`text-xs ${color.text}`}>{s.status}</span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {s.planned_start_date && <span>Planned: {new Date(s.planned_start_date).toLocaleDateString()} → {new Date(s.planned_end_date).toLocaleDateString()}</span>}
                      {s.actual_completion_date && <span className="text-green-500">Completed: {new Date(s.actual_completion_date).toLocaleDateString()}</span>}
                    </div>
                    {s.status === "Delayed" && s.delay_reason && <p className="text-xs text-red-500 mt-1">⚠ Delay: {s.delay_reason}</p>}
                    {s.notes && <p className="text-sm text-gray-500 mt-1">{s.notes}</p>}
                    {stagePhotos.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {stagePhotos.map((p) => <img key={p.id} src={p.image_url} alt={p.caption || ""} className="w-16 h-16 object-cover rounded-sm border border-gray-100" />)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {photos.length > 0 && (
          <Section title="Progress Photos">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="rounded-sm overflow-hidden border border-gray-100 bg-white">
                  <img src={p.image_url} alt={p.caption || ""} className="w-full h-32 object-cover" />
                  <div className="p-2"><p className="text-xs font-semibold text-charcoal">{p.stage}</p><p className="text-xs text-gold">{p.photo_type}</p>{p.caption && <p className="text-xs text-gray-500">{p.caption}</p>}<p className="text-xs text-gray-400">{p.date}</p></div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {docs.length > 0 && (
          <Section title="Documents">
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id} className="bg-white rounded-sm border border-gray-100 p-3 flex items-center gap-3">
                  <span className="text-sm font-semibold text-charcoal w-40">{d.doc_type}</span>
                  <span className="text-xs text-gray-400 flex-1">{d.date}</span>
                  <a href={d.file_url} target="_blank" rel="noreferrer" className="text-gold hover:text-charcoal inline-flex items-center gap-1 text-sm"><Download className="w-4 h-4" /> Download</a>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Payment Tracking">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Stat label="Total Cost" value={`₹${total.toLocaleString()}`} />
            <Stat label="Paid" value={`₹${paid.toLocaleString()}`} cls="text-green-600" />
            <Stat label="Pending" value={`₹${pending.toLocaleString()}`} cls="text-red-500" />
          </div>
          {pays.length > 0 && (
            <div className="space-y-2">
              {pays.map((p) => (
                <div key={p.id} className="bg-white rounded-sm border border-gray-100 p-3 flex items-center gap-3">
                  <span className="text-sm font-semibold text-charcoal w-28">₹{p.amount?.toLocaleString()}</span>
                  <span className="text-xs text-gold">{p.payment_type}</span>
                  <span className="text-xs text-gray-400 flex-1">{p.method} • {p.date}</span>
                  {p.receipt_url && <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-gold"><Download className="w-4 h-4" /></a>}
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="text-center mt-10 text-sm text-gray-400">
          <p>Need help? Call {settings.phone || "-"} or email {settings.email || "-"}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Full({ children }) { return <div className="min-h-screen flex items-center justify-center bg-offwhite">{children}</div>; }
function Info({ label, value }) { return <div><p className="text-xs text-gray-400">{label}</p><p className="text-sm text-charcoal font-medium">{value}</p></div>; }
function Section({ title, children }) { return <div className="mb-8"><h2 className="font-heading text-xl text-charcoal mb-3">{title}</h2>{children}</div>; }
function Stat({ label, value, cls }) { return <div className="bg-white rounded-sm border border-gray-100 p-3 text-center"><p className="text-xs text-gray-400">{label}</p><p className={`font-heading text-lg ${cls || "text-charcoal"}`}>{value}</p></div>; }