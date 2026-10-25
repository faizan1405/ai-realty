import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { formatINR, type Property } from "@/data/site";
import { HYDERABAD } from "@/data/map";

export type MapApi = { flyTo: (c: [number, number], zoom?: number) => void; reset: () => void; bounds: () => [number, number, number, number] | null };

type Props = {
  token: string;
  items: Property[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  mode3d: boolean;
  dark: boolean;
  interactive?: boolean;
  onReady?: (api: MapApi) => void;
  onError?: (msg: string) => void;
};

const STYLE = { light: "mapbox://styles/mapbox/light-v11", dark: "mapbox://styles/mapbox/dark-v11" };
const SRC = "ai-homes";
type Feat = { properties?: Record<string, unknown>; geometry: { coordinates: number[] } };

// Luxury architectural palette applied to the real Mapbox layers.
const PALETTE = {
  light: {
    land: "#efe1c6", landuse: "#e8d7b8", park: "#a9cf8f", wood: "#9cc584", water: "#5fb3c4", waterway: "#4ea5b8",
    roadMajor: "#ffffff", roadMinor: "#fbf3e3", roadCase: "#cfb58c", motorway: "#f6c989", building: "#e3b98f",
    label: "#3c2f24", labelHalo: "#fbf6ec", water_label: "#1f5f6d", extrude: "#dba77a",
  },
  dark: {
    land: "#13222a", landuse: "#172b33", park: "#1f4a37", wood: "#1c4532", water: "#0f4d63", waterway: "#13607a",
    roadMajor: "#d9a86c", roadMinor: "#3c5560", roadCase: "#0c171c", motorway: "#e8b675", building: "#3a3148",
    label: "#f1e4cf", labelHalo: "#0d181d", water_label: "#8fd6e6", extrude: "#4a3b55",
  },
};

function tint(map: mapboxgl.Map, dark: boolean) {
  const c = dark ? PALETTE.dark : PALETTE.light;
  const set = (id: string, prop: string, v: unknown) => { try { map.setPaintProperty(id, prop as never, v as never); } catch { /* layer lacks prop */ } };
  for (const l of map.getStyle()?.layers ?? []) {
    const id = l.id;
    if (l.type === "background") set(id, "background-color", c.land);
    else if (l.type === "fill") {
      if (/water/.test(id)) set(id, "fill-color", c.water);
      else if (/park|pitch|grass|golf/.test(id)) set(id, "fill-color", c.park);
      else if (/landcover|wood|scrub/.test(id)) { set(id, "fill-color", c.wood); set(id, "fill-opacity", 0.55); }
      else if (/building/.test(id)) { set(id, "fill-color", c.building); set(id, "fill-opacity", 0.9); }
      else if (/landuse|national-park/.test(id)) {
        set(id, "fill-color", ["match", ["get", "class"], ["park", "grass", "pitch", "cemetery", "wood", "scrub", "national_park"], c.park, c.landuse]);
        set(id, "fill-opacity", 0.8);
      }
    } else if (l.type === "line") {
      if (/waterway/.test(id)) set(id, "line-color", c.waterway);
      else if (/road|bridge|tunnel/.test(id) && !/label|shield/.test(id)) {
        if (/case/.test(id)) set(id, "line-color", c.roadCase);
        else if (/simple/.test(id)) set(id, "line-color", ["match", ["get", "class"], ["motorway", "trunk"], c.motorway, ["primary", "secondary", "tertiary"], c.roadMajor, c.roadMinor]);
        else if (/motorway|trunk/.test(id)) set(id, "line-color", c.motorway);
        else if (/primary|secondary|tertiary/.test(id)) set(id, "line-color", c.roadMajor);
        else set(id, "line-color", c.roadMinor);
      }
    } else if (l.type === "symbol" && (l.layout as Record<string, unknown> | undefined)?.["text-field"]) {
      set(id, "text-color", /water/.test(id) ? c.water_label : c.label);
      set(id, "text-halo-color", c.labelHalo);
      set(id, "text-halo-width", 1.4);
    }
  }
}

function addBuildings(map: mapboxgl.Map, dark: boolean) {
  if (map.getLayer("ai-3d-buildings") || !map.getSource("composite")) return;
  map.addLayer({
    id: "ai-3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 13,
    paint: {
      "fill-extrusion-color": dark ? PALETTE.dark.extrude : PALETTE.light.extrude,
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.85,
    },
  });
}

const calm = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function MapView({ token, items, selectedId, hoveredId, onSelect, onHover, mode3d, dark, interactive = true, onReady, onError }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef(new Map<string, { m: mapboxgl.Marker; node: HTMLDivElement; wrap: HTMLDivElement }>());
  const cb = useRef({ onSelect, onHover });
  cb.current = { onSelect, onHover };
  const [loaded, setLoaded] = useState(false);
  const darkRef = useRef(dark);
  darkRef.current = dark;
  const pitchRef = useRef(mode3d);
  pitchRef.current = mode3d;

  useEffect(() => {
    if (!el.current) return;
    mapboxgl.accessToken = token;
    const m = new mapboxgl.Map({ container: el.current, style: dark ? STYLE.dark : STYLE.light, center: HYDERABAD, zoom: 11, interactive, attributionControl: true });
    map.current = m;
    m.on("error", (e) => onError?.(String((e as { error?: Error }).error?.message ?? "Map failed to load")));
    m.on("style.load", () => tint(m, darkRef.current));
    m.on("load", () => {
      setLoaded(true);
      onReady?.({
        flyTo: (c, zoom = 14) => (calm() ? m.jumpTo({ center: c, zoom }) : m.flyTo({ center: c, zoom, speed: 0.9, curve: 1.5, essential: true })),
        reset: () => m.flyTo({ center: HYDERABAD, zoom: 11, pitch: 0, bearing: 0 }),
        bounds: () => { const b = m.getBounds(); return b ? [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] : null; },
      });
    });
    return () => { m.remove(); map.current = null; markers.current.clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // style switch
  useEffect(() => {
    const m = map.current;
    if (!m || !loaded) return;
    m.setStyle(dark ? STYLE.dark : STYLE.light);
    m.once("style.load", () => mode3d && addBuildings(m, dark));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  // 2D / 3D
  useEffect(() => {
    const m = map.current;
    if (!m || !loaded) return;
    if (mode3d) {
      addBuildings(m, dark);
      m.easeTo({ pitch: 60, bearing: -20, zoom: Math.max(m.getZoom(), 14.5), duration: 1600 });
    } else {
      if (m.getLayer("ai-3d-buildings")) m.removeLayer("ai-3d-buildings");
      m.easeTo({ pitch: 0, bearing: 0, duration: 1200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode3d, loaded]);

  // clustered source: clusters drawn as map layers, single homes as price-pin markers
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const geo = (list: Property[]) => ({
    type: "FeatureCollection" as const,
    features: list.map((p) => ({ type: "Feature" as const, properties: { id: p.id }, geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] } })),
  });

  useEffect(() => {
    const m = map.current;
    if (!m || !loaded) return;
    const ensure = () => {
      if (!m.getSource(SRC)) {
        m.addSource(SRC, { type: "geojson", data: geo(itemsRef.current), cluster: true, clusterRadius: 56, clusterMaxZoom: 14 });
        m.addLayer({ id: "ai-clusters", type: "circle", source: SRC, filter: ["has", "point_count"], paint: { "circle-color": "#c8553d", "circle-radius": ["step", ["get", "point_count"], 18, 5, 24, 15, 30], "circle-stroke-width": 6, "circle-stroke-color": "rgba(255,244,228,0.75)" } });
        m.addLayer({ id: "ai-cluster-count", type: "symbol", source: SRC, filter: ["has", "point_count"], layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13, "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"] }, paint: { "text-color": "#F7F4EE" } });
      }
      sync();
    };
    const sync = () => {
      if (!m.getSource(SRC)) return;
      const single = new Set((m.querySourceFeatures(SRC, { filter: ["!", ["has", "point_count"]] }) as unknown as Feat[]).map((f) => String(f.properties?.["id"])));
      markers.current.forEach(({ wrap }, id) => { wrap.style.display = single.has(id) ? "" : "none"; });
    };
    const clickCluster = (e: mapboxgl.MapMouseEvent) => {
      const f = (m.queryRenderedFeatures(e.point, { layers: ["ai-clusters"] }) as unknown as Feat[])[0];
      if (!f) return;
      const src = m.getSource(SRC) as mapboxgl.GeoJSONSource;
      src.getClusterExpansionZoom(Number(f.properties?.["cluster_id"]), (err, zoom) => {
        if (err || zoom == null) return;
        m.easeTo({ center: f.geometry.coordinates as [number, number], zoom: zoom + 0.3 });
      });
    };
    const enter = () => (m.getCanvas().style.cursor = "pointer");
    const leave = () => (m.getCanvas().style.cursor = "");
    ensure();
    m.on("style.load", ensure);
    m.on("moveend", sync);
    m.on("idle", sync);
    m.on("sourcedata", sync);
    m.on("click", "ai-clusters", clickCluster);
    m.on("mouseenter", "ai-clusters", enter);
    m.on("mouseleave", "ai-clusters", leave);
    return () => {
      m.off("style.load", ensure); m.off("moveend", sync); m.off("idle", sync); m.off("sourcedata", sync);
      m.off("click", "ai-clusters", clickCluster); m.off("mouseenter", "ai-clusters", enter); m.off("mouseleave", "ai-clusters", leave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // markers
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const src = m.getSource(SRC) as mapboxgl.GeoJSONSource | undefined;
    src?.setData(geo(items));
    const keep = new Set(items.map((i) => i.id));
    markers.current.forEach((v, k) => { if (!keep.has(k)) { v.m.remove(); markers.current.delete(k); } });
    items.forEach((p) => {
      if (markers.current.has(p.id)) return;
      const node = document.createElement("div");
      node.className = "cursor-pointer whitespace-nowrap rounded-full border-2 border-ivory px-3 py-1 font-sans text-[11px] font-bold shadow-float transition-[background,transform,color] duration-300 motion-reduce:transition-none";
      node.style.background = "var(--coral)"; node.style.color = "var(--ivory)";
      node.textContent = formatINR(p.price, p.status === "Rent");
      const wrap = document.createElement("div");
      wrap.appendChild(node);
      wrap.style.display = src ? "none" : "";
      node.addEventListener("mouseenter", () => cb.current.onHover(p.id));
      node.addEventListener("mouseleave", () => cb.current.onHover(null));
      node.addEventListener("click", (e) => { e.stopPropagation(); cb.current.onSelect(p.id); });
      const mk = new mapboxgl.Marker({ element: wrap, anchor: "bottom" }).setLngLat([p.lng, p.lat]).addTo(m);
      markers.current.set(p.id, { m: mk, node, wrap });
    });
  }, [items, loaded]);

  // highlight
  useEffect(() => {
    markers.current.forEach(({ node, wrap }, id) => {
      const on = id === selectedId || id === hoveredId;
      node.style.transform = on ? "scale(1.18)" : "";
      node.style.background = on ? "var(--champagne)" : "var(--coral)";
      node.style.color = on ? "var(--charcoal)" : "var(--ivory)";
      wrap.style.zIndex = on ? "10" : "";
    });
    const sel = items.find((i) => i.id === selectedId);
    if (sel && map.current) map.current[calm() ? "jumpTo" : "flyTo"]({ center: [sel.lng, sel.lat], zoom: Math.max(map.current.getZoom(), pitchRef.current ? 15.5 : 13.5), pitch: pitchRef.current ? 60 : 0, ...(calm() ? {} : { speed: 0.9, essential: true }) });
  }, [selectedId, hoveredId, items]);

  return <div ref={el} className="h-full w-full" />;
}
