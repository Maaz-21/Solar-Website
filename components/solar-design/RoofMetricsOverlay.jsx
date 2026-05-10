"use client";

import { Zap, Sun, Leaf, DollarSign } from "lucide-react";

export default function RoofMetricsOverlay({ roofMetrics, panelLayout }) {
  if (!roofMetrics || !panelLayout) return null;

  const metrics = [
    {
      icon: <Sun size={14} />,
      label: "Panels",
      value: panelLayout.panelCount,
      unit: "",
    },
    {
      icon: <Zap size={14} />,
      label: "System",
      value: panelLayout.systemSizeKW,
      unit: "kW",
    },
    {
      icon: <Leaf size={14} />,
      label: "Roof Area",
      value: Math.round(roofMetrics.totalArea),
      unit: "m²",
    },
    {
      icon: <DollarSign size={14} />,
      label: "Utilization",
      value: panelLayout.roofUtilization,
      unit: "%",
    },
  ];

  return (
    <div className="sd-metrics-overlay">
      {metrics.map((m) => (
        <div key={m.label} className="sd-metric-chip">
          {m.icon}
          <span className="sd-metric-value">
            {m.value}
            <small>{m.unit}</small>
          </span>
          <span className="sd-metric-label">{m.label}</span>
        </div>
      ))}
    </div>
  );
}
