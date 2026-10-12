import React from "react";
import { Box, Wrench, Sparkles, Hammer, HardHat, Package, TrendingUp, Clock } from "lucide-react";

const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded flex items-center justify-center ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-charcoal">{value}</p>
      </div>
    </div>
  );
}

export default function RateDashboard({ rates }) {
  const byType = (t) => rates.filter((r) => r.rate_type === t);
  const materials = byType("Material");
  const accessories = byType("Accessory");
  const hardware = byType("Hardware");
  const finishes = byType("Finish");
  const active = rates.filter((r) => r.is_active);
  const inactive = rates.filter((r) => !r.is_active);

  const today = new Date().toISOString().slice(0, 10);
  const expiringSoon = rates.filter(
    (r) =>
      r.is_active &&
      r.effective_until &&
      r.effective_until >= today &&
      (new Date(r.effective_until).getTime() - Date.now()) / 86400000 <= 30
  );

  const avgMaterial =
    materials.length > 0
      ? fmt(materials.reduce((s, r) => s + (Number(r.rate) || 0), 0) / materials.length)
      : "—";

  const recent = [...rates]
    .filter((r) => r.updated_date)
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Box} label="Materials" value={materials.length} tone="bg-blue-50 text-blue-600" />
        <StatCard icon={Package} label="Accessories" value={accessories.length} tone="bg-amber-50 text-amber-600" />
        <StatCard icon={Wrench} label="Hardware" value={hardware.length} tone="bg-purple-50 text-purple-600" />
        <StatCard icon={Sparkles} label="Finishes" value={finishes.length} tone="bg-pink-50 text-pink-600" />
        <StatCard icon={TrendingUp} label="Active Rates" value={active.length} tone="bg-green-50 text-green-600" />
        <StatCard icon={Clock} label="Inactive Rates" value={inactive.length} tone="bg-gray-100 text-gray-500" />
        <StatCard icon={Hammer} label="Expiring ≤30d" value={expiringSoon.length} tone="bg-orange-50 text-orange-600" />
        <StatCard icon={HardHat} label="Avg Material Rate" value={avgMaterial} tone="bg-teal-50 text-teal-600" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-sm text-charcoal mb-3">Recently Updated Rates</h4>
        {recent.length === 0 ? (
          <p className="text-xs text-gray-400">No recent updates.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                <div>
                  <span className="font-medium text-charcoal">{r.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{r.rate_type}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{fmt(r.rate)}</span>
                  <span className="text-xs text-gray-400 ml-2">{r.rate_unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}