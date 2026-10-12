import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Search, ChevronDown, ChevronUp, Save, FileDown, Pencil, CheckCircle, Eye, Link2 } from "lucide-react";
import { computeModule, round2 } from "@/lib/pricingEngine";
import { Switch } from "@/components/ui/switch";
import ModuleEditor from "./ModuleEditor";
import { downloadQuotationPdf } from "./quotationPdf";

const PROJECT_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa", "Commercial"];
const fmt = (v) => `₹${Math.round(Number(v || 0)).toLocaleString("en-IN")}`;

const Section = ({ n, title, subtitle, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">
    <div className="mb-4 pb-3 border-b border-gray-100">
      <h3 className="font-heading text-base text-charcoal flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-gold text-white text-xs flex items-center justify-center">{n}</span>
        {title}
      </h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1 ml-8">{subtitle}</p>}
    </div>
    {children}
  </div>
);

let _uidSeq = 0;
const uid = () => `m${Date.now().toString(36)}${(_uidSeq++).toString(36)}`;

const emptyModule = () => ({
  _uid: uid(),
  module_name: "", module_type: "", sub_module: "", qty: 1,
  width: "", height: "", depth: "", dim_unit: "MM",
  drawer_count: 0,
  carcass_material: "", shutter_material: "", shutter_finish: "",
  edge_band: "", edge_band_thickness: "", finish: "", internal_finish: "",
  hardware_selections: {},
  accessories: [],
  include_in_total: true,
});

export default function QuotationGenerator({ onSaved, onGoToList, editQuotation }) {
  const [config, setConfig] = useState(null);
  const [roomOptions, setRoomOptions] = useState([]);
  const [rates, setRates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [moduleTypes, setModuleTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("Fresh Quotation");

  const [quotationType, setQuotationType] = useState("New");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientPincode, setClientPincode] = useState("");
  const [linkedProjectId, setLinkedProjectId] = useState("");

  const [existingProjects, setExistingProjects] = useState([]);
  const [existingQuotes, setExistingQuotes] = useState([]);

  const [projectLocation, setProjectLocation] = useState("");
  const [projectType, setProjectType] = useState("");

  const [rooms, setRooms] = useState([]);
  const [roomPicker, setRoomPicker] = useState("");
  const [customRoom, setCustomRoom] = useState("");
  const [openRoomIdx, setOpenRoomIdx] = useState(null);
  const [accPicker, setAccPicker] = useState(null);

  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState("");
  const [woodworkDiscount, setWoodworkDiscount] = useState(0);
  const [woodworkDiscountType, setWoodworkDiscountType] = useState("Amount");
  const [accessoriesDiscount, setAccessoriesDiscount] = useState(0);
  const [accessoriesDiscountType, setAccessoriesDiscountType] = useState("Amount");
  const [quotationCharges, setQuotationCharges] = useState([]);
  const [subModules, setSubModules] = useState([]);

  useEffect(() => {
    (async () => {
      const [cfg, opts, rts, projs, modTypes, subMods] = await Promise.all([
        base44.entities.QuotationConfig.list(),
        base44.entities.RoomOption.list("order"),
        base44.entities.RateMaster.list(),
        base44.entities.ClientProject.list(),
        base44.entities.ModuleType.list("order"),
        base44.entities.SubModule.list("order"),
      ]);
      const c = cfg && cfg[0];
      setConfig(c);
      setRoomOptions((opts || []).filter((o) => o.is_active));
      setRates(rts || []);
      setProjects(projs || []);
      setModuleTypes(modTypes || []);
      setSubModules(subMods || []);
      if (c) setTaxPercent(c.default_tax_percent ?? 18);
    })();
  }, []);

  // Merge new Rate Master charge entries into quotationCharges (preserves existing toggle states)
  useEffect(() => {
    if (rates.length === 0) return;
    const active = rates.filter((r) => r.is_active !== false);
    const chargeRates = active.filter((r) => ["Labour", "Installation", "Other"].includes(r.rate_type));
    setQuotationCharges((prev) => {
      const existingKeys = new Set(prev.map((c) => `${c.rate_type}|${c.name}`));
      const newEntries = chargeRates
        .filter((r) => !existingKeys.has(`${r.rate_type}|${r.name}`))
        .map((r) => ({ rate_type: r.rate_type, name: r.name, included: true }));
      return newEntries.length ? [...prev, ...newEntries] : prev;
    });
  }, [rates]);

  // Load a saved quotation for editing.
  useEffect(() => {
    if (!editQuotation) return;
    const q = editQuotation;
    setEditingId(q.id);
    setStatus(q.status || "Fresh Quotation");
    setQuotationType(q.quotation_type || "New");
    setClientName(q.client_name || "");
    setClientEmail(q.client_email || "");
    setClientPhone(q.client_phone || "");
    setClientAddress(q.client_address || "");
    setClientCity(q.client_city || "");
    setClientState(q.client_state || "");
    setClientPincode(q.client_pincode || "");
    setLinkedProjectId(q.project_id || "");
    setProjectLocation(q.project_location || "");
    setProjectType(q.project_type || "");
    setTaxPercent(q.tax_percent ?? 18);
    setNotes(q.notes || "");
    setWoodworkDiscount(q.woodwork_discount || 0);
    setWoodworkDiscountType(q.woodwork_discount_type || "Amount");
    setAccessoriesDiscount(q.accessories_discount || 0);
    setAccessoriesDiscountType(q.accessories_discount_type || "Amount");
    if (q.quotation_charges && q.quotation_charges.length) {
      setQuotationCharges(q.quotation_charges.map((c) => ({ rate_type: c.rate_type, name: c.name, included: c.included !== false })));
    } else {
      const oldCharges = [];
      if (q.labour_item) oldCharges.push({ rate_type: "Labour", name: q.labour_item, included: q.labour_included !== false });
      if (q.installation_item) oldCharges.push({ rate_type: "Installation", name: q.installation_item, included: q.installation_included !== false });
      if (q.other_item) oldCharges.push({ rate_type: "Other", name: q.other_item, included: q.other_included !== false });
      setQuotationCharges(oldCharges);
    }
    (async () => {
      const rs = await base44.entities.QuotationRoom.filter({ quotation_id: q.id });
      setRooms(
        (rs || [])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((r) => ({
            _uid: uid(),
            room_name: r.room_name,
            modules: (r.modules || []).map((m) => ({
              ...m,
              _uid: uid(),
              hardware_selections: m.hardware_selections || {
                ...((m.hinges && m.hinges !== "None") ? { Hinges: m.hinges } : {}),
                ...((m.channels && m.channels !== "None") ? { Channels: m.channels } : {}),
              },
            })),
            room_total: r.room_total || 0,
          }))
      );
      if (rs && rs.length) setOpenRoomIdx(0);
    })();
  }, [editQuotation]);

  const activeRates = rates.filter((r) => r.is_active !== false);
  const accessoryOptions = activeRates.filter((r) => r.rate_type === "Accessory");
  const carcassOptions = [...new Set(activeRates.filter((r) => r.rate_type === "Carcass Material").map((r) => r.name))];
  const shutterOptions = [...new Set(activeRates.filter((r) => r.rate_type === "Shutter Material").map((r) => r.name))];
  const finishOptions = [...new Set(activeRates.filter((r) => r.rate_type === "Finish").map((r) => r.name))];
  const internalFinishOptions = [...new Set(activeRates.filter((r) => r.rate_type === "Internal Finish").map((r) => r.name))];
  const hardwareByCategory = {};
  activeRates
    .filter((r) => r.rate_type === "Hardware")
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    .forEach((r) => {
      const cat = (r.category || "Uncategorized").trim();
      if (!hardwareByCategory[cat]) hardwareByCategory[cat] = [];
      if (!hardwareByCategory[cat].some((h) => h.name === r.name)) {
        hardwareByCategory[cat].push({ name: r.name, rate_unit: r.rate_unit, rate: r.rate });
      }
    });

  const accessoryByCategory = {};
  activeRates
    .filter((r) => r.rate_type === "Accessory")
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    .forEach((r) => {
      const cat = (r.category || "Uncategorized").trim();
      if (!accessoryByCategory[cat]) accessoryByCategory[cat] = [];
      if (!accessoryByCategory[cat].some((a) => a.name === r.name)) {
        accessoryByCategory[cat].push({ name: r.name, rate_unit: r.rate_unit, rate: r.rate });
      }
    });

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    return !q ||
      (p.project_id || "").toLowerCase().includes(q) ||
      (p.client_name || "").toLowerCase().includes(q) ||
      (p.mobile || "").toLowerCase().includes(q);
  });

  const selectExisting = async (p) => {
    setLinkedProjectId(p.project_id || p.id);
    setClientName(p.client_name || "");
    setClientEmail(p.email || "");
    setClientPhone(p.mobile || "");
    setClientAddress(p.address || "");
    setClientCity(p.city || "");
    setClientState(p.state || "");
    setClientPincode(p.pincode || "");
    setProjectLocation(p.city ? `${p.city}${p.state ? ", " + p.state : ""}` : "");
    setProjectType(p.property_type || "");
    setSearch("");
    const [projs, quotes] = await Promise.all([
      base44.entities.ClientProject.filter({ email: p.email }),
      base44.entities.Quotation.filter({ client_email: p.email }),
    ]);
    setExistingProjects(projs || []);
    setExistingQuotes(quotes || []);
  };

  const addRoom = (name) => {
    if (!name || !name.trim()) return;
    setRooms((prev) => [...prev, { _uid: uid(), room_name: name.trim(), modules: [], room_total: 0 }]);
    setRoomPicker("");
    setCustomRoom("");
  };

  const removeRoom = (idx) => setRooms((prev) => prev.filter((_, i) => i !== idx));

  const setModuleField = (ri, mi, field, value) => {
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      const modules = r.modules.map((m, j) => (j === mi ? { ...m, [field]: value } : m));
      return { ...r, modules };
    }));
  };

  const setHardwareSelection = (ri, mi, category, value) => {
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      const modules = r.modules.map((m, j) => {
        if (j !== mi) return m;
        const hardware_selections = { ...(m.hardware_selections || {}) };
        if (value && value !== "None") hardware_selections[category] = value;
        else delete hardware_selections[category];
        return { ...m, hardware_selections };
      });
      return { ...r, modules };
    }));
  };

  const addModule = (ri) => {
    setRooms((prev) => prev.map((r, i) => (i === ri ? { ...r, modules: [...r.modules, emptyModule()] } : r)));
  };

  const removeModule = (ri, mi) => {
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      return { ...r, modules: r.modules.filter((_, j) => j !== mi) };
    }));
  };

  const addAccessory = (ri, mi, name) => {
    const opt = accessoryOptions.find((o) => o.name === name);
    const isSqft = opt && opt.rate_unit === "Sq.ft";
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      const modules = r.modules.map((m, j) => (j === mi ? { ...m, accessories: [...m.accessories, { name, qty: 1, sqft_qty: isSqft ? 1 : undefined }] } : m));
      return { ...r, modules };
    }));
    setAccPicker(null);
  };

  const setAccessoryQty = (ri, mi, ai, qty) => {
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      const modules = r.modules.map((m, j) => {
        if (j !== mi) return m;
        const accessories = m.accessories.map((a, k) => (k === ai ? { ...a, qty: Number(qty) || 1 } : a));
        return { ...m, accessories };
      });
      return { ...r, modules };
    }));
  };

  const setAccessorySqftQty = (ri, mi, ai, sqft) => {
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      const modules = r.modules.map((m, j) => {
        if (j !== mi) return m;
        const accessories = m.accessories.map((a, k) => (k === ai ? { ...a, sqft_qty: Number(sqft) || 0 } : a));
        return { ...m, accessories };
      });
      return { ...r, modules };
    }));
  };

  const removeAccessory = (ri, mi, ai) => {
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      const modules = r.modules.map((m, j) => (j === mi ? { ...m, accessories: m.accessories.filter((_, k) => k !== ai) } : m));
      return { ...r, modules };
    }));
  };

  const addAccessoryRow = (ri, mi, category) => {
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      const modules = r.modules.map((m, j) =>
        j === mi ? { ...m, accessories: [...(m.accessories || []), { name: "", category, qty: 1 }] } : m
      );
      return { ...r, modules };
    }));
  };

  const setAccessoryRowName = (ri, mi, ai, name) => {
    const opt = accessoryOptions.find((o) => o.name === name);
    const isSqft = opt && opt.rate_unit === "Sq.ft";
    setRooms((prev) => prev.map((r, i) => {
      if (i !== ri) return r;
      const modules = r.modules.map((m, j) => {
        if (j !== mi) return m;
        const accessories = m.accessories.map((a, k) =>
          k === ai ? { ...a, name, sqft_qty: isSqft ? (a.sqft_qty || 1) : undefined } : a
        );
        return { ...m, accessories };
      });
      return { ...r, modules };
    }));
  };

  const computedRooms = rooms.map((r) => {
    const modules = r.modules.map((m) => ({ ...m, _b: computeModule(m, rates, taxPercent) }));
    const room_total = round2(modules.filter((m) => m.include_in_total !== false).reduce((s, m) => s + (m._b.total || 0), 0));
    return { ...r, modules, room_total };
  });
  const excludedModules = computedRooms.flatMap((r) =>
    r.modules.filter((m) => m.include_in_total === false).map((m) => ({ room_name: r.room_name, module_name: m.module_name || "Module", amount: m._b.total || 0 }))
  );
  const aggWoodwork = round2(computedRooms.reduce((s, r) => s + (r.modules || []).filter((m) => m.include_in_total !== false).reduce((ss, m) => ss + (m._b.woodwork_total || 0), 0), 0));
  const aggAccessories = round2(computedRooms.reduce((s, r) => s + (r.modules || []).filter((m) => m.include_in_total !== false).reduce((ss, m) => ss + (m._b.accessories_total || 0), 0), 0));
  const woodworkDiscountAmount = woodworkDiscountType === "Percentage"
    ? round2((aggWoodwork * (Number(woodworkDiscount) || 0)) / 100)
    : round2(Number(woodworkDiscount) || 0);
  const accessoriesDiscountAmount = accessoriesDiscountType === "Percentage"
    ? round2((aggAccessories * (Number(accessoriesDiscount) || 0)) / 100)
    : round2(Number(accessoriesDiscount) || 0);
  const subtotal = round2(computedRooms.reduce((s, r) => s + (r.room_total || 0), 0));
  const netTotal = round2(subtotal - woodworkDiscountAmount - accessoriesDiscountAmount);

  const computedCharges = quotationCharges.map((c) => {
    const rate = activeRates.find((r) => r.rate_type === c.rate_type && r.name === c.name);
    const amount = rate
      ? (rate.rate_unit === "Percentage"
        ? round2((subtotal * (Number(rate.rate) || 0)) / 100)
        : round2(Number(rate.rate) || 0))
      : 0;
    return { ...c, rate: rate?.rate || 0, rate_unit: rate?.rate_unit || "", amount };
  });
  const includedCharges = round2(computedCharges.filter((c) => c.included).reduce((s, c) => s + c.amount, 0));

  const taxAmount = 0;
  const grandTotal = Math.round(netTotal + includedCharges);

  const save = async () => {
    if (!clientName.trim()) { alert("Client name is required."); return; }
    setSaving(true);
    const validTill = config?.default_validity_days
      ? new Date(Date.now() + config.default_validity_days * 86400000).toISOString().slice(0, 10)
      : "";
    const qData = {
      quotation_type: quotationType,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      client_address: clientAddress,
      client_city: clientCity,
      client_state: clientState,
      client_pincode: clientPincode,
      project_id: quotationType === "Existing" ? linkedProjectId : "",
      project_location: projectLocation,
      project_type: projectType,
      status,
      subtotal,
      woodwork_discount: Number(woodworkDiscount) || 0,
      woodwork_discount_type: woodworkDiscountType,
      woodwork_discount_amount: woodworkDiscountAmount,
      accessories_discount: Number(accessoriesDiscount) || 0,
      accessories_discount_type: accessoriesDiscountType,
      accessories_discount_amount: accessoriesDiscountAmount,
      tax_percent: Number(taxPercent) || 0,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      quotation_charges: computedCharges.map((c) => ({ rate_type: c.rate_type, name: c.name, rate: c.rate, rate_unit: c.rate_unit, amount: c.amount, included: c.included })),
      notes,
      valid_till: validTill,
    };
    let qid;
    if (editingId) {
      await base44.entities.Quotation.update(editingId, qData);
      qid = editingId;
      await base44.entities.QuotationRoom.deleteMany({ quotation_id: qid });
    } else {
      const q = await base44.entities.Quotation.create(qData);
      qid = q.id;
      setEditingId(qid);
    }
    if (computedRooms.length > 0) {
      await base44.entities.QuotationRoom.bulkCreate(
        computedRooms.map((r, i) => ({
          quotation_id: qid,
          room_name: r.room_name,
          order: i,
          modules: r.modules.map((m) => {
            const { _b, _uid, ...rest } = m;
            return {
              ...rest,
              accessories: _b.accessories.map((a, ai) => ({ name: a.name, category: m.accessories[ai]?.category || "", qty: a.qty, sqft_qty: a.sqft_qty, rate: a.rate, rate_unit: a.rate_unit, amount: a.amount })),
              breakdown: {
                hardware_calc: _b.hardware_calc,
                area_sqft: _b.area_sqft,
                d_max: _b.d_max,
                d_mid: _b.d_mid,
                carcass: _b.carcass,
                shutter: _b.shutter,
                finish: _b.finish,
                materials_total: _b.materials_total,
                hardware: _b.hardware,
                hardware_total: _b.hardware_total,
                accessories: _b.accessories,
                accessories_total: _b.accessories_total,
                labour: _b.labour,
                labour_total: _b.labour_total,
                installation: _b.installation,
                installation_total: _b.installation_total,
                other: _b.other,
                other_total: _b.other_total,
                woodwork_total: _b.woodwork_total,
                subtotal: _b.subtotal,
                gst_amount: _b.gst_amount,
                total: _b.total,
              },
              rate_snapshot: _b.rate_snapshot,
              amount: _b.total,
            };
          }),
          room_total: r.room_total,
        }))
      );
    }
    setSaving(false);
    setSavedId(qid);
    if (onSaved) onSaved();
  };

  const onSaveModule = async () => {
    if (!clientName.trim()) { alert("Please enter client name first to save modules."); return; }
    await save();
  };

  const handlePdf = () => {
    downloadQuotationPdf({
      config,
      quotation: {
        quotation_number: editQuotation?.quotation_number || "",
        client_name: clientName, client_email: clientEmail, client_phone: clientPhone,
        client_address: clientAddress, client_city: clientCity, client_state: clientState, client_pincode: clientPincode,
        project_id: linkedProjectId, project_location: projectLocation, project_type: projectType,
        valid_till: editQuotation?.valid_till || "",
      },
      rooms: computedRooms,
      subtotal, taxPercent, taxAmount, grandTotal, notes,
      woodworkDiscountAmount, accessoriesDiscountAmount,
      woodworkDiscount, woodworkDiscountType, accessoriesDiscount, accessoriesDiscountType,
      quotationCharges: computedCharges,
    });
  };

  return (
    <div className="space-y-5">
      {savedId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Quotation saved successfully!</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a href={`${window.location.origin}/quotation-view/${savedId}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> View Quotation
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/quotation-view/${savedId}`); alert("Share link copied to clipboard!"); }} className="flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" /> Copy Share Link
            </Button>
            <Button size="sm" onClick={() => onGoToList?.()} className="flex items-center gap-1">
              Back to List
            </Button>
          </div>
        </div>
      )}
      {editingId && (
        <div className="flex items-center gap-2 text-xs text-gold bg-gold/5 border border-gold/30 rounded px-3 py-2">
          <Pencil className="w-3.5 h-3.5" /> Editing existing quotation — saving will overwrite it.
        </div>
      )}

      <Section n={1} title="Header — Company Details" subtitle="Auto-populated from Company Details settings.">
        {config ? (
          <div className="flex items-center gap-5">
            {config.logo_url && <img src={config.logo_url} className="h-16 w-auto object-contain" alt="logo" />}
            <div>
              <p className="font-heading text-xl text-charcoal">{config.company_name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{config.company_address}</p>
              <p className="text-sm text-gray-500">
                {config.company_phone}{config.company_email && ` · ${config.company_email}`}{config.company_website && ` · ${config.company_website}`}{config.company_gst && ` · GST ${config.company_gst}`}
              </p>
            </div>
          </div>
        ) : <p className="text-xs text-gray-400">No company details configured.</p>}
      </Section>

      <Section n={2} title="Client Details" subtitle="New = fresh quotation. Existing = pick an onboarded client.">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setQuotationType("New")} className={`px-4 py-2 rounded text-sm font-medium ${quotationType === "New" ? "bg-charcoal text-white" : "bg-gray-100 text-gray-600"}`}>New Client</button>
          <button onClick={() => setQuotationType("Existing")} className={`px-4 py-2 rounded text-sm font-medium ${quotationType === "Existing" ? "bg-charcoal text-white" : "bg-gray-100 text-gray-600"}`}>Existing Client</button>
        </div>
        {quotationType === "Existing" && (
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <Label className="text-xs text-gray-500">Search by Project ID, Client Name or Mobile Number</Label>
            <div className="relative mt-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type project ID, client name or mobile..." className="pl-9 text-sm" />
            </div>
            {search && (
              <div className="mt-2 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded">
                {filteredProjects.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">No projects found.</p>}
                {filteredProjects.slice(0, 20).map((p) => (
                  <button key={p.id} onClick={() => selectExisting(p)} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-charcoal">{p.client_name}</span>
                    <span className="text-xs text-gray-400 ml-2">{p.project_id}</span>
                    <span className="text-xs text-gray-400 ml-2">{p.mobile}</span>
                    <span className="text-xs text-gray-400 ml-2">{p.property_type}</span>
                  </button>
                ))}
              </div>
            )}
            {linkedProjectId && <p className="text-xs text-green-600 mt-2">Linked: {linkedProjectId}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label className="text-xs text-gray-500">Client Name *</Label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1 text-sm" /></div>
          <div><Label className="text-xs text-gray-500">Phone Number</Label><Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="mt-1 text-sm" /></div>
          <div><Label className="text-xs text-gray-500">Email</Label><Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="mt-1 text-sm" /></div>
          <div><Label className="text-xs text-gray-500">Address</Label><Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="mt-1 text-sm" /></div>
          <div><Label className="text-xs text-gray-500">City</Label><Input value={clientCity} onChange={(e) => setClientCity(e.target.value)} className="mt-1 text-sm" /></div>
          <div><Label className="text-xs text-gray-500">State</Label><Input value={clientState} onChange={(e) => setClientState(e.target.value)} className="mt-1 text-sm" /></div>
          <div><Label className="text-xs text-gray-500">Pincode</Label><Input value={clientPincode} onChange={(e) => setClientPincode(e.target.value)} className="mt-1 text-sm" /></div>
        </div>

        {quotationType === "Existing" && linkedProjectId && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Existing Projects ({existingProjects.length})</p>
              {existingProjects.length === 0 ? <p className="text-xs text-gray-400">No other projects.</p> : existingProjects.map((p) => (
                <div key={p.id} className="text-xs py-1 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-charcoal">{p.project_name || p.project_id}</span>
                  <span className="text-gray-400 ml-2">{p.property_type} · {p.status}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Previous Quotations ({existingQuotes.length})</p>
              {existingQuotes.length === 0 ? <p className="text-xs text-gray-400">No previous quotations.</p> : existingQuotes.map((q) => (
                <div key={q.id} className="text-xs py-1 border-b border-gray-100 last:border-0 flex justify-between">
                  <span className="font-medium text-charcoal">{q.client_name}</span>
                  <span className="text-gray-400">{fmt(q.grand_total)} · {q.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section n={3} title="Project Overview" subtitle="Location and property type.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label className="text-xs text-gray-500">Project Location</Label><Input value={projectLocation} onChange={(e) => setProjectLocation(e.target.value)} className="mt-1 text-sm" placeholder="City / Area" /></div>
          <div>
            <Label className="text-xs text-gray-500">Project Type</Label>
            <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="w-full h-9 border border-gray-200 rounded-md text-sm px-3 mt-1 bg-white">
              <option value="">Select...</option>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </Section>

      <Section n={4} title="Scope of Work — Rooms" subtitle="Add rooms from the dropdown, or type a custom room name.">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs text-gray-500">Select Room</Label>
            <select value={roomPicker} onChange={(e) => setRoomPicker(e.target.value)} className="w-full h-9 border border-gray-200 rounded-md text-sm px-3 mt-1 bg-white">
              <option value="">Choose a room...</option>
              {roomOptions.map((o) => <option key={o.id} value={o.name}>{o.name}</option>)}
            </select>
          </div>
          <Button onClick={() => addRoom(roomPicker)} disabled={!roomPicker} size="sm" className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add</Button>
          <div className="text-xs text-gray-400 px-2">or</div>
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs text-gray-500">Custom Room Name</Label>
            <Input value={customRoom} onChange={(e) => setCustomRoom(e.target.value)} className="mt-1 text-sm" placeholder="Type custom room..." />
          </div>
          <Button onClick={() => addRoom(customRoom)} disabled={!customRoom.trim()} size="sm" variant="outline" className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add Custom</Button>
        </div>
      </Section>

      <Section n={5} title="Room-wise Quotation" subtitle="Module price = (Carcass + Shutter + Finish rate/sqft) × Surface Area (2 largest dims) + priced hardware & accessories.">
        {rooms.length === 0 && <p className="text-xs text-gray-400">No rooms added yet. Add rooms in Section 4 above.</p>}
        <div className="space-y-4">
          {computedRooms.map((r, ri) => (
            <div key={r._uid} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
                <button onClick={() => setOpenRoomIdx(openRoomIdx === ri ? null : ri)} className="flex items-center gap-2 text-sm font-medium text-charcoal">
                  {openRoomIdx === ri ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {r.room_name}
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => removeRoom(ri)}><Trash2 className="w-4 h-4 text-red-300 hover:text-red-500" /></button>
                </div>
              </div>
              {openRoomIdx === ri && (
                <div className="p-3 space-y-3">
                  {r.modules.map((m, mi) => (
                    <ModuleEditor
                      key={m._uid}
                      ri={ri} mi={mi}
                      module={m} breakdown={m._b}
                      carcassOptions={carcassOptions} shutterOptions={shutterOptions} finishOptions={finishOptions}
                      internalFinishOptions={internalFinishOptions}
                      moduleTypes={moduleTypes}
                      hardwareByCategory={hardwareByCategory}
                      accessoryByCategory={accessoryByCategory}
                      subModules={subModules}
                      setModuleField={setModuleField}
                      setHardwareSelection={setHardwareSelection}
                      addAccessoryRow={addAccessoryRow}
                      setAccessoryRowName={setAccessoryRowName}
                      setAccessoryQty={setAccessoryQty}
                      setAccessorySqftQty={setAccessorySqftQty}
                      removeAccessory={removeAccessory}
                      removeModule={removeModule}
                      onSaveModule={onSaveModule}
                    />
                  ))}
                  <button onClick={() => addModule(ri)} className="text-xs text-gold hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Module
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Total Woodwork & Hardware Price <span className="text-xs text-gray-400">(Including GST)</span></span>
            <span className="font-semibold text-charcoal">{fmt(round2(aggWoodwork * (1 + (Number(taxPercent) || 0) / 100)))}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600 font-medium">Total Accessories Price <span className="text-xs text-gray-400">(Including GST)</span></span>
            <span className="font-semibold text-charcoal">{fmt(round2(aggAccessories * (1 + (Number(taxPercent) || 0) / 100)))}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>GST Incl. (%)</span>
                <Input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} className="w-20 h-8 text-xs text-right" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-400">Woodwork Discount</Label>
                  <div className="flex gap-1">
                    <Input type="number" value={woodworkDiscount} onChange={(e) => setWoodworkDiscount(Number(e.target.value) || 0)} className="h-8 text-xs" placeholder="0" />
                    <select value={woodworkDiscountType} onChange={(e) => setWoodworkDiscountType(e.target.value)} className="h-8 text-xs border border-gray-200 rounded px-1 w-24">
                      <option value="Amount">Amount</option>
                      <option value="Percentage">Pct (%)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-400">Accessories Discount</Label>
                  <div className="flex gap-1">
                    <Input type="number" value={accessoriesDiscount} onChange={(e) => setAccessoriesDiscount(Number(e.target.value) || 0)} className="h-8 text-xs" placeholder="0" />
                    <select value={accessoriesDiscountType} onChange={(e) => setAccessoriesDiscountType(e.target.value)} className="h-8 text-xs border border-gray-200 rounded px-1 w-24">
                      <option value="Amount">Amount</option>
                      <option value="Percentage">Pct (%)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500"><span>Woodwork Discount</span><span>- {fmt(woodworkDiscountAmount)}</span></div>
              <div className="flex justify-between text-xs text-gray-500"><span>Accessories Discount</span><span>- {fmt(accessoriesDiscountAmount)}</span></div>
              {computedCharges.filter((c) => c.included !== false && Number(c.amount) > 0).map((c, i) => (
                <div key={`inc-${i}`} className="flex justify-between text-xs text-gray-600"><span>{c.name}</span><span>+ {fmt(c.amount)}</span></div>
              ))}
              <div className="flex justify-between text-charcoal font-semibold text-base pt-2 border-t border-gray-100"><span>Grand Total (Including All Taxes)</span><span>{fmt(grandTotal)}</span></div>
            </div>
          </div>
          {computedCharges.filter((c) => c.included === false && Number(c.amount) > 0).length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Excluded Charges — Not Included in Grand Total</p>
              <div className="space-y-1">
                {computedCharges.filter((c) => c.included === false && Number(c.amount) > 0).map((c, i) => (
                  <div key={`exc-${i}`} className="flex justify-between text-xs">
                    <span className="text-charcoal">{c.name}</span>
                    <span className="font-medium text-charcoal">{fmt(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {excludedModules.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-xs font-semibold text-amber-700 uppercase mb-2">Excluded Modules — Not Included in Grand Total</p>
              <div className="space-y-1">
                {excludedModules.map((m, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-charcoal">{m.module_name} <span className="text-gray-400">({m.room_name})</span></span>
                    <span className="font-medium text-charcoal">{fmt(m.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4">
            <Label className="text-xs text-gray-500">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 text-sm" rows={2} />
          </div>
        </div>
      </Section>

      <Section n={6} title="Quotation-Level Charges" subtitle="Rate names from Rate Master under Labour, Installation & Others. Toggle each rate to include in Grand Total.">
        {computedCharges.length === 0 && <p className="text-xs text-gray-400">No Labour, Installation, or Other rates found in Rate Master. Add rates in Rate Master to see them here.</p>}
        <div className="space-y-4">
          {["Labour", "Installation", "Other"].map((category) => {
            const categoryCharges = computedCharges.filter((c) => c.rate_type === category);
            if (categoryCharges.length === 0) return null;
            return (
              <div key={category}>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{category === "Other" ? "Others" : category}</p>
                <div className="space-y-2">
                  {categoryCharges.map((charge) => (
                    <div key={`${charge.rate_type}|${charge.name}`} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded border border-gray-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal">{charge.name}</p>
                        <p className="text-xs text-gray-400">{charge.rate_unit === "Percentage" ? `${charge.rate}% of subtotal` : `₹${charge.rate} ${charge.rate_unit}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-charcoal">{fmt(charge.amount)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">Include</Label>
                        <Switch
                          checked={charge.included}
                          onCheckedChange={(checked) => setQuotationCharges((prev) => prev.map((c) =>
                            c.rate_type === charge.rate_type && c.name === charge.name ? { ...c, included: checked } : c
                          ))}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <div className="flex justify-end gap-2">
        <Button onClick={handlePdf} variant="outline" className="flex items-center gap-2">
          <FileDown className="w-4 h-4" /> Save as PDF
        </Button>
        <Button onClick={save} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : editingId ? "Update Quotation" : "Save Quotation"}
        </Button>
      </div>
    </div>
  );
}