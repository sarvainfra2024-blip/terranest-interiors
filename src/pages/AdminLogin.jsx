import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function AdminLogin() {
  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/admin");
  };

  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Admin Access"
      subtitle="Sign in with your Google account to access the admin panel"
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
    </AuthLayout>
  );
}