import React from "react";
import CrudPage from "@/components/admin/CrudPage";

const fields = [
  { key: "title", label: "Title", type: "text" },
  { key: "category", label: "Category", type: "select", options: ["Modern", "Minimal", "Luxury", "Traditional", "Industrial", "Scandinavian"] },
  { key: "style", label: "Style", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "dimensions", label: "Dimensions", type: "text" },
  { key: "budget", label: "Budget", type: "text" },
  { key: "duration", label: "Duration", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "image", label: "Project Image", type: "image" },
  { key: "client_name", label: "Client Name", type: "text" },
  { key: "testimonial", label: "Client Testimonial", type: "textarea" },
  { key: "featured", label: "Featured on Home Page", type: "boolean" },
  { key: "order", label: "Display Order", type: "number", default: 0 },
];

const listColumns = [
  { key: "image", label: "Image" },
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "location", label: "Location" },
  { key: "featured", label: "Featured" },
];

export default function AdminProjects() {
  return <CrudPage entityName="Project" title="Projects" fields={fields} listColumns={listColumns} />;
}