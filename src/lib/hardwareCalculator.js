// 3D Woodwork Hardware Configurator Engine.
// Auto-calculates exact quantities of hinges, drawer channels, and lift-up
// mechanisms for an interior woodwork module based on dimensions and module type.

import { toMM } from "./pricingEngine";

// Detect module capabilities from the module type name.
function detectModuleType(typeName) {
  const t = (typeName || "").toLowerCase().trim();
  const hasDrawers = /drawer/.test(t);
  const isLiftUp = /lift|overhead|upward/.test(t);
  const isOpen = /open|shelf/.test(t) && !/door|cabinet|wardrobe|unit/.test(t);
  // Standard cabinet with hinged doors — default when a type is set and it's not open/lift-up.
  const hasDoors = !!t && !isOpen && !isLiftUp;
  return { hasDoors, hasDrawers, isLiftUp, isOpen };
}

// Shutter split logic: width <= 600mm = 1 shutter, > 600mm = 2 shutters.
function shutterCount(widthMM) {
  if (widthMM > 600) return 2;
  return 1;
}

// Hinges per shutter based on module height.
function hingesPerShutter(heightMM) {
  if (heightMM <= 900) return 2;
  if (heightMM <= 1600) return 3;
  if (heightMM <= 2200) return 4;
  return 5;
}

/**
 * Compute hardware quantities for a module.
 * @param {object} module - The module with dimensions, type, qty, drawer_count.
 * @returns {object} Hardware calculation summary with quantities and specs.
 */
export function computeHardware(module) {
  const dimUnit = module.dim_unit || "MM";
  const widthMM = toMM(module.width, dimUnit);
  const heightMM = toMM(module.height, dimUnit);
  const depthMM = toMM(module.depth, dimUnit);
  const qty = Number(module.qty) || 1;

  const { hasDoors, hasDrawers, isLiftUp } = detectModuleType(module.module_type);

  // --- HINGES (door cabinets) ---
  // Always compute from dimensions; the UI shows this row only when a hinge
  // hardware item is selected, and the pricing engine only applies the qty
  // for hinge-category hardware.
  const shutters = widthMM > 0 ? shutterCount(widthMM) : 0;
  const hingePerShutter = heightMM > 0 ? hingesPerShutter(heightMM) : 0;
  const hinges_qty = hingePerShutter * shutters * qty;

  // --- DRAWER CHANNELS ---
  // drawer_count is user-entered; default to 1 only when the module type
  // indicates drawers and the user hasn't set a count.
  const drawerCount = Number(module.drawer_count) || (hasDrawers ? 1 : 0);
  const channels_qty = drawerCount * qty;
  const channelLengthMM = depthMM;
  const channelNotes = [];
  if (drawerCount > 0 && widthMM > 0) {
    if (widthMM >= 600 && widthMM <= 900) {
      channelNotes.push("Upgrade to Heavy-Duty Channels + Add Side-Stabilizer");
    }
    if (widthMM > 900) {
      channelNotes.push("Trigger System Warning: Under-mount runners with synchronized stabilizing rods required");
    }
  }

  // --- LIFT-UP MECHANISM (overhead lift-up units) ---
  // Always compute from width; the UI shows this row only when a lift-up
  // hardware item is selected.
  let liftup_spec = "";
  let liftup_qty = 0;
  const liftupNotes = [];
  if (widthMM > 0) {
    liftup_qty = 1 * qty;
    if (widthMM <= 600) {
      liftup_spec = "1 Pair of Low-Force Gas Struts (60N-80N)";
    } else if (widthMM <= 900) {
      liftup_spec = "1 Pair of Mid-Force Gas Struts (100N-120N)";
    } else if (widthMM <= 1200) {
      liftup_spec = "1 Mechanical Lift System Set (e.g., Blum Aventos HK)";
    } else {
      liftup_spec = "1 Dual-Synchronized Heavy-Duty Mechanical Lift System Set";
      liftupNotes.push("Structural Warning: Reinforce cabinet side panels for dual-sync mechanism weight.");
    }
  }

  return {
    hasDoors,
    hasDrawers,
    isLiftUp,
    shutters,
    hingePerShutter,
    hinges_qty,
    drawerCount,
    channels_qty,
    channelLengthMM,
    channelNotes,
    liftup_qty,
    liftup_spec,
    liftupNotes,
    widthMM,
    heightMM,
    depthMM,
  };
}