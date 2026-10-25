import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/site";
import { LuxButton, PageIntro } from "@/components/site/bits";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Design Studies — A & I Realty" },
      { name: "description", content: "Conceptual architectural and interior design studies illustrating the kind of spaces A & I Realty helps create." },
      { property: "og:title", content: "Design Studies — A & I Realty" },
      { property: "og:description", content: "Conceptual residential and interior design studies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projects,
});

/** 0..1 progress of an element passing through the viewport. */
function useProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setP(0.5); return; }
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const vh = window.innerHeight;
        setP(Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return [ref, p] as const;
}

function ProjectRow({ p, i }: { p: (typeof projects)[number]; i: number }) {
  const [ref, prog] = useProgress<HTMLElement>();
  const reveal = Math.min(prog * 2.2, 1); // fully open by mid-screen
  const flip = i % 2 === 1;
  return (
    <article ref={ref} id={p.slug} className="relative scroll-mt-28 py-16 md:py-28">
      <div className={`grid items-end gap-8 md:grid-cols-12 ${flip ? "" : ""}`}>
        <div className={`relative overflow-hidden ${flip ? "md:col-span-7 md:col-start-6" : "md:col-span-8"}`}
          style={{ clipPath: `inset(${(1 - reveal) * 18}% ${(1 - reveal) * 10}% ${(1 - reveal) * 18}% ${(1 - reveal) * 10}%)` }}>
          <img src={p.image} alt={p.title} loading="lazy" className="aspect-[16/11] w-full object-cover will-change-transform" style={{ transform: `scale(${1.18 - reveal * 0.12}) translateY(${(prog - 0.5) * -6}%)` }} />
          <span className="eyebrow absolute left-5 top-5 bg-champagne px-2 py-1 text-[0.6rem] text-charcoal">Concept study</span>
        </div>
        <div className={`${flip ? "md:order-first md:col-span-5 md:row-start-1" : "md:col-span-4"}`} style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 40}px)` }}>
          <p className="font-display text-7xl text-champagne/60 md:text-8xl">0{i + 1}</p>
          <p className="eyebrow mt-4 text-muted-foreground">{p.kind}</p>
          <h2 className="mt-3 text-5xl leading-[0.95] md:text-6xl">{p.title}</h2>
          <p className="mt-5 max-w-sm text-muted-foreground">{p.note}</p>
        </div>
      </div>
    </article>
  );
}

function Projects() {
  return (
    <>
      <PageIntro eyebrow="Projects" title={<>Architecture, <em className="text-champagne">imagined.</em></>}>
        These are conceptual design studies, not completed A &amp; I Realty projects. Our completed work will be showcased here soon.
      </PageIntro>

      <nav aria-label="Design studies" className="sticky top-0 z-30 border-b bg-ivory/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] gap-8 overflow-x-auto px-6 py-4 text-xs uppercase tracking-[0.2em] [scrollbar-width:none] md:px-10">
          {projects.map((p, i) => (
            <a key={p.slug} href={`#${p.slug}`} className="link-lux shrink-0 text-muted-foreground hover:text-foreground">0{i + 1} {p.title}</a>
          ))}
        </div>
      </nav>

      <section className="mx-auto max-w-[1500px] px-6 md:px-10">
        {projects.map((p, i) => <ProjectRow key={p.slug} p={p} i={i} />)}
      </section>

      <section className="relative overflow-hidden bg-forest text-ivory">
        <div className="blueprint absolute inset-0 opacity-30" />
        <div className="relative mx-auto flex max-w-[1500px] flex-col items-start gap-10 px-6 py-28 md:flex-row md:items-end md:justify-between md:px-10">
          <h2 className="display-lg max-w-3xl">Have a plot, or a picture in your head? <em className="text-champagne">Let's draw it.</em></h2>
          <LuxButton to="/services/architecture-interiors">Design your space</LuxButton>
        </div>
      </section>
    </>
  );
}
