import React, { useMemo, useState } from 'react';
import {
  Play,
  Disc,
  History,
  BarChart3,
  Mic,
  CheckCircle2,
  Share2,
  Database,
  Copy,
  Download,
  FileText,
  Palette,
  Sparkles,
  Trophy,
  ArrowRight,
  Map as MapIcon
} from 'lucide-react';
import {
  ActiveRoundState,
  BgThemeMode,
  CaddieScenario,
  CourseTemplate,
  DiscItem,
  HistoricalRound
} from '../data/initialData';
import { formatRelativePar, getCoursePersonalBest } from '../utils/analytics';
import { generateFullChatGptReport } from '../utils/reportGenerator';
import { playChainRattleSfx } from '../utils/soundFx';

interface ThemeOption {
  id: BgThemeMode;
  label: string;
  surface: 'light' | 'dark';
  swatch: string;
}

interface HomeHubViewProps {
  courses: CourseTemplate[];
  bag: DiscItem[];
  history: HistoricalRound[];
  roundState: ActiveRoundState;
  hasActiveRound?: boolean;
  bgTheme: BgThemeMode;
  bgThemeOptions: ReadonlyArray<ThemeOption>;
  onChangeBgTheme: (theme: BgThemeMode) => void;
  onStartConfiguredRound: (params: {
    courseKey: string;
    windCondition: CaddieScenario;
    voiceRecordingConfirmed: boolean;
    activePlayerIds?: string[];
    initialTranscript?: string;
  }) => void;
  onResumeLiveRound: () => void;
  onOpenVoiceLogImporter?: () => void;
  onOpenShotFinder?: () => void;
  onNavigateTab: (
    tab: 'live' | 'atlas' | 'courses' | 'rivalry' | 'history' | 'sync' | 'dashboard',
    bagOwnerFilter?: 'jeffery' | 'jack' | 'all',
    courseKeyOrName?: string
  ) => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  courses,
  bag,
  history,
  roundState,
  hasActiveRound = false,
  bgTheme,
  bgThemeOptions,
  onChangeBgTheme,
  onStartConfiguredRound,
  onResumeLiveRound,
  onOpenShotFinder,
  onNavigateTab
}) => {
  // Count how many times each course has been played in history
  const coursePlayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of courses) {
      counts[c.key] = 0;
    }
    for (const r of history) {
      const nameLower = (r.courseName || '').toLowerCase();
      for (const c of courses) {
        if (
          nameLower.includes(c.name.toLowerCase()) ||
          (c.key === 'sarko' && (nameLower.includes('sar-ko-par') || nameLower.includes('sarko'))) ||
          (c.key === 'mize' && nameLower.includes('mize')) ||
          (c.key === 'artnine' && nameLower.includes('art nine')) ||
          (c.key === 'harmon' && nameLower.includes('harmon')) ||
          (c.key === 'blackhoof' &&
            nameLower.includes('black hoof') &&
            !nameLower.includes('championship')) ||
          (c.key === 'cedarridge' && nameLower.includes('cedar ridge')) ||
          (c.key === 'smp_wooded' && nameLower.includes('shawnee mission wooded')) ||
          (c.key === 'prairie_pass' &&
            (nameLower.includes('prairie pass') || nameLower.includes('blue valley'))) ||
          (c.key === 'prairie_center' && nameLower.includes('prairie center')) ||
          (c.key === 'wyandotte' && nameLower.includes('wyandotte')) ||
          (c.key === 'heritage_park' && nameLower.includes('heritage'))
        ) {
          counts[c.key] = (counts[c.key] || 0) + 1;
          break;
        }
      }
    }
    return counts;
  }, [courses, history]);

  // Sort courses by most frequently played, with Sar-Ko-Par Trails always #1 at the top
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      if (a.key === 'sarko') return -1;
      if (b.key === 'sarko') return 1;
      const countDiff = (coursePlayCounts[b.key] || 0) - (coursePlayCounts[a.key] || 0);
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });
  }, [courses, coursePlayCounts]);

  const [showStartWizard, setShowStartWizard] = useState(false);
  const [selectedCourseKey, setSelectedCourseKey] = useState<string>('sarko');
  const [soloMode, setSoloMode] = useState<boolean>(
    (roundState.activePlayerIds || ['jeffery', 'jack']).length === 1
  );
  const [reportCopied, setReportCopied] = useState<boolean>(false);
  const [showReportPreview, setShowReportPreview] = useState<boolean>(false);

  const jefferyDiscs = bag.filter((d) => d.ownerId !== 'jack' && !d.archived);
  const jackDiscs = bag.filter((d) => d.ownerId === 'jack' && !d.archived);

  const fullChatGptReport = useMemo(
    () =>
      generateFullChatGptReport({
        history,
        bag,
        courses,
        roster: [
          { id: 'jeffery', name: 'Jeffery' },
          { id: 'jack', name: 'Jack' }
        ],
        roundState
      }),
    [history, bag, courses, roundState]
  );

  const handleCopyFullReport = async () => {
    playChainRattleSfx('tap');
    try {
      await navigator.clipboard.writeText(fullChatGptReport);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 3500);
    } catch {
      setShowReportPreview(true);
    }
  };

  const handleDownloadFullReport = () => {
    playChainRattleSfx('tap');
    const blob = new Blob([fullChatGptReport], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DG_Full_Gemini_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chosenCourse =
    sortedCourses.find((c) => c.key === selectedCourseKey) || sortedCourses[0];

  const buildNotesAppStarterTemplate = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
    const totalPar = chosenCourse.holes.reduce((s, h) => s + h.par, 0);
    const totalDist = chosenCourse.holes.reduce((s, h) => s + h.distance, 0);
    return `🎙️ ${chosenCourse.name} (${chosenCourse.totalHoles} Holes · Par ${totalPar} · ${totalDist.toLocaleString()} ft)
Date: ${today} · ${timeStr}
Players: ${soloMode ? 'Jeffery (Solo)' : 'Jeffery & Jack'}

`;
  };

  const handleOpenPhoneNotesShare = async () => {
    playChainRattleSfx('tap');
    const text = buildNotesAppStarterTemplate();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${chosenCourse.name} Voice Log (${new Date().toISOString().slice(0, 10)})`,
          text
        });
      } catch {
        // User cancelled share sheet
      }
    }
  };

  const handleConfirmTeeOff = () => {
    playChainRattleSfx('birdie');
    onStartConfiguredRound({
      courseKey: selectedCourseKey,
      windCondition: 'calm',
      voiceRecordingConfirmed: true,
      activePlayerIds: soloMode ? ['jeffery'] : ['jeffery', 'jack']
    });
    setShowStartWizard(false);
  };

  // Dynamic Zine Cover Hero Metadata (from Live Round or Latest Logged Round)
  const latestRound = history[0] || null;
  const heroCourseName = hasActiveRound
    ? roundState.courseName
    : latestRound?.courseName || 'Sar-Ko-Par Trails';
  const heroCourseShort = heroCourseName
    .replace(' Flying Disc', '')
    .replace(' Trails', '')
    .trim();

  const latestJeff = latestRound?.players.find((p) => p.id === 'jeffery');
  const latestPar =
    latestRound?.par ||
    latestRound?.holes.reduce((s, h) => s + (h.par || 3), 0) ||
    27;
  const latestRel = latestJeff ? latestJeff.total - latestPar : 0;
  const latestBogeys = latestRound
    ? latestRound.holes.filter((h) => (h.scores.jeffery || 0) > (h.par || 3)).length
    : 0;
  const latestBirdies = latestRound
    ? latestRound.holes.filter(
        (h) => (h.scores.jeffery || 0) > 0 && h.scores.jeffery < (h.par || 3)
      ).length
    : 0;

  const sarkoPB = getCoursePersonalBest(heroCourseName, 'jeffery', history);
  const jackSarkoPB = getCoursePersonalBest(heroCourseName, 'jack', history);

  const heroHeadline = hasActiveRound
    ? `LIVE CARD // HOLE #${roundState.currentHoleIndex + 1} AT ${heroCourseShort.toUpperCase()}`
    : latestRound && latestJeff
    ? `LOG #${history.length} // ${
        latestBogeys === 0 ? 'BOGEY-FREE ' : ''
      }${latestJeff.total} (${formatRelativePar(latestRel)}) AT ${heroCourseShort.toUpperCase()}`
    : `FIELD ZINE // READY FOR TEE-OFF!`;

  const heroStatusPill = hasActiveRound
    ? `H#${roundState.currentHoleIndex + 1} OF ${roundState.totalHoles}`
    : latestRound && latestJeff
    ? `${latestJeff.total} (${formatRelativePar(latestRel)}) · ${latestBirdies} BIRDIE${
        latestBirdies === 1 ? '' : 'S'
      }${latestBogeys === 0 ? ' · ZERO BOGEYS' : ''}`
    : 'READY TO THROW';

  const heroRecapLine = hasActiveRound
    ? `Current active round on ${roundState.date} · Tap to jump right back to Hole #${roundState.currentHoleIndex + 1}!`
    : (latestRound?.notes || 'View hole-by-hole throws, discs & voice commentary on the scorecard.');

  const activeVibeMeta =
    bgThemeOptions.find((opt) => opt.id === bgTheme) || bgThemeOptions[0];
  const isDarkVibe = activeVibeMeta?.surface === 'dark';

  return (
    <div className="space-y-5">
      {/* 0A. DISC GOLF FULL-APP UI VIBE STUDIO BAR */}
      <div className="neon-card rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 text-white font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shrink-0 zine-sticker">
            <Palette className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>UI VIBE:</span>
          </span>
          {bgThemeOptions.map((opt) => {
            const isSelected = bgTheme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeBgTheme(opt.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold zine-pill-btn transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected ? 'vibe-pill-active scale-[1.02]' : 'vibe-nav-idle opacity-90 hover:opacity-100'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/70 shrink-0 shadow-sm"
                  style={{ background: opt.swatch }}
                />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
        <span
          className={`hidden xl:inline-flex items-center px-2.5 py-0.5 rounded-full font-mono-tabular text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
            isDarkVibe
              ? 'bg-[#FF2E93] text-white'
              : 'bg-[#FACC15] text-slate-950'
          }`}
        >
          {isDarkVibe ? '⚡ NEON DARK MODE' : '☀️ DAYLIGHT MODE'}
        </span>
      </div>

      {/* 0B. POP-ART DISC GOLF FIELD ZINE ISSUE COVER BANNER */}
      <div className="zine-hero-card rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="zine-hero-orb" aria-hidden="true" />

        <div className="relative z-10 flex flex-wrap items-center gap-1.5 pr-12 sm:pr-20">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FF2E93] text-white font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider zine-sticker max-w-full truncate">
            {hasActiveRound ? `⚡ LIVE ROUND` : `★ ISSUE #${history.length}`}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-950 font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider zine-sticker max-w-full truncate">
            ⛳ {heroCourseShort} {latestRound?.date ? `// ${latestRound.date}` : ''}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF] text-slate-950 font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider zine-sticker max-w-full truncate">
            {heroStatusPill}
          </span>
        </div>

        <h1 className="relative z-10 font-display text-lg sm:text-2xl lg:text-[26px] font-extrabold uppercase leading-[1.15] tracking-tight pr-6 sm:pr-20 break-words zine-keep-color">
          {heroHeadline}
        </h1>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-2.5 pt-0.5">
          <div className="lg:col-span-5 min-w-0 w-full max-w-full overflow-hidden px-3 py-2 rounded-2xl bg-white/95 text-slate-950 zine-sticker flex items-center gap-2 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              <strong>{heroCourseShort} PBs:</strong> Jeffery{' '}
              {sarkoPB.bestTotal !== null
                ? `${sarkoPB.bestTotal} (${formatRelativePar(sarkoPB.bestRelPar || 0)})`
                : '—'}
              {jackSarkoPB.bestTotal !== null
                ? ` · Jack ${jackSarkoPB.bestTotal} (${formatRelativePar(
                    jackSarkoPB.bestRelPar || 0
                  )})`
                : ` · Avg ${sarkoPB.avgTotal ?? '—'}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playChainRattleSfx('tap');
              onResumeLiveRound();
            }}
            className="lg:col-span-7 min-w-0 w-full max-w-full overflow-hidden px-3.5 py-2 rounded-2xl bg-[#39FF14] text-slate-950 zine-pill-btn text-left text-xs font-extrabold flex items-center justify-between gap-2"
          >
            <span className="min-w-0 flex-1 truncate">
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              {heroRecapLine}
            </span>
            <span className="inline-flex items-center gap-1 shrink-0 underline uppercase font-mono-tabular text-[11px]">
              {hasActiveRound ? 'Score' : 'Card'}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>

      {/* PRE-ROUND TEE-OFF WIZARD (COURSE + NOTES VOICE RECORDING PROMPT) */}
      {showStartWizard && (
        <div className="neon-card rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 border-b-2 border-slate-900/20 pb-3.5">
            <h2 className="text-xl sm:text-2xl font-extrabold">
              ⛳ New Round Setup
            </h2>
            <button
              type="button"
              onClick={() => setShowStartWizard(false)}
              className="px-3.5 py-1.5 rounded-full zine-pill-btn bg-white text-slate-900 text-xs font-extrabold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* STEP 1: CHOOSE COURSE & PLAYERS (SOLO VS DUO) */}
            <div className="p-4 rounded-2xl bg-[#080B14] border-2 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FF2E93] text-white font-bold text-xs flex items-center justify-center zine-sticker">
                    1
                  </span>
                  <h3 className="text-sm sm:text-base font-bold">
                    Course &amp; Players (Most Played First)
                  </h3>
                </div>
              </div>

              {/* Solo vs Duo Quick Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#111629] border">
                <button
                  type="button"
                  onClick={() => {
                    playChainRattleSfx('tap');
                    setSoloMode(false);
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-extrabold transition-colors ${
                    !soloMode
                      ? 'bg-[#00F0FF] text-slate-950'
                      : isDarkVibe
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  👥 Jeffery &amp; Jack
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChainRattleSfx('tap');
                    setSoloMode(true);
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-extrabold transition-colors ${
                    soloMode
                      ? 'bg-[#FF2E93] text-white'
                      : isDarkVibe
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  👤 Solo (Jeffery Only)
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sortedCourses.map((c) => {
                  const isChosen = c.key === selectedCourseKey;
                  const dist = c.holes.reduce((s, h) => s + h.distance, 0);
                  const playCount = coursePlayCounts[c.key] || 0;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        playChainRattleSfx('tap');
                        setSelectedCourseKey(c.key);
                      }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                        isChosen
                          ? 'bg-[#FACC15] text-slate-950 border-[#0F172A] shadow-[3px_3px_0_#0F172A]'
                          : isDarkVibe
                          ? 'vibe-nav-idle hover:opacity-100'
                          : 'bg-white text-slate-900 border-slate-900/30 hover:border-[#0F172A]'
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm">{c.name}</span>
                          {playCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tabular font-extrabold bg-emerald-100 text-emerald-900 border border-slate-900/30">
                              {playCount} {playCount === 1 ? 'Round' : 'Rounds'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-80">
                          {c.location} · {c.totalHoles} Holes ({dist.toLocaleString()} ft)
                        </div>
                      </div>
                      {isChosen && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: VOICE RECORDING & IPHONE NOTES APP PROMPT */}
            <div className="p-4 rounded-2xl bg-[#080B14] border-2 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#39FF14] text-slate-950 font-bold text-xs flex items-center justify-center zine-sticker">
                    2
                  </span>
                  <h3 className="text-sm sm:text-base font-bold">
                    Start Voice / Notes Recording!
                  </h3>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111629] border">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FF2E93]">
                    <Mic className="w-4 h-4 shrink-0" />
                    <span>Reminder: Record Your Round Commentary!</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPhoneNotesShare}
                    className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-[#39FF14] text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 zine-pill-btn"
                  >
                    <Share2 className="w-4 h-4 shrink-0" />
                    <span>Share Starter Note</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-slate-900/15 flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setShowStartWizard(false);
                onNavigateTab('atlas', undefined, selectedCourseKey);
              }}
              className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-full bg-[#00F0FF] text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 zine-pill-btn"
            >
              <MapIcon className="w-4 h-4 shrink-0" />
              <span>Preview {chosenCourse.name} Layout</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmTeeOff}
              className="w-full sm:w-auto min-h-[50px] px-8 py-3 rounded-full bg-[#39FF14] text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 zine-pill-btn"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Tee Off on Hole #1 Now</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN 4-TILE FRONT PAGE HUB (EQUAL-HEIGHT COMIC FIELD ZINE TILES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-4 sm:gap-5">
        {/* TILE 1: PLAY A ROUND */}
        <div className="neon-card min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5 h-full min-h-[138px] flex flex-col justify-between gap-3.5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF2E93] text-white text-[11px] font-extrabold uppercase tracking-wide whitespace-nowrap zine-sticker">
                1 · Live Scorecard
              </span>
              <Play className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <h2 className="font-display text-[15px] sm:text-[17px] font-extrabold uppercase leading-snug tracking-tight break-words">
              Play a Round
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setShowStartWizard(true);
              }}
              className="w-full min-w-0 min-h-[40px] px-3 py-2 rounded-xl bg-[#39FF14] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 truncate zine-pill-btn"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="truncate">Start New Round</span>
            </button>
            {onOpenShotFinder && (
              <button
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  onOpenShotFinder();
                }}
                className="w-full min-w-0 min-h-[40px] px-3 py-2 rounded-xl bg-[#00F0FF] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 truncate zine-pill-btn"
              >
                <span className="truncate">🎯 RHBH Shot Finder</span>
              </button>
            )}
          </div>
        </div>

        {/* TILE 2: DISC CARDS */}
        <div className="neon-card min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5 h-full min-h-[138px] flex flex-col justify-between gap-3.5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF] text-slate-950 text-[11px] font-extrabold uppercase tracking-wide whitespace-nowrap zine-sticker">
                2 · Disc Cards
              </span>
              <Disc className="w-4 h-4 text-sky-600 shrink-0" />
            </div>
            <h2 className="font-display text-[15px] sm:text-[17px] font-extrabold uppercase leading-snug tracking-tight break-words">
              Disc Cards &amp; Bag Stats
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                onNavigateTab('courses', 'jeffery');
              }}
              className="min-w-0 w-full min-h-[40px] px-2.5 py-2 rounded-xl bg-[#FF2E93] text-white font-extrabold text-xs flex items-center justify-center zine-pill-btn"
            >
              <span className="truncate">Jeffery&apos;s ({jefferyDiscs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                onNavigateTab('courses', 'jack');
              }}
              className="min-w-0 w-full min-h-[40px] px-2.5 py-2 rounded-xl bg-[#00F0FF] text-slate-950 font-extrabold text-xs flex items-center justify-center zine-pill-btn"
            >
              <span className="truncate">Jack&apos;s ({jackDiscs.length})</span>
            </button>
          </div>
        </div>

        {/* TILE 3: COURSE LAYOUTS & ROUND HISTORY */}
        <div className="neon-card min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5 h-full min-h-[138px] flex flex-col justify-between gap-3.5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FACC15] text-slate-950 text-[11px] font-extrabold uppercase tracking-wide whitespace-nowrap zine-sticker">
                3 · Courses &amp; History
              </span>
              <MapIcon className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
            <h2 className="font-display text-[15px] sm:text-[17px] font-extrabold uppercase leading-snug tracking-tight break-words">
              Course Layouts &amp; History
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                onNavigateTab('atlas');
              }}
              className="min-w-0 w-full min-h-[40px] px-2.5 py-2 rounded-xl bg-[#00F0FF] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 zine-pill-btn"
            >
              <MapIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Layouts ({courses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                onNavigateTab('history');
              }}
              className="min-w-0 w-full min-h-[40px] px-2.5 py-2 rounded-xl bg-[#FACC15] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 zine-pill-btn"
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">History ({history.length})</span>
            </button>
          </div>
        </div>

        {/* TILE 4: PERSONAL & COURSE STATS */}
        <div className="neon-card min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5 h-full min-h-[138px] flex flex-col justify-between gap-3.5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF2E93] text-white text-[11px] font-extrabold uppercase tracking-wide whitespace-nowrap zine-sticker">
                4 · Stats &amp; Trends
              </span>
              <BarChart3 className="w-4 h-4 text-pink-600 shrink-0" />
            </div>
            <h2 className="font-display text-[15px] sm:text-[17px] font-extrabold uppercase leading-snug tracking-tight break-words">
              Personal &amp; Course Stats
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                onNavigateTab('rivalry');
              }}
              className="min-w-0 flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-[#39FF14] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 zine-pill-btn"
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Stats &amp; Graphs</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                onNavigateTab('sync');
              }}
              className="min-w-0 min-h-[40px] px-3 py-2 rounded-xl border-2 bg-[#080B14] font-extrabold text-xs flex items-center justify-center gap-1.5 zine-pill-btn"
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT STATS & ROUND REPORT BAR */}
      <div className="neon-card min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#39FF14] text-slate-950 text-[11px] font-extrabold uppercase tracking-wide zine-sticker">
                Report Export
              </span>
              <span className="text-xs font-mono-tabular font-extrabold">
                {history.length} Rounds · {bag.length} Discs · {courses.length} Courses
              </span>
            </div>
            <h2 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight">
              Full Stats &amp; Round Report
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyFullReport}
              className="min-h-[38px] px-3 py-1.5 rounded-full bg-[#39FF14] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap zine-pill-btn"
            >
              {reportCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadFullReport}
              className="min-h-[38px] px-3 py-1.5 rounded-full bg-[#00F0FF] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap zine-pill-btn"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>.TXT</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setShowReportPreview((v) => !v);
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-full border-2 bg-[#080B14] font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap zine-pill-btn"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{showReportPreview ? 'Hide Text' : 'View Text'}</span>
            </button>
          </div>
        </div>

        {showReportPreview && (
          <div className="space-y-2 pt-2 border-t-2 border-slate-900/15">
            <div className="flex items-center justify-between text-xs">
              <span>Full Structured Report ({fullChatGptReport.length.toLocaleString()} characters):</span>
              <span className="font-bold">Click inside box and press Ctrl+A / Cmd+A to select all</span>
            </div>
            <textarea
              readOnly
              value={fullChatGptReport}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              rows={16}
              className="w-full rounded-xl bg-white p-3 text-xs font-mono text-slate-900 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
