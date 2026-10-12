import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Lock, KeyRound } from "lucide-react";
import ResetPasscodeFlow from "./ResetPasscodeFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasscodeGate({ onUnlock }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.QuotationConfig.list();
      let cfg = list[0];
      if (!cfg) {
        cfg = await base44.entities.QuotationConfig.create({ company_name: "Terranest Interiors" });
      }
      setConfig(cfg);
      setLoading(false);
    })();
  }, []);

  const hasPasscode = !!(config && config.passcode);

  const handleEnter = (e) => {
    e.preventDefault();
    if (passcode !== config.passcode) {
      setError("Incorrect passcode. Please try again.");
      return;
    }
    onUnlock();
  };

  const handleSet = async (e) => {
    e.preventDefault();
    if (passcode.length < 4) {
      setError("Passcode must be at least 4 characters.");
      return;
    }
    if (passcode !== confirm) {
      setError("Passcodes do not match.");
      return;
    }
    setSaving(true);
    await base44.entities.QuotationConfig.update(config.id, { passcode });
    setSaving(false);
    onUnlock();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-charcoal rounded-full animate-spin" />
      </div>
    );
  }

  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite px-4">
        <ResetPasscodeFlow
          config={config}
          onReset={() => { setShowReset(false); setPasscode(""); setError(""); onUnlock(); }}
          onBack={() => setShowReset(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite px-4">
      <div className="w-full max-w-sm bg-white border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-charcoal rounded-sm flex items-center justify-center mb-4">
            {hasPasscode ? <Lock className="w-6 h-6 text-gold" /> : <KeyRound className="w-6 h-6 text-gold" />}
          </div>
          <h1 className="font-heading text-xl text-charcoal">
            {hasPasscode ? "Enter Passcode" : "Set Passcode"}
          </h1>
          <p className="text-xs text-gray-500 font-body mt-1">
            {hasPasscode
              ? "Enter the passcode to access the Quotation Generate Domain."
              : "Set a passcode to secure the Quotation Generate Domain."}
          </p>
        </div>
        <form onSubmit={hasPasscode ? handleEnter : handleSet} className="space-y-4">
          <div>
            <Label>{hasPasscode ? "Passcode" : "New Passcode"}</Label>
            <Input
              type="password"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(""); }}
              autoFocus
            />
          </div>
          {!hasPasscode && (
            <div>
              <Label>Confirm Passcode</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(""); }}
              />
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" className="w-full bg-charcoal hover:bg-gold" disabled={saving}>
            {saving ? "Saving..." : hasPasscode ? "Unlock" : "Set & Unlock"}
          </Button>
          {hasPasscode && (
            <button
              type="button"
              onClick={() => { setShowReset(true); setError(""); }}
              className="w-full text-xs text-gray-500 hover:text-gold text-center"
            >
              Forgot Passcode?
            </button>
          )}
        </form>
      </div>
    </div>
  );
}