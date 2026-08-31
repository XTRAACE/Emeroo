"use client";

interface FeedbackItem {
  id: string;
  person_name: string;
  photo_url: string | null;
  role: string;
  description: string;
  feedback_text: string;
  audio_url: string | null;
  youtube_url: string | null;
  category: string;
}

interface AudioEntry {
  url: string;
  label: string;
}

function parseAudioArray(audioUrl: string | null): AudioEntry[] {
  if (!audioUrl) return [];
  try {
    const parsed = JSON.parse(audioUrl);
    if (Array.isArray(parsed)) return parsed;
    return [{ url: audioUrl, label: "Audio" }];
  } catch {
    return [{ url: audioUrl, label: "Audio" }];
  }
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

export default function FeedbackSection({ feedback = [] }: { feedback?: FeedbackItem[] }) {
  if (feedback.length === 0) return null;

  return (
    <section id="feedback" className="py-20 sm:py-28" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>💬</span> Feedback
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            What People <span className="gradient-text">Say</span>
          </h2>
          <p className="section-subtitle">
            Feedback from people who explored the EMERO concept.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {feedback.map((item) => {
            const audios = parseAudioArray(item.audio_url);
            const youtubeId = item.youtube_url ? extractYoutubeId(item.youtube_url) : null;

            return (
              <div key={item.id} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold"
                    style={{ background: "var(--gradient-primary)" }}>
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.person_name} className="w-full h-full object-cover" />
                    ) : (
                      item.person_name?.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{item.person_name}</h4>
                    {item.role && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.role}</p>}
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm italic mb-2" style={{ color: "var(--text-secondary)" }}>
                    &ldquo;{item.description}&rdquo;
                  </p>
                )}

                {item.feedback_text && (
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                    {item.feedback_text}
                  </p>
                )}

                {/* Audio players */}
                {audios.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {audios.map((audio, i) => (
                      <div key={i} className="p-2 rounded-lg" style={{ background: "var(--bg-primary)" }}>
                        {audios.length > 1 && (
                          <span className="text-[10px] font-medium mb-1 block" style={{ color: "var(--accent-primary)" }}>
                            {audio.label}
                          </span>
                        )}
                        <audio controls src={audio.url} className="w-full" style={{ height: "32px" }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* YouTube */}
                {youtubeId && (
                  <div className="mt-3 rounded-xl overflow-hidden">
                    <div className="aspect-video">
                      <iframe src={`https://www.youtube.com/embed/${youtubeId}`} className="w-full h-full" allowFullScreen title="Feedback video" />
                    </div>
                  </div>
                )}

                {item.category && (
                  <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-primary)" }}>
                    {item.category}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
