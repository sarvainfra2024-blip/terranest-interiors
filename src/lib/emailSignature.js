import { base44 } from "@/api/base44Client";

let cached = null;

// Fetch site settings once and cache for backend/synchronous use
export async function getSiteSettings() {
  if (cached) return cached;
  try {
    const recs = await base44.entities.SiteSetting.list();
    cached = recs?.[0] || {};
  } catch {
    cached = {};
  }
  return cached;
}

// Build an HTML email signature pulled from Website Settings
export function emailSignatureHtml(settings = {}) {
  const company = settings.company_name || "Terranest Interiors";
  const tagline = settings.tagline || "";
  const logo = settings.logo_url || "";
  let sig = `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e5e5;font-family:Arial,Helvetica,sans-serif;">`;
  sig += `<p style="margin:0 0 4px;color:#232323;">Regards,</p>`;
  sig += `<p style="margin:0 0 2px;color:#232323;font-size:15px;"><strong>${company}</strong></p>`;
  if (tagline) sig += `<p style="margin:0 0 8px;color:#888;font-size:13px;font-style:italic;">${tagline}</p>`;
  if (logo) sig += `<img src="${logo}" alt="${company}" width="100" style="width:100px;height:auto;display:block;margin-top:8px;" />`;
  sig += `</div>`;
  return sig;
}