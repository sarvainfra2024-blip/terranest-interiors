import { base44 } from "@/api/base44Client";

export const PROJECT_PREFIX = "TN";

export const PROJECT_MILESTONES = [
  { stage: "Project Created", progress: 0 },
  { stage: "Initial Measurement", progress: 5 },
  { stage: "Design Phase", progress: 15 },
  { stage: "Material Selection", progress: 40 },
  { stage: "Cross Measurement", progress: 50 },
  { stage: "Manufacturing", progress: 60 },
  { stage: "Installation", progress: 80 },
  { stage: "Project Handed Over", progress: 100 },
];

export const MILESTONE_BY_NAME = Object.fromEntries(PROJECT_MILESTONES.map((m) => [m.stage, m.progress]));

export const DEFAULT_STAGES = PROJECT_MILESTONES.map((m) => m.stage);

export const STAGE_STATUSES = ["Not Started", "Scheduled", "In Progress", "Completed", "On Hold", "Delayed", "Cancelled"];

export const PROJECT_DURATIONS = [35, 45, 75, 90, 120, 150, 180];

export const STAGE_STATUS_COLOR = {
  "Completed": { dot: "bg-green-500", text: "text-green-600", badge: "bg-green-100 text-green-700" },
  "In Progress": { dot: "bg-blue-500", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  "Scheduled": { dot: "bg-orange-500", text: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
  "Delayed": { dot: "bg-red-500", text: "text-red-600", badge: "bg-red-100 text-red-700" },
  "On Hold": { dot: "bg-gray-400", text: "text-gray-500", badge: "bg-gray-100 text-gray-600" },
  "Cancelled": { dot: "bg-gray-300", text: "text-gray-400", badge: "bg-gray-100 text-gray-500" },
  "Not Started": { dot: "bg-gray-300", text: "text-gray-400", badge: "bg-gray-100 text-gray-500" },
};

export function generateMilestoneDates(startDate, durationDays) {
  const base = startDate ? new Date(startDate) : new Date();
  const toISO = (d) => d.toISOString().slice(0, 10);
  let prevEnd = null;
  return PROJECT_MILESTONES.map((m, i) => {
    const end = new Date(base);
    end.setDate(base.getDate() + Math.round((m.progress / 100) * durationDays));
    let start;
    if (i === 0) start = new Date(base);
    else { start = new Date(prevEnd); start.setDate(prevEnd.getDate() + 1); }
    prevEnd = new Date(end);
    return {
      name: m.stage,
      progress: m.progress,
      planned_start_date: toISO(start),
      planned_end_date: toISO(end),
      status: i === 0 ? "Completed" : "Scheduled",
    };
  });
}
export const PROPERTY_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa", "Commercial"];
export const PACKAGES = ["Essential", "Premium", "Luxury", "Custom"];
export const PROJECT_STATUSES = ["Planning", "In Progress", "On Hold", "Completed", "Archived"];
export const PHOTO_TYPES = ["Before", "After", "Installation"];
export const DOC_TYPES = ["Quotation", "BOQ", "Agreement", "Drawings", "2D Layout", "3D Designs", "Material List", "Warranty", "Invoice", "Payment Receipt"];
export const MATERIAL_CATEGORIES = ["Laminates", "Hardware", "Hinges", "Channels", "Handles", "Glass", "Countertop", "Paint", "Accessories"];

export function genTrackingToken() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return code;
}

export async function generateProjectId() {
  const all = await base44.entities.ClientProject.list(undefined, 500);
  const existing = new Set((all || []).map((p) => p.project_id));
  let code = randomCode();
  while (existing.has(code) || code.startsWith("TN")) code = randomCode();
  return code;
}