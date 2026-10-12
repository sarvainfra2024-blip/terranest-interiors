import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, UserPlus, Search, Copy, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import OnboardingModal from "@/components/admin/projects/OnboardingModal";
import ProjectDetailEditor from "@/components/admin/projects/ProjectDetailEditor";

const STATUS_COLOR = {
  Planning: "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Archived: "bg-gray-200 text-gray-500",
};

export default function AdminClientProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");

  const load = () => {
    setLoading(true);
    base44.entities.ClientProject.list("-created_date", 200).then(setProjects).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const deleteProject = async (p) => {
    if (!confirm(`Delete project ${p.project_id}? This removes the project and all its tracking data.`)) return;
    await Promise.all([
      base44.entities.ProjectStage.deleteMany({ project_id: p.id }),
      base44.entities.ProjectPhoto.deleteMany({ project_id: p.id }),
      base44.entities.ProjectDocument.deleteMany({ project_id: p.id }),
      base44.entities.ProjectVideo.deleteMany({ project_id: p.id }),
      base44.entities.ProjectPayment.deleteMany({ project_id: p.id }),
      base44.entities.ProjectMaterial.deleteMany({ project_id: p.id }),
    ]);
    await base44.entities.ClientProject.delete(p.id);
    setProjects((prev) => prev.filter((x) => x.id !== p.id));
  };

  if (selected) return <ProjectDetailEditor project={selected} onBack={() => { setSelected(null); load(); }} />;

  const filtered = projects.filter((p) => {
    const s = q.toLowerCase();
    return !s || (p.project_id || "").toLowerCase().includes(s) || (p.client_name || "").toLowerCase().includes(s) || (p.email || "").toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="font-heading text-2xl text-charcoal">Client Projects</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, name, email…" className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setOnboarding(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-sm text-sm"><UserPlus className="w-4 h-4" /> Onboard Client</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-gold rounded-full animate-spin" /></div> :
        filtered.length === 0 ? <div className="text-center py-20 text-gray-400">No projects yet. Click "Onboard Client" to create one.</div> :
          <div className="space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-sm border border-gray-100 p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-charcoal">{p.project_id}</span>
                    <button onClick={() => navigator.clipboard?.writeText(p.project_id)} className="text-gray-300 hover:text-gold"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                  <p className="text-sm text-gray-500">{p.client_name} • {p.email}</p>
                  <p className="text-xs text-gray-400">{p.property_type} • {p.interior_package} • {p.project_name || "-"}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] || STATUS_COLOR.Planning}`}>{p.status}</span>
                <div className="w-40">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gold" style={{ width: `${p.overall_progress || 0}%` }} /></div>
                  <p className="text-xs text-gray-400 mt-1">{p.overall_progress || 0}% complete</p>
                </div>
                <button onClick={() => setSelected(p)} className="px-4 py-2 border border-gold text-gold rounded-sm text-sm hover:bg-gold hover:text-white transition-colors">Open</button>
                <button onClick={() => deleteProject(p)} className="px-3 py-2 text-red-400 border border-red-200 rounded-sm text-sm hover:bg-red-50 transition-colors" title="Delete project"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>}

      {onboarding && <OnboardingModal onClose={() => { setOnboarding(false); load(); }} />}
    </div>
  );
}