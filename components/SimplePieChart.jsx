"use client";

import { useMemo } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function SimplePieChart({
  data = [],
  size = 140,
  strokeWidth = 18,
  className = "",
  label = "",
}) {
  const total = useMemo(() => {
    const sum = data.reduce((acc, item) => acc + Number(item?.value || 0), 0);
    return sum > 0 ? sum : 0;
  }, [data]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    const palette = [
      "#14b8a6", // teal
      "#22c55e", // green
      "#f59e0b", // amber
      "#ef4444", // red
      "#3b82f6", // blue
      "#a855f7", // purple
      "#0ea5e9", // sky
    ];

    return data
      .reduce(
        (result, item, idx) => {
          const value = Number(item?.value || 0);
          const percent = total > 0 ? value / total : 0;
          const dash = circumference * percent;
          const dashoffset =
            circumference * (1 - result.accumulated - percent);
          const segment = {
            idx,
            value,
            percent,
            color: item?.color || palette[idx % palette.length],
            dash,
            dashoffset,
          };

          return {
            accumulated: result.accumulated + percent,
            items:
              segment.value > 0 || total === 0
                ? [...result.items, segment]
                : result.items,
          };
        },
        { accumulated: 0, items: [] }
      )
      .items;
  }, [data, total, circumference]);

  const safeLabel = label || "";

  if (segments.length === 0) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div
          className="text-sm text-slate-500"
          style={{ width: size, textAlign: "center" }}
        >
          No data
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div style={{ width: size, height: size, position: "relative" }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />

          {segments.map((seg) => (
            <circle
              key={seg.idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={seg.dashoffset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          ))}
        </svg>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div className="text-sm font-bold text-slate-900">
            {total}
          </div>
          {safeLabel ? (
            <div className="text-[11px] font-semibold text-slate-500">
              {safeLabel}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
        {data
          .filter((d) => Number(d?.value || 0) > 0)
          .slice(0, 6)
          .map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-2"
              title={`${d.label}: ${d.value}`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: d.color || "#14b8a6" }}
              />
              <span className="font-semibold text-slate-700">{d.label}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

