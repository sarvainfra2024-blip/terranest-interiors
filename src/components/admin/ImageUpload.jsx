import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ImageUpload({ value, onChange, label = "Image" }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-2">{label}</label>
      <div className="flex items-start gap-4">
        {value && (
          <div className="w-32 h-32 rounded-sm overflow-hidden bg-beige flex-shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-gold transition-colors bg-offwhite">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Click to upload</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          {value && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="or paste image URL"
              className="mt-2 w-full px-3 py-2 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-gold"
            />
          )}
        </div>
      </div>
    </div>
  );
}