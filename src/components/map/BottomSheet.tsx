import { useEffect, useRef, useState, type ReactNode } from "react";

export type Snap = "collapsed" | "half" | "full";
const PEEK = 196;

/** Touch/mouse-draggable sheet with three resting positions. */
export function BottomSheet({ snap, onSnap, header, children, extra = 0 }: { snap: Snap; onSnap: (s: Snap) => void; header: ReactNode; children: ReactNode; extra?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef({ y: 0, t: 0, base: 0 });

  useEffect(() => {
    const el = box.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const offsets: Record<Snap, number> = { collapsed: Math.max(h - PEEK - extra, 0), half: h * 0.45, full: 8 };
  const y = drag ?? offsets[snap];

  const down = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, t: performance.now(), base: offsets[snap] };
    setDrag(offsets[snap]);
  };
  const move = (e: React.PointerEvent) => {
    if (drag === null) return;
    setDrag(Math.min(Math.max(start.current.base + e.clientY - start.current.y, 8), h - 72));
  };
  const up = (e: React.PointerEvent) => {
    if (drag === null) return;
    const dy = e.clientY - start.current.y;
    const v = dy / Math.max(performance.now() - start.current.t, 1); // px/ms
    const order: Snap[] = ["full", "half", "collapsed"];
    let next: Snap;
    if (Math.abs(dy) < 6) next = snap === "collapsed" ? "half" : snap === "half" ? "full" : "half"; // tap cycles
    else if (Math.abs(v) > 0.5) next = order[Math.min(Math.max(order.indexOf(snap) + (v > 0 ? 1 : -1), 0), 2)]!;
    else next = order.reduce((a, b) => (Math.abs(offsets[b] - drag) < Math.abs(offsets[a] - drag) ? b : a));
    setDrag(null);
    onSnap(next);
  };

  return (
    <div
      ref={box}
      className="absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-ivory shadow-[0_-20px_50px_-20px_color-mix(in_oklab,var(--charcoal)_45%,transparent)] md:hidden"
      style={{ top: 0, transform: `translateY(${y}px)`, transition: drag === null ? "transform 520ms var(--ease-lux)" : "none" }}
    >
      <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} className="shrink-0 cursor-grab touch-none select-none px-5 pb-3 pt-2.5 active:cursor-grabbing" role="button" aria-label="Drag to resize results">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-charcoal/20" />
        {header}
      </div>
      <div className={`min-h-0 flex-1 overscroll-contain ${snap === "full" ? "overflow-y-auto" : "overflow-hidden"}`}>{children}</div>
    </div>
  );
}
