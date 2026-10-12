import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
      <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InlineInput({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-2 py-1 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold ${className}`}
    />
  );
}

// --- Team Members ---
function TeamSection() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    base44.entities.TeamMember.list("order", 50).then(setMembers);
  }, []);

  const add = async () => {
    const rec = await base44.entities.TeamMember.create({ name: "New Member", role: "Role", experience: "0 years", order: members.length + 1 });
    setMembers((m) => [...m, rec]);
  };

  const update = (id, field, val) => setMembers((m) => m.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const save = async (member) => {
    await base44.entities.TeamMember.update(member.id, { name: member.name, role: member.role, experience: member.experience, order: member.order });
  };

  const remove = async (id) => {
    if (!confirm("Delete this team member?")) return;
    await base44.entities.TeamMember.delete(id);
    setMembers((m) => m.filter((r) => r.id !== id));
  };

  return (
    <Section title="👥 Team Members">
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-2 flex-wrap">
            <InlineInput value={m.name} onChange={(v) => update(m.id, "name", v)} placeholder="Name" className="flex-1 min-w-32" />
            <InlineInput value={m.role} onChange={(v) => update(m.id, "role", v)} placeholder="Role" className="flex-1 min-w-32" />
            <InlineInput value={m.experience} onChange={(v) => update(m.id, "experience", v)} placeholder="e.g. 12 years" className="w-28" />
            <button onClick={() => save(m)} className="p-1.5 text-gold hover:bg-gold/10 rounded-sm transition-colors"><Save className="w-4 h-4" /></button>
            <button onClick={() => remove(m.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-4 flex items-center gap-1 text-sm text-gold hover:underline">
        <Plus className="w-4 h-4" /> Add Member
      </button>
    </Section>
  );
}

// --- Company Values ---
function ValuesSection() {
  const [values, setValues] = useState([]);

  useEffect(() => {
    base44.entities.CompanyValue.list("order", 20).then(setValues);
  }, []);

  const add = async () => {
    const rec = await base44.entities.CompanyValue.create({ title: "New Value", description: "Description", icon: "Star", order: values.length + 1 });
    setValues((v) => [...v, rec]);
  };

  const update = (id, field, val) => setValues((v) => v.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const save = async (val) => {
    await base44.entities.CompanyValue.update(val.id, { title: val.title, description: val.description, icon: val.icon, order: val.order });
  };

  const remove = async (id) => {
    if (!confirm("Delete this value?")) return;
    await base44.entities.CompanyValue.delete(id);
    setValues((v) => v.filter((r) => r.id !== id));
  };

  return (
    <Section title="💡 Core Values">
      <p className="text-xs text-gray-400 mb-3">Icon: use any Lucide icon name (e.g. Target, Heart, Eye, Users, Star)</p>
      <div className="space-y-3">
        {values.map((v) => (
          <div key={v.id} className="flex items-center gap-2 flex-wrap">
            <InlineInput value={v.icon} onChange={(val) => update(v.id, "icon", val)} placeholder="Icon" className="w-24" />
            <InlineInput value={v.title} onChange={(val) => update(v.id, "title", val)} placeholder="Title" className="w-32" />
            <InlineInput value={v.description} onChange={(val) => update(v.id, "description", val)} placeholder="Description" className="flex-1 min-w-40" />
            <button onClick={() => save(v)} className="p-1.5 text-gold hover:bg-gold/10 rounded-sm transition-colors"><Save className="w-4 h-4" /></button>
            <button onClick={() => remove(v.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-4 flex items-center gap-1 text-sm text-gold hover:underline">
        <Plus className="w-4 h-4" /> Add Value
      </button>
    </Section>
  );
}

// --- Milestones ---
function MilestonesSection() {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    base44.entities.Milestone.list("order", 50).then(setMilestones);
  }, []);

  const add = async () => {
    const rec = await base44.entities.Milestone.create({ year: "2025", event: "New milestone.", order: milestones.length + 1 });
    setMilestones((m) => [...m, rec]);
  };

  const update = (id, field, val) => setMilestones((m) => m.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const save = async (ms) => {
    await base44.entities.Milestone.update(ms.id, { year: ms.year, event: ms.event, order: ms.order });
  };

  const remove = async (id) => {
    if (!confirm("Delete this milestone?")) return;
    await base44.entities.Milestone.delete(id);
    setMilestones((m) => m.filter((r) => r.id !== id));
  };

  return (
    <Section title="🗓️ Journey Milestones">
      <div className="space-y-3">
        {milestones.map((ms) => (
          <div key={ms.id} className="flex items-center gap-2">
            <InlineInput value={ms.year} onChange={(v) => update(ms.id, "year", v)} placeholder="Year" className="w-20" />
            <InlineInput value={ms.event} onChange={(v) => update(ms.id, "event", v)} placeholder="Event description" className="flex-1" />
            <button onClick={() => save(ms)} className="p-1.5 text-gold hover:bg-gold/10 rounded-sm transition-colors"><Save className="w-4 h-4" /></button>
            <button onClick={() => remove(ms.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-4 flex items-center gap-1 text-sm text-gold hover:underline">
        <Plus className="w-4 h-4" /> Add Milestone
      </button>
    </Section>
  );
}

export default function AdminAbout() {
  return (
    <div className="max-w-3xl">
      <h2 className="font-heading text-2xl text-charcoal mb-6">About Page Content</h2>
      <TeamSection />
      <ValuesSection />
      <MilestonesSection />
    </div>
  );
}