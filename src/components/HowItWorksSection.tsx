export default function HowItWorksSection() {
  const steps = [
    { icon: "📱", title: "Report Emergency", description: "User triggers an SOS or reports an accident through the app" },
    { icon: "📡", title: "Location & AI Analysis", description: "EMERO captures GPS, analyzes severity, and determines optimal response" },
    { icon: "🚨", title: "Alert Responders", description: "Nearest emergency vehicles and responders receive instant notifications" },
    { icon: "🗺️", title: "Optimal Routing", description: "AI-powered route optimization accounts for traffic and road conditions" },
    { icon: "🏥", title: "Hospital Notification", description: "Destination hospital receives pre-arrival alert with patient data" },
    { icon: "📞", title: "Real-time Communication", description: "Live chat and call between victim, responders, and hospital staff" },
    { icon: "✅", title: "Resolution & Feedback", description: "Emergency resolved, case logged, and feedback collected for improvement" },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="section-badge mx-auto mb-4">
            <span>⚙️</span> How It Works
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Seven Steps to{" "}
            <span className="gradient-text">Saved Lives</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 sm:gap-6 mb-8 last:mb-0">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: "rgba(220,38,38,0.1)" }}>
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 flex-1 mt-2" style={{ background: "var(--accent-primary)", opacity: 0.2 }} />
                )}
              </div>
              <div className="card flex-1 mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: "var(--accent-primary)" }}>
                    Step {i + 1}
                  </span>
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
