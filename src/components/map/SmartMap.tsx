import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import type { Property } from "@/data/site";
import { getMapboxToken } from "@/data/map";
import { SchematicMap } from "./SchematicMap";
import type { MapApi } from "./MapView";

const MapView = lazy(() => import("./MapView"));

export type SmartMapProps = {
  items: Property[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  mode3d?: boolean;
  dark?: boolean;
  compact?: boolean;
  interactive?: boolean;
  onReady?: (api: MapApi) => void;
};

const Loading = () => (
  <div className="grid h-full w-full place-items-center bg-stone">
    <p className="eyebrow animate-pulse text-muted-foreground">Loading map…</p>
  </div>
);

export function SmartMap(props: SmartMapProps) {
  const token = getMapboxToken();
  const [error, setError] = useState<string | null>(null);
  if (!token || error)
    return (
      <div className="relative h-full w-full">
        <SchematicMap {...props} />
        {error && <p className="absolute right-4 top-4 bg-destructive px-3 py-2 text-xs text-destructive-foreground">Map error: {error}</p>}
      </div>
    );
  return (
    <ClientOnly fallback={<Loading />}>
      <Suspense fallback={<Loading />}>
        <MapView {...props} token={token} mode3d={!!props.mode3d} dark={!!props.dark} onError={setError} />
      </Suspense>
    </ClientOnly>
  );
}
