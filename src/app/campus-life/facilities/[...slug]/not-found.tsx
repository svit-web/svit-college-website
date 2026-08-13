export default function FacilityNotFound() {
  return (
    <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center">
      <div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div>
      <h2 className="mt-2 font-display text-2xl font-bold text-navy">Facility not available</h2>
      <p className="mt-2 text-sm text-muted-foreground">The facility you are looking for does not exist yet.</p>
    </div>
  );
}
