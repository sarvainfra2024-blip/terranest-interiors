import React from "react";
import CrudPage from "@/components/admin/CrudPage";

const fields = [
  { key: "title", label: "Title", type: "text" },
  { key: "category", label: "Category", type: "text", placeholder: "Design Tips, Trends, etc." },
  { key: "excerpt", label: "Excerpt", type: "textarea" },
  { key: "content", label: "Full Content", type: "textarea" },
  { key: "image", label: "Cover Image", type: "image" },
  { key: "author", label: "Author", type: "text" },
  { key: "read_time", label: "Read Time", type: "text", placeholder: "5 min read" },
  { key: "featured", label: "Featured", type: "boolean" },
  { key: "order", label: "Display Order", type: "number", default: 0 },
];

const listColumns = [
  { key: "image", label: "Image" },
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "author", label: "Author" },
  { key: "featured", label: "Featured" },
];

export default function AdminBlog() {
  return <CrudPage entityName="BlogPost" title="Blog Posts" fields={fields} listColumns={listColumns} />;
}