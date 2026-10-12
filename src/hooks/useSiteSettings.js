import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Default fallback images
export const DEFAULT_IMAGES = {
  hero_image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/423e9ac3a_generated_e9cd5c33.png",
  about_image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/1aac88889_generated_61802ade.png",
  cta_bg_image: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/423e9ac3a_generated_e9cd5c33.png",
  img_service_home: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/e40b0b8df_generated_92a3ebf5.png",
  img_service_kitchen: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/6a45725a1_generated_d0acb857.png",
  img_service_bedroom: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/75eab5d34_generated_082a0cc5.png",
  img_service_living: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/e40b0b8df_generated_92a3ebf5.png",
  img_service_lighting: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/b7b02bc36_generated_6832446d.png",
  img_service_space: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/8b2c6f0bc_generated_9cb8a94e.png",
  img_service_dining: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/92c8c11fb_generated_6a4bab6f.png",
  img_service_wardrobe: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/e54c7a3b6_generated_67436102.png",
  img_service_ceiling: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/b7b02bc36_generated_6832446d.png",
  img_service_furniture: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/e40b0b8df_generated_92a3ebf5.png",
  img_service_villa: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/2a24f5443_generated_ca680039.png",
  img_service_commercial: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/2ea3fa57a_generated_a0acb9ba.png",
  img_service_renovation: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/6f895cb42_generated_cde03b4a.png",
  img_portfolio_1: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/e40b0b8df_generated_92a3ebf5.png",
  img_portfolio_2: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/6a45725a1_generated_d0acb857.png",
  img_portfolio_3: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/75eab5d34_generated_082a0cc5.png",
  img_portfolio_4: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/2a24f5443_generated_ca680039.png",
  img_portfolio_5: "https://media.base44.com/images/public/6a3e1cfb358208eda6bb0df5/92c8c11fb_generated_6a4bab6f.png",
};

let cachedSettings = null;
let listeners = [];

function notify(settings) {
  listeners.forEach((fn) => fn(settings));
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(cachedSettings || {});
  const [loaded, setLoaded] = useState(!!cachedSettings);

  useEffect(() => {
    const update = (s) => { setSettings(s); setLoaded(true); };
    listeners.push(update);

    if (!cachedSettings) {
      base44.entities.SiteSetting.list().then((records) => {
        const data = records?.[0] || {};
        cachedSettings = data;
        notify(data);
      });
    }

    return () => {
      listeners = listeners.filter((fn) => fn !== update);
    };
  }, []);

  // Update favicon to use the company logo
  useEffect(() => {
    if (settings.logo_url) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.type = "image/png";
      link.href = settings.logo_url;
    }
  }, [settings.logo_url]);

  // Helper: get image with fallback (empty until settings load to avoid flashing a wrong default image)
  const img = (key) => (loaded ? (settings[key] || DEFAULT_IMAGES[key] || "") : "");

  return { settings, img, loaded };
}