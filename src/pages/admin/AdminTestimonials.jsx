import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react";
import moment from "moment";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  public: "bg-blue-100 text-blue-700",
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    base44.entities.Testimonial.list("-created_date", 100).then(setTestimonials).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const toggle = async (id, field, val) => {
    await base44.entities.Testimonial.update(id, { [field]: val });
    setTestimonials((prev) => prev.map((t) => t.id === id ? { ...t, [field]: val } : t));
  };

  const remove = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    await base44.entities.Testimonial.delete(id);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const pending = testimonials.filter((t) => !t.is_approved);
  const approved = testimonials.filter((t) => t.is_approved);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-charcoal">Testimonials</h2>
        <button onClick={fetch} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-yellow-700 bg-yellow-50 px-4 py-2 rounded-sm mb-3">
                ⏳ Pending Review ({pending.length})
              </h3>
              <div className="space-y-3">
                {pending.map((t) => (
                  <TestimonialCard key={t.id} t={t} onToggle={toggle} onDelete={remove} />
                ))}
              </div>
            </div>
          )}

          {/* Approved */}
          <div>
            <h3 className="text-sm font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-sm mb-3">
              ✅ Approved ({approved.length})
            </h3>
            {approved.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 px-4">No approved testimonials yet.</p>
            ) : (
              <div className="space-y-3">
                {approved.map((t) => (
                  <TestimonialCard key={t.id} t={t} onToggle={toggle} onDelete={remove} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TestimonialCard({ t, onToggle, onDelete }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-heading text-base text-charcoal">{t.client_name}</span>
            {t.is_public && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Live on Site</span>}
          </div>
          <p className="text-xs text-gray-400 font-body mb-2">
            {[t.project_type, t.location].filter(Boolean).join(" · ")}
            {t.created_date && <span className="ml-2">· {moment(t.created_date).fromNow()}</span>}
          </p>
          <div className="flex gap-0.5 mb-2">
            {[...Array(t.rating || 5)].map((_, i) => <span key={i} className="text-gold text-xs">★</span>)}
          </div>
          <p className="text-sm font-body text-gray-600 italic">"{t.quote}"</p>
        </div>

        <div className="flex sm:flex-col gap-2 sm:items-end">
          {!t.is_approved ? (
            <button
              onClick={() => onToggle(t.id, "is_approved", true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-sm hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve
            </button>
          ) : (
            <button
              onClick={() => onToggle(t.id, "is_public", !t.is_public)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-sm transition-colors ${
                t.is_public
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 text-gray-600 hover:border-gold hover:text-gold"
              }`}
            >
              {t.is_public ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Show on Site</>}
            </button>
          )}
          <button
            onClick={() => onDelete(t.id)}
            className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-400 text-xs rounded-sm hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}