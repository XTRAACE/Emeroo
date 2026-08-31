export default function MapSection() {
  return (
    <section id="map" className="py-20 sm:py-28" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>🗺️</span> EMERO Map
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Real-Time{" "}
            <span className="gradient-text">Location Intelligence</span>
          </h2>
          <p className="section-subtitle">
            Visualize emergencies, responders, and hospitals on a live map interface.
          </p>
        </div>

        <div className="max-w-5xl mx-auto card p-0 overflow-hidden">
          <div className="aspect-video rounded-2xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #1c1917, #292524)" }}>
            {/* Mock map visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-lg font-semibold" style={{ color: "#ffffff" }}>Interactive Map View</p>
                <p className="text-sm mt-2" style={{ color: "#a8a29e" }}>Real-time emergency, responder, and hospital locations</p>
                <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs" style={{ color: "#a8a29e" }}>Emergencies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs" style={{ color: "#a8a29e" }}>Responders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs" style={{ color: "#a8a29e" }}>Hospitals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
