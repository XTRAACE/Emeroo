export default function ThankYouSection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)"
        }}
      />
      <div className="relative section-container text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Thank You
        </h2>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
          For exploring EMERO — a vision for smarter, faster emergency response that could save lives.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#prototype" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}>
            View Prototype
          </a>
          <a href="#feedback" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}>
            Leave Feedback
          </a>
        </div>
      </div>
    </section>
  );
}
