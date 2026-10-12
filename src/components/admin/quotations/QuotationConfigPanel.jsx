import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";
import { Save } from "lucide-react";

const TEXT_FIELDS = [
  { key: "company_name", label: "Company Name", type: "input" },
  { key: "company_address", label: "Company Address", type: "textarea" },
  { key: "company_gst", label: "GST Number", type: "input" },
  { key: "company_phone", label: "Phone", type: "input" },
  { key: "company_email", label: "Email", type: "input" },
  { key: "company_website", label: "Website", type: "input" },
];

const BANK_FIELDS = [
  { key: "bank_name", label: "Bank Name" },
  { key: "bank_account_name", label: "Account Holder Name" },
  { key: "bank_account_number", label: "Account Number" },
  { key: "bank_ifsc", label: "IFSC Code" },
  { key: "bank_branch", label: "Branch" },
];

const NUM_FIELDS = [
  { key: "default_validity_days", label: "Default Validity (days)" },
  { key: "default_tax_percent", label: "Default Tax/GST (%)" },
];

export default function QuotationConfigPanel() {
  const [config, setConfig] = useState(null);
  const [configId, setConfigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const recs = await base44.entities.QuotationConfig.list();
    if (recs && recs.length > 0) {
      setConfig(recs[0]);
      setConfigId(recs[0].id);
    } else {
      setConfig({
        company_name: "Terranest Interiors",
        company_address: "", company_gst: "", company_phone: "", company_email: "", company_website: "",
        logo_url: "", bank_name: "", bank_account_name: "", bank_account_number: "",
        bank_ifsc: "", bank_branch: "", terms_conditions: "",
        default_validity_days: 30, default_tax_percent: 18, footer_note: "",
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setField = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true);
    if (configId) {
      await base44.entities.QuotationConfig.update(configId, config);
    } else {
      const rec = await base44.entities.QuotationConfig.create(config);
      setConfigId(rec.id);
    }
    setSaving(false);
  };

  if (loading || !config) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-charcoal">1. Header — Company Details</h3>
        <p className="text-xs text-gray-500 mt-1">Appears at the top of every generated quotation.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEXT_FIELDS.map(f => (
            <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
              <Label className="text-xs text-gray-500">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea value={config[f.key] || ""} onChange={e => setField(f.key, e.target.value)} className="mt-1 text-sm" rows={2} />
              ) : (
                <Input value={config[f.key] || ""} onChange={e => setField(f.key, e.target.value)} className="mt-1 text-sm" />
              )}
            </div>
          ))}
        </div>
        <div>
          <Label className="text-xs text-gray-500">Quotation Logo</Label>
          <div className="mt-1"><ImageUpload value={config.logo_url} onChange={url => setField("logo_url", url)} /></div>
        </div>
      </div>

      <div>
        <h3 className="font-heading text-lg text-charcoal">2. Quotation Footer</h3>
        <p className="text-xs text-gray-500 mt-1">Displayed at the bottom of every saved quotation and PDF. Bank Details appear last.</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div>
          <Label className="text-xs text-gray-500">Payment Structure</Label>
          <Textarea value={config.payment_structure || ""} onChange={e => setField("payment_structure", e.target.value)} className="mt-1 text-sm" rows={3} placeholder="e.g. 10% advance, 40% at material stage, 40% at installation, 10% on handover" />
          <p className="text-[11px] text-gray-400 mt-1">Percentages are used to split the Grand Total into milestone amounts shown in the footer.</p>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Site Usage & Terms</Label>
          <Textarea value={config.site_usage_terms || ""} onChange={e => setField("site_usage_terms", e.target.value)} className="mt-1 text-sm" rows={3} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Material Description</Label>
          <Textarea value={config.material_description || ""} onChange={e => setField("material_description", e.target.value)} className="mt-1 text-sm" rows={3} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Terms & Conditions</Label>
          <Textarea value={config.terms_conditions || ""} onChange={e => setField("terms_conditions", e.target.value)} className="mt-1 text-sm" rows={4} />
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Defaults</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NUM_FIELDS.map(f => (
              <div key={f.key}>
                <Label className="text-xs text-gray-500">{f.label}</Label>
                <Input type="number" value={config[f.key] ?? 0} onChange={e => setField(f.key, Number(e.target.value))} className="mt-1 text-sm" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Label className="text-xs text-gray-500">Footer Note</Label>
            <Textarea value={config.footer_note || ""} onChange={e => setField("footer_note", e.target.value)} className="mt-1 text-sm" rows={2} />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bank Details (shown last in footer)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BANK_FIELDS.map(f => (
              <div key={f.key}>
                <Label className="text-xs text-gray-500">{f.label}</Label>
                <Input value={config[f.key] || ""} onChange={e => setField(f.key, e.target.value)} className="mt-1 text-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Quotation Settings"}
        </Button>
      </div>
    </div>
  );
}