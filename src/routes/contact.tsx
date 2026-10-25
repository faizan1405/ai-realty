import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { company, whatsappLink } from "@/data/site";
import { EnquiryForm } from "@/components/site/EnquiryForm";

const search = z.object({ property: z.string().max(120).optional(), intent: z.string().max(40).optional() });

export const Route = createFileRoute("/contact")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Contact A & I Realty — Enquire or Request a Site Visit" },
      { name: "description", content: "Enquire about properties, request a site visit or discuss construction with A & I Realty in Hyderabad." },
      { property: "og:title", content: "Contact A & I Realty" },
      { property: "og:description", content: "Let's find what's next." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { property, intent } = Route.useSearch();
  return (
    <section className="relative min-h-screen overflow-hidden bg-charcoal pt-36 text-ivory">
      <div className="blueprint absolute inset-0 opacity-30" />
      <div className="relative mx-auto grid max-w-[1500px] gap-16 px-6 pb-32 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <p className="eyebrow text-champagne">Contact</p>
          <h1 className="display-xl mt-6"><span className="mask-reveal"><span>Let's find</span></span><span className="mask-reveal"><span style={{ animationDelay: ".15s" }}><em className="text-champagne">what's next.</em></span></span></h1>
          <div className="mt-14 space-y-6 text-ivory/75">
            <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:text-champagne"><Mail className="h-4 w-4 text-champagne" />{company.email}</a>
            <a href={company.phoneHref} className="flex items-center gap-3 hover:text-champagne"><Phone className="h-4 w-4 text-champagne" />{company.phone}</a>
            <a href={whatsappLink("Hello A & I Realty, I'd like to know more about your properties and services.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-champagne"><WhatsAppIcon className="h-4 w-4 text-champagne" />WhatsApp {company.phone}</a>
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-champagne" />{company.region}</p>
          </div>
        </div>
        <div className="md:col-span-7">
          <EnquiryForm dark intent={intent ?? "Enquire Now"} defaultMessage={property ? `I'm interested in "${property}".` : ""} />
        </div>
      </div>
    </section>
  );
}
