import React from "react";
import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function WhatsAppButton() {
  const { settings } = useSiteSettings();
  const number = settings.whatsapp_number || "919876543210";

  return (
    <a
      href={`https://wa.me/${number}?text=Hi%2C%20I%27m%20interested%20in%20interior%20design%20services`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}