export default function SolutionSection() {
  const scenarios = [
    {
      icon: "🚗",
      title: "Road Accident",
      description: "When an accident is reported, EMERO instantly alerts nearest responders, notifies hospitals along the route, and guides the ambulance with optimal pathfinding.",
    },
    {
      icon: "🚑",
      title: "Emergency Vehicle",
      description: "Ambulances receive real-time traffic data, hospital bed availability, and patient information — enabling them to prepare before arrival.",
    },
    {
      icon: "🏥",
      title: "Hospital Coordination",
      description: "Hospitals get pre-arrival alerts with patient details, estimated arrival time, and required resources — allowing teams to prepare in advance.",
    },
    {
      icon: "🆘",
      title: "SOS Activation",
      description: "Anyone can trigger a global SOS that reaches all nearby responders, shares exact GPS location, and opens a real-time communication channel.",
    },
  ];

  return (
    <section id="solution" className="py-20 sm:py-28" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="section-badge mx-auto mb-4">
            <span>💡</span> The Solution
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            How <span className="gradient-text">EMERO</span> Solves This
          </h2>
          <p className="section-subtitle">
            EMERO creates a unified emergency ecosystem where every stakeholder —
            victims, responders, vehicles, and hospitals — stays connected in real-time.
          </p>
        </div>

        {/* Flow visualization */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-16 max-w-3xl mx-auto">
          {["Person", "EMERO", "Responders", "Hospital"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="number-badge">{i + 1}</div>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{step}</span>
              </div>
              {i < 3 && (
                <svg className="w-6 h-6 hidden sm:block" style={{ color: "var(--accent-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {scenarios.map((scenario, i) => (
            <div key={i} className="card">
              <div className="text-3xl mb-3">{scenario.icon}</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {scenario.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {scenario.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
