export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-page py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-navy mb-6">
            SVIT Vasad
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sardar Vallabhbhai Institute of Technology
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-soft rounded-lg">
            <span className="text-sm font-medium text-navy">
              Next.js 16 Scaffold — Phase 1 Complete
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
