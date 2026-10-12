import React, { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";

const fields = [
  { key: "company_name", label: "Company Name (Public Site)", type: "text" },
  { key: "admin_header_name", label: "Admin Panel Header Name", type: "text" },
  { key: "logo_url", label: "Company Logo URL (leave blank to use text name)", type: "text" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "phone", label: "Phone Number", type: "text" },
  { key: "whatsapp_number", label: "WhatsApp Number (digits only)", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "hero_title", label: "Hero Title", type: "text" },
  { key: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
  { key: "about_title", label: "About Title", type: "text" },
  { key: "about_description", label: "About Description", type: "textarea" },
  { key: "business_hours_weekday", label: "Business Hours (Mon–Sat)", type: "text" },
  { key: "business_hours_sunday", label: "Business Hours (Sunday)", type: "text" },
  { key: "footer_text", label: "Footer Text", type: "text" },
  { key: "facebook_url", label: "Facebook URL", type: "text" },
  { key: "instagram_url", label: "Instagram URL", type: "text" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "text" },
];

const statFields = [
  { key: "stat_customers", label: "Customers", suffixKey: "stat_customers_suffix" },
  { key: "stat_experience", label: "Experience (Years)", suffixKey: "stat_experience_suffix" },
  { key: "stat_warranty", label: "Warranty (Years)", suffixKey: "stat_warranty_suffix", labelKey: "stat_warranty_label" },
  { key: "stat_delivery", label: "Delivery (Days)", suffixKey: null, labelKey: "stat_delivery_label" },
];

const imageGroups = [
  {
    title: "Hero & About",
    images: [
      { key: "hero_image", label: "Hero Background Image" },
      { key: "about_image", label: "About Page Image" },
      { key: "cta_bg_image", label: "CTA Section Background" },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.SiteSetting.list().then((records) => {
      if (records && records.length > 0) {
        setSettings(records[0]);
        setRecordId(records[0].id);
      } else {
        setSettings({});
      }
    });
  }, []);

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (recordId) {
        await base44.entities.SiteSetting.update(recordId, settings);
      } else {
        const rec = await base44.entities.SiteSetting.create(settings);
        setRecordId(rec.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h2 className="font-heading text-2xl text-charcoal mb-6">Site Settings</h2>

      {/* ── Branding (Logo + Admin Name) — TOP SECTION ── */}
      <div className="bg-white rounded-sm border-2 border-gold p-6 mb-6">
        <h3 className="text-sm font-semibold text-gold border-b border-gold/30 pb-3 mb-4">🏷️ Branding — Logo & Admin Name</h3>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Admin Panel Header Name</label>
            <input
              type="text"
              value={settings.admin_header_name || ""}
              onChange={(e) => update("admin_header_name", e.target.value)}
              placeholder="e.g. TerranNest Admin"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
            />
            <p className="text-xs text-gray-400 mt-1">Shown in the admin sidebar and top bar.</p>
          </div>
          <div>
            <ImageUpload
              label="Company Logo (shown in public Navbar & admin sidebar)"
              value={settings.logo_url}
              onChange={(v) => update("logo_url", v)}
            />
            <p className="text-xs text-gray-400 mt-2">Recommended: transparent PNG. If no logo is uploaded, the company name text is shown instead.</p>
            {settings.logo_url && (
              <div className="mt-3 p-3 bg-charcoal rounded-sm inline-block">
                <img src={settings.logo_url} alt="Logo preview" className="h-10 object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Fields */}
      <div className="bg-white rounded-sm border border-gray-100 p-6 space-y-5 mb-6">
        <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3">General Information</h3>
        {fields.filter(f => f.key !== "admin_header_name" && f.key !== "logo_url").map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-charcoal mb-1">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                value={settings[f.key] || ""}
                onChange={(e) => update(f.key, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
              />
            ) : (
              <input
                type="text"
                value={settings[f.key] || ""}
                onChange={(e) => update(f.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
              />
            )}
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">Statistics (Home Page) & About Page Gold Badge</h3>
        <div className="grid grid-cols-2 gap-4">
          {statFields.map((s) => (
            <div key={s.key}>
              <label className="block text-sm font-medium text-charcoal mb-1">{s.label}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={settings[s.key] ?? 0}
                  onChange={(e) => update(s.key, Number(e.target.value))}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
                {s.suffixKey && (
                  <div className="flex flex-col">
                    <span className="block text-xs font-medium text-gray-500 mb-1">Suffix</span>
                    <input
                      type="text"
                      value={settings[s.suffixKey] || ""}
                      onChange={(e) => update(s.suffixKey, e.target.value)}
                      placeholder="+"
                      className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                )}
              </div>
              {s.labelKey && (
                <input
                  type="text"
                  value={settings[s.labelKey] || ""}
                  onChange={(e) => update(s.labelKey, e.target.value)}
                  placeholder="Public label"
                  className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-charcoal mb-1">Hero Badge Label</label>
          <input
            type="text"
            value={settings.hero_stat_label || ""}
            onChange={(e) => update("hero_stat_label", e.target.value)}
            placeholder="YEARS"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
          />
          <p className="text-xs text-gray-400 mt-1">Short label shown beneath the years figure on the About page gold badge (e.g. YEARS). The number &amp; suffix above ("Experience (Years)" + suffix) drive the badge's figure.</p>
        </div>
      </div>

      {/* Image Groups */}
      {imageGroups.map((group) => (
        <div key={group.title} className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">
            Images — {group.title}
          </h3>
          <div className="space-y-6">
            {group.images.map((img) => (
              <ImageUpload
                key={img.key}
                label={img.label}
                value={settings[img.key]}
                onChange={(v) => update(img.key, v)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Welcome Onboard */}
      <div className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-charcoal border-b border-gray-100 pb-3 mb-4">Welcome Onboard (Sent to Every New Client)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Email Subject</label>
            <input type="text" value={settings.welcome_onboard_subject || ""} onChange={(e) => update("welcome_onboard_subject", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Welcome Title</label>
            <input type="text" value={settings.welcome_onboard_title || ""} onChange={(e) => update("welcome_onboard_title", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Welcome Message</label>
            <textarea value={settings.welcome_onboard_message || ""} onChange={(e) => update("welcome_onboard_message", e.target.value)} rows={5} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold" />
            <p className="text-xs text-gray-400 mt-1">Shown on the client tracking page and sent in the onboarding email. Project details and the tracking link are appended automatically.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white text-sm font-body rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
        {saved && <span className="text-sm text-green-600">Saved successfully!</span>}
      </div>
    </div>
  );
}