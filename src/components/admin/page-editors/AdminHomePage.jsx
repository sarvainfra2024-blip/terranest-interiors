import React, { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";

const textFields = [
  { key: "hero_title", label: "Hero Title", type: "text" },
  { key: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
  { key: "about_title", label: "About Section Title", type: "text" },
  { key: "about_description", label: "About Section Description", type: "textarea" },
  { key: "why_choose_label", label: '"Why Terranest" Label', type: "text" },
  { key: "why_choose_title", label: '"Why Terranest" Heading', type: "text" },
  { key: "footer_text", label: "Footer Tagline Text", type: "textarea" },
];

const portfolioFields = [
  { key: "portfolio_label", label: "Our Work Label (e.g. OUR WORK)", type: "text" },
  { key: "portfolio_title", label: "Our Work Heading", type: "text" },
  { key: "portfolio_subtitle", label: "Our Work Subtitle", type: "textarea" },
];

const statFields = [
  { key: "stat_customers", label: "Happy Customers", suffixKey: "stat_customers_suffix" },
  { key: "stat_experience", label: "Years Experience", suffixKey: "stat_experience_suffix" },
  { key: "stat_designs", label: "Designs Delivered", suffixKey: "stat_designs_suffix" },
  { key: "stat_warranty", label: "Warranty (Years)", suffixKey: "stat_warranty_suffix" },
  { key: "stat_delivery", label: "Delivery (Days)", suffixKey: "stat_delivery_suffix" },
];

const imageFields = [
  { key: "hero_image", label: "Hero Background Image" },
  { key: "cta_bg_image", label: "CTA Section Background" },
  { key: "img_portfolio_1", label: "Portfolio Teaser 1" },
  { key: "img_portfolio_2", label: "Portfolio Teaser 2" },
  { key: "img_portfolio_3", label: "Portfolio Teaser 3" },
  { key: "img_portfolio_4", label: "Portfolio Teaser 4" },
  { key: "img_portfolio_5", label: "Portfolio Teaser 5" },
];

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-6 mb-6">
      <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminHomePage() {
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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (!settings) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <Card title="📝 Hero & About Text">
        <div className="space-y-4">
          {textFields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-charcoal mb-1">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea rows={3} value={settings[f.key] || ""} onChange={(e) => update(f.key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
              ) : (
                <input type="text" value={settings[f.key] || ""} onChange={(e) => update(f.key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="🖼️ Our Work Section">
        <div className="space-y-4">
          {portfolioFields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-charcoal mb-1">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea rows={3} value={settings[f.key] || ""} onChange={(e) => update(f.key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
              ) : (
                <input type="text" value={settings[f.key] || ""} onChange={(e) => update(f.key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="📊 Stats Counter">
        <div className="grid grid-cols-2 gap-4">
          {statFields.map((s) => (
            <div key={s.key}>
              <label className="block text-sm font-medium text-charcoal mb-1">{s.label}</label>
              <div className="flex gap-2">
                <input type="number" value={settings[s.key] ?? 0} onChange={(e) => update(s.key, Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
                {s.suffixKey && (
                  <input type="text" value={settings[s.suffixKey] || ""} onChange={(e) => update(s.suffixKey, e.target.value)}
                    placeholder="+" className="w-16 px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="🖼️ Images">
        <div className="space-y-6">
          {imageFields.map((img) => (
            <ImageUpload key={img.key} label={img.label} value={settings[img.key]} onChange={(v) => update(img.key, v)} />
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-4 pb-8">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white text-sm font-body rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}