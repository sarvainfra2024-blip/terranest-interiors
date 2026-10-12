import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminBrandLogos() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.BrandLogo.list("order", 100)
      .then(setBrands)
      .finally(() => setLoading(false));
  }, []);

  const addBrand = async () => {
    const rec = await base44.entities.BrandLogo.create({
      name: "New Brand",
      logo_url: "",
      order: brands.length,
      is_active: true,
    });
    setBrands((b) => [...b, rec]);
  };

  const update = (id, key, val) => {
    setBrands((b) => b.map((item) => item.id === id ? { ...item, [key]: val } : item));
  };

  const save = async (brand) => {
    setSaving(brand.id);
    await base44.entities.BrandLogo.update(brand.id, {
      name: brand.name,
      logo_url: brand.logo_url,
      website_url: brand.website_url,
      order: brand.order,
      is_active: brand.is_active,
    });
    setSaving(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = async (id) => {
    if (!confirm("Delete this brand logo?")) return;
    await base44.entities.BrandLogo.delete(id);
    setBrands((b) => b.filter((item) => item.id !== id));
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Manage brand logos shown in the marquee on the home page.</p>
        {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
      </div>

      <div className="space-y-4">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white border border-gray-100 rounded-sm p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand.name || ""}
                  onChange={(e) => update(brand.id, "name", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Website URL (optional)</label>
                <input
                  type="text"
                  value={brand.website_url || ""}
                  onChange={(e) => update(brand.id, "website_url", e.target.value)}
                  placeholder="https://brand.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-charcoal mb-1">Logo</label>
              <ImageUpload
                value={brand.logo_url}
                onChange={(url) => update(brand.id, "logo_url", url)}
              />
            </div>

            {brand.logo_url && (
              <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-sm">
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-10 w-auto object-contain max-w-[120px]"
                  onError={(e) => e.target.style.display = "none"}
                />
                <span className="text-xs text-gray-400 truncate">{brand.logo_url}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brand.is_active !== false}
                    onChange={(e) => update(brand.id, "is_active", e.target.checked)}
                    className="accent-gold"
                  />
                  Active
                </label>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500">Order:</label>
                  <input
                    type="number"
                    value={brand.order ?? 0}
                    onChange={(e) => update(brand.id, "order", Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => remove(brand.id)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-400 text-xs rounded-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button
                  onClick={() => save(brand)}
                  disabled={saving === brand.id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gold text-white text-xs rounded-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {saving === brand.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addBrand}
        className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 text-gray-500 text-sm rounded-sm hover:border-gold hover:text-gold transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" /> Add Brand Logo
      </button>
    </div>
  );
}