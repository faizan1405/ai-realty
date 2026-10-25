import type { Property } from "@/data/site";
import { properties, areaSqft } from "@/data/site";

export type Filters = { q: string; status: "" | "Sale" | "Rent"; type: string; locality: string; budget: string; beds: string; area: string };
export const defaultFilters: Filters = { q: "", status: "", type: "", locality: "", budget: "", beds: "", area: "" };

export const BUDGETS: Record<string, [number, number]> = {
  "Under ₹50K/mo": [0, 50000],
  "₹50K – ₹5L/mo": [50000, 500000],
  "Under ₹1.5 Cr": [500001, 15000000],
  "₹1.5 – 5 Cr": [15000000, 50000000],
  "₹5 Cr +": [50000000, Infinity],
};

export function applyFilters(list: Property[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  return list.filter((p) => {
    if (q && !`${p.title} ${p.locality} ${p.type}`.toLowerCase().includes(q)) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.type && p.type !== f.type) return false;
    if (f.locality && p.locality !== f.locality) return false;
    if (f.beds && (p.beds ?? 0) < Number(f.beds)) return false;
    if (f.area && areaSqft(p) < Number(f.area)) return false;
    if (f.budget) {
      const [lo, hi] = BUDGETS[f.budget] ?? [0, Infinity];
      if (p.price < lo || p.price > hi) return false;
    }
    return true;
  });
}

const sel = "w-full appearance-none border-0 border-b border-border bg-transparent py-2.5 text-sm outline-none focus:border-champagne";

export function PropertyFilters({ value: f, onChange, compact = false }: { value: Filters; onChange: (f: Filters) => void; compact?: boolean }) {
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...f, [k]: e.target.value });
  const localities = [...new Set(properties.map((p) => p.locality))];
  const types = [...new Set(properties.map((p) => p.type))];
  return (
    <div className={`grid gap-x-6 gap-y-4 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-8"}`}>
      <div className={compact ? "col-span-2" : "col-span-2"}>
        <input value={f.q} onChange={set("q")} placeholder="Search title or neighbourhood" className={sel} maxLength={80} />
      </div>
      <div className="col-span-2 flex border border-border text-xs uppercase tracking-[0.15em] lg:col-span-1">
        {(["", "Sale", "Rent"] as const).map((s) => (
          <button key={s} onClick={() => onChange({ ...f, status: s })} className={`flex-1 py-2 transition-colors ${f.status === s ? "bg-forest text-ivory" : "hover:bg-stone"}`}>{s ? (s === "Sale" ? "Buy" : "Rent") : "All"}</button>
        ))}
      </div>
      <select value={f.type} onChange={set("type")} className={sel}><option value="">Any type</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
      <select value={f.locality} onChange={set("locality")} className={sel}><option value="">Any location</option>{localities.map((t) => <option key={t}>{t}</option>)}</select>
      <select value={f.budget} onChange={set("budget")} className={sel}><option value="">Any budget</option>{Object.keys(BUDGETS).map((b) => <option key={b}>{b}</option>)}</select>
      <select value={f.beds} onChange={set("beds")} className={sel}><option value="">Any beds</option>{[2, 3, 4, 5].map((b) => <option key={b} value={b}>{b}+ beds</option>)}</select>
      <select value={f.area} onChange={set("area")} className={sel}><option value="">Any area</option>{[1500, 2500, 4000].map((b) => <option key={b} value={b}>{b.toLocaleString("en-IN")}+ sq ft</option>)}</select>
    </div>
  );
}
