import { createFileRoute } from "@tanstack/react-router";
import { company, images } from "@/data/site";
import { LuxButton, PageIntro, Reveal } from "@/components/site/bits";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About A & I Realty — Hyderabad Real Estate & Construction" },
      { name: "description", content: "A & I Realty is a Hyderabad real estate and construction partner for open plots, homes, commercial spaces and full-service building." },
      { property: "og:title", content: "About A & I Realty" },
      { property: "og:description", content: "Your partner to dream, build and own in Hyderabad." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageIntro eyebrow="About" title={<>Dream. Build. <em className="text-champagne">Own.</em></>} />
      <section className="mx-auto grid max-w-[1500px] gap-16 px-6 py-24 md:grid-cols-12 md:px-10">
        <Reveal className="md:col-span-6">
          <p className="font-display text-4xl leading-tight">At A &amp; I Realty, we believe real estate is more than buying property — it's about building your legacy.</p>
        </Reveal>
        <Reveal delay={120} className="space-y-6 text-muted-foreground md:col-span-5 md:col-start-8">
          <p>Based in {company.city}, we specialise in open plots, residential homes, commercial developments and full-service construction.</p>
          <p>With a deep understanding of the market and a strong network of legal, architectural and construction experts, we aim to offer a seamless, transparent experience from start to finish.</p>
          <p>Whether you're looking to invest or to build, we want to be your trusted partner every step of the way.</p>
        </Reveal>
      </section>
      <section className="grid md:grid-cols-2">
        <img src={images.plots} alt="Open plots" loading="lazy" className="aspect-[4/3] w-full object-cover" />
        <img src={images.construction} alt="Construction" loading="lazy" className="aspect-[4/3] w-full object-cover" />
      </section>
      <section className="mx-auto max-w-[1500px] px-6 py-32 text-center md:px-10">
        <h2 className="display-lg">Begin your <em>journey.</em></h2>
        <div className="mt-10"><LuxButton to="/contact" variant="dark">Talk to us</LuxButton></div>
      </section>
    </>
  );
}
