"use client";

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

interface VideoHeroSectionProps {
  videos?: { id: string; youtube_url: string; title: string; description: string }[];
}

export default function VideoHeroSection({ videos = [] }: VideoHeroSectionProps) {
  if (videos.length === 0) return null;

  const mainVideo = videos[0];
  const videoId = extractYoutubeId(mainVideo.youtube_url);

  if (!videoId) return null;

  return (
    <section className="py-20" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div className="text-center mb-4">
          <div className="section-badge mx-auto">
            <span>▶️</span> Introduction Video
          </div>
        </div>
        <h2 className="section-title text-center mb-4">
          Watch <span className="gradient-text">EMERO</span> in Action
        </h2>
        <p className="section-subtitle text-center mb-10">
          See how EMERO connects people, emergency vehicles, hospitals and responders through intelligent coordination.
        </p>
        <div className="max-w-4xl mx-auto">
          <div className="card p-0 overflow-hidden">
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={mainVideo.title || "EMERO Introduction Video"}
              />
            </div>
            {(mainVideo.title || mainVideo.description) && (
              <div className="p-6">
                {mainVideo.title && (
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{mainVideo.title}</h3>
                )}
                {mainVideo.description && (
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{mainVideo.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
        {videos.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
            {videos.slice(1).map((video) => {
              const vid = extractYoutubeId(video.youtube_url);
              return vid ? (
                <div key={video.id} className="card p-0 overflow-hidden">
                  <div className="aspect-video bg-gray-900">
                    <iframe src={`https://www.youtube.com/embed/${vid}`} className="w-full h-full" allowFullScreen title={video.title || "Video"} />
                  </div>
                  {video.title && (
                    <div className="p-4">
                      <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{video.title}</h4>
                      {video.description && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{video.description}</p>}
                    </div>
                  )}
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </section>
  );
}
