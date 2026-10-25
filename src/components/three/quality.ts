import { useEffect, useState, type RefObject } from "react";

export type Tier = "high" | "low";

/** Rough device tier: phones, few cores or little memory get the lighter render path. */
export function detectTier(): Tier {
  if (typeof window === "undefined") return "high";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 900;
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  return coarse || small || cores <= 4 || mem <= 4 ? "low" : "high";
}

/** True while the element is on (or near) screen — used to pause WebGL loops off-screen. */
export function useInView(ref: RefObject<Element | null>, margin = "0px", ready: unknown = true) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, ready]);
  return inView;
}
