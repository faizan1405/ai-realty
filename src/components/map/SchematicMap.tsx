import { formatINR, type Property } from "@/data/site";
import { neighbourhoods } from "@/data/map";
import { KeyRound } from "lucide-react";

const BOUNDS = { w: 78.1, e: 78.48, s: 17.39, n: 17.52 };
const xy = (lng: number, lat: number) => ({
  x: ((lng - BOUNDS.w) / (BOUNDS.e - BOUNDS.w)) * 100,
  y: (1 - (lat - BOUNDS.s) / (BOUNDS.n - BOUNDS.s)) * 100,
});

/** Shown when no Mapbox token is configured. A schematic plot, clearly labelled — not a live map. */
export function SchematicMap({ items, selectedId, hoveredId, onSelect, onHover, compact = false }: { items: Property[]; selectedId: string | null; hoveredId: string | null; onSelect: (id: string) => void; onHover: (id: string | null) => void; compact?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-stone">
      <div className="blueprint absolute inset-0 opacity-70" />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
        <path d="M0 62 C 20 58, 35 70, 55 55 S 85 40, 100 46" stroke="var(--border)" strokeWidth="0.6" fill="none" />
        <path d="M30 0 C 34 30, 46 50, 44 100" stroke="var(--border)" strokeWidth="0.6" fill="none" />
        <path d="M0 30 C 30 34, 60 20, 100 26" stroke="var(--border)" strokeWidth="0.4" fill="none" />
      </svg>
      {neighbourhoods.map((n) => {
        const p = xy(...n.center);
        return <span key={n.name} className="eyebrow absolute -translate-x-1/2 text-[0.55rem] text-muted-foreground" style={{ left: `${p.x}%`, top: `calc(${p.y}% + 18px)` }}>{n.name}</span>;
      })}
      {items.map((it) => {
        const p = xy(it.lng, it.lat);
        const on = it.id === selectedId || it.id === hoveredId;
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            onMouseEnter={() => onHover(it.id)}
            onMouseLeave={() => onHover(null)}
            className={`absolute -translate-x-1/2 -translate-y-full whitespace-nowrap border px-2.5 py-1 text-[11px] font-semibold shadow-float transition-all duration-300 ${on ? "z-10 scale-110 border-champagne bg-champagne text-charcoal" : "border-charcoal/10 bg-ivory text-charcoal"}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {formatINR(it.price, it.status === "Rent")}
          </button>
        );
      })}
      <div className={`absolute ${compact ? "bottom-4 left-4 right-4" : "bottom-6 left-6 max-w-sm"} border bg-ivory/95 p-5 backdrop-blur`}>
        <p className="eyebrow flex items-center gap-2 text-forest"><KeyRound className="h-3.5 w-3.5" /> Live map not yet configured</p>
        {!compact && <p className="mt-2 text-sm text-muted-foreground">This is a schematic preview of approximate neighbourhood positions. The interactive Mapbox map with street detail, 3D buildings and fly-to will switch on once a Mapbox key is added.</p>}
      </div>
    </div>
  );
}
