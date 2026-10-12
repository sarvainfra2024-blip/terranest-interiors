import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, MapPin, MessageSquare, RefreshCw, Clock, UserPlus } from "lucide-react";
import moment from "moment";
import OnboardingModal from "@/components/admin/projects/OnboardingModal";

const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Qualified: "bg-purple-100 text-purple-700",
  Converted: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

const STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"];

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(null);

  const fetchLeads = () => {
    setLoading(true);
    base44.entities.Lead.list("-created_date", 100)
      .then(setLeads)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.Lead.update(id, { status });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  };

  const deleteLead = async (id) => {
    if (!confirm("Delete this lead?")) return;
    await base44.entities.Lead.delete(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-charcoal">Consultation Leads</h2>
        <button onClick={fetchLeads} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gold rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-body">No leads yet. They'll appear here when someone books a consultation.</div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-sm border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading text-lg text-charcoal">{lead.name}</h3>
                    <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status] || STATUS_COLORS.New}`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm font-body text-gray-500">
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-gold">
                      <Phone className="w-3.5 h-3.5" /> {lead.phone}
                    </a>
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-gold">
                        <Mail className="w-3.5 h-3.5" /> {lead.email}
                      </a>
                    )}
                    {lead.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {lead.location}
                      </span>
                    )}
                  </div>
                  {(lead.property_type || lead.budget) && (
                    <div className="flex gap-3 text-xs font-body">
                      {lead.property_type && <span className="px-2 py-0.5 bg-beige text-charcoal rounded-full">{lead.property_type}</span>}
                      {lead.budget && <span className="px-2 py-0.5 bg-beige text-charcoal rounded-full">{lead.budget}</span>}
                    </div>
                  )}
                  {lead.message && (
                    <p className="text-sm font-body text-gray-400 flex items-start gap-1">
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {lead.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 font-body flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {moment(lead.created_date).format("DD MMM YYYY, hh:mm A")}
                    <span className="text-gray-300 ml-1">({moment(lead.created_date).fromNow()})</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <select
                    value={lead.status || "New"}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    className="text-sm border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gold"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {lead.status === "Converted" && (
                    <button
                      onClick={() => setOnboarding(lead)}
                      className="inline-flex items-center gap-1 text-xs text-gold border border-gold rounded-sm px-2 py-1 hover:bg-gold hover:text-white transition-colors"
                    >
                      <UserPlus className="w-3 h-3" /> Onboard
                    </button>
                  )}
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {onboarding && (
        <OnboardingModal
          lead={onboarding}
          onClose={() => { setOnboarding(null); fetchLeads(); }}
        />
      )}
    </div>
  );
}