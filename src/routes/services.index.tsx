import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/site";
import { PageIntro } from "@/components/site/bits";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — Construction, Architecture & Property | A & I Realty" },
      { name: "description", content: "Buying, selling and rentals, residential and commercial construction, architecture and interiors, quality inspection, maintenance and loans." },
      { property: "og:title", content: "Services — A & I Realty" },
      { property: "og:description", content: "End-to-end real estate and construction services in Hyderabad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

// A distinct crop + tone per service, within the same palette.
const identity = [
  { pos: "50% 60%", tone: "from-forest-deep", word: "Acquire" },
  { pos: "30% 50%", tone: "from-charcoal", word: "Build" },
  { pos: "70% 40%", tone: "from-forest", word: "Scale" },
  { pos: "40% 55%", tone: "from-charcoal", word: "Shape" },
  { pos: "60% 50%", tone: "from-forest-deep", word: "Verify" },
  { pos: "50% 70%", tone: "from-forest", word: "Care" },
  { pos: "20% 40%", tone: "from-charcoal", word: "Finance" },
];

function Services() {
  const [active, setActive] = useState(0);
  const cur = services[active]!;
  const id = identity[active % identity.length]!;
  return (
    <>
      <PageIntro eyebrow="Services" title={<>From plot <em className="text-champagne">to keys.</em></>}>
        End-to-end real estate and construction solutions, delivered with quality, transparency and timely delivery.
      </PageIntro>

      <section className="relative overflow-hidden bg-charcoal text-ivory">
        {services.map((s, i) => (
          <img key={s.slug} src={s.image} alt="" aria-hidden loading="lazy" style={{ objectPosition: identity[i % identity.length]!.pos }}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1600ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] motion-reduce:transition-none ${active === i ? "scale-100 opacity-35" : "scale-110 opacity-0"}`} />
        ))}
        <div className={`absolute inset-0 bg-gradient-to-r ${id.tone} via-charcoal/85 to-charcoal/40 transition-colors duration-1000`} />
        <p aria-hidden key={id.word} className="pointer-events-none absolute -bottom-6 right-0 animate-fade select-none font-display text-[22vw] italic leading-none text-ivory/[0.06]">{id.word}</p>

        <div className="relative mx-auto grid max-w-[1500px] gap-12 px-6 py-24 md:px-10 lg:grid-cols-12 lg:py-32">
          <ul className="lg:col-span-7" onMouseLeave={() => undefined}>
            {services.map((s, i) => {
              const on = active === i;
              return (
                <li key={s.slug} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className="border-t border-ivory/15 last:border-b">
                  <Link to="/services/$slug" params={{ slug: s.slug }} className="group flex items-baseline gap-6 py-6 md:py-8">
                    <span className={`w-8 shrink-0 font-display text-lg transition-colors duration-500 ${on ? "text-champagne" : "text-ivory/30"}`}>0{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-display text-3xl leading-[0.95] transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)] md:text-6xl ${on ? "translate-x-2 text-ivory" : "text-ivory/35"}`}>{s.title}</span>
                      <span className={`grid transition-[grid-template-rows,opacity] duration-700 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <span className="overflow-hidden">
                          <span className="block pt-4 text-sm text-ivory/70 md:text-base">{s.short}</span>
                          <span className="mt-4 flex flex-wrap gap-2">
                            {s.points.map((pt) => <span key={pt} className="border border-ivory/20 px-2.5 py-1 text-[11px] text-ivory/80">{pt}</span>)}
                          </span>
                          {/* Image preview inline on small screens */}
                          <img src={s.image} alt="" loading="lazy" className="mt-5 aspect-[16/10] w-full object-cover lg:hidden" />
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight className={`h-6 w-6 shrink-0 transition-all duration-500 ${on ? "rotate-45 text-champagne" : "text-ivory/20"}`} />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="sticky top-32">
              <div className="relative aspect-[4/5] overflow-hidden">
                {services.map((s, i) => (
                  <img key={s.slug} src={s.image} alt={active === i ? s.title : ""} loading="lazy" style={{ objectPosition: identity[i % identity.length]!.pos }}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] ${active === i ? "opacity-100 [clip-path:inset(0)]" : "opacity-0 [clip-path:inset(0_0_100%_0)]"}`} />
                ))}
              </div>
              <div key={cur.slug} className="mt-6 animate-fade">
                <p className="eyebrow text-champagne">{id.word}</p>
                <p className="mt-3 max-w-md text-ivory/75">{cur.body}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
