import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function QuotationLogin() {
  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/quotation-domain");
  };

  return (
    <AuthLayout
      icon={Receipt}
      title="Quotation Generate Domain"
      subtitle="Sign in with your Google account to access the quotation domain"
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