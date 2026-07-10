import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Reveal } from "./Reveal";

export function CTABanner() {
  return (
    <section className="container-page py-16 md:py-20">
      <Reveal>
        <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-deep via-navy to-navy-light p-8 md:p-14 text-white">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-crimson/25 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <div className="mb-3 inline-block rounded-full bg-gold/15 border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
                Admissions Open 2026-27
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                Begin your journey at SVIT Vasad
              </h3>
              <p className="mt-3 text-white/80 max-w-lg">
                Join 5000+ students shaping careers in engineering, management and applied sciences. Applications now open across all programmes.
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-white/85 sm:grid-cols-2">
                <li>• 7 undergraduate & postgraduate streams</li>
                <li>• Merit & need-based scholarships</li>
                <li>• Hostel accommodation available</li>
                <li>• 95% placement track record</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/admissions/inquiry"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/downloads"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Download className="h-4 w-4" /> Download Brochure
              </Link>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}
