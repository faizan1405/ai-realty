import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, BedDouble, Bath, Maximize } from "lucide-react";
import { formatINR, type Property } from "@/data/site";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] ${seen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function DemoBadge({ label = "Demo listing" }: { label?: string }) {
  return <span className="eyebrow inline-block bg-champagne px-2 py-1 text-[0.6rem] text-charcoal">{label}</span>;
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-charcoal pb-20 pt-40 text-ivory">
      <div className="blueprint absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-10">
        <p className="eyebrow text-champagne">{eyebrow}</p>
        <h1 className="display-lg mt-6 max-w-5xl">
          <span className="mask-reveal"><span>{title}</span></span>
        </h1>
        {children && <div className="mt-8 max-w-2xl text-ivory/70">{children}</div>}
      </div>
    </section>
  );
}

export function PropertyCard({ p, active, onHover }: { p: Property; active?: boolean; onHover?: (id: string | null) => void }) {
  const specs = [
    p.beds ? { icon: BedDouble, v: `${p.beds}`, l: "Beds" } : null,
    p.baths ? { icon: Bath, v: `${p.baths}`, l: "Baths" } : null,
    { icon: Maximize, v: p.area.toLocaleString("en-IN"), l: p.areaUnit === "sq yd" ? "Sq yd" : "Sq ft" },
  ].filter(Boolean) as { icon: typeof Bath; v: string; l: string }[];
  return (
    <article onMouseEnter={() => onHover?.(p.id)} onMouseLeave={() => onHover?.(null)} className="group relative">
      <Link to="/properties/$id" params={{ id: p.id }} className="block" aria-label={`View ${p.title}`}>
        <div className={`relative aspect-[4/5] overflow-hidden bg-stone transition-[clip-path] duration-[1200ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] [clip-path:inset(0)] group-hover:[clip-path:inset(2.5%)] ${active ? "ring-1 ring-champagne" : ""}`}>
          <img src={p.images[0]} alt={p.title} loading="lazy" width={1600} height={2000} className="h-full w-full object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover:scale-[1.08] motion-reduce:transition-none" />
          <div className="veil absolute inset-0 opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
            <DemoBadge />
            <span className="eyebrow text-[0.6rem] text-ivory/90">For {p.status === "Sale" ? "Sale" : "Rent"}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
            <p className="eyebrow text-[0.6rem] text-champagne">{p.type} — {p.locality}</p>
            <h3 className="mt-3 text-[2.1rem] leading-[0.95]">{p.title}</h3>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover:grid-rows-[1fr]">
              <p className="overflow-hidden text-sm leading-relaxed text-ivory/75"><span className="block pt-3">{p.summary.slice(0, 110)}…</span></p>
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-ivory/25 pt-4">
              <p className="font-display text-3xl leading-none">{formatINR(p.price, p.status === "Rent")}</p>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/40 transition-all duration-500 group-hover:rotate-45 group-hover:border-champagne group-hover:bg-champagne group-hover:text-charcoal">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <dl className="flex flex-wrap gap-x-4 gap-y-1">
          {specs.map((s) => (
            <div key={s.l} className="flex items-center gap-1.5"><s.icon className="h-3.5 w-3.5 text-forest" /><dt className="sr-only">{s.l}</dt><dd><span className="text-foreground">{s.v}</span> {s.l}</dd></div>
          ))}
        </dl>
        <Link to="/contact" search={{ property: p.title }} className="link-lux uppercase tracking-[0.2em] text-forest">Enquire</Link>
      </div>
    </article>
  );
}

export function LuxButton({ to, children, variant = "solid", search }: { to: string; children: ReactNode; variant?: "solid" | "ghost" | "dark"; search?: Record<string, string> }) {
  const styles = {
    solid: "bg-champagne text-charcoal hover:bg-ivory",
    ghost: "border border-ivory/40 text-ivory hover:bg-ivory hover:text-charcoal",
    dark: "bg-forest text-ivory hover:bg-charcoal",
  }[variant];
  return (
    <Link to={to} search={search as never} className={`group inline-flex items-center gap-3 px-7 py-4 text-xs font-semibold uppercase tracking-[0.25em] transition-colors duration-500 ${styles}`}>
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}
