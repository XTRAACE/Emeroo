"use client";

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  description: string;
  category: string;
}

interface VideoItem {
  id: string;
  youtube_url: string;
  title: string;
  description: string;
  category: string;
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

export function GallerySection({ items = [] }: { items?: GalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="py-20 sm:py-28" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>📸</span> Gallery
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Visual <span className="gradient-text">Showcase</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {items.map((item) => (
            <div key={item.id} className="card p-0 overflow-hidden group">
              <div className="aspect-square overflow-hidden">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              </div>
              {item.title && (
                <div className="p-3">
                  <h4 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{item.title}</h4>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function YouTubeSection({ videos = [] }: { videos?: VideoItem[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="py-20 sm:py-28" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>🎬</span> Videos
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            Watch <span className="gradient-text">EMERO</span> in Action
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {videos.map((video) => {
            const videoId = extractYoutubeId(video.youtube_url);
            return videoId ? (
              <div key={video.id} className="card p-0 overflow-hidden">
                <div className="aspect-video">
                  <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen title={video.title || "Video"} />
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
      </div>
    </section>
  );
}
