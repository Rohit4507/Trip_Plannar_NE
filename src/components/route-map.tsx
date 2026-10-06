"use client";

import { useMemo, useState } from "react";
import { STATE_META } from "@/lib/data/knowledge";
import type { StateCode } from "@/lib/types";

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state: StateCode;
  label?: string;
  order?: number;
  gem?: boolean;
}

const OUTLINE: [number, number][] = [
  [88.42, 26.55], [89.5, 26.8], [90.8, 26.85], [91.5, 26.9], [92.02, 27.45], [92.12, 27.95],
  [93.4, 28.55], [94.9, 29.3], [96.4, 29.42], [97.42, 28.3], [96.95, 27.7], [96.5, 27.2],
  [95.2, 26.8], [94.62, 25.9], [94.3, 25.05], [94.72, 24.3], [94.6, 23.2], [93.3, 22.9],
  [92.6, 22.2], [92.3, 23.0], [91.65, 23.6], [91.42, 24.0], [91.3, 23.68], [91.18, 23.95],
  [91.6, 24.2], [91.52, 24.9], [91.0, 25.2], [90.4, 25.18], [89.85, 25.28], [89.4, 25.42],
  [89.1, 26.0],
];

const NEIGHBOURS: { label: string; lng: number; lat: number; size: number }[] = [
  { label: "CHINA · TIBET", lng: 94.6, lat: 29.75, size: 11 },
  { label: "BHUTAN", lng: 90.7, lat: 27.6, size: 10 },
  { label: "MYANMAR", lng: 96.6, lat: 25.6, size: 10 },
  { label: "BANGLADESH", lng: 90.6, lat: 23.6, size: 10 },
  { label: "WEST BENGAL", lng: 87.9, lat: 24.4, size: 9 },
];

const W = 1000;
const H = 760;
const LNG0 = 87.4;
const LNG1 = 98.1;
const LAT0 = 21.7;
const LAT1 = 30.0;

function project(lng: number, lat: number) {
  const x = ((lng - LNG0) / (LNG1 - LNG0)) * W;
  const y = H - ((lat - LAT0) / (LAT1 - LAT0)) * H;
  return { x, y };
}

function smooth(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` Q ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${cx.toFixed(1)} ${((p0.y + p1.y) / 2).toFixed(1)}`;
    d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${cx.toFixed(1)} ${((p0.y + p1.y) / 2).toFixed(1)}`;
  }
  d += ` L ${points[points.length - 1].x.toFixed(1)} ${points[points.length - 1].y.toFixed(1)}`;
  return d;
}

export function RouteMap({
  points,
  route,
  variant = "full",
  onSelect,
  activeId,
  caption,
}: {
  points: MapPoint[];
  route?: { fromId: string; toId: string }[];
  variant?: "full" | "compact";
  onSelect?: (id: string) => void;
  activeId?: string;
  caption?: string;
}) {
  const [hover, setHover] = useState<MapPoint | null>(null);
  const positioned = useMemo(
    () => points.map((p) => ({ ...p, ...project(p.lng, p.lat) })),
    [points],
  );
  const byId = useMemo(() => new Map(positioned.map((p) => [p.id, p])), [positioned]);
  const path = useMemo(() => {
    if (!route?.length) return [];
    const segs: { d: string; color: string }[] = [];
    for (const r of route) {
      const a = byId.get(r.fromId);
      const b = byId.get(r.toId);
      if (!a || !b) continue;
      const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.16;
      const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.16;
      segs.push({
        d: `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`,
        color: STATE_META[b.state]?.color ?? "#E4572E",
      });
    }
    return segs;
  }, [route, byId]);

  const outline = useMemo(() => {
    const pts = OUTLINE.map(([lng, lat]) => project(lng, lat));
    return (
      pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z"
    );
  }, []);

  const stateAnchors = useMemo(() => {
    const groups = new Map<StateCode, { sumX: number; sumY: number; n: number }>();
    for (const p of positioned) {
      const g = groups.get(p.state) ?? { sumX: 0, sumY: 0, n: 0 };
      g.sumX += p.x;
      g.sumY += p.y;
      g.n += 1;
      groups.set(p.state, g);
    }
    return Array.from(groups.entries()).map(([st, g]) => ({
      st,
      x: g.sumX / g.n,
      y: g.sumY / g.n,
    }));
  }, [positioned]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl card-edge bg-ink-950">
      <div className="pointer-events-none absolute inset-0 mesh opacity-60" />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative block w-full"
        role="img"
        aria-label="Map of Northeast India"
      >
        <defs>
          <linearGradient id="landFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#123326" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#0d241b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1a2a33" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E4572E" />
            <stop offset="100%" stopColor="#F6C35C" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* graticule */}
        <g stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1">
          {Array.from({ length: 9 }, (_, i) => {
            const x = (i + 1) * (W / 10);
            return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={H} />;
          })}
          {Array.from({ length: 7 }, (_, i) => {
            const y = (i + 1) * (H / 8);
            return <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} />;
          })}
        </g>

        {/* neighbour labels */}
        {NEIGHBOURS.map((nb) => {
          const p = project(nb.lng, nb.lat);
          return (
            <text
              key={nb.label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              className="fill-mist-500"
              style={{ fontSize: nb.size, letterSpacing: "0.22em", opacity: 0.55, fontWeight: 600 }}
            >
              {nb.label}
            </text>
          );
        })}

        {/* landmass */}
        <path d={outline} fill="url(#landFill)" stroke="#43cf9c" strokeOpacity="0.5" strokeWidth="2.2" />
        <path d={outline} fill="none" stroke="#43cf9c" strokeOpacity="0.14" strokeWidth="9" />

        {/* ridge texture */}
        <g stroke="#ffffff" strokeOpacity="0.05" fill="none">
          {Array.from({ length: 26 }, (_, i) => {
            const pts = Array.from({ length: 6 }, (_, j) => ({
              x: 120 + i * 30 + j * 8,
              y: 150 + Math.sin(i * 0.7 + j * 0.5) * 60 + j * 40,
            }));
            return <path key={i} d={smooth(pts)} />;
          })}
        </g>

        {/* state names */}
        {variant === "full" &&
          stateAnchors.map(({ st, x, y }) => (
            <text
              key={st}
              x={x}
              y={y - 26}
              textAnchor="middle"
              style={{ fontSize: 13, letterSpacing: "0.18em", fontWeight: 700, opacity: 0.34 }}
              fill={STATE_META[st].color}
            >
              {st}
            </text>
          ))}

        {/* routes */}
        {path.map((s, i) => (
          <g key={i}>
            <path d={s.d} fill="none" stroke="url(#routeGrad)" strokeWidth="3.4" strokeLinecap="round" opacity="0.95" />
            <path
              d={s.d}
              fill="none"
              stroke="#fff"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray="7 13"
              opacity="0.55"
              style={{ animation: "dash 14s linear infinite" }}
            />
          </g>
        ))}

        {/* points */}
        {positioned.map((p) => {
          const active = activeId === p.id;
          const isRoute = route?.some((r) => r.fromId === p.id || r.toId === p.id);
          const color = STATE_META[p.state].color;
          const r = active ? 11 : p.order !== undefined ? 8.5 : isRoute ? 7 : 4.6;
          return (
            <g
              key={p.id}
              transform={`translate(${p.x} ${p.y})`}
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(p.id)}
              style={{ cursor: onSelect ? "pointer" : "default" }}
            >
              {(active || isRoute) && <circle r={r + 9} fill={color} opacity="0.16" />}
              <circle r={r} fill={active ? "#fff" : color} stroke="#060d0a" strokeWidth="2.2" />
              {p.gem && (
                <circle
                  r={r + 5.5}
                  fill="none"
                  stroke="#F6C35C"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                  opacity="0.8"
                />
              )}
              {p.order !== undefined && (
                <text
                  y="3.4"
                  textAnchor="middle"
                  style={{ fontSize: 9, fontWeight: 800, fill: "#08110d", pointerEvents: "none" }}
                >
                  {p.order}
                </text>
              )}
              {(variant === "full" || active) && (
                <text
                  x={r + 9}
                  y={3.6}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    fill: active ? "#fff" : "#dfeae1",
                    opacity: active ? 1 : 0.72,
                    pointerEvents: "none",
                  }}
                >
                  {p.name.length > 22 ? p.name.slice(0, 21) + "…" : p.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hover && (
        <div className="pointer-events-none absolute bottom-3 left-3 max-w-[70%] rounded-xl glass card-edge px-3.5 py-2.5">
          <p className="text-sm font-semibold text-mist-50">{hover.name}</p>
          <p className="text-[11px] uppercase tracking-wider" style={{ color: STATE_META[hover.state].color }}>
            {STATE_META[hover.state].name}
          </p>
          {hover.label && <p className="mt-1 text-xs text-mist-300">{hover.label}</p>}
        </div>
      )}

      {caption && (
        <div className="absolute right-3 top-3 rounded-lg glass card-edge px-3 py-1.5 text-[11px] font-medium tracking-wide text-mist-300">
          {caption}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/5 px-4 py-3 text-[11px] text-mist-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rust-500" /> Route stop
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-mist-400" /> Other destination
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-dashed border-gold-400" /> Hidden gem
        </span>
        <span className="ml-auto hidden sm:inline">Not to scale · indicative geometry</span>
      </div>
    </div>
  );
}
