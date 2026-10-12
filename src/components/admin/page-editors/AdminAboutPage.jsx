import React, { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-6 mb-6">
      <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InlineInput({ value, onChange, placeholder, className = "" }) {
  return (
    <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`px-2 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold ${className}`} />
  );
}

function TeamSection() {
  const [members, setMembers] = useState([]);
  useEffect(() => { base44.entities.TeamMember.list("order", 50).then(setMembers); }, []);
  const add = async () => {
    const rec = await base44.entities.TeamMember.create({ name: "New Member", role: "Role", experience: "0 years", order: members.length + 1 });
    setMembers((m) => [...m, rec]);
  };
  const update = (id, field, val) => setMembers((m) => m.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const save = async (member) => { await base44.entities.TeamMember.update(member.id, { name: member.name, role: member.role, experience: member.experience, image: member.image, order: member.order }); };
  const remove = async (id) => { if (!confirm("Delete?")) return; await base44.entities.TeamMember.delete(id); setMembers((m) => m.filter((r) => r.id !== id)); };

  return (
    <Card title="👥 Team Members">
      <div className="space-y-4">
        {members.map((m) => (
          <div key={m.id} className="border border-gray-100 rounded-sm p-3 space-y-2">
            <div className="flex gap-2 flex-wrap">
              <InlineInput value={m.name} onChange={(v) => update(m.id, "name", v)} placeholder="Name" className="flex-1 min-w-32" />
              <InlineInput value={m.role} onChange={(v) => update(m.id, "role", v)} placeholder="Role" className="flex-1 min-w-32" />
              <InlineInput value={m.experience} onChange={(v) => update(m.id, "experience", v)} placeholder="12 years" className="w-28" />
            </div>
            <div className="flex gap-2 items-center">
              <InlineInput value={m.image} onChange={(v) => update(m.id, "image", v)} placeholder="Photo URL" className="flex-1" />
              <button onClick={() => save(m)} className="p-1.5 text-gold hover:bg-gold/10 rounded-sm"><Save className="w-4 h-4" /></button>
              <button onClick={() => remove(m.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-4 flex items-center gap-1 text-sm text-gold hover:underline"><Plus className="w-4 h-4" /> Add Member</button>
    </Card>
  );
}

function ValuesSection() {
  const [values, setValues] = useState([]);
  useEffect(() => { base44.entities.CompanyValue.list("order", 20).then(setValues); }, []);
  const add = async () => {
    const rec = await base44.entities.CompanyValue.create({ title: "New Value", description: "Description", icon: "Star", order: values.length + 1 });
    setValues((v) => [...v, rec]);
  };
  const update = (id, field, val) => setValues((v) => v.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const save = async (val) => { await base44.entities.CompanyValue.update(val.id, { title: val.title, description: val.description, icon: val.icon, order: val.order }); };
  const remove = async (id) => { if (!confirm("Delete?")) return; await base44.entities.CompanyValue.delete(id); setValues((v) => v.filter((r) => r.id !== id)); };

  return (
    <Card title="💡 Core Values">
      <p className="text-xs text-gray-400 mb-3">Icon: Lucide icon name (e.g. Target, Heart, Eye)</p>
      <div className="space-y-3">
        {values.map((v) => (
          <div key={v.id} className="flex items-center gap-2 flex-wrap">
            <InlineInput value={v.icon} onChange={(val) => update(v.id, "icon", val)} placeholder="Icon" className="w-24" />
            <InlineInput value={v.title} onChange={(val) => update(v.id, "title", val)} placeholder="Title" className="w-32" />
            <InlineInput value={v.description} onChange={(val) => update(v.id, "description", val)} placeholder="Description" className="flex-1 min-w-40" />
            <button onClick={() => save(v)} className="p-1.5 text-gold hover:bg-gold/10 rounded-sm"><Save className="w-4 h-4" /></button>
            <button onClick={() => remove(v.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-4 flex items-center gap-1 text-sm text-gold hover:underline"><Plus className="w-4 h-4" /> Add Value</button>
    </Card>
  );
}

function MilestonesSection() {
  const [milestones, setMilestones] = useState([]);
  useEffect(() => { base44.entities.Milestone.list("order", 50).then(setMilestones); }, []);
  const add = async () => {
    const rec = await base44.entities.Milestone.create({ year: "2025", event: "New milestone.", order: milestones.length + 1 });
    setMilestones((m) => [...m, rec]);
  };
  const update = (id, field, val) => setMilestones((m) => m.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const save = async (ms) => { await base44.entities.Milestone.update(ms.id, { year: ms.year, event: ms.event, order: ms.order }); };
  const remove = async (id) => { if (!confirm("Delete?")) return; await base44.entities.Milestone.delete(id); setMilestones((m) => m.filter((r) => r.id !== id)); };

  return (
    <Card title="🗓️ Journey Milestones">
      <div className="space-y-3">
        {milestones.map((ms) => (
          <div key={ms.id} className="flex items-center gap-2">
            <InlineInput value={ms.year} onChange={(v) => update(ms.id, "year", v)} placeholder="Year" className="w-20" />
            <InlineInput value={ms.event} onChange={(v) => update(ms.id, "event", v)} placeholder="Event description" className="flex-1" />
            <button onClick={() => save(ms)} className="p-1.5 text-gold hover:bg-gold/10 rounded-sm"><Save className="w-4 h-4" /></button>
            <button onClick={() => remove(ms.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-4 flex items-center gap-1 text-sm text-gold hover:underline"><Plus className="w-4 h-4" /> Add Milestone</button>
    </Card>
  );
}

function AboutSettingsSection() {
  const [settings, setSettings] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.SiteSetting.list().then((recs) => {
      if (recs && recs.length > 0) { setSettings(recs[0]); setRecordId(recs[0].id); }
      else setSettings({});
    });
  }, []);

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }));
  const handleSave = async () => {
    setSaving(true);
    try {
      if (recordId) await base44.entities.SiteSetting.update(recordId, settings);
      else { const r = await base44.entities.SiteSetting.create(settings); setRecordId(r.id); }
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (!settings) return null;

  return (
    <Card title="📝 About Page Text & Image">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">About Title</label>
          <input type="text" value={settings.about_title || ""} onChange={(e) => update("about_title", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">About Description</label>
          <textarea rows={4} value={settings.about_description || ""} onChange={(e) => update("about_description", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
        </div>
        <ImageUpload label="About Page Image" value={settings.about_image} onChange={(v) => update("about_image", v)} />
      </div>
      <div className="flex items-center gap-4 mt-4">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white text-sm font-body rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </Card>
  );
}

function StorySection() {
  const [settings, setSettings] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    base44.entities.SiteSetting.list().then((recs) => {
      if (recs && recs.length > 0) { setSettings(recs[0]); setRecordId(recs[0].id); }
      else setSettings({});
    });
    base44.entities.StoryBadge.list("order", 30).then(setBadges);
  }, []);

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }));
  const handleSave = async () => {
    setSaving(true);
    try {
      if (recordId) await base44.entities.SiteSetting.update(recordId, settings);
      else { const r = await base44.entities.SiteSetting.create(settings); setRecordId(r.id); }
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const addBadge = async () => {
    const rec = await base44.entities.StoryBadge.create({ title: "New Badge", order: badges.length + 1 });
    setBadges((b) => [...b, rec]);
  };
  const updateBadge = (id, field, val) => setBadges((b) => b.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const saveBadge = async (badge) => { await base44.entities.StoryBadge.update(badge.id, { title: badge.title, order: badge.order }); };
  const removeBadge = async (id) => { if (!confirm("Delete?")) return; await base44.entities.StoryBadge.delete(id); setBadges((b) => b.filter((r) => r.id !== id)); };

  if (!settings) return null;

  const fields = [
    { key: "story_label", label: "Our Story Label", type: "text" },
    { key: "story_heading", label: "Our Story Heading", type: "text" },
    { key: "story_para1", label: "Our Story Paragraph 1", type: "textarea" },
    { key: "story_para2", label: "Our Story Paragraph 2", type: "textarea" },
  ];

  return (
    <Card title="📖 Our Story Section">
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-charcoal mb-1">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea rows={4} value={settings[f.key] || ""} onChange={(e) => update(f.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            ) : (
              <input type="text" value={settings[f.key] || ""} onChange={(e) => update(f.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Badges (checkmark list)</h4>
        <div className="space-y-2">
          {badges.map((b) => (
            <div key={b.id} className="flex items-center gap-2">
              <InlineInput value={b.title} onChange={(v) => updateBadge(b.id, "title", v)} placeholder="Badge text" className="flex-1" />
              <button onClick={() => saveBadge(b)} className="p-1.5 text-gold hover:bg-gold/10 rounded-sm"><Save className="w-4 h-4" /></button>
              <button onClick={() => removeBadge(b.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={addBadge} className="mt-3 flex items-center gap-1 text-sm text-gold hover:underline"><Plus className="w-4 h-4" /> Add Badge</button>
      </div>

      <div className="flex items-center gap-4 mt-5">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white text-sm font-body rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Story Text
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </Card>
  );
}

export default function AdminAboutPage() {
  return (
    <div className="max-w-3xl">
      <StorySection />
      <AboutSettingsSection />
      <TeamSection />
      <ValuesSection />
      <MilestonesSection />
    </div>
  );
}