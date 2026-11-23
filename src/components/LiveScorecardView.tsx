import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  Trophy,
  Disc,
  Download,
  Mic,
  Copy
} from 'lucide-react';
import {
  ActiveRoundState,
  CaddieScenario,
  CourseTemplate,
  DiscItem,
  HistoricalRound,
  PlayerRosterItem,
  TimerState,
  getDiscCardImageUrl
} from '../data/initialData';
import {
  CaddieStabilityFilter,
  DEFAULT_VERIFIED_HOLE_PICKS,
  buildLivePersonalFlightProfile,
  computeFlightPathSvg,
  formatRelativePar,
  getCoursePersonalBest,
  getHoleCaddyInsights,
  getHoleVisualOutlineSpec,
  getScoreTerm,
  getVerifiedHoleKey,
  recommendDiscsByStability,
  recommendJackDisc
} from '../utils/analytics';
import {
  BroadcastScorecardTicker,
  FlightReadoutBar,
  HoleLayoutOutlineWidget
} from './TacticalRangefinderWidgets';
import { playChainRattleSfx } from '../utils/soundFx';
import { RhbhShotFinder } from './RhbhShotFinder';

const VERIFIED_PICKS_STORAGE_KEY = 'jj_disc_golf_verified_hole_picks_v10';

interface LiveScorecardViewProps {
  roundState: ActiveRoundState;
  setRoundState: React.Dispatch<React.SetStateAction<ActiveRoundState>>;
  roster: PlayerRosterItem[];
  history: HistoricalRound[];
  courses: CourseTemplate[];
  bag: DiscItem[];
  timerState: TimerState;
  elapsedSeconds: number;
  hasActiveRound?: boolean;
  onStartActiveRound?: () => void;
  onStartNewRoundSetup?: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSwitchCourse: (courseKey: string) => void;
  onSaveFinishedRound: (syncToWebhook: boolean) => Promise<void>;
  webhookSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  onOpenBagGuide?: (discId?: string, ownerFilter?: 'jeffery' | 'jack' | 'all') => void;
  onOpenVoiceLogImporter?: () => void;
}

export const LiveScorecardView: React.FC<LiveScorecardViewProps> = ({
  roundState,
  setRoundState,
  roster,
  history,
  courses,
  bag,
  timerState,
  elapsedSeconds,
  hasActiveRound = true,
  onStartActiveRound,
  onStartNewRoundSetup,
  onToggleTimer,
  onResetTimer,
  onSaveFinishedRound,
  onOpenBagGuide,
  onOpenVoiceLogImporter
}) => {
  const [caddieScenario, setCaddieScenario] = useState<CaddieScenario>(
    roundState.windCondition || 'calm'
  );
  const [stabilityFilter, setStabilityFilter] =
    useState<CaddieStabilityFilter>('hole_match');
  const [slotOverrides, setSlotOverrides] = useState<{
    driverId?: string;
    midId?: string;
    putterId?: string;
  }>({});
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const [showSwingCues, setShowSwingCues] = useState<boolean>(true);
  const [showShotFinder, setShowShotFinder] = useState<boolean>(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  const [saveConfirmBanner, setSaveConfirmBanner] = useState<string | null>(null);
  const [notesHeaderCopied, setNotesHeaderCopied] = useState(false);

  const handleCopyLiveNotesHeader = async () => {
    const now = new Date();
    const today =
      roundState.date ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
    const totalPar = roundState.holes.reduce((s, h) => s + h.par, 0);
    const totalDist = roundState.holes.reduce((s, h) => s + h.distance, 0);
    const playersLabel =
      (roundState.activePlayerIds || ['jeffery', 'jack']).length === 1
        ? 'Jeffery (Solo)'
        : 'Jeffery & Jack';
    const text = `🎙️ ${roundState.courseName} (${roundState.totalHoles} Holes · Par ${totalPar} · ${totalDist.toLocaleString()} ft)
Date: ${today} · ${timeStr}
Players: ${playersLabel}

`;
    try {
      await navigator.clipboard.writeText(text);
      setNotesHeaderCopied(true);
      setTimeout(() => setNotesHeaderCopied(false), 3500);
    } catch {
      // Ignore
    }
  };

  const toggleFlipCard = (discId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playChainRattleSfx('flip');
    setFlippedCardIds((prev) => ({ ...prev, [discId]: !prev[discId] }));
  };

  const formatDiscCardTitle = (d: DiscItem) => {
    const weightPart = d.weightGrams ? `${d.weightGrams}g ` : '';
    const hasPlasticInName =
      d.plastic === 'Standard (Unlisted)' ||
      d.name.toLowerCase().startsWith(d.plastic.toLowerCase());
    const plasticPart = hasPlasticInName ? '' : `${d.plastic} `;
    return `${weightPart}${plasticPart}${d.name}`;
  };

  const [verifiedHolePicks] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(VERIFIED_PICKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_VERIFIED_HOLE_PICKS, ...parsed };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_VERIFIED_HOLE_PICKS;
  });

  const currentHole = roundState.holes[roundState.currentHoleIndex] || roundState.holes[0];

  useEffect(() => {
    if (roundState.windCondition && roundState.windCondition !== caddieScenario) {
      setCaddieScenario(roundState.windCondition);
    }
  }, [roundState.windCondition]);

  useEffect(() => {
    setSlotOverrides({});
    setFlippedCardIds({});
  }, [roundState.currentHoleIndex, roundState.courseKey, stabilityFilter]);

  const activePlayerIds = roundState.activePlayerIds || roster.map((r) => r.id);
  const activePlayers = roster.filter((r) => activePlayerIds.includes(r.id));

  const currentCourseTemplate = courses.find(
    (c) =>
      c.key === roundState.courseKey ||
      c.name.toLowerCase() === roundState.courseName.toLowerCase()
  );
  const currentHoleHint = currentCourseTemplate?.holes.find(
    (h) => h.number === currentHole.number
  )?.hint;

  const caddyInsight = getHoleCaddyInsights(
    roundState.courseName,
    currentHole.number,
    history,
    activePlayerIds
  );

  const holeOutlineSpec = getHoleVisualOutlineSpec(
    roundState.courseKey || roundState.courseName,
    currentHole.number,
    currentHole.distance,
    currentHole.par,
    currentHoleHint
  );

  const resolveBagDiscFromHoleHistory = (
    discId: string | null | undefined,
    discName: string | null | undefined
  ): DiscItem | null => {
    if (discId) {
      const exactId = bag.find((d) => d.id === discId);
      if (exactId) return exactId;
    }
    if (!discName) return null;
    const norm = discName.trim().toLowerCase();
    const aliasMap: Record<string, string> = {
      'halo it': 'innova-it',
      it: 'innova-it',
      'halo star it': 'innova-it',
      roc: 'innova-sugar-glow-roc',
      'dx glow roc': 'innova-sugar-glow-roc',
      'sugar high dx glow roc': 'innova-sugar-glow-roc',
      'classic glow roc': 'innova-classic-glow-roc',
      'glow roc': 'innova-sugar-glow-roc',
      sync: 'innova-halloween-sync',
      'star sync': 'innova-halloween-sync',
      'halloween sync': 'innova-halloween-sync',
      'halloween star sync': 'innova-halloween-sync',
      alien: 'innova-dx-alien',
      'dx alien': 'innova-dx-alien',
      archangel: 'innova-hot-pink-archangel',
      'dx archangel': 'innova-hot-pink-archangel',
      'hot pink archangel': 'innova-hot-pink-archangel',
      wraith: 'innova-halo-wraith',
      'halo wraith': 'innova-halo-wraith',
      'classic glow wraith': 'innova-classic-glow-wraith',
      destroyer: 'innova-halo-destroyer',
      'halo destroyer': 'innova-halo-destroyer',
      firebird: 'innova-luster-firebird',
      'luster firebird': 'innova-luster-firebird',
      beast: 'innova-classic-glow-beast',
      eagle: 'innova-champion-eagle',
      'champion eagle': 'innova-champion-eagle',
      teebird: 'innova-glow-teebird',
      'glow teebird': 'innova-glow-teebird',
      leopard3: 'innova-glow-leopard3',
      'glow leopard3': 'innova-glow-leopard3',
      rollo: 'innova-sugar-star-rollo',
      'star rollo': 'innova-sugar-star-rollo',
      roadrunner: 'innova-sugar-star-roadrunner',
      'star roadrunner': 'innova-sugar-star-roadrunner',
      nova: 'innova-xt-glow-nova',
      'xt glow nova': 'innova-xt-glow-nova',
      'kc pro aviar': 'innova-kc-pro-aviar',
      'proto glow aviar': 'innova-proto-glow-aviar',
      'yeti pro aviar': 'innova-yeti-pro-aviar',
      mako3: 'innova-proto-glow-mako3',
      'proto glow mako3': 'innova-proto-glow-mako3',
      'glow mako3': 'innova-proto-glow-mako3'
    };
    if (aliasMap[norm]) {
      const mapped = bag.find((d) => d.id === aliasMap[norm]);
      if (mapped) return mapped;
    }
    return (
      bag.find(
        (d) =>
          d.name.toLowerCase() === norm ||
          `${d.plastic} ${d.name}`.toLowerCase() === norm
      ) || null
    );
  };

  const jefferyHoleStats = caddyInsight.playerStats['jeffery'];
  const lastThrownHoleDisc = resolveBagDiscFromHoleHistory(
    jefferyHoleStats?.lastThrownDiscId,
    jefferyHoleStats?.lastDiscUsed
  );
  const bestThrownHoleDisc = resolveBagDiscFromHoleHistory(
    jefferyHoleStats?.bestThrownDiscId,
    jefferyHoleStats?.bestDiscUsed
  );

  const jefferyBag = bag.filter((d) => d.ownerId !== 'jack' && !d.archived);

  const caddieDecision = recommendDiscsByStability(
    stabilityFilter,
    currentHole.distance,
    caddieScenario,
    jefferyBag.length > 0 ? jefferyBag : bag.filter((d) => !d.archived),
    roundState.courseKey || roundState.courseName,
    currentHole.number
  );

  const jackRecommendedDisc = recommendJackDisc(currentHole.distance, bag);
  const isJackActive = activePlayerIds.includes('jack');

  const toggleJackInRound = () => {
    setRoundState((prev) => {
      const currentIds = prev.activePlayerIds || roster.map((r) => r.id);
      const hasJack = currentIds.includes('jack');
      const nextIds = hasJack
        ? currentIds.filter((id) => id !== 'jack')
        : [...currentIds, 'jack'];
      return {
        ...prev,
        activePlayerIds: nextIds.length > 0 ? nextIds : ['jeffery']
      };
    });
  };

  const formatDuration = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [hrs, mins, s].map((v) => String(v).padStart(2, '0')).join(':');
  };

  const getDefaultRecommendedDiscForCurrentHole = (): DiscItem | null => {
    const holeKey = getVerifiedHoleKey(
      roundState.courseKey || roundState.courseName,
      currentHole.number
    );
    const verifiedId = verifiedHolePicks[holeKey];
    if (verifiedId) {
      const verifiedFound = bag.find((d) => d.id === verifiedId && !d.archived);
      if (verifiedFound) return verifiedFound;
    }
    const tierIdx = caddieDecision.recommendedTierIndex;
    if (tierIdx === 0) return caddieDecision.primary;
    if (tierIdx === 1) return caddieDecision.secondary || caddieDecision.primary;
    return caddieDecision.finisher || caddieDecision.secondary || caddieDecision.primary;
  };

  const selectHoleThrownDisc = (playerId: string, disc: DiscItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playChainRattleSfx('tap');
    setRoundState((prev) => {
      const updatedHoles = prev.holes.map((h, idx) => {
        if (idx !== prev.currentHoleIndex) return h;
        const prevPlayerMeta = h.meta?.[playerId] || {};
        return {
          ...h,
          meta: {
            ...(h.meta || {}),
            [playerId]: {
              ...prevPlayerMeta,
              thrownDiscId: disc.id,
              discUsed: disc.name,
              scenarioUsed: caddieScenario,
              throws: [
                { shotType: 'tee', discId: disc.id },
                {
                  shotType: 'putt',
                  discId:
                    disc.id === 'innova-halloween-sync' || disc.id === 'innova-sync'
                      ? 'innova-halloween-sync'
                      : 'innova-kc-pro-aviar'
                }
              ]
            }
          }
        };
      });
      return { ...prev, holes: updatedHoles };
    });
  };

  const updateScore = (playerId: string, newScore: number) => {
    const clamped = Math.max(0, Math.min(15, newScore));
    const activePar = roundState.holes[roundState.currentHoleIndex]?.par ?? 3;
    if (clamped === 0) {
      playChainRattleSfx('tap');
    } else if (clamped < activePar) {
      playChainRattleSfx('birdie');
    } else if (clamped === activePar) {
      playChainRattleSfx('par');
    } else {
      playChainRattleSfx('bogey');
    }

    setRoundState((prev) => {
      const updatedHoles = prev.holes.map((h, idx) => {
        if (idx !== prev.currentHoleIndex) return h;
        return {
          ...h,
          scores: {
            ...h.scores,
            [playerId]: clamped
          }
        };
      });
      return { ...prev, holes: updatedHoles };
    });

    if (!timerState.running && clamped > 0) {
      onToggleTimer();
    }
  };

  const goToHole = (index: number) => {
    const safeIdx = Math.max(0, Math.min(roundState.holes.length - 1, index));
    setRoundState((prev) => ({ ...prev, currentHoleIndex: safeIdx }));
  };

  const clearCurrentRoundScores = () => {
    setRoundState((prev) => ({
      ...prev,
      currentHoleIndex: 0,
      date: new Date().toISOString().slice(0, 10),
      roundTranscript: '',
      holes: prev.holes.map((h) => ({
        ...h,
        scores: Object.fromEntries(activePlayerIds.map((id) => [id, 0])),
        meta: {},
        voiceTranscript: ''
      }))
    }));
    onResetTimer();
    setConfirmResetModal(false);
  };

  const liveStandings = activePlayers.map((player) => {
    let totalStrokes = 0;
    let parThru = 0;
    let holesCompleted = 0;
    let birdiesCount = 0;

    for (const h of roundState.holes) {
      const sc = h.scores[player.id] || 0;
      if (sc > 0) {
        totalStrokes += sc;
        parThru += h.par;
        holesCompleted++;
        if (sc < h.par) birdiesCount++;
      }
    }

    const relPar = totalStrokes - parThru;
    const coursePB = getCoursePersonalBest(roundState.courseName, player.id, history);

    return {
      player,
      totalStrokes,
      parThru,
      holesCompleted,
      relPar,
      birdiesCount,
      coursePB
    };
  });

  const totalHolesScoredAllPlayers = roundState.holes.filter((h) =>
    activePlayers.every((p) => (h.scores[p.id] || 0) > 0)
  ).length;

  const isAllHolesCompleted =
    roundState.holes.length > 0 &&
    totalHolesScoredAllPlayers === roundState.holes.length;

  const totalCoursePar = roundState.holes.reduce((sum, h) => sum + h.par, 0);
  const totalCourseDistance = roundState.holes.reduce((sum, h) => sum + h.distance, 0);

  const handleSaveRoundClick = async () => {
    await onSaveFinishedRound(false);
    setSaveConfirmBanner(
      'Round saved to History! Scorecard reset for your next round.'
    );
    setTimeout(() => setSaveConfirmBanner(null), 5000);
  };

  // High-Resolution PNG Scorecard Generator
  const handleDownloadScorecardPng = () => {
    const canvas = document.createElement('canvas');
    const width = 1000;
    const rowCount = roundState.holes.length;
    const hasNotes = Boolean(roundState.roundTranscript && roundState.roundTranscript.trim());
    const height = 340 + rowCount * 46 + (hasNotes ? 110 : 30);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0B0F1E');
    grad.addColorStop(1, '#151C32');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Top Accent Border
    ctx.fillStyle = '#FF2E93';
    ctx.fillRect(0, 0, width, 8);

    // Title & Course Info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${roundState.courseName}`, 40, 58);

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 18px monospace';
    const roundDate = roundState.date || new Date().toISOString().slice(0, 10);
    ctx.fillText(
      `Date: ${roundDate}   ·   Par ${totalCoursePar} (${totalCourseDistance.toLocaleString()} ft)   ·   Wind: ${caddieScenario.toUpperCase()}   ·   Time: ${formatDuration(elapsedSeconds)}`,
      40,
      92
    );

    // Player Totals Summary Boxes
    activePlayers.forEach((p, idx) => {
      const st = liveStandings.find((s) => s.player.id === p.id);
      const boxX = 40 + idx * 465;
      const boxY = 115;
      ctx.fillStyle = '#111629';
      ctx.strokeStyle = idx === 0 ? '#FF2E93' : '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, 445, 68, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${p.name}`, boxX + 20, boxY + 42);

      const relText = st && st.holesCompleted > 0 ? formatRelativePar(st.relPar) : 'E';
      ctx.fillStyle = idx === 0 ? '#FF2E93' : '#00F0FF';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(
        `${st?.totalStrokes || 0} (${relText})`,
        boxX + 275,
        boxY + 43
      );
    });

    // Table Header
    const tableTop = 215;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(40, tableTop, width - 80, 40);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('HOLE', 60, tableTop + 26);
    ctx.fillText('DIST', 190, tableTop + 26);
    ctx.fillText('PAR', 310, tableTop + 26);
    activePlayers.forEach((p, idx) => {
      ctx.fillStyle = idx === 0 ? '#FF2E93' : '#00F0FF';
      ctx.fillText(p.name.toUpperCase(), 450 + idx * 230, tableTop + 26);
    });

    // Hole Rows
    roundState.holes.forEach((h, i) => {
      const y = tableTop + 40 + i * 44;
      ctx.fillStyle = i % 2 === 0 ? '#0F172A' : '#131B2E';
      ctx.fillRect(40, y, width - 80, 44);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px monospace';
      const discNote = h.meta?.jeffery?.discUsed ? ` (${h.meta.jeffery.discUsed})` : '';
      ctx.fillText(`#${h.number}${discNote}`, 60, y + 28);

      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`${h.distance}ft`, 190, y + 28);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(`${h.par}`, 310, y + 28);

      activePlayers.forEach((p, idx) => {
        const sc = h.scores[p.id] || 0;
        const diff = sc - h.par;
        ctx.fillStyle =
          sc === 0
            ? '#64748B'
            : diff < 0
            ? '#39FF14'
            : diff === 0
            ? '#00F0FF'
            : '#FF9E00';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(
          sc > 0 ? `${sc}${diff < 0 ? ' ★' : ''}` : '—',
          450 + idx * 230,
          y + 28
        );
      });
    });

    // Total Row
    const footerY = tableTop + 40 + rowCount * 44;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(40, footerY, width - 80, 48);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('TOTAL', 60, footerY + 30);
    ctx.fillStyle = '#00F0FF';
    ctx.fillText(`${totalCourseDistance}ft`, 190, footerY + 30);
    ctx.fillStyle = '#39FF14';
    ctx.fillText(`${totalCoursePar}`, 310, footerY + 30);

    liveStandings.forEach((st, idx) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(
        `${st.totalStrokes || 0} (${formatRelativePar(st.relPar)})`,
        450 + idx * 230,
        footerY + 30
      );
    });

    if (hasNotes && roundState.roundTranscript) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 14px sans-serif';
      const cleanNote = roundState.roundTranscript.replace(/\s+/g, ' ').slice(0, 130);
      ctx.fillText(`Notes: ${cleanNote}`, 40, footerY + 82);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Scorecard-${roundState.courseName.replace(/\s+/g, '-')}-${roundDate}.png`;
    a.click();
  };

  const lastFinalRound = history[0];

  // If no current round has been started yet, display the Last Final Round Scorecard
  if (!hasActiveRound && lastFinalRound) {
    const lastRoundPar =
      lastFinalRound.par ||
      lastFinalRound.holes.reduce((sum, h) => sum + (h.par || 3), 0);
    const lastRoundDist = lastFinalRound.holes.reduce(
      (sum, h) => sum + (h.distance || 0),
      0
    );

    return (
      <div className="space-y-5">
        {/* Top Banner: No Live Round Started -> Showing Last Final Round Scorecard */}
        <div className="neon-card border-2 border-[#FACC15] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-0.5 rounded-lg bg-[#FACC15] text-slate-950 text-[11px] font-extrabold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Last Final Round Scorecard</span>
              </div>
              <h1 className="font-display text-lg sm:text-xl font-extrabold uppercase text-white pt-1 break-words">
                {lastFinalRound.courseName} — {lastFinalRound.date}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300 font-mono-tabular">
                <span className="font-bold text-[#39FF14]">Par {lastRoundPar}</span>
                <span>·</span>
                <span className="font-bold text-[#00F0FF]">
                  {lastRoundDist.toLocaleString()} ft
                </span>
                {lastFinalRound.duration && (
                  <>
                    <span>·</span>
                    <span className="font-bold text-[#FACC15]">
                      ⏱ {lastFinalRound.duration}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {onStartNewRoundSetup && (
                <button
                  type="button"
                  onClick={onStartNewRoundSetup}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 neon-border-lime"
                >
                  <Play className="w-4 h-4 fill-current shrink-0" />
                  <span>+ Start New Round Setup</span>
                </button>
              )}
              {onStartActiveRound && (
                <button
                  type="button"
                  onClick={onStartActiveRound}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5"
                >
                  <span>Score New Round on {roundState.courseName} Now →</span>
                </button>
              )}
            </div>
          </div>

          {/* Player Final Totals Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            {lastFinalRound.players.map((p) => {
              const rel = p.total - lastRoundPar;
              const birdies = lastFinalRound.holes.filter(
                (h) => (h.scores[p.id] || 0) > 0 && h.scores[p.id] < h.par
              ).length;
              const pars = lastFinalRound.holes.filter(
                (h) => (h.scores[p.id] || 0) === h.par
              ).length;
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-[#080B14] border border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm sm:text-base font-extrabold text-white">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-300 font-mono-tabular mt-0.5">
                      {birdies} {birdies === 1 ? 'Birdie' : 'Birdies'} · {pars}{' '}
                      {pars === 1 ? 'Par' : 'Pars'}
                    </div>
                  </div>
                  <div className="text-right font-mono-tabular">
                    <div className="text-xl sm:text-2xl font-extrabold text-[#39FF14]">
                      {p.total}{' '}
                      <span className="text-sm text-[#00F0FF]">
                        ({formatRelativePar(rel)})
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400">
                      FINAL SCORE
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Broadcast Scorecard Horizontal Ticker for Last Final Round */}
        <BroadcastScorecardTicker
          courseName={lastFinalRound.courseName}
          date={lastFinalRound.date}
          holes={lastFinalRound.holes}
          currentHoleIndex={0}
          activePlayers={lastFinalRound.players.map((p) => ({
            id: p.id,
            name: p.name,
            tag: p.tag
          }))}
          onSelectHole={() => {
            if (onStartActiveRound) onStartActiveRound();
          }}
        />

        {/* Full 9-Hole Final Scorecard Table for Last Round */}
        <div className="neon-card border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Final Hole-by-Hole Scorecard · {lastFinalRound.courseName} ({lastFinalRound.date})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono-tabular text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-[#00F0FF] bg-[#080B14]">
                  <th className="py-2.5 px-3">Hole</th>
                  <th className="py-2.5 px-3">Par</th>
                  <th className="py-2.5 px-3">Dist</th>
                  {lastFinalRound.players.map((p) => (
                    <th key={p.id} className="py-2.5 px-3 text-center">
                      {p.name}
                    </th>
                  ))}
                  <th className="py-2.5 px-3">Thrown Disc / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {lastFinalRound.holes.map((h) => {
                  const teeThrowId = h.meta?.jeffery?.throws?.find(
                    (t) => t.shotType === 'tee'
                  )?.discId;
                  const thrownId = teeThrowId || h.meta?.jeffery?.thrownDiscId;
                  const usedName = h.meta?.jeffery?.discUsed;
                  const thrownDisc =
                    (thrownId ? bag.find((d) => d.id === thrownId) : undefined) ||
                    (usedName
                      ? bag.find(
                          (d) =>
                            d.name.toLowerCase() === usedName.toLowerCase() ||
                            (usedName.toLowerCase() === 'xero' && d.id === 'innova-sync')
                        )
                      : undefined);
                  return (
                    <tr key={h.number} className="hover:bg-white/5">
                      <td className="py-2.5 px-3 font-extrabold text-white">
                        #{h.number}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{h.par}</td>
                      <td className="py-2.5 px-3 text-[#00F0FF] font-bold">
                        {h.distance} ft
                      </td>
                      {lastFinalRound.players.map((p) => {
                        const sc = h.scores[p.id] || h.par;
                        const diff = sc - h.par;
                        return (
                          <td key={p.id} className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-lg font-extrabold ${
                                diff < 0
                                  ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]'
                                  : diff === 0
                                  ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/50'
                                  : 'bg-[#FF2E93]/20 text-[#FF2E93] border border-[#FF2E93]/60'
                              }`}
                            >
                              {sc}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 font-sans text-xs text-slate-200">
                        {thrownDisc ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#080B14] border border-slate-700 font-bold text-white mr-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: thrownDisc.colorHex }}
                            />
                            {thrownDisc.name}
                          </span>
                        ) : null}
                        {h.voiceTranscript && (
                          <span className="text-slate-300">{h.voiceTranscript}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#00F0FF] bg-[#080B14] font-extrabold text-white">
                  <td className="py-3 px-3">TOTAL</td>
                  <td className="py-3 px-3 text-[#39FF14]">{lastRoundPar}</td>
                  <td className="py-3 px-3 text-[#00F0FF]">
                    {lastRoundDist.toLocaleString()} ft
                  </td>
                  {lastFinalRound.players.map((p) => {
                    const rel = p.total - lastRoundPar;
                    return (
                      <td
                        key={p.id}
                        className="py-3 px-3 text-center text-[#39FF14] text-sm sm:text-base"
                      >
                        {p.total} ({formatRelativePar(rel)})
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 font-sans text-xs text-[#FACC15]">
                    Completed {lastFinalRound.date}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Course Header & Stopwatch Bar */}
      <div className="neon-card border border-[#00F0FF]/40 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="font-display text-lg sm:text-xl font-extrabold uppercase text-white break-words">
              {roundState.courseName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300">
              <span className="font-mono-tabular font-bold text-[#39FF14]">
                Par {totalCoursePar}
              </span>
              <span aria-hidden="true" className="text-slate-500">
                ·
              </span>
              <span className="font-mono-tabular text-[#00F0FF] font-bold">
                {totalCourseDistance.toLocaleString()} ft
              </span>
              {(() => {
                const jeffPB = getCoursePersonalBest(roundState.courseName, 'jeffery', history);
                if (jeffPB.bestTotal === null) return null;
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#39FF14]/15 border border-[#39FF14] text-[#39FF14] font-mono-tabular text-xs font-extrabold">
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Course PB: {jeffPB.bestTotal} ({formatRelativePar(jeffPB.bestRelPar || 0)}) · Avg {jeffPB.avgTotal}
                    </span>
                  </span>
                );
              })()}
            </div>
          </div>

            {/* Solo / Duo Toggle & Stopwatch Timer */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            <button
              type="button"
              onClick={handleCopyLiveNotesHeader}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl font-extrabold text-xs bg-[#FACC15] hover:bg-[#FACC15]/90 text-slate-950 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 shrink-0" />
              <span>{notesHeaderCopied ? '✅ Header Copied!' : '📋 Copy Notes Header'}</span>
            </button>
            <button
              type="button"
              onClick={toggleJackInRound}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isJackActive
                  ? 'bg-[#080B14] text-[#00F0FF] border-[#00F0FF]/60 hover:bg-[#00F0FF]/15'
                  : 'bg-[#FF2E93] text-white border-[#FF2E93] neon-border-pink'
              }`}
            >
              <span>
                {isJackActive ? '👥 Duo: Jeffery & Jack' : '👤 Solo: Jeffery Only'}
              </span>
            </button>

            <div className="flex items-center gap-1.5 bg-[#080B14] border-2 border-[#FACC15] text-white px-3 py-1 rounded-xl shadow-sm">
              <span className="font-mono-tabular text-sm sm:text-base font-extrabold tracking-wider px-1 text-[#FACC15]">
                ⏱ {formatDuration(elapsedSeconds)}
              </span>
              <button
                type="button"
                onClick={onToggleTimer}
                title={timerState.running ? 'Pause Round Timer' : 'Start Round Timer'}
                className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg bg-[#FACC15] hover:bg-[#FACC15]/85 text-slate-950 font-bold transition-colors"
              >
                {timerState.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetModal(true)}
                title="Reset Round Scores & Timer"
                className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg bg-white/10 hover:bg-[#FF2E93]/30 text-slate-200 hover:text-[#FF2E93] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {saveConfirmBanner && (
          <div className="p-3 rounded-xl bg-[#39FF14]/15 border border-[#39FF14] text-[#39FF14] text-xs sm:text-sm font-bold flex items-center justify-between">
            <span>{saveConfirmBanner}</span>
            <button
              type="button"
              onClick={() => setSaveConfirmBanner(null)}
              className="underline ml-4 whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        )}

        {confirmResetModal && (
          <div className="p-3.5 rounded-xl bg-[#FF2E93]/15 border border-[#FF2E93] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-semibold text-white">
              Clear all scores on the current {roundState.courseName} scorecard and reset the round
              timer to 00:00:00?
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmResetModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#080B14] border border-slate-700 rounded-lg hover:bg-slate-800 whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={clearCurrentRoundScores}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#FF2E93] rounded-lg hover:bg-[#FF2E93]/80 whitespace-nowrap"
              >
                Clear Card &amp; Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Scorecard & Telemetry Horizontal Ticker */}
      <BroadcastScorecardTicker
        courseName={roundState.courseName}
        date={roundState.date}
        holes={roundState.holes}
        currentHoleIndex={roundState.currentHoleIndex}
        activePlayers={activePlayers}
        onSelectHole={(idx) => goToHole(idx)}
      />

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols): Active Hole Top-First Touch Scoring & 3 Flippable Collector Cards Below */}
        <div className="lg:col-span-7 space-y-5">
          <div className="neon-card border border-[#FF2E93]/40 rounded-2xl p-5 sm:p-6 space-y-4">
            {/* 1. TOP-FIRST ACTIVE HOLE HEADER + PREV / NEXT HOLE NAVIGATION */}
            <div className="pb-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-white whitespace-nowrap">
                  Hole <span className="text-[#FF2E93]">{currentHole.number}</span>
                </h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono-tabular whitespace-nowrap">
                  <span className="font-bold text-[#39FF14]">Par {currentHole.par}</span>
                  <span aria-hidden="true" className="text-slate-500">
                    ·
                  </span>
                  <span className="font-bold text-[#00F0FF]">{currentHole.distance} ft</span>
                </div>
              </div>

              {/* Prev / Next Hole Navigation right at the top */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={roundState.currentHoleIndex === 0}
                  onClick={() => goToHole(roundState.currentHoleIndex - 1)}
                  className="min-h-[42px] px-3.5 rounded-xl border border-slate-700 bg-[#080B14] hover:border-[#00F0FF] disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ChevronLeft className="w-4 h-4 text-[#00F0FF]" />
                  <span>Hole {Math.max(1, currentHole.number - 1)}</span>
                </button>

                {roundState.currentHoleIndex < roundState.holes.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => goToHole(roundState.currentHoleIndex + 1)}
                    className="min-h-[42px] px-4 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/85 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap neon-border-cyan"
                  >
                    <span>Next: Hole {currentHole.number + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : isAllHolesCompleted ? (
                  <button
                    type="button"
                    onClick={handleSaveRoundClick}
                    className="min-h-[42px] px-4 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/85 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap neon-border-lime"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish &amp; Log Round</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono-tabular font-bold text-slate-500 px-2">
                    H{currentHole.number}/{roundState.holes.length}
                  </span>
                )}
              </div>
            </div>

            {/* 1B. BASIC HOLE LAYOUT & FAIRWAY OUTLINE MAP (UDISC-STYLE TEE SIGN) */}
            <HoleLayoutOutlineWidget
              courseKey={roundState.courseKey || roundState.courseName}
              holeNumber={currentHole.number}
              par={currentHole.par}
              distanceFeet={currentHole.distance}
              spec={holeOutlineSpec}
            />

            {/* 2. PLAYER TOUCH SCORE CONTROLS AT VERY TOP (ZERO SCROLLING REQUIRED) */}
            <div className="space-y-3">
              {activePlayers.map((player, pIdx) => {
                const score = currentHole.scores[player.id] || 0;
                const scoreTerm = getScoreTerm(score, currentHole.par);
                const playerStanding = liveStandings.find((s) => s.player.id === player.id);
                const holeMeta = currentHole.meta?.[player.id] || {};
                const playerNeonAccent = pIdx === 0 ? '#FF2E93' : '#00F0FF';
                const playerHoleStats = caddyInsight.playerStats[player.id];

                return (
                  <div
                    key={player.id}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-800 bg-[#080B14] transition-colors space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="font-mono-tabular text-xs sm:text-sm font-bold"
                            style={{ color: playerNeonAccent }}
                          >
                            {player.tag || player.name.slice(0, 2).toUpperCase()}
                          </span>
                          <h3 className="text-base sm:text-lg font-extrabold text-white">
                            {player.name}
                          </h3>
                          <span className="text-xs text-slate-500" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono-tabular text-xs sm:text-sm font-bold text-slate-300">
                            Round: {playerStanding?.totalStrokes || 0} (
                            {formatRelativePar(playerStanding?.relPar || 0)})
                          </span>
                        </div>

                        {/* Direct On-Card Hole History (Last Time & Hole Best right where you enter the score!) */}
                        <div className="flex flex-wrap items-center gap-1.5 font-mono-tabular text-xs">
                          {playerHoleStats && playerHoleStats.lastScore !== null ? (
                            <>
                              <span className="px-2 py-0.5 rounded-md bg-[#FACC15]/20 border border-[#FACC15] text-[#FACC15] font-extrabold">
                                Last H#{currentHole.number}: {playerHoleStats.lastScore} (
                                {formatRelativePar(
                                  playerHoleStats.lastScore - currentHole.par
                                )}
                                )
                                {playerHoleStats.lastDiscUsed
                                  ? ` · ${playerHoleStats.lastDiscUsed}`
                                  : ''}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#39FF14]/20 border border-[#39FF14] text-[#39FF14] font-extrabold">
                                Best: {playerHoleStats.bestScore} (
                                {formatRelativePar(
                                  (playerHoleStats.bestScore || currentHole.par) -
                                    currentHole.par
                                )}
                                )
                              </span>
                              {playerHoleStats.recentScores.length > 1 && (
                                <span className="px-2 py-0.5 rounded-md bg-[#111629] border border-slate-700 text-slate-300 font-bold">
                                  Recent: {playerHoleStats.recentScores.join(' · ')}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 font-semibold">
                              First time scoring Hole #{currentHole.number}
                            </span>
                          )}
                        </div>

                        {(score > 0 || holeMeta.discUsed) && (
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            {score > 0 && (
                              <span className={`font-bold ${scoreTerm.textColor}`}>
                                {scoreTerm.label} ({formatRelativePar(score - currentHole.par)})
                              </span>
                            )}
                            {holeMeta.discUsed && (
                              <span className="inline-flex items-center gap-1 font-bold text-[#39FF14]">
                                <Disc className="w-3.5 h-3.5 text-[#39FF14]" />
                                Threw: {holeMeta.discUsed}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quick Score Buttons (Birdie, Par, Bogey) + Touch Stepper */}
                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateScore(player.id, Math.max(1, currentHole.par - 1))
                            }
                            className={`min-h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap ${
                              score === currentHole.par - 1 && score > 0
                                ? 'bg-[#39FF14] text-slate-950 border-[#39FF14]'
                                : 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/60 hover:bg-[#39FF14]/25'
                            }`}
                          >
                            Birdie ({currentHole.par - 1})
                          </button>
                          <button
                            type="button"
                            onClick={() => updateScore(player.id, currentHole.par)}
                            className={`min-h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap ${
                              score === currentHole.par
                                ? 'bg-[#00F0FF] text-slate-950 border-[#00F0FF]'
                                : 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/60 hover:bg-[#00F0FF]/25'
                            }`}
                          >
                            Par ({currentHole.par})
                          </button>
                          <button
                            type="button"
                            onClick={() => updateScore(player.id, currentHole.par + 1)}
                            className={`min-h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap ${
                              score === currentHole.par + 1
                                ? 'bg-[#FF9E00] text-slate-950 border-[#FF9E00]'
                                : 'bg-[#FF9E00]/15 text-[#FF9E00] border-[#FF9E00]/60 hover:bg-[#FF9E00]/25'
                            }`}
                          >
                            Bogey ({currentHole.par + 1})
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={`Decrease ${player.name} score`}
                            onClick={() =>
                              updateScore(
                                player.id,
                                score === 0 ? currentHole.par - 1 : score - 1
                              )
                            }
                            className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-700 bg-[#111629] hover:border-[#00F0FF] active:scale-95 text-white font-mono-tabular text-xl font-bold flex items-center justify-center transition-transform"
                          >
                            −
                          </button>

                          <div
                            className={`min-w-[52px] min-h-[44px] px-2 rounded-xl border-2 ${scoreTerm.borderColor} ${scoreTerm.bgColor} flex flex-col items-center justify-center`}
                          >
                            <span
                              className={`font-mono-tabular text-2xl font-bold leading-none ${scoreTerm.textColor}`}
                            >
                              {score > 0 ? score : '—'}
                            </span>
                          </div>

                          <button
                            type="button"
                            aria-label={`Increase ${player.name} score`}
                            onClick={() =>
                              updateScore(
                                player.id,
                                score === 0 ? currentHole.par : score + 1
                              )
                            }
                            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#FF2E93] hover:bg-[#FF2E93]/85 active:scale-95 text-white font-mono-tabular text-xl font-bold flex items-center justify-center transition-transform"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2B. "WHAT I THREW LAST TIME ON THIS HOLE" COLLECTOR CARD SPOTLIGHT */}
            {lastThrownHoleDisc && jefferyHoleStats && (
              <div className="rangefinder-keep-dark rounded-2xl border-2 border-[#FACC15]/70 bg-gradient-to-br from-[#141106] via-[#0B0F1A] to-[#080B14] p-3.5 sm:p-4 space-y-2.5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FACC15] text-slate-950 font-mono-tabular text-[11px] font-extrabold uppercase tracking-wider">
                      🕘 Thrown Last Time on Hole #{currentHole.number}
                    </span>
                    {jefferyHoleStats.lastDate && (
                      <span className="text-xs font-mono-tabular font-bold text-amber-200/90">
                        {jefferyHoleStats.lastDate}
                      </span>
                    )}
                  </div>

                  {jefferyHoleStats.lastScore !== null && (
                    <span
                      className={`px-2.5 py-0.5 rounded-lg font-mono-tabular text-xs font-extrabold border ${
                        jefferyHoleStats.lastScore < currentHole.par
                          ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
                          : jefferyHoleStats.lastScore === currentHole.par
                          ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                          : 'bg-[#FF9E00]/20 border-[#FF9E00] text-[#FF9E00]'
                      }`}
                    >
                      Last Score: {jefferyHoleStats.lastScore} (
                      {formatRelativePar(jefferyHoleStats.lastScore - currentHole.par)})
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-3.5">
                  {/* Collector Card Thumbnail (Tap to View in Bag Guide or Flip) */}
                  <div
                    onClick={() => {
                      if (onOpenBagGuide) {
                        onOpenBagGuide(lastThrownHoleDisc.id, 'jeffery');
                      } else {
                        toggleFlipCard(`last_${lastThrownHoleDisc.id}`);
                      }
                    }}
                    className="w-[136px] sm:w-[146px] shrink-0 rounded-xl border-2 p-1.5 bg-[#070A14] cursor-pointer hover:scale-[1.02] transition-transform shadow-md flex flex-col justify-between gap-1"
                    style={{ borderColor: lastThrownHoleDisc.colorHex || '#FACC15' }}
                    title="Tap to inspect full Collector Card"
                  >
                    <div className="aspect-[896/1200] w-full overflow-hidden rounded-lg bg-[#04060C] border border-white/10 relative">
                      {getDiscCardImageUrl(lastThrownHoleDisc) && (
                        <img
                          src={getDiscCardImageUrl(lastThrownHoleDisc) || undefined}
                          alt={`${lastThrownHoleDisc.name} Collector Card`}
                          className="w-full h-full object-cover object-center"
                        />
                      )}
                    </div>
                    <div className="text-center font-mono-tabular text-[10px] font-extrabold text-[#FACC15] truncate">
                      {lastThrownHoleDisc.cardNumber || lastThrownHoleDisc.brand}
                    </div>
                  </div>

                  {/* Right Details: Title, Flight Numbers, Last Round Commentary & 1-Tap Throw Again */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5 w-full">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-mono-tabular font-extrabold uppercase tracking-wider text-[#00F0FF]">
                            {lastThrownHoleDisc.slotCategory}
                          </div>
                          <h4 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                            {formatDiscCardTitle(lastThrownHoleDisc)}
                          </h4>
                        </div>
                        <span className="font-mono-tabular text-xs font-bold text-slate-300 bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded-md">
                          {lastThrownHoleDisc.idealMinFeet}–{lastThrownHoleDisc.idealMaxFeet} ft
                        </span>
                      </div>

                      <div className="max-w-[260px]">
                        <FlightReadoutBar
                          speed={lastThrownHoleDisc.speed}
                          glide={lastThrownHoleDisc.glide}
                          turn={lastThrownHoleDisc.turn}
                          fade={lastThrownHoleDisc.fade}
                          compact
                        />
                      </div>

                      {jefferyHoleStats.lastVoiceNote ? (
                        <div className="p-2.5 rounded-xl bg-[#0E1424] border border-amber-400/30 text-xs text-slate-200 leading-relaxed">
                          <span className="font-mono-tabular font-extrabold text-[#FACC15] uppercase mr-1.5">
                            Last H#{currentHole.number} Log:
                          </span>
                          {jefferyHoleStats.lastVoiceNote}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-[#0E1424] border border-slate-800 text-xs text-slate-300 leading-snug">
                          {buildLivePersonalFlightProfile(lastThrownHoleDisc, history).howItFliesForMe}
                        </div>
                      )}

                      {bestThrownHoleDisc &&
                        bestThrownHoleDisc.id !== lastThrownHoleDisc.id &&
                        jefferyHoleStats.bestScore !== null &&
                        (jefferyHoleStats.lastScore === null ||
                          jefferyHoleStats.bestScore < jefferyHoleStats.lastScore) && (
                          <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/40 text-xs">
                            <span className="text-emerald-200 font-semibold">
                              🏆 Hole #{currentHole.number} Best ({jefferyHoleStats.bestScore}):{' '}
                              <strong className="text-[#39FF14]">
                                {formatDiscCardTitle(bestThrownHoleDisc)}
                              </strong>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => selectHoleThrownDisc('jeffery', bestThrownHoleDisc, e)}
                              className="px-2 py-0.5 rounded bg-[#39FF14] text-slate-950 font-extrabold text-[11px] hover:bg-[#39FF14]/85"
                            >
                              Log {bestThrownHoleDisc.name}
                            </button>
                          </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {(() => {
                        const isAlreadySelected =
                          currentHole.meta?.jeffery?.thrownDiscId === lastThrownHoleDisc.id ||
                          currentHole.meta?.jeffery?.discUsed?.toLowerCase() ===
                            lastThrownHoleDisc.name.toLowerCase();
                        return (
                          <button
                            type="button"
                            onClick={(e) => selectHoleThrownDisc('jeffery', lastThrownHoleDisc, e)}
                            className={`flex-1 min-h-[40px] px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                              isAlreadySelected
                                ? 'bg-[#39FF14] text-slate-950 border-2 border-[#39FF14]'
                                : 'bg-[#FACC15] hover:bg-[#FACC15]/90 text-slate-950 border border-[#FACC15]'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>
                              {isAlreadySelected
                                ? `Logged ${lastThrownHoleDisc.name} on Hole #${currentHole.number}`
                                : `Throw ${lastThrownHoleDisc.name} Again on Hole #${currentHole.number}`}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2B. INTERACTIVE RHBH SHOT FINDER (DISTANCE + LEFT / STRAIGHT / RIGHT BACKHAND CADDIE) */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setShowShotFinder((v) => !v);
                }}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-between gap-2 zine-pill-btn transition-all ${
                  showShotFinder
                    ? 'bg-[#FF2E93] text-white'
                    : 'bg-[#00F0FF] text-slate-950'
                }`}
              >
                <span className="flex items-center gap-2 text-left">
                  <span>🎯 RHBH Shot Finder · Dial Distance + Go Left / Straight / Right</span>
                </span>
                <span className="font-mono-tabular text-[11px] uppercase shrink-0">
                  {showShotFinder ? 'Hide ▲' : `Open (${currentHole.distance} ft) ▼`}
                </span>
              </button>

              {showShotFinder && (
                <RhbhShotFinder
                  bag={bag}
                  initialDistanceFeet={currentHole.distance}
                  initialWind={caddieScenario}
                  holeNumber={currentHole.number}
                  holeDistanceFeet={currentHole.distance}
                  selectedDiscIdOnHole={currentHole.meta?.jeffery?.thrownDiscId}
                  onSelectDiscForHole={(disc) => selectHoleThrownDisc('jeffery', disc)}
                  onOpenDiscCard={
                    onOpenBagGuide
                      ? (discId) => onOpenBagGuide(discId, 'jeffery')
                      : undefined
                  }
                  onClose={() => setShowShotFinder(false)}
                  compact
                />
              )}
            </div>

            {/* 3. TEE-BOX CARD RECOMMENDATIONS BELOW SCORING (FLIPPABLE 3D COLLECTOR CARDS: 1. DRIVER -> 2. MID-RANGE -> 3. PUTTER) */}
            {caddieDecision.primary && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Disc
                      className="w-4 h-4 shrink-0"
                      style={{ color: caddieDecision.primary.colorHex }}
                    />
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Recommended Cards · Tap Any Card to Flip ↻
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* 4-Mode Stability Flipper */}
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-[#111629] border border-slate-800 rounded-lg">
                      {(
                        [
                          { id: 'hole_match', label: '★ By Yardage' },
                          { id: 'understable', label: 'Understable' },
                          { id: 'stable', label: 'Stable' },
                          { id: 'overstable', label: 'Overstable' }
                        ] as const
                      ).map((stTab) => (
                        <button
                          key={stTab.id}
                          type="button"
                          onClick={() => setStabilityFilter(stTab.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-extrabold transition-colors whitespace-nowrap shrink-0 ${
                            stabilityFilter === stTab.id
                              ? 'bg-[#FF2E93] text-white shadow-sm'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {stTab.label}
                        </button>
                      ))}
                    </div>

                    {onOpenBagGuide && (
                      <button
                        type="button"
                        onClick={() => onOpenBagGuide(caddieDecision.primary?.id, 'jeffery')}
                        className="text-xs font-bold text-[#00F0FF] hover:underline whitespace-nowrap"
                      >
                        All Cards →
                      </button>
                    )}
                  </div>
                </div>

                {/* 🫖 PERSONAL SWING CUES PIN-BAR (21 / -6 PB KEYS) */}
                <div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <span>🎯 My 21 (-6 PB) Swing &amp; Putting Cues</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSwingCues((v) => !v)}
                      className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline"
                    >
                      {showSwingCues ? 'Hide Cues' : 'Show Cues'}
                    </button>
                  </div>
                  {showSwingCues && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-[11px]">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <div className="font-extrabold text-slate-900">
                          1. 🫖 &ldquo;Heavy Tea-Kettle&rdquo; Grip
                        </div>
                        <p className="text-slate-600 leading-snug mt-0.5">
                          Align disc down center of forearm &amp; pull straight across chest (eliminates left hyzer dump).
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <div className="font-extrabold text-slate-900">
                          2. 📐 Dynamic 90° Pull-Through Pocket
                        </div>
                        <p className="text-slate-600 leading-snug mt-0.5">
                          Stay upright &amp; pull straight across chest into the 90° pocket smoothly (don&apos;t freeze rigid on setup—keep tea-kettle down low!).
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <div className="font-extrabold text-slate-900">
                          3. ⛓️ C1 Putting Key
                        </div>
                        <p className="text-slate-600 leading-snug mt-0.5">
                          Index finger off rim, weight on front foot—step up and stroke straight through chains.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3-Column Flippable Collector Cards: 1. Driver -> 2. Mid-Range -> 3. Putter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    {
                      slotKey: 'driverId' as const,
                      slotLabel: '1. DRIVER',
                      badgeColor: '#FF2E93',
                      disc:
                        (slotOverrides.driverId &&
                          bag.find(
                            (d) => d.id === slotOverrides.driverId && !d.archived
                          )) ||
                        caddieDecision.primary,
                      alts: caddieDecision.driverAlts,
                      note: caddieDecision.shotCallout
                    },
                    {
                      slotKey: 'midId' as const,
                      slotLabel: '2. MID-RANGE',
                      badgeColor: '#00F0FF',
                      disc:
                        (slotOverrides.midId &&
                          bag.find(
                            (d) => d.id === slotOverrides.midId && !d.archived
                          )) ||
                        caddieDecision.secondary,
                      alts: caddieDecision.midAlts,
                      note: caddieDecision.secondaryCallout
                    },
                    {
                      slotKey: 'putterId' as const,
                      slotLabel: '3. PUTTER',
                      badgeColor: '#39FF14',
                      disc:
                        (slotOverrides.putterId &&
                          bag.find(
                            (d) => d.id === slotOverrides.putterId && !d.archived
                          )) ||
                        caddieDecision.finisher,
                      alts: caddieDecision.putterAlts,
                      note: caddieDecision.finisherCallout
                    }
                  ].map((recItem, idx) => {
                    const d = recItem.disc;
                    if (!d) return null;
                    const holeKey = getVerifiedHoleKey(
                      roundState.courseKey || roundState.courseName,
                      currentHole.number
                    );
                    const verifiedDiscIdForHole = verifiedHolePicks[holeKey];
                    const isYardageMatchTier = caddieDecision.recommendedTierIndex === idx;
                    const isVerifiedPick =
                      stabilityFilter === 'hole_match'
                        ? verifiedDiscIdForHole === d.id || isYardageMatchTier
                        : isYardageMatchTier;

                    const customNote =
                      slotOverrides[recItem.slotKey] &&
                      slotOverrides[recItem.slotKey] !==
                        (idx === 0
                          ? caddieDecision.primary?.id
                          : idx === 1
                          ? caddieDecision.secondary?.id
                          : caddieDecision.finisher?.id)
                        ? d.courseStrategy
                        : recItem.note || currentHoleHint || d.courseStrategy;

                    const isFlipped = !!flippedCardIds[d.id];
                    const cardSrc = getDiscCardImageUrl(d);
                    const liveFlight = buildLivePersonalFlightProfile(d, history);
                    const cardFlightSvg = computeFlightPathSvg(d, caddieScenario, 'flat');
                    const isThrownOnCurrentHole =
                      currentHole.meta?.jeffery?.thrownDiscId === d.id ||
                      currentHole.meta?.jeffery?.discUsed?.toLowerCase() ===
                        d.name.toLowerCase();

                    // Yardage vs. Disc Carry Gauge math
                    const estCarry = cardFlightSvg.estimatedFeet;
                    const holeDist = currentHole.distance;
                    const carryDiff = estCarry - holeDist;
                    const gaugeMax = Math.max(holeDist, estCarry, 260) * 1.1;
                    const pinPct = Math.min(96, Math.max(8, Math.round((holeDist / gaugeMax) * 100)));
                    const carryPct = Math.min(98, Math.max(8, Math.round((estCarry / gaugeMax) * 100)));
                    const carryVerdict =
                      Math.abs(carryDiff) <= 22
                        ? {
                            label: `🎯 Pin-High Match (~${estCarry}ft carry vs ${holeDist}ft pin)`,
                            color: 'text-emerald-700 bg-emerald-50 border-emerald-300'
                          }
                        : carryDiff > 22
                        ? {
                            label: `⚡ Power Down ~${Math.max(
                              60,
                              Math.min(90, Math.round((holeDist / estCarry) * 100))
                            )}% (~${estCarry}ft carry vs ${holeDist}ft pin)`,
                            color: 'text-amber-800 bg-amber-50 border-amber-300'
                          }
                        : {
                            label: `💪 Full Send / Layup (~${estCarry}ft carry vs ${holeDist}ft pin)`,
                            color: 'text-sky-800 bg-sky-50 border-sky-300'
                          };
                    // SVG Pin Target Y coordinate (tee is y=290, endY is scaled by estimatedFeet)
                    const pinSvgY = Math.max(
                      28,
                      Math.min(
                        280,
                        Math.round(
                          290 -
                            ((290 - cardFlightSvg.endY) * holeDist) /
                              Math.max(100, estCarry)
                        )
                      )
                    );

                    return (
                      <div
                        key={`${recItem.slotLabel}-${d.id}-${idx}`}
                        className={`p-2.5 rounded-2xl bg-[#080B14] flex flex-col justify-between space-y-2 transition-all ${
                          isThrownOnCurrentHole
                            ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/30'
                            : isVerifiedPick
                            ? 'border-2 border-[#39FF14] ring-1 ring-[#39FF14]/40'
                            : 'border border-slate-300'
                        }`}
                      >
                        {/* Slot Header & Mold Switcher Pills */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1 px-0.5">
                            <span
                              className="font-display text-[11px] font-extrabold uppercase tracking-wider"
                              style={{ color: recItem.badgeColor }}
                            >
                              {recItem.slotLabel}
                            </span>
                            {isVerifiedPick && (
                              <span className="px-1.5 py-0.5 rounded bg-[#CCFF00] text-[#090D0B] font-mono-tabular text-[10px] font-extrabold uppercase">
                                ★ {currentHole.distance}ft Pick
                              </span>
                            )}
                          </div>

                          {recItem.alts && recItem.alts.length > 1 && (
                            <div className="flex flex-wrap items-center gap-1">
                              {recItem.alts.map((altDisc) => {
                                const isSelectedAlt = altDisc.id === d.id;
                                return (
                                  <button
                                    key={altDisc.id}
                                    type="button"
                                    onClick={() => {
                                      setSlotOverrides((prev) => ({
                                        ...prev,
                                        [recItem.slotKey]: altDisc.id
                                      }));
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all ${
                                      isSelectedAlt
                                        ? 'bg-[#CCFF00] text-[#090D0B]'
                                        : 'bg-[#111629] text-slate-300 border border-white/10 hover:border-[#CCFF00]/50'
                                    }`}
                                  >
                                    {altDisc.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 3D Flippable Collector Card */}
                        <div
                          onClick={() => toggleFlipCard(d.id)}
                          className="collector-3d-scene w-full cursor-pointer select-none"
                        >
                          <div className={`collector-3d-card ${isFlipped ? 'is-flipped' : ''}`}>
                            {/* FRONT FACE: Clean Collector Card + 4-Pill [SPD|GLD|TRN|FAD] Readout */}
                            <div
                              style={{
                                borderColor: isVerifiedPick ? '#16A34A' : d.colorHex,
                                boxShadow: '0 8px 20px -5px rgba(15,23,42,0.35)'
                              }}
                              className="collector-3d-face collector-3d-front border-2 bg-[#070A14] p-2 flex flex-col justify-between gap-1.5"
                            >
                              <div className="flex items-center justify-between gap-1 px-0.5">
                                <span className="font-mono-tabular text-[11px] font-extrabold text-[#CCFF00] truncate">
                                  {d.cardNumber || d.brand}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => toggleFlipCard(d.id, e)}
                                  className="px-2 py-0.5 rounded bg-[#CCFF00]/20 border border-[#CCFF00] text-[10px] font-extrabold text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#090D0B] flex items-center gap-1 transition-all shrink-0"
                                >
                                  <RotateCw className="w-2.5 h-2.5" />
                                  <span>Flip ↻</span>
                                </button>
                              </div>

                              <div className="aspect-[896/1200] w-full overflow-hidden rounded-xl bg-[#04060C] border border-white/10 relative flex items-center justify-center">
                                {cardSrc && (
                                  <img
                                    src={cardSrc}
                                    alt={`${d.brand} ${d.name} Collector Card`}
                                    className="w-full h-full object-cover object-center"
                                  />
                                )}
                                <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/85 border border-[#CCFF00]/80 text-[10px] font-extrabold text-[#CCFF00] flex items-center gap-1 shadow-lg">
                                  <RotateCw className="w-2.5 h-2.5" />
                                  <span>Tap to Flip</span>
                                </div>
                              </div>

                              <div className="space-y-1 px-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-display text-xs font-bold uppercase text-white truncate">
                                    {formatDiscCardTitle(d)}
                                  </span>
                                  <span className="font-mono-tabular text-[10px] font-bold text-slate-400 shrink-0">
                                    {d.idealMinFeet}–{d.idealMaxFeet}FT
                                  </span>
                                </div>
                                <FlightReadoutBar
                                  speed={d.speed}
                                  glide={d.glide}
                                  turn={d.turn}
                                  fade={d.fade}
                                  compact
                                />
                              </div>
                            </div>

                            {/* BACK FACE: Hole Note + How It Flies + RHBH Flight Path */}
                            <div
                              style={{
                                borderColor: d.colorHex,
                                boxShadow: '0 10px 24px -4px rgba(15,23,42,0.18)'
                              }}
                              className="collector-3d-face collector-3d-back card-back-dark border-2 bg-[#0B0F1E] p-2.5 flex flex-col justify-between gap-1.5"
                            >
                              <div className="flex-1 flex flex-col gap-1.5 min-h-0">
                                {/* Back Header */}
                                <div className="flex items-start justify-between gap-1 border-b border-slate-700 pb-1">
                                  <div className="min-w-0">
                                    <div className="text-[10px] font-mono-tabular font-extrabold uppercase text-[#00F0FF] truncate">
                                      {d.slotCategory}
                                    </div>
                                    <h4 className="text-xs font-extrabold text-white leading-tight truncate">
                                      {formatDiscCardTitle(d)}
                                    </h4>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-mono-tabular text-[11px] font-extrabold text-[#39FF14] block">
                                      [{d.speed}|{d.glide}|{d.turn}|{d.fade}]
                                    </span>
                                    <span className="font-mono-tabular text-[10px] font-bold text-slate-300">
                                      {d.idealMinFeet}–{d.idealMaxFeet} ft
                                    </span>
                                  </div>
                                </div>

                                {/* Personal Flight Notes (From Commentary) */}
                                <div className="p-1.5 rounded-lg bg-[#111629] border border-[#39FF14]/50 space-y-0.5">
                                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#39FF14]">
                                    🎯 How It Flies For Me (Commentary)
                                  </div>
                                  <p className="text-[10px] font-medium text-slate-200 leading-tight line-clamp-4">
                                    {liveFlight.howItFliesForMe}
                                  </p>
                                </div>

                                {/* Release Cue & Hole Note */}
                                <div className="p-1.5 rounded-lg bg-[#111629] border border-[#FACC15]/60 space-y-0.5">
                                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#FACC15]">
                                    🎙️ My Release Cue &amp; Hole #{currentHole.number} ({currentHole.distance} ft)
                                  </div>
                                  <p className="text-[10px] font-semibold text-white leading-tight line-clamp-2">
                                    {liveFlight.swingCue}
                                  </p>
                                </div>

                                {/* RHBH Flight Path SVG */}
                                <div className="flex-1 flex flex-col justify-between rounded-xl bg-[#05070E] border border-slate-700 p-1.5 min-h-[75px]">
                                  <div className="flex items-center justify-between text-[9px] font-mono-tabular px-0.5">
                                    <span className="font-bold text-amber-300">
                                      ← Fade ({d.fade})
                                    </span>
                                    <span className="font-extrabold text-sky-300">
                                      Est. {cardFlightSvg.estimatedFeet} ft
                                    </span>
                                    <span className="font-bold text-orange-400">
                                      Turn ({d.turn}) →
                                    </span>
                                  </div>
                                  <svg
                                    viewBox="-55 18 370 292"
                                    preserveAspectRatio="xMidYMid meet"
                                    className="w-full flex-1 min-h-[60px] overflow-visible"
                                    aria-label={`RHBH Flight Path for ${d.name}`}
                                  >
                                    <line
                                      x1={130}
                                      y1={24}
                                      x2={130}
                                      y2={298}
                                      stroke="#475569"
                                      strokeDasharray="5 5"
                                      strokeWidth={1.5}
                                    />
                                    {/* Hole Pin Distance Target Line */}
                                    <line
                                      x1={-35}
                                      y1={pinSvgY}
                                      x2={295}
                                      y2={pinSvgY}
                                      stroke="#16A34A"
                                      strokeDasharray="4 4"
                                      strokeWidth={1.75}
                                    />
                                    <text
                                      x={-30}
                                      y={Math.max(36, pinSvgY - 5)}
                                      fill="#15803D"
                                      fontSize="11"
                                      fontWeight="800"
                                    >
                                      ⛳ PIN {holeDist}FT
                                    </text>
                                    <path
                                      d={cardFlightSvg.pathD}
                                      fill="none"
                                      stroke={d.colorHex}
                                      strokeWidth={8}
                                      strokeLinecap="round"
                                    />
                                    <rect
                                      x={112}
                                      y={290}
                                      width={36}
                                      height={9}
                                      rx={3}
                                      fill="#00F0FF"
                                    />
                                    <circle
                                      cx={cardFlightSvg.endX}
                                      cy={cardFlightSvg.endY}
                                      r={10.5}
                                      fill={d.colorHex}
                                      stroke="#FFFFFF"
                                      strokeWidth={3}
                                    />
                                  </svg>
                                </div>
                              </div>

                              {/* Back Footer */}
                              <div className="pt-1 border-t border-slate-700 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={(e) => toggleFlipCard(d.id, e)}
                                  className="px-2 py-0.5 rounded bg-[#00F0FF] text-slate-950 text-[10px] font-extrabold flex items-center gap-1"
                                >
                                  <RotateCw className="w-2.5 h-2.5" />
                                  <span>Flip to Card Front ↻</span>
                                </button>
                                <span className="text-[10px] font-mono-tabular text-slate-400">
                                  Tap anywhere
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 📐 HOLE PIN DISTANCE VS. DISC SPEED CARRY METER + 🎯 1-TAP "THREW ON HOLE #X" BUTTON */}
                        <div className="space-y-1.5 pt-1">
                          <div className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${carryVerdict.color}`}>
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate">{carryVerdict.label}</span>
                            </div>
                            <div className="relative h-2 w-full rounded-full bg-slate-200 mt-1 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${carryPct}%`,
                                  backgroundColor: d.colorHex || '#16A34A'
                                }}
                              />
                              <div
                                title={`Hole #${currentHole.number} Pin: ${holeDist} ft`}
                                className="absolute top-0 bottom-0 w-1 bg-slate-900"
                                style={{ left: `${pinPct}%` }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => selectHoleThrownDisc('jeffery', d, e)}
                            className={`w-full min-h-[34px] px-2.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                              isThrownOnCurrentHole
                                ? 'bg-[#39FF14] text-white shadow-sm'
                                : 'bg-white border border-slate-300 text-slate-800 hover:border-emerald-600'
                            }`}
                          >
                            <Disc className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {isThrownOnCurrentHole
                                ? `✓ Thrown on Hole #${currentHole.number} (${d.name})`
                                : `🎯 Log ${d.name} on Hole #${currentHole.number}`}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Live Standings & Full Scorecard */}
        <div className="lg:col-span-5 space-y-5">
          <div className="neon-card border border-[#00F0FF]/35 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FACC15]" />
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Live Standings &amp; Course Record Pace
                </h3>
              </div>
              <button
                type="button"
                onClick={toggleJackInRound}
                className="text-xs font-bold text-[#00F0FF] hover:underline"
              >
                {isJackActive ? 'Switch to Solo →' : '+ Add Jack'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400">
                    <th className="py-2 pr-2">Player</th>
                    <th className="py-2 px-2 text-right">Thru</th>
                    <th className="py-2 px-2 text-right">+/-</th>
                    <th className="py-2 px-2 text-right">Strokes</th>
                    <th className="py-2 pl-2 text-right">Course PB / Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm font-mono-tabular">
                  {liveStandings.map((st, idx) => (
                    <tr key={st.player.id} className="hover:bg-white/5">
                      <td className="py-2.5 pr-2 font-sans font-bold text-white">
                        {st.player.name}{' '}
                        <span
                          className={`text-xs font-bold ${
                            idx === 0 ? 'text-[#FF2E93]' : 'text-[#00F0FF]'
                          }`}
                        >
                          {st.player.tag}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-300">
                        {st.holesCompleted}/{roundState.totalHoles}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right font-bold ${
                          st.relPar < 0
                            ? 'text-[#39FF14]'
                            : st.relPar === 0
                            ? 'text-[#00F0FF]'
                            : 'text-[#FF9E00]'
                        }`}
                      >
                        {st.holesCompleted > 0 ? formatRelativePar(st.relPar) : 'E'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-white">
                        {st.totalStrokes || '—'}
                      </td>
                      <td className="py-2.5 pl-2 text-right text-xs text-slate-400">
                        {st.coursePB.bestTotal !== null
                          ? `PB ${st.coursePB.bestTotal} · Avg ${st.coursePB.avgTotal}`
                          : 'First Round'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Only celebrate when all holes are finished and a PB is beaten or tied */}
            {liveStandings.map((st) => {
              const pb = st.coursePB.bestTotal;
              if (pb === null) return null;
              const isFinishedAllHoles = st.holesCompleted === roundState.totalHoles;
              const isNewPB = isFinishedAllHoles && st.totalStrokes < pb;
              const isTiedPB = isFinishedAllHoles && st.totalStrokes === pb;
              if (!isNewPB && !isTiedPB) return null;

              return (
                <div
                  key={`pb-banner-${st.player.id}`}
                  className={`mt-3 p-3 rounded-xl border-2 flex items-center gap-2 text-xs font-bold ${
                    isNewPB
                      ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
                      : 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-[#FACC15] shrink-0" />
                  <span>
                    {isNewPB
                      ? `🏆 NEW ${roundState.courseName.toUpperCase()} PERSONAL BEST FOR ${st.player.name.toUpperCase()}! ${st.totalStrokes} (${formatRelativePar(
                          st.relPar
                        )}) beats previous PB of ${pb}!`
                      : `🔥 TIED ${roundState.courseName.toUpperCase()} PERSONAL BEST! ${st.totalStrokes} (${formatRelativePar(
                          st.relPar
                        )}) matches ${st.player.name}'s best of ${pb}!`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Full Scorecard Grid */}
          <div className="neon-card border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Full Card — <span className="text-[#00F0FF]">{roundState.courseName}</span>
              </h3>
              <span className="text-xs text-slate-400">Tap any row to jump</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono-tabular text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 pr-2">Hole</th>
                    <th className="py-2 px-2 text-right">Dist</th>
                    <th className="py-2 px-2 text-right">Par</th>
                    {activePlayers.map((p, idx) => (
                      <th
                        key={p.id}
                        className={`py-2 px-2 text-right font-bold ${
                          idx === 0 ? 'text-[#FF2E93]' : 'text-[#00F0FF]'
                        }`}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {roundState.holes.map((h, idx) => {
                    const isCurrent = idx === roundState.currentHoleIndex;

                    return (
                      <tr
                        key={h.number}
                        onClick={() => goToHole(idx)}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#FF2E93]/20 font-bold'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="py-2 pr-2 font-bold text-white">
                          #{h.number}
                          {h.meta?.jeffery?.discUsed && (
                            <span className="ml-1 text-[11px] font-sans font-semibold text-[#39FF14]">
                              ({h.meta.jeffery.discUsed})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-400">{h.distance}ft</td>
                        <td className="py-2 px-2 text-right text-slate-300">{h.par}</td>
                        {activePlayers.map((p) => {
                          const sc = h.scores[p.id] || 0;
                          const diff = sc - h.par;
                          return (
                            <td
                              key={p.id}
                              className={`py-2 px-2 text-right font-bold ${
                                sc === 0
                                  ? 'text-slate-500'
                                  : diff < 0
                                  ? 'text-[#39FF14]'
                                  : diff === 0
                                  ? 'text-[#00F0FF]'
                                  : diff === 1
                                  ? 'text-[#FF9E00]'
                                  : 'text-[#FF2E93]'
                              }`}
                            >
                              {sc > 0 ? sc : '—'}
                              {sc > 0 && diff < 0 ? ' ★' : ''}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-700 font-bold text-white bg-[#080B14]">
                    <td className="py-2.5 pr-2 pl-1">Total</td>
                    <td className="py-2.5 px-2 text-right text-[#00F0FF]">
                      {totalCourseDistance}ft
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#39FF14]">{totalCoursePar}</td>
                    {liveStandings.map((st) => (
                      <td key={st.player.id} className="py-2.5 px-2 text-right text-white">
                        {st.totalStrokes || 0} ({formatRelativePar(st.relPar)})
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* PNG & Round History Actions */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row gap-2.5">
                {isAllHolesCompleted ? (
                  <button
                    type="button"
                    onClick={handleSaveRoundClick}
                    className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 whitespace-nowrap neon-border-lime"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Log Round to History</span>
                  </button>
                ) : (
                  <div className="flex-1 min-h-[46px] px-3.5 py-2 rounded-xl bg-[#080B14] border border-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center text-center">
                    Score all {roundState.holes.length} holes ({totalHolesScoredAllPlayers}/{roundState.holes.length}) to Log Round
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDownloadScorecardPng}
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Scorecard as PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
