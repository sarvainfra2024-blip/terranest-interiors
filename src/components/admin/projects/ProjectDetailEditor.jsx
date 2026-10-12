import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ProjectInfoTab from "./tabs/ProjectInfoTab";
import StagesTab from "./tabs/StagesTab";
import PhotosTab from "./tabs/PhotosTab";
import DocumentsTab from "./tabs/DocumentsTab";
import PaymentsTab from "./tabs/PaymentsTab";

const TABS = ["Stages", "Info", "Photos", "Documents", "Payments"];

export default function ProjectDetailEditor({ project, onBack }) {
  const [tab, setTab] = useState("Stages");

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>
      <div className="bg-white rounded-sm border border-gray-100 p-5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-xl text-charcoal">{project.project_id}</h3>
            <p className="text-sm text-gray-500">{project.client_name} • {project.project_name || project.property_type}</p>
          </div>
          <span className="text-sm font-body px-3 py-1 rounded-full bg-beige text-charcoal">{project.status} • {project.overall_progress || 0}% • {project.project_duration || 45}d</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-sm text-sm font-body ${tab === t ? "bg-gold text-white" : "bg-white border border-gray-200 text-charcoal hover:border-gold"}`}>{t}</button>
        ))}
      </div>
      {tab === "Info" && <ProjectInfoTab project={project} />}
      {tab === "Stages" && <StagesTab project={project} />}
      {tab === "Photos" && <PhotosTab project={project} />}
      {tab === "Documents" && <DocumentsTab project={project} />}
      {tab === "Payments" && <PaymentsTab project={project} />}
    </div>
  );
}