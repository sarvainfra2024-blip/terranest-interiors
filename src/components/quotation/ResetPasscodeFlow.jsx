import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

const AUTHORIZED_EMAILS = [
  "workpavanindia@gmail.com",
  "swaroopraj@terranestinteriors.com",
];

const OTP_EXPIRY_MINUTES = 15;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export default function ResetPasscodeFlow({ config, onReset, onBack }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp+new passcode
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const normalized = email.trim().toLowerCase();
    if (!AUTHORIZED_EMAILS.includes(normalized)) {
      // Do not reveal whether the email is authorized.
      setInfo(
        "If this email is authorized, a reset code has been sent. Please check your inbox."
      );
      setStep(2);
      return;
    }

    setBusy(true);
    try {
      // Invalidate any previous unused tokens for this email
      const existing = await base44.entities.PasscodeResetToken.filter({
        email: normalized,
        used: false,
      });
      if (existing && existing.length) {
        await base44.entities.PasscodeResetToken.bulkUpdate(
          existing.map((t) => ({ id: t.id, used: true }))
        );
      }

      const code = generateOtp();
      const expiresAt = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
      ).toISOString();

      await base44.entities.PasscodeResetToken.create({
        email: normalized,
        otp_code: code,
        expires_at: expiresAt,
        used: false,
      });

      const company = config?.company_name || "Terranest Interiors";
      const subject = "Quotation Domain — Passcode Reset Code";
      const body = `Hello,\n\nYou requested a passcode reset for the Quotation Generate Domain.\n\nYour verification code is: ${code}\n\nThis code is valid for ${OTP_EXPIRY_MINUTES} minutes. If you did not request this reset, please ignore this email.\n\nRegards,\n${company}`;

      await base44.integrations.Core.SendEmail({
        to: normalized,
        subject,
        body,
      });

      setInfo(
        "A verification code has been sent to your email. Enter it below with your new passcode."
      );
      setStep(2);
    } catch (err) {
      setError("Unable to send reset code. Please try again.");
    }
    setBusy(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (passcode.length < 4) {
      setError("New passcode must be at least 4 characters.");
      return;
    }
    if (passcode !== confirm) {
      setError("Passcodes do not match.");
      return;
    }

    setBusy(true);
    try {
      const normalized = email.trim().toLowerCase();
      const tokens = await base44.entities.PasscodeResetToken.filter({
        email: normalized,
        used: false,
      });
      const valid = (tokens || []).find(
        (t) =>
          t.otp_code === otp.trim() &&
          new Date(t.expires_at) > new Date()
      );

      if (!valid) {
        setError("Invalid or expired verification code. Please try again.");
        setBusy(false);
        return;
      }

      // Mark token as used (single-use)
      await base44.entities.PasscodeResetToken.update(valid.id, { used: true });

      // Invalidate all other unused tokens for this email
      const remaining = (tokens || []).filter((t) => t.id !== valid.id);
      if (remaining.length) {
        await base44.entities.PasscodeResetToken.bulkUpdate(
          remaining.map((t) => ({ id: t.id, used: true }))
        );
      }

      // Update the passcode
      await base44.entities.QuotationConfig.update(config.id, { passcode });

      setBusy(false);
      onReset();
    } catch (err) {
      setError("Unable to reset passcode. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white border border-gray-100 p-8 shadow-sm">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 bg-charcoal rounded-sm flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-gold" />
        </div>
        <h1 className="font-heading text-xl text-charcoal">Reset Passcode</h1>
        <p className="text-xs text-gray-500 font-body mt-1">
          {step === 1
            ? "Enter your authorized email to receive a verification code."
            : "Enter the code sent to your email and your new passcode."}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <Label>Registered Email</Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setInfo(""); }}
                placeholder="you@example.com"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {info && <p className="text-xs text-green-600">{info}</p>}
          <Button type="submit" className="w-full bg-charcoal hover:bg-gold" disabled={busy}>
            {busy ? "Sending..." : "Send Verification Code"}
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-charcoal"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Passcode Entry
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset} className="space-y-4">
          {info && <p className="text-xs text-green-600">{info}</p>}
          <div>
            <Label>Verification Code</Label>
            <Input
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(""); }}
              placeholder="6-digit code"
              maxLength={6}
              autoFocus
            />
          </div>
          <div>
            <Label>New Passcode</Label>
            <Input
              type="password"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(""); }}
            />
          </div>
          <div>
            <Label>Confirm New Passcode</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" className="w-full bg-charcoal hover:bg-gold" disabled={busy}>
            {busy ? "Resetting..." : "Reset Passcode"}
          </Button>
          <button
            type="button"
            onClick={() => { setStep(1); setError(""); setOtp(""); }}
            className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-charcoal"
          >
            <ArrowLeft className="w-3 h-3" /> Change Email
          </button>
        </form>
      )}
    </div>
  );
}