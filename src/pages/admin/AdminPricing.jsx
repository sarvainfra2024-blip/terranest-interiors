import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PricingTable from "@/components/admin/pricing/PricingTable";
import AddOnsManager from "@/components/admin/pricing/AddOnsManager";
import PricingConfigPanel from "@/components/admin/pricing/PricingConfigPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Tag, Settings, Package, Eye } from "lucide-react";

export default function AdminPricing() {
  const [showEstimate, setShowEstimate] = useState(true);
  const [settingId, setSettingId] = useState(null);
  const [loadingSetting, setLoadingSetting] = useState(true);

  useEffect(() => {
    base44.entities.SiteSetting.list().then((recs) => {
      if (recs && recs.length > 0) {
        setSettingId(recs[0].id);
        setShowEstimate(recs[0].show_instant_estimate ?? true);
      }
      setLoadingSetting(false);
    });
  }, []);

  const toggleEstimate = async (val) => {
    setShowEstimate(val);
    if (settingId) await base44.entities.SiteSetting.update(settingId, { show_instant_estimate: val });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-charcoal">Pricing Management</h2>
        <p className="text-gray-500 font-body text-sm mt-1">Manage packages, add-ons, and pricing configurations</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4 text-gold" />
          <div>
            <p className="text-sm font-medium text-charcoal">Show Instant Estimate on Public Pricing Page</p>
            <p className="text-xs text-gray-500">Toggle the pricing calculator section visible to site visitors.</p>
          </div>
        </div>
        {!loadingSetting && (
          <Switch checked={showEstimate} onCheckedChange={toggleEstimate} />
        )}
      </div>

      <Tabs defaultValue="packages">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="w-4 h-4" /> Packages
          </TabsTrigger>
          <TabsTrigger value="addons" className="flex items-center gap-2">
            <Tag className="w-4 h-4" /> Add-ons
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Tax & Charges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="mt-6">
          <PricingTable />
        </TabsContent>
        <TabsContent value="addons" className="mt-6">
          <AddOnsManager />
        </TabsContent>
        <TabsContent value="config" className="mt-6">
          <PricingConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}