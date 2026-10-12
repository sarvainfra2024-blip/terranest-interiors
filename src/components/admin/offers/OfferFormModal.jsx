import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

const OFFER_TYPES = ["Discount", "Package Deal", "Seasonal", "Festival", "Referral", "Custom"];
const CTA_ACTIONS = ["Contact", "Enquiry", "Book Consultation", "Custom URL"];

const empty = () => ({
  title: "", short_description: "", detailed_description: "",
  banner_image: "", additional_images: [],
  offer_type: "Discount", original_price: null, offer_price: null, discount_percent: null,
  valid_from: "", valid_until: "",
  is_active: true, is_public: true,
  show_in_popup: true, show_in_ticker: true,
  terms_conditions: "",
  cta_text: "Get Offer", cta_action: "Enquiry", cta_url: "",
});

export default function OfferFormModal({ offer, onSave, onClose }) {
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (offer) setForm({ ...empty(), ...offer });
  }, [offer]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addImage = () => set("additional_images", [...(form.additional_images || []), ""]);
  const setImage = (i, url) => set("additional_images", (form.additional_images || []).map((img, idx) => idx === i ? url : img));
  const removeImage = (i) => set("additional_images", (form.additional_images || []).filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!form.title.trim()) { alert("Offer title is required."); return; }
    setSaving(true);
    const clean = { ...form, additional_images: (form.additional_images || []).filter(Boolean) };
    await onSave(clean);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-heading text-lg text-charcoal">{offer ? "Edit Offer" : "Add New Offer"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-charcoal"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Basic Information</p>
            <div className="space-y-3">
              <div><Label className="text-xs text-gray-500">Offer Title *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1 text-sm" /></div>
              <div><Label className="text-xs text-gray-500">Short Description</Label><Input value={form.short_description} onChange={(e) => set("short_description", e.target.value)} className="mt-1 text-sm" placeholder="One-line summary" /></div>
              <div><Label className="text-xs text-gray-500">Detailed Description</Label><Textarea value={form.detailed_description} onChange={(e) => set("detailed_description", e.target.value)} className="mt-1 text-sm" rows={3} /></div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Offer Visual</p>
            <ImageUpload value={form.banner_image} onChange={(v) => set("banner_image", v)} label="Banner Image" />
            <div className="mt-3 space-y-2">
              <Label className="text-xs text-gray-500">Additional Images (optional)</Label>
              {(form.additional_images || []).map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={img} onChange={(e) => setImage(i, e.target.value)} className="text-xs" placeholder="Image URL" />
                  <button onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </div>
              ))}
              <button onClick={addImage} className="text-xs text-gold hover:underline">+ Add Image URL</button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Pricing / Discount (all optional)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Offer Type</Label>
                <select value={form.offer_type} onChange={(e) => set("offer_type", e.target.value)} className="w-full h-9 border border-gray-200 rounded text-sm px-2 mt-1 bg-white">
                  {OFFER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><Label className="text-xs text-gray-500">Original Price</Label><Input type="number" value={form.original_price ?? ""} onChange={(e) => set("original_price", e.target.value ? Number(e.target.value) : null)} className="mt-1 text-sm" placeholder="₹" /></div>
              <div><Label className="text-xs text-gray-500">Offer Price</Label><Input type="number" value={form.offer_price ?? ""} onChange={(e) => set("offer_price", e.target.value ? Number(e.target.value) : null)} className="mt-1 text-sm" placeholder="₹" /></div>
              <div><Label className="text-xs text-gray-500">Discount %</Label><Input type="number" value={form.discount_percent ?? ""} onChange={(e) => set("discount_percent", e.target.value ? Number(e.target.value) : null)} className="mt-1 text-sm" placeholder="%" /></div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Validity</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-gray-500">Valid From</Label><Input type="date" value={form.valid_from} onChange={(e) => set("valid_from", e.target.value)} className="mt-1 text-sm" /></div>
              <div><Label className="text-xs text-gray-500">Valid Until</Label><Input type="date" value={form.valid_until} onChange={(e) => set("valid_until", e.target.value)} className="mt-1 text-sm" /></div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Visibility</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} /><Label className="text-sm text-charcoal">Active</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_public} onCheckedChange={(v) => set("is_public", v)} /><Label className="text-sm text-charcoal">Show on Public Site</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.show_in_popup} onCheckedChange={(v) => set("show_in_popup", v)} /><Label className="text-sm text-charcoal">Show in Popup</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.show_in_ticker} onCheckedChange={(v) => set("show_in_ticker", v)} /><Label className="text-sm text-charcoal">Show in Header Ticker</Label></div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Terms & Conditions</p>
            <Textarea value={form.terms_conditions} onChange={(e) => set("terms_conditions", e.target.value)} className="text-sm" rows={3} placeholder="Terms, conditions, exclusions..." />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Call-to-Action</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-xs text-gray-500">Button Text</Label><Input value={form.cta_text} onChange={(e) => set("cta_text", e.target.value)} className="mt-1 text-sm" placeholder="Get Offer" /></div>
              <div>
                <Label className="text-xs text-gray-500">CTA Action</Label>
                <select value={form.cta_action} onChange={(e) => set("cta_action", e.target.value)} className="w-full h-9 border border-gray-200 rounded text-sm px-2 mt-1 bg-white">
                  {CTA_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              {form.cta_action === "Custom URL" && <div><Label className="text-xs text-gray-500">Custom URL</Label><Input value={form.cta_url} onChange={(e) => set("cta_url", e.target.value)} className="mt-1 text-sm" placeholder="https://..." /></div>}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving..." : offer ? "Update Offer" : "Create Offer"}</Button>
        </div>
      </div>
    </div>
  );
}