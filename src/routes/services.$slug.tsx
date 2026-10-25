import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { services } from "@/data/site";
import { EnquiryForm } from "@/components/site/EnquiryForm";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const s = services.find((x) => x.slug === params.slug);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — A & I Realty Hyderabad` },
          { name: "description", content: loaderData.body },
          { property: "og:title", content: `${loaderData.title} — A & I Realty` },
          { property: "og:description", content: loaderData.short },
        ]
      : [{ title: "Service unavailable — A & I Realty" }, { name: "robots", content: "noindex" }],
  }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const s = Route.useLoaderData();
  const idx = services.findIndex((x) => x.slug === s.slug);
  const next = services[(idx + 1) % services.length]!;
  return (
    <>
      <section className="relative h-[80svh] min-h-[520px] overflow-hidden bg-charcoal text-ivory">
        <img src={s.image} alt={s.title} className="absolute inset-0 h-full w-full animate-fade object-cover opacity-70" />
        <div className="veil absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-6 pb-16 md:px-10">
          <p className="eyebrow text-champagne">Service 0{idx + 1}</p>
          <h1 className="display-xl mt-4"><span className="mask-reveal"><span>{s.title}</span></span></h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1500px] gap-16 px-6 py-24 md:grid-cols-12 md:px-10">
        <div className="md:col-span-6">
          <p className="font-display text-3xl leading-snug md:text-4xl">{s.body}</p>
          <ul className="mt-12 space-y-4 border-t pt-8">
            {s.points.map((p) => <li key={p} className="flex items-center gap-3"><Check className="h-4 w-4 text-champagne" />{p}</li>)}
          </ul>
          <Link to="/services/$slug" params={{ slug: next.slug }} className="mt-16 block border-t pt-8">
            <span className="eyebrow text-muted-foreground">Next service</span>
            <span className="link-lux mt-2 block font-display text-3xl">{next.title} →</span>
          </Link>
        </div>
        <div className="bg-stone p-8 md:col-span-6 md:p-12">
          <p className="eyebrow text-forest">Enquire about this service</p>
          <h2 className="mt-3 text-4xl">Let's talk.</h2>
          <div className="mt-8"><EnquiryForm defaultMessage={`I'd like to know more about ${s.title}.`} /></div>
        </div>
      </section>
    </>
  );
}
