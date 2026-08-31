"use client";

import { useState } from "react";

export interface GraphData {
  chart_type: "bar" | "pie" | "line" | "horizontal_bar";
  title: string;
  labels: string[];
  values: number[];
  colors: string[];
}

interface GraphBuilderProps {
  data: GraphData;
  onChange: (data: GraphData) => void;
}

const defaultColors = ["#dc2626", "#ea580c", "#f59e0b", "#16a34a", "#0891b2", "#7c3aed", "#ec4899", "#6b7280"];

export default function GraphBuilder({ data, onChange }: GraphBuilderProps) {
  const [localData, setLocalData] = useState<GraphData>({
    chart_type: data.chart_type || "bar",
    title: data.title || "",
    labels: data.labels || ["Label 1", "Label 2", "Label 3"],
    values: data.values || [10, 20, 30],
    colors: data.colors || defaultColors.slice(0, 3),
  });

  const update = (partial: Partial<GraphData>) => {
    const updated = { ...localData, ...partial };
    setLocalData(updated);
    onChange(updated);
  };

  const addDataPoint = () => {
    const idx = localData.labels.length;
    update({
      labels: [...localData.labels, `Label ${idx + 1}`],
      values: [...localData.values, 0],
      colors: [...localData.colors, defaultColors[idx % defaultColors.length]],
    });
  };

  const removeDataPoint = (idx: number) => {
    if (localData.labels.length <= 1) return;
    update({
      labels: localData.labels.filter((_, i) => i !== idx),
      values: localData.values.filter((_, i) => i !== idx),
      colors: localData.colors.filter((_, i) => i !== idx),
    });
  };

  const updateLabel = (idx: number, label: string) => {
    const labels = [...localData.labels];
    labels[idx] = label;
    update({ labels });
  };

  const updateValue = (idx: number, value: string) => {
    const values = [...localData.values];
    values[idx] = parseFloat(value) || 0;
    update({ values });
  };

  const updateColor = (idx: number, color: string) => {
    const colors = [...localData.colors];
    colors[idx] = color;
    update({ colors });
  };

  const maxValue = Math.max(...localData.values, 1);

  return (
    <div className="space-y-4">
      {/* Chart type selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Chart Type:</label>
        {[
          { value: "bar", label: "📊 Vertical Bar" },
          { value: "horizontal_bar", label: "📶 Horizontal Bar" },
          { value: "pie", label: "🥧 Pie Chart" },
          { value: "line", label: "📈 Line Chart" },
        ].map((t) => (
          <button key={t.value} onClick={() => update({ chart_type: t.value as GraphData["chart_type"] })}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{
              background: localData.chart_type === t.value ? "var(--accent-primary)" : "var(--bg-primary)",
              color: localData.chart_type === t.value ? "#ffffff" : "var(--text-secondary)",
              border: localData.chart_type === t.value ? "none" : "1px solid var(--border-color)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart title */}
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Chart Title</label>
        <input type="text" value={localData.title} onChange={(e) => update({ title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
          placeholder="e.g. Survey Results" />
      </div>

      {/* Data points */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Data Points</label>
          <button onClick={addDataPoint} className="text-xs font-medium px-2 py-1 rounded-lg"
            style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>+ Add Point</button>
        </div>
        {localData.labels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input type="color" value={localData.colors[idx] || defaultColors[idx % defaultColors.length]}
              onChange={(e) => updateColor(idx, e.target.value)}
              className="w-8 h-8 rounded-lg border cursor-pointer flex-shrink-0" />
            <input type="text" value={label} onChange={(e) => updateLabel(idx, e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
              style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
              placeholder="Label" />
            <input type="number" value={localData.values[idx] || 0} onChange={(e) => updateValue(idx, e.target.value)}
              className="w-20 px-2 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
              style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
              min="0" />
            <button onClick={() => removeDataPoint(idx)} className="text-red-400 hover:text-red-600 text-xs px-1"
              disabled={localData.labels.length <= 1}>✕</button>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div className="p-4 rounded-xl" style={{ background: "var(--bg-primary)" }}>
        <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>Preview</p>
        <GraphPreview data={localData} maxValue={maxValue} />
      </div>
    </div>
  );
}

function GraphPreview({ data, maxValue }: { data: GraphData; maxValue: number }) {
  if (data.chart_type === "bar") {
    return (
      <div>
        {data.title && <p className="text-sm font-bold mb-3 text-center" style={{ color: "var(--text-primary)" }}>{data.title}</p>}
        <div className="flex items-end justify-center gap-3" style={{ height: "160px" }}>
          {data.labels.map((label, idx) => {
            const height = maxValue > 0 ? (data.values[idx] / maxValue) * 100 : 0;
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{data.values[idx]}</span>
                <div className="w-8 rounded-t-md transition-all" style={{ height: `${Math.max(height, 4)}%`, background: data.colors[idx] || "#dc2626" }} />
                <span className="text-[10px] truncate max-w-[60px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
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
        <div className="space-y-2">
          {data.labels.map((label, idx) => {
            const width = maxValue > 0 ? (data.values[idx] / maxValue) * 100 : 0;
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{data.values[idx]}</span>
                </div>
                <div className="w-full h-4 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
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
    let cumulativePercent = 0;

    const gradientParts: string[] = [];
    data.labels.forEach((_, idx) => {
      const percent = (data.values[idx] / total) * 100;
      gradientParts.push(`${data.colors[idx] || "#dc2626"} ${cumulativePercent}% ${cumulativePercent + percent}%`);
      cumulativePercent += percent;
    });

    return (
      <div>
        {data.title && <p className="text-sm font-bold mb-3 text-center" style={{ color: "var(--text-primary)" }}>{data.title}</p>}
        <div className="flex items-center gap-6 justify-center">
          <div className="w-32 h-32 rounded-full" style={{ background: `conic-gradient(${gradientParts.join(", ")})` }} />
          <div className="space-y-1">
            {data.labels.map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: data.colors[idx] }} />
                <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
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
        <svg viewBox="0 0 100 100" className="w-full" style={{ height: "120px" }} preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke="#dc2626" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {data.labels.map((_, idx) => {
            const x = data.labels.length > 1 ? (idx / (data.labels.length - 1)) * 100 : 50;
            const y = maxValue > 0 ? 100 - (data.values[idx] / maxValue) * 100 : 50;
            return <circle key={idx} cx={x} cy={y} r="2" fill={data.colors[idx] || "#dc2626"} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        <div className="flex justify-between mt-1">
          {data.labels.map((label, idx) => (
            <span key={idx} className="text-[8px]" style={{ color: "var(--text-muted)" }}>{label}</span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
