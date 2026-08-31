export default function TimelineSection() {
  const stages = [
    { date: "Phase 1", title: "Research & Discovery", description: "Identified critical gaps in emergency response systems through user research and stakeholder interviews" },
    { date: "Phase 2", title: "Concept Development", description: "Designed the core EMERO concept — a unified platform connecting all emergency stakeholders" },
    { date: "Phase 3", title: "System Architecture", description: "Built the technical foundation with real-time communication, GPS tracking, and AI routing" },
    { date: "Phase 4", title: "Prototype Design", description: "Created interactive prototypes for mobile app and web dashboard interfaces" },
    { date: "Phase 5", title: "Testing & Validation", description: "Conducted user testing with emergency responders, hospital staff, and everyday users" },
    { date: "Phase 6", title: "Refinement", description: "Iterated on feedback to improve usability, accuracy, and response time optimization" },
  ];

  return (
    <section id="journey" className="py-20 sm:py-28" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="section-badge mx-auto mb-4">
            <span>🛤️</span> Our Journey
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Building <span className="gradient-text">EMERO</span>
          </h2>
          <p className="section-subtitle">
            From initial research to working prototype — the story behind EMERO.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {stages.map((stage, i) => (
            <div key={i} className="flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "var(--gradient-primary)" }}>
                  {i + 1}
                </div>
                {i < stages.length - 1 && (
                  <div className="w-0.5 flex-1 mt-2" style={{ background: "var(--accent-primary)", opacity: 0.2 }} />
                )}
              </div>
              <div className="card flex-1 mb-0">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                  style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-primary)" }}>
                  {stage.date}
                </span>
                <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>{stage.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
