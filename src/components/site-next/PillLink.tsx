import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pillLink } from "./site-styles";

export function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={pillLink}>
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
