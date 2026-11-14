import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Disc,
  NotebookPen,
  Sparkles,
  X
} from 'lucide-react';
import {
  ActiveRoundState,
  CourseTemplate,
  DiscItem,
  HistoricalRound
} from '../data/initialData';
import { formatRelativePar } from '../utils/analytics';
import {
  ParsedVoiceRoundResult,
  convertParsedVoiceRoundToHistoricalRound,
  parseVoiceLogTranscript
} from '../utils/voiceLogParser';

interface VoiceLogImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseTemplate[];
  bag: DiscItem[];
  history: HistoricalRound[];
  defaultCourseKey?: string;
  activeRoundState?: ActiveRoundState;
  isRoundInProgress?: boolean;
  onSaveParsedRoundToHistory: (newRound: HistoricalRound) => void;
  onLoadParsedIntoActiveScorecard: (parsed: ParsedVoiceRoundResult) => void;
}

export const VoiceLogImporterModal: React.FC<VoiceLogImporterModalProps> = ({
  isOpen,
  onClose,
  courses,
  bag,
  history,
  defaultCourseKey = 'sarko',
  activeRoundState,
  isRoundInProgress = false,
  onSaveParsedRoundToHistory,
  onLoadParsedIntoActiveScorecard
}) => {
  const [rawTranscript, setRawTranscript] = useState('');
  const [selectedCourseOverride, setSelectedCourseOverride] = useState<string>('');
  const [holeOverrides, setHoleOverrides] = useState<
    Record<number, { score?: number; discId?: string; note?: string }>
  >({});
  const [dictationHint, setDictationHint] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      if (a.key === 'sarko') return -1;
      if (b.key === 'sarko') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [courses]);

  const activeJefferyDiscs = useMemo(
    () => bag.filter((d) => !d.archived && d.ownerId !== 'jack'),
    [bag]
  );

  useEffect(() => {
    if (!isOpen) {
      setDictationHint(null);
    }
  }, [isOpen]);

  const baseParsed = useMemo(() => {
    return parseVoiceLogTranscript(
      rawTranscript,
      courses,
      bag,
      selectedCourseOverride || defaultCourseKey
    );
  }, [rawTranscript, courses, bag, selectedCourseOverride, defaultCourseKey]);

  const finalParsed: ParsedVoiceRoundResult = useMemo(() => {
    const canMergeTappedScores =
      isRoundInProgress &&
      activeRoundState &&
      activeRoundState.courseKey === baseParsed.courseKey;

    const updatedHoles = baseParsed.holes.map((h) => {
      const ov = holeOverrides[h.holeNumber];
      const activeHole = canMergeTappedScores
        ? activeRoundState?.holes.find((ah) => ah.number === h.holeNumber)
        : undefined;
      const tappedScore =
        activeHole?.scores?.jeffery && activeHole.scores.jeffery > 0
          ? activeHole.scores.jeffery
          : undefined;
      const tappedDiscId = activeHole?.meta?.jeffery?.thrownDiscId;

      const resolvedDiscId =
        ov?.discId ||
        (rawTranscript.trim() ? h.thrownDiscId : tappedDiscId || h.thrownDiscId);
      const chosenDisc = bag.find((d) => d.id === resolvedDiscId);

      const resolvedScore =
        ov?.score !== undefined
          ? ov.score
          : tappedScore !== undefined && !rawTranscript.trim()
          ? tappedScore
          : h.jefferyScore;

      return {
        ...h,
        jefferyScore: resolvedScore,
        thrownDiscId: resolvedDiscId,
        discUsed: chosenDisc?.name || h.discUsed,
        summaryNote: ov?.note !== undefined ? ov.note : h.summaryNote
      };
    });
    const jefferyTotal = updatedHoles.reduce((s, h) => s + h.jefferyScore, 0);
    return {
      ...baseParsed,
      holes: updatedHoles,
      jefferyTotal
    };
  }, [baseParsed, holeOverrides, bag, isRoundInProgress, activeRoundState, rawTranscript]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText && clipText.trim()) {
        setRawTranscript(clipText);
        setDictationHint('✓ Pasted your iPhone Notes transcript! Review holes below and tap Save.');
        return;
      }
    } catch {
      // Clipboard API requires user gesture in textarea on some iOS versions
    }
    textareaRef.current?.focus();
    setDictationHint('Tap once inside the text box below and tap "Paste" on your iPhone popup!');
  };

  const handleSaveCompletedRound = () => {
    const newRound = convertParsedVoiceRoundToHistoricalRound(finalParsed, history);
    onSaveParsedRoundToHistory(newRound);
    onClose();
  };

  const handleLoadToLiveScorecard = () => {
    onLoadParsedIntoActiveScorecard(finalParsed);
    onClose();
  };

  const relPar = finalParsed.jefferyTotal - finalParsed.totalPar;
  const birdieCount = finalParsed.holes.filter((h) => h.jefferyScore < h.par).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="neon-card w-full max-w-4xl rounded-2xl border-2 border-[#39FF14] p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-300 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#39FF14] text-white text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>iPhone Notes Audio Log → Auto-Scorecard &amp; Card Tuner</span>
            </div>
            <h2 className="font-display text-lg sm:text-2xl font-extrabold text-slate-900 mt-1">
              Paste Your iPhone Notes Round Transcript
            </h2>
            <p className="text-xs text-slate-600">
              Record your round in the background with iPhone Notes (never stops when your phone
              locks or switches screens), then paste the transcript here at the end to auto-log
              Hole #1–#{finalParsed.holes.length} scores &amp; auto-tune your Collector Cards!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Course Selector & Paste / Open Notes Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-extrabold uppercase text-slate-700">
              Course:
            </label>
            <select
              value={selectedCourseOverride || finalParsed.courseKey}
              onChange={(e) => {
                setSelectedCourseOverride(e.target.value);
                setHoleOverrides({});
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-xs sm:text-sm"
            >
              {sortedCourses.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name} ({c.totalHoles} Holes)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="mobilenotes://"
              className="px-3.5 py-2 rounded-xl font-extrabold text-xs bg-[#00F0FF] text-white flex items-center gap-1.5"
            >
              <NotebookPen className="w-4 h-4" />
              <span>📝 Open iPhone Notes</span>
            </a>

            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-4 py-2 rounded-xl font-extrabold text-xs bg-[#39FF14] text-white flex items-center gap-1.5 neon-border-lime"
            >
              <ClipboardList className="w-4 h-4" />
              <span>📋 1-Tap Paste from Notes</span>
            </button>
          </div>
        </div>

        {dictationHint && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2">
            <span>{dictationHint}</span>
            <button
              type="button"
              onClick={() => setDictationHint(null)}
              className="text-emerald-700 underline text-[11px] shrink-0"
            >
              Hide
            </button>
          </div>
        )}

        {/* Transcript Input Box */}
        <div className="space-y-1.5">
          <textarea
            ref={textareaRef}
            value={rawTranscript}
            onChange={(e) => setRawTranscript(e.target.value)}
            rows={5}
            placeholder={`Tap here & press the 🎙️ microphone on your iPhone keyboard (bottom-right), or paste your Notes voice log (e.g. "Hole 1: Sync right under the pin, birdie! Next hole: Halo IT parked 5 feet right, par...")`}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Live Parsed Preview Banner */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
            <Disc className="w-4 h-4 text-emerald-700" />
            <span>
              Detected: {finalParsed.courseName} ({finalParsed.date})
            </span>
            <span>·</span>
            <span className="font-mono-tabular text-emerald-700 font-extrabold">
              Jeffery: {finalParsed.jefferyTotal} ({formatRelativePar(relPar)})
            </span>
            <span>·</span>
            <span className="font-mono-tabular text-amber-700 font-extrabold">
              {birdieCount} {birdieCount === 1 ? 'Birdie ★' : 'Birdies ★'}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-600">
            You can tweak any disc or score below before saving
          </span>
        </div>

        {/* Editable Hole-by-Hole Parsed Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-300">
          <table className="w-full text-left border-collapse text-xs font-mono-tabular">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-extrabold">
                <th className="py-2 px-2.5">Hole</th>
                <th className="py-2 px-2">Dist / Par</th>
                <th className="py-2 px-2">Thrown Disc (Auto-Tunes Card)</th>
                <th className="py-2 px-2 text-center">Score</th>
                <th className="py-2 px-2.5">Extracted Flight Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {finalParsed.holes.map((h) => {
                const diff = h.jefferyScore - h.par;
                return (
                  <tr key={h.holeNumber} className="hover:bg-slate-50">
                    <td className="py-2 px-2.5 font-extrabold text-slate-900">
                      #{h.holeNumber}
                    </td>
                    <td className="py-2 px-2 text-slate-600 whitespace-nowrap">
                      {h.distance}ft · P{h.par}
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={h.thrownDiscId}
                        onChange={(e) =>
                          setHoleOverrides((prev) => ({
                            ...prev,
                            [h.holeNumber]: {
                              ...prev[h.holeNumber],
                              discId: e.target.value
                            }
                          }))
                        }
                        className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-900 font-sans font-bold text-xs max-w-[165px]"
                      >
                        {activeJefferyDiscs.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} [{d.speed}|{d.glide}|{d.turn}|{d.fade}]
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center justify-center gap-1">
                        {[h.par - 1, h.par, h.par + 1].map((scOpt) => {
                          const isSel = h.jefferyScore === scOpt;
                          const label =
                            scOpt < h.par ? `${scOpt}★` : scOpt === h.par ? `${scOpt}` : `${scOpt}+`;
                          return (
                            <button
                              key={scOpt}
                              type="button"
                              onClick={() =>
                                setHoleOverrides((prev) => ({
                                  ...prev,
                                  [h.holeNumber]: {
                                    ...prev[h.holeNumber],
                                    score: scOpt
                                  }
                                }))
                              }
                              className={`min-w-[30px] py-1 px-1.5 rounded-lg font-extrabold text-xs border ${
                                isSel
                                  ? scOpt < h.par
                                    ? 'bg-[#39FF14] text-white border-emerald-700'
                                    : scOpt === h.par
                                    ? 'bg-[#00F0FF] text-white border-sky-700'
                                    : 'bg-[#FF2E93] text-white border-orange-700'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                        <span
                          className={`ml-1 font-extrabold ${
                            diff < 0
                              ? 'text-emerald-700'
                              : diff === 0
                              ? 'text-sky-700'
                              : 'text-orange-700'
                          }`}
                        >
                          ({formatRelativePar(diff)})
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2.5 font-sans">
                      <input
                        type="text"
                        value={h.summaryNote}
                        onChange={(e) =>
                          setHoleOverrides((prev) => ({
                            ...prev,
                            [h.holeNumber]: {
                              ...prev[h.holeNumber],
                              note: e.target.value
                            }
                          }))
                        }
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleLoadToLiveScorecard}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-[#00F0FF] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5"
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>Load into Active Scorecard</span>
          </button>

          <button
            type="button"
            onClick={handleSaveCompletedRound}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#39FF14] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 neon-border-lime"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Log Completed Round ({finalParsed.jefferyTotal} / {formatRelativePar(relPar)}) &amp; Auto-Tune Cards
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
