import { jsPDF } from "jspdf";

const fmt = (v) => `Rs. ${Math.round(Number(v || 0)).toLocaleString("en-IN")}`;

// Brand palette
const GOLD = [200, 155, 60];
const CHARCOAL = [35, 35, 35];
const BEIGE = [242, 238, 232];
const LINE = [220, 215, 205];
const WHITE = [255, 255, 255];

let _playfairCache;
const loadPlayfairFont = async () => {
  if (_playfairCache !== undefined) return _playfairCache || null;
  try {
    const res = await fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf");
    if (!res.ok) { _playfairCache = false; return null; }
    const buf = await res.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    _playfairCache = btoa(binary);
    return _playfairCache;
  } catch (e) {
    _playfairCache = false;
    return null;
  }
};

const loadLogoDataUrl = (url) => new Promise((resolve) => {
  if (!url) return resolve(null);
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 200;
      canvas.height = img.naturalHeight || 200;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    } catch (e) { resolve(null); }
  };
  img.onerror = () => resolve(null);
  img.src = url;
});

const wrap = (doc, text, maxWidth) => doc.splitTextToSize(String(text || ""), maxWidth);

export async function downloadQuotationPdf({ config, quotation, rooms, subtotal, taxPercent, taxAmount, grandTotal, notes, woodworkDiscountAmount = 0, accessoriesDiscountAmount = 0, woodworkDiscount = 0, woodworkDiscountType = "Amount", accessoriesDiscount = 0, accessoriesDiscountType = "Amount", quotationCharges = [] }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const MX = 45;
  const CW = W - MX * 2;
  const FOOTER_H = 40; // reserved height at bottom for page footer

  const bd = (m) => m.breakdown || m._b || {};
  const mTotal = (m) => m.amount || bd(m).total || 0;

  // Load Playfair Display font for company name (matches website heading font)
  const playfairBase64 = await loadPlayfairFont();
  let headingFont = "times";
  let headingStyle = "bold";
  if (playfairBase64) {
    try {
      doc.addFileToVFS("PlayfairDisplay.ttf", playfairBase64);
      doc.addFont("PlayfairDisplay.ttf", "PlayfairDisplay", "normal");
      doc.addFont("PlayfairDisplay.ttf", "PlayfairDisplay", "bold");
      headingFont = "PlayfairDisplay";
      headingStyle = "normal";
    } catch (e) { /* fall back to times */ }
  }

  // Ensure enough space; add page if not.
  const ensureSpace = (y, need) => {
    if (y + need > H - FOOTER_H - 10) { doc.addPage(); return 52; }
    return y;
  };

  // ===================== HEADER (all pages share this via page footer loop) =====================
  const drawHeader = () => {
    doc.setFillColor(...BEIGE);
    doc.rect(0, 0, W, 120, "F");
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(2);
    doc.line(0, 120, W, 120);
  };

  drawHeader();

  const logoData = await loadLogoDataUrl(config?.logo_url);
  const logoH = 70;
  const logoW = logoH; // square-ish
  if (logoData) {
    try { doc.addImage(logoData, "PNG", MX, 24, logoW, logoH); } catch (e) { /* skip */ }
  }

  // Company name + contact centred in the header
  const companyX = W / 2;
  doc.setFontSize(22);
  doc.setFont(headingFont, headingStyle);
  doc.setTextColor(...CHARCOAL);
  doc.text(config?.company_name || "Terranest Interiors", companyX, 48, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...CHARCOAL);
  const headerLines = [
    config?.company_address,
    [config?.company_phone, config?.company_email].filter(Boolean).join("   |   "),
    [config?.company_website, config?.company_gst && `GSTIN: ${config.company_gst}`].filter(Boolean).join("   |   "),
  ].filter(Boolean);
  let hy = 62;
  headerLines.forEach((l) => { doc.text(l, companyX, hy, { align: "center" }); hy += 13; });

  let y = 136;

  // ---- QUOTATION title bar ----
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...CHARCOAL);
  doc.text("QUOTATION", MX, y);

  // Right side meta
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...CHARCOAL);
  const qNum = quotation.quotation_number || "";
  const metaParts = [
    qNum && `Quotation No: ${qNum}`,
    `Date: ${new Date().toLocaleDateString("en-IN")}`,
    quotation.valid_till && `Valid Till: ${quotation.valid_till}`,
  ].filter(Boolean);
  let metaY = y - 8;
  metaParts.forEach((mp) => {
    doc.text(mp, W - MX, metaY, { align: "right" });
    metaY += 13;
  });

  y += 8;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.8);
  doc.line(MX, y, W - MX, y);
  y += 16;

  // ---- Client + Project two-column section ----
  const colW = (CW - 24) / 2;
  const leftX = MX;
  const rightX = MX + colW + 24;

  const sectionLabel = (label, x, yy) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text(label.toUpperCase(), x, yy);
  };

  const kv = (k, v, x, yy) => {
    if (!v) return yy;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CHARCOAL);
    doc.text(`${k}: `, x, yy);
    const lw = doc.getTextWidth(`${k}: `);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...CHARCOAL);
    const lines = wrap(doc, String(v), colW - lw - 4);
    lines.forEach((l, li) => {
      doc.text(l, x + lw, yy + li * 12);
    });
    return yy + lines.length * 12;
  };

  sectionLabel("Client Details", leftX, y);
  sectionLabel("Project Details", rightX, y);
  y += 13;

  let yL = y, yR = y;
  yL = kv("Client", quotation.client_name, leftX, yL);
  yL = kv("Phone", quotation.client_phone, leftX, yL);
  yL = kv("Email", quotation.client_email, leftX, yL);
  yL = kv("Address", quotation.client_address, leftX, yL);
  const cityLine = [quotation.client_city, quotation.client_state, quotation.client_pincode].filter(Boolean).join(", ");
  if (cityLine) yL = kv("City", cityLine, leftX, yL);

  if (quotation.project_id || quotation.project_name) yR = kv("Project", quotation.project_id || quotation.project_name, rightX, yR);
  yR = kv("Location", quotation.project_location, rightX, yR);
  yR = kv("Type", quotation.project_type, rightX, yR);
  if (quotation.prepared_by) yR = kv("Prepared By", quotation.prepared_by, rightX, yR);

  y = Math.max(yL, yR) + 14;

  // ---- Scope of Work summary table ----
  y = ensureSpace(y, 60);
  doc.setFillColor(...BEIGE);
  doc.roundedRect(MX, y, CW, 22, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...CHARCOAL);
  doc.text("Scope of Work", MX + 10, y + 15);
  y += 28;

  // Table header row
  doc.setFillColor(...CHARCOAL);
  doc.rect(MX, y, CW, 20, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("Room", MX + 10, y + 13);
  doc.text("Total Price", W - MX - 10, y + 13, { align: "right" });
  y += 20;

  (rooms || []).forEach((r, i) => {
    y = ensureSpace(y, 20);
    if (i % 2 === 1) { doc.setFillColor(248, 247, 244); doc.rect(MX, y, CW, 20, "F"); }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...CHARCOAL);
    doc.text(r.room_name || "Room", MX + 10, y + 13);
    doc.text(fmt(r.room_total || 0), W - MX - 10, y + 13, { align: "right" });
    y += 20;
  });
  y += 10;

  // Scope of Work totals
  const totalWH = (rooms || []).reduce((s, r) => {
    return s + (r.modules || []).filter((m) => m.include_in_total !== false).reduce((ss, m) => {
      return ss + ((m.breakdown?.materials_total || 0) + (m.breakdown?.hardware_total || 0));
    }, 0);
  }, 0);
  const totalAcc = (rooms || []).reduce((s, r) => {
    return s + (r.modules || []).filter((m) => m.include_in_total !== false).reduce((ss, m) => {
      return ss + (m.breakdown?.accessories_total || 0);
    }, 0);
  }, 0);
  if (totalWH > 0 || totalAcc > 0) {
    y = ensureSpace(y, 30);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...CHARCOAL);
    if (totalWH > 0) {
      doc.text("Total Woodwork & Hardware Price (Including GST)", MX + 10, y);
      doc.text(fmt(Math.round(totalWH * (1 + (Number(taxPercent) || 0) / 100))), W - MX - 10, y, { align: "right" });
      y += 14;
    }
    if (totalAcc > 0) {
      doc.text("Total Accessories Price (Including GST)", MX + 10, y);
      doc.text(fmt(Math.round(totalAcc * (1 + (Number(taxPercent) || 0) / 100))), W - MX - 10, y, { align: "right" });
      y += 14;
    }
    y += 6;
  }

  // ===================== MODULE DETAILS — force new page if needed =====================
  // Always start module details section on a fresh page if we're past 60% of current page
  if (y > H * 0.5) {
    doc.addPage();
    y = 52;
  } else {
    y = ensureSpace(y, 80);
  }

  (rooms || []).forEach((r) => {
    const includedModules = (r.modules || []).filter((m) => m.include_in_total !== false);
    if (includedModules.length === 0) return;

    y = ensureSpace(y, 50);

    // Room header bar with gold left accent — no room total (shown only in Scope of Work)
    doc.setFillColor(...GOLD);
    doc.rect(MX, y, 4, 20, "F");
    doc.setFillColor(248, 247, 244);
    doc.rect(MX + 4, y, CW - 4, 20, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CHARCOAL);
    doc.text(r.room_name || "Room", MX + 14, y + 14);
    y += 26;

    // Group modules by module_type and show only the type total (no individual modules)
    const typeGroups = {};
    includedModules.forEach((m) => {
      const type = m.module_type || "Uncategorized";
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push(m);
    });

    Object.entries(typeGroups).forEach(([type, mods]) => {
      y = ensureSpace(y, 26);
      const typeTotal = mods.reduce((s, m) => s + mTotal(m), 0);

      doc.setFillColor(250, 249, 246);
      doc.roundedRect(MX, y, CW, 22, 2, 2, "F");
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.5);
      doc.roundedRect(MX, y, CW, 22, 2, 2, "S");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...CHARCOAL);
      doc.text(type, MX + 14, y + 15);
      doc.text(fmt(typeTotal), W - MX - 10, y + 15, { align: "right" });
      y += 26;
    });

    y += 4;
  });

  // ===================== GRAND TOTAL =====================
  y = ensureSpace(y, 80);
  y += 4;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.8);
  doc.line(MX, y, W - MX, y);
  y += 14;

  // Quotation-level discounts (above grand total)
  const hasWd = (Number(woodworkDiscountAmount) || 0) > 0;
  const hasAd = (Number(accessoriesDiscountAmount) || 0) > 0;
  if (hasWd || hasAd) {
    if (hasWd) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...CHARCOAL);
      doc.text("Woodwork Discount", MX + 16, y);
      doc.text(`- ${fmt(woodworkDiscountAmount)}`, W - MX - 16, y, { align: "right" });
      y += 16;
    }
    if (hasAd) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...CHARCOAL);
      doc.text("Accessories Discount", MX + 16, y);
      doc.text(`- ${fmt(accessoriesDiscountAmount)}`, W - MX - 16, y, { align: "right" });
      y += 16;
    }
    y += 4;
  }

  // Quotation-level charges — included only (above Grand Total)
  const includedCharges = (quotationCharges || []).filter((c) => Number(c.amount) > 0 && c.included !== false);

  if (includedCharges.length) {
    includedCharges.forEach((c) => {
      y = ensureSpace(y, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...CHARCOAL);
      doc.text(c.name, MX + 16, y);
      doc.text(`+ ${fmt(c.amount)}`, W - MX - 16, y, { align: "right" });
      y += 16;
    });
    y += 4;
  }

  // Full-width grand total bar
  y = ensureSpace(y, 40);
  doc.setFillColor(...BEIGE);
  doc.roundedRect(MX, y, CW, 30, 3, 3, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.roundedRect(MX, y, CW, 30, 3, 3, "S");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...CHARCOAL);
  doc.text("Grand Total (Including All Taxes)", MX + 16, y + 20);
  doc.setTextColor(...GOLD);
  doc.text(fmt(grandTotal), W - MX - 16, y + 20, { align: "right" });
  y += 38;

  // ---- Excluded Charges (below Grand Total) ----
  const excludedCharges = (quotationCharges || []).filter((c) => Number(c.amount) > 0 && c.included === false);

  if (excludedCharges.length) {
    y = ensureSpace(y, 30 + excludedCharges.length * 16);
    y += 6;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(MX, y, CW, 20, 2, 2, "F");
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(MX, y, CW, 20, 2, 2, "S");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Excluded Charges — Not Included in Grand Total", MX + 10, y + 13);
    y += 32;
    excludedCharges.forEach((c) => {
      y = ensureSpace(y, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...CHARCOAL);
      doc.text(c.name, MX + 10, y);
      doc.text(fmt(c.amount), W - MX - 10, y, { align: "right" });
      y += 14;
    });
    y += 6;
  }

  // ---- Excluded Modules ----
  const excludedMods = (rooms || []).flatMap((r) =>
    (r.modules || [])
      .filter((m) => m.include_in_total === false)
      .map((m) => ({ room_name: r.room_name, module_name: m.module_name || "Module", amount: m.amount || bd(m).total || 0 }))
  );

  if (excludedMods.length) {
    y = ensureSpace(y, 30 + excludedMods.length * 16);
    y += 6;
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(MX, y, CW, 20, 2, 2, "F");
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.5);
    doc.roundedRect(MX, y, CW, 20, 2, 2, "S");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("Excluded Modules — Not Included in Grand Total", MX + 10, y + 13);
    y += 32;
    excludedMods.forEach((m) => {
      y = ensureSpace(y, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...CHARCOAL);
      doc.text(`${m.module_name} (${m.room_name})`, MX + 10, y);
      doc.text(fmt(m.amount), W - MX - 10, y, { align: "right" });
      y += 14;
    });
  }

  // ===================== FOOTER SECTIONS =====================
  const parseMilestones = (text) => {
    if (!text) return [];
    return text.split(/[\n,;]+/).map((part) => {
      const match = part.match(/(\d+(?:\.\d+)?)\s*%/);
      if (!match) return null;
      const label = part.replace(/(\d+(?:\.\d+)?)\s*%/, "").trim().replace(/^[-–—:.\s]+/, "").trim();
      return { pct: parseFloat(match[1]), label: label || part.trim() };
    }).filter(Boolean);
  };

  const bankLines = [
    config?.bank_name && `Bank: ${config.bank_name}`,
    config?.bank_account_name && `Account Name: ${config.bank_account_name}`,
    config?.bank_account_number && `Account No: ${config.bank_account_number}`,
    config?.bank_ifsc && `IFSC: ${config.bank_ifsc}`,
    config?.bank_branch && `Branch: ${config.bank_branch}`,
  ].filter(Boolean);

  const footerSections = [
    ["Payment Structure", config?.payment_structure],
    ["Material Description", config?.material_description],
    ["Terms & Conditions", config?.terms_conditions],
    ["Site Usage & Terms", config?.site_usage_terms],
  ].filter(([, v]) => v && v.trim());

  if (footerSections.length || bankLines.length || notes || config?.footer_note) {
    y = ensureSpace(y, 30);
    y += 10;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1);
    doc.line(MX, y, W - MX, y);
    y += 14;

    const writeLine = (text, font, size, color, indent = 0) => {
      y = ensureSpace(y, size + 5);
      doc.setFont("helvetica", font);
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(text, MX + indent, y);
      y += size + 5;
    };

    footerSections.forEach(([label, content]) => {
      if (label === "Payment Structure") {
        const milestones = parseMilestones(content);
        if (milestones.length) {
          const colDesc = CW * 0.58;
          const colPct = CW * 0.16;
          const colAmt = CW * 0.26;

          // Estimate total table height
          doc.setFontSize(8);
          const totalTableH = 22 + milestones.reduce((s, ms) => {
            const lines = wrap(doc, ms.label, colDesc - 10);
            return s + Math.max(20, lines.length * 11 + 8);
          }, 0);
          y = ensureSpace(y, totalTableH);

          // Gold header
          doc.setFillColor(...GOLD);
          doc.rect(MX, y, CW, 22, "F");
          doc.setDrawColor(...CHARCOAL);
          doc.setLineWidth(0.5);
          doc.rect(MX, y, CW, 22);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(...WHITE);
          doc.text("PAYMENT STRUCTURE", MX + CW / 2, y + 15, { align: "center" });
          y += 22;

          milestones.forEach((ms) => {
            const amt = (grandTotal || 0) * ms.pct / 100;
            doc.setFontSize(8);
            const descLines = wrap(doc, ms.label, colDesc - 10);
            const rowH = Math.max(22, descLines.length * 11 + 10);
            y = ensureSpace(y, rowH);
            doc.setDrawColor(...CHARCOAL);
            doc.setLineWidth(0.5);
            doc.rect(MX, y, CW, rowH);
            doc.line(MX + colDesc, y, MX + colDesc, y + rowH);
            doc.line(MX + colDesc + colPct, y, MX + colDesc + colPct, y + rowH);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...CHARCOAL);
            descLines.forEach((l, li) => doc.text(l, MX + 6, y + 14 + li * 11));
            doc.text(`${ms.pct}%`, MX + colDesc + colPct / 2, y + 14, { align: "center" });
            doc.text(fmt(amt), MX + colDesc + colPct + colAmt - 6, y + 14, { align: "right" });
            y += rowH;
          });
          y += 10;
          return;
        }
      }

      // Section heading
      writeLine(label.toUpperCase(), "bold", 9, GOLD);
      // Content as bulleted list (split on newlines, render each as a bullet)
      const rawLines = String(content).split(/\n/);
      const bulletIndent = 12;
      const bulletGap = 10;
      rawLines.forEach((rawLine) => {
        const trimmed = rawLine.trim();
        if (!trimmed) { y += 4; return; }
        // Strip any existing bullet markers (*, -, •, ·) at start
        const text = trimmed.replace(/^[-*•·▪]\s*/, "");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...CHARCOAL);
        const lines = wrap(doc, text, CW - bulletIndent - bulletGap - 4);
        lines.forEach((l, li) => {
          y = ensureSpace(y, 12);
          if (li === 0) doc.text("•", MX + bulletIndent, y);
          doc.text(l, MX + bulletIndent + bulletGap, y);
          y += 11;
        });
        y += 2;
      });
      y += 5;
    });

    if (bankLines.length) {
      writeLine("BANK DETAILS", "bold", 9, GOLD);
      bankLines.forEach((l) => writeLine(l, "normal", 8, CHARCOAL, 4));
      y += 5;
    }

    if (notes) {
      writeLine("NOTES", "bold", 9, GOLD);
      wrap(doc, notes, CW - 6).forEach((l) => writeLine(l, "normal", 8, CHARCOAL, 4));
    }

    if (config?.footer_note) {
      wrap(doc, config.footer_note, CW).forEach((l) => writeLine(l, "italic", 8, CHARCOAL));
    }
  }

  // ===================== PAGE FOOTER ON EVERY PAGE =====================
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(MX, H - 28, W - MX, H - 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...CHARCOAL);
    doc.text(config?.company_name || "Terranest Interiors", MX, H - 16);
    doc.text(`Page ${p} of ${pages}`, W - MX, H - 16, { align: "right" });
  }

  doc.save(`Quotation_${(quotation.client_name || "export").replace(/\s+/g, "_")}.pdf`);
}