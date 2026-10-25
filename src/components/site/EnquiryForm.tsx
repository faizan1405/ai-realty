import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { company, services } from "@/data/site";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  service: z.string().min(1, "Choose a service"),
  location: z.string().max(100).optional(),
  budget: z.string().max(50).optional(),
  message: z.string().trim().max(1000).optional(),
});

const field = "w-full border-0 border-b border-current/25 bg-transparent py-3 text-base outline-none transition-colors placeholder:opacity-50 focus:border-champagne";

export function EnquiryForm({ defaultMessage = "", intent = "Enquire Now", dark = false }: { defaultMessage?: string; intent?: string; dark?: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [kind, setKind] = useState(intent);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const r = schema.safeParse(data);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    const d = r.data;
    const body = [
      `Request: ${kind}`, `Name: ${d.name}`, `Phone: ${d.phone}`, d.email && `Email: ${d.email}`,
      `Service: ${d.service}`, d.location && `Preferred location: ${d.location}`, d.budget && `Budget: ${d.budget}`, d.message && `\n${d.message}`,
    ].filter(Boolean).join("\n");
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(`${kind} — ${d.name}`)}&body=${encodeURIComponent(body)}`;
    toast.success("Your email app is opening with the enquiry ready to send.");
  };

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null);

  return (
    <form onSubmit={submit} noValidate className={dark ? "text-ivory" : "text-charcoal"}>
      <div className="mb-8 flex flex-wrap gap-2">
        {["Enquire Now", "Request Site Visit", "Discuss Construction"].map((k) => (
          <button type="button" key={k} onClick={() => setKind(k)} className={`border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${kind === k ? "border-champagne bg-champagne text-charcoal" : "border-current/25 hover:border-champagne"}`}>
            {k}
          </button>
        ))}
      </div>
      <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
        <div><input name="name" placeholder="Full name *" className={field} maxLength={100} /><Err k="name" /></div>
        <div><input name="phone" placeholder="Phone number *" className={field} inputMode="tel" maxLength={16} /><Err k="phone" /></div>
        <div><input name="email" placeholder="Email (optional)" className={field} maxLength={255} /><Err k="email" /></div>
        <div>
          <select name="service" defaultValue="" className={`${field} ${dark ? "[&>option]:text-charcoal" : ""}`}>
            <option value="" disabled>Service of interest *</option>
            {services.map((s) => <option key={s.slug}>{s.title}</option>)}
          </select>
          <Err k="service" />
        </div>
        <input name="location" placeholder="Preferred location" className={field} maxLength={100} />
        <input name="budget" placeholder="Budget (optional)" className={field} maxLength={50} />
        <textarea name="message" defaultValue={defaultMessage} placeholder="Message" rows={3} className={`${field} md:col-span-2`} maxLength={1000} />
      </div>
      <button type="submit" className="mt-10 bg-champagne px-10 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-charcoal transition-colors hover:bg-forest hover:text-ivory">
        Send — {kind}
      </button>
      <p className={`mt-4 text-xs ${dark ? "text-ivory/50" : "text-muted-foreground"}`}>Sends via your email app to {company.email}.</p>
    </form>
  );
}
