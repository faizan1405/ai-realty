import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { properties } from "@/data/site";
import { PageIntro, PropertyCard, Reveal, DemoBadge } from "@/components/site/bits";
import { PropertyFilters, applyFilters, defaultFilters, type Filters } from "@/components/site/PropertyFilters";

export const Route = createFileRoute("/properties/")({
  head: () => ({
    meta: [
      { title: "Properties in Hyderabad — A & I Realty" },
      { name: "description", content: "Browse apartments, villas, independent houses and open plots in Hyderabad. Filter by budget, type, location and more." },
      { property: "og:title", content: "Properties in Hyderabad — A & I Realty" },
      { property: "og:description", content: "Apartments, villas, houses and open plots in Hyderabad." },
    ],
  }),
  component: Listings,
});

function Listings() {
  const [f, setF] = useState<Filters>(defaultFilters);
  const list = useMemo(() => applyFilters(properties, f), [f]);
  return (
    <>
      <PageIntro eyebrow="Properties" title={<>Find your <em className="text-champagne">place.</em></>}>
        <DemoBadge /> <span className="ml-2 text-sm">All listings shown are demonstration examples, not current inventory.</span>
      </PageIntro>
      <section className="mx-auto max-w-[1500px] px-6 py-16 md:px-10">
        <PropertyFilters value={f} onChange={setF} />
        <p className="eyebrow mt-10 text-muted-foreground">{list.length} result{list.length === 1 ? "" : "s"}</p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 100}>
              <PropertyCard p={p} />
            </Reveal>
          ))}
        </div>
        {list.length === 0 && <p className="py-24 text-center font-display text-3xl text-muted-foreground">No matches — try widening your filters.</p>}
      </section>
    </>
  );
}
