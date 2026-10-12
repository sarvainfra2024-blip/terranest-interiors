import React, { useState } from "react";
import AdminHomePage from "@/components/admin/page-editors/AdminHomePage";
import AdminAboutPage from "@/components/admin/page-editors/AdminAboutPage";
import AdminServicesPage from "@/components/admin/page-editors/AdminServicesPage";
import AdminPortfolioPage from "@/components/admin/page-editors/AdminPortfolioPage";
import AdminProcessPage from "@/components/admin/page-editors/AdminProcessPage";
import AdminWhyChoosePage from "@/components/admin/page-editors/AdminWhyChoosePage";
import AdminBrandLogos from "@/components/admin/AdminBrandLogos";
import AdminOfficesPage from "@/components/admin/page-editors/AdminOfficesPage";

const tabs = [
  { id: "home", label: "🏠 Home" },
  { id: "about", label: "👥 About" },
  { id: "services", label: "🛋️ Services" },
  { id: "portfolio", label: "🖼️ Portfolio" },
  { id: "process", label: "🔄 Process" },
  { id: "why", label: "✅ Why Terranest" },
  { id: "brands", label: "🏷️ Brand Logos" },
  { id: "offices", label: "🏢 Our Offices" },
];

export default function AdminPageEditor() {
  const [active, setActive] = useState("home");

  return (
    <div>
      <h2 className="font-heading text-2xl text-charcoal mb-6">Page Editor</h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2.5 text-sm font-body font-medium whitespace-nowrap border-b-2 transition-colors ${
              active === tab.id
                ? "border-gold text-gold"
                : "border-transparent text-gray-500 hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "home" && <AdminHomePage />}
      {active === "about" && <AdminAboutPage />}
      {active === "services" && <AdminServicesPage />}
      {active === "portfolio" && <AdminPortfolioPage />}
      {active === "process" && <AdminProcessPage />}
      {active === "why" && <AdminWhyChoosePage />}
      {active === "brands" && <AdminBrandLogos />}
      {active === "offices" && <AdminOfficesPage />}
    </div>
  );
}