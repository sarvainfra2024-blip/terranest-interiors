import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Eye, Pencil, FileDown, Link2, Copy } from "lucide-react";
import { downloadQuotationPdf } from "./quotationPdf";

const fmt = (v) => `₹${Math.round(Number(v || 0)).toLocaleString("en-IN")}`;
const STATUS_COLORS = {
  "Fresh Quotation": "bg-amber-100 text-amber-700",
  Draft: "bg-gray-100 text-gray-600",
  Sent: "bg-blue-100 text-blue-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const parseMilestones = (text) => {
  if (!text) return [];
  return text.split(/[\n,;]+/).map((part) => {
    const m = part.match(/(\d+(?:\.\d+)?)\s*%/);
    if (!m) return null;
    const label = part.replace(/(\d+(?:\.\d+)?)\s*%/, "").trim().replace(/^[-–—:.\s]+/, "").trim();
    return { pct: parseFloat(m[1]), label: label || part.trim() };
  }).filter(Boolean);
};

export default function QuotationList({ onNew, onEdit }) {
  const [quotes, setQuotes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);

  const load = async () => {
    setLoading(true);
    const [qs, rs, cfg] = await Promise.all([
      base44.entities.Quotation.list("-created_date"),
      base44.entities.QuotationRoom.list(),
      base44.entities.QuotationConfig.list(),
    ]);
    setQuotes(qs || []);
    setRooms(rs || []);
    setConfig(cfg && cfg[0]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (q) => {
    if (!confirm(`Delete quotation for ${q.client_name}?`)) return;
    await base44.entities.Quotation.delete(q.id);
    const linked = rooms.filter((r) => r.quotation_id === q.id);
    if (linked.length) await base44.entities.QuotationRoom.deleteMany({ quotation_id: q.id });
    await load();
  };

  const copyQuotation = async (q) => {
    if (!confirm(`Create a copy of the quotation for ${q.client_name}?`)) return;
    const rs = rooms.filter((r) => r.quotation_id === q.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const { id, created_date, updated_date, created_by_id, quotation_number, ...rest } = q;
    const newQ = await base44.entities.Quotation.create({ ...rest, status: "Fresh Quotation" });
    if (rs.length > 0) {
      await base44.entities.QuotationRoom.bulkCreate(
        rs.map((r, i) => ({
          quotation_id: newQ.id,
          room_name: r.room_name,
          order: i,
          modules: r.modules,
          room_total: r.room_total,
        }))
      );
    }
    await load();
  };

  const filtered = quotes.filter((q) => {
    const s = search.toLowerCase();
    return !s || (q.client_name || "").toLowerCase().includes(s) || (q.quotation_number || "").toLowerCase().includes(s) || (q.project_id || "").toLowerCase().includes(s);
  });

  const roomsFor = (qid) => rooms.filter((r) => r.quotation_id === qid).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;

  if (viewing) {
    const rs = roomsFor(viewing.id);
    const milestones = parseMilestones(config?.payment_structure);
    const allExcluded = rs.flatMap((r) =>
      (r.modules || []).filter((m) => m.include_in_total === false).map((m) => ({ room_name: r.room_name, module_name: m.module_name || "Module", amount: m.amount || 0 }))
    );
    const bankLines = [
      config?.bank_name && `Bank: ${config.bank_name}`,
      config?.bank_account_name && `Account Name: ${config.bank_account_name}`,
      config?.bank_account_number && `Account No: ${config.bank_account_number}`,
      config?.bank_ifsc && `IFSC: ${config.bank_ifsc}`,
      config?.bank_branch && `Branch: ${config.bank_branch}`,
    ].filter(Boolean);

    const totalWoodworkHardware = rs.reduce((s, r) => s + (r.modules || []).filter((m) => m.include_in_total !== false).reduce((ss, m) => ss + ((m.breakdown?.materials_total || 0) + (m.breakdown?.hardware_total || 0)), 0), 0);
    const totalAccessories = rs.reduce((s, r) => s + (r.modules || []).filter((m) => m.include_in_total !== false).reduce((ss, m) => ss + (m.breakdown?.accessories_total || 0), 0), 0);
    const allCharges = (viewing.quotation_charges && viewing.quotation_charges.length)
      ? viewing.quotation_charges
      : [
          { name: "Labour", amount: viewing.labour_amount, included: viewing.labour_included },
          { name: "Installation", amount: viewing.installation_amount, included: viewing.installation_included },
          { name: "Others", amount: viewing.other_amount, included: viewing.other_included },
        ];
    const includedCharges = allCharges.filter((c) => Number(c.amount) > 0 && c.included !== false);
    const excludedCharges = allCharges.filter((c) => Number(c.amount) > 0 && c.included === false);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg text-charcoal">Quotation — {viewing.client_name}</h3>
          <div className="flex items-center gap-2">
            <a href={`${window.location.origin}/quotation-view/${viewing.id}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> View Quotation</Button></a>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/quotation-view/${viewing.id}`); alert("Share link copied!"); }} className="flex items-center gap-1"><Link2 className="w-3.5 h-3.5" /> Copy Link</Button>
            <Button variant="outline" size="sm" onClick={() => downloadQuotationPdf({ config, quotation: viewing, rooms: rs, subtotal: viewing.subtotal, taxPercent: viewing.tax_percent, taxAmount: viewing.tax_amount, grandTotal: viewing.grand_total, notes: viewing.notes, woodworkDiscountAmount: viewing.woodwork_discount_amount, accessoriesDiscountAmount: viewing.accessories_discount_amount, woodworkDiscount: viewing.woodwork_discount, woodworkDiscountType: viewing.woodwork_discount_type, accessoriesDiscount: viewing.accessories_discount, accessoriesDiscountType: viewing.accessories_discount_type, quotationCharges: viewing.quotation_charges || [] })} className="flex items-center gap-1"><FileDown className="w-3.5 h-3.5" /> Save as PDF</Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(viewing)} className="flex items-center gap-1"><Pencil className="w-3.5 h-3.5" /> Edit</Button>
            <Button variant="ghost" size="sm" onClick={() => setViewing(null)}>← Back</Button>
          </div>
        </div>

        {config && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-5">
            {config.logo_url && <img src={config.logo_url} className="h-16 w-auto object-contain" alt="logo" />}
            <div className="flex-1 text-center">
              <p className="font-heading text-xl text-charcoal">{config.company_name}</p>
              <p className="text-sm text-charcoal mt-0.5">{config.company_address}</p>
              <p className="text-sm text-charcoal">
                {config.company_phone}{config.company_email && ` · ${config.company_email}`}{config.company_website && ` · ${config.company_website}`}{config.company_gst && ` · GST ${config.company_gst}`}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium text-charcoal">{viewing.client_name}</p>
              <p className="text-xs text-charcoal">{viewing.client_email} {viewing.client_phone && `· ${viewing.client_phone}`}</p>
              <p className="text-xs text-charcoal">{viewing.client_address}</p>
              {(viewing.client_city || viewing.client_state || viewing.client_pincode) && (
                <p className="text-xs text-charcoal">{[viewing.client_city, viewing.client_state, viewing.client_pincode].filter(Boolean).join(", ")}</p>
              )}
            </div>
            <div className="text-right text-xs text-charcoal">
              <p>Type: {viewing.quotation_type}</p>
              {viewing.project_id && <p>Project: {viewing.project_id}</p>}
              <p>Location: {viewing.project_location}</p>
              <p>Property: {viewing.project_type}</p>
              <p>Status: <span className={`px-2 py-0.5 rounded ${STATUS_COLORS[viewing.status] || STATUS_COLORS.Draft}`}>{viewing.status}</span></p>
            </div>
          </div>

          <div className="border border-gray-100 rounded p-3 bg-gray-50/50">
            <p className="text-xs font-semibold text-charcoal uppercase mb-2">Scope of Work</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-charcoal">
                  <th className="text-left py-1.5 font-medium">Room</th>
                  <th className="text-right py-1.5 font-medium">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {rs.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5 text-charcoal">{r.room_name}</td>
                    <td className="py-1.5 text-right font-medium">{fmt(r.room_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(totalWoodworkHardware > 0 || totalAccessories > 0) && (
              <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
                {totalWoodworkHardware > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Total Woodwork & Hardware Price <span className="text-xs text-gray-400">(Including GST)</span></span><span className="font-semibold text-charcoal">{fmt(totalWoodworkHardware * (1 + (Number(viewing.tax_percent) || 0) / 100))}</span></div>
                )}
                {totalAccessories > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Total Accessories Price <span className="text-xs text-gray-400">(Including GST)</span></span><span className="font-semibold text-charcoal">{fmt(totalAccessories * (1 + (Number(viewing.tax_percent) || 0) / 100))}</span></div>
                )}
              </div>
            )}
          </div>

          {rs.map((r, i) => (
            <div key={i} className="border border-gray-100 rounded p-3">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-sm text-charcoal">{r.room_name}</span>
              </div>
              <div className="space-y-2">
                {(r.modules || []).filter((m) => m.include_in_total !== false).map((m, j) => {
                  const b = m.breakdown || {};
                  const dims = [m.width, m.height, m.depth].filter(Boolean).length ? `${m.width}×${m.height}${m.depth ? `×${m.depth}` : ""} ${m.dim_unit || "MM"}` : "";
                  const materials = [m.carcass_material && `Carcass: ${m.carcass_material}`, m.shutter_material && `Shutter: ${m.shutter_material}`, m.finish && `Finish: ${m.finish}`, m.internal_finish && `Internal Finish: ${m.internal_finish}`].filter(Boolean);
                  const hw = (b.hardware || []).filter((h) => h.name && h.name !== "None");
                  const accs = m.accessories || [];
                  const woodworkTotal = (b.materials_total || 0) + (b.hardware_total || 0);
                  const rows = [
                    woodworkTotal ? ["Woodwork & Hardware", fmt(woodworkTotal)] : null,
                    (b.accessories_total || 0) ? ["Accessories", fmt(b.accessories_total)] : null,
                  ].filter(Boolean);
                  return (
                    <div key={j} className="border border-gray-100 rounded p-3 bg-gray-50/50">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-charcoal">{m.module_type || m.module_name || "Module"}{(m.sub_module || m.module_name) ? ` | ${m.sub_module || m.module_name}` : ""} × {m.qty}{dims ? ` · ${dims}` : ""}</span>
                        <span className="font-medium">{fmt(m.amount)}</span>
                      </div>
                      {materials.length > 0 && <p className="text-xs text-charcoal mt-1"><span className="text-charcoal">Materials: </span>{materials.join(" · ")}</p>}
                      {hw.length > 0 && (
                        <p className="text-xs text-charcoal mt-1">
                          <span className="text-charcoal">Hardwares : </span>
                          {hw.map((h) => `${h.category} ${h.name} x ${h.qty} ${(h.rate_unit || "").replace("Per ", "")}`).join(", ")}
                        </p>
                      )}
                      {accs.length > 0 && <p className="text-xs text-charcoal mt-1"><span className="text-charcoal">Accessories: </span>{accs.map((a) => {
                        if (a.rate_unit === "Sq.ft") {
                          const sqft = a.sqft_qty != null ? a.sqft_qty : 0;
                          return `${a.name} — ${sqft} Sq.ft × ${fmt(a.rate)} = ${fmt(a.amount)}`;
                        }
                        if (a.rate_unit && a.rate_unit.includes("Nos")) return `${a.name} (${fmt(a.rate)}/${a.rate_unit})`;
                        return a.name;
                      }).join(", ")}</p>}
                      {rows.length > 0 && (
                        <table className="w-full text-[11px] mt-1.5">
                          <tbody>
                            {rows.map(([l, v], ri) => (
                              <tr key={ri} className="border-b border-gray-100 last:border-0"><td className="py-0.5 text-charcoal">{l}</td><td className="py-0.5 text-right font-medium">{v}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-1 text-sm">
              <div className="flex justify-between text-charcoal pt-1 border-t border-gray-100"><span>Subtotal</span><span>{fmt(viewing.subtotal)}</span></div>
              {(viewing.woodwork_discount_amount || 0) > 0 && (
                <div className="flex justify-between text-charcoal"><span>Woodwork Discount {viewing.woodwork_discount_type === "Percentage" ? `(${viewing.woodwork_discount}%)` : ""}</span><span>- {fmt(viewing.woodwork_discount_amount)}</span></div>
              )}
              {(viewing.accessories_discount_amount || 0) > 0 && (
                <div className="flex justify-between text-charcoal"><span>Accessories Discount {viewing.accessories_discount_type === "Percentage" ? `(${viewing.accessories_discount}%)` : ""}</span><span>- {fmt(viewing.accessories_discount_amount)}</span></div>
              )}
              {includedCharges.map((c, i) => (
                <div key={i} className="flex justify-between text-charcoal"><span>{c.name}</span><span>+ {fmt(c.amount)}</span></div>
              ))}
              <div className="flex justify-between font-semibold text-charcoal pt-1 border-t border-gray-100"><span>Grand Total (Including All Taxes)</span><span>{fmt(viewing.grand_total)}</span></div>
            </div>
          </div>

          {excludedCharges.length > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Excluded Charges — Not Included in Grand Total</p>
              <div className="space-y-1">
                {excludedCharges.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-charcoal">{c.name}</span>
                    <span className="font-medium text-charcoal">{fmt(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {allExcluded.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-xs font-semibold text-amber-700 uppercase mb-2">Excluded Modules — Not Included in Grand Total</p>
              <div className="space-y-1">
                {allExcluded.map((m, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-charcoal">{m.module_name} <span className="text-gray-400">({m.room_name})</span></span>
                    <span className="font-medium text-charcoal">{fmt(m.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(config?.payment_structure || config?.site_usage_terms || config?.material_description || config?.terms_conditions || bankLines.length > 0 || config?.footer_note) && (
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3 text-xs">
              {config?.payment_structure && (
                milestones.length > 0 ? (
                  <div className="overflow-hidden border border-black rounded">
                    <div className="bg-gold text-center py-2 border-b border-black">
                      <span className="font-semibold text-white text-xs tracking-wide">PAYMENT STRUCTURE</span>
                    </div>
                    <table className="w-full text-xs bg-white">
                      <tbody>
                        {milestones.map((ms, i) => (
                          <tr key={i} className={i < milestones.length - 1 ? "border-b border-black" : ""}>
                            <td className="text-left py-1.5 px-2 text-black align-top font-bold">{ms.label}</td>
                            <td className="text-center py-1.5 px-2 text-black border-l border-black w-20 align-top font-bold">{ms.pct}%</td>
                            <td className="text-right py-1.5 px-2 text-black border-l border-black w-32 align-top font-bold">{fmt((viewing.grand_total || 0) * ms.pct / 100)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-gold uppercase mb-1 tracking-wide">Payment Structure</p>
                    <p className="text-charcoal whitespace-pre-wrap">{config.payment_structure}</p>
                  </div>
                )
              )}
              {config?.material_description && <div><p className="font-semibold text-gold uppercase mb-1 tracking-wide">Material Description</p><p className="text-charcoal whitespace-pre-wrap">{config.material_description}</p></div>}
              {config?.terms_conditions && <div><p className="font-semibold text-gold uppercase mb-1 tracking-wide">Terms & Conditions</p><p className="text-charcoal whitespace-pre-wrap">{config.terms_conditions}</p></div>}
              {config?.site_usage_terms && <div><p className="font-semibold text-gold uppercase mb-1 tracking-wide">Site Usage & Terms</p><p className="text-charcoal whitespace-pre-wrap">{config.site_usage_terms}</p></div>}
              {bankLines.length > 0 && (
                <div>
                  <p className="font-semibold text-gold uppercase mb-1 tracking-wide">Bank Details</p>
                  <p className="text-charcoal whitespace-pre-wrap">{bankLines.join("\n")}</p>
                </div>
              )}
              {config?.footer_note && <p className="text-charcoal italic">{config.footer_note}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search client, project ID..." className="pl-9 text-sm" />
        </div>
        <Button onClick={onNew} size="sm">+ New Quotation</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Project</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Rooms</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">No quotations yet.</td></tr>
            )}
            {filtered.map((q, i) => (
              <tr key={q.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-4 py-3 font-medium text-charcoal">{q.client_name}</td>
                <td className="px-4 py-3 text-gray-500">{q.quotation_type}</td>
                <td className="px-4 py-3 text-gray-500">{q.project_type || "—"}{q.project_location ? ` · ${q.project_location}` : ""}</td>
                <td className="px-4 py-3 text-gray-500">{roomsFor(q.id).length}</td>
                <td className="px-4 py-3 text-right font-medium">{fmt(q.grand_total)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[q.status] || STATUS_COLORS.Draft}`}>{q.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setViewing(q)} title="View"><Eye className="w-4 h-4 text-gray-400 hover:text-charcoal" /></button>
                    <button onClick={() => copyQuotation(q)} title="Copy"><Copy className="w-4 h-4 text-gray-400 hover:text-charcoal" /></button>
                    <button onClick={() => onEdit(q)} title="Edit"><Pencil className="w-4 h-4 text-gray-400 hover:text-charcoal" /></button>
                    <button onClick={() => remove(q)} title="Delete"><Trash2 className="w-4 h-4 text-red-300 hover:text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}