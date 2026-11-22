import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Play,
  NotebookPen,
  Check,
  Trophy,
  ArrowLeft,
  Map as MapIcon
} from 'lucide-react';
import { DiscItem, HistoricalRound, PlayerRosterItem } from '../data/initialData';
import {
  buildCourseSummary,
  buildNotebookGeminiDossier,
  formatRelativePar,
  getCoursePersonalBest
} from '../utils/analytics';
import { BroadcastScorecardTicker } from './TacticalRangefinderWidgets';

function resolveHoleThrownDisc(
  h: HistoricalRound['holes'][number],
  bag: DiscItem[],
  roundDate?: string
): DiscItem | undefined {
  const isCottonCandyEra = Boolean(roundDate && roundDate >= '2026-11-18');
  const teeThrowId = h.meta?.jeffery?.throws?.find((t) => t.shotType === 'tee')?.discId;
  const thrownId = teeThrowId || h.meta?.jeffery?.thrownDiscId;
  const usedName = h.meta?.jeffery?.discUsed;
  const matchPool = isCottonCandyEra
    ? [...bag.filter((d) => !d.archived), ...bag.filter((d) => d.archived)]
    : bag;
  const directMatch =
    (thrownId ? bag.find((d) => d.id === thrownId) : undefined) ||
    (usedName
      ? matchPool.find(
          (d) =>
            d.name.toLowerCase() === usedName.toLowerCase() ||
            (usedName.toLowerCase() === 'xero' && d.id === 'innova-sync') ||
            (usedName.toLowerCase() === 'it' && d.id === 'innova-it')
        )
      : undefined);
  if (directMatch) return directMatch;

  const note = (h.voiceTranscript || h.meta?.jeffery?.voiceNote || '').toLowerCase();
  if (!note) return undefined;
  const keywordMap: Array<[string, string]> = isCottonCandyEra
    ? [
        ['halo destroyer', 'innova-halo-destroyer'],
        ['destroyer', 'innova-halo-destroyer'],
        ['halo wraith', 'innova-halo-wraith'],
        ['wraith', 'innova-halo-wraith'],
        ['luster firebird', 'innova-luster-firebird'],
        ['firebird', 'innova-luster-firebird'],
        ['star roadrunner', 'innova-sugar-star-roadrunner'],
        ['roadrunner', 'innova-sugar-star-roadrunner'],
        ['glow teebird', 'innova-glow-teebird'],
        ['teebird', 'innova-glow-teebird'],
        ['glow leopard3', 'innova-glow-leopard3'],
        ['leopard3', 'innova-glow-leopard3'],
        ['champion eagle', 'innova-champion-eagle'],
        ['archangel', 'innova-archangel'],
        ['proto glow mako3', 'innova-proto-glow-mako3'],
        ['mako3', 'innova-proto-glow-mako3'],
        ['star rollo', 'innova-sugar-star-rollo'],
        ['rollo', 'innova-sugar-star-rollo'],
        ['dx glow roc', 'innova-sugar-glow-roc'],
        ['glow roc', 'innova-sugar-glow-roc'],
        ['roc3', 'innova-roc3'],
        ['roc', 'innova-sugar-glow-roc'],
        ['dx alien', 'innova-dx-alien'],
        ['sync', 'innova-sync'],
        ['yeti pro aviar', 'innova-yeti-pro-aviar'],
        ['yeti', 'innova-yeti-pro-aviar'],
        ['kc pro aviar', 'innova-kc-pro-aviar'],
        ['proto glow aviar', 'innova-proto-glow-aviar'],
        ['xt glow nova', 'innova-xt-glow-nova'],
        ['nova', 'innova-xt-glow-nova'],
        ['aviar', 'innova-proto-glow-aviar']
      ]
    : [
        ['classic glow roc', 'innova-classic-glow-roc'],
        ['classic glow beast', 'innova-classic-glow-beast'],
        ['classic glow wraith', 'innova-classic-glow-wraith'],
        ['xt glow nova', 'innova-xt-glow-nova'],
        ['kc pro aviar', 'innova-kc-pro-aviar'],
        ['dx alien', 'innova-dx-alien'],
        ['champion eagle', 'innova-champion-eagle'],
        ['roadrunner', 'innova-roadrunner'],
        ['archangel', 'innova-archangel'],
        ['leopard3', 'innova-leopard3'],
        ['halo star it', 'innova-it'],
        ['halo it', 'innova-it'],
        ['mako3', 'innova-mako3'],
        ['roc3', 'innova-roc3'],
        ['rollo', 'innova-rollo'],
        ['mamba', 'innova-mamba'],
        ['sync', 'innova-sync'],
        ['toro', 'innova-toro'],
        ['jay', 'innova-jay'],
        ['firebird', 'innova-firebird'],
        ['xt pig', 'innova-pig'],
        ['aviar', 'innova-aviar']
      ];
  for (const [kw, discId] of keywordMap) {
    if (note.includes(kw)) {
      return bag.find((d) => d.id === discId);
    }
  }
  return undefined;
}

interface RoundHistoryViewProps {
  history: HistoricalRound[];
  roster: PlayerRosterItem[];
  bag: DiscItem[];
  initialCourseName?: string | null;
  onOpenCourseAtlas?: (courseName: string) => void;
  onDeleteRound: (roundId: number) => void;
  onReplayCourse: (round: HistoricalRound) => void;
  onSyncSingleRoundToWebhook: (round: HistoricalRound) => Promise<void>;
}

export const RoundHistoryView: React.FC<RoundHistoryViewProps> = ({
  history,
  bag,
  initialCourseName,
  onOpenCourseAtlas,
  onDeleteRound,
  onReplayCourse
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    initialCourseName || null
  );
  const [expandedRoundId, setExpandedRoundId] = useState<number | null>(null);
  const [openCommentaryRoundIds, setOpenCommentaryRoundIds] = useState<Record<number, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [copiedRoundDossierId, setCopiedRoundDossierId] = useState<number | null>(null);

  useEffect(() => {
    if (initialCourseName) {
      setSelectedCourse(initialCourseName);
      const firstRound = history.find((r) => r.courseName === initialCourseName);
      setExpandedRoundId(firstRound?.id ?? null);
    }
  }, [initialCourseName, history]);

  const uniqueCourses = Array.from(new Set(history.map((r) => r.courseName)));

  const filteredRounds =
    selectedCourse === null
      ? []
      : selectedCourse === 'ALL'
      ? history
      : history.filter((r) => r.courseName === selectedCourse);

  const maxHolesInLedger =
    filteredRounds.length > 0
      ? Math.max(9, ...filteredRounds.map((r) => r.holes?.length || 9))
      : 9;
  const ledgerHoleNumbers = Array.from({ length: maxHolesInLedger }, (_, idx) => idx + 1);

  const handleSelectCourseTile = (courseName: string) => {
    setSelectedCourse(courseName);
    const firstRound =
      courseName === 'ALL'
        ? history[0]
        : history.find((r) => r.courseName === courseName);
    setExpandedRoundId(firstRound?.id ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyRoundDossier = async (round: HistoricalRound) => {
    const dossier = buildNotebookGeminiDossier({
      courseName: round.courseName,
      date: round.date,
      windCondition: round.windCondition || 'calm',
      duration: round.duration,
      holes: round.holes,
      players: round.players,
      roundTranscript: round.roundTranscript || round.notes,
      bag
    });
    try {
      await navigator.clipboard.writeText(dossier);
      setCopiedRoundDossierId(round.id);
      setTimeout(() => setCopiedRoundDossierId(null), 3000);
    } catch {
      // Ignore
    }
  };

  const jumpToRoundCard = (roundId: number) => {
    setExpandedRoundId(roundId);
    const el = document.getElementById(`round-card-${roundId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // VIEW 1: COURSE TILES LANDING PAGE
  if (selectedCourse === null) {
    return (
      <div className="space-y-6">
        <div className="neon-card border-2 border-[#00F0FF]/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 neon-border-cyan">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-white break-words min-w-0">
            Course &amp; Round History{' '}
            <span className="text-[#39FF14]">({history.length} Rounds)</span>
          </h2>

          <button
            type="button"
            onClick={() => handleSelectCourseTile('ALL')}
            className="px-4 py-2.5 rounded-xl bg-[#080B14] border border-[#00F0FF] text-xs sm:text-sm font-bold text-[#00F0FF] hover:bg-[#00F0FF] hover:text-slate-950 transition-colors shrink-0"
          >
            All {history.length} Rounds →
          </button>
        </div>

        {/* Course Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {uniqueCourses.map((courseName) => {
            const courseRounds = history.filter((r) => r.courseName === courseName);
            const latestRound = courseRounds[0];
            const coursePar = latestRound?.par || 27;
            const totalDist =
              latestRound?.holes.reduce((s, h) => s + (h.distance || 0), 0) || 0;
            const jStat = getCoursePersonalBest(courseName, 'jeffery', history);
            const kStat = getCoursePersonalBest(courseName, 'jack', history);
            const latestJ = latestRound?.players.find((p) => p.id === 'jeffery');
            const latestK = latestRound?.players.find((p) => p.id === 'jack');
            const voiceRoundsCount = courseRounds.filter(
              (r) => r.roundTranscript || r.holes.some((h) => h.voiceTranscript)
            ).length;

            return (
              <div
                key={courseName}
                onClick={() => handleSelectCourseTile(courseName)}
                className="neon-card min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5 border-2 border-[#00F0FF]/50 hover:border-[#FF2E93] cursor-pointer transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="min-w-0">
                      <span className="text-xs font-mono-tabular font-bold text-[#00F0FF] block truncate">
                        Par {coursePar}
                        {totalDist > 0 ? ` · ${totalDist.toLocaleString()} ft` : ''} · Last:{' '}
                        {latestRound?.date}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5 leading-snug break-words">
                        {courseName}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#39FF14]/15 border border-[#39FF14] text-xs font-mono-tabular font-extrabold text-[#39FF14] shrink-0">
                      {courseRounds.length} {courseRounds.length === 1 ? 'Round' : 'Rounds'}
                    </span>
                  </div>

                  {/* Jeffery & Jack Stats on this Course */}
                  <div className="grid grid-cols-2 gap-2.5 font-mono-tabular text-xs">
                    <div className="p-3 rounded-xl bg-[#080B14] border border-[#FF2E93]/50 space-y-1">
                      <div className="font-sans font-extrabold text-[#FF2E93]">
                        Jeffery
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Best:</span>
                        <span className="font-extrabold text-[#39FF14]">
                          {jStat.bestTotal !== null
                            ? `${jStat.bestTotal} (${formatRelativePar(jStat.bestRelPar || 0)})`
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg:</span>
                        <span className="font-bold text-white">
                          {jStat.avgTotal ?? '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Last:</span>
                        <span className="font-bold text-[#FACC15]">
                          {latestJ ? latestJ.total : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#080B14] border border-[#00F0FF]/50 space-y-1">
                      <div className="font-sans font-extrabold text-[#00F0FF]">
                        Jack
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Best:</span>
                        <span className="font-extrabold text-[#00F0FF]">
                          {kStat.bestTotal !== null
                            ? `${kStat.bestTotal} (${formatRelativePar(kStat.bestRelPar || 0)})`
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg:</span>
                        <span className="font-bold text-white">
                          {kStat.avgTotal ?? '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Last:</span>
                        <span className="font-bold text-slate-300">
                          {latestK ? latestK.total : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Summary & Conditions Preview */}
                  {(() => {
                    const summaryPreview = buildCourseSummary(courseName, history, bag);
                    return (
                      <div className="p-2.5 rounded-xl bg-[#080B14] border border-slate-800 space-y-1 text-xs">
                        <div className="font-extrabold text-[#39FF14]">
                          📋 Course Summary &amp; Conditions Recap
                        </div>
                        <p className="text-slate-300 leading-snug line-clamp-2">
                          {summaryPreview.courseVibe}
                        </p>
                        <p className="text-[11px] text-[#FACC15] font-medium line-clamp-1">
                          🌤️ {summaryPreview.conditionsAndWindRecap}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  {onOpenCourseAtlas ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCourseAtlas(courseName);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#00F0FF] text-slate-950 text-xs font-extrabold flex items-center gap-1.5 zine-pill-btn"
                    >
                      <MapIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Layout &amp; Holes</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      {voiceRoundsCount > 0
                        ? `🎙️ ${voiceRoundsCount} Voice Log${voiceRoundsCount === 1 ? '' : 's'} & Summary`
                        : 'Course summary & scorecards'}
                    </span>
                  )}
                  <span className="px-3 py-1.5 rounded-xl bg-[#FF2E93] text-white text-xs font-extrabold">
                    Scorecards ({courseRounds.length}) →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // VIEW 2: SELECTED COURSE DEEP-DIVE (SCORECARDS & TRANSCRIPTS)
  const jCoursePB =
    selectedCourse !== 'ALL'
      ? getCoursePersonalBest(selectedCourse, 'jeffery', history)
      : null;
  const kCoursePB =
    selectedCourse !== 'ALL'
      ? getCoursePersonalBest(selectedCourse, 'jack', history)
      : null;
  const activeCourseSummary =
    selectedCourse && selectedCourse !== 'ALL'
      ? buildCourseSummary(selectedCourse, history, bag)
      : null;

  return (
    <div className="space-y-6">
      {/* Top Course Back Bar */}
      <div className="neon-card border-2 border-[#FF2E93]/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 neon-border-pink">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setSelectedCourse(null)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#00F0FF] hover:underline mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Course Tiles</span>
          </button>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-white break-words">
            {selectedCourse === 'ALL' ? 'All Courses' : selectedCourse}{' '}
            <span className="text-[#39FF14]">
              ({filteredRounds.length} {filteredRounds.length === 1 ? 'Round' : 'Rounds'})
            </span>
          </h2>
          {jCoursePB && jCoursePB.bestTotal !== null && (
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono-tabular pt-1">
              <span className="text-[#FF2E93] font-bold">
                Jeffery PB: {jCoursePB.bestTotal} ({formatRelativePar(jCoursePB.bestRelPar || 0)}) · Avg{' '}
                {jCoursePB.avgTotal}
              </span>
              {kCoursePB && kCoursePB.bestTotal !== null && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-[#00F0FF] font-bold">
                    Jack PB: {kCoursePB.bestTotal} ({formatRelativePar(kCoursePB.bestRelPar || 0)}) · Avg{' '}
                    {kCoursePB.avgTotal}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenCourseAtlas && selectedCourse && selectedCourse !== 'ALL' && (
            <button
              type="button"
              onClick={() => onOpenCourseAtlas(selectedCourse)}
              className="px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 zine-pill-btn"
            >
              <MapIcon className="w-4 h-4 shrink-0" />
              <span>Course Layout &amp; Tee-Signs</span>
            </button>
          )}
          {filteredRounds[0] && (
            <button
              type="button"
              onClick={() => onReplayCourse(filteredRounds[0])}
              className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play This Course</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelectedCourse(null)}
            className="px-4 py-2.5 rounded-xl bg-[#080B14] border border-slate-700 text-xs sm:text-sm font-bold text-white hover:border-[#00F0FF]"
          >
            Switch Course
          </button>
        </div>
      </div>

      {/* Course Summary, Commentary Takeaways & Conditions/Wind Recap */}
      {activeCourseSummary && (
        <div className="neon-card border-2 border-[#39FF14]/50 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div>
              <span className="text-[11px] font-mono-tabular font-extrabold uppercase text-[#39FF14]">
                Course Dossier · {activeCourseSummary.holesCount} Holes · Par {activeCourseSummary.par} ·{' '}
                {activeCourseSummary.totalFeet.toLocaleString()} ft
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                📋 Course Summary, Commentary Takeaways &amp; Conditions Recap
              </h3>
            </div>
            {activeCourseSummary.topGoToDiscs.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-tabular">
                <span className="text-slate-400 font-bold">Most Thrown Here:</span>
                {activeCourseSummary.topGoToDiscs.map((d) => (
                  <span
                    key={d.name}
                    className="px-2 py-0.5 rounded-lg bg-[#080B14] border border-[#00F0FF]/50 text-[#00F0FF] font-bold"
                  >
                    {d.name} ({d.count}×)
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {activeCourseSummary.courseVibe}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-[#080B14] border border-slate-800 space-y-1.5">
              <div className="font-extrabold text-[#00F0FF]">
                🎙️ Commentary Takeaways &amp; Course Highlights
              </div>
              <ul className="space-y-1.5 text-slate-200 list-disc list-inside text-xs">
                {activeCourseSummary.commentaryHighlights.map((item, i) => (
                  <li key={i} className="leading-snug">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080B14] border border-slate-800 space-y-2.5 text-xs">
              <div>
                <div className="font-extrabold text-[#FACC15]">
                  🌤️ Weather, Wind &amp; Round Conditions Recap
                </div>
                <p className="text-slate-200 leading-snug mt-1">
                  {activeCourseSummary.conditionsAndWindRecap}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-tabular">
                {activeCourseSummary.bestScoringHoles.length > 0 && (
                  <div className="p-2 rounded-lg bg-[#111629] border border-[#39FF14]/40">
                    <div className="text-[10px] font-sans font-bold text-[#39FF14] uppercase">
                      ★ Best Scoring Holes
                    </div>
                    <div className="text-white font-bold mt-0.5">
                      {activeCourseSummary.bestScoringHoles
                        .map((h) => `H${h.holeNumber} (Avg ${h.avgScore})`)
                        .join(' · ')}
                    </div>
                  </div>
                )}
                {activeCourseSummary.toughestHoles.length > 0 && (
                  <div className="p-2 rounded-lg bg-[#111629] border border-[#FF2E93]/40">
                    <div className="text-[10px] font-sans font-bold text-[#FF2E93] uppercase">
                      ⛳ Toughest Holes &amp; Disc Fix
                    </div>
                    <div className="text-white font-bold mt-0.5">
                      {activeCourseSummary.toughestHoles
                        .slice(0, 2)
                        .map((h) => `H${h.holeNumber}: ${h.verifiedDisc}`)
                        .join(' · ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hole-by-Hole Summary Table for This Course */}
      {filteredRounds.length > 0 && (
        <div className="neon-card border border-[#00F0FF]/50 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Hole-by-Hole Ledger ({filteredRounds.length}{' '}
              {filteredRounds.length === 1 ? 'Round' : 'Rounds'})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono-tabular">
              <thead>
                <tr className="border-b border-slate-800 text-[#00F0FF] font-sans">
                  <th className="py-2 pr-2.5 whitespace-nowrap">Date</th>
                  {selectedCourse === 'ALL' && (
                    <th className="py-2 px-2.5 whitespace-nowrap">Course</th>
                  )}
                  <th className="py-2 px-2 text-center whitespace-nowrap">Par</th>
                  <th className="py-2 px-2.5 whitespace-nowrap">Player</th>
                  {ledgerHoleNumbers.map((hNum) => (
                    <th key={hNum} className="py-2 px-1.5 text-center">
                      H{hNum}
                    </th>
                  ))}
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">Total</th>
                  <th className="py-2 pl-2 text-right whitespace-nowrap">+/-</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredRounds.map((round) =>
                  round.players.map((pl, pIdx) => {
                    const rel = pl.total - round.par;
                    const isFirstPlayerRow = pIdx === 0;

                    return (
                      <tr
                        key={`${round.id}-${pl.id}`}
                        onClick={() => jumpToRoundCard(round.id)}
                        className={`cursor-pointer hover:bg-white/5 ${
                          !isFirstPlayerRow ? 'border-t border-slate-800/30' : ''
                        }`}
                      >
                        <td className="py-2 pr-2.5 text-slate-300 whitespace-nowrap font-bold">
                          {isFirstPlayerRow ? round.date : ''}
                        </td>
                        {selectedCourse === 'ALL' && (
                          <td className="py-2 px-2.5 font-sans font-bold text-white whitespace-nowrap">
                            {isFirstPlayerRow ? round.courseName : ''}
                          </td>
                        )}
                        <td className="py-2 px-2 text-center text-slate-400">
                          {isFirstPlayerRow ? round.par : ''}
                        </td>
                        <td
                          className={`py-2 px-2.5 font-sans font-bold whitespace-nowrap ${
                            pl.id === 'jeffery' ? 'text-[#FF2E93]' : 'text-[#00F0FF]'
                          }`}
                        >
                          {pl.name}
                        </td>
                        {ledgerHoleNumbers.map((hNum) => {
                          const hObj = round.holes.find((h) => h.number === hNum);
                          const sc = hObj?.scores[pl.id] || 0;
                          const hPar = hObj?.par || 3;
                          const diff = sc - hPar;
                          return (
                            <td
                              key={hNum}
                              className={`py-2 px-1.5 text-center font-bold ${
                                sc === 0
                                  ? 'text-slate-600'
                                  : diff < 0
                                  ? 'text-[#39FF14]'
                                  : diff === 0
                                  ? 'text-slate-200'
                                  : 'text-[#FF9E00]'
                              }`}
                            >
                              {sc > 0 ? sc : '—'}
                            </td>
                          );
                        })}
                        <td className="py-2 px-2.5 text-right font-bold text-white">
                          {pl.total}
                        </td>
                        <td
                          className={`py-2 pl-2 text-right font-bold whitespace-nowrap ${
                            rel < 0
                              ? 'text-[#39FF14]'
                              : rel === 0
                              ? 'text-[#00F0FF]'
                              : 'text-[#FF9E00]'
                          }`}
                        >
                          {formatRelativePar(rel)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expandable Individual Round Cards & Voice Transcripts */}
      <div className="space-y-4">
        {filteredRounds.map((round) => {
          const isExpanded = expandedRoundId === round.id;
          const totalDistance = round.holes.reduce((acc, h) => acc + (h.distance || 0), 0);

          return (
            <div
              id={`round-card-${round.id}`}
              key={round.id}
              className={`neon-card border rounded-2xl overflow-hidden transition-colors ${
                isExpanded ? 'border-[#FF2E93]' : 'border-slate-800'
              }`}
            >
              <div
                onClick={() => setExpandedRoundId(isExpanded ? null : round.id)}
                className="p-4 sm:p-5 cursor-pointer hover:bg-white/5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      {round.courseName} — {round.date}
                    </h3>
                    <span className="text-xs text-slate-500" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-mono-tabular text-xs sm:text-sm font-bold text-[#39FF14]">
                      Par {round.par}
                    </span>
                    {totalDistance > 0 && (
                      <>
                        <span className="text-xs text-slate-500" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-mono-tabular text-xs sm:text-sm font-bold text-[#00F0FF]">
                          {totalDistance.toLocaleString()} ft
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 font-mono-tabular">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#FF2E93]" />
                      {round.date}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
                      {round.duration}
                    </span>
                  </div>
                </div>

                {/* Player Totals & Expand Trigger */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
                  <div className="flex items-center gap-4">
                    {round.players.map((pl, idx) => {
                      const rel = pl.total - round.par;
                      return (
                        <div
                          key={pl.id}
                          className={`flex items-baseline gap-2 ${
                            idx > 0 ? 'pl-4 border-l border-slate-800' : ''
                          }`}
                        >
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              idx === 0 ? 'text-[#FF2E93]' : 'text-[#00F0FF]'
                            }`}
                          >
                            {pl.name}:
                          </span>
                          <span className="font-mono-tabular text-lg sm:text-xl font-bold text-white">
                            {pl.total}
                          </span>
                          <span
                            className={`font-mono-tabular text-xs sm:text-sm font-bold ${
                              rel < 0
                                ? 'text-[#39FF14]'
                                : rel === 0
                                ? 'text-[#00F0FF]'
                                : 'text-[#FF9E00]'
                            }`}
                          >
                            ({formatRelativePar(rel)})
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    aria-label={isExpanded ? 'Collapse scorecard' : 'Expand scorecard'}
                    className="min-w-[40px] min-h-[40px] rounded-xl border border-slate-700 bg-[#080B14] flex items-center justify-center text-[#00F0FF] hover:border-[#00F0FF]"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Final Hole-by-Hole Scorecard Layout (Matching Last Scorecard View) */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-[#080B14] border-t border-slate-800 space-y-4">
                  {/* Player Final Totals Summary Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {round.players.map((p) => {
                      const rel = p.total - round.par;
                      const birdies = round.holes.filter(
                        (h) => (h.scores[p.id] || 0) > 0 && h.scores[p.id] < h.par
                      ).length;
                      const pars = round.holes.filter(
                        (h) => (h.scores[p.id] || 0) === h.par
                      ).length;
                      return (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-xl bg-[#0D1222] border border-slate-700 flex items-center justify-between"
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

                  {/* Broadcast Scorecard Horizontal Ticker */}
                  <BroadcastScorecardTicker
                    courseName={round.courseName}
                    date={round.date}
                    holes={round.holes}
                    currentHoleIndex={0}
                    activePlayers={round.players.map((p) => ({
                      id: p.id,
                      name: p.name,
                      tag: p.tag
                    }))}
                    onSelectHole={() => {}}
                  />

                  {/* Final Hole-by-Hole Scorecard Table (Identical to Last Scorecard Layout) */}
                  <div className="neon-card border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-base sm:text-lg font-extrabold text-white">
                        Final Hole-by-Hole Scorecard · {round.courseName} ({round.date})
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-mono-tabular text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-slate-700 text-[#00F0FF] bg-[#080B14]">
                            <th className="py-2.5 px-3">Hole</th>
                            <th className="py-2.5 px-3">Par</th>
                            <th className="py-2.5 px-3">Dist</th>
                            {round.players.map((p) => (
                              <th key={p.id} className="py-2.5 px-3 text-center">
                                {p.name}
                              </th>
                            ))}
                            <th className="py-2.5 px-3">Thrown Disc / Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {round.holes.map((h) => {
                            const thrownDisc = resolveHoleThrownDisc(h, bag, round.date);
                            const holeNote =
                              h.voiceTranscript ||
                              h.meta?.jeffery?.voiceNote ||
                              h.meta?.jeffery?.notes ||
                              '';
                            return (
                              <tr key={h.number} className="hover:bg-white/5">
                                <td className="py-2.5 px-3 font-extrabold text-white">
                                  #{h.number}
                                </td>
                                <td className="py-2.5 px-3 text-slate-300">{h.par}</td>
                                <td className="py-2.5 px-3 text-[#00F0FF] font-bold whitespace-nowrap">
                                  {h.distance} ft
                                </td>
                                {round.players.map((p) => {
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
                                  {holeNote ? (
                                    <span className="text-slate-300">{holeNote}</span>
                                  ) : !thrownDisc ? (
                                    <span className="text-slate-500">—</span>
                                  ) : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-[#00F0FF] bg-[#080B14] font-extrabold text-white">
                            <td className="py-3 px-3">TOTAL</td>
                            <td className="py-3 px-3 text-[#39FF14]">{round.par}</td>
                            <td className="py-3 px-3 text-[#00F0FF] whitespace-nowrap">
                              {totalDistance.toLocaleString()} ft
                            </td>
                            {round.players.map((p) => {
                              const rel = p.total - round.par;
                              return (
                                <td
                                  key={p.id}
                                  className="py-3 px-3 text-center text-[#39FF14] text-sm sm:text-base whitespace-nowrap"
                                >
                                  {p.total} ({formatRelativePar(rel)})
                                </td>
                              );
                            })}
                            <td className="py-3 px-3 font-sans text-xs text-[#FACC15]">
                              Completed {round.date}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {round.roundTranscript && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCommentaryRoundIds((prev) => ({
                            ...prev,
                            [round.id]: !prev[round.id]
                          }))
                        }
                        className="px-3.5 py-2 rounded-xl bg-[#111629] border border-[#FF2E93]/60 hover:border-[#FF2E93] text-xs font-extrabold text-[#FF2E93] flex items-center gap-2 transition-colors"
                      >
                        <span>
                          {openCommentaryRoundIds[round.id]
                            ? '🎙️ Hide Full Round Commentary'
                            : '🎙️ View Full Round Commentary'}
                        </span>
                        {openCommentaryRoundIds[round.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {openCommentaryRoundIds[round.id] && (
                        <div className="p-4 rounded-xl bg-[#111629] border border-slate-700 space-y-2">
                          <span className="text-xs font-bold uppercase text-[#FF2E93] block">
                            🎙️ Round Commentary:
                          </span>
                          <p className="text-xs sm:text-sm text-white whitespace-pre-line leading-relaxed">
                            {round.roundTranscript}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Bar for this Historical Round */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onReplayCourse(round)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/85 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Play This Course Layout</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyRoundDossier(round)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {copiedRoundDossierId === round.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied Round Summary!</span>
                          </>
                        ) : (
                          <>
                            <NotebookPen className="w-3.5 h-3.5" />
                            <span>Copy Round &amp; Transcript</span>
                          </>
                        )}
                      </button>
                    </div>

                    {confirmDeleteId === round.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#FF2E93] font-bold">
                          Delete this round permanently?
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg border border-slate-700 bg-[#111629] text-xs font-bold text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteRound(round.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FF2E93] text-white text-xs font-bold"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(round.id)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl text-[#FF2E93] hover:bg-[#FF2E93]/15 text-xs sm:text-sm font-bold flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Round</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
