import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULT_BRANDS = [
  { id: "d1", name: "CenturyPly", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/CenturyPly_Logo.svg/320px-CenturyPly_Logo.svg.png" },
  { id: "d2", name: "Greenply", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Greenply_Logo.svg/320px-Greenply_Logo.svg.png" },
  { id: "d3", name: "Hettich", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Hettich_Logo.svg/320px-Hettich_Logo.svg.png" },
  { id: "d4", name: "Häfele", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/H%C3%A4fele_logo.svg/320px-H%C3%A4fele_logo.svg.png" },
  { id: "d5", name: "Ebco", logo_url: "https://www.ebco.in/images/logo.png" },
  { id: "d6", name: "Merino Laminates", logo_url: "https://www.merinogroup.com/wp-content/uploads/2021/01/merino-logo.png" },
  { id: "d7", name: "Royale Touche", logo_url: "https://www.royaletouche.com/images/logo.png" },
  { id: "d8", name: "Greenlam", logo_url: "https://www.greenlam.com/wp-content/uploads/2020/06/greenlam-logo.png" },
];

function LogoCard({ brand }) {
  return (
    <div
      className="brand-logo-card flex-shrink-0 mx-4 flex items-center justify-center"
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid #ECECEC",
        padding: "20px 32px",
        height: "88px",
        minWidth: "160px",
        transition: "transform 300ms ease, box-shadow 300ms ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08) translateY(-7px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(200,155,60,0.22), 0 4px 16px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1) translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
      }}
    >
      <img
        src={brand.logo_url}
        alt={`${brand.name} logo`}
        loading="lazy"
        style={{ height: "44px", width: "auto", maxWidth: "140px", objectFit: "contain" }}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "block";
        }}
      />
      <span
        style={{ display: "none", fontSize: "13px", fontWeight: 600, color: "#232323", whiteSpace: "nowrap" }}
      >
        {brand.name}
      </span>
    </div>
  );
}

export default function BrandMarquee() {
  const [brands, setBrands] = useState(DEFAULT_BRANDS);
  const [paused, setPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    base44.entities.BrandLogo.filter({ is_active: true }, "order", 50)
      .then((recs) => { if (recs && recs.length > 0) setBrands(recs); })
      .catch(() => {});
  }, []);

  const displayed = [...brands, ...brands];

  return (
    <section className="py-16 bg-offwhite overflow-hidden" aria-label="Our trusted brand partners">
      <div className="container-luxe mb-10 text-center">
        <span className="label-tech text-gold mb-3 block">Trusted Brands</span>
        <h2 className="font-heading text-2xl md:text-3xl text-charcoal">Materials We Trust</h2>
        <div className="gold-line w-12 mx-auto mt-4" />
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 30s linear infinite;
          will-change: transform;
        }
        .marquee-track.paused {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; }
        }
        .brand-logo-card:focus-visible {
          outline: 2px solid #C89B3C;
          outline-offset: 3px;
        }
      `}</style>

      <div
        className="relative w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
        role="region"
        aria-label="Scrolling brand logos"
      >
        <div
          ref={trackRef}
          className={`marquee-track${paused || prefersReduced ? " paused" : ""}`}
        >
          {displayed.map((brand, i) => (
            <LogoCard key={`${brand.id || brand.name}-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}