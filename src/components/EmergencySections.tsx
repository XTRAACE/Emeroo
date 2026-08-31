export function EmergencyResponderSection() {
  const features = [
    { icon: "📱", title: "Instant Alerts", description: "Receive emergency notifications with exact location and severity details within seconds" },
    { icon: "🗺️", title: "Smart Routing", description: "AI-optimized routes that account for traffic, road conditions, and hospital proximity" },
    { icon: "📊", title: "Patient Data", description: "Access critical patient information, medical history, and vital signs before arrival" },
  ];

  return (
    <section id="capabilities" className="py-20 sm:py-28" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>🚑</span> Emergency Responders
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Empowering <span className="gradient-text">First Responders</span>
          </h2>
          <p className="section-subtitle">
            Real-time coordination tools that help responders reach victims faster and better prepared.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="card text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GlobalSOSSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>🆘</span> Global SOS
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            One Touch to <span className="gradient-text">Get Help</span>
          </h2>
          <p className="section-subtitle">
            Trigger a worldwide SOS that reaches all nearby responders, shares your location,
            and opens a real-time communication channel.
          </p>
        </div>

        <div className="max-w-md mx-auto card p-8 text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold animate-pulse"
            style={{ background: "var(--gradient-primary)", boxShadow: "0 0 40px rgba(220,38,38,0.4)" }}>
            SOS
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Emergency SOS</h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Press and hold to send an emergency alert with your current GPS location
          </p>
          <div className="space-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Auto-sends GPS coordinates
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Notifies nearest responders
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Opens live communication channel
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HospitalSection() {
  return (
    <section id="hospital" className="py-20 sm:py-28" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>🏥</span> Hospital Assistance
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Hospital <span className="gradient-text">Pre-Arrival Alerts</span>
          </h2>
          <p className="section-subtitle">
            Hospitals receive comprehensive alerts before the ambulance arrives, enabling
            them to prepare the right resources and medical teams.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="card text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Patient Profile</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Medical history, allergies, blood type, and current condition</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>ETA Prediction</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Accurate arrival time based on real-time traffic and route data</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🛏️</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Resource Planning</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Bed availability, operating room scheduling, and specialist alerts</p>
          </div>
        </div>
      </div>
    </section>
  );
}
