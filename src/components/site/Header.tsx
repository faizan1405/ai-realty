import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import logo from "@/assets/ai-realty-logo.png";
import { company, whatsappLink } from "@/data/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

const nav = [
  { to: "/properties", label: "Properties" },
  { to: "/explore-map", label: "Map" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const overDark = path === "/" && !scrolled;

  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > last + 4 ? true : y < last - 4 ? false : (h) => h);
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  if (path === "/explore-map") return <MapHeader />;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)] ${scrolled ? "px-3 pt-3 md:px-6" : ""} ${hidden && !open ? "-translate-y-[120%]" : ""} ${overDark ? "text-ivory" : "text-charcoal"}`}
    >
      <div className={`mx-auto flex max-w-[1500px] items-center justify-between ${open ? "!border-transparent !bg-transparent !shadow-none !backdrop-blur-none text-ivory" : ""} transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)] ${
        scrolled ? "h-16 rounded-full border border-charcoal/10 bg-ivory/80 px-5 shadow-float backdrop-blur-xl md:px-8" : `h-20 px-6 md:px-10 ${overDark ? "" : "bg-ivory/85 backdrop-blur-md"}`
      }`}>
        <Link to="/" aria-label="A & I Realty home" className="shrink-0">
          <img src={logo} alt="A & I Realty" width={160} height={115} className={`w-auto transition-all duration-500 ${scrolled ? "h-10" : "h-12"} ${overDark || open ? "invert" : ""}`} />
        </Link>
        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="link-lux text-sm tracking-wide" activeProps={{ className: "text-champagne" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a href={company.phoneHref} className="hidden items-center gap-2 text-sm xl:flex"><Phone className="h-3.5 w-3.5" />{company.phone}</a>
          <Link
            to="/contact"
            className={`group relative hidden overflow-hidden rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.25em] transition-colors duration-500 md:inline-block ${
              overDark ? "border-ivory/50 hover:text-charcoal" : "border-charcoal/30 hover:text-ivory"
            }`}
          >
            <span className={`absolute inset-0 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover:translate-y-0 ${overDark ? "bg-ivory" : "bg-forest"}`} />
            <span className="relative">Enquire</span>
          </Link>
          <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className={`lg:hidden ${open ? "text-ivory" : ""}`} onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <div className={`fixed inset-0 top-0 -z-10 flex flex-col justify-end bg-charcoal px-6 pb-12 text-ivory transition-[clip-path] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] lg:hidden ${open ? "[clip-path:inset(0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"}`}>
        <div className="blueprint absolute inset-0 opacity-25" />
        <nav className="relative">
          {[...nav, { to: "/contact", label: "Contact" } as const].map((n, i) => (
            <Link key={n.to} to={n.to} className="flex items-baseline gap-4 border-b border-ivory/10 py-4" style={{ transition: `opacity .6s ${open ? 200 + i * 60 : 0}ms, transform .8s ${open ? 200 + i * 60 : 0}ms cubic-bezier(0.2,0.7,0.1,1)`, opacity: open ? 1 : 0, transform: open ? "none" : "translateY(24px)" }}>
              <span className="font-display text-sm text-champagne">0{i + 1}</span>
              <span className="font-display text-4xl">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="relative mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
          <a href={company.phoneHref} className="flex items-center gap-2 border border-ivory/30 px-4 py-3"><Phone className="h-3.5 w-3.5" />Call</a>
          <a href={whatsappLink("Hello A & I Realty, I'd like to know more about your properties.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-champagne px-4 py-3 text-charcoal"><WhatsAppIcon className="h-3.5 w-3.5" />WhatsApp</a>
          <a href={`mailto:${company.email}`} className="px-1 py-3 normal-case tracking-normal text-ivory/70">{company.email}</a>
        </div>
      </div>
    </header>
  );
}

function MapHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-ivory px-5 hairline">
      <Link to="/" aria-label="A & I Realty home">
        <img src={logo} alt="A & I Realty" width={160} height={115} className="h-10 w-auto" />
      </Link>
      <div className="flex gap-6 text-sm">
        <Link to="/properties" className="link-lux">Listings</Link>
        <a href={company.phoneHref} className="link-lux hidden sm:inline">{company.phone}</a>
        <Link to="/contact" className="link-lux">Enquire</Link>
      </div>
    </header>
  );
}
