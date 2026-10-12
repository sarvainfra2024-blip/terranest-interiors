import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, Check, Plus, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DIM_UNITS } from "@/lib/pricingEngine";
import SearchableSelect from "./SearchableSelect";

const fmt = (v) => `₹${Math.round(Number(v || 0)).toLocaleString("en-IN")}`;

const Field = ({ label, children }) => (
  <div>
    <Label className="text-[10px] text-gray-400">{label}</Label>
    <div className="mt-0.5">{children}</div>
  </div>
);

function HardwareField({ label, value, onValue, options }) {
  const opts = (options || []).map((o) => (typeof o === "string" ? { name: o } : o));
  const selected = value ? opts.find((o) => o.name === value) : null;
  return (
    <div>
      <Label className="text-[10px] text-gray-400">{label}</Label>
      <div className="mt-0.5">
        <SearchableSelect
          value={value}
          onChange={onValue}
          options={opts}
          placeholder="None"
          renderLabel={(o) => (o.rate_unit ? `${o.name} — ${o.rate_unit}` : o.name)}
        />
        {selected && selected.rate_unit && (
          <p className="text-[9px] text-gray-400 mt-0.5">Unit: {selected.rate_unit}{selected.rate ? ` · ₹${selected.rate}` : ""}</p>
        )}
      </div>
    </div>
  );
}

export default function ModuleEditor({ ri, mi, module: m, breakdown: b, carcassOptions, shutterOptions, finishOptions, internalFinishOptions, moduleTypes, hardwareByCategory, accessoryByCategory, subModules, setModuleField, setHardwareSelection, addAccessoryRow, setAccessoryRowName, setAccessoryQty, setAccessorySqftQty, removeAccessory, removeModule, onSaveModule }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (field, value) => setModuleField(ri, mi, field, value);

  const handleModuleTypeChange = (typeName) => {
    set("module_type", typeName);
    set("sub_module", "");
    if (!typeName) return;
    const mt = (moduleTypes || []).find((t) => t.name === typeName && t.is_active !== false);
    if (mt) {
      if (mt.default_carcass_material) set("carcass_material", mt.default_carcass_material);
      if (mt.default_shutter_material) set("shutter_material", mt.default_shutter_material);
    }
  };

  const handleSubModuleChange = (name) => {
    set("sub_module", name);
    set("module_name", name);
  };

  const handleSave = async () => {
    if (!onSaveModule) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSaveModule();
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Failed to save. Please ensure client name is entered.");
    }
    setSaving(false);
  };

  const hardwareCategories = Object.keys(hardwareByCategory || {});
  const accessoryCategories = Object.keys(accessoryByCategory || {});

  const selectedModuleType = (moduleTypes || []).find(
    (t) => t.is_active !== false && t.name?.toLowerCase() === (m.module_type || "").toLowerCase()
  );
  const filteredSubModules = (subModules || []).filter((sm) => {
    if (sm.is_active === false) return false;
    if (selectedModuleType && sm.module_type_id === selectedModuleType.id) return true;
    return sm.module_type_name?.toLowerCase() === (m.module_type || "").toLowerCase();
  });

  return (
    <div className={`border rounded p-3 ${m.include_in_total === false ? "border-amber-300 bg-amber-50/40" : "border-gray-200 bg-gray-50/50"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {m.module_type || `Module ${mi + 1}`}{(m.sub_module || m.module_name) ? ` | ${m.sub_module || m.module_name}` : ""}
          {m.include_in_total === false && <span className="ml-2 text-amber-600 normal-case font-medium">· Excluded</span>}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-charcoal">{fmt(b.total)}</span>
          {saved && <span className="text-xs text-green-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Saved</span>}
          {editing ? (
            <button onClick={handleSave} disabled={saving} className="text-xs text-green-600 hover:underline flex items-center gap-1">
              <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs text-gold hover:underline flex items-center gap-1">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          <button onClick={() => removeModule(ri, mi)}><Trash2 className="w-3.5 h-3.5 text-red-300 hover:text-red-500" /></button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-200/60">
        <Label className="text-[10px] text-gray-500">Include in Grand Total</Label>
        <Switch checked={m.include_in_total !== false} onCheckedChange={(v) => set("include_in_total", v)} className="scale-75 origin-right" />
      </div>

      {editing && (
        <div className="space-y-3 mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Field label="Module Type">
              <SearchableSelect
                value={m.module_type || ""}
                onChange={handleModuleTypeChange}
                options={(moduleTypes || []).filter((t) => t.is_active !== false).map((t) => t.name)}
                placeholder="Select..."
              />
            </Field>
            <Field label="Sub Module">
              <SearchableSelect
                value={m.sub_module || ""}
                onChange={handleSubModuleChange}
                options={filteredSubModules.map((sm) => sm.name)}
                placeholder="Select Sub Module..."
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="md:col-span-2">
              <Field label="Qty">
                <Input type="number" value={m.qty} onChange={(e) => set("qty", Number(e.target.value) || 0)} className="h-8 text-xs" />
              </Field>
            </div>
            {(() => {
              const sel = m.hardware_selections || {};
              const hasChannelSel = Object.entries(sel).some(([cat, val]) => val && val !== "None" && /channel|tandem|drawer/i.test(cat));
              if (!(b.hardware_calc?.hasDrawers || hasChannelSel)) return null;
              return (
                <div className="md:col-span-2">
                  <Field label="Drawer Count">
                    <Input type="number" value={m.drawer_count || ""} onChange={(e) => set("drawer_count", Number(e.target.value) || 0)} className="h-8 text-xs" placeholder="1" min="0" />
                  </Field>
                </div>
              );
            })()}
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Dimensions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Field label="Width"><Input type="number" value={m.width} onChange={(e) => set("width", e.target.value)} className="h-8 text-xs" placeholder="1200" /></Field>
              <Field label="Height"><Input type="number" value={m.height} onChange={(e) => set("height", e.target.value)} className="h-8 text-xs" placeholder="750" /></Field>
              <Field label="Depth"><Input type="number" value={m.depth} onChange={(e) => set("depth", e.target.value)} className="h-8 text-xs" placeholder="600" /></Field>
              <Field label="Unit">
                <SearchableSelect value={m.dim_unit} onChange={(v) => set("dim_unit", v)} options={DIM_UNITS} placeholder="Select..." />
              </Field>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Material Selection</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Field label="Carcass Material">
                <SearchableSelect value={m.carcass_material || ""} onChange={(v) => set("carcass_material", v)} options={carcassOptions} placeholder="Select..." />
              </Field>
              <Field label="Shutter Material">
                <SearchableSelect value={m.shutter_material || ""} onChange={(v) => set("shutter_material", v)} options={shutterOptions} placeholder="Select..." />
              </Field>
              <Field label="Finish">
                <SearchableSelect value={m.finish || ""} onChange={(v) => set("finish", v)} options={finishOptions} placeholder="Select..." />
              </Field>
              <Field label="Internal Finish">
                <SearchableSelect value={m.internal_finish || ""} onChange={(v) => set("internal_finish", v)} options={internalFinishOptions} placeholder="Select..." />
              </Field>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Hardware</p>
            {hardwareCategories.length === 0 ? (
              <p className="text-[11px] text-gray-400">No hardware categories found in Rate Master. Add Hardware items with a category (e.g. Hinges, Channels, Liftup) in Rate Master.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {hardwareCategories.map((cat) => (
                  <HardwareField
                    key={cat}
                    label={cat}
                    value={m.hardware_selections?.[cat] || ""}
                    onValue={(v) => setHardwareSelection(ri, mi, cat, v)}
                    options={hardwareByCategory[cat]}
                  />
                ))}
              </div>
            )}
          </div>

          {(() => {
            const hc = b.hardware_calc;
            if (!hc) return null;
            const sel = m.hardware_selections || {};
            const hasSel = (re) => Object.entries(sel).some(([cat, val]) => val && val !== "None" && re.test(cat));
            const showHinges = hc.hasDoors && hasSel(/hinge/i);
            const showChannels = hc.hasDrawers && hasSel(/channel|tandem|drawer/i);
            const showLift = hc.isLiftUp && hasSel(/lift|strut|aventos/i);
            if (!showHinges && !showChannels && !showLift) return null;
            return (
              <div className="bg-blue-50/40 border border-blue-200 rounded p-2.5 space-y-1.5">
                <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">Hardware Auto-Calculation</p>
                {showHinges && (
                  <div className="text-[11px] text-charcoal">
                    <span className="font-medium">Hinges:</span> {hc.shutters} shutter(s) × {hc.hingePerShutter} per shutter = <span className="font-bold">{hc.hinges_qty}</span> total
                  </div>
                )}
                {showChannels && (
                  <div className="text-[11px] text-charcoal space-y-0.5">
                    <div><span className="font-medium">Channels:</span> {hc.drawerCount} drawer(s) = <span className="font-bold">{hc.channels_qty}</span> pair(s) · Length: {hc.channelLengthMM}mm</div>
                    {hc.channelNotes.map((n, i) => <p key={i} className="text-amber-600 text-[10px]">⚠ {n}</p>)}
                  </div>
                )}
                {showLift && (
                  <div className="text-[11px] text-charcoal space-y-0.5">
                    <div><span className="font-medium">Lift-Up:</span> {hc.liftup_spec} · Qty: <span className="font-bold">{hc.liftup_qty}</span></div>
                    {hc.liftupNotes.map((n, i) => <p key={i} className="text-amber-600 text-[10px]">⚠ {n}</p>)}
                  </div>
                )}
              </div>
            );
          })()}

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Accessories</p>
            {accessoryCategories.length === 0 ? (
              <p className="text-[11px] text-gray-400">No accessory categories found in Rate Master. Add Accessory items with a category in Rate Master.</p>
            ) : (
              <div className="space-y-2.5">
                {accessoryCategories.map((cat) => {
                  const catAccessories = (m.accessories || [])
                    .map((a, ai) => ({ ...a, _ai: ai }))
                    .filter((a) => a.category === cat || (!a.category && (accessoryByCategory[cat] || []).some((c) => c.name === a.name)));
                  return (
                    <div key={cat} className="border border-gray-100 rounded p-2 bg-white">
                      <p className="text-[10px] font-medium text-gray-500 uppercase mb-1.5">{cat}</p>
                      <div className="space-y-1.5">
                        {catAccessories.map((a) => {
                          const ab = b.accessories?.[a._ai];
                          const isSqft = ab?.rate_unit === "Sq.ft";
                          return (
                            <div key={a._ai} className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <SearchableSelect
                                  value={a.name}
                                  onChange={(name) => setAccessoryRowName(ri, mi, a._ai, name)}
                                  options={accessoryByCategory[cat]}
                                  placeholder="None"
                                  renderLabel={(o) => (o.rate_unit ? `${o.name} — ${o.rate_unit}` : o.name)}
                                />
                              </div>
                              {ab?.rate_unit && a.name && (
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{fmt(ab.rate)}/{ab.rate_unit}</span>
                              )}
                              {isSqft ? (
                                <div className="flex items-center gap-1">
                                  <Input type="number" value={a.sqft_qty ?? ""} onChange={(e) => setAccessorySqftQty(ri, mi, a._ai, e.target.value)} className="h-7 w-14 text-xs text-center" placeholder="SQ.FT" />
                                  <span className="text-gray-400 text-[10px]">SQ.FT</span>
                                </div>
                              ) : (
                                <Input type="number" value={a.qty} onChange={(e) => setAccessoryQty(ri, mi, a._ai, e.target.value)} className="h-7 w-12 text-xs text-center" />
                              )}
                              <span className="font-medium w-16 text-right text-xs">{fmt(ab?.amount || 0)}</span>
                              <button onClick={() => removeAccessory(ri, mi, a._ai)}><Trash2 className="w-3 h-3 text-red-300 hover:text-red-500" /></button>
                            </div>
                          );
                        })}
                        {catAccessories.length === 0 && (
                          <p className="text-[10px] text-gray-400">No accessories added yet.</p>
                        )}
                      </div>
                      <button onClick={() => addAccessoryRow(ri, mi, cat)} className="text-[10px] text-gold hover:underline flex items-center gap-0.5 mt-1.5">
                        <Plus className="w-2.5 h-2.5" /> Add Accessory
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Cost Breakup</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between bg-white border border-gray-100 rounded px-2 py-1">
                <span className="text-gray-500">Woodwork & Hardware</span>
                <span className="font-medium text-charcoal">{fmt((b.materials_total || 0) + (b.hardware_total || 0))}</span>
              </div>
              <div className="flex justify-between bg-white border border-gray-100 rounded px-2 py-1">
                <span className="text-gray-500">Accessories</span>
                <span className="font-medium text-charcoal">{fmt(b.accessories_total || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}