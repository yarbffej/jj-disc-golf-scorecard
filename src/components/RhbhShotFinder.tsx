import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Disc,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Wind,
  X
} from 'lucide-react';
import {
  CaddieScenario,
  DiscItem,
  getDiscCardImageUrl
} from '../data/initialData';
import {
  BagGroupingFilter,
  RhbhShotShape,
  RhbhTerrain,
  computeFlightPathSvg,
  filterBagByGrouping,
  parseRhbhShotQuery,
  recommendRhbhShotDiscs
} from '../utils/analytics';
import { playChainRattleSfx } from '../utils/soundFx';

interface RhbhShotFinderProps {
  bag: DiscItem[];
  initialDistanceFeet?: number;
  initialWind?: CaddieScenario;
  holeNumber?: number;
  holeDistanceFeet?: number;
  selectedDiscIdOnHole?: string;
  onSelectDiscForHole?: (disc: DiscItem) => void;
  onOpenDiscCard?: (discId: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

const SHAPE_OPTIONS: ReadonlyArray<{
  id: RhbhShotShape;
  shortLabel: string;
  subLabel: string;
  accentHex: string;
  svgPath: string;
  arrowPoints: string;
}> = [
  {
    id: 'hard_left',
    shortLabel: 'Hard Left',
    subLabel: 'Hyzer Hook',
    accentHex: '#FF2E93',
    svgPath: 'M 24 34 C 24 22, 22 14, 9 9',
    arrowPoints: '9,9 16,8 12,15'
  },
  {
    id: 'gentle_left',
    shortLabel: 'Soft Left',
    subLabel: 'Mild Fade',
    accentHex: '#FACC15',
    svgPath: 'M 21 34 C 21 22, 20 14, 14 7',
    arrowPoints: '14,7 20,9 14,13'
  },
  {
    id: 'straight',
    shortLabel: 'Straight',
    subLabel: 'Dead Laser',
    accentHex: '#39FF14',
    svgPath: 'M 18 34 L 18 7',
    arrowPoints: '18,6 14,13 22,13'
  },
  {
    id: 'gentle_right',
    shortLabel: 'Soft Right',
    subLabel: 'S-Drift',
    accentHex: '#00F0FF',
    svgPath: 'M 15 34 C 15 22, 17 14, 23 7',
    arrowPoints: '23,7 17,9 23,13'
  },
  {
    id: 'hard_right',
    shortLabel: 'Go Right',
    subLabel: 'RHBH Turn',
    accentHex: '#FF6B2C',
    svgPath: 'M 12 34 C 12 22, 15 14, 27 9',
    arrowPoints: '27,9 20,8 24,15'
  }
];

const QUICK_DISTANCES = [60, 100, 140, 175, 215, 260, 310, 360] as const;

const WIND_OPTIONS: ReadonlyArray<{ id: CaddieScenario; label: string }> = [
  { id: 'calm', label: 'Calm' },
  { id: 'headwind', label: 'Headwind' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'cross_lr', label: 'Crosswind' }
];

const TERRAIN_OPTIONS: ReadonlyArray<{ id: RhbhTerrain; label: string }> = [
  { id: 'open', label: 'Open' },
  { id: 'low_ceiling', label: 'Low Ceiling' },
  { id: 'uphill', label: 'Uphill' },
  { id: 'downhill', label: 'Downhill' }
];

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechCtor = new () => SpeechRecognitionLike;

export const RhbhShotFinder: React.FC<RhbhShotFinderProps> = ({
  bag,
  initialDistanceFeet = 175,
  initialWind = 'calm',
  holeNumber,
  holeDistanceFeet,
  selectedDiscIdOnHole,
  onSelectDiscForHole,
  onOpenDiscCard,
  onClose,
  compact = false
}) => {
  const [distanceFeet, setDistanceFeet] = useState<number>(
    Math.max(30, Math.min(450, Math.round(initialDistanceFeet)))
  );
  const [shape, setShape] = useState<RhbhShotShape>('straight');
  const [wind, setWind] = useState<CaddieScenario>(initialWind);
  const [terrain, setTerrain] = useState<RhbhTerrain>('open');
  const [bagFilter, setBagFilter] = useState<BagGroupingFilter>('jeffery');
  const [phraseInput, setPhraseInput] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Sync hole distance & wind when switching holes on Live Scorecard
  useEffect(() => {
    if (typeof holeDistanceFeet === 'number' && holeDistanceFeet > 0) {
      setDistanceFeet(Math.max(30, Math.min(450, Math.round(holeDistanceFeet))));
    }
  }, [holeNumber, holeDistanceFeet]);

  useEffect(() => {
    setWind(initialWind);
  }, [initialWind]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  const bagGroupOptions = useMemo(() => {
    const currentCount = filterBagByGrouping(bag, 'jeffery').length;
    const vaultCount = filterBagByGrouping(bag, 'archived').length;
    const jackCount = filterBagByGrouping(bag, 'jack').length;
    const bothCount = filterBagByGrouping(bag, 'all').length;
    const careerCount = filterBagByGrouping(bag, 'jeffery_all').length;
    return [
      {
        id: 'jeffery' as BagGroupingFilter,
        label: `🍬 Current Bag (${currentCount})`,
        shortName: `CURRENT BAG (${currentCount})`,
        activeCls: 'bg-[#FF5722] text-white border-[#FF5722]'
      },
      {
        id: 'archived' as BagGroupingFilter,
        label: `📦 Archive / Vault (${vaultCount})`,
        shortName: `ARCHIVE / VAULT (${vaultCount})`,
        activeCls: 'bg-amber-400 text-slate-950 border-amber-400'
      },
      {
        id: 'jack' as BagGroupingFilter,
        label: `⚡ Jack's Discs (${jackCount})`,
        shortName: `JACK'S DISCRAFT (${jackCount})`,
        activeCls: 'bg-[#00F0FF] text-slate-950 border-[#00F0FF]'
      },
      {
        id: 'all' as BagGroupingFilter,
        label: `👥 Active Both (${bothCount})`,
        shortName: `ACTIVE COMBINED (${bothCount})`,
        activeCls: 'bg-[#39FF14] text-slate-950 border-[#39FF14]'
      },
      {
        id: 'jeffery_all' as BagGroupingFilter,
        label: `🏆 All Career (${careerCount})`,
        shortName: `ALL JEFFERY CAREER (${careerCount})`,
        activeCls: 'bg-[#FF2E93] text-white border-[#FF2E93]'
      }
    ];
  }, [bag]);

  const activeBagOption =
    bagGroupOptions.find((opt) => opt.id === bagFilter) || bagGroupOptions[0];

  const result = useMemo(
    () =>
      recommendRhbhShotDiscs(
        { distanceFeet, shape, wind, terrain },
        bag,
        bagFilter
      ),
    [distanceFeet, shape, wind, terrain, bag, bagFilter]
  );

  const applySpokenOrTypedPhrase = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    const { next, matchedFields } = parseRhbhShotQuery(cleaned, {
      distanceFeet,
      shape,
      wind,
      terrain
    });
    setDistanceFeet(next.distanceFeet);
    setShape(next.shape);
    setWind(next.wind);
    setTerrain(next.terrain);
    if (matchedFields.length > 0) {
      playChainRattleSfx('birdie');
      setVoiceFeedback(`Set: ${matchedFields.join(' · ')}`);
    } else {
      setVoiceFeedback(`Try e.g. "175 go left" or "140 right uphill"`);
    }
    setTimeout(() => setVoiceFeedback(null), 4500);
  };

  const handleToggleVoiceMic = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };
    const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!Ctor) {
      setVoiceFeedback(
        'Tap the text box & use your phone keyboard mic (e.g. "180 go left")!'
      );
      setTimeout(() => setVoiceFeedback(null), 5000);
      return;
    }

    try {
      const rec = new Ctor();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        const spoken = ev.results?.[0]?.[0]?.transcript || '';
        setPhraseInput(spoken);
        applySpokenOrTypedPhrase(spoken);
      };
      rec.onerror = () => {
        setIsListening(false);
        setVoiceFeedback('Could not hear clearly — try typing or tap the sliders!');
        setTimeout(() => setVoiceFeedback(null), 4000);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = rec;
      setIsListening(true);
      playChainRattleSfx('tap');
      rec.start();
    } catch {
      setIsListening(false);
      setVoiceFeedback('Type a quick phrase like "185 go left" or use the sliders!');
      setTimeout(() => setVoiceFeedback(null), 4000);
    }
  };

  const topPick = result.topPick;
  const topFlight = useMemo(() => {
    if (!topPick) return null;
    return computeFlightPathSvg(topPick.disc, wind, topPick.releaseAngle);
  }, [topPick, wind]);

  // Target pin Y inside the 260x310 flight radar viewport
  const targetPinY = Math.min(
    235,
    Math.max(28, Math.round(196 - ((distanceFeet - 150) / 75) * 74))
  );
  const targetPinX =
    shape === 'hard_left'
      ? 68
      : shape === 'gentle_left'
      ? 102
      : shape === 'straight'
      ? 130
      : shape === 'gentle_right'
      ? 158
      : 192;

  const activeShapeMeta =
    SHAPE_OPTIONS.find((s) => s.id === shape) || SHAPE_OPTIONS[2];

  return (
    <div
      className={`neon-card rounded-2xl ${
        compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'
      } space-y-4`}
    >
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-[#39FF14] text-slate-950 font-mono-tabular text-[10px] font-extrabold uppercase tracking-wider zine-sticker">
              🎯 RHBH SHOT FINDER
            </span>
            <span className="text-[10px] font-mono-tabular font-bold uppercase tracking-wider text-[#00F0FF]">
              ALWAYS BACKHAND · {activeBagOption.shortName}
            </span>
          </div>
          <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight mt-1">
            Tell Me Distance + Left / Right → Instant Disc Pick
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {typeof holeDistanceFeet === 'number' &&
            holeDistanceFeet > 0 &&
            distanceFeet !== holeDistanceFeet && (
              <button
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setDistanceFeet(holeDistanceFeet);
                }}
                className="px-2.5 py-1 rounded-full bg-[#080B14] border border-slate-700 text-[11px] font-extrabold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>
                  Hole #{holeNumber} ({holeDistanceFeet}&apos;)
                </span>
              </button>
            )}
          {onClose && (
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                onClose();
              }}
              aria-label="Close RHBH Shot Finder"
              className="p-1.5 rounded-full bg-[#080B14] border border-slate-700 hover:border-[#FF2E93]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* BAG POOL FILTER BAR: CURRENT BAG / ARCHIVE / JACK'S DISCS / ACTIVE BOTH / ALL CAREER */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-mono-tabular font-extrabold uppercase tracking-wider text-slate-400 mr-1">
          Search Bag:
        </span>
        {bagGroupOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              playChainRattleSfx('tap');
              setBagFilter(opt.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
              bagFilter === opt.id
                ? opt.activeCls
                : 'bg-[#080B14] text-slate-300 border-slate-700 hover:border-white/40 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* VOICE / QUICK-PHRASE INPUT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applySpokenOrTypedPhrase(phraseInput);
        }}
        className="flex flex-wrap sm:flex-nowrap items-center gap-2"
      >
        <button
          type="button"
          onClick={handleToggleVoiceMic}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 zine-pill-btn ${
            isListening
              ? 'bg-[#FF2E93] text-white animate-pulse'
              : 'bg-[#FACC15] text-slate-950'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Say Shot</span>
            </>
          )}
        </button>

        <input
          type="text"
          value={phraseInput}
          onChange={(e) => setPhraseInput(e.target.value)}
          placeholder='Say or type: "165 go left", "210 right uphill", "120 straight"...'
          className="flex-1 min-w-[180px] px-3 py-2 text-xs font-bold focus:outline-none"
        />

        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl bg-[#00F0FF] text-slate-950 text-xs font-extrabold whitespace-nowrap shrink-0 zine-pill-btn"
        >
          Go →
        </button>
      </form>

      {voiceFeedback && (
        <div className="px-3 py-1.5 rounded-xl bg-[#080B14] border border-[#39FF14]/60 text-[11px] font-extrabold text-[#39FF14] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{voiceFeedback}</span>
        </div>
      )}

      {/* CONTROLS GRID: 1. DISTANCE + 2. LEFT / STRAIGHT / RIGHT + 3. WIND & LIE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* DISTANCE DIAL */}
        <div className="lg:col-span-5 p-3.5 rounded-xl bg-[#080B14] border space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono-tabular font-extrabold uppercase tracking-wider text-[#00F0FF]">
              1. Distance to Basket
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setDistanceFeet((d) => Math.max(30, d - 10));
                }}
                className="px-2 py-0.5 rounded-lg bg-[#111629] border border-slate-700 text-xs font-extrabold"
              >
                −10
              </button>
              <span className="font-mono-tabular text-lg sm:text-xl font-black text-[#39FF14] min-w-[76px] text-center">
                {distanceFeet} ft
              </span>
              <button
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setDistanceFeet((d) => Math.min(450, d + 10));
                }}
                className="px-2 py-0.5 rounded-lg bg-[#111629] border border-slate-700 text-xs font-extrabold"
              >
                +10
              </button>
            </div>
          </div>

          <input
            type="range"
            min={30}
            max={450}
            step={5}
            value={distanceFeet}
            onChange={(e) => setDistanceFeet(Number(e.target.value))}
            aria-label="Distance to basket in feet"
            className="w-full accent-[#FF2E93] cursor-pointer h-2.5"
          />

          <div className="flex flex-wrap gap-1">
            {QUICK_DISTANCES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setDistanceFeet(d);
                }}
                className={`px-2 py-1 rounded-lg font-mono-tabular text-[11px] font-extrabold border transition-all ${
                  distanceFeet === d
                    ? 'bg-[#39FF14] text-slate-950 border-[#0F172A]'
                    : 'bg-[#111629] text-slate-300 border-slate-700 hover:border-[#00F0FF]'
                }`}
              >
                {d}&apos;
              </button>
            ))}
          </div>

          {result.effectiveDistanceFeet !== distanceFeet && (
            <div className="text-[11px] font-mono-tabular font-bold text-[#FACC15]">
              ⚡ Plays like ~{result.effectiveDistanceFeet} ft ({terrain !== 'open' ? terrain.replace('_', ' ') : ''}{terrain !== 'open' && wind !== 'calm' ? ' + ' : ''}{wind !== 'calm' ? wind : ''})
            </div>
          )}
        </div>

        {/* RHBH SHAPE PICKER (LEFT <-> STRAIGHT <-> RIGHT) + MODIFIERS */}
        <div className="lg:col-span-7 p-3.5 rounded-xl bg-[#080B14] border space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono-tabular font-extrabold uppercase tracking-wider text-[#FF2E93]">
              2. Which Way Do You Need It To Go? (RHBH)
            </span>
            <span className="text-[10px] font-mono-tabular font-bold text-slate-400">
              {activeShapeMeta.shortLabel}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {SHAPE_OPTIONS.map((opt) => {
              const isSelected = shape === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    playChainRattleSfx('tap');
                    setShape(opt.id);
                  }}
                  style={
                    isSelected
                      ? {
                          borderColor: opt.accentHex,
                          boxShadow: `0 0 14px ${opt.accentHex}66`
                        }
                      : undefined
                  }
                  className={`p-1.5 sm:p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 text-center transition-all ${
                    isSelected
                      ? 'bg-slate-950 text-white scale-[1.03]'
                      : 'bg-[#111629] text-slate-300 border-slate-700 hover:border-white/50'
                  }`}
                >
                  <svg
                    viewBox="0 0 36 40"
                    className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d={opt.svgPath}
                      fill="none"
                      stroke={opt.accentHex}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <polygon points={opt.arrowPoints} fill={opt.accentHex} />
                  </svg>
                  <span className="text-[10px] sm:text-[11px] font-extrabold leading-tight">
                    {opt.shortLabel}
                  </span>
                  <span className="hidden sm:block text-[9px] opacity-75 leading-tight">
                    {opt.subLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* COMPACT WIND + TERRAIN TOGGLES */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-mono-tabular font-extrabold uppercase text-slate-400 inline-flex items-center gap-1 mr-0.5">
                <Wind className="w-3 h-3 text-[#00F0FF]" />
                Wind:
              </span>
              {WIND_OPTIONS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    playChainRattleSfx('tap');
                    setWind(w.id);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-extrabold border transition-colors ${
                    wind === w.id
                      ? 'bg-[#00F0FF] text-slate-950 border-[#0F172A]'
                      : 'bg-[#111629] text-slate-300 border-slate-700'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-mono-tabular font-extrabold uppercase text-slate-400 inline-flex items-center gap-1 mr-0.5">
                <Compass className="w-3 h-3 text-[#FACC15]" />
                Lie:
              </span>
              {TERRAIN_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    playChainRattleSfx('tap');
                    setTerrain(t.id);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-extrabold border transition-colors ${
                    terrain === t.id
                      ? 'bg-[#FACC15] text-slate-950 border-[#0F172A]'
                      : 'bg-[#111629] text-slate-300 border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* #1 BEST RHBH RECOMMENDATION HERO CARD */}
      {topPick && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          <div className="lg:col-span-8 p-3.5 sm:p-4 rounded-2xl bg-[#080B14] border-2 border-[#39FF14]/80 flex flex-col sm:flex-row gap-3.5 items-start">
            {/* HD COLLECTOR CARD THUMB */}
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                onOpenDiscCard?.(topPick.disc.id);
              }}
              className="w-24 sm:w-28 aspect-[764/1024] rounded-xl overflow-hidden border-2 shrink-0 bg-[#050812] mx-auto sm:mx-0 group relative"
              style={{
                borderColor: topPick.disc.colorHex,
                boxShadow: `0 0 18px ${topPick.disc.colorHex}55`
              }}
            >
              {getDiscCardImageUrl(topPick.disc) ? (
                <img
                  src={getDiscCardImageUrl(topPick.disc)!}
                  alt={topPick.disc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc className="w-8 h-8 text-[#00F0FF]" />
                </div>
              )}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#39FF14] text-slate-950 font-mono-tabular text-[9px] font-black">
                #1 PICK
              </span>
            </button>

            {/* RECOMMENDATION DETAILS */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#39FF14] text-slate-950 font-mono-tabular text-[10px] font-black uppercase">
                    ★ {topPick.matchScore}% RHBH MATCH
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF2E93] text-white font-mono-tabular text-[10px] font-extrabold">
                    {topPick.powerLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#00F0FF] text-slate-950 font-mono-tabular text-[10px] font-extrabold">
                    {topPick.whyBadge}
                  </span>
                  {topPick.disc.archived && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 font-mono-tabular text-[10px] font-extrabold uppercase">
                      📦 Archive / Vault
                    </span>
                  )}
                  {topPick.disc.ownerId === 'jack' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] font-mono-tabular text-[10px] font-extrabold uppercase">
                      ⚡ Jack&apos;s Disc
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-display text-base sm:text-lg font-black uppercase tracking-tight leading-tight">
                  {topPick.disc.weightGrams ? `${topPick.disc.weightGrams}g ` : ''}
                  {topPick.disc.plastic} {topPick.disc.name}{' '}
                  <span className="font-mono-tabular text-sm text-[#00F0FF]">
                    [{topPick.disc.speed}|{topPick.disc.glide}|{topPick.disc.turn}|{topPick.disc.fade}]
                  </span>
                </h4>
                <div className="text-[11px] font-mono-tabular font-bold text-[#FACC15] mt-0.5">
                  Release: {topPick.releaseLabel} · Calibrated Max ~{topPick.estCarryFeet} ft
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#111629] border border-slate-700 space-y-1">
                <div className="text-[10px] font-mono-tabular font-extrabold uppercase text-[#39FF14]">
                  🎯 Backhand Aim &amp; Form Cue ({distanceFeet} ft · {activeShapeMeta.shortLabel})
                </div>
                <p className="text-xs font-bold leading-snug">{topPick.aimCue}</p>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                {topPick.coachingNote}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {onSelectDiscForHole && (
                  <button
                    type="button"
                    onClick={() => {
                      playChainRattleSfx('birdie');
                      onSelectDiscForHole(topPick.disc);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 zine-pill-btn ${
                      selectedDiscIdOnHole === topPick.disc.id
                        ? 'bg-[#39FF14] text-slate-950'
                        : 'bg-[#FACC15] text-slate-950'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {selectedDiscIdOnHole === topPick.disc.id
                        ? `Logged on Hole #${holeNumber}`
                        : `Use ${topPick.disc.name} on Hole #${holeNumber}`}
                    </span>
                  </button>
                )}
                {onOpenDiscCard && (
                  <button
                    type="button"
                    onClick={() => {
                      playChainRattleSfx('tap');
                      onOpenDiscCard(topPick.disc.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#111629] border border-slate-700 text-xs font-extrabold"
                  >
                    Open Full Card →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* LIVE RHBH FLIGHT RADAR SVG */}
          {topFlight && (
            <div className="lg:col-span-4 rangefinder-keep-dark rounded-2xl bg-[#040914] p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono-tabular font-extrabold uppercase text-[#00F0FF] pb-1">
                <span>RHBH Flight Preview</span>
                <span className="text-[#39FF14]">{topPick.releaseAngle.toUpperCase()}</span>
              </div>
              <svg
                viewBox="0 0 260 310"
                className="w-full max-h-[215px] mx-auto"
                role="img"
                aria-label={`RHBH flight path for ${topPick.disc.name} at ${distanceFeet} feet`}
              >
                {/* Yardage Grid Lines */}
                {[
                  { ft: 300, y: 48 },
                  { ft: 225, y: 122 },
                  { ft: 150, y: 196 },
                  { ft: 75, y: 256 }
                ].map((line) => (
                  <g key={line.ft}>
                    <line
                      x1="16"
                      y1={line.y}
                      x2="244"
                      y2={line.y}
                      stroke="rgba(148,163,184,0.22)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="22"
                      y={line.y - 4}
                      fill="rgba(148,163,184,0.72)"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {line.ft}ft
                    </text>
                  </g>
                ))}

                {/* Center Fairway Line */}
                <line
                  x1="130"
                  y1="20"
                  x2="130"
                  y2="296"
                  stroke="rgba(0,240,255,0.2)"
                  strokeDasharray="3 5"
                />

                {/* Target Basket Zone at User Distance + Desired Left/Right */}
                <circle
                  cx={targetPinX}
                  cy={targetPinY}
                  r="15"
                  fill="rgba(250,204,21,0.14)"
                  stroke="#FACC15"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx={targetPinX} cy={targetPinY} r="4.5" fill="#FACC15" />
                <text
                  x={Math.min(205, Math.max(18, targetPinX + 12))}
                  y={Math.max(20, targetPinY - 8)}
                  fill="#FACC15"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  PIN {distanceFeet}&apos;
                </text>

                {/* Animated Disc Flight Curve */}
                <path
                  key={`${topPick.disc.id}-${distanceFeet}-${shape}-${wind}-${terrain}`}
                  d={topFlight.pathD}
                  fill="none"
                  stroke={topPick.disc.colorHex || '#FF2E93'}
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  className="flight-bezier-animated"
                />
                <circle
                  cx={topFlight.endX}
                  cy={topFlight.endY}
                  r="5.5"
                  fill="#39FF14"
                  stroke="#050812"
                  strokeWidth="2"
                />

                {/* Tee / Lie Marker */}
                <rect
                  x="118"
                  y="290"
                  width="24"
                  height="8"
                  rx="3"
                  fill="#00F0FF"
                />
                <text
                  x="130"
                  y="308"
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  YOU (RHBH)
                </text>
              </svg>
              <div className="flex items-center justify-between text-[10px] font-mono-tabular text-slate-400 pt-1">
                <span>← RHBH Fade (Left)</span>
                <span>RHBH Turn (Right) →</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* #2 & #3 ALTERNATE PICKS */}
      {result.alternatives.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {result.alternatives.map((alt, idx) => {
            const cardImg = getDiscCardImageUrl(alt.disc);
            return (
              <div
                key={alt.disc.id}
                className="p-2.5 rounded-xl bg-[#080B14] border flex items-center justify-between gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    playChainRattleSfx('tap');
                    onOpenDiscCard?.(alt.disc.id);
                  }}
                  className="flex items-center gap-2.5 min-w-0 text-left flex-1"
                >
                  {cardImg ? (
                    <img
                      src={cardImg}
                      alt={alt.disc.name}
                      className="w-10 h-14 rounded-lg object-cover border shrink-0"
                      style={{ borderColor: alt.disc.colorHex }}
                    />
                  ) : (
                    <Disc className="w-6 h-6 text-[#00F0FF] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-mono-tabular font-extrabold text-[#00F0FF]">
                        #{idx + 2} ALT ({alt.matchScore}%)
                      </span>
                      <span className="text-[10px] font-mono-tabular font-bold text-[#FACC15]">
                        · {alt.powerLabel}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold truncate">
                      {alt.disc.weightGrams ? `${alt.disc.weightGrams}g ` : ''}
                      {alt.disc.name} [{alt.disc.speed}|{alt.disc.glide}|{alt.disc.turn}|{alt.disc.fade}]
                      {alt.disc.archived ? ' · 📦 Vault' : alt.disc.ownerId === 'jack' ? ' · ⚡ Jack' : ''}
                    </div>
                    <div className="text-[10.5px] text-slate-400 truncate">
                      {alt.releaseLabel} · {alt.whyBadge}
                    </div>
                  </div>
                </button>

                {onSelectDiscForHole && (
                  <button
                    type="button"
                    onClick={() => {
                      playChainRattleSfx('tap');
                      onSelectDiscForHole(alt.disc);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#111629] border border-slate-700 hover:border-[#39FF14] text-[10.5px] font-extrabold shrink-0"
                  >
                    {selectedDiscIdOnHole === alt.disc.id ? '✓ Logged' : 'Use'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
