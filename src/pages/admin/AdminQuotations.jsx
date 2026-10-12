import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuotationConfigPanel from "@/components/admin/quotations/QuotationConfigPanel";
import RoomOptionsManager from "@/components/admin/quotations/RoomOptionsManager";
import ModuleTypeManager from "@/components/admin/rates/ModuleTypeManager";
import QuotationGenerator from "@/components/admin/quotations/QuotationGenerator";
import QuotationList from "@/components/admin/quotations/QuotationList";
import SubModuleManager from "@/components/admin/quotations/SubModuleManager";
import { FileText, Settings, ClipboardList, Plus, Box, Layers } from "lucide-react";

export default function AdminQuotations() {
  const [tab, setTab] = useState("list");
  const [listKey, setListKey] = useState(0);
  const [editQuotation, setEditQuotation] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-charcoal">Quotation Domain</h2>
        <p className="text-gray-500 font-body text-sm mt-1">Generate quotations, edit company details, and manage room options.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Quotations
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Generate Quotation
          </TabsTrigger>
          <TabsTrigger value="background" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Company Details
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Room Options
          </TabsTrigger>
          <TabsTrigger value="module-types" className="flex items-center gap-2">
            <Box className="w-4 h-4" /> Module Types
          </TabsTrigger>
          <TabsTrigger value="sub-modules" className="flex items-center gap-2">
            <Layers className="w-4 h-4" /> Sub Modules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <QuotationList key={listKey} onNew={() => { setEditQuotation(null); setTab("generate"); }} onEdit={(q) => { setEditQuotation(q); setTab("generate"); }} />
        </TabsContent>
        <TabsContent value="generate" className="mt-6">
          <QuotationGenerator key={editQuotation?.id || "new"} editQuotation={editQuotation} onSaved={() => setListKey(k => k + 1)} onGoToList={() => { setListKey(k => k + 1); setEditQuotation(null); setTab("list"); }} />
        </TabsContent>
        <TabsContent value="background" className="mt-6">
          <QuotationConfigPanel />
        </TabsContent>
        <TabsContent value="rooms" className="mt-6">
          <RoomOptionsManager />
        </TabsContent>
        <TabsContent value="module-types" className="mt-6">
          <ModuleTypeManager />
        </TabsContent>
        <TabsContent value="sub-modules" className="mt-6">
          <SubModuleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}