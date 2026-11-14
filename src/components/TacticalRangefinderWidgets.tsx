import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Compass,
  Crosshair,
  Map as MapIcon,
  Maximize2,
  RotateCw,
  Trash2,
  Wind
} from 'lucide-react';
import {
  CaddieScenario,
  DiscItem,
  HoleData,
  PlayerRosterItem
} from '../data/initialData';
import { computeFlightPathSvg, HoleVisualOutlineSpec } from '../utils/analytics';

/**
 * 1. 4-PILL TACTICAL FLIGHT READOUT BAR [SPD | GLD | TRN | FAD]
 */
interface FlightReadoutBarProps {
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  compact?: boolean;
}

export const FlightReadoutBar: React.FC<FlightReadoutBarProps> = ({
  speed,
  glide,
  turn,
  fade,
  compact = false
}) => {
  const pills = [
    {
      label: 'SPD',
      value: speed,
      accent: 'border-[#CCFF00]/45 bg-[#090D0B]/90 text-[#CCFF00]'
    },
    {
      label: 'GLD',
      value: glide,
      accent: 'border-emerald-400/40 bg-[#090D0B]/90 text-emerald-300'
    },
    {
      label: 'TRN',
      value: turn > 0 ? `+${turn}` : `${turn}`,
      accent: 'border-[#FF5722]/50 bg-[#090D0B]/90 text-[#FF5722]'
    },
    {
      label: 'FAD',
      value: fade,
      accent: 'border-amber-400/45 bg-[#090D0B]/90 text-amber-300'
    }
  ];

  return (
    <div
      className={`grid grid-cols-4 font-mono-tabular ${
        compact ? 'gap-1' : 'gap-1.5'
      }`}
      aria-label={`Flight Numbers: Speed ${speed}, Glide ${glide}, Turn ${turn}, Fade ${fade}`}
    >
      {pills.map((item) => (
        <div
          key={item.label}
          className={`rounded-lg border border-t-white/15 flex flex-col items-center justify-center shadow-inner ${
            compact ? 'px-1 py-0.5' : 'px-2 py-1'
          } ${item.accent}`}
        >
          <span
            className={`${
              compact ? 'text-[8px]' : 'text-[9px]'
            } font-bold tracking-widest uppercase opacity-75 leading-none`}
          >
            {item.label}
          </span>
          <span
            className={`${
              compact ? 'text-[11px]' : 'text-xs sm:text-sm'
            } font-extrabold tabular-nums leading-tight mt-0.5`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * 2. TACTILE CIRCULAR DISC TOKEN WITH RADIAL PLASTIC SHEEN & RIM-WIDTH RINGS
 */
interface TactileDiscTokenProps {
  disc: DiscItem;
  isSelected?: boolean;
  isVerifiedPick?: boolean;
  slotBadge?: string;
  onSelect?: (disc: DiscItem) => void;
  onHover?: (disc: DiscItem) => void;
  onFlipCard?: (discId: string, e: React.MouseEvent) => void;
  onEnlargeCard?: (disc: DiscItem, e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const TactileDiscToken: React.FC<TactileDiscTokenProps> = ({
  disc,
  isSelected = false,
  isVerifiedPick = false,
  slotBadge,
  onSelect,
  onHover,
  onFlipCard,
  onEnlargeCard,
  size = 'md'
}) => {
  // Rim thickness scales realistically with disc Speed (2-14)
  const rimWidthPct = Math.min(24, Math.max(9, Math.round(disc.speed * 1.85)));
  const stampColor = disc.stampHex || '#CCFF00';
  const discDiameterClass =
    size === 'sm'
      ? 'w-16 h-16'
      : size === 'lg'
      ? 'w-28 h-28 sm:w-32 sm:h-32'
      : 'w-20 h-20 sm:w-24 sm:h-24';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(disc)}
      onMouseEnter={() => onHover?.(disc)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(disc);
        }
      }}
      className={`group relative rounded-2xl p-3 backdrop-blur-xl bg-[#111915]/85 border-t border-x border-b transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer select-none flex flex-col justify-between gap-2.5 ${
        isSelected
          ? 'border-t-[#CCFF00] border-x-[#CCFF00]/50 border-b-[#CCFF00]/80 shadow-[0_12px_30px_-6px_rgba(204,255,0,0.28)] ring-1 ring-[#CCFF00]/50'
          : isVerifiedPick
          ? 'border-t-[#FF5722] border-x-[#FF5722]/40 border-b-black/90 shadow-[0_10px_26px_-6px_rgba(255,87,34,0.25)]'
          : 'border-t-white/15 border-x-white/5 border-b-black/80 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.85)] hover:border-t-[#CCFF00]/60'
      }`}
    >
      {/* Top Tactical Header Row */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="font-mono-tabular text-[10px] font-bold uppercase tracking-wider text-emerald-300/90 truncate">
          {slotBadge || disc.cardNumber || disc.type}
        </span>
        {disc.weightGrams && (
          <span className="px-1.5 py-0.5 rounded bg-[#090D0B] border border-white/10 font-mono-tabular text-[10px] font-extrabold text-[#CCFF00] shrink-0">
            {disc.weightGrams}G
          </span>
        )}
      </div>

      {/* Circular Tactile Disc Token with Radial Plastic Sheen & Rim-Width Ring */}
      <div className="relative flex items-center justify-center py-1">
        <div
          className={`${discDiameterClass} rounded-full relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
          style={{
            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.52) 0%, ${disc.colorHex} 34%, ${disc.colorHex}CC 72%, #050807 100%)`,
            boxShadow: `0 12px 24px -6px rgba(0,0,0,0.85), 0 0 18px -4px ${disc.colorHex}66, inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -4px 8px rgba(0,0,0,0.65)`
          }}
        >
          {/* Outer Mold Rim-Width Ring (Proportional to Speed) */}
          <div
            className="rounded-full pointer-events-none flex items-center justify-center"
            style={{
              width: `${100 - rimWidthPct}%`,
              height: `${100 - rimWidthPct}%`,
              border: '1.5px solid rgba(255,255,255,0.28)',
              boxShadow:
                'inset 0 2px 6px rgba(0,0,0,0.45), 0 1px 2px rgba(255,255,255,0.25)',
              background: `radial-gradient(circle at 38% 35%, rgba(255,255,255,0.22) 0%, transparent 65%)`
            }}
          >
            {/* Inner Foil Stamp Ring */}
            <div
              className="w-[74%] h-[74%] rounded-full flex flex-col items-center justify-center text-center px-1"
              style={{
                border: `1.5px dashed ${stampColor}`,
                background: 'rgba(9, 13, 11, 0.58)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <span className="font-mono-tabular text-[8px] font-extrabold uppercase tracking-tighter text-white/80 leading-none truncate max-w-full">
                {disc.brand}
              </span>
              <span
                className="font-display text-[10px] sm:text-[11px] font-bold uppercase tracking-tight leading-tight truncate max-w-full mt-0.5"
                style={{ color: stampColor }}
              >
                {disc.name}
              </span>
              <span className="font-mono-tabular text-[8px] font-bold text-white/90 leading-none mt-0.5">
                {disc.plastic.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {isVerifiedPick && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded bg-[#FF5722] text-white font-mono-tabular text-[9px] font-extrabold uppercase tracking-wider shadow-md">
            ★ LOCK
          </span>
        )}
      </div>

      {/* Disc Name & Plastic Subheader */}
      <div className="text-center min-w-0">
        <div className="font-display text-xs sm:text-sm font-bold uppercase tracking-tight text-white truncate">
          {disc.name}
        </div>
        <div className="font-mono-tabular text-[10px] text-slate-400 truncate">
          {disc.plastic} · {disc.idealMinFeet}–{disc.idealMaxFeet}FT
        </div>
      </div>

      {/* 4-Pill Tactical Flight Readout Bar [SPD | GLD | TRN | FAD] */}
      <FlightReadoutBar
        speed={disc.speed}
        glide={disc.glide}
        turn={disc.turn}
        fade={disc.fade}
        compact
      />

      {/* Optional Quick Card Actions */}
      {(onFlipCard || onEnlargeCard) && (
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
          {onFlipCard && (
            <button
              type="button"
              onClick={(e) => onFlipCard(disc.id, e)}
              className="flex-1 py-1 px-1.5 rounded-lg bg-white/5 hover:bg-[#CCFF00]/20 border border-white/10 hover:border-[#CCFF00]/50 font-mono-tabular text-[10px] font-bold text-[#CCFF00] flex items-center justify-center gap-1 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <RotateCw className="w-2.5 h-2.5" />
              <span>CARD</span>
            </button>
          )}
          {onEnlargeCard && (
            <button
              type="button"
              onClick={(e) => onEnlargeCard(disc, e)}
              className="flex-1 py-1 px-1.5 rounded-lg bg-[#FF5722]/15 hover:bg-[#FF5722]/30 border border-[#FF5722]/40 font-mono-tabular text-[10px] font-bold text-[#FF5722] flex items-center justify-center gap-1 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>HUD</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 3. INTERACTIVE PRO TOUR RANGEFINDER SVG FLIGHT HUD
 *    Renders a smooth animated SVG Bezier curve over a tactical yardage grid
 *    whenever a disc is selected or hovered.
 */
interface LiveRangefinderFlightHudProps {
  disc: DiscItem;
  wind: CaddieScenario;
  onChangeWind?: (w: CaddieScenario) => void;
  release: 'flat' | 'hyzer' | 'anhyzer';
  onChangeRelease?: (r: 'flat' | 'hyzer' | 'anhyzer') => void;
  targetDistanceFeet?: number;
  holeNumber?: number;
  caddieCallout?: string;
  onOpenCardModal?: (disc: DiscItem) => void;
}

export const LiveRangefinderFlightHud: React.FC<LiveRangefinderFlightHudProps> = ({
  disc,
  wind,
  onChangeWind,
  release,
  onChangeRelease,
  targetDistanceFeet,
  holeNumber,
  caddieCallout,
  onOpenCardModal
}) => {
  const svgFlight = computeFlightPathSvg(disc, wind, release);

  // Determine tactical shot shape classification from Turn/Fade & release
  const netStability = disc.turn + disc.fade;
  const shotShapeLabel =
    release === 'hyzer' || netStability >= 2
      ? 'HYZER / HARD FADE'
      : release === 'anhyzer' || disc.turn <= -3
      ? 'HIGH-SPEED TURNOVER'
      : disc.turn <= -1 && disc.fade >= 1.5
      ? 'PRO TOUR S-CURVE FLEX'
      : 'LASER POINT-AND-SHOOT';

  return (
    <div className="neon-card rounded-2xl p-4 sm:p-5 border-t border-white/15 border-x border-white/5 border-b border-black/80 space-y-4">
      {/* Top Rangefinder Telemetry Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/50 flex items-center justify-center shrink-0">
            <Crosshair className="w-5 h-5 text-[#CCFF00]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono-tabular text-[10px] font-extrabold uppercase tracking-widest text-[#FF5722]">
                LIVE RANGEFINDER TELEMETRY
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#CCFF00]/15 border border-[#CCFF00]/40 font-mono-tabular text-[10px] font-extrabold text-[#CCFF00]">
                {shotShapeLabel}
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white truncate">
              {disc.weightGrams ? `${disc.weightGrams}G ` : ''}
              {disc.plastic} {disc.name}
            </h3>
          </div>
        </div>

        <div className="w-full sm:w-64 shrink-0">
          <FlightReadoutBar
            speed={disc.speed}
            glide={disc.glide}
            turn={disc.turn}
            fade={disc.fade}
          />
        </div>
      </div>

      {/* Main 2-Column Rangefinder Radar & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left 7 Cols: Animated SVG Bezier Flight Path Over Tactical Yardage Grid */}
        <div className="rangefinder-keep-dark lg:col-span-7 relative rounded-2xl bg-[#060A08] border border-emerald-500/25 p-3 overflow-hidden shadow-inner">
          {/* Top Radar Readouts */}
          <div className="flex items-center justify-between text-[11px] font-mono-tabular mb-1 px-1">
            <span className="text-amber-400 font-bold">
              ← FADE ({disc.fade})
            </span>
            <span className="text-[#CCFF00] font-extrabold">
              CARRY EST: {svgFlight.estimatedFeet} FT
              {targetDistanceFeet ? ` // PIN: ${targetDistanceFeet} FT` : ''}
            </span>
            <span className="text-[#FF5722] font-bold">
              TURN ({disc.turn}) →
            </span>
          </div>

          <svg
            key={`${disc.id}-${wind}-${release}`}
            viewBox="0 0 260 315"
            className="w-full h-[220px] sm:h-[245px] overflow-visible"
            aria-label={`Animated Flight Path for ${disc.name}`}
          >
            <defs>
              <radialGradient id="rangefinderGlow" cx="50%" cy="85%" r="75%">
                <stop offset="0%" stopColor="#10261C" stopOpacity="0.85" />
                <stop offset="65%" stopColor="#090D0B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#060A08" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="flightCurveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#CCFF00" />
                <stop offset="55%" stopColor={disc.colorHex || '#CCFF00'} />
                <stop offset="100%" stopColor="#FF5722" />
              </linearGradient>
            </defs>

            {/* Radar Cone Background */}
            <rect x="0" y="0" width="260" height="315" fill="url(#rangefinderGlow)" rx="12" />

            {/* Concentric Rangefinder Yardage Arcs & Grid Lines */}
            {[
              { ft: 350, y: 40 },
              { ft: 275, y: 100 },
              { ft: 200, y: 160 },
              { ft: 125, y: 220 }
            ].map((row) => (
              <g key={row.ft}>
                <line
                  x1={18}
                  y1={row.y}
                  x2={242}
                  y2={row.y}
                  stroke="#10261C"
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                />
                <text
                  x={22}
                  y={row.y - 4}
                  fill="#34D399"
                  opacity="0.75"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {row.ft}FT
                </text>
              </g>
            ))}

            {/* Target Hole Pin Line if active hole distance is provided */}
            {targetDistanceFeet && targetDistanceFeet > 0 && (
              <g>
                {(() => {
                  const pinY = Math.max(
                    32,
                    Math.min(265, Math.round(292 - (targetDistanceFeet / 380) * 245))
                  );
                  return (
                    <>
                      <line
                        x1={25}
                        y1={pinY}
                        x2={235}
                        y2={pinY}
                        stroke="#FF5722"
                        strokeWidth={1.2}
                        strokeDasharray="6 4"
                      />
                      <text
                        x={234}
                        y={pinY - 4}
                        textAnchor="end"
                        fill="#FF5722"
                        fontSize="9.5"
                        fontWeight="800"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {holeNumber ? `H#${holeNumber} PIN (${targetDistanceFeet}FT)` : `PIN ${targetDistanceFeet}FT`}
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Center Rangefinder Aiming Reticle Axis */}
            <line
              x1={130}
              y1={20}
              x2={130}
              y2={295}
              stroke="#CCFF00"
              strokeOpacity="0.28"
              strokeDasharray="4 4"
              strokeWidth={1.2}
            />

            {/* Ghost Baseline Shadow Path */}
            <path
              d={svgFlight.pathD}
              fill="none"
              stroke={disc.colorHex || '#CCFF00'}
              strokeOpacity="0.22"
              strokeWidth={9}
              strokeLinecap="round"
            />

            {/* Smooth Animated SVG Bezier Flight Curve */}
            <path
              d={svgFlight.pathD}
              fill="none"
              stroke="url(#flightCurveGrad)"
              strokeWidth={4.5}
              strokeLinecap="round"
              className="flight-bezier-animated"
              style={{
                filter: `drop-shadow(0 0 8px ${disc.colorHex || '#CCFF00'})`
              }}
            />

            {/* Tee Pad Launch Box */}
            <rect
              x={114}
              y={290}
              width={32}
              height={7}
              rx={2}
              fill="#CCFF00"
            />
            <text
              x={130}
              y={309}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              TEE PAD // RHBH
            </text>

            {/* Landing Target Reticle */}
            <circle
              cx={svgFlight.endX}
              cy={svgFlight.endY}
              r={11}
              fill="none"
              stroke="#CCFF00"
              strokeOpacity="0.55"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
            <circle
              cx={svgFlight.endX}
              cy={svgFlight.endY}
              r={6}
              fill={disc.colorHex || '#CCFF00'}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            <text
              x={svgFlight.endX + 14}
              y={svgFlight.endY + 4}
              fill="#CCFF00"
              fontSize="10.5"
              fontWeight="800"
              fontFamily="JetBrains Mono, monospace"
            >
              {svgFlight.estimatedFeet}FT
            </text>
          </svg>
        </div>

        {/* Right 5 Cols: Release Angle, Wind Vector & Tactical Shot Readout */}
        <div className="lg:col-span-5 space-y-3">
          {onChangeWind && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono-tabular uppercase text-slate-400">
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-[#CCFF00]" />
                  <span>WIND VECTOR</span>
                </span>
                <span className="text-[#CCFF00] font-bold">{wind.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-[#090D0B] border border-white/10">
                {(
                  [
                    { id: 'calm', label: 'Calm' },
                    { id: 'headwind', label: 'Head' },
                    { id: 'tailwind', label: 'Tail' },
                    { id: 'cross_lr', label: 'L→R' },
                    { id: 'cross_rl', label: 'R→L' }
                  ] as const
                ).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => onChangeWind(w.id)}
                    className={`py-1.5 px-1 rounded-lg font-mono-tabular text-[10px] font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                      wind === w.id
                        ? 'bg-[#CCFF00] text-[#090D0B] font-extrabold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {onChangeRelease && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono-tabular uppercase text-slate-400">
                <span>RELEASE ANGLE</span>
                <span className="text-[#FF5722] font-bold">{release.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#090D0B] border border-white/10">
                {(
                  [
                    { id: 'hyzer', label: 'Hyzer' },
                    { id: 'flat', label: 'Flat' },
                    { id: 'anhyzer', label: 'Anhyzer' }
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onChangeRelease(r.id)}
                    className={`py-1.5 px-2 rounded-lg font-mono-tabular text-[10px] font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                      release === r.id
                        ? 'bg-[#FF5722] text-white font-extrabold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tactical Caddie Brief Box */}
          <div className="p-3 rounded-xl bg-[#090D0B]/90 border-t border-white/15 border-x border-white/5 border-b border-black/80 space-y-1.5">
            <div className="flex items-center justify-between font-mono-tabular text-[10px]">
              <span className="font-extrabold uppercase tracking-wider text-[#CCFF00]">
                RANGEFINDER CADDIE BRIEF
              </span>
              <span className="text-slate-400">
                OPT: {disc.idealMinFeet}–{disc.idealMaxFeet}FT
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {caddieCallout || disc.courseStrategy || disc.moldAndFlight}
            </p>
          </div>

          {onOpenCardModal && (
            <button
              type="button"
              onClick={() => onOpenCardModal(disc)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-display text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Open Full Collector Card &amp; Logs</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 4. BROADCAST SCORECARD & TELEMETRY HORIZONTAL TICKER
 *    Color-coded stroke badges:
 *    - Birdie = glowing lime/volt pill
 *    - Par = muted slate pill
 *    - Bogey = amber warning pill
 */
interface BroadcastScorecardTickerProps {
  courseName: string;
  date: string;
  holes: HoleData[];
  currentHoleIndex: number;
  activePlayers: PlayerRosterItem[];
  onSelectHole: (index: number) => void;
}

export const BroadcastScorecardTicker: React.FC<BroadcastScorecardTickerProps> = ({
  courseName,
  date,
  holes,
  currentHoleIndex,
  activePlayers,
  onSelectHole
}) => {
  const getStrokeBadgeClass = (score: number, par: number) => {
    if (!score || score <= 0) {
      return 'bg-slate-100 text-slate-500 border border-slate-300';
    }
    const diff = score - par;
    if (diff < 0) {
      // Birdie / Eagle = High-Contrast Emerald / Lime Pill
      return 'bg-emerald-600 text-white border border-emerald-700 shadow-xs font-extrabold';
    }
    if (diff === 0) {
      // Par = Clean Slate Pill
      return 'bg-sky-100 text-sky-900 border border-sky-300 font-bold';
    }
    // Bogey+ = Amber Warning Pill
    return 'bg-amber-500 text-slate-950 border border-amber-600 font-extrabold';
  };

  return (
    <div className="neon-card rounded-2xl p-3.5 sm:p-4 border border-slate-300 space-y-3">
      {/* Broadcast Ticker Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF5722] text-white font-mono-tabular text-[10px] font-extrabold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>SCORECARD TICKER</span>
          </span>
          <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
            {courseName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono-tabular">
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            BIRDIE
          </span>
          <span className="inline-flex items-center gap-1 text-sky-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-sky-600" />
            PAR
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            BOGEY
          </span>
          <span className="text-slate-600 hidden sm:inline">DATE: {date}</span>
        </div>
      </div>

      {/* Horizontal Scrollable Broadcast Hole Ticker */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1 pt-0.5">
        {holes.map((h, idx) => {
          const isCurrent = idx === currentHoleIndex;
          return (
            <button
              key={h.number}
              type="button"
              onClick={() => onSelectHole(idx)}
              className={`min-w-[74px] sm:min-w-[82px] flex-1 rounded-xl p-2 flex flex-col justify-between gap-1.5 font-mono-tabular transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                isCurrent
                  ? 'bg-amber-50 border-2 border-[#FF5722] shadow-sm'
                  : 'bg-slate-50 border border-slate-300 hover:border-slate-500'
              }`}
            >
              {/* Hole Number & Yardage */}
              <div className="w-full flex items-center justify-between text-[10px]">
                <span
                  className={`font-display font-bold uppercase tracking-tight ${
                    isCurrent ? 'text-[#FF5722] text-xs' : 'text-slate-900'
                  }`}
                >
                  H{h.number}
                </span>
                <span className="text-slate-600 tabular-nums">{h.distance}&apos;</span>
              </div>

              {/* Player Color-Coded Stroke Pills */}
              <div className="w-full flex items-center justify-center gap-1">
                {activePlayers.map((p) => {
                  const sc = h.scores[p.id] || 0;
                  return (
                    <span
                      key={p.id}
                      title={`${p.name}: ${sc > 0 ? sc : 'Unscored'} (Par ${h.par})`}
                      className={`flex-1 min-w-[26px] py-0.5 px-1.5 rounded-full text-[11px] tabular-nums text-center leading-tight ${getStrokeBadgeClass(
                        sc,
                        h.par
                      )}`}
                    >
                      {sc > 0 ? sc : '·'}
                    </span>
                  );
                })}
              </div>

              {/* Par Footer */}
              <div className="w-full text-center text-[9px] text-slate-600 uppercase tracking-wider">
                PAR {h.par}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 5. UDISC-STYLE BASIC HOLE LAYOUT & FAIRWAY OUTLINE TEE SIGN
 *    Top-down SVG tee-to-pin fairway corridor showing shape, elevation, trees/openness,
 *    guardian trees, water/OB hazards, and ideal flight line right on the Live Scorecard.
 */
interface HoleLayoutOutlineWidgetProps {
  courseKey?: string;
  holeNumber: number;
  par: number;
  distanceFeet: number;
  spec: HoleVisualOutlineSpec;
}

export const HoleLayoutOutlineWidget: React.FC<HoleLayoutOutlineWidgetProps> = ({
  courseKey,
  holeNumber,
  par,
  distanceFeet,
  spec
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showSatelliteMap, setShowSatelliteMap] = useState(false);
  const [zoomSatellite, setZoomSatellite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const safeCourseId = (courseKey || 'course')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
  const holeImgStorageKey = `jj_dg_hole_map_v1_${safeCourseId}_${holeNumber}`;

  const [customHoleImg, setCustomHoleImg] = useState<string | null>(() => {
    try {
      return localStorage.getItem(holeImgStorageKey);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(holeImgStorageKey);
      setCustomHoleImg(saved);
      if (saved) {
        setShowSatelliteMap(true);
      } else {
        setShowSatelliteMap(false);
      }
    } catch {
      setCustomHoleImg(null);
    }
    setZoomSatellite(false);
  }, [holeImgStorageKey]);

  const handleUploadHoleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!rawDataUrl) return;
      const img = new Image();
      img.onload = () => {
        const maxDim = 960;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          try {
            localStorage.setItem(holeImgStorageKey, compressed);
          } catch {
            // Ignore storage quota warning
          }
          setCustomHoleImg(compressed);
          setShowSatelliteMap(true);
          setExpanded(true);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearCustomHoleImage = () => {
    try {
      localStorage.removeItem(holeImgStorageKey);
    } catch {
      // Ignore
    }
    setCustomHoleImg(null);
    if (!spec.udiscMapUrl) {
      setShowSatelliteMap(false);
    }
  };

  const activeMapUrl = customHoleImg || spec.udiscMapUrl || null;

  // Compute Top-Down Tee (bottom) -> Basket (top) geometry inside 180 x 200 viewBox
  const geometry = (() => {
    switch (spec.shape) {
      case 'tunnel':
        return {
          tx: 90,
          ty: 176,
          px: 90,
          py: 36,
          fairwayPath: 'M 90 176 L 90 36',
          flightPath: 'M 90 176 C 92 128, 92 80, 90 36',
          guardianPos: { x: 80, y: 88 }
        };
      case 'slight_left':
        return {
          tx: 100,
          ty: 176,
          px: 68,
          py: 36,
          fairwayPath: 'M 100 176 C 104 122, 90 74, 68 36',
          flightPath: 'M 100 176 C 110 118, 94 68, 68 36',
          guardianPos: { x: 80, y: 76 }
        };
      case 'dogleg_left':
        return {
          tx: 112,
          ty: 176,
          px: 48,
          py: 40,
          fairwayPath: 'M 112 176 C 116 108, 94 64, 48 40',
          flightPath: 'M 112 176 C 120 104, 96 58, 48 40',
          guardianPos: { x: 76, y: 68 }
        };
      case 'slight_right':
        return {
          tx: 80,
          ty: 176,
          px: 112,
          py: 36,
          fairwayPath: 'M 80 176 C 76 122, 90 74, 112 36',
          flightPath: 'M 80 176 C 74 124, 96 72, 112 36',
          guardianPos: { x: 98, y: 76 }
        };
      case 'dogleg_right':
        return {
          tx: 68,
          ty: 176,
          px: 132,
          py: 40,
          fairwayPath: 'M 68 176 C 64 108, 86 64, 132 40',
          flightPath: 'M 68 176 C 62 110, 84 58, 132 40',
          guardianPos: { x: 104, y: 68 }
        };
      case 's_curve':
        return {
          tx: 86,
          ty: 176,
          px: 86,
          py: 36,
          fairwayPath: 'M 86 176 C 124 126, 56 80, 86 36',
          flightPath: 'M 86 176 C 128 126, 54 78, 86 36',
          guardianPos: { x: 74, y: 92 }
        };
      case 'straight':
      default:
        return {
          tx: 90,
          ty: 176,
          px: 90,
          py: 36,
          fairwayPath: 'M 90 176 C 90 130, 90 82, 90 36',
          flightPath: 'M 90 176 C 98 126, 96 76, 90 36',
          guardianPos: { x: 78, y: 80 }
        };
    }
  })();

  const outerFairwayWidth =
    spec.shape === 'tunnel'
      ? 26
      : spec.corridor === 'open'
      ? 52
      : spec.corridor === 'tight_woods'
      ? 32
      : 40;
  const innerFairwayWidth = Math.max(14, Math.round(outerFairwayWidth * 0.62));

  // Decorative rough tree canopies scaled by corridor density & UDisc left/right woods side
  const treeCanopies: Array<{ x: number; y: number; r: number }> = (() => {
    if (spec.treesSide === 'none') {
      return [
        { x: 18, y: 46, r: 9 },
        { x: 162, y: 156, r: 9 }
      ];
    }
    if (spec.treesSide === 'left') {
      return [
        { x: 20, y: 28, r: 13 },
        { x: 36, y: 40, r: 11 },
        { x: 18, y: 58, r: 14 },
        { x: 38, y: 74, r: 11 },
        { x: 20, y: 92, r: 14 },
        { x: 38, y: 110, r: 11 },
        { x: 18, y: 128, r: 14 },
        { x: 38, y: 144, r: 11 },
        { x: 22, y: 160, r: 13 }
      ];
    }
    if (spec.treesSide === 'right') {
      return [
        { x: 160, y: 28, r: 13 },
        { x: 144, y: 40, r: 11 },
        { x: 162, y: 58, r: 14 },
        { x: 142, y: 74, r: 11 },
        { x: 160, y: 92, r: 14 },
        { x: 142, y: 110, r: 11 },
        { x: 162, y: 128, r: 14 },
        { x: 142, y: 144, r: 11 },
        { x: 158, y: 160, r: 13 }
      ];
    }
    if (spec.corridor === 'tight_woods') {
      return [
        { x: 20, y: 34, r: 12 },
        { x: 18, y: 62, r: 13 },
        { x: 24, y: 92, r: 12 },
        { x: 18, y: 122, r: 14 },
        { x: 24, y: 152, r: 12 },
        { x: 40, y: 112, r: 10 },
        { x: 42, y: 144, r: 10 },
        { x: 160, y: 34, r: 12 },
        { x: 162, y: 64, r: 13 },
        { x: 156, y: 94, r: 12 },
        { x: 162, y: 124, r: 14 },
        { x: 156, y: 154, r: 12 },
        { x: 140, y: 112, r: 10 },
        { x: 138, y: 144, r: 10 }
      ];
    }
    if (spec.corridor === 'park') {
      return [
        { x: 22, y: 48, r: 12 },
        { x: 20, y: 104, r: 13 },
        { x: 26, y: 154, r: 11 },
        { x: 158, y: 52, r: 12 },
        { x: 160, y: 110, r: 13 },
        { x: 154, y: 156, r: 11 }
      ];
    }
    return [
      { x: 18, y: 46, r: 10 },
      { x: 162, y: 152, r: 10 }
    ];
  })();

  const elevShortBadge =
    spec.elevation === 'uphill'
      ? { text: 'UP ↑', color: '#FACC15' }
      : spec.elevation === 'downhill'
      ? { text: 'DN ↓', color: '#38BDF8' }
      : { text: 'FLAT', color: '#94A3B8' };

  return (
    <div className="rangefinder-keep-dark rounded-2xl border border-emerald-500/35 bg-[#07110D] p-3 sm:p-3.5 space-y-2.5">
      {/* Compact Header Strip with Instant Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono-tabular font-extrabold uppercase tracking-wider text-[#39FF14]">
            <Compass className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Hole #{holeNumber} Layout Outline</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-mono-tabular font-bold text-emerald-200">
            {spec.shapeLabel}
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[11px] font-mono-tabular font-bold text-slate-200">
            {spec.corridorLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadHoleImage}
            className="hidden"
          />

          {activeMapUrl && (
            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                setShowSatelliteMap((prev) => !prev);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono-tabular font-bold flex items-center gap-1 transition-colors ${
                showSatelliteMap
                  ? 'bg-[#00F0FF] text-slate-950 border-[#00F0FF]'
                  : 'bg-[#0D1B14] hover:bg-emerald-950 border-[#00F0FF]/40 text-[#00F0FF]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>
                {showSatelliteMap
                  ? 'Tee Diagram'
                  : customHoleImg
                  ? 'My Hole Pic'
                  : 'UDisc Map'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload a UDisc screenshot or tee-sign photo for this hole"
            className="px-2.5 py-1 rounded-lg bg-[#0D1B14] hover:bg-emerald-950 border border-emerald-500/35 text-[11px] font-mono-tabular font-bold text-emerald-200 flex items-center gap-1 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>{customHoleImg ? 'Change Pic' : 'UDisc Pic'}</span>
          </button>

          {customHoleImg && (
            <button
              type="button"
              onClick={handleClearCustomHoleImage}
              title="Remove custom hole photo"
              className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="px-2.5 py-1 rounded-lg bg-[#0D1B14] hover:bg-emerald-950 border border-emerald-500/30 text-[11px] font-mono-tabular font-bold text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>{expanded ? 'Hide' : 'Show'}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {expanded && showSatelliteMap && activeMapUrl && (
        <div className="space-y-2 pt-0.5">
          <div className="relative rounded-xl overflow-hidden border border-[#00F0FF]/40 bg-[#040B08]">
            <img
              src={activeMapUrl}
              alt={`Hole ${holeNumber} UDisc satellite map`}
              onClick={() => setZoomSatellite((z) => !z)}
              className={`w-full object-contain bg-black cursor-pointer transition-all ${
                zoomSatellite ? 'max-h-[540px]' : 'max-h-[260px] sm:max-h-[320px]'
              }`}
            />
            <button
              type="button"
              onClick={() => setZoomSatellite((z) => !z)}
              className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-[#00F0FF]/50 text-[11px] font-mono-tabular font-bold text-[#00F0FF] flex items-center gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              <span>{zoomSatellite ? 'Compact Size' : 'Tap to Enlarge'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B1712] border border-emerald-500/20 space-y-1">
            <div className="text-xs font-bold text-white leading-snug">{spec.pinNote}</div>
            <div className="text-xs text-emerald-300/95 leading-snug">
              <span className="font-mono-tabular font-extrabold text-[#00F0FF] uppercase mr-1">
                Line:
              </span>
              {spec.flightLineTip}
            </div>
          </div>
        </div>
      )}

      {expanded && !(showSatelliteMap && activeMapUrl) && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-0.5">
          {/* LEFT: Top-Down Tee-Sign Fairway SVG */}
          <div className="sm:col-span-5 flex justify-center">
            <div className="w-full max-w-[210px] sm:max-w-none rounded-xl border border-emerald-500/30 bg-[#040B08] p-1.5 shadow-inner">
              <svg
                viewBox="0 0 180 200"
                className="w-full h-[148px] sm:h-[162px] block select-none"
                role="img"
                aria-label={`Hole ${holeNumber} top-down fairway layout: ${spec.shapeLabel}, ${spec.elevationLabel}, ${spec.corridorLabel}`}
              >
                <defs>
                  <linearGradient id={`turfBg-${holeNumber}`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#06150E" />
                    <stop offset="100%" stopColor="#0A2217" />
                  </linearGradient>
                  <linearGradient id={`fairwayCut-${holeNumber}`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#14532D" />
                    <stop offset="100%" stopColor="#15803D" />
                  </linearGradient>
                </defs>

                {/* Base Rough Turf */}
                <rect
                  x="0"
                  y="0"
                  width="180"
                  height="200"
                  rx="10"
                  fill={`url(#turfBg-${holeNumber})`}
                />

                {/* Subtle Yardage Distance Rings from Tee */}
                <line
                  x1="14"
                  y1="130"
                  x2="166"
                  y2="130"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 4"
                />
                <line
                  x1="14"
                  y1="82"
                  x2="166"
                  y2="82"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 4"
                />

                {/* Water Hazard Overlay (if present) */}
                {spec.waterHazard === 'left' && (
                  <g>
                    <ellipse
                      cx="18"
                      cy="102"
                      rx="14"
                      ry="36"
                      fill="#0284C7"
                      fillOpacity="0.45"
                      stroke="#38BDF8"
                      strokeWidth="1"
                    />
                    <text
                      x="18"
                      y="105"
                      textAnchor="middle"
                      fill="#BAE6FD"
                      fontSize="7"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      H2O
                    </text>
                  </g>
                )}
                {spec.waterHazard === 'right' && (
                  <g>
                    <ellipse
                      cx="162"
                      cy="108"
                      rx="14"
                      ry="36"
                      fill="#0284C7"
                      fillOpacity="0.45"
                      stroke="#38BDF8"
                      strokeWidth="1"
                    />
                    <text
                      x="162"
                      y="111"
                      textAnchor="middle"
                      fill="#BAE6FD"
                      fontSize="7"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      H2O
                    </text>
                  </g>
                )}
                {spec.waterHazard === 'behind' && (
                  <g>
                    <ellipse
                      cx={geometry.px}
                      cy="11"
                      rx="34"
                      ry="9"
                      fill="#0284C7"
                      fillOpacity="0.5"
                      stroke="#38BDF8"
                      strokeWidth="1"
                    />
                    <text
                      x={geometry.px}
                      y="14"
                      textAnchor="middle"
                      fill="#BAE6FD"
                      fontSize="7"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      WATER
                    </text>
                  </g>
                )}
                {spec.waterHazard === 'short' && (
                  <g>
                    <rect
                      x="24"
                      y="124"
                      width="132"
                      height="12"
                      rx="6"
                      fill="#0284C7"
                      fillOpacity="0.48"
                      stroke="#38BDF8"
                      strokeWidth="1"
                    />
                    <text
                      x="90"
                      y="133"
                      textAnchor="middle"
                      fill="#E0F2FE"
                      fontSize="7"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      CREEK
                    </text>
                  </g>
                )}

                {/* OB Boundary Line (if present) */}
                {spec.obHazard === 'left' && (
                  <g>
                    <line
                      x1="10"
                      y1="20"
                      x2="10"
                      y2="186"
                      stroke="#F87171"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <text
                      x="15"
                      y="182"
                      fill="#FCA5A5"
                      fontSize="7"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      OB
                    </text>
                  </g>
                )}
                {spec.obHazard === 'right' && (
                  <g>
                    <line
                      x1="170"
                      y1="20"
                      x2="170"
                      y2="186"
                      stroke="#F87171"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <text
                      x="154"
                      y="182"
                      fill="#FCA5A5"
                      fontSize="7"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      OB
                    </text>
                  </g>
                )}

                {/* Mowed Fairway Corridor (Outer Second Cut + Inner Center Cut) */}
                <path
                  d={geometry.fairwayPath}
                  fill="none"
                  stroke={`url(#fairwayCut-${holeNumber})`}
                  strokeWidth={outerFairwayWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.92"
                />
                <path
                  d={geometry.fairwayPath}
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth={innerFairwayWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.24"
                />

                {/* Open Grass Indicator when thick woods are strictly on one side */}
                {spec.treesSide === 'left' && (
                  <text
                    x="148"
                    y="104"
                    textAnchor="middle"
                    fill="#86EFAC"
                    fillOpacity="0.55"
                    fontSize="7"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    OPEN
                  </text>
                )}
                {spec.treesSide === 'right' && (
                  <text
                    x="32"
                    y="104"
                    textAnchor="middle"
                    fill="#86EFAC"
                    fillOpacity="0.55"
                    fontSize="7"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    OPEN
                  </text>
                )}

                {/* Paved Park Walking Trail (from UDisc satellite map) */}
                {spec.walkingPath === 'cross' && (
                  <g>
                    <path
                      d="M 8 124 Q 90 112 172 128"
                      fill="none"
                      stroke="#CBD5E1"
                      strokeWidth="4.5"
                      strokeOpacity="0.45"
                      strokeLinecap="round"
                    />
                    <text
                      x="148"
                      y="120"
                      textAnchor="middle"
                      fill="#E2E8F0"
                      fillOpacity="0.7"
                      fontSize="6.5"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      PATH
                    </text>
                  </g>
                )}
                {spec.walkingPath === 'left' && (
                  <path
                    d="M 22 186 Q 16 104 28 22"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="4"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                )}
                {spec.walkingPath === 'right' && (
                  <path
                    d="M 158 186 Q 164 104 152 22"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="4"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                )}

                {/* Rough Tree Canopies */}
                {treeCanopies
                  .filter((t) => {
                    // Keep trees clear of basket C1 & tee pad
                    const distPin = Math.hypot(t.x - geometry.px, t.y - geometry.py);
                    const distTee = Math.hypot(t.x - geometry.tx, t.y - geometry.ty);
                    return distPin > 26 && distTee > 24;
                  })
                  .map((t, idx) => (
                    <g key={idx}>
                      <circle
                        cx={t.x}
                        cy={t.y}
                        r={t.r}
                        fill="#064E3B"
                        fillOpacity="0.9"
                        stroke="#10B981"
                        strokeOpacity="0.35"
                        strokeWidth="1"
                      />
                      <circle
                        cx={t.x - 2.5}
                        cy={t.y - 2.5}
                        r={Math.max(2.5, t.r * 0.35)}
                        fill="#34D399"
                        fillOpacity="0.22"
                      />
                    </g>
                  ))}

                {/* Guardian Tree Pinch Marker */}
                {spec.hasGuardianTree && (
                  <g>
                    <circle
                      cx={geometry.guardianPos.x}
                      cy={geometry.guardianPos.y}
                      r="7.5"
                      fill="#065F46"
                      stroke="#FACC15"
                      strokeWidth="1.4"
                    />
                    <circle
                      cx={geometry.guardianPos.x}
                      cy={geometry.guardianPos.y}
                      r="2.2"
                      fill="#FACC15"
                    />
                  </g>
                )}

                {/* Basket Circle 1 (33 ft) Ring */}
                <circle
                  cx={geometry.px}
                  cy={geometry.py}
                  r="16"
                  fill="rgba(57, 255, 20, 0.10)"
                  stroke="#39FF14"
                  strokeWidth="1.2"
                  strokeDasharray="3 2.5"
                />

                {/* Ideal Flight Path Line (Tee -> Basket) */}
                <path
                  d={geometry.flightPath}
                  fill="none"
                  stroke="#00F0FF"
                  strokeWidth="2.4"
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                />

                {/* Basket Target Icon */}
                <circle
                  cx={geometry.px}
                  cy={geometry.py}
                  r="5.5"
                  fill="#FACC15"
                  stroke="#040B08"
                  strokeWidth="1.5"
                />
                <line
                  x1={geometry.px}
                  y1={geometry.py - 9}
                  x2={geometry.px}
                  y2={geometry.py}
                  stroke="#FFFFFF"
                  strokeWidth="1.4"
                />
                <polygon
                  points={`${geometry.px},${geometry.py - 10} ${geometry.px + 7},${
                    geometry.py - 7.5
                  } ${geometry.px},${geometry.py - 5}`}
                  fill="#FF2E93"
                />

                {/* Concrete Tee Pad at Bottom */}
                <rect
                  x={geometry.tx - 11}
                  y={geometry.ty - 4}
                  width="22"
                  height="9"
                  rx="2"
                  fill="#CBD5E1"
                  stroke="#0F172A"
                  strokeWidth="1.2"
                />
                <text
                  x={geometry.tx}
                  y="195"
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="7.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  TEE
                </text>

                {/* Top-Left Yardage & Par Stamp */}
                <rect
                  x="6"
                  y="6"
                  width="54"
                  height="16"
                  rx="4"
                  fill="rgba(4,11,8,0.82)"
                  stroke="rgba(0,240,255,0.35)"
                  strokeWidth="0.8"
                />
                <text
                  x="33"
                  y="16.5"
                  textAnchor="middle"
                  fill="#00F0FF"
                  fontSize="8.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {distanceFeet}&apos; P{par}
                </text>

                {/* Top-Right Elevation Stamp */}
                <rect
                  x="130"
                  y="6"
                  width="44"
                  height="16"
                  rx="4"
                  fill="rgba(4,11,8,0.82)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.8"
                />
                <text
                  x="152"
                  y="16.5"
                  textAnchor="middle"
                  fill={elevShortBadge.color}
                  fontSize="8"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {elevShortBadge.text}
                </text>
              </svg>
            </div>
          </div>

          {/* RIGHT: Quick Tee-Sign Readout (Terrain, Hazards & Suggested Flight Line) */}
          <div className="sm:col-span-7 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-tabular">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 font-bold">
                {spec.elevationLabel}
              </span>
              <span className="sm:hidden px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 font-bold">
                {spec.corridorLabel}
              </span>
              {spec.hasGuardianTree && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/50 text-amber-300 font-bold">
                  🌲 Guardian Tree
                </span>
              )}
              {spec.waterHazard && (
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/60 text-sky-200 font-bold">
                  💧 Water ({spec.waterHazard})
                </span>
              )}
              {spec.obHazard && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/60 text-rose-200 font-bold">
                  🚧 OB ({spec.obHazard})
                </span>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-[#0B1712] border border-emerald-500/20 space-y-1">
              <div className="text-xs font-bold text-white leading-snug">
                {spec.pinNote}
              </div>
              <div className="text-xs text-emerald-300/95 leading-snug">
                <span className="font-mono-tabular font-extrabold text-[#00F0FF] uppercase mr-1">
                  Line:
                </span>
                {spec.flightLineTip}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

