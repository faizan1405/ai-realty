import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Layers, List, Map as MapIcon, Moon, RotateCcw, Sun, ScanSearch, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { BottomSheet, type Snap } from "@/components/map/BottomSheet";
import { formatINR, properties, sizeLabel } from "@/data/site";
import { neighbourhoods, getMapboxToken } from "@/data/map";
import { SmartMap } from "@/components/map/SmartMap";
import type { MapApi } from "@/components/map/MapView";
import { DemoBadge } from "@/components/site/bits";
import { PropertyFilters, applyFilters, defaultFilters, type Filters } from "@/components/site/PropertyFilters";

export const Route = createFileRoute("/explore-map")({
  head: () => ({
    meta: [
      { title: "Explore the Map — A & I Realty Hyderabad" },
      { name: "description", content: "Explore properties across Hyderabad neighbourhoods on an interactive map with 2D and 3D views." },
      { property: "og:title", content: "Explore the Map — A & I Realty" },
      { property: "og:description", content: "Interactive property map of Hyderabad neighbourhoods." },
    ],
  }),
  component: ExploreMap,
});

function ExploreMap() {
  const [f, setF] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mode3d, setMode3d] = useState(false);
  const [dark, setDark] = useState(false);
  const [snap, setSnap] = useState<Snap>("collapsed");
  const [showFilters, setShowFilters] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<[number, number, number, number] | null>(null);
  const api = useRef<MapApi | null>(null);
  const live = !!getMapboxToken();

  const list = useMemo(() => {
    const base = applyFilters(properties, f);
    return area ? base.filter((p) => p.lng >= area[0] && p.lng <= area[2] && p.lat >= area[1] && p.lat <= area[3]) : base;
  }, [f, area]);
  const sel = properties.find((p) => p.id === selected);

  // keep the mobile carousel in sync with the selected marker
  useEffect(() => {
    if (!selected) return;
    const el = rail.current?.querySelector<HTMLElement>(`[data-id="${selected}"]`);
    const r = rail.current;
    if (el && r) r.scrollTo({ left: el.offsetLeft - (r.clientWidth - el.clientWidth) / 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setSnap((s) => (s === "full" ? "half" : s));
  }, [selected]);

  // swiping the mobile carousel makes the centred card the active home
  const swipeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRailScroll = () => {
    if (swipeTimer.current) clearTimeout(swipeTimer.current);
    swipeTimer.current = setTimeout(() => {
      const r = rail.current;
      if (!r) return;
      const mid = r.getBoundingClientRect().left + r.clientWidth / 2;
      let best: string | null = null, d = Infinity;
      r.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
        const b = el.getBoundingClientRect();
        const dd = Math.abs(b.left + b.width / 2 - mid);
        if (dd < d) { d = dd; best = el.dataset["id"] ?? null; }
      });
      if (best && best !== selected) setSelected(best);
    }, 140);
  };

  const ctrl = "flex items-center gap-2 border bg-ivory/95 px-3 py-2 text-xs uppercase tracking-[0.15em] shadow-float backdrop-blur transition-colors hover:bg-champagne disabled:opacity-40 disabled:hover:bg-ivory";

  return (
    <div className="fixed inset-0 top-16 flex flex-col md:flex-row">
      <aside className="hidden w-full flex-col overflow-hidden border-r bg-ivory md:flex md:w-[440px] lg:w-[500px]">
        <div className="space-y-5 border-b p-5">
          <div className="flex items-baseline justify-between">
            <h1 className="text-3xl">Explore Hyderabad</h1>
            <span className="eyebrow text-muted-foreground">{list.length} results</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {neighbourhoods.map((n) => (
              <button key={n.name} onClick={() => { setF({ ...f, locality: properties.some((p) => p.locality === n.name) ? n.name : "" }); api.current?.flyTo(n.center, 13.5); }} className="border px-2.5 py-1 text-[11px] hover:border-champagne hover:bg-champagne/20">
                {n.name}
              </button>
            ))}
          </div>
          <PropertyFilters value={f} onChange={(v) => { setF(v); setArea(null); }} compact />
          <p className="text-[11px] text-muted-foreground"><DemoBadge label="Demo" /> <span className="ml-1">Example listings. Pins mark approximate neighbourhood locations, not real addresses.</span></p>
        </div>
        <ul className="flex-1 divide-y overflow-y-auto">
          {list.map((p) => {
            const on = p.id === selected || p.id === hovered;
            return (
              <li key={p.id}>
                <button
                  onClick={() => setSelected(p.id)}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex w-full gap-4 p-4 text-left transition-colors ${on ? "bg-champagne/20" : "hover:bg-stone/60"}`}
                >
                  <img src={p.images[0]} alt={p.title} loading="lazy" className="h-24 w-32 shrink-0 object-cover" />
                  <div className="min-w-0">
                    <p className="eyebrow text-[0.6rem] text-muted-foreground">{p.type} · For {p.status}</p>
                    <p className="mt-1 truncate font-display text-xl">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.locality}{p.beds ? ` · ${p.beds} beds` : ""} · {sizeLabel(p)}</p>
                    <p className="mt-1 font-display text-lg text-forest">{formatINR(p.price, p.status === "Rent")}</p>
                  </div>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="p-10 text-center text-muted-foreground">No properties match. Try other filters{area ? " or clear the area search" : ""}.</li>}
        </ul>
      </aside>

      <div className="relative flex-1 overflow-hidden">
        <SmartMap items={list} selectedId={selected} hoveredId={hovered} onSelect={setSelected} onHover={setHovered} mode3d={mode3d} dark={dark} onReady={(a) => (api.current = a)} />

        <div className="absolute left-3 right-3 top-3 z-20 flex flex-wrap gap-2 md:left-4 md:right-auto md:top-4">
          <button className={ctrl} disabled={!live} onClick={() => setMode3d((m) => !m)}>
            {mode3d ? <Layers className="h-3.5 w-3.5" /> : <Box className="h-3.5 w-3.5" />} {mode3d ? "2D view" : "3D view"}
          </button>
          <button className={ctrl} disabled={!live} onClick={() => setDark((d) => !d)} aria-label="Toggle map theme">
            {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button className={ctrl} disabled={!live} onClick={() => setArea(api.current?.bounds() ?? null)}>
            <ScanSearch className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Search this</span> area
          </button>
          <button className={ctrl} onClick={() => { api.current?.reset(); setSelected(null); setMode3d(false); setArea(null); }}>
            <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {sel && (
          <div key={sel.id} className="absolute bottom-6 right-4 hidden md:block w-[min(360px,calc(100%-2rem))] animate-fade bg-ivory shadow-float">
            <img src={sel.images[0]} alt={sel.title} className="h-40 w-full object-cover" />
            <div className="p-5">
              <div className="flex items-center justify-between"><DemoBadge /><button onClick={() => setSelected(null)} className="text-xs text-muted-foreground">Close</button></div>
              <p className="mt-3 font-display text-2xl">{sel.title}</p>
              <p className="text-xs text-muted-foreground">{sel.locality} · {sel.type}</p>
              <p className="mt-2 font-display text-xl text-forest">{formatINR(sel.price, sel.status === "Rent")}</p>
              <div className="mt-4 flex gap-2 text-xs uppercase tracking-[0.15em]">
                <Link to="/properties/$id" params={{ id: sel.id }} className="flex-1 bg-forest py-3 text-center text-ivory hover:bg-charcoal">View property</Link>
                <Link to="/contact" search={{ property: sel.title }} className="flex-1 border py-3 text-center hover:bg-champagne">Enquire</Link>
              </div>
            </div>
          </div>
        )}

        <BottomSheet
          snap={snap}
          extra={selected ? 42 : 0}
          onSnap={setSnap}
          header={
            <div className="flex items-center justify-between gap-3">
              <div className="mr-auto">
                <p className="font-display text-2xl leading-none">{list.length} home{list.length === 1 ? "" : "s"}</p>
                <p className="mt-1 text-[11px] text-muted-foreground"><DemoBadge label="Demo" /> <span className="ml-1">Example listings</span></p>
              </div>
              <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { setShowFilters((v) => !v); setSnap("full"); }} className={`flex items-center gap-2 border px-3 py-2 text-[11px] uppercase tracking-[0.15em] ${showFilters ? "bg-forest text-ivory" : ""}`}>
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </button>
              <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setSnap(snap === "full" ? "collapsed" : "full")} className="flex items-center gap-2 bg-charcoal px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-ivory">
                {snap === "full" ? <><MapIcon className="h-3.5 w-3.5" /> Map</> : <><List className="h-3.5 w-3.5" /> List</>}
              </button>
            </div>
          }
        >
          <div ref={rail} onScroll={onRailScroll} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
            {list.map((p) => {
              const on = p.id === selected;
              return (
                <div key={p.id} data-id={p.id} className={`w-[78%] max-w-[320px] shrink-0 snap-center overflow-hidden bg-card transition-shadow duration-500 ${on ? "shadow-float ring-1 ring-champagne" : "ring-1 ring-border"}`}>
                  <button onClick={() => setSelected(p.id)} className="flex w-full gap-3 p-2 text-left">
                    <img src={p.images[0]} alt={p.title} loading="lazy" className="h-[84px] w-[96px] shrink-0 object-cover" />
                    <div className="min-w-0 py-1">
                      <p className="eyebrow truncate text-[0.55rem] text-muted-foreground">{p.locality} · {p.status === "Rent" ? "Rent" : "Buy"}</p>
                      <p className="mt-1 truncate font-display text-lg leading-tight">{p.title}</p>
                      <p className="font-display text-lg text-forest">{formatINR(p.price, p.status === "Rent")}</p>
                    </div>
                  </button>
                  <div className={`grid grid-cols-2 border-t text-[10px] uppercase tracking-[0.15em] transition-all duration-500 ${on ? "max-h-12 opacity-100" : "max-h-0 opacity-0"}`}>
                    <Link to="/properties/$id" params={{ id: p.id }} className="flex items-center justify-center gap-1 bg-forest py-3 text-ivory">View <ArrowUpRight className="h-3 w-3" /></Link>
                    <Link to="/contact" search={{ property: p.title }} className="py-3 text-center">Enquire</Link>
                  </div>
                </div>
              );
            })}
            {list.length === 0 && <p className="w-full py-6 text-center text-sm text-muted-foreground">No homes match these filters.</p>}
          </div>
          {showFilters && (
            <div className="space-y-4 border-t px-5 py-5">
              <PropertyFilters value={f} onChange={(v) => { setF(v); setArea(null); }} compact />
              <button onClick={() => { setF(defaultFilters); setArea(null); }} className="text-xs uppercase tracking-[0.15em] text-muted-foreground underline">Clear filters</button>
            </div>
          )}
          <ul className="divide-y border-t">
            {list.map((p) => (
              <li key={p.id}>
                <button onClick={() => { setSelected(p.id); setSnap("half"); }} className="flex w-full gap-4 px-5 py-4 text-left">
                  <img src={p.images[0]} alt="" loading="lazy" className="h-20 w-28 shrink-0 object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.locality}{p.beds ? ` · ${p.beds} beds` : ""} · {sizeLabel(p)}</p>
                    <p className="mt-1 font-display text-lg text-forest">{formatINR(p.price, p.status === "Rent")}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </BottomSheet>
      </div>

    </div>
  );
}
