import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, Box, Package, Wrench, Sparkles, HardHat, Settings2, MoreHorizontal } from "lucide-react";
import RateTable from "@/components/admin/rates/RateTable";
import RateDashboard from "@/components/admin/rates/RateDashboard";
import HardwareManager from "@/components/admin/rates/HardwareManager";
import AccessoryManager from "@/components/admin/rates/AccessoryManager";

export default function AdminRateMaster() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.RateMaster.list();
    setRates(data || []);
    setLoading(false);
  };

  // Silent reload (no spinner) so saving a rate doesn't reset the active tab.
  const reload = async () => {
    const data = await base44.entities.RateMaster.list();
    setRates(data || []);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Rate Master</h1>
        <p className="text-sm text-gray-500 mt-1">Centralized pricing engine. Rates defined here auto-apply across all quotations based on dimensions & units.</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 p-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs"><LayoutDashboard className="w-4 h-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="Carcass Material" className="flex items-center gap-2 text-xs"><Box className="w-4 h-4" /> Carcass Material</TabsTrigger>
          <TabsTrigger value="Shutter Material" className="flex items-center gap-2 text-xs"><Box className="w-4 h-4" /> Shutter Material</TabsTrigger>
          <TabsTrigger value="Accessory" className="flex items-center gap-2 text-xs"><Package className="w-4 h-4" /> Accessories</TabsTrigger>
          <TabsTrigger value="Hardware" className="flex items-center gap-2 text-xs"><Wrench className="w-4 h-4" /> Hardware</TabsTrigger>
          <TabsTrigger value="Finish" className="flex items-center gap-2 text-xs"><Sparkles className="w-4 h-4" /> Finishes</TabsTrigger>
          <TabsTrigger value="Internal Finish" className="flex items-center gap-2 text-xs"><Sparkles className="w-4 h-4" /> Internal Finish</TabsTrigger>
          <TabsTrigger value="Labour" className="flex items-center gap-2 text-xs"><HardHat className="w-4 h-4" /> Labour</TabsTrigger>
          <TabsTrigger value="Installation" className="flex items-center gap-2 text-xs"><Settings2 className="w-4 h-4" /> Installation</TabsTrigger>
          <TabsTrigger value="Other" className="flex items-center gap-2 text-xs"><MoreHorizontal className="w-4 h-4" /> Other</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-5"><RateDashboard rates={rates} /></TabsContent>
        <TabsContent value="Carcass Material" className="mt-5"><RateTable rateType="Carcass Material" rates={rates} onReload={reload} /></TabsContent>
        <TabsContent value="Shutter Material" className="mt-5"><RateTable rateType="Shutter Material" rates={rates} onReload={reload} /></TabsContent>
        <TabsContent value="Accessory" className="mt-5"><AccessoryManager rates={rates} onReload={reload} /></TabsContent>
        <TabsContent value="Hardware" className="mt-5"><HardwareManager rates={rates} onReload={reload} /></TabsContent>
        <TabsContent value="Finish" className="mt-5"><RateTable rateType="Finish" rates={rates} onReload={reload} /></TabsContent>
        <TabsContent value="Internal Finish" className="mt-5"><RateTable rateType="Internal Finish" rates={rates} onReload={reload} /></TabsContent>
        <TabsContent value="Labour" className="mt-5"><RateTable rateType="Labour" rates={rates} onReload={reload} /></TabsContent>
        <TabsContent value="Installation" className="mt-5"><RateTable rateType="Installation" rates={rates} onReload={reload} /></TabsContent>
        <TabsContent value="Other" className="mt-5"><RateTable rateType="Other" rates={rates} onReload={reload} /></TabsContent>
      </Tabs>
    </div>
  );
}