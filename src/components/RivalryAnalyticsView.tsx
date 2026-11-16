import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Compass,
  Disc,
  Swords,
  Target,
  TrendingUp,
  Trophy
} from 'lucide-react';
import {
  CourseTemplate,
  DiscItem,
  HistoricalRound,
  PlayerRosterItem,
  getDiscCardImageUrl
} from '../data/initialData';
import {
  BagGroupingFilter,
  DEFAULT_VERIFIED_HOLE_PICKS,
  buildCourseSummary,
  computeDiscBagTelemetry,
  computePlayerCareerProfile,
  formatRelativePar,
  getCoursePersonalBest,
  getVerifiedHoleKey
} from '../utils/analytics';

interface RivalryAnalyticsViewProps {
  history: HistoricalRound[];
  roster: PlayerRosterItem[];
  bag?: DiscItem[];
  courses?: CourseTemplate[];
  onOpenBagGuide?: (discId?: string, ownerFilter?: 'jeffery' | 'jack' | 'all') => void;
  onOpenCourseAtlas?: (courseName: string) => void;
}

type StatsSubTab = 'overview' | 'courses' | 'rivalry' | 'bag_form';
type LoadoutPresetKey =
  | 'all-around'
  | 'short-wooded'
  | 'open-bomber'
  | 'jack-discraft';

const JACK_DISCRAFT_SLOTS: { id: string; role: string }[] = [
  {
    id: 'discraft-roach',
    role: 'Putter & Approach · Beadless C1/C2 Chain Laser & Short Ace Runs (0–175 ft) [2|3|0|1]'
  },
  {
    id: 'discraft-buzzz-ss',
    role: 'Midrange Workhorse · Dead-Straight Woods Tunnel & Easy Glide (175–255 ft) [5|4|-2|1]'
  },
  {
    id: 'discraft-cicada',
    role: 'Fairway Bomber · High-Glide Point-and-Shoot Fairway Driver (235–330 ft) [7|6|-1|1]'
  }
];

const LOADOUT_PRESETS: Record<
  LoadoutPresetKey,
  {
    title: string;
    subtitle: string;
    reserveNote: string;
    discIds: { id: string; role: string }[];
  }
> = {
  'all-around': {
    title: '⭐ Optimal Core 9-Disc Adventure Pack (Default All-Around)',
    subtitle:
      'Covers every speed and stability slot from C1 chains to 340+ ft drives across technical and open park courses.',
    reserveNote: 'Reserve: XT Glow Nova, Star Sync, DX Archangel, DX Alien',
    discIds: [
      { id: 'innova-kc-pro-aviar', role: 'Putter 1 · Primary C1/C2 Chain Putter (21 / -6 PB!) [2|3|0|2]' },
      { id: 'innova-sync', role: 'Putter 2 · Dead-Straight Tee Putter & Approach Laser [3|3|0|1]' },
      { id: 'innova-toro', role: 'Approach · Overstable Tree-Hook & Slope Brake [4|2|0|3]' },
      { id: 'innova-rollo', role: 'Midrange (US) · Right Turn, Tunnel & Uphill Closer [5|6|-4|1]' },
      { id: 'innova-mako3', role: 'Midrange (Neutral) · Dead-Straight Point & Shoot [5|5|0|0]' },
      { id: 'innova-roc3', role: 'Midrange (OS) · Dependable Left Hyzer Finish [5|4|0|3]' },
      { id: 'innova-it', role: 'Fairway (Control) · Pinpoint 6-Glide S-Curve Fairway [7|6|-2|1]' },
      { id: 'innova-champion-eagle', role: 'Fairway (OS) · Torque-Resistant Left Finish & Flex [7|4|-1|3]' },
      { id: 'innova-roadrunner', role: 'Distance Bomber · #1 All-Around Distance & Gap Driver [9|5|-4|1]' }
    ]
  },
  'short-wooded': {
    title: '🌲 Short Technical Woods (Sar-Ko-Par / Art Nine / Black Hoof)',
    subtitle:
      'Built for 100–240 ft technical gaps, guardian trees, and sloped greens where touch beats raw speed.',
    reserveNote: 'Swaps in XT Glow Nova, DX Alien & Star Jay for long distance drivers',
    discIds: [
      { id: 'innova-kc-pro-aviar', role: 'Main Chain Putter · 6 Straight Birdies in 21 PB [2|3|0|2]' },
      { id: 'innova-sync', role: 'Tee Putter · 3 Straight Sar-Ko H1 Parked Birdies [3|3|0|1]' },
      { id: 'innova-xt-glow-nova', role: 'Scramble Stopper · Stops Dead on Sloped Greens [2|2|0|0]' },
      { id: 'innova-dx-alien', role: 'Low-Ceiling Touch · Low 2-Glide Under Branches [4|2|0|1]' },
      { id: 'innova-rollo', role: 'Right-Turning Woods Mid · Sar-Ko H9 & Art Nine H3 [5|6|-4|1]' },
      { id: 'innova-mako3', role: 'Tunnel Carver · Zero-Fade Wooded Corridor [5|5|0|0]' },
      { id: 'innova-jay', role: 'Torque Mid · Point-and-Shoot w/ Gentle Check [5|4|0|1]' },
      { id: 'innova-roc3', role: 'Hyzer Mid · Sar-Ko H4/H5 & Art Nine H5 Left Finish [5|4|0|3]' },
      { id: 'innova-it', role: 'Control Fairway · Sar-Ko H2/H3 & Art Nine H2 Parker [7|6|-2|1]' }
    ]
  },
  'open-bomber': {
    title: '🚀 Long Bomber & Par-4 Course (Prairie Center / Cedar Ridge / Mize / Cal Trail)',
    subtitle:
      'Maximizes 260–604+ ft Par 3/4 carry with high-glide distance drivers and reliable 2nd-shot placement mids.',
    reserveNote: 'Activates Classic Glow Wraith, Classic Glow Beast, Mamba & Roadrunner',
    discIds: [
      { id: 'innova-kc-pro-aviar', role: 'C1/C2 Chain Putter & Uphill Finisher [2|3|0|2]' },
      { id: 'innova-dx-alien', role: 'Low-Branch Scramble & Bullseye Stopper [4|2|0|1]' },
      { id: 'innova-mako3', role: '2nd-Shot Fairway Gap Threader (Prairie H7/H12) [5|5|0|0]' },
      { id: 'innova-jay', role: 'Full-Strength Midrange Bridge (200–255 ft) [5|4|0|1]' },
      { id: 'innova-it', role: 'Fairway Workhorse & Chest-High Laser [7|6|-2|1]' },
      { id: 'innova-archangel', role: 'High-Glide Fairway Turnover [8|6|-3|1]' },
      { id: 'innova-roadrunner', role: '#1 Workhorse Driver (Prairie H1/H5/H8/H9/H13) [9|5|-4|1]' },
      { id: 'innova-classic-glow-beast', role: '10-Speed S-Curve Distance Driver [10|5|-2|2]' },
      { id: 'innova-classic-glow-wraith', role: '11-Speed Dogleg-Left Power Bomber [11|5|-1|3]' }
    ]
  },
  'jack-discraft': {
    title: '⚡ Jack’s 3-Disc Discraft Core Lineup (1010 Order #277696)',
    subtitle:
      'Jack’s dialed-in 3-disc Discraft arsenal covering every shot from C1/C2 putts (including his 47-ft Cal Trail drain & bogey-free 24 / -3 Art Nine PB!) to 300+ ft fairways.',
    reserveNote: '3-Disc Complete Kit · Putter (Roach) + Midrange (Buzzz SS) + Driver (Cicada)',
    discIds: JACK_DISCRAFT_SLOTS
  }
};

export const RivalryAnalyticsView: React.FC<RivalryAnalyticsViewProps> = ({
  history,
  roster,
  bag = [],
  courses = [],
  onOpenBagGuide,
  onOpenCourseAtlas
}) => {
  const [subTab, setSubTab] = useState<StatsSubTab>('overview');
  const [statsPlayerScope, setStatsPlayerScope] = useState<'jeffery' | 'jack' | 'both'>(() => {
    try {
      const saved = localStorage.getItem('jj_disc_golf_stats_player_scope');
      if (saved === 'jeffery' || saved === 'jack' || saved === 'both') return saved;
    } catch {
      // Fallback
    }
    return 'jeffery';
  });
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<string>(
    () => history[0]?.courseName || 'Sar-Ko-Par Trails'
  );
  const [loadoutPreset, setLoadoutPreset] = useState<LoadoutPresetKey>('all-around');
  const [discSortBy, setDiscSortBy] = useState<
    'most_used' | 'favorites' | 'birdies' | 'least_thrown'
  >('most_used');
  const [analyticsBagGroup, setAnalyticsBagGroup] = useState<BagGroupingFilter>(
    statsPlayerScope === 'jack' ? 'jack' : 'jeffery_all'
  );

  const handleSetPlayerScope = (scope: 'jeffery' | 'jack' | 'both') => {
    setStatsPlayerScope(scope);
    if (scope === 'jack') {
      setLoadoutPreset('jack-discraft');
      setAnalyticsBagGroup('jack');
    } else {
      if (loadoutPreset === 'jack-discraft') {
        setLoadoutPreset('all-around');
      }
      if (scope === 'both') {
        setAnalyticsBagGroup('all');
      } else if (analyticsBagGroup === 'jack' || analyticsBagGroup === 'all') {
        setAnalyticsBagGroup('jeffery_all');
      }
    }
    try {
      localStorage.setItem('jj_disc_golf_stats_player_scope', scope);
    } catch {
      // Ignore
    }
  };

  const isSoloJeffery = statsPlayerScope === 'jeffery';
  const isSoloJack = statsPlayerScope === 'jack';
  const showJeffery = statsPlayerScope === 'jeffery' || statsPlayerScope === 'both';
  const showJack = statsPlayerScope === 'jack' || statsPlayerScope === 'both';

  const p1 = roster[0] || { id: 'jeffery', name: 'Jeffery', tag: 'J1' };
  const p2 = roster[1] || { id: 'jack', name: 'Jack', tag: 'J2' };

  const uniqueCourseNames = useMemo(
    () => Array.from(new Set(history.map((r) => r.courseName))),
    [history]
  );

  const filteredHistory = useMemo(
    () =>
      courseFilter === 'ALL'
        ? history
        : history.filter((r) => r.courseName === courseFilter),
    [history, courseFilter]
  );

  const p1Profile = useMemo(
    () => computePlayerCareerProfile(p1.id, filteredHistory),
    [p1.id, filteredHistory]
  );
  const p2Profile = useMemo(
    () => computePlayerCareerProfile(p2.id, filteredHistory),
    [p2.id, filteredHistory]
  );
  const discTelemetry = useMemo(
    () => computeDiscBagTelemetry(filteredHistory, bag, analyticsBagGroup),
    [filteredHistory, bag, analyticsBagGroup]
  );

  // Head-to-Head & Skins Telemetry computed live from filteredHistory
  const h2hTelemetry = useMemo(() => {
    const chronological = [...filteredHistory].sort(
      (a, b) => (a.date || '').localeCompare(b.date || '') || a.id - b.id
    );

    let p1Wins = 0;
    let p2Wins = 0;
    let ties = 0;
    let p1SharedStrokes = 0;
    let p2SharedStrokes = 0;
    let p1Skins = 0;
    let p2Skins = 0;
    let pushedSkins = 0;

    const sharedMatches: Array<{
      id: number;
      date: string;
      courseName: string;
      par: number;
      holesCount: number;
      p1Total: number;
      p2Total: number;
      margin: number; // positive = Jeffery won by X, negative = Jack won by X, 0 = Tie
    }> = [];

    for (const r of chronological) {
      const p1Entry = r.players.find((p) => p.id === p1.id);
      const p2Entry = r.players.find((p) => p.id === p2.id);
      if (!p1Entry || !p2Entry || p1Entry.total <= 0 || p2Entry.total <= 0) continue;

      p1SharedStrokes += p1Entry.total;
      p2SharedStrokes += p2Entry.total;

      if (p1Entry.total < p2Entry.total) p1Wins++;
      else if (p2Entry.total < p1Entry.total) p2Wins++;
      else ties++;

      for (const h of r.holes) {
        const s1 = h.scores?.[p1.id] || 0;
        const s2 = h.scores?.[p2.id] || 0;
        if (s1 > 0 && s2 > 0) {
          if (s1 < s2) p1Skins++;
          else if (s2 < s1) p2Skins++;
          else pushedSkins++;
        }
      }

      const roundPar = r.par || r.holes.reduce((sum, h) => sum + (h.par || 3), 0);
      sharedMatches.push({
        id: r.id,
        date: r.date,
        courseName: r.courseName,
        par: roundPar,
        holesCount: r.holes.length,
        p1Total: p1Entry.total,
        p2Total: p2Entry.total,
        margin: p2Entry.total - p1Entry.total
      });
    }

    const totalSharedHoles = p1Skins + p2Skins + pushedSkins;

    return {
      p1Wins,
      p2Wins,
      ties,
      p1SharedStrokes,
      p2SharedStrokes,
      strokeDiff: p1SharedStrokes - p2SharedStrokes,
      p1Skins,
      p2Skins,
      pushedSkins,
      totalSharedHoles,
      sharedMatches
    };
  }, [filteredHistory, p1.id, p2.id]);

  // Chronological Round Trajectory (All Rounds in filteredHistory, oldest -> newest)
  const trajectoryPoints = useMemo(() => {
    const chronological = [...filteredHistory].sort(
      (a, b) => (a.date || '').localeCompare(b.date || '') || a.id - b.id
    );

    return chronological.map((r, idx) => {
      const roundPar = r.par || r.holes.reduce((sum, h) => sum + (h.par || 3), 0);
      const holesCount = Math.max(1, r.holes.length || r.totalHoles || 9);
      const scaleTo9 = 9 / holesCount;

      const p1Entry = r.players.find((p) => p.id === p1.id);
      const p2Entry = r.players.find((p) => p.id === p2.id);

      const p1RawRel =
        p1Entry && p1Entry.total > 0 ? p1Entry.total - roundPar : null;
      const p2RawRel =
        p2Entry && p2Entry.total > 0 ? p2Entry.total - roundPar : null;

      const p1Norm9 =
        p1RawRel !== null ? Number((p1RawRel * scaleTo9).toFixed(1)) : null;
      const p2Norm9 =
        p2RawRel !== null ? Number((p2RawRel * scaleTo9).toFixed(1)) : null;

      const shortCourse = r.courseName
        .replace(' Trails', '')
        .replace(' Elementary', '')
        .replace(' Flying Disc', '')
        .replace(' & Santa Fe Parks', '')
        .replace(' @ SMP', '')
        .replace(' County Park', '');

      return {
        index: idx + 1,
        id: r.id,
        date: r.date.slice(5), // MM-DD
        fullDate: r.date,
        courseName: r.courseName,
        shortCourse,
        holesCount,
        p1Total: p1Entry?.total || null,
        p2Total: p2Entry?.total || null,
        p1RawRel,
        p2RawRel,
        p1Norm9,
        p2Norm9
      };
    });
  }, [filteredHistory, p1.id, p2.id]);

  // Detailed Hole-by-Hole Telemetry for Selected Course in Tab 2
  const activeCourseDetailName = useMemo(() => {
    if (uniqueCourseNames.includes(selectedCourseDetail)) return selectedCourseDetail;
    return uniqueCourseNames[0] || 'Sar-Ko-Par Trails';
  }, [uniqueCourseNames, selectedCourseDetail]);

  const courseHoleBreakdown = useMemo(() => {
    const courseRounds = history.filter(
      (r) => r.courseName === activeCourseDetailName
    );
    const matchedTemplate = courses.find(
      (c) => c.name.toLowerCase() === activeCourseDetailName.toLowerCase()
    );
    const maxHoles = Math.max(
      matchedTemplate?.totalHoles || 0,
      ...courseRounds.map((r) => r.holes.length),
      9
    );

    const holeRows: Array<{
      holeNumber: number;
      par: number;
      distance: number;
      p1Avg: number | null;
      p1Best: number | null;
      p1BogeyRate: number;
      p2Avg: number | null;
      p2Best: number | null;
      topDisc: string;
      hint: string;
    }> = [];

    for (let hNum = 1; hNum <= maxHoles; hNum++) {
      const templateHole = matchedTemplate?.holes.find((h) => h.number === hNum);
      let par = templateHole?.par || 3;
      let distance = templateHole?.distance || 200;

      const p1Scores: number[] = [];
      const p2Scores: number[] = [];
      const discCounts = new Map<string, number>();

      for (const r of courseRounds) {
        const h = r.holes.find((item) => item.number === hNum);
        if (!h) continue;
        if (h.par) par = h.par;
        if (h.distance) distance = h.distance;

        const s1 = h.scores?.[p1.id] || 0;
        const s2 = h.scores?.[p2.id] || 0;
        if (s1 > 0) p1Scores.push(s1);
        if (s2 > 0) p2Scores.push(s2);

        const used = h.meta?.jeffery?.discUsed;
        if (used) {
          discCounts.set(used, (discCounts.get(used) || 0) + 1);
        }
      }

      const p1Avg =
        p1Scores.length > 0
          ? Number(
              (p1Scores.reduce((a, b) => a + b, 0) / p1Scores.length).toFixed(2)
            )
          : null;
      const p1Best = p1Scores.length > 0 ? Math.min(...p1Scores) : null;
      const p1BogeysOrWorse = p1Scores.filter((s) => s > par).length;
      const p1BogeyRate =
        p1Scores.length > 0
          ? Math.round((p1BogeysOrWorse / p1Scores.length) * 100)
          : 0;

      const p2Avg =
        p2Scores.length > 0
          ? Number(
              (p2Scores.reduce((a, b) => a + b, 0) / p2Scores.length).toFixed(2)
            )
          : null;
      const p2Best = p2Scores.length > 0 ? Math.min(...p2Scores) : null;

      const holeKey = getVerifiedHoleKey(
        matchedTemplate?.key || activeCourseDetailName,
        hNum
      );
      const verifiedId = DEFAULT_VERIFIED_HOLE_PICKS[holeKey];
      const verifiedDiscObj = bag.find((d) => d.id === verifiedId);

      const topLoggedDisc = Array.from(discCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0];

      const topDisc =
        verifiedDiscObj?.name ||
        topLoggedDisc ||
        (distance < 185
          ? 'Star Sync / Aviar'
          : distance < 245
          ? 'Glow Mako3 / Jay'
          : 'Roadrunner / Leopard3');

      holeRows.push({
        holeNumber: hNum,
        par,
        distance,
        p1Avg,
        p1Best,
        p1BogeyRate,
        p2Avg,
        p2Best,
        topDisc,
        hint: templateHole?.hint || `${distance} ft Par ${par}`
      });
    }

    return {
      roundsCount: courseRounds.length,
      p1CoursePB: getCoursePersonalBest(activeCourseDetailName, p1.id, history),
      p2CoursePB: getCoursePersonalBest(activeCourseDetailName, p2.id, history),
      totalPar: holeRows.reduce((s, h) => s + h.par, 0),
      totalDist: holeRows.reduce((s, h) => s + h.distance, 0),
      holeRows
    };
  }, [activeCourseDetailName, history, courses, bag, p1.id, p2.id]);

  // Highest-Priority Leak Holes across all courses with >= 2 rounds
  const topLeakHoles = useMemo(() => {
    const targetPlayerId = isSoloJack ? p2.id : p1.id;
    const leaks: Array<{
      courseName: string;
      holeNumber: number;
      par: number;
      distance: number;
      plays: number;
      avgScore: number;
      avgOverPar: number;
      bogeyPct: number;
      recommendedDisc: string;
    }> = [];

    for (const cName of uniqueCourseNames) {
      const cRounds = history.filter((r) => r.courseName === cName);
      if (cRounds.length === 0) continue;
      const maxH = Math.max(...cRounds.map((r) => r.holes.length), 9);

      for (let hNum = 1; hNum <= maxH; hNum++) {
        const scores: number[] = [];
        let par = 3;
        let dist = 200;

        for (const r of cRounds) {
          const h = r.holes.find((x) => x.number === hNum);
          if (!h) continue;
          if (h.par) par = h.par;
          if (h.distance) dist = h.distance;
          const sc = h.scores?.[targetPlayerId] || 0;
          if (sc > 0) scores.push(sc);
        }

        if (scores.length >= 2) {
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          const avgOverPar = Number((avgScore - par).toFixed(2));
          const bogeyPct = Math.round(
            (scores.filter((s) => s > par).length / scores.length) * 100
          );
          if (avgOverPar > 0.2) {
            const holeKey = getVerifiedHoleKey(cName, hNum);
            const verifiedDisc = bag.find(
              (d) => d.id === DEFAULT_VERIFIED_HOLE_PICKS[holeKey]
            );
            leaks.push({
              courseName: cName,
              holeNumber: hNum,
              par,
              distance: dist,
              plays: scores.length,
              avgScore: Number(avgScore.toFixed(2)),
              avgOverPar,
              bogeyPct,
              recommendedDisc: isSoloJack
                ? dist < 175
                  ? '174g Discraft Roach [2|3|0|1]'
                  : dist < 245
                  ? '175g Discraft Buzzz SS [5|4|-2|1]'
                  : '170g Discraft Cicada [7|6|-1|1]'
                : verifiedDisc?.name ||
                  (dist < 185
                    ? 'Star Sync / XT Glow Nova'
                    : dist < 245
                    ? 'Glow Mako3 / Star Jay'
                    : 'GStar Leopard3 / Roadrunner')
            });
          }
        }
      }
    }

    return leaks.sort((a, b) => b.avgOverPar - a.avgOverPar).slice(0, 8);
  }, [uniqueCourseNames, history, p1.id, p2.id, isSoloJack, bag]);

  const activeDiscs = useMemo(
    () =>
      bag.filter((d) => {
        if (d.archived) return false;
        if (isSoloJeffery) return d.ownerId !== 'jack';
        if (isSoloJack) return d.ownerId === 'jack';
        return true;
      }),
    [bag, isSoloJeffery, isSoloJack]
  );

  const focusPlayer = isSoloJack ? p2 : p1;
  const focusProfile = isSoloJack ? p2Profile : p1Profile;

  return (
    <div className="space-y-6">
      {/* Top Header, Player Scope Toggle, Course Filter & Integrated Master Sub-Tabs */}
      <div className="neon-card border-2 border-[#FF2E93]/50 rounded-2xl p-4 sm:p-5 space-y-4 neon-border-pink">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#39FF14]/20 border border-[#39FF14] text-[#39FF14] text-xs font-mono-tabular font-extrabold">
                {isSoloJeffery
                  ? `${p1.name} Solo View · ${p1Profile.roundsPlayed} Rounds`
                  : isSoloJack
                  ? `${p2.name} Solo View · ${p2Profile.roundsPlayed} Rounds`
                  : `Duo Telemetry · ${filteredHistory.length} Rounds`}
              </span>
              <span className="text-xs font-mono-tabular text-[#00F0FF] font-bold">
                {focusProfile.holesPlayed} Holes Logged · {activeDiscs.length} Active Discs
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-white mt-1 break-words">
              {isSoloJeffery ? (
                <>
                  <span className="text-[#FF2E93]">{p1.name}</span> — Personal &amp; Course Stats
                </>
              ) : isSoloJack ? (
                <>
                  <span className="text-[#00F0FF]">{p2.name}</span> — Personal &amp; Course Stats
                </>
              ) : (
                <>
                  <span className="text-[#FF2E93]">{p1.name}</span> &amp;{' '}
                  <span className="text-[#00F0FF]">{p2.name}</span> — Personal &amp; Course Stats
                </>
              )}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Player Scope Toggle: Just Jeffery vs Just Jack vs Jeffery & Jack */}
            <div className="flex items-center p-1 rounded-xl bg-[#080B14] border border-slate-800">
              <button
                type="button"
                onClick={() => handleSetPlayerScope('jeffery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                  isSoloJeffery
                    ? 'bg-[#FF2E93] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👤 Just {p1.name}
              </button>
              <button
                type="button"
                onClick={() => handleSetPlayerScope('jack')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                  isSoloJack
                    ? 'bg-[#39FF14] text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👤 Just {p2.name}
              </button>
              <button
                type="button"
                onClick={() => handleSetPlayerScope('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                  statsPlayerScope === 'both'
                    ? 'bg-[#00F0FF] text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👥 {p1.name} &amp; {p2.name}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="analytics-course-filter"
                className="text-xs font-bold text-[#00F0FF] sr-only sm:not-sr-only"
              >
                Course:
              </label>
              <select
                id="analytics-course-filter"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[#00F0FF]/50 bg-[#080B14] text-xs font-bold text-white"
              >
                <option value="ALL">All Courses ({history.length} Rounds)</option>
                {uniqueCourseNames.map((cName) => (
                  <option key={cName} value={cName}>
                    {cName} ({history.filter((r) => r.courseName === cName).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
          {(
            [
              {
                id: 'overview',
                label: '📊 Overview & Graphs',
                icon: BarChart3
              },
              {
                id: 'courses',
                label: '⛳ Course Hole-by-Hole & Leaks',
                icon: Compass
              },
              {
                id: 'rivalry',
                label: `⚔️ H2H Rivalry & Skins (${h2hTelemetry.sharedMatches.length})`,
                icon: Swords
              },
              {
                id: 'bag_form',
                label: '🥏 Disc Stats, Favorites & Loadout',
                icon: Disc
              }
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#39FF14] text-slate-950 shadow-sm neon-border-lime'
                    : 'bg-[#080B14] text-slate-300 border border-slate-800 hover:border-[#00F0FF] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6-Card Master KPI Strip (Adapts to Solo Jeffery vs Solo Jack vs Duo View) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#39FF14]">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {focusPlayer.name} Rounds / Holes
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-extrabold text-white font-mono-tabular">
            {focusProfile.roundsPlayed}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {focusProfile.holesPlayed}H
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#39FF14] font-mono-tabular font-semibold">
            {focusProfile.totalStrokes} Throws (
            {formatRelativePar(focusProfile.totalStrokes - focusProfile.totalPar)})
          </div>
        </div>

        <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#00F0FF]">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {focusPlayer.name} 9-Hole Avg
          </div>
          <div
            className={`mt-1 text-xl sm:text-2xl font-extrabold font-mono-tabular ${
              isSoloJack ? 'text-[#00F0FF]' : 'text-[#FF2E93]'
            }`}
          >
            {formatRelativePar(focusProfile.avgRelParPer9)}
          </div>
          <div className="mt-1 text-[11px] text-[#00F0FF] font-mono-tabular font-semibold">
            {focusProfile.holesPlayed > 0
              ? `${Math.round(((focusProfile.birdies + focusProfile.pars) / focusProfile.holesPlayed) * 100)}% Par or Better`
              : '—'}
          </div>
        </div>

        <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#FACC15]">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {focusPlayer.name} Career PB
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-extrabold text-[#FACC15] font-mono-tabular">
            {focusProfile.bestRoundRelPar
              ? `${focusProfile.bestRoundRelPar.score} (${formatRelativePar(focusProfile.bestRoundRelPar.diff)})`
              : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-300 truncate">
            {focusProfile.bestRoundRelPar
              ? `${focusProfile.bestRoundRelPar.courseName} (${focusProfile.bestRoundRelPar.date.slice(5)})`
              : '—'}
          </div>
        </div>

        {isSoloJeffery || isSoloJack ? (
          <>
            <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#39FF14]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                {focusPlayer.name} Birdies
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-[#39FF14] font-mono-tabular">
                {focusProfile.birdies}
              </div>
              <div className="mt-1 text-[11px] text-slate-300 font-mono-tabular">
                {focusProfile.holesPlayed > 0
                  ? `${Math.round((focusProfile.birdies / focusProfile.holesPlayed) * 100)}% Birdie Rate`
                  : '—'}
              </div>
            </div>

            <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#00F0FF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                Short Holes (&lt;185ft)
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-[#00F0FF] font-mono-tabular">
                {formatRelativePar(focusProfile.distanceBrackets[0]?.avgRelPar || 0)}
              </div>
              <div className="mt-1 text-[11px] text-slate-300 font-mono-tabular">
                {focusProfile.distanceBrackets[0]?.holesCount || 0} Short Holes Played
              </div>
            </div>

            <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#FF2E93]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                {isSoloJack ? 'Career Pars & Skins' : 'Career Pars / Saves'}
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-white font-mono-tabular">
                {focusProfile.pars}
                {isSoloJack && (
                  <span className="text-xs text-[#00F0FF] ml-1.5">
                    · {h2hTelemetry.p2Skins} Skins
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11px] text-slate-300 font-mono-tabular">
                {focusProfile.bogeys} Bogeys · {focusProfile.doubleOrWorse} Dbl+
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#00F0FF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                {p2.name} 9-Hole Avg
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-[#00F0FF] font-mono-tabular">
                {formatRelativePar(p2Profile.avgRelParPer9)}
              </div>
              <div className="mt-1 text-[11px] text-slate-300 truncate font-mono-tabular">
                {p2Profile.bestRoundRelPar
                  ? `PB: ${p2Profile.bestRoundRelPar.score} (${formatRelativePar(p2Profile.bestRoundRelPar.diff)})`
                  : '—'}
              </div>
            </div>

            <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#39FF14]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                H2H Match Record
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-[#39FF14] font-mono-tabular">
                {h2hTelemetry.p1Wins} - {h2hTelemetry.p2Wins} - {h2hTelemetry.ties}
              </div>
              <div className="mt-1 text-[11px] text-slate-300 font-mono-tabular">
                {h2hTelemetry.p1SharedStrokes} vs {h2hTelemetry.p2SharedStrokes} (
                {formatRelativePar(h2hTelemetry.strokeDiff)})
              </div>
            </div>

            <div className="neon-card rounded-2xl p-3.5 border-l-4 border-l-[#FF2E93]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                Shared Skins ({h2hTelemetry.totalSharedHoles}H)
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-white font-mono-tabular">
                <span className="text-[#39FF14]">{h2hTelemetry.p1Skins}</span>
                <span className="text-xs text-slate-400 mx-1">vs</span>
                <span className="text-[#00F0FF]">{h2hTelemetry.p2Skins}</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-300 font-mono-tabular">
                {h2hTelemetry.pushedSkins} Pushed (
                {h2hTelemetry.totalSharedHoles > 0
                  ? Math.round(
                      (h2hTelemetry.pushedSkins / h2hTelemetry.totalSharedHoles) * 100
                    )
                  : 0}
                %)
              </div>
            </div>
          </>
        )}
      </div>

      {/* =================================================================== */}
      {/* SUB-TAB 1: OVERVIEW & GRAPHS                                        */}
      {/* =================================================================== */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* GRAPH 1: Chronological Score Relative to Par Trajectory (All Recorded Rounds) */}
          <div className="neon-card border border-[#39FF14]/50 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#39FF14]" />
                  <span>
                    Career Score Trajectory Relative to Par (All {trajectoryPoints.length}{' '}
                    Rounds)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Normalized to 9-hole score relative to par across every recorded round
                  (including 11/01 Cedar Ridge &amp; Black Hoof). Lower is better; below
                  the dashed 0 line is under par!
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-extrabold shrink-0">
                {showJeffery && (
                  <span className="inline-flex items-center gap-1.5 text-[#39FF14]">
                    <span className="w-3 h-3 rounded-full bg-[#39FF14]" />
                    {p1.name}
                  </span>
                )}
                {showJack && (
                  <span className="inline-flex items-center gap-1.5 text-[#00F0FF]">
                    <span className="w-3 h-3 rounded-full bg-[#00F0FF]" />
                    {p2.name}
                  </span>
                )}
              </div>
            </div>

            {trajectoryPoints.length > 0 && (() => {
              const svgW = Math.max(760, trajectoryPoints.length * 34);
              const svgH = 250;
              const padL = 44;
              const padR = 24;
              const padT = 24;
              const padB = 52;
              const plotW = svgW - padL - padR;
              const plotH = svgH - padT - padB;

              const minY = -8;
              const maxY = 22;
              const yRange = maxY - minY;

              const getX = (i: number) =>
                trajectoryPoints.length <= 1
                  ? padL + plotW / 2
                  : padL + (i / (trajectoryPoints.length - 1)) * plotW;
              const getY = (val: number) => {
                const clamped = Math.max(minY, Math.min(maxY, val));
                return padT + ((clamped - minY) / yRange) * plotH;
              };

              const yTicks = [-6, 0, 6, 12, 18];

              const p1Coords = trajectoryPoints
                .map((pt, idx) =>
                  pt.p1Norm9 !== null
                    ? { x: getX(idx), y: getY(pt.p1Norm9), pt }
                    : null
                )
                .filter(Boolean) as Array<{
                x: number;
                y: number;
                pt: (typeof trajectoryPoints)[0];
              }>;

              const p2Coords = trajectoryPoints
                .map((pt, idx) =>
                  pt.p2Norm9 !== null
                    ? { x: getX(idx), y: getY(pt.p2Norm9), pt }
                    : null
                )
                .filter(Boolean) as Array<{
                x: number;
                y: number;
                pt: (typeof trajectoryPoints)[0];
              }>;

              const p1Path = p1Coords
                .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
                .join(' ');
              const p2Path = p2Coords
                .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
                .join(' ');

              return (
                <div className="overflow-x-auto rounded-xl bg-[#080B14] border border-slate-800 p-3">
                  <svg
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    className="w-full min-w-[680px] h-64 overflow-visible"
                  >
                    {yTicks.map((tick) => {
                      const y = getY(tick);
                      const isPar = tick === 0;
                      return (
                        <g key={tick}>
                          <line
                            x1={padL}
                            y1={y}
                            x2={svgW - padR}
                            y2={y}
                            stroke={isPar ? '#FACC15' : '#1E293B'}
                            strokeWidth={isPar ? 1.8 : 1}
                            strokeDasharray={isPar ? '6 4' : '3 3'}
                          />
                          <text
                            x={padL - 8}
                            y={y + 4}
                            textAnchor="end"
                            fill={isPar ? '#FACC15' : '#94A3B8'}
                            fontSize="11"
                            fontWeight="700"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {tick === 0 ? 'E (0)' : tick > 0 ? `+${tick}` : `${tick}`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Jack Line */}
                    {showJack && p2Path && (
                      <path
                        d={p2Path}
                        fill="none"
                        stroke="#00F0FF"
                        strokeWidth={isSoloJack ? 3.2 : 2.5}
                        strokeDasharray={isSoloJack ? undefined : '4 3'}
                      />
                    )}

                    {/* Jeffery Line */}
                    {showJeffery && p1Path && (
                      <path
                        d={p1Path}
                        fill="none"
                        stroke="#39FF14"
                        strokeWidth={3.2}
                      />
                    )}

                    {/* Jack Points */}
                    {showJack &&
                      p2Coords.map(({ x, y, pt }) => {
                        const isSubPar = (pt.p2Norm9 || 0) < 0;
                        return (
                          <g key={`p2-${pt.id}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isSoloJack ? (isSubPar ? 5.5 : 4.5) : 4}
                              fill={isSubPar ? '#FACC15' : '#00F0FF'}
                              stroke="#080B14"
                              strokeWidth={1.5}
                            >
                              <title>
                                {pt.fullDate} · {pt.courseName}: {p2.name} {pt.p2Total} (
                                {formatRelativePar(pt.p2RawRel || 0)})
                              </title>
                            </circle>
                            {isSoloJack && (
                              <text
                                x={x}
                                y={y - 8}
                                textAnchor="middle"
                                fill={isSubPar ? '#FACC15' : '#00F0FF'}
                                fontSize="9.5"
                                fontWeight="800"
                                fontFamily="JetBrains Mono, monospace"
                              >
                                {formatRelativePar(pt.p2Norm9 || 0)}
                              </text>
                            )}
                          </g>
                        );
                      })}

                    {/* Jeffery Points & Labels */}
                    {showJeffery &&
                      p1Coords.map(({ x, y, pt }) => {
                        const isSubPar = (pt.p1Norm9 || 0) < 0;
                        return (
                          <g key={`p1-${pt.id}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isSubPar ? 5.5 : 4.5}
                              fill={isSubPar ? '#FACC15' : '#39FF14'}
                              stroke="#080B14"
                              strokeWidth={1.5}
                            >
                              <title>
                                {pt.fullDate} · {pt.courseName}: {p1.name} {pt.p1Total} (
                                {formatRelativePar(pt.p1RawRel || 0)})
                              </title>
                            </circle>
                            <text
                              x={x}
                              y={y - 8}
                              textAnchor="middle"
                              fill={isSubPar ? '#FACC15' : '#39FF14'}
                              fontSize="9.5"
                              fontWeight="800"
                              fontFamily="JetBrains Mono, monospace"
                            >
                              {formatRelativePar(pt.p1Norm9 || 0)}
                            </text>
                          </g>
                        );
                      })}

                    {/* X-Axis Date & Course Labels */}
                    {trajectoryPoints.map((pt, idx) => {
                      const x = getX(idx);
                      return (
                        <g key={`lbl-${pt.id}`} transform={`translate(${x}, ${svgH - 28})`}>
                          <text
                            x={0}
                            y={0}
                            textAnchor="middle"
                            fill="#CBD5E1"
                            fontSize="9"
                            fontWeight="700"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {pt.date}
                          </text>
                          <text
                            x={0}
                            y={12}
                            textAnchor="middle"
                            fill="#64748B"
                            fontSize="8.5"
                            fontWeight="700"
                          >
                            {pt.shortCourse.slice(0, 7)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* GRAPH 2 & GRAPH 3: Distance Bracket Bar Chart + Scoring Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Distance Bracket Efficiency Bar Graph */}
            <div className="lg:col-span-7 neon-card border border-[#00F0FF]/50 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>📐</span>
                    <span>Scoring Efficiency by Hole Distance Bracket (vs. Par)</span>
                  </h3>
                  <span className="text-[11px] font-mono-tabular font-bold text-[#39FF14] bg-[#39FF14]/15 border border-[#39FF14]/40 px-2 py-0.5 rounded-lg">
                    &lt;185ft = {formatRelativePar(focusProfile.distanceBrackets[0]?.avgRelPar || 0)}/hole
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isSoloJeffery || isSoloJack
                    ? `${focusPlayer.name}'s average strokes relative to par across all 4 speed/yardage brackets.`
                    : `Side-by-side average strokes relative to par for ${p1.name} vs. ${p2.name} across all 4 speed/yardage brackets.`}
                </p>
              </div>

              {/* Visual Bar Chart */}
              <div className="space-y-3 bg-[#080B14] border border-slate-800 rounded-xl p-4">
                {p1Profile.distanceBrackets.map((b1, idx) => {
                  const b2 = p2Profile.distanceBrackets[idx];
                  const v1 = b1.avgRelPar;
                  const v2 = b2?.avgRelPar ?? 0;
                  const w1 = Math.min(100, Math.max(8, ((v1 + 0.5) / 2.5) * 100));
                  const w2 = Math.min(100, Math.max(8, ((v2 + 0.5) / 2.5) * 100));

                  return (
                    <div key={b1.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-white">
                          {b1.label}{' '}
                          <span className="text-[#00F0FF] font-mono-tabular">
                            ({b1.rangeText})
                          </span>
                        </span>
                        <span className="font-mono-tabular text-[11px] text-slate-400">
                          {isSoloJeffery
                            ? `${b1.holesCount} Holes`
                            : isSoloJack
                            ? `${b2?.holesCount || 0} Holes`
                            : `${p1.name}: ${b1.holesCount}H · ${p2.name}: ${b2?.holesCount || 0}H`}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {/* Jeffery Bar */}
                        {showJeffery && (
                          <div className="flex items-center gap-2">
                            <span className="w-14 text-[11px] font-bold text-[#39FF14] shrink-0">
                              {p1.name}
                            </span>
                            <div className="flex-1 h-4 bg-[#111629] rounded-md overflow-hidden">
                              <div
                                style={{ width: `${w1}%` }}
                                className={`h-full rounded-md ${
                                  v1 <= 0 ? 'bg-[#39FF14]' : 'bg-[#FF2E93]'
                                }`}
                              />
                            </div>
                            <span
                              className={`w-16 text-right font-mono-tabular text-xs font-extrabold ${
                                v1 <= 0 ? 'text-[#39FF14]' : 'text-white'
                              }`}
                            >
                              {v1 > 0 ? `+${v1}` : v1}
                            </span>
                          </div>
                        )}

                        {/* Jack Bar */}
                        {showJack && (
                          <div className="flex items-center gap-2">
                            <span className="w-14 text-[11px] font-bold text-[#00F0FF] shrink-0">
                              {p2.name}
                            </span>
                            <div className="flex-1 h-4 bg-[#111629] rounded-md overflow-hidden">
                              <div
                                style={{ width: `${w2}%` }}
                                className={`h-full rounded-md ${
                                  v2 <= 0 ? 'bg-[#39FF14]' : 'bg-[#00F0FF]'
                                }`}
                              />
                            </div>
                            <span className="w-16 text-right font-mono-tabular text-xs font-extrabold text-[#00F0FF]">
                              {v2 > 0 ? `+${v2}` : v2}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono-tabular">
                {focusProfile.distanceBrackets.map((b) => (
                  <div
                    key={b.label}
                    className="p-2 rounded-xl bg-[#080B14] border border-slate-800"
                  >
                    <div className="text-[10px] text-slate-400 truncate">{b.rangeText}</div>
                    <div
                      className={`text-sm font-extrabold ${
                        b.avgRelPar <= 0
                          ? 'text-[#39FF14]'
                          : b.avgRelPar <= 0.6
                          ? 'text-[#00F0FF]'
                          : 'text-[#FF9E00]'
                      }`}
                    >
                      {b.avgRelPar > 0 ? `+${b.avgRelPar}` : b.avgRelPar} / hole
                    </div>
                    <div className="text-[10px] text-slate-400">{b.holesCount} holes</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Scoring Distribution */}
            <div className="lg:col-span-5 neon-card border border-[#FF2E93]/50 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#FF2E93]" />
                  <span>Career Scoring Distribution</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Birdie, Par, Bogey, and Double+ breakdown across all logged holes.
                </p>
              </div>

              <div className="space-y-4">
                {(isSoloJeffery
                  ? [{ player: p1, profile: p1Profile, accent: '#FF2E93' }]
                  : isSoloJack
                  ? [{ player: p2, profile: p2Profile, accent: '#00F0FF' }]
                  : [
                      { player: p1, profile: p1Profile, accent: '#FF2E93' },
                      { player: p2, profile: p2Profile, accent: '#00F0FF' }
                    ]
                ).map(({ player, profile, accent }) => {
                  const totalH = Math.max(1, profile.holesPlayed);
                  const birdiePct = Math.round((profile.birdies / totalH) * 100);
                  const parPct = Math.round((profile.pars / totalH) * 100);
                  const bogeyPct = Math.round((profile.bogeys / totalH) * 100);
                  const dblPct = Math.max(0, 100 - birdiePct - parPct - bogeyPct);

                  return (
                    <div
                      key={player.id}
                      className="p-3.5 rounded-xl bg-[#080B14] border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-extrabold"
                          style={{ color: accent }}
                        >
                          {player.name} ({profile.holesPlayed} Holes)
                        </span>
                        <span className="font-mono-tabular text-xs font-bold text-slate-300">
                          {birdiePct + parPct}% Par/Better
                        </span>
                      </div>

                      <div className="w-full h-4 rounded-lg overflow-hidden flex bg-[#111629] border border-slate-800">
                        {profile.birdies > 0 && (
                          <div
                            style={{ width: `${Math.max(4, birdiePct)}%` }}
                            className="bg-[#39FF14] h-full"
                          />
                        )}
                        {profile.pars > 0 && (
                          <div
                            style={{ width: `${parPct}%` }}
                            className="bg-[#00F0FF] h-full"
                          />
                        )}
                        {profile.bogeys > 0 && (
                          <div
                            style={{ width: `${bogeyPct}%` }}
                            className="bg-[#FF9E00] h-full"
                          />
                        )}
                        {profile.doubleOrWorse > 0 && (
                          <div
                            style={{ width: `${dblPct}%` }}
                            className="bg-[#FF2E93] h-full"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center font-mono-tabular text-xs">
                        <div className="p-1.5 rounded-lg bg-[#111629] border border-[#39FF14]/40">
                          <div className="font-extrabold text-[#39FF14]">
                            {profile.birdies} ({birdiePct}%)
                          </div>
                          <div className="text-[10px] text-slate-400">Birdies</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[#111629] border border-[#00F0FF]/40">
                          <div className="font-extrabold text-[#00F0FF]">
                            {profile.pars} ({parPct}%)
                          </div>
                          <div className="text-[10px] text-slate-400">Pars</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[#111629] border border-[#FF9E00]/40">
                          <div className="font-extrabold text-[#FF9E00]">
                            {profile.bogeys} ({bogeyPct}%)
                          </div>
                          <div className="text-[10px] text-slate-400">Bogeys</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[#111629] border border-[#FF2E93]/40">
                          <div className="font-extrabold text-[#FF2E93]">
                            {profile.doubleOrWorse} ({dblPct}%)
                          </div>
                          <div className="text-[10px] text-slate-400">Double+</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(isSoloJeffery || isSoloJack) && (
                  <div className="p-3.5 rounded-xl bg-[#080B14] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#39FF14]">
                        Recent 5-Round Form ({focusPlayer.name})
                      </span>
                      <span className="font-mono-tabular text-slate-400">
                        Latest Recorded Rounds
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 text-center font-mono-tabular">
                      {trajectoryPoints
                        .filter((pt) =>
                          isSoloJack ? pt.p2Total !== null : pt.p1Total !== null
                        )
                        .slice(-5)
                        .map((pt) => {
                          const tot = isSoloJack ? pt.p2Total : pt.p1Total;
                          const rawRel = isSoloJack ? pt.p2RawRel : pt.p1RawRel;
                          return (
                            <div
                              key={pt.id}
                              className="p-1.5 rounded-lg bg-[#111629] border border-slate-800"
                            >
                              <div className="text-[9.5px] text-slate-400 truncate">
                                {pt.shortCourse.slice(0, 6)}
                              </div>
                              <div
                                className={`text-xs font-extrabold ${
                                  (rawRel || 0) <= 0
                                    ? 'text-[#39FF14]'
                                    : 'text-white'
                                }`}
                              >
                                {tot} ({formatRelativePar(rawRel || 0)})
                              </div>
                              <div className="text-[9px] text-slate-500">{pt.date}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DISC STATS SNAPSHOT ON OVERVIEW: FAVORITES, MOST USED, LEAST THROWN & WORST FAVORITES */}
          <div className="neon-card border-2 border-[#39FF14]/50 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col gap-3 border-b border-slate-800 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono-tabular uppercase text-[#39FF14] font-extrabold">
                    Scoped to Collector Card Grouping · {filteredHistory.length} Rounds
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                    🥏 Disc Stats: My Favorites, Most Used, Least Thrown &amp; Worst Favorites
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSubTab('bag_form')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#39FF14] text-slate-950 text-xs font-extrabold hover:bg-[#39FF14]/90 transition-colors self-start sm:self-auto"
                >
                  Open Full Disc Leaderboard &amp; Flight Matrix →
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'jeffery', label: '🍬 Cotton Candy' },
                    { id: 'archived', label: '📦 Backup / Vault' },
                    { id: 'jeffery_all', label: '🏆 All Jeffery Career' },
                    { id: 'jack', label: 'Jack’s Discraft' },
                    { id: 'all', label: 'Active Combined' }
                  ] as const
                ).map((grp) => (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setAnalyticsBagGroup(grp.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                      analyticsBagGroup === grp.id
                        ? 'bg-[#39FF14] text-slate-950 border-[#39FF14]'
                        : 'bg-[#080B14] text-slate-300 border-slate-700 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {grp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
              {/* Favorites */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#39FF14]/50 space-y-2">
                <div className="text-xs font-extrabold text-[#39FF14] uppercase">
                  🏆 My Favorites (Best Scoring)
                </div>
                <div className="space-y-1.5">
                  {discTelemetry.favorites.slice(0, 5).map((row, idx) => (
                    <div
                      key={row.disc.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(
                          row.disc.id,
                          row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                        )
                      }
                      className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#39FF14] cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white truncate">
                        <span className="text-[#39FF14] font-mono-tabular mr-1">
                          #{idx + 1}
                        </span>
                        {row.disc.name}
                      </span>
                      <span className="font-mono-tabular text-[#39FF14] font-bold shrink-0">
                        {row.birdies}★ ({row.birdieRate}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Used */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#00F0FF]/50 space-y-2">
                <div className="text-xs font-extrabold text-[#00F0FF] uppercase">
                  🔥 Most Used Workhorses
                </div>
                <div className="space-y-1.5">
                  {discTelemetry.mostUsed.slice(0, 5).map((row, idx) => (
                    <div
                      key={row.disc.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(
                          row.disc.id,
                          row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                        )
                      }
                      className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#00F0FF] cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white truncate">
                        <span className="text-[#00F0FF] font-mono-tabular mr-1">
                          #{idx + 1}
                        </span>
                        {row.disc.name}
                      </span>
                      <span className="font-mono-tabular text-[#00F0FF] font-bold shrink-0">
                        {row.totalHolesUsed} Holes
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Least Thrown */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#FACC15]/50 space-y-2">
                <div className="text-xs font-extrabold text-[#FACC15] uppercase">
                  🆕 Least Thrown (Newest)
                </div>
                <div className="space-y-1.5">
                  {discTelemetry.leastThrown.slice(0, 5).map((row) => (
                    <div
                      key={row.disc.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(
                          row.disc.id,
                          row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                        )
                      }
                      className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#FACC15] cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white truncate">
                        {row.disc.name}
                      </span>
                      <span className="font-mono-tabular text-[#FACC15] font-bold shrink-0">
                        {row.totalHolesUsed}{' '}
                        {row.totalHolesUsed === 1 ? 'Hole' : 'Holes'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Least Favorite / Toughest */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#FF2E93]/50 space-y-2">
                <div className="text-xs font-extrabold text-[#FF2E93] uppercase">
                  ⚠️ Least Favorite / Toughest
                </div>
                <div className="space-y-1.5">
                  {discTelemetry.leastFavorite.slice(0, 5).map((row) => (
                    <div
                      key={row.disc.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(
                          row.disc.id,
                          row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                        )
                      }
                      className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#FF2E93] cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white truncate">
                        {row.disc.name}
                        {row.disc.archived ? ' (Vault)' : ''}
                      </span>
                      <span className="font-mono-tabular text-[#FF2E93] font-bold shrink-0">
                        Avg{' '}
                        {row.avgRelPar !== null
                          ? row.avgRelPar > 0
                            ? `+${row.avgRelPar}`
                            : row.avgRelPar
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Course Personal Bests & Averages Table */}
          <div className="neon-card border border-[#00F0FF]/40 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-white">
                Course Personal Bests &amp; Averages ({uniqueCourseNames.length} Played Courses)
              </h3>
              <span className="text-xs text-slate-400">
                Click any course row to open its Hole-by-Hole Graph
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono-tabular">
                <thead>
                  <tr className="border-b border-slate-800 text-[#00F0FF] font-sans">
                    <th className="py-2.5 pr-3">Course Name</th>
                    <th className="py-2.5 px-3 text-right">Rounds</th>
                    {showJeffery && (
                      <>
                        <th className="py-2.5 px-3 text-right text-[#FF2E93]">{p1.name} PB</th>
                        <th className="py-2.5 px-3 text-right">{p1.name} Avg</th>
                      </>
                    )}
                    {showJack && (
                      <>
                        <th className="py-2.5 px-3 text-right text-[#00F0FF]">{p2.name} PB</th>
                        <th className="py-2.5 pl-3 text-right">{p2.name} Avg</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {uniqueCourseNames.map((courseName) => {
                    const p1Stat = getCoursePersonalBest(courseName, p1.id, history);
                    const p2Stat = getCoursePersonalBest(courseName, p2.id, history);
                    const roundsHere = history.filter(
                      (r) => r.courseName === courseName
                    ).length;

                    return (
                      <tr
                        key={courseName}
                        onClick={() => {
                          setSelectedCourseDetail(courseName);
                          setSubTab('courses');
                        }}
                        className="hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="py-3 pr-3 font-sans font-bold text-white">
                          {courseName}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {roundsHere}
                        </td>
                        {showJeffery && (
                          <>
                            <td className="py-3 px-3 text-right font-bold text-[#39FF14]">
                              {p1Stat.bestTotal !== null
                                ? `${p1Stat.bestTotal} (${formatRelativePar(
                                    p1Stat.bestRelPar || 0
                                  )})`
                                : '—'}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-300">
                              {p1Stat.avgTotal ?? '—'}
                            </td>
                          </>
                        )}
                        {showJack && (
                          <>
                            <td className="py-3 px-3 text-right font-bold text-[#00F0FF]">
                              {p2Stat.bestTotal !== null
                                ? `${p2Stat.bestTotal} (${formatRelativePar(
                                    p2Stat.bestRelPar || 0
                                  )})`
                                : '—'}
                            </td>
                            <td className="py-3 pl-3 text-right text-slate-300">
                              {p2Stat.avgTotal ?? '—'}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 2: COURSE HOLE-BY-HOLE GRAPHS & STROKE-SAVING LEAKS         */}
      {/* =================================================================== */}
      {subTab === 'courses' && (
        <div className="space-y-6">
          {/* Interactive Course Selector & Hole-by-Hole Comparison Graph */}
          <div className="neon-card border-2 border-[#00F0FF]/50 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-white">
                  Course Hole-by-Hole Graph &amp; Caddie Sheet
                </h3>
                <p className="text-xs text-slate-400">
                  Select any played course to inspect hole-by-hole average scores, personal
                  bests, and verified disc picks.
                </p>
                {onOpenCourseAtlas && (
                  <button
                    type="button"
                    onClick={() => onOpenCourseAtlas(activeCourseDetailName)}
                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF] text-slate-950 text-xs font-extrabold zine-pill-btn"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Open Visual Course Layout &amp; Hole History ({activeCourseDetailName}) →</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueCourseNames.map((cName) => {
                  const isSelected = cName === activeCourseDetailName;
                  const count = history.filter((r) => r.courseName === cName).length;
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setSelectedCourseDetail(cName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        isSelected
                          ? 'bg-[#00F0FF] text-slate-950 shadow-sm'
                          : 'bg-[#080B14] text-slate-300 border border-slate-800 hover:border-[#00F0FF]'
                      }`}
                    >
                      {cName.replace(' Flying Disc', '')} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Course Summary Strip */}
            <div
              className={`grid grid-cols-2 ${
                isSoloJeffery || isSoloJack ? 'sm:grid-cols-3' : 'sm:grid-cols-4'
              } gap-3 font-mono-tabular`}
            >
              <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800">
                <div className="text-[11px] font-sans font-bold text-slate-400">
                  Course Par / Distance
                </div>
                <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  Par {courseHoleBreakdown.totalPar} ·{' '}
                  {courseHoleBreakdown.totalDist.toLocaleString()} ft
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800">
                <div className="text-[11px] font-sans font-bold text-slate-400">
                  Rounds Logged Here
                </div>
                <div className="text-base sm:text-lg font-extrabold text-[#39FF14] mt-0.5">
                  {courseHoleBreakdown.roundsCount}{' '}
                  {courseHoleBreakdown.roundsCount === 1 ? 'Round' : 'Rounds'}
                </div>
              </div>
              {showJeffery && (
                <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800">
                  <div className="text-[11px] font-sans font-bold text-slate-400">
                    {p1.name} PB / Avg
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-[#FF2E93] mt-0.5">
                    {courseHoleBreakdown.p1CoursePB.bestTotal !== null
                      ? `${courseHoleBreakdown.p1CoursePB.bestTotal} (${formatRelativePar(
                          courseHoleBreakdown.p1CoursePB.bestRelPar || 0
                        )}) · Avg ${courseHoleBreakdown.p1CoursePB.avgTotal}`
                      : '—'}
                  </div>
                </div>
              )}
              {showJack && (
                <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800">
                  <div className="text-[11px] font-sans font-bold text-slate-400">
                    {p2.name} PB / Avg
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-[#00F0FF] mt-0.5">
                    {courseHoleBreakdown.p2CoursePB.bestTotal !== null
                      ? `${courseHoleBreakdown.p2CoursePB.bestTotal} (${formatRelativePar(
                          courseHoleBreakdown.p2CoursePB.bestRelPar || 0
                        )}) · Avg ${courseHoleBreakdown.p2CoursePB.avgTotal}`
                      : 'Solo Only'}
                  </div>
                </div>
              )}
            </div>

            {/* Course Summary, Commentary Takeaways & Conditions/Wind Recap */}
            {(() => {
              const summary = buildCourseSummary(activeCourseDetailName, history, bag);
              return (
                <div className="p-4 rounded-xl bg-[#080B14] border border-[#39FF14]/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-extrabold text-[#39FF14]">
                      📋 Course Summary &amp; Commentary Recap — {activeCourseDetailName}
                    </div>
                    {summary.topGoToDiscs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-tabular">
                        <span className="text-slate-400 font-bold">Go-To Discs:</span>
                        {summary.topGoToDiscs.map((d) => (
                          <span
                            key={d.name}
                            className="px-2 py-0.5 rounded bg-[#111629] border border-[#00F0FF]/40 text-[#00F0FF] font-bold"
                          >
                            {d.name} ({d.count}×)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {summary.courseVibe}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#111629] border border-slate-800 space-y-1.5">
                      <div className="font-extrabold text-[#00F0FF]">
                        🎙️ Key Commentary Takeaways &amp; Course Highlights
                      </div>
                      <ul className="space-y-1 text-slate-200 list-disc list-inside">
                        {summary.commentaryHighlights.map((item, i) => (
                          <li key={i} className="leading-snug">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-[#111629] border border-slate-800 space-y-2">
                      <div>
                        <div className="font-extrabold text-[#FACC15]">
                          🌤️ Weather, Wind &amp; Round Conditions Recap
                        </div>
                        <p className="text-slate-200 leading-snug mt-0.5">
                          {summary.conditionsAndWindRecap}
                        </p>
                      </div>
                      {summary.bestScoringHoles.length > 0 && (
                        <div className="pt-1 border-t border-slate-800/80 flex flex-wrap gap-2 font-mono-tabular text-[11px]">
                          <span className="text-[#39FF14] font-bold">
                            ★ Best Scoring Holes:{' '}
                            {summary.bestScoringHoles
                              .map((h) => `H${h.holeNumber} (Avg ${h.avgScore})`)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Visual Hole-by-Hole Bar Chart */}
            <div className="p-4 rounded-xl bg-[#080B14] border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-extrabold text-white">
                  Hole-by-Hole Average Score — {activeCourseDetailName}
                </span>
                <div className="flex items-center gap-4 font-bold">
                  {showJeffery && (
                    <span className="inline-flex items-center gap-1.5 text-[#39FF14]">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#39FF14]" />
                      {p1.name} Avg
                    </span>
                  )}
                  {showJack && (
                    <span className="inline-flex items-center gap-1.5 text-[#00F0FF]">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#00F0FF]" />
                      {p2.name} Avg
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[#FACC15]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FACC15]" />
                    Hole Par
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-9 sm:grid-cols-9 md:grid-cols-18 gap-2 pt-2 items-end">
                {courseHoleBreakdown.holeRows.map((h) => {
                  const maxScale = 7;
                  const p1H = h.p1Avg ? Math.min(100, (h.p1Avg / maxScale) * 100) : 0;
                  const p2H = h.p2Avg ? Math.min(100, (h.p2Avg / maxScale) * 100) : 0;
                  const parH = Math.min(100, (h.par / maxScale) * 100);

                  return (
                    <div
                      key={h.holeNumber}
                      className="flex flex-col items-center space-y-1 p-1.5 rounded-lg bg-[#111629] border border-slate-800/80"
                    >
                      <div className="h-28 w-full flex items-end justify-center gap-1 px-0.5">
                        {showJeffery && (
                          <div
                            style={{ height: `${p1H}%` }}
                            title={`${p1.name} Avg: ${h.p1Avg ?? '—'}`}
                            className={`w-2.5 rounded-t ${
                              h.p1Avg !== null && h.p1Avg < h.par
                                ? 'bg-[#39FF14]'
                                : h.p1Avg !== null && h.p1Avg <= h.par + 0.3
                                ? 'bg-[#00F0FF]'
                                : 'bg-[#FF2E93]'
                            }`}
                          />
                        )}
                        {showJack && h.p2Avg !== null && (
                          <div
                            style={{ height: `${p2H}%` }}
                            title={`${p2.name} Avg: ${h.p2Avg}`}
                            className="w-2.5 rounded-t bg-[#00F0FF]/85"
                          />
                        )}
                        <div
                          style={{ height: `${parH}%` }}
                          title={`Par ${h.par}`}
                          className="w-1.5 rounded-t bg-[#FACC15]/80"
                        />
                      </div>
                      <div className="text-[10px] font-mono-tabular font-extrabold text-white">
                        H{h.holeNumber}
                      </div>
                      <div
                        className={`text-[9px] font-mono-tabular font-bold ${
                          isSoloJack ? 'text-[#00F0FF]' : 'text-[#39FF14]'
                        }`}
                      >
                        {(isSoloJack ? h.p2Avg : h.p1Avg) ?? '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Hole-by-Hole Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono-tabular">
                <thead>
                  <tr className="border-b border-slate-800 text-[#00F0FF] font-sans">
                    <th className="py-2.5 px-3">Hole</th>
                    <th className="py-2.5 px-3">Par / Dist</th>
                    {showJeffery && (
                      <th className="py-2.5 px-3 text-right">{p1.name} Avg / Best</th>
                    )}
                    {showJack && (
                      <th className="py-2.5 px-3 text-right">{p2.name} Avg / Best</th>
                    )}
                    <th className="py-2.5 px-3">★ Verified Tee Disc</th>
                    <th className="py-2.5 px-3">Hole Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {courseHoleBreakdown.holeRows.map((h) => (
                    <tr key={h.holeNumber} className="hover:bg-white/5">
                      <td className="py-2.5 px-3 font-extrabold text-white">
                        #{h.holeNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Par {h.par} · <span className="text-[#00F0FF]">{h.distance}ft</span>
                      </td>
                      {showJeffery && (
                        <td className="py-2.5 px-3 text-right font-bold">
                          {h.p1Avg !== null ? (
                            <span
                              className={
                                h.p1Avg <= h.par ? 'text-[#39FF14]' : 'text-[#FF9E00]'
                              }
                            >
                              {h.p1Avg} (Best: {h.p1Best})
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                      {showJack && (
                        <td className="py-2.5 px-3 text-right text-[#00F0FF] font-bold">
                          {h.p2Avg !== null ? `${h.p2Avg} (Best: ${h.p2Best})` : '—'}
                        </td>
                      )}
                      <td className="py-2.5 px-3 font-sans font-extrabold text-[#39FF14]">
                        {isSoloJack
                          ? h.distance < 175
                            ? '174g Discraft Roach'
                            : h.distance < 245
                            ? '175g Discraft Buzzz SS'
                            : '170g Discraft Cicada'
                          : h.topDisc}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {h.hint}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highest-Priority Stroke-Saving Leak Holes Table */}
          {topLeakHoles.length > 0 && (
            <div className="neon-card border border-[#FF2E93]/50 rounded-2xl p-5 space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Highest-ROI Stroke-Saving Holes Across Active Courses ({focusPlayer.name})
                </h3>
                <p className="text-xs text-slate-400">
                  Holes with 2+ logged plays where {focusPlayer.name} averages the most strokes over
                  par, paired with the verified disc fix.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono-tabular">
                  <thead>
                    <tr className="border-b border-slate-800 text-[#00F0FF] font-sans">
                      <th className="py-2.5 px-3">Course &amp; Hole</th>
                      <th className="py-2.5 px-3">Par / Distance</th>
                      <th className="py-2.5 px-3 text-right">Avg (vs Par)</th>
                      <th className="py-2.5 px-3 text-right">Bogey+ Rate</th>
                      <th className="py-2.5 px-3">Verified Disc Gameplan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {topLeakHoles.map((lk) => (
                      <tr key={`${lk.courseName}-${lk.holeNumber}`} className="hover:bg-white/5">
                        <td className="py-2.5 px-3 font-sans font-bold text-[#FACC15]">
                          {lk.courseName} #{lk.holeNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          Par {lk.par} · {lk.distance} ft
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-[#FF2E93]">
                          {lk.avgScore} (+{lk.avgOverPar})
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {lk.bogeyPct}% ({lk.plays} plays)
                        </td>
                        <td className="py-2.5 px-3 font-sans font-bold text-[#39FF14]">
                          {lk.recommendedDisc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 3: HEAD-TO-HEAD RIVALRY & SKINS                             */}
      {/* =================================================================== */}
      {subTab === 'rivalry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Skins Breakdown Visual Card */}
            <div className="lg:col-span-5 neon-card border border-[#39FF14]/50 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-mono-tabular uppercase text-[#00F0FF] font-extrabold">
                  Duo Telemetry · {h2hTelemetry.sharedMatches.length} Shared Rounds (
                  {h2hTelemetry.totalSharedHoles} Holes)
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">
                  Head-to-Head Skins &amp; Match Record
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Across {h2hTelemetry.sharedMatches.length} shared rounds, {p1.name} holds a{' '}
                  <strong className="text-[#39FF14]">
                    {h2hTelemetry.p1Wins}–{h2hTelemetry.p2Wins}–{h2hTelemetry.ties}
                  </strong>{' '}
                  record ({formatRelativePar(h2hTelemetry.strokeDiff)} stroke differential).
                </p>
              </div>

              {/* Stacked Horizontal Skins Bar */}
              {h2hTelemetry.totalSharedHoles > 0 && (() => {
                const p1Pct = Math.round(
                  (h2hTelemetry.p1Skins / h2hTelemetry.totalSharedHoles) * 100
                );
                const pushPct = Math.round(
                  (h2hTelemetry.pushedSkins / h2hTelemetry.totalSharedHoles) * 100
                );
                const p2Pct = Math.max(0, 100 - p1Pct - pushPct);

                return (
                  <div className="space-y-3 bg-[#080B14] border border-slate-800 rounded-xl p-4">
                    <div className="text-xs font-bold text-white">
                      Hole-by-Hole Skins Share ({h2hTelemetry.totalSharedHoles} Shared Holes)
                    </div>
                    <div className="w-full h-6 rounded-xl overflow-hidden flex border border-slate-700">
                      <div
                        style={{ width: `${p1Pct}%` }}
                        className="bg-[#39FF14] h-full"
                        title={`${p1.name}: ${h2hTelemetry.p1Skins}`}
                      />
                      <div
                        style={{ width: `${pushPct}%` }}
                        className="bg-slate-600 h-full"
                        title={`Pushed: ${h2hTelemetry.pushedSkins}`}
                      />
                      <div
                        style={{ width: `${p2Pct}%` }}
                        className="bg-[#00F0FF] h-full"
                        title={`${p2.name}: ${h2hTelemetry.p2Skins}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center font-mono-tabular pt-1">
                      <div className="p-2.5 rounded-xl bg-[#111629] border border-[#39FF14]/50">
                        <div className="text-[10px] font-sans font-bold text-[#39FF14]">
                          {p1.name} Skins
                        </div>
                        <div className="text-base font-extrabold text-white">
                          {h2hTelemetry.p1Skins} ({p1Pct}%)
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#111629] border border-slate-700">
                        <div className="text-[10px] font-sans font-bold text-slate-300">
                          Pushed / Tied
                        </div>
                        <div className="text-base font-extrabold text-white">
                          {h2hTelemetry.pushedSkins} ({pushPct}%)
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#111629] border border-[#00F0FF]/50">
                        <div className="text-[10px] font-sans font-bold text-[#00F0FF]">
                          {p2.name} Skins
                        </div>
                        <div className="text-base font-extrabold text-white">
                          {h2hTelemetry.p2Skins} ({p2Pct}%)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Shared Match Differential Bar Chart */}
            <div className="lg:col-span-7 neon-card border border-[#00F0FF]/50 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Shared Duo Match Differential Graph ({h2hTelemetry.sharedMatches.length}{' '}
                  Matches)
                </h3>
                <p className="text-xs text-slate-400">
                  Green bars show {p1.name}&apos;s winning margin; cyan bars show {p2.name}
                  &apos;s wins; gold marks tied rounds (11/01 Black Hoof 34–34).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#080B14] border border-slate-800 overflow-x-auto">
                <div className="flex items-end gap-2 min-w-[540px] h-52 pt-6 pb-2">
                  {h2hTelemetry.sharedMatches.map((m) => {
                    const absMargin = Math.abs(m.margin);
                    const barH = Math.max(12, Math.min(100, (absMargin / 14) * 100));
                    const isP1Win = m.margin > 0;
                    const isTie = m.margin === 0;

                    return (
                      <div
                        key={m.id}
                        className="flex-1 flex flex-col items-center justify-end h-full min-w-[24px]"
                      >
                        <span
                          className={`text-[10px] font-mono-tabular font-extrabold mb-1 ${
                            isTie
                              ? 'text-[#FACC15]'
                              : isP1Win
                              ? 'text-[#39FF14]'
                              : 'text-[#00F0FF]'
                          }`}
                        >
                          {isTie ? 'TIE' : isP1Win ? `+${m.margin}` : m.margin}
                        </span>
                        <div
                          style={{ height: `${barH}%` }}
                          title={`${m.date} · ${m.courseName}: ${p1.name} ${m.p1Total} vs ${p2.name} ${m.p2Total}`}
                          className={`w-full max-w-[26px] rounded-t-md border ${
                            isTie
                              ? 'bg-[#FACC15]/80 border-[#FACC15]'
                              : isP1Win
                              ? 'bg-[#39FF14]/80 border-[#39FF14]'
                              : 'bg-[#00F0FF]/80 border-[#00F0FF]'
                          }`}
                        />
                        <span className="text-[9px] font-mono-tabular text-slate-400 mt-1.5">
                          {m.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Complete Head-to-Head Matchup Table */}
          <div className="neon-card border border-slate-800 rounded-2xl p-5">
            <h3 className="text-base font-extrabold text-white mb-3">
              All Shared Head-to-Head Rounds ({h2hTelemetry.sharedMatches.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono-tabular">
                <thead>
                  <tr className="border-b border-slate-800 text-[#00F0FF] font-sans">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3 text-right">{p1.name}</th>
                    <th className="py-2.5 px-3 text-right">{p2.name}</th>
                    <th className="py-2.5 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {[...h2hTelemetry.sharedMatches].reverse().map((m) => {
                    const isTie = m.margin === 0;
                    const isP1Win = m.margin > 0;
                    return (
                      <tr key={m.id} className="hover:bg-white/5">
                        <td className="py-2.5 px-3 text-slate-300">{m.date}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white">
                          {m.courseName} ({m.holesCount}H)
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-[#39FF14]">
                          {m.p1Total} ({formatRelativePar(m.p1Total - m.par)})
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-[#00F0FF]">
                          {m.p2Total} ({formatRelativePar(m.p2Total - m.par)})
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans font-extrabold">
                          {isTie ? (
                            <span className="px-2 py-0.5 rounded bg-[#FACC15]/20 border border-[#FACC15] text-[#FACC15]">
                              Tied ({m.p1Total}–{m.p2Total})
                            </span>
                          ) : isP1Win ? (
                            <span className="px-2 py-0.5 rounded bg-[#39FF14]/20 border border-[#39FF14] text-[#39FF14]">
                              {p1.name} +{m.margin}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF]">
                              {p2.name} +{Math.abs(m.margin)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 4: DISC STATS, FAVORITES, LOADOUT BUILDER & FLIGHT MATRIX    */}
      {/* =================================================================== */}
      {subTab === 'bag_form' && (
        <div className="space-y-6">
          {/* Complete Disc Stats: Favorites, Most Used, Least Thrown, Least Favorite & Sortable Leaderboard */}
          <div className="neon-card border-2 border-[#00F0FF]/60 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col gap-3 pb-3 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono-tabular uppercase text-[#00F0FF] font-extrabold">
                    Scoped to Collector Card Grouping · {filteredHistory.length} Logged Rounds
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">
                    🥏 Complete Disc Stats: My Favorites, Most Used, Least Thrown &amp; Worst Favorites
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'most_used', label: '🔥 Most Used' },
                      { id: 'favorites', label: '🏆 Best Avg vs Par' },
                      { id: 'birdies', label: '★ Most Birdies' },
                      { id: 'least_thrown', label: '🆕 Least Thrown' }
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDiscSortBy(opt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                        discSortBy === opt.id
                          ? 'bg-[#39FF14] text-slate-950'
                          : 'bg-[#080B14] text-slate-300 border border-slate-800 hover:border-[#00F0FF]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'jeffery', label: '🍬 Cotton Candy' },
                    { id: 'archived', label: '📦 Backup / Vault' },
                    { id: 'jeffery_all', label: '🏆 All Jeffery Career' },
                    { id: 'jack', label: 'Jack’s Discraft' },
                    { id: 'all', label: 'Active Combined' }
                  ] as const
                ).map((grp) => (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setAnalyticsBagGroup(grp.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                      analyticsBagGroup === grp.id
                        ? 'bg-[#00F0FF] text-slate-950 border-[#00F0FF]'
                        : 'bg-[#080B14] text-slate-300 border-slate-700 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {grp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4-Column Detailed Superlative Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
              {/* Favorites */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#39FF14]/50 space-y-2">
                <div className="text-xs font-extrabold text-[#39FF14] uppercase">
                  🏆 My Favorites (Best Scoring)
                </div>
                <div className="space-y-2">
                  {discTelemetry.favorites.slice(0, 6).map((row, idx) => (
                    <div
                      key={row.disc.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(
                          row.disc.id,
                          row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                        )
                      }
                      className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#39FF14] cursor-pointer space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-white truncate">
                          <span className="text-[#39FF14] font-mono-tabular mr-1">
                            #{idx + 1}
                          </span>
                          {row.disc.weightGrams ? `${row.disc.weightGrams}g ` : ''}
                          {row.disc.name}
                        </span>
                        <span className="font-mono-tabular font-extrabold text-[#39FF14] shrink-0">
                          {row.birdies}★ ({row.birdieRate}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono-tabular text-slate-400">
                        <span>{row.topCourse}</span>
                        <span>
                          {row.totalHolesUsed}H · Avg{' '}
                          {row.avgRelPar !== null
                            ? row.avgRelPar > 0
                              ? `+${row.avgRelPar}`
                              : row.avgRelPar
                            : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Used */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#00F0FF]/50 space-y-2">
                <div className="text-xs font-extrabold text-[#00F0FF] uppercase">
                  🔥 Most Used Workhorses
                </div>
                <div className="space-y-2">
                  {discTelemetry.mostUsed.map((row, idx) => (
                    <div
                      key={row.disc.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(
                          row.disc.id,
                          row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                        )
                      }
                      className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#00F0FF] cursor-pointer space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-white truncate">
                          <span className="text-[#00F0FF] font-mono-tabular mr-1">
                            #{idx + 1}
                          </span>
                          {row.disc.weightGrams ? `${row.disc.weightGrams}g ` : ''}
                          {row.disc.name}
                        </span>
                        <span className="font-mono-tabular font-extrabold text-[#00F0FF] shrink-0">
                          {row.totalHolesUsed} Holes
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono-tabular text-slate-400">
                        <span>
                          {row.teeAndFairwayThrows} Tee · {row.puttAndApproachThrows}{' '}
                          Putt/App
                        </span>
                        <span className="text-[#39FF14] font-bold">
                          {row.birdies} Birdies
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Least Thrown */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#FACC15]/50 space-y-2">
                <div className="text-xs font-extrabold text-[#FACC15] uppercase">
                  🆕 Least Thrown (Newest / Specialty)
                </div>
                <div className="space-y-2">
                  {discTelemetry.leastThrown.map((row) => (
                    <div
                      key={row.disc.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(
                          row.disc.id,
                          row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                        )
                      }
                      className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#FACC15] cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-extrabold text-white truncate">
                          {row.disc.weightGrams ? `${row.disc.weightGrams}g ` : ''}
                          {row.disc.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          [{row.disc.speed}|{row.disc.glide}|{row.disc.turn}|{row.disc.fade}] ·{' '}
                          {row.topCourse}
                        </div>
                      </div>
                      <span className="font-mono-tabular font-extrabold text-[#FACC15] shrink-0">
                        {row.totalHolesUsed}{' '}
                        {row.totalHolesUsed === 1 ? 'Hole' : 'Holes'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Least Favorite / Toughest */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#FF2E93]/50 space-y-2">
                <div className="text-xs font-extrabold text-[#FF2E93] uppercase">
                  ⚠️ Least Favorite / Toughest
                </div>
                <div className="space-y-2">
                  {discTelemetry.leastFavorite.map((row) => (
                    <div
                      key={row.disc.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(
                          row.disc.id,
                          row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                        )
                      }
                      className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#FF2E93] cursor-pointer space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-white truncate">
                          {row.disc.weightGrams ? `${row.disc.weightGrams}g ` : ''}
                          {row.disc.name}
                          {row.disc.archived ? ' (Vault)' : ''}
                        </span>
                        <span className="font-mono-tabular font-extrabold text-[#FF2E93] shrink-0">
                          Avg{' '}
                          {row.avgRelPar !== null
                            ? row.avgRelPar > 0
                              ? `+${row.avgRelPar}`
                              : row.avgRelPar
                            : '—'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                        {row.commentaryVerdict}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full All-Discs Leaderboard Table */}
            <div className="overflow-x-auto pt-2 border-t border-slate-800">
              <table className="w-full text-left border-collapse text-xs font-mono-tabular">
                <thead>
                  <tr className="border-b border-slate-700 text-[#00F0FF] bg-[#080B14]">
                    <th className="py-2.5 px-3 font-sans">Disc</th>
                    <th className="py-2.5 px-2 text-center">Flight</th>
                    <th className="py-2.5 px-2 text-right">Holes Used</th>
                    <th className="py-2.5 px-2 text-right">Tee / Fairway</th>
                    <th className="py-2.5 px-2 text-right">Birdies</th>
                    <th className="py-2.5 px-2 text-right">Par+ %</th>
                    <th className="py-2.5 px-2 text-right">Avg vs Par</th>
                    <th className="py-2.5 px-3 font-sans">Commentary &amp; Flight Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {[...discTelemetry.allRows]
                    .sort((a, b) => {
                      if (discSortBy === 'most_used') {
                        return b.totalHolesUsed - a.totalHolesUsed;
                      }
                      if (discSortBy === 'birdies') {
                        return b.birdies - a.birdies || b.birdieRate - a.birdieRate;
                      }
                      if (discSortBy === 'least_thrown') {
                        return a.totalHolesUsed - b.totalHolesUsed;
                      }
                      return (a.avgRelPar ?? 99) - (b.avgRelPar ?? 99);
                    })
                    .map((row) => (
                      <tr
                        key={row.disc.id}
                        onClick={() =>
                          onOpenBagGuide &&
                          onOpenBagGuide(
                            row.disc.id,
                            row.disc.ownerId === 'jack' ? 'jack' : 'jeffery'
                          )
                        }
                        className="hover:bg-white/5 cursor-pointer"
                      >
                        <td className="py-2 px-3 font-sans font-extrabold text-white whitespace-nowrap">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: row.disc.colorHex }}
                          />
                          {row.disc.weightGrams ? `${row.disc.weightGrams}g ` : ''}
                          {row.disc.name}
                          {row.disc.archived && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                              Vault
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-300 whitespace-nowrap">
                          [{row.disc.speed}|{row.disc.glide}|{row.disc.turn}|{row.disc.fade}]
                        </td>
                        <td className="py-2 px-2 text-right font-extrabold text-[#00F0FF]">
                          {row.totalHolesUsed}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-300">
                          {row.teeAndFairwayThrows}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-[#39FF14]">
                          {row.birdies} ({row.birdieRate}%)
                        </td>
                        <td className="py-2 px-2 text-right text-slate-200">
                          {row.parOrBetterRate}%
                        </td>
                        <td
                          className={`py-2 px-2 text-right font-extrabold ${
                            (row.avgRelPar ?? 1) <= 0.25
                              ? 'text-[#39FF14]'
                              : (row.avgRelPar ?? 1) <= 0.55
                              ? 'text-[#00F0FF]'
                              : 'text-[#FF2E93]'
                          }`}
                        >
                          {row.avgRelPar !== null
                            ? row.avgRelPar > 0
                              ? `+${row.avgRelPar}`
                              : row.avgRelPar
                            : '—'}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-300">
                          {row.commentaryVerdict}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive 9-Disc Adventure Pack & Jack Discraft Loadout Simulator */}
          <div className="neon-card border-2 border-[#39FF14]/60 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono-tabular uppercase text-[#39FF14] font-extrabold">
                  {isSoloJack || loadoutPreset === 'jack-discraft'
                    ? 'Jack’s 3-Disc Discraft Lineup (1010 Order #277696)'
                    : '9-Disc Adventure Pack & Jack Discraft Loadout Builder'}
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">
                  {isSoloJack || loadoutPreset === 'jack-discraft'
                    ? 'Jack’s Active 3-Disc Discraft Arsenal'
                    : 'Course-Specific Active Loadout Presets'}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'all-around', label: '⭐ Optimal Core 9' },
                    { id: 'short-wooded', label: '🌲 Short Technical' },
                    { id: 'open-bomber', label: '🚀 Long Bomber (Prairie/Cedar/Mize)' },
                    { id: 'jack-discraft', label: '⚡ Jack’s Discraft Trio' }
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLoadoutPreset(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      loadoutPreset === p.id
                        ? p.id === 'jack-discraft'
                          ? 'bg-[#00F0FF] text-slate-950 shadow-sm'
                          : 'bg-[#39FF14] text-slate-950 shadow-sm'
                        : 'bg-[#080B14] text-slate-300 border border-slate-800 hover:border-[#39FF14]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const activePresetKey: LoadoutPresetKey = isSoloJack
                ? 'jack-discraft'
                : loadoutPreset;
              const preset = LOADOUT_PRESETS[activePresetKey];
              return (
                <>
                  <div className="p-3.5 rounded-xl bg-[#080B14] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div
                        className={`text-sm font-extrabold ${
                          activePresetKey === 'jack-discraft'
                            ? 'text-[#00F0FF]'
                            : 'text-[#39FF14]'
                        }`}
                      >
                        {preset.title}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{preset.subtitle}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#FACC15]/15 border border-[#FACC15]/40 text-[#FACC15] text-xs font-mono-tabular font-bold shrink-0">
                      {preset.reserveNote}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {preset.discIds.map((slot, idx) => {
                      const d = bag.find((item) => item.id === slot.id);
                      if (!d) return null;
                      const cardImg = getDiscCardImageUrl(d);

                      return (
                        <div
                          key={slot.id}
                          onClick={() =>
                            onOpenBagGuide &&
                            onOpenBagGuide(
                              d.id,
                              d.ownerId === 'jack' ? 'jack' : 'jeffery'
                            )
                          }
                          className="p-3 rounded-xl bg-[#080B14] border border-slate-800 hover:border-[#00F0FF] cursor-pointer transition-all flex items-center gap-3"
                        >
                          {cardImg && (
                            <img
                              src={cardImg}
                              alt={d.name}
                              className="w-12 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-mono-tabular font-bold text-[#00F0FF]">
                              Slot #{idx + 1} · [{d.speed}|{d.glide}|{d.turn}|{d.fade}]
                            </div>
                            <div className="text-sm font-extrabold text-white truncate">
                              {d.weightGrams ? `${d.weightGrams}g ` : ''}
                              {d.name}
                            </div>
                            <div className="text-[11px] text-slate-300 leading-tight mt-0.5">
                              {slot.role}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* When in Duo mode and viewing one of Jeffery's 9-disc presets, also show Jack's 3-Disc Discraft Lineup right below! */}
                  {statsPlayerScope === 'both' && activePresetKey !== 'jack-discraft' && (
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-extrabold text-[#00F0FF]">
                            ⚡ {p2.name}’s 3-Disc Discraft Active Lineup (Order #277696)
                          </div>
                          <p className="text-xs text-slate-400">
                            {p2.name}’s core Putter, Midrange, and Fairway Driver trio (click any card to inspect or flip).
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSetPlayerScope('jack')}
                          className="px-3 py-1 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-xs font-extrabold hover:bg-[#00F0FF]/25 transition-colors self-start sm:self-auto"
                        >
                          👤 Focus on Just {p2.name} →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {JACK_DISCRAFT_SLOTS.map((slot, idx) => {
                          const d = bag.find((item) => item.id === slot.id);
                          if (!d) return null;
                          const cardImg = getDiscCardImageUrl(d);

                          return (
                            <div
                              key={slot.id}
                              onClick={() =>
                                onOpenBagGuide && onOpenBagGuide(d.id, 'jack')
                              }
                              className="p-3 rounded-xl bg-[#080B14] border border-[#00F0FF]/50 hover:border-[#39FF14] cursor-pointer transition-all flex items-center gap-3"
                            >
                              {cardImg && (
                                <img
                                  src={cardImg}
                                  alt={d.name}
                                  className="w-12 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-mono-tabular font-bold text-[#00F0FF]">
                                  Jack Slot #{idx + 1} · [{d.speed}|{d.glide}|{d.turn}|{d.fade}]
                                </div>
                                <div className="text-sm font-extrabold text-white truncate">
                                  {d.weightGrams ? `${d.weightGrams}g ` : ''}
                                  {d.name}
                                </div>
                                <div className="text-[11px] text-slate-300 leading-tight mt-0.5">
                                  {slot.role}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* 2D Flight Matrix Scatter Plot (Speed Y vs Net Stability X) */}
          <div className="neon-card border border-[#00F0FF]/50 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                🧭 2D Flight Matrix Graph: Speed (Y) vs. Net Stability Turn+Fade (X)
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing all {activeDiscs.length} active discs. Left = Overstable (+Fade),
                Center = Neutral (0), Right = Understable (-Turn).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#080B14] border border-slate-800 overflow-x-auto">
              <svg viewBox="0 0 700 320" className="w-full min-w-[580px] h-72 overflow-visible">
                {/* Horizontal Speed Grid Lines (Speed 2 to 11) */}
                {[11, 9, 7, 5, 3].map((spd) => {
                  const y = 30 + ((12 - spd) / 10) * 240;
                  return (
                    <g key={spd}>
                      <line
                        x1={60}
                        y1={y}
                        x2={660}
                        y2={y}
                        stroke="#1E293B"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={50}
                        y={y + 4}
                        textAnchor="end"
                        fill="#94A3B8"
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        SPD {spd}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Stability Grid Lines (+3 Overstable on Left -> -4 Understable on Right) */}
                {[
                  { net: 3, label: '+3 OS (Left Fade)' },
                  { net: 1, label: '+1 Stable' },
                  { net: 0, label: '0 Neutral' },
                  { net: -2, label: '-2 Turn' },
                  { net: -4, label: '-4 US (Right Turn)' }
                ].map((col) => {
                  const x = 60 + ((3.5 - col.net) / 8) * 600;
                  return (
                    <g key={col.net}>
                      <line
                        x1={x}
                        y1={20}
                        x2={x}
                        y2={280}
                        stroke={col.net === 0 ? '#00F0FF' : '#1E293B'}
                        strokeDasharray={col.net === 0 ? '6 4' : '3 3'}
                      />
                      <text
                        x={x}
                        y={302}
                        textAnchor="middle"
                        fill={col.net === 0 ? '#00F0FF' : '#94A3B8'}
                        fontSize="10.5"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {col.label}
                      </text>
                    </g>
                  );
                })}

                {/* Disc Nodes */}
                {activeDiscs.map((d, i) => {
                  const net = d.turn + d.fade;
                  const baseX = 60 + ((3.5 - net) / 8) * 600;
                  const baseY = 30 + ((12 - d.speed) / 10) * 240;
                  const jitterX = ((i % 3) - 1) * 12;
                  const cx = Math.max(70, Math.min(650, baseX + jitterX));
                  const cy = Math.max(28, Math.min(272, baseY));

                  return (
                    <g
                      key={d.id}
                      onClick={() =>
                        onOpenBagGuide &&
                        onOpenBagGuide(d.id, d.ownerId === 'jack' ? 'jack' : 'jeffery')
                      }
                      className="cursor-pointer"
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill={d.colorHex}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        <title>
                          {d.name} [{d.speed}|{d.glide}|{d.turn}|{d.fade}] (Net:{' '}
                          {net > 0 ? `+${net}` : net})
                        </title>
                      </circle>
                      <text
                        x={cx}
                        y={cy - 10}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="800"
                      >
                        {d.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 3 Tailored RHBH Form & Release Cues */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="neon-card border border-[#39FF14]/50 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-mono-tabular font-extrabold text-[#39FF14] uppercase">
                Cue #1 · Swing Plane &amp; Weight Shift
              </div>
              <h4 className="text-sm font-extrabold text-white">
                Back-Left to Front-Right 90° Level Chest Pull
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Start 70% weight on your back left foot, pull flat across a 90° chest line
                without dipping your shoulder, and walk straight through to your braced
                front right foot. Eliminates nose-up driver stalls.
              </p>
            </div>

            <div className="neon-card border border-[#00F0FF]/50 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-mono-tabular font-extrabold text-[#00F0FF] uppercase">
                Cue #2 · Angle &amp; Aim Geometry
              </div>
              <h4 className="text-sm font-extrabold text-white">
                Natural RHBH Hyzer Tilt Aim Matrix
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aim Understable (-3 to -5 Turn: Rollo, Roadrunner, Mamba) dead straight so
                your natural hyzer tilt pops them flat. Aim Overstable (+2 to +3 Fade:
                Toro, Roc3, Eagle, Wraith) 15–25 ft right of the pin.
              </p>
            </div>

            <div className="neon-card border border-[#FF2E93]/50 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-mono-tabular font-extrabold text-[#FF2E93] uppercase">
                Cue #3 · Putting &amp; Sloped Greens
              </div>
              <h4 className="text-sm font-extrabold text-white">
                Index Finger Under Rim + XT Glow Nova Slope Brake
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Keep your index finger comfortably under the rim on Star Sync/Aviar and step
                up with the J.Milly 3-second no-think routine. On sloped greens (Sar-Ko H9),
                putt with grippy XT Glow Nova so misses brake dead.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
