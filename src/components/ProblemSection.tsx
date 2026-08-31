export default function ProblemSection() {
  const problems = [
    {
      icon: "⏱️",
      title: "Response Time Gaps",
      description: "Every minute of delay in emergency response dramatically reduces survival rates. Current systems lack real-time coordination between all parties.",
    },
    {
      icon: "📍",
      title: "Location Confusion",
      description: "Callers struggle to describe their exact location during emergencies. Dispatchers waste critical time trying to pinpoint where help is needed.",
    },
    {
      icon: "🏥",
      title: "Hospital Readiness",
      description: "Hospitals are often caught off-guard by incoming emergencies, leading to resource misallocation and preparation delays.",
    },
    {
      icon: "🔗",
      title: "Disconnected Systems",
      description: "People, vehicles, hospitals and responders all operate on separate, incompatible systems with no unified coordination platform.",
    },
  ];

  return (
    <section id="challenge" className="py-20 sm:py-28" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="section-badge mx-auto mb-4">
            <span>🚨</span> The Challenge
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Emergency Response Is{" "}
            <span className="gradient-text">Broken by Design</span>
          </h2>
          <p className="section-subtitle">
            Current emergency systems are fragmented, slow, and leave critical gaps between
            people who need help and those who can provide it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, i) => (
            <div key={i} className="card group">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{problem.icon}</div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {problem.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
