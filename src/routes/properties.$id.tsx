import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, BedDouble, Bath, Maximize, MapPin, Check, MessageCircle, Phone } from "lucide-react";
import { company, formatINR, properties, propertyWhatsApp, sizeLabel } from "@/data/site";
import { DemoBadge, LuxButton, PropertyCard } from "@/components/site/bits";
import { SmartMap } from "@/components/map/SmartMap";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/properties/$id")({
  loader: ({ params }) => {
    const p = properties.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title}, ${loaderData.locality} — A & I Realty` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.title} — A & I Realty` },
          { property: "og:description", content: loaderData.summary },
        ]
      : [{ title: "Property unavailable — A & I Realty" }, { name: "robots", content: "noindex" }],
  }),
  component: Detail,
});

function Detail() {
  const p = Route.useLoaderData();
  const [lb, setLb] = useState<number | null>(null);
  const related = properties.filter((x) => x.id !== p.id && (x.type === p.type || x.locality === p.locality)).slice(0, 3);
  const fallback = related.length ? related : properties.filter((x) => x.id !== p.id).slice(0, 3);
  const msg = `Hello A & I Realty, I'm interested in "${p.title}" (${p.locality}).`;

  return (
    <>
      <section className="relative h-[85svh] min-h-[560px] overflow-hidden bg-charcoal text-ivory">
        <img src={p.images[0]} alt={p.title} className="absolute inset-0 h-full w-full animate-fade object-cover" width={1600} height={1008} />
        <div className="veil absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-6 pb-16 md:px-10">
          <div className="flex gap-2"><DemoBadge /><span className="eyebrow bg-ivory/90 px-2 py-1 text-[0.6rem] text-charcoal">For {p.status}</span></div>
          <h1 className="display-xl mt-6"><span className="mask-reveal"><span>{p.title}</span></span></h1>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <p className="flex items-center gap-2 text-ivory/80"><MapPin className="h-4 w-4" />{p.locality}, {company.city} · {p.type}</p>
            <p className="font-display text-5xl text-champagne">{formatINR(p.price, p.status === "Rent")}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-4 px-6 py-6 md:grid-cols-3 md:px-10">
        {p.images.map((src, i) => (
          <button key={i} onClick={() => setLb(i)} className="group aspect-[4/3] overflow-hidden">
            <img src={src} alt={`${p.title} view ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          </button>
        ))}
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-16 px-6 py-20 md:grid-cols-12 md:px-10">
        <div className="md:col-span-7">
          <p className="eyebrow text-forest">About this home</p>
          <p className="mt-6 font-display text-3xl leading-snug">{p.summary}</p>
          <div className="mt-12 grid grid-cols-2 border-t md:grid-cols-4">
            {[
              p.beds && { i: BedDouble, l: "Bedrooms", v: p.beds },
              p.baths && { i: Bath, l: "Bathrooms", v: p.baths },
              { i: Maximize, l: p.type === "Open Plot" ? "Plot area" : "Built-up area", v: sizeLabel(p) },
              { i: MapPin, l: "Status", v: `For ${p.status}` },
            ].filter(Boolean).map((s) => {
              const it = s as { i: typeof Bath; l: string; v: string | number };
              return (
                <div key={it.l} className="border-b py-6 pr-4">
                  <it.i className="h-4 w-4 text-champagne" />
                  <p className="eyebrow mt-3 text-muted-foreground">{it.l}</p>
                  <p className="mt-1 font-display text-2xl">{it.v}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Specifications are illustrative for this demo listing and not verified.</p>
          <h2 className="mt-16 text-4xl">Amenities</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4">
            {p.amenities.map((a) => <li key={a} className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-forest" />{a}</li>)}
          </ul>
          <h2 className="mt-16 text-4xl">Location</h2>
          <p className="mt-2 text-sm text-muted-foreground">Approximate demo location — the pin marks the neighbourhood centre, not an exact address.</p>
          <div className="mt-6 h-96 overflow-hidden">
            <SmartMap items={[p]} selectedId={p.id} hoveredId={null} onSelect={() => {}} onHover={() => {}} compact />
          </div>
        </div>
        <aside className="md:col-span-5">
          <div className="sticky top-28 bg-forest p-8 text-ivory">
            <p className="eyebrow text-champagne">Interested?</p>
            <p className="mt-4 font-display text-4xl">Arrange a visit.</p>
            <p className="mt-4 text-sm text-ivory/70">Tell us when suits you and we'll coordinate the rest.</p>
            <div className="mt-8 flex flex-col gap-3">
              <LuxButton to="/contact" search={{ property: p.title, intent: "Request Site Visit" }}>Request site visit</LuxButton>
              <a href={`mailto:${company.email}?subject=${encodeURIComponent("Enquiry: " + p.title)}&body=${encodeURIComponent(msg)}`} className="flex items-center justify-center gap-2 border border-ivory/30 px-7 py-4 text-xs uppercase tracking-[0.25em] hover:bg-ivory hover:text-charcoal">
                <MessageCircle className="h-4 w-4" /> Email enquiry
              </a>
              <a href={propertyWhatsApp(p.title)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-ivory px-7 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-charcoal hover:bg-champagne">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
              </a>
              <a href={company.phoneHref} className="flex items-center justify-center gap-2 px-7 py-3 text-xs uppercase tracking-[0.25em] text-ivory/80 hover:text-champagne">
                <Phone className="h-4 w-4" /> {company.phone}
              </a>
            </div>
            <p className="mt-6 text-[11px] leading-relaxed text-ivory/50">WhatsApp and email open on your device — nothing is stored on this website. Photos are illustrative.</p>
          </div>
        </aside>
      </section>

      <section className="bg-stone py-24">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <div className="flex items-end justify-between">
            <h2 className="display-lg">You may also <em>like.</em></h2>
            <Link to="/properties" className="link-lux text-sm uppercase tracking-[0.2em]">All properties</Link>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{fallback.map((r) => <PropertyCard key={r.id} p={r} />)}</div>
        </div>
      </section>

      {lb !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 animate-fade" onClick={() => setLb(null)}>
          <button aria-label="Close" className="absolute right-6 top-6 text-ivory"><X /></button>
          <button aria-label="Previous" className="absolute left-4 text-ivory" onClick={(e) => { e.stopPropagation(); setLb((lb + p.images.length - 1) % p.images.length); }}><ChevronLeft className="h-8 w-8" /></button>
          <img src={p.images[lb]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button aria-label="Next" className="absolute right-4 text-ivory" onClick={(e) => { e.stopPropagation(); setLb((lb + 1) % p.images.length); }}><ChevronRight className="h-8 w-8" /></button>
        </div>
      )}
    </>
  );
}
