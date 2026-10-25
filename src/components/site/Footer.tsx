import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { company, whatsappLink } from "@/data/site";
import logo from "@/assets/ai-realty-logo.png";

export function Footer() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/explore-map") return null;
  const cols = [
    { h: "Explore", links: [["/properties", "Properties"], ["/explore-map", "Map explorer"], ["/projects", "Design studies"]] },
    { h: "Company", links: [["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]] },
  ] as const;
  return (
    <footer className="relative overflow-hidden bg-charcoal text-ivory">
      <div className="blueprint absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      {/* Horizon line: the last frame of the story */}
      <div className="relative mx-auto max-w-[1500px] px-6 pt-28 md:px-10 md:pt-36">
        <p className="eyebrow text-champagne">The next chapter</p>
        <Link to="/contact" className="group mt-8 flex flex-wrap items-end justify-between gap-8">
          <span className="display-xl max-w-5xl">Let's find your <em className="text-champagne">place.</em></span>
          <span className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-ivory/30 transition-all duration-700 group-hover:scale-110 group-hover:border-champagne group-hover:bg-champagne group-hover:text-charcoal md:h-32 md:w-32">
            <ArrowUpRight className="h-8 w-8 transition-transform duration-700 group-hover:rotate-45" />
          </span>
        </Link>

        <div className="mt-24 grid gap-12 border-t border-ivory/15 pt-12 sm:grid-cols-2 md:grid-cols-12">
          <div className="md:col-span-5">
            <img src={logo} alt="A & I Realty" width={160} height={115} className="h-20 w-auto invert" />
            <p className="mt-4 max-w-xs text-sm text-ivory/60">Property, construction and design under one roof, in {company.city}.</p>
          </div>
          {cols.map((c) => (
            <div key={c.h} className="space-y-3 text-sm md:col-span-2">
              <p className="eyebrow text-champagne">{c.h}</p>
              {c.links.map(([to, l]) => <Link key={to} to={to} className="link-lux block w-fit text-ivory/75 hover:text-ivory">{l}</Link>)}
            </div>
          ))}
          <div className="space-y-3 text-sm md:col-span-3">
            <p className="eyebrow text-champagne">Get in touch</p>
            <a href={company.phoneHref} className="link-lux block w-fit text-ivory/75 hover:text-ivory">{company.phone}</a>
            <a href={whatsappLink("Hello A & I Realty, I'd like to know more about your properties.")} target="_blank" rel="noopener noreferrer" className="link-lux block w-fit text-ivory/75 hover:text-ivory">WhatsApp us</a>
            <a href={`mailto:${company.email}`} className="link-lux block w-fit break-all text-ivory/75 hover:text-ivory">{company.email}</a>
            <p className="text-ivory/60">{company.region}</p>
          </div>
        </div>
      </div>

      <p aria-hidden className="pointer-events-none relative mt-16 select-none whitespace-nowrap text-center font-display text-[19vw] leading-[0.8] text-ivory/[0.05]">Dream · Build · Own</p>
      <div className="relative mx-auto flex max-w-[1500px] flex-col gap-2 border-t border-ivory/10 px-6 py-6 text-xs text-ivory/40 md:flex-row md:justify-between md:px-10">
        <p>© {new Date().getFullYear()} A &amp; I Realty</p>
        <p>Listings marked "Demo" and projects marked "Concept" are illustrative.</p>
      </div>
    </footer>
  );
}
