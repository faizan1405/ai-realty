import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { company, images, projects, properties, services, whatsappLink } from "@/data/site";
import { DemoBadge, LuxButton, PropertyCard, Reveal } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { SmartMap } from "@/components/map/SmartMap";
import { useInView } from "@/components/three/quality";

const HeroScene = lazy(() => import("@/components/three/HeroScene"));
const StoryScene = lazy(() => import("@/components/three/StoryScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A & I Realty | Real Estate & Construction" },
      { name: "description", content: "Discover homes, open plots and construction services in Hyderabad. Explore an interactive 3D architectural experience by A & I Realty." },
      { property: "og:title", content: "A & I Realty — Beyond Spaces, Beyond Expectations" },
      { property: "og:description", content: "Homes, plots, construction and architecture in Hyderabad — Dream. Build. Own." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Story />
      <Featured />
      <ServicesGallery />
      <MapPreview />
      <Projects />
      <Why />
      <Contact />
    </>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  // Scroll-out: the hero recedes and darkens so the page flows into the story rather than cutting.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => el.style.setProperty("--out", String(Math.min(window.scrollY / el.offsetHeight, 1))));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-charcoal text-ivory [--out:0]">
      <div className="absolute inset-0" style={{ transform: "scale(calc(1 + var(--out) * 0.08)) translateY(calc(var(--out) * 12%))", opacity: "calc(1 - var(--out) * 0.6)" }}>
      <div className="blueprint absolute inset-0 animate-fade opacity-60" />
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </ClientOnly>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal/70 via-transparent to-charcoal/80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-background" style={{ opacity: "var(--out)" }} />
      <div style={{ transform: "translateY(calc(var(--out) * -18%))", opacity: "calc(1 - var(--out) * 1.6)" }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-end px-6 pb-24 md:px-10 md:pb-28">
        <p className="eyebrow mb-6 text-champagne [animation-delay:1.4s] animate-fade">A &amp; I Realty · Hyderabad</p>
        <h1 className="display-xl">
          <span className="mask-reveal"><span style={{ animationDelay: "1.6s" }}>Beyond spaces.</span></span>
          <span className="mask-reveal"><span style={{ animationDelay: "1.8s" }}><em className="text-champagne">Beyond</em> expectations.</span></span>
        </h1>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-ivory/75 animate-fade [animation-delay:2.4s]">Discover extraordinary spaces. Create the home you've always imagined.</p>
          <div className="pointer-events-auto flex flex-wrap gap-3 animate-fade [animation-delay:2.6s]">
            <LuxButton to="/properties">Explore properties</LuxButton>
            <LuxButton to="/contact" variant="ghost">Start your journey</LuxButton>
          </div>
        </div>
      </div>
      <p className="absolute left-6 top-24 z-10 text-[10px] uppercase tracking-[0.25em] text-ivory/40 md:left-10">Illustrative 3D visualisation</p>
      <ArrowDown className="absolute bottom-8 left-1/2 z-10 h-4 w-4 -translate-x-1/2 animate-bounce text-ivory/50" />
    </section>
  );
}

function Intro() {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-16 px-6 py-32 md:grid-cols-12 md:px-10">
      <Reveal className="md:col-span-4">
        <p className="eyebrow text-forest">— Who we are</p>
      </Reveal>
      <Reveal className="md:col-span-8" delay={100}>
        <p className="font-display text-3xl leading-tight md:text-5xl">
          Real estate is more than buying property — it's about <em className="text-forest">building your legacy.</em>
        </p>
        <p className="mt-10 max-w-2xl text-muted-foreground">
          Based in {company.city}, A &amp; I Realty specialises in open plots, residential homes, commercial developments and full-service construction — supported by a network of legal, architectural and construction experts.
        </p>
        <Link to="/about" className="link-lux mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em]">Our approach <ArrowUpRight className="h-4 w-4" /></Link>
      </Reveal>
    </section>
  );
}

const CHAPTERS = [
  { n: "01", k: "Dream", t: "Imagine", d: "Every home begins as lines on paper — plans, light, the way you'll move through a morning." },
  { n: "02", k: "Build", t: "Create", d: "Slab by slab, structure rises. Quality checks at every stage keep the vision honest." },
  { n: "03", k: "Own", t: "Experience", d: "Materials, warmth and light arrive. The house becomes a place called home." },
];

function Story() {
  const wrap = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = wrap.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (s) => {
        progress.current = s.progress;
        setChapter(Math.min(2, Math.floor(s.progress * 3)));
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={wrap} className="relative h-[280vh] bg-[var(--stone)]">
      <div className="sticky top-0 grid h-screen overflow-hidden md:grid-cols-12">
        <div className="relative z-10 flex flex-col justify-center px-6 md:col-span-5 md:px-10">
          <p className="eyebrow text-forest">From a vision to a place called home</p>
          <div className="relative mt-10 h-72">
            {CHAPTERS.map((c, i) => (
              <div key={c.n} aria-hidden={chapter !== i} className={`absolute inset-0 ${chapter === i ? "" : "pointer-events-none"}`}>
                {[<p key="n" className="font-display text-7xl text-champagne">{c.n}</p>, <h2 key="h" className="display-lg mt-2">{c.k}<span className="text-muted-foreground"> — {c.t}</span></h2>, <p key="d" className="mt-6 max-w-sm text-muted-foreground">{c.d}</p>].map((line, j) => (
                  <div key={j} className="overflow-hidden">
                    <div className="transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] motion-reduce:transition-none" style={{ transitionDelay: chapter === i ? `${j * 90}ms` : "0ms", transform: chapter === i ? "none" : i < chapter ? "translateY(-110%)" : "translateY(110%)", opacity: chapter === i ? 1 : 0 }}>{line}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-2">
            {CHAPTERS.map((c, i) => (
              <span key={c.n} className={`h-px w-16 transition-colors duration-500 ${i <= chapter ? "bg-forest" : "bg-border"}`} />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 md:relative md:col-span-7">
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <StoryScene progress={progress} />
            </Suspense>
          </ClientOnly>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--stone)] via-[var(--stone)]/40 to-transparent md:hidden" />
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const list = properties.slice(0, 3);
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-32 md:px-10">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <Reveal>
          <p className="eyebrow text-forest">Selected residences</p>
          <h2 className="display-lg mt-4">Spaces worth <em>discovering.</em></h2>
        </Reveal>
        <Reveal delay={100} className="max-w-sm text-sm text-muted-foreground">
          <DemoBadge label="Demo" /> <span className="ml-2">Example listings to show the experience. Real inventory will replace these.</span>
        </Reveal>
      </div>
      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={i * 120} className={`min-w-0 ${i === 1 ? "lg:mt-16" : ""} ${i === 2 ? "sm:hidden lg:block" : ""}`}>
            <PropertyCard p={p} />
          </Reveal>
        ))}
      </div>
      <div className="mt-16 text-center">
        <LuxButton to="/properties" variant="dark">View all properties</LuxButton>
      </div>
    </section>
  );
}

function ServicesGallery() {
  const [active, setActive] = useState(0);
  const list = services;
  return (
    <section className="relative overflow-hidden bg-forest-deep text-ivory">
      {list.map((s, i) => (
        <img key={s.slug} src={s.image} alt="" loading="lazy" aria-hidden className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ${active === i ? "scale-100 opacity-30" : "scale-110 opacity-0"}`} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest-deep/30" />
      <div className="relative mx-auto max-w-[1500px] px-6 py-32 md:px-10">
        <p className="eyebrow text-champagne">What we do</p>
        <h2 className="display-lg mt-4 max-w-3xl">End-to-end, from plot to <em>keys.</em></h2>
        <ul className="mt-16 border-t border-ivory/15">
          {list.map((s, i) => (
            <li key={s.slug} onMouseEnter={() => setActive(i)} className="border-b border-ivory/15">
              <Link to="/services/$slug" params={{ slug: s.slug }} className="group grid grid-cols-12 items-baseline gap-4 py-7">
                <span className={`col-span-2 font-display text-xl transition-colors duration-500 md:col-span-1 ${active === i ? "text-champagne" : "text-ivory/40"}`}>0{i + 1}</span>
                <span className={`col-span-10 font-display text-3xl transition-all duration-700 md:col-span-6 md:text-5xl ${active === i ? "translate-x-3 text-ivory" : "text-ivory/55"}`}>{s.title}</span>
                <span className={`col-span-12 text-sm text-ivory/70 transition-all duration-700 md:col-span-4 ${active === i ? "opacity-100" : "opacity-0 md:opacity-0"}`}>{s.short}</span>
                <ArrowUpRight className={`col-span-1 hidden h-6 w-6 justify-self-end transition-all duration-500 md:block ${active === i ? "text-champagne" : "text-ivory/20"}`} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function MapPreview() {
  const [selected, setSelected] = useState<string | null>(properties[1]?.id ?? null);
  const [hovered, setHovered] = useState<string | null>(null);
  const sel = properties.find((p) => p.id === selected);
  // Only start the map once its section is about to scroll into view.
  const box = useRef<HTMLElement>(null);
  const near = useInView(box, "600px");
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (near) setArmed(true); }, [near]);
  return (
    <section ref={box} className="mx-auto max-w-[1500px] px-6 py-32 md:px-10">
      <div className="grid gap-10 md:grid-cols-12 md:items-end">
        <Reveal className="md:col-span-7">
          <p className="eyebrow text-forest">Map explorer</p>
          <h2 className="display-lg mt-4">Every great story begins <em>somewhere.</em></h2>
        </Reveal>
        <Reveal delay={100} className="md:col-span-5">
          <p className="text-muted-foreground">Discover neighbourhoods, explore remarkable properties, and find the place that feels like yours.</p>
          <div className="mt-6"><LuxButton to="/explore-map" variant="dark">Explore the full map</LuxButton></div>
        </Reveal>
      </div>
      <Reveal delay={150} className="relative mt-14 h-[520px] overflow-hidden">
        {armed ? <SmartMap items={properties} selectedId={selected} hoveredId={hovered} onSelect={setSelected} onHover={setHovered} compact interactive={false} /> : <div className="h-full w-full bg-stone" />}
        {sel && (
          <Link to="/properties/$id" params={{ id: sel.id }} className="absolute right-4 top-4 flex w-72 gap-3 bg-ivory p-3 shadow-float transition-transform hover:-translate-y-1">
            <img src={sel.images[0]} alt={sel.title} className="h-20 w-20 object-cover" loading="lazy" />
            <div>
              <DemoBadge label="Demo" />
              <p className="mt-1 font-display text-xl leading-tight">{sel.title}</p>
              <p className="text-xs text-muted-foreground">{sel.locality}</p>
            </div>
          </Link>
        )}
      </Reveal>
    </section>
  );
}

function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) => {
        gsap.fromTo(img, { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(18% 12% 18% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 35%", scrub: true } });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="bg-charcoal py-32 text-ivory">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-champagne">Design studies</p>
            <h2 className="display-lg mt-4">Architecture, <em>imagined.</em></h2>
          </div>
          <p className="max-w-sm text-sm text-ivory/60">Conceptual studies showing the kind of spaces we help create — not completed A &amp; I Realty projects.</p>
        </div>
        <div className="mt-20 grid gap-x-10 gap-y-24 md:grid-cols-12">
          {projects.map((p, i) => (
            <Link to="/projects" key={p.slug} className={`group block ${i % 2 === 0 ? "md:col-span-7" : "md:col-span-5 md:mt-40"}`}>
              <div data-clip className="relative aspect-[4/3] overflow-hidden">
                <img data-parallax src={p.image} alt={p.title} loading="lazy" className="h-[120%] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
                <span className="eyebrow absolute left-4 top-4 bg-ivory/90 px-2 py-1 text-[0.6rem] text-charcoal">Concept</span>
              </div>
              <div className="mt-5 flex items-baseline justify-between">
                <h3 className="text-3xl">{p.title}</h3>
                <span className="eyebrow text-ivory/50">{p.kind}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  const items = [
    { t: "Guidance at every decision", d: "From shortlisting to registration, we explain the trade-offs so you choose with confidence." },
    { t: "Property and construction under one roof", d: "Buy a plot, design it, build it and inspect it — with one team that knows the whole journey." },
    { t: "An expert network", d: "Legal, architectural and construction specialists who help keep every step transparent." },
    { t: "A simple enquiry journey", d: "Tell us what you're looking for. We'll come back with a clear next step." },
  ];
  return (
    <section className="mx-auto grid max-w-[1500px] gap-16 px-6 py-32 md:grid-cols-12 md:px-10">
      <div className="md:col-span-5">
        <Reveal>
          <p className="eyebrow text-forest">Why A &amp; I Realty</p>
          <h2 className="display-lg mt-4">A trusted partner, <em>every step.</em></h2>
        </Reveal>
        <Reveal delay={150} className="mt-12 overflow-hidden">
          <img src={images.interior} alt="Interior living space" loading="lazy" width={1600} height={1008} className="aspect-[4/5] w-full object-cover" />
        </Reveal>
      </div>
      <ol className="md:col-span-7 md:pt-40">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 80}>
            <li className="grid grid-cols-12 gap-4 border-t py-10">
              <span className="col-span-2 font-display text-2xl text-champagne">0{i + 1}</span>
              <div className="col-span-10">
                <h3 className="text-3xl">{it.t}</h3>
                <p className="mt-3 max-w-lg text-muted-foreground">{it.d}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function Contact() {
  return (
    <section className="relative overflow-hidden bg-forest text-ivory">
      <div className="blueprint absolute inset-0 opacity-30" />
      <div className="relative mx-auto grid max-w-[1500px] gap-16 px-6 py-32 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <p className="eyebrow text-champagne">Enquire</p>
          <h2 className="display-lg mt-4">Let's find <em>what's next.</em></h2>
          <p className="mt-8 max-w-sm text-ivory/70">Share a few details and we'll get back to you about properties, construction or design.</p>
          <div className="mt-10 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
            <a href={company.phoneHref} className="flex items-center gap-2 border border-ivory/30 px-5 py-3 hover:bg-ivory hover:text-charcoal"><Phone className="h-3.5 w-3.5" />{company.phone}</a>
            <a href={whatsappLink("Hello A & I Realty, I'd like to know more about your properties and services.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-champagne px-5 py-3 text-charcoal hover:bg-ivory"><WhatsAppIcon className="h-3.5 w-3.5" />WhatsApp</a>
          </div>
          <a href={`mailto:${company.email}`} className="link-lux mt-6 inline-block text-sm text-ivory/70">{company.email}</a>
        </div>
        <div className="md:col-span-7">
          <EnquiryForm dark />
        </div>
      </div>
    </section>
  );
}
