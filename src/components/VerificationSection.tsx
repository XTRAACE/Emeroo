export default function VerificationSection() {
  const steps = [
    { icon: "🔐", title: "Identity Verification", description: "All users are verified through secure authentication before accessing emergency features" },
    { icon: "📍", title: "Location Validation", description: "GPS coordinates are cross-referenced with multiple sources to ensure accuracy" },
    { icon: "🤖", title: "AI Fraud Detection", description: "Machine learning algorithms detect and prevent false emergency reports" },
    { icon: "📊", title: "Behavioral Analysis", description: "System monitors usage patterns to identify and flag suspicious activities" },
  ];

  return (
    <section className="py-20 sm:py-28" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>🛡️</span> Verification & Safety
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Preventing <span className="gradient-text">Misuse</span>
          </h2>
          <p className="section-subtitle">
            Built-in safeguards ensure the platform remains reliable and trustworthy.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="card">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
