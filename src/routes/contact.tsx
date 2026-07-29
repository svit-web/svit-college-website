import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { getContactInfo } from "@/lib/pages.functions";
import { submitForm } from "@/lib/submissions";
import { CheckCircle2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — SVIT Vasad" }] }),
  loader: async () => {
    const contact = await getContactInfo();
    return { contact };
  },
  component: Contact,
});

function Contact() {
  const { contact } = Route.useLoaderData();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      await submitForm("contact", {
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        subject: fd.get("subject"),
        message: fd.get("message"),
      });
      setSent(true);
      toast.success("Message sent");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero title="Contact Us" accent="Get In Touch" subtitle="Have a question? Our team is happy to help." crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]} />

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Phone, t: "Call", v: contact?.phone, link: contact?.phone ? `tel:${contact.phone.replace(/\s/g, "")}` : undefined },
            { icon: Mail, t: "Email", v: contact?.email, link: contact?.email ? `mailto:${contact.email}` : undefined },
            { icon: MapPin, t: "Visit", v: contact?.address },
          ].map((c) => (
            <div key={c.t} className="card-lift rounded-2xl border border-border bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy"><c.icon className="h-5 w-5" /></div>
              <h4 className="mt-4 text-xs font-semibold uppercase tracking-widest text-crimson">{c.t}</h4>
              {c.link ? <a href={c.link} className="mt-1 block font-display font-bold text-navy hover:text-gold">{c.v}</a> : <p className="mt-1 font-display font-bold text-navy">{c.v}</p>}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-white p-8">
            {sent ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-gold" />
                <h3 className="mt-4 font-display text-2xl font-bold text-navy">Message sent!</h3>
                <p className="mt-2 text-sm text-muted-foreground">We'll reply within 1-2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input name="name" required placeholder="Name" className="input" />
                  <input name="email" required type="email" placeholder="Email" className="input" />
                  <input name="phone" placeholder="Phone" className="input" />
                  <input name="subject" placeholder="Subject" className="input" />
                </div>
                <textarea name="message" required rows={5} placeholder="Message" className="input" />
                <button disabled={submitting} className="w-full rounded-md bg-navy px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light disabled:opacity-60">
                  {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Send Message"}
                </button>
              </form>
            )}
          </div>
          <aside className="rounded-2xl bg-secondary/50 p-8">
            <h3 className="font-display text-xl font-bold text-navy">Office Hours</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between"><span>Mon – Fri</span><span className="font-semibold">{contact?.office_hours?.weekdays ?? "9:00 – 17:00"}</span></li>
              <li className="flex justify-between"><span>Saturday</span><span className="font-semibold">{contact?.office_hours?.saturday ?? "9:00 – 13:00"}</span></li>
              <li className="flex justify-between text-muted-foreground"><span>Sunday</span><span>{contact?.office_hours?.sunday ?? "Closed"}</span></li>
            </ul>
          </aside>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border">
          <iframe title="SVIT Vasad location — satellite view" src={contact?.map_iframe_url ?? "https://www.google.com/maps?q=22.470529860861355,73.07582292938241&t=k&z=18&output=embed"} className="h-96 w-full" loading="lazy" />
        </div>
      </section>
      <style>{`.input{width:100%;border-radius:0.375rem;border:1px solid var(--input);background:transparent;padding:0.625rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 2px var(--ring)}`}</style>
    </>
  );
}
