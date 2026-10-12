// Centralized pricing engine for the Quotation system.
// All rates come from the RateMaster entity (single source of truth).

import { computeHardware } from "./hardwareCalculator";

export const RATE_UNITS = [
  "Sq.ft", "Sq.m", "Running Ft", "Running Meter",
  "Per Piece", "Per Nos", "Per Set", "Per Module",
  "Percentage", "Fixed Amount",
];

export const DIM_UNITS = ["MM", "CM", "Inches", "Feet"];

const MM_PER_FT = 304.8;
const SQFT_DIVISOR = 92903.04; // 304.8 * 304.8

export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// Convert a dimension value in the given unit to millimeters.
export function toMM(value, unit) {
  const v = Number(value) || 0;
  switch (unit) {
    case "MM": return v;
    case "CM": return v * 10;
    case "Inches": return v * 25.4;
    case "Feet": return v * MM_PER_FT;
    default: return v;
  }
}

export function mmToFt(mm) {
  return (Number(mm) || 0) / MM_PER_FT;
}

export function mmToMeter(mm) {
  return (Number(mm) || 0) / 1000;
}

// Area in square feet from width & height in millimeters.
export function areaSqft(widthMM, heightMM) {
  return ((Number(widthMM) || 0) * (Number(heightMM) || 0)) / SQFT_DIVISOR;
}

// Find an active, in-effect rate by name (and optional rate_type) from a loaded list.
export function findRate(rates, name, rateType) {
  if (!name) return null;
  const today = new Date().toISOString().slice(0, 10);
  return (rates || []).find(
    (r) =>
      r.name === name &&
      (!rateType || r.rate_type === rateType) &&
      r.is_active !== false &&
      (!r.effective_from || r.effective_from <= today) &&
      (!r.effective_until || r.effective_until >= today)
  );
}

// Billable quantity for a rate unit, using the 2-largest-dimensions surface area
// for area-based units (Sq.ft / Sq.m) and the largest dimension for running units.
export function qtyFor(rateUnit, { area, dMaxMM, qty }) {
  const q = Number(qty) || 1;
  switch (rateUnit) {
    case "Sq.ft": return area;
    case "Sq.m": return area * 0.092903;
    case "Running Ft": return mmToFt(dMaxMM);
    case "Running Meter": return mmToMeter(dMaxMM);
    case "Per Piece":
    case "Per Nos":
    case "Per Set":
    case "Per Module": return q;
    case "Fixed Amount": return 1;
    case "Percentage": return 1;
    default: return q;
  }
}

// Legacy helper (kept for compatibility) — uses width×height for area units.
export function billableQty({ widthMM, heightMM, depthMM, qty, rateUnit }) {
  const q = Number(qty) || 1;
  switch (rateUnit) {
    case "Sq.ft": return areaSqft(widthMM, heightMM);
    case "Sq.m": return areaSqft(widthMM, heightMM) * 0.092903;
    case "Running Ft": return mmToFt(widthMM);
    case "Running Meter": return mmToMeter(widthMM);
    case "Per Piece":
    case "Per Nos":
    case "Per Set":
    case "Per Module": return q;
    case "Fixed Amount": return 1;
    case "Percentage": return 1;
    default: return q;
  }
}

// Compute a full module breakdown using the supplied RateMaster list.
// gstPercent is the GST included in the module price (tax-inclusive pricing).
export function computeModule(module, rates, gstPercent = 0) {
  const dimUnit = module.dim_unit || "MM";
  const widthMM = toMM(module.width, dimUnit);
  const heightMM = toMM(module.height, dimUnit);
  const depthMM = toMM(module.depth, dimUnit);
  const qty = Number(module.qty) || 1;

  // Surface area uses the TWO LARGEST dimensions (smallest is ignored).
  // Area is rounded to 4 decimals to match the standard woodwork pricing convention.
  const sorted = [widthMM, heightMM, depthMM].map(Number).sort((a, b) => b - a);
  const dMax = sorted[0] || 0;
  const dMid = sorted[1] || 0;
  const area = Math.round(((dMax * dMid) / SQFT_DIVISOR) * 10000) / 10000;

  const ctx = { area, dMaxMM: dMax, qty };

  // Price a named component from RateMaster (by rate_type when given).
  const component = (name, type) => {
    if (!name) return null;
    const r = findRate(rates, name, type);
    if (!r) return { name, rate: 0, rate_unit: "", billable_qty: 0, amount: 0, not_found: true };
    const bq = qtyFor(r.rate_unit, ctx);
    return {
      name,
      rate: r.rate,
      rate_unit: r.rate_unit,
      billable_qty: round2(bq),
      amount: round2(bq * (Number(r.rate) || 0)),
    };
  };

  // Surface materials — combined rate (Carcass + Shutter + Finish) × area (2 largest dims).
  // Per the custom woodwork formula: Total = (Carcass + Shutter + Finish rate/sqft) × (Dmax × Dmid)/92903.04.
  const carcassRate = findRate(rates, module.carcass_material, "Carcass Material")?.rate || 0;
  const shutterRate = findRate(rates, module.shutter_material, "Shutter Material")?.rate || 0;
  const finishRate = findRate(rates, module.finish, "Finish")?.rate || 0;
  const internalFinishRate = findRate(rates, module.internal_finish, "Internal Finish")?.rate || 0;
  const combinedRate = (Number(carcassRate) || 0) + (Number(shutterRate) || 0) + (Number(finishRate) || 0) + (Number(internalFinishRate) || 0);
  const materials_total = round2(combinedRate * area * qty);

  const carcass = module.carcass_material ? { name: module.carcass_material, rate: carcassRate, rate_unit: "Sq.ft", billable_qty: round2(area), amount: round2(carcassRate * area * qty) } : null;
  const shutter = module.shutter_material ? { name: module.shutter_material, rate: shutterRate, rate_unit: "Sq.ft", billable_qty: round2(area), amount: round2(shutterRate * area * qty) } : null;
  const finish = module.finish ? { name: module.finish, rate: finishRate, rate_unit: "Sq.ft", billable_qty: round2(area), amount: round2(finishRate * area * qty) } : null;
  const internal_finish = module.internal_finish ? { name: module.internal_finish, rate: internalFinishRate, rate_unit: "Sq.ft", billable_qty: round2(area), amount: round2(internalFinishRate * area * qty) } : null;

  // Hardware auto-calculation: hinges, channels, lift-up quantities from module dimensions & type.
  const hwCalc = computeHardware(module);

  // Hardware selections come from `hardware_selections` (category -> item name),
  // driven entirely by the Rate Master → Hardware master data.
  // Quantities for Hinges / Channels / Liftup categories are auto-calculated from module dimensions.
  const hardware = Object.entries(module.hardware_selections || {})
    .filter(([, name]) => name && name !== "None")
    .map(([category, name]) => {
      const catRates = (rates || []).filter((rt) => (rt.category || "").trim() === (category || "").trim());
      const r = findRate(catRates, name, "Hardware");
      const catLower = (category || "").toLowerCase();
      let hwQty = 1;
      if (/hinge/.test(catLower)) hwQty = hwCalc.hinges_qty || 1;
      else if (/channel|tandem|drawer/.test(catLower)) hwQty = hwCalc.channels_qty || 1;
      else if (/lift|strut|aventos/.test(catLower)) hwQty = hwCalc.liftup_qty || 1;
      if (!r) return { category, name, qty: hwQty, rate: 0, rate_unit: "", billable_qty: 0, amount: 0, not_found: true };
      const bq = qtyFor(r.rate_unit, { ...ctx, qty: hwQty });
      return { category, name, qty: hwQty, rate: r.rate, rate_unit: r.rate_unit, billable_qty: round2(bq), amount: round2(bq * (Number(r.rate) || 0)) };
    });
  const hardware_total = round2(hardware.reduce((s, h) => s + h.amount, 0));

  // Accessories priced from RateMaster by name.
  const accessories = (module.accessories || []).map((a) => {
    const iq = Number(a.qty) || 1;
    const r = findRate(rates, a.name);
    // Fallback to saved rate snapshot if rate not found in Rate Master
    const rate = r ? Number(r.rate) || 0 : (Number(a.rate) || 0);
    const rateUnit = r ? r.rate_unit : (a.rate_unit || "");
    if (!rate) return { name: a.name, qty: iq, rate: 0, rate_unit: rateUnit, billable_qty: 0, amount: 0, not_found: !r };
    // Sq.ft accessories use a user-entered SQ.FT quantity; all other units use Rate × Qty.
    const sqftQty = rateUnit === "Sq.ft" ? (Number(a.sqft_qty) || 0) : 0;
    const bq = rateUnit === "Sq.ft" ? sqftQty : iq;
    return { name: a.name, qty: iq, sqft_qty: rateUnit === "Sq.ft" ? sqftQty : undefined, rate, rate_unit: rateUnit, billable_qty: round2(bq), amount: round2(bq * rate) };
  });
  const accessories_total = round2(accessories.reduce((s, a) => s + a.amount, 0));

  // Labour / Installation / Other charges priced from RateMaster by name.
  const labour = component(module.labour_item, "Labour");
  const installation = component(module.installation_item, "Installation");
  const other = component(module.other_item, "Other");
  const labour_total = labour?.amount || 0;
  const installation_total = installation?.amount || 0;
  const other_total = other?.amount || 0;

  // Labour/Installation/Other are now quotation-level charges, not module-level.
  const woodwork_total = round2(materials_total + hardware_total);

  // Discounts are now applied at the quotation level (not per-module).
  const subtotal = round2(woodwork_total + accessories_total);
  const gst_amount = round2(subtotal * (Number(gstPercent) || 0) / 100);
  const total = round2(subtotal + gst_amount);

  return {
    area_sqft: round2(area),
    d_max: dMax,
    d_mid: dMid,
    carcass,
    shutter,
    finish,
    internal_finish,
    materials_total,
    hardware,
    hardware_total,
    hardware_calc: hwCalc,
    accessories,
    accessories_total,
    labour,
    labour_total,
    installation,
    installation_total,
    other,
    other_total,
    woodwork_total,
    subtotal,
    gst_amount,
    total,
    rate_snapshot: {
      gst_percent: Number(gstPercent) || 0,
      carcass_rate: carcass?.rate || 0,
      shutter_rate: shutter?.rate || 0,
      finish_rate: finish?.rate || 0,
      internal_finish_rate: internal_finish?.rate || 0,
      hardware_rates: Object.fromEntries(hardware.map((h) => [h.name, h.rate])),
      accessory_rates: Object.fromEntries(accessories.map((a) => [a.name, a.rate])),
      labour_rate: labour?.rate || 0,
      installation_rate: installation?.rate || 0,
      other_rate: other?.rate || 0,
    },
    amount: total,
  };
}