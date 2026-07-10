import svit from "@/assets/svit-logo.jpg.asset.json";
import svica from "@/assets/svica-logo.jpg.asset.json";
import svion from "@/assets/svion-logo.png.asset.json";
import coa from "@/assets/coa-svit-logo.png.asset.json";

const items = [
  { name: "SVIT", full: "Sardar Vallabhbhai Patel Institute of Technology", src: svit.url },
  { name: "SVICA", full: "Sardar Vallabhbhai Patel Institute of Computer Application", src: svica.url },
  { name: "SVION", full: "Sardar Vallabhbhai Patel Institute of Nursing", src: svion.url },
  { name: "COA SVIT", full: "COA SVIT", src: coa.url },
];

export function InstituteLogos() {
  return (
    <section className="border-b border-border bg-white py-10">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map((i) => (
            <div key={i.name} className="flex flex-col items-center justify-end gap-3">
              <img
                src={i.src}
                alt={`${i.full} logo`}
                loading="lazy"
                className="h-24 w-auto max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
              <div className="text-xs font-bold uppercase tracking-widest text-navy">{i.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
