import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  renderLabel = null,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  const normalized = (options || []).map((o) => (typeof o === "string" ? { name: o } : o));
  const selected = normalized.find((o) => o.name === value);
  const display = selected ? (renderLabel ? renderLabel(selected) : selected.name) : "";

  const filtered = normalized.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const select = (name) => {
    onChange(name);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-8 text-xs border border-gray-200 rounded px-2 bg-white flex items-center justify-between gap-1 ${className}`}
      >
        <span className={`truncate flex-1 text-left ${display ? "text-charcoal" : "text-gray-400"}`}>
          {display || placeholder}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-1.5 border-b border-gray-100 relative flex-shrink-0">
            <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-7 text-xs pl-6 pr-2 border border-gray-200 rounded outline-none focus:border-gold"
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            <button
              type="button"
              onClick={() => select("")}
              className={`w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 ${!value ? "bg-gray-100 font-medium text-charcoal" : "text-gray-500"}`}
            >
              {placeholder}
            </button>
            {filtered.map((o) => (
              <button
                key={o.name}
                type="button"
                onClick={() => select(o.name)}
                className={`w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 ${value === o.name ? "bg-gray-100 font-medium text-charcoal" : "text-charcoal"}`}
              >
                {renderLabel ? renderLabel(o) : o.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-2 text-xs text-gray-400">No matches found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}