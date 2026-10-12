import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp } from "lucide-react";

const fmt = (v) => `₹${Math.round(Number(v || 0)).toLocaleString("en-IN")}`;

const parseMilestones = (text) => {
  if (!text) return [];
  return text.split(/[\n,;]+/).map((part) => {
    const m = part.match(/(\d+(?:\.\d+)?)\s*%/);
    if (!m) return null;
    const label = part.replace(/(\d+(?:\.\d+)?)\s*%/, "").trim().replace(/^[-–—:.\s]+/, "").trim();
    return { pct: parseFloat(m[1]), label: label || part.trim() };
  }).filter(Boolean);
};

const groupModulesByType = (modules) => {
  const groups = {};
  (modules || []).filter((m) => m.include_in_total !== false).forEach((m) => {
    const type = m.module_type || "Uncategorized";
    if (!groups[type]) groups[type] = [];
    groups[type].push(m);
  });
  return Object.entries(groups);
};

export default function QuotationView() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [q, rs, cfg] = await Promise.all([
          base44.entities.Quotation.get(id),
          base44.entities.QuotationRoom.filter({ quotation_id: id }),
          base44.entities.QuotationConfig.list(),
        ]);
        setQuotation(q);
        setRooms((rs || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setConfig(cfg && cfg[0]);
      } catch (e) {
        setError(true);
      }
      setLoading(false);
    })();
  }, [id]);

  const toggleType = (key) =>
    setExpandedTypes((prev) => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite px-4">
        <div className="text-center">
          <h1 className="font-heading text-xl text-charcoal mb-2">Quotation Not Found</h1>
          <p className="text-sm text-gray-500">This quotation may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const milestones = parseMilestones(config?.payment_structure);
  const bankLines = [
    config?.bank_name && `Bank: ${config.bank_name}`,
    config?.bank_account_name && `Account Name: ${config.bank_account_name}`,
    config?.bank_account_number && `Account No: ${config.bank_account_number}`,
    config?.bank_ifsc && `IFSC: ${config.bank_ifsc}`,
    config?.bank_branch && `Branch: ${config.bank_branch}`,
  ].filter(Boolean);

  const allExcluded = rooms.flatMap((r) =>
    (r.modules || []).filter((m) => m.include_in_total === false).map((m) => ({
      room_name: r.room_name,
      module_name: m.module_name || "Module",
      amount: m.amount || 0,
    }))
  );

  const totalWoodworkHardware = rooms.reduce((s, r) => s + (r.modules || []).filter((m) => m.include_in_total !== false).reduce((ss, m) => ss + ((m.breakdown?.materials_total || 0) + (m.breakdown?.hardware_total || 0)), 0), 0);
  const totalAccessories = rooms.reduce((s, r) => s + (r.modules || []).filter((m) => m.include_in_total !== false).reduce((ss, m) => ss + (m.breakdown?.accessories_total || 0), 0), 0);
  const allCharges = (quotation.quotation_charges && quotation.quotation_charges.length)
    ? quotation.quotation_charges
    : [
        { name: "Labour", amount: quotation.labour_amount, included: quotation.labour_included },
        { name: "Installation", amount: quotation.installation_amount, included: quotation.installation_included },
        { name: "Others", amount: quotation.other_amount, included: quotation.other_included },
      ];
  const includedCharges = allCharges.filter((c) => Number(c.amount) > 0 && c.included !== false);
  const excludedCharges = allCharges.filter((c) => Number(c.amount) > 0 && c.included === false);

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Company Header */}
        {config && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-5 mb-5">
            {config.logo_url && (
              <img src={config.logo_url} className="h-16 w-auto object-contain" alt="logo" />
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-heading text-2xl text-charcoal">{config.company_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{config.company_address}</p>
              <p className="text-sm text-gray-500">
                {config.company_phone}
                {config.company_email && ` · ${config.company_email}`}
                {config.company_website && ` · ${config.company_website}`}
              </p>
            </div>
          </div>
        )}

        {/* Quotation Title + Meta */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-100">
            <h2 className="font-heading text-xl text-charcoal">Quotation</h2>
            <div className="text-xs text-gray-500 text-right mt-2 sm:mt-0">
              {quotation.quotation_number && <p>Quotation No: {quotation.quotation_number}</p>}
              <p>Date: {new Date(quotation.created_date || Date.now()).toLocaleDateString("en-IN")}</p>
              {quotation.valid_till && <p>Valid Till: {quotation.valid_till}</p>}
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Client</p>
              <p className="text-charcoal font-medium">{quotation.client_name}</p>
              <p className="text-xs text-gray-500">{quotation.client_email}</p>
              <p className="text-xs text-gray-500">{quotation.client_phone}</p>
              <p className="text-xs text-gray-500">{quotation.client_address}</p>
              {(quotation.client_city || quotation.client_state || quotation.client_pincode) && (
                <p className="text-xs text-gray-500">
                  {[quotation.client_city, quotation.client_state, quotation.client_pincode].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Project</p>
              {quotation.project_location && <p className="text-xs text-gray-500">Location: {quotation.project_location}</p>}
              {quotation.project_type && <p className="text-xs text-gray-500">Type: {quotation.project_type}</p>}
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-5">
          <p className="text-xs font-semibold text-charcoal uppercase mb-3">Scope of Work</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-charcoal">
                <th className="text-left py-2 font-medium">Room</th>
                <th className="text-right py-2 font-medium">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 text-charcoal">{r.room_name}</td>
                  <td className="py-2 text-right font-medium text-charcoal">{fmt(r.room_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(totalWoodworkHardware > 0 || totalAccessories > 0) && (
            <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
              {totalWoodworkHardware > 0 && (
                <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Total Woodwork & Hardware Price <span className="text-xs text-gray-400">(Including GST)</span></span><span className="font-semibold text-charcoal">{fmt(totalWoodworkHardware * (1 + (Number(quotation.tax_percent) || 0) / 100))}</span></div>
              )}
              {totalAccessories > 0 && (
                <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Total Accessories Price <span className="text-xs text-gray-400">(Including GST)</span></span><span className="font-semibold text-charcoal">{fmt(totalAccessories * (1 + (Number(quotation.tax_percent) || 0) / 100))}</span></div>
              )}
            </div>
          )}
        </div>

        {/* Room-wise Module Types (Expandable) */}
        <div className="space-y-4 mb-5">
          {rooms.map((r, ri) => {
            const typeGroups = groupModulesByType(r.modules);
            if (typeGroups.length === 0) return null;
            return (
              <div key={ri} className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-heading text-lg text-charcoal mb-3 pb-2 border-b border-gray-100">
                  {r.room_name}
                </h3>
                <div className="space-y-2">
                  {typeGroups.map(([type, mods], ti) => {
                    const typeTotal = mods.reduce((s, m) => s + (m.amount || 0), 0);
                    const key = `${ri}-${ti}`;
                    const expanded = !!expandedTypes[key];
                    return (
                      <div key={key} className="border border-gray-100 rounded">
                        <button
                          onClick={() => toggleType(key)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <span className="flex items-center gap-2 text-sm font-medium text-charcoal">
                            {expanded ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-gold" />}
                            {type}
                          </span>
                          <span className="text-sm font-semibold text-charcoal">{fmt(typeTotal)}</span>
                        </button>
                        {expanded && (
                          <div className="px-4 pb-3 pt-1 space-y-2">
                            {mods.map((m, mi) => {
                              const b = m.breakdown || {};
                              const dims = [m.width, m.height, m.depth].filter(Boolean).length
                                ? `${m.width} × ${m.height}${m.depth ? ` × ${m.depth}` : ""} ${m.dim_unit || "MM"}`
                                : "";
                              const materials = [
                                m.carcass_material && `Carcass: ${m.carcass_material}`,
                                m.shutter_material && `Shutter: ${m.shutter_material}`,
                                m.finish && `Finish: ${m.finish}`,
                                m.internal_finish && `Internal Finish: ${m.internal_finish}`,
                              ].filter(Boolean);
                              const hw = (b.hardware || []).filter((h) => h.name && h.name !== "None");
                              const accs = m.accessories || [];
                              const woodworkTotal = (b.materials_total || 0) + (b.hardware_total || 0);
                              const rows = [
                                woodworkTotal ? ["Woodwork & Hardware", fmt(woodworkTotal)] : null,
                                (b.accessories_total || 0) ? ["Accessories", fmt(b.accessories_total)] : null,
                              ].filter(Boolean);
                              return (
                                <div key={mi} className="border border-gray-100 rounded p-3 bg-gray-50/50">
                                  <div className="flex justify-between text-sm mb-0.5">
                                    <span className="font-medium text-charcoal">
                                      {m.module_type || m.module_name || "Module"}{(m.sub_module || m.module_name) ? ` | ${m.sub_module || m.module_name}` : ""} × {m.qty}{dims ? ` · ${dims}` : ""}
                                    </span>
                                    <span className="font-medium text-charcoal">{fmt(m.amount)}</span>
                                  </div>
                                  {materials.length > 0 && (
                                    <p className="text-xs text-charcoal mt-1">
                                      <span className="font-medium text-charcoal">Materials: </span>{materials.join(" · ")}
                                    </p>
                                  )}
                                  {hw.length > 0 && (
                                    <p className="text-xs text-charcoal mt-1">
                                      <span className="font-medium text-charcoal">Hardwares : </span>
                                      {hw.map((h) => `${h.category} ${h.name} x ${h.qty} ${(h.rate_unit || "").replace("Per ", "")}`).join(", ")}
                                    </p>
                                  )}
                                  {accs.length > 0 && (
                                    <p className="text-xs text-charcoal mt-1">
                                      <span className="font-medium text-charcoal">Accessories: </span>
                                      {accs.map((a) => {
                                        if (a.rate_unit === "Sq.ft") {
                                          const sqft = a.sqft_qty != null ? a.sqft_qty : 0;
                                          return `${a.name} — ${sqft} Sq.ft × ${fmt(a.rate)} = ${fmt(a.amount)}`;
                                        }
                                        if (a.rate_unit && a.rate_unit.includes("Nos")) return `${a.name} (${fmt(a.rate)}/${a.rate_unit})`;
                                        return a.name;
                                      }).join(", ")}
                                    </p>
                                  )}
                                  {rows.length > 0 && (
                                    <table className="w-full text-[11px] mt-1.5">
                                      <tbody>
                                        {rows.map(([l, v], ri) => (
                                          <tr key={ri} className="border-b border-gray-100 last:border-0">
                                            <td className="py-0.5 text-charcoal">{l}</td>
                                            <td className="py-0.5 text-right font-medium text-charcoal">{v}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-5">
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-1 text-sm">
              <div className="flex justify-between text-charcoal pb-1 border-b border-gray-100">
                <span>Subtotal</span>
                <span>{fmt(quotation.subtotal)}</span>
              </div>
              {(quotation.woodwork_discount_amount || 0) > 0 && (
                <div className="flex justify-between text-charcoal">
                  <span>Woodwork Discount{quotation.woodwork_discount_type === "Percentage" ? ` (${quotation.woodwork_discount}%)` : ""}</span>
                  <span>- {fmt(quotation.woodwork_discount_amount)}</span>
                </div>
              )}
              {(quotation.accessories_discount_amount || 0) > 0 && (
                <div className="flex justify-between text-charcoal">
                  <span>Accessories Discount{quotation.accessories_discount_type === "Percentage" ? ` (${quotation.accessories_discount}%)` : ""}</span>
                  <span>- {fmt(quotation.accessories_discount_amount)}</span>
                </div>
              )}
              {includedCharges.map((c, i) => (
                <div key={i} className="flex justify-between text-charcoal">
                  <span>{c.name}</span>
                  <span>+ {fmt(c.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-charcoal text-base pt-2 border-t border-gray-100">
                <span>Grand Total (Including All Taxes)</span>
                <span>{fmt(quotation.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Excluded Charges */}
        {excludedCharges.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
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

        {/* Excluded Modules */}
        {allExcluded.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
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

        {/* Terms, Payment, Bank */}
        {(config?.payment_structure || config?.site_usage_terms || config?.material_description || config?.terms_conditions || bankLines.length > 0 || config?.footer_note) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 text-xs">
            {config?.payment_structure && (
              milestones.length > 0 ? (
                <div className="overflow-hidden border border-gray-200 rounded">
                  <div className="bg-gold text-center py-2 border-b border-gray-200">
                    <span className="font-semibold text-white text-xs tracking-wide">PAYMENT STRUCTURE</span>
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      {milestones.map((ms, i) => (
                        <tr key={i} className={i < milestones.length - 1 ? "border-b border-gray-200" : ""}>
                          <td className="text-left py-1.5 px-2 text-charcoal align-top font-bold">{ms.label}</td>
                          <td className="text-center py-1.5 px-2 text-charcoal border-l border-gray-200 w-20 align-top font-bold">{ms.pct}%</td>
                          <td className="text-right py-1.5 px-2 text-charcoal border-l border-gray-200 w-32 align-top font-bold">{fmt((quotation.grand_total || 0) * ms.pct / 100)}</td>
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
            {config?.material_description && (
              <div>
                <p className="font-semibold text-gold uppercase mb-1 tracking-wide">Material Description</p>
                <p className="text-charcoal whitespace-pre-wrap">{config.material_description}</p>
              </div>
            )}
            {config?.terms_conditions && (
              <div>
                <p className="font-semibold text-gold uppercase mb-1 tracking-wide">Terms & Conditions</p>
                <p className="text-charcoal whitespace-pre-wrap">{config.terms_conditions}</p>
              </div>
            )}
            {config?.site_usage_terms && (
              <div>
                <p className="font-semibold text-gold uppercase mb-1 tracking-wide">Site Usage & Terms</p>
                <p className="text-charcoal whitespace-pre-wrap">{config.site_usage_terms}</p>
              </div>
            )}
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