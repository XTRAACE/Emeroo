"use client";

interface Contributor {
  id: string;
  name: string;
  photo_url: string | null;
  contribution: string;
  description: string;
}

export default function ContributorsSection({ contributors = [] }: { contributors?: Contributor[] }) {
  return (
    <section id="contributors" className="py-20 sm:py-28" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>👥</span> Contributors
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Meet the <span className="gradient-text">Team</span>
          </h2>
          <p className="section-subtitle">
            The people who brought EMERO to life.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {contributors.map((c) => (
            <div key={c.id} className="card text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: "var(--gradient-primary)" }}>
                {c.photo_url ? (
                  <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  c.name?.charAt(0)
                )}
              </div>
              <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{c.name}</h4>
              {c.contribution && (
                <p className="text-xs mt-1" style={{ color: "var(--accent-primary)" }}>{c.contribution}</p>
              )}
              {c.description && (
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{c.description}</p>
              )}
            </div>
          ))}
        </div>

        {contributors.length === 0 && (
          <div className="text-center py-8">
            <p style={{ color: "var(--text-muted)" }}>Add contributors in the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}
