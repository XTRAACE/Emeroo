"use client";

import { useState } from "react";

interface Survey {
  id: string;
  title: string;
  description: string;
  response: string;
  image_url: string | null;
  category: string;
  document_url: string | null;
  graph_data: {
    chart_type: string;
    title: string;
    labels: string[];
    values: number[];
    colors: string[];
  } | null;
  documents: { url: string; name: string }[] | string | null;
  videos: { url: string; title: string }[] | string | null;
  audios: { url: string; label: string }[] | string | null;
}

function parseJson<T>(val: unknown): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val as string); return Array.isArray(p) ? p : []; } catch { return []; }
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

export default function ResearchSection({ surveys = [] }: { surveys?: Survey[] }) {
  const learnings = [
    { icon: "🎯", title: "Speed is Critical", description: "Users emphasized that every second counts in emergencies — the interface must be fast and intuitive" },
    { icon: "📍", title: "Location Accuracy", description: "GPS precision is vital — even small errors can mean the difference between life and death" },
    { icon: "🤝", title: "Trust Matters", description: "Users need to trust the system before relying on it during real emergencies" },
    { icon: "📱", title: "Simplicity Wins", description: "The fewer steps to trigger an emergency, the better — one-tap SOS is essential" },
  ];

  return (
    <section id="research" className="py-20 sm:py-28" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>🔬</span> Research & Insights
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            What We <span className="gradient-text">Learned</span>
          </h2>
          <p className="section-subtitle">
            Insights from our research with emergency responders, hospital staff, and potential users.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {learnings.map((l, i) => (
            <div key={i} className="card">
              <div className="text-3xl mb-3">{l.icon}</div>
              <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{l.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{l.description}</p>
            </div>
          ))}
        </div>

        {/* Survey data */}
        {surveys.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-center mb-6" style={{ color: "var(--text-primary)" }}>Survey Results</h3>
            <div className="space-y-6">
              {surveys.map((survey) => {
                const docs = parseJson<{ url: string; name: string }>(survey.documents);
                const vids = parseJson<{ url: string; title: string }>(survey.videos);
                const audioItems = parseJson<{ url: string; label: string }>(survey.audios);

                return (
                  <div key={survey.id} className="card">
                    <h4 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>{survey.title}</h4>
                    <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{survey.description}</p>

                    {survey.response && (
                      <div className="text-xs p-3 rounded-lg mb-3 whitespace-pre-wrap" style={{ background: "rgba(220,38,38,0.06)", color: "var(--text-muted)" }}>
                        {survey.response}
                      </div>
                    )}

                    {survey.image_url && (
                      <img src={survey.image_url} alt={survey.title} className="rounded-lg w-full object-cover max-h-60 mb-3" />
                    )}

                    {/* Graph/Chart */}
                    {survey.graph_data && survey.graph_data.labels && (
                      <div className="p-4 rounded-xl mb-3" style={{ background: "var(--bg-primary)" }}>
                        <SurveyGraph data={survey.graph_data} />
                      </div>
                    )}

                    {/* Documents */}
                    {docs.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {docs.map((doc, i) => (
                          <a key={i} href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: "rgba(220,38,38,0.06)", color: "var(--accent-primary)" }}>
                            📄 {doc.name}
                          </a>
                        ))}
                      </div>
                    )}

                    {survey.document_url && (
                      <a href={survey.document_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-3"
                        style={{ background: "rgba(220,38,38,0.06)", color: "var(--accent-primary)" }}>
                        📄 Download Document
                      </a>
                    )}

                    {/* Audio players */}
                    {audioItems.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {audioItems.map((audio, i) => (
                          <div key={i} className="p-2 rounded-lg" style={{ background: "var(--bg-primary)" }}>
                            {audioItems.length > 1 && <span className="text-[10px] font-medium block mb-1" style={{ color: "var(--accent-primary)" }}>{audio.label}</span>}
                            <audio controls src={audio.url} className="w-full" style={{ height: "32px" }} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Videos */}
                    {vids.length > 0 && (
                      <div className="space-y-3">
                        {vids.map((video, i) => {
                          const videoId = extractYoutubeId(video.url);
                          return videoId ? (
                            <div key={i} className="rounded-xl overflow-hidden">
                              {video.title && <p className="text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>{video.title}</p>}
                              <div className="aspect-video">
                                <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen title={video.title || "Video"} />
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {survey.category && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-primary)" }}>
                        {survey.category}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SurveyGraph({ data }: { data: { chart_type: string; title: string; labels: string[]; values: number[]; colors: string[] } }) {
  const maxValue = Math.max(...data.values, 1);

  if (data.chart_type === "bar") {
    return (
      <div>
        {data.title && <p className="text-sm font-bold mb-3 text-center" style={{ color: "var(--text-primary)" }}>{data.title}</p>}
        <div className="flex items-end justify-center gap-3" style={{ height: "180px" }}>
          {data.labels.map((label, idx) => {
            const height = maxValue > 0 ? (data.values[idx] / maxValue) * 100 : 0;
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{data.values[idx]}</span>
                <div className="w-10 sm:w-12 rounded-t-md transition-all" style={{ height: `${Math.max(height, 4)}%`, background: data.colors[idx] || "#dc2626" }} />
                <span className="text-[10px] truncate max-w-[70px] text-center" style={{ color: "var(--text-secondary)" }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (data.chart_type === "horizontal_bar") {
    return (
      <div>
        {data.title && <p className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>{data.title}</p>}
        <div className="space-y-3">
          {data.labels.map((label, idx) => {
            const width = maxValue > 0 ? (data.values[idx] / maxValue) * 100 : 0;
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{data.values[idx]}</span>
                </div>
                <div className="w-full h-5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(width, 2)}%`, background: data.colors[idx] || "#dc2626" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (data.chart_type === "pie") {
    const total = data.values.reduce((a, b) => a + b, 0) || 1;
    let cumulative = 0;
    const gradientParts: string[] = [];
    data.labels.forEach((_, idx) => {
      const pct = (data.values[idx] / total) * 100;
      gradientParts.push(`${data.colors[idx]} ${cumulative}% ${cumulative + pct}%`);
      cumulative += pct;
    });

    return (
      <div>
        {data.title && <p className="text-sm font-bold mb-3 text-center" style={{ color: "var(--text-primary)" }}>{data.title}</p>}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
          <div className="w-40 h-40 rounded-full flex-shrink-0" style={{ background: `conic-gradient(${gradientParts.join(", ")})` }} />
          <div className="space-y-2">
            {data.labels.map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: data.colors[idx] }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {label}: {data.values[idx]} ({((data.values[idx] / total) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.chart_type === "line") {
    const points = data.labels.map((_, idx) => {
      const x = data.labels.length > 1 ? (idx / (data.labels.length - 1)) * 100 : 50;
      const y = maxValue > 0 ? 100 - (data.values[idx] / maxValue) * 100 : 50;
      return `${x},${y}`;
    }).join(" ");

    return (
      <div>
        {data.title && <p className="text-sm font-bold mb-3 text-center" style={{ color: "var(--text-primary)" }}>{data.title}</p>}
        <svg viewBox="0 0 100 100" className="w-full" style={{ height: "140px" }} preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke="#dc2626" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {data.labels.map((_, idx) => {
            const x = data.labels.length > 1 ? (idx / (data.labels.length - 1)) * 100 : 50;
            const y = maxValue > 0 ? 100 - (data.values[idx] / maxValue) * 100 : 50;
            return <circle key={idx} cx={x} cy={y} r="2" fill={data.colors[idx]} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        <div className="flex justify-between mt-2">
          {data.labels.map((label, idx) => (
            <span key={idx} className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
