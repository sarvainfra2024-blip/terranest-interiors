import React from "react";
import CrudPage from "@/components/admin/CrudPage";

const fields = [
  { key: "title", label: "Title", type: "text" },
  { key: "short_desc", label: "Short Description", type: "text" },
  { key: "description", label: "Full Description", type: "textarea" },
  { key: "image", label: "Service Image", type: "image" },
  { key: "icon", label: "Icon (lucide name)", type: "text", placeholder: "Home, Kitchen, etc." },
  { key: "features", label: "Features", type: "list" },
  { key: "order", label: "Display Order", type: "number", default: 0 },
];

const listColumns = [
  { key: "image", label: "Image" },
  { key: "title", label: "Title" },
  { key: "short_desc", label: "Description" },
];

export default function AdminServices() {
  return <CrudPage entityName="Service" title="Services" fields={fields} listColumns={listColumns} />;
}