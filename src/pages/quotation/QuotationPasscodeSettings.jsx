import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QuotationPasscodeSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.QuotationConfig.list();
      setConfig(list[0] || null);
      setLoading(false);
    })();
  }, []);

  const hasPasscode = !!(config && config.passcode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (hasPasscode && current !== config.passcode) {
      setError("Current passcode is incorrect.");
      return;
    }
    if (passcode.length < 4) {
      setError("New passcode must be at least 4 characters.");
      return;
    }
    if (passcode !== confirm) {
      setError("Passcodes do not match.");
      return;
    }
    setSaving(true);
    await base44.entities.QuotationConfig.update(config.id, { passcode });
    setSaving(false);
    setSuccess("Passcode updated successfully.");
    setCurrent("");
    setPasscode("");
    setConfirm("");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-charcoal">Passcode Settings</h2>
        <p className="text-gray-500 font-body text-sm mt-1">
          Set or change the passcode required to open the Quotation Generate Domain.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-100 p-6">
        {hasPasscode && (
          <div>
            <Label>Current Passcode</Label>
            <Input
              type="password"
              value={current}
              onChange={(e) => { setCurrent(e.target.value); setError(""); setSuccess(""); }}
            />
          </div>
        )}
        <div>
          <Label>New Passcode</Label>
          <Input
            type="password"
            value={passcode}
            onChange={(e) => { setPasscode(e.target.value); setError(""); setSuccess(""); }}
          />
        </div>
        <div>
          <Label>Confirm New Passcode</Label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(""); setSuccess(""); }}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-green-600">{success}</p>}
        <Button type="submit" className="bg-charcoal hover:bg-gold" disabled={saving}>
          {saving ? "Saving..." : "Update Passcode"}
        </Button>
      </form>
    </div>
  );
}