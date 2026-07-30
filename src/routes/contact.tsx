import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { getContactInfo } from "@/lib/pages.functions";
import { submitForm } from "@/lib/submissions";
import { CheckCircle2, Facebook, Instagram, Linkedin, Loader2, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const socialIconMap: Record<string, typeof Facebook> = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
  Twitter,
  Youtube,
};

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
  const socialLinks = contact?.social_links ?? {};

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
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.06}>
              <div className="card-lift h-full rounded-2xl border-2 border-navy/15 bg-white p-6 transition-colors hover:border-gold">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson/10 text-crimson">
                  <c.icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-xs font-bold uppercase tracking-widest text-crimson">{c.t}</h4>
                {c.v ? (
                  c.link ? (
                    <a href={c.link} className="mt-1 block font-display font-bold text-navy hover:text-gold">{c.v}</a>
                  ) : (
                    <p className="mt-1 font-display font-bold text-navy">{c.v}</p>
                  )
                ) : (
                  <p className="mt-1 text-sm italic text-muted-foreground">Not available yet</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
              {sent ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-gold" />
                  <h3 className="mt-4 font-display text-2xl font-bold text-navy">Message sent!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">We'll reply within 1-2 business days.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-xl font-bold text-navy">Send us a message</h3>
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input name="name" required placeholder="Name" className="input" />
                      <input name="email" required type="email" placeholder="Email" className="input" />
                      <input name="phone" placeholder="Phone" className="input" />
                      <input name="subject" placeholder="Subject" className="input" />
                    </div>
                    <textarea name="message" required rows={5} placeholder="Message" className="input" />
                    <button disabled={submitting} className="w-full rounded-md bg-navy px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-navy-light disabled:opacity-60">
                      {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <aside className="flex h-full flex-col gap-6 rounded-2xl border-2 border-navy/15 bg-secondary/30 p-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-crimson">Office Hours</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex justify-between"><span>Mon – Fri</span><span className="font-semibold text-navy">{contact?.office_hours?.weekdays ?? "9:00 – 17:00"}</span></li>
                  <li className="flex justify-between"><span>Saturday</span><span className="font-semibold text-navy">{contact?.office_hours?.saturday ?? "9:00 – 13:00"}</span></li>
                  <li className="flex justify-between text-muted-foreground"><span>Sunday</span><span>{contact?.office_hours?.sunday ?? "Closed"}</span></li>
                </ul>
              </div>

              {Object.values(socialLinks).some(Boolean) && (
                <div className="mt-auto border-t border-navy/10 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-crimson">Follow Us</h3>
                  <div className="mt-4 flex gap-3">
                    {Object.entries(socialLinks).map(([platform, url]) => {
                      const Icon = socialIconMap[platform];
                      if (!Icon || !url) return null;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={platform}
                          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-navy/15 bg-white text-navy transition-colors hover:border-gold hover:text-gold"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-2xl border-2 border-navy/15">
            <iframe title="SVIT Vasad location — satellite view" src={contact?.map_iframe_url ?? "https://www.google.com/maps?q=22.470529860861355,73.07582292938241&t=k&z=18&output=embed"} className="h-96 w-full" loading="lazy" />
          </div>
        </Reveal>
      </section>
      <style>{`.input{width:100%;border-radius:0.75rem;border:2px solid color-mix(in oklab, var(--navy) 10%, transparent);background:#fff;padding:0.75rem 1rem;font-size:0.875rem;transition:border-color 200ms ease}.input:focus{outline:none;border-color:var(--gold)}`}</style>
    </>
  );
}
