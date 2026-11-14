import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Maximize2,
  RotateCw
} from 'lucide-react';
import {
  CourseTemplate,
  DiscItem,
  HistoricalRound,
  PlayerRosterItem,
  getDiscCardImageUrl
} from '../data/initialData';
import {
  buildLivePersonalFlightProfile,
  computeDiscBagTelemetry,
  computeFlightPathSvg,
  doesCommentaryMentionDisc,
  formatRelativePar
} from '../utils/analytics';
import { FlightReadoutBar } from './TacticalRangefinderWidgets';

interface CoursesAndBagViewProps {
  courses: CourseTemplate[];
  setCourses: React.Dispatch<React.SetStateAction<CourseTemplate[]>>;
  bag: DiscItem[];
  setBag: React.Dispatch<React.SetStateAction<DiscItem[]>>;
  history: HistoricalRound[];
  roster: PlayerRosterItem[];
  onStartRoundAtCourse: (courseKey: string) => void;
  initialSelectedDiscId?: string | null;
  initialBagOwnerFilter?: 'jeffery' | 'jack' | 'all';
}

export const CoursesAndBagView: React.FC<CoursesAndBagViewProps> = ({
  bag,
  setBag,
  history,
  initialSelectedDiscId,
  initialBagOwnerFilter = 'jeffery'
}) => {
  const [bagOwnerFilter, setBagOwnerFilter] = useState<
    'jeffery' | 'jack' | 'all' | 'archived'
  >(initialBagOwnerFilter);
  const [simRelease, setSimRelease] = useState<'flat' | 'hyzer' | 'anhyzer'>('flat');
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const [lightboxDisc, setLightboxDisc] = useState<DiscItem | null>(null);
  const [lightboxFlipped, setLightboxFlipped] = useState(false);
  const [showFullDiscTable, setShowFullDiscTable] = useState(false);
  const [discSortBy, setDiscSortBy] = useState<
    'most_used' | 'favorites' | 'birdies' | 'least_thrown'
  >('most_used');

  const activeTelemetryOwner: 'jeffery' | 'jack' =
    bagOwnerFilter === 'jack' ? 'jack' : 'jeffery';
  const discTelemetry = React.useMemo(
    () => computeDiscBagTelemetry(history, bag, activeTelemetryOwner),
    [history, bag, activeTelemetryOwner]
  );

  const toggleFlipCard = (discId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedCardIds((prev) => ({ ...prev, [discId]: !prev[discId] }));
  };

  const toggleArchiveDisc = (discId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const now = Date.now();
    setBag((prev) =>
      prev.map((d) =>
        d.id === discId ? { ...d, archived: !d.archived, updatedAt: now } : d
      )
    );
    setLightboxDisc((prev) =>
      prev && prev.id === discId
        ? { ...prev, archived: !prev.archived, updatedAt: now }
        : prev
    );
  };

  const formatDiscCardTitle = (d: DiscItem) => {
    const weightPart = d.weightGrams ? `${d.weightGrams}g ` : '';
    const hasPlasticInName =
      d.plastic === 'Standard (Unlisted)' ||
      d.name.toLowerCase().startsWith(d.plastic.toLowerCase());
    const plasticPart = hasPlasticInName ? '' : `${d.plastic} `;
    return `${weightPart}${plasticPart}${d.name}`;
  };

  const getDiscRoundLogs = (disc: DiscItem) => {
    const logs: Array<{
      courseName: string;
      date: string;
      holeNumber: number;
      distance: number;
      par: number;
      score: number | null;
      commentary: string;
    }> = [];

    for (const r of history) {
      for (const h of r.holes) {
        const jeffMeta = h.meta?.jeffery;
        const jackMeta = h.meta?.jack;

        const candidateTexts = [
          h.voiceTranscript,
          jeffMeta?.voiceNote,
          jeffMeta?.notes,
          jackMeta?.notes,
          h.notes
        ]
          .map((t) => (t || '').trim())
          .filter(Boolean);

        // Only include commentary that specifically mentions this disc by name
        const matchingCommentary = candidateTexts.find((t) =>
          doesCommentaryMentionDisc(disc, t, r.date)
        );

        if (matchingCommentary) {
          const isJackDisc = disc.ownerId === 'jack';
          const sc = isJackDisc ? h.scores?.jack : h.scores?.jeffery;
          logs.push({
            courseName: r.courseName,
            date: r.date,
            holeNumber: h.number,
            distance: h.distance,
            par: h.par,
            score: sc && sc > 0 ? sc : null,
            commentary: matchingCommentary
          });
        }
      }
    }
    return logs;
  };

  const getDiscConsistencyStats = (disc: DiscItem) => {
    const logs = getDiscRoundLogs(disc);
    let birdies = 0;
    let pars = 0;
    const courseMap = new Map<string, number>();
    const holeMap = new Map<
      string,
      {
        courseShort: string;
        holeNumber: number;
        distance: number;
        par: number;
        count: number;
        bestScore: number | null;
      }
    >();

    const shortenCourse = (cName: string) => {
      if (cName.includes('Sar-Ko-Par')) return 'Sar-Ko-Par';
      if (cName.includes('Harmon')) return 'Harmon';
      if (cName.includes('Black Hoof')) return 'Black Hoof';
      if (cName.includes('Cedar Ridge')) return 'Cedar Ridge';
      if (cName.includes('Mize')) return 'Mize Elem';
      if (cName.includes('Art Nine')) return 'Art Nine';
      if (cName.includes('Wyandotte')) return 'Wyandotte';
      return cName;
    };

    for (const lg of logs) {
      const cShort = shortenCourse(lg.courseName);
      courseMap.set(cShort, (courseMap.get(cShort) || 0) + 1);

      if (lg.score !== null) {
        if (lg.score < lg.par) birdies++;
        else if (lg.score === lg.par) pars++;
      }

      const hKey = `${cShort}#${lg.holeNumber}`;
      const existing = holeMap.get(hKey);
      if (!existing) {
        holeMap.set(hKey, {
          courseShort: cShort,
          holeNumber: lg.holeNumber,
          distance: lg.distance,
          par: lg.par,
          count: 1,
          bestScore: lg.score
        });
      } else {
        existing.count += 1;
        if (
          lg.score !== null &&
          (existing.bestScore === null || lg.score < existing.bestScore)
        ) {
          existing.bestScore = lg.score;
        }
      }
    }

    const topCourses = Array.from(courseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const consistentHoles = Array.from(holeMap.values())
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        const aDiff = a.bestScore !== null ? a.bestScore - a.par : 99;
        const bDiff = b.bestScore !== null ? b.bestScore - b.par : 99;
        return aDiff - bDiff;
      })
      .slice(0, 3);

    const verifiedByDiscId: Record<string, string[]> = {
      'innova-xt-glow-nova': [
        'Putter 1 (Sugar High Main Bag) · Sugar High 2-Foil Holo ★ [2|2|0|0]',
        'Zero-Fade Overmold Approach Bullseye',
        'Stops Dead on Sloped Greens'
      ],
      'innova-proto-glow-aviar': [
        'Putter 2 (Sugar High Main Bag) · Mint Collector Foil ★ [2|3|0|1]',
        'Beadless Grippy Proto Glow Driving Putter',
        '130–185ft Short Tee Drives & C2 Touch Putts'
      ],
      'innova-yeti-pro-aviar': [
        'Putter 3 (Sugar High Main Bag) · Gold Pixel Yeti Foil ★ [2|3|0|1]',
        'Concave-Top Tacky Beaded Putter',
        'Cold-Weather Thumb Lock & Soft Approaches'
      ],
      'innova-kc-pro-aviar': [
        'Putter 4 (Sugar High Main Bag) · Cotton Candy 2-Foil ★ [2|3|0|2]',
        'Ken Climo Stiff Beaded Putter (173–175g)',
        'Reliable Wind Putting & Short Approaches'
      ],
      'innova-sugar-glow-roc': [
        'Midrange 1 (Sugar High Main Bag) · 1990s Collector Foil ★ [4|4|0|3]',
        'Classic Beaded Rancho DX Glow Midrange',
        'Headwind Stability & Sweeping Left Hyzers'
      ],
      'innova-proto-glow-mako3': [
        'Midrange 2 (Sugar High Main Bag) · Rainbow Holo Foil ★ [5|5|0|0]',
        'Premium Proto Glow Dead-Straight Tunnel Laser',
        'Holds Flat, Hyzer & Anhyzer Release Angles'
      ],
      'innova-sugar-star-rollo': [
        'Midrange 3 (Sugar High Main Bag) · Limited Pixel Foil ★ [5|6|-4|1]',
        'High-Glide Right-Turn Shaper & Uphill Closer',
        'Effortless Standstill Turnovers & Rollers'
      ],
      'innova-glow-leopard3': [
        'Fairway 1 (Sugar High Main Bag) · Color Glow Champion ★ [7|5|-2|1]',
        'Controllable Wooded Hyzer-Flip & S-Curve Fairway',
        'Replaces Lost GStar Leopard3 in Aqua Color Glow'
      ],
      'innova-glow-teebird': [
        'Fairway 2 (Sugar High Main Bag) · Collector Holo Foil ★ [7|5|0|2]',
        'Pinpoint Straight-to-Fade 7-Speed Workhorse',
        'Bridges Glow Leopard3 & Champion Eagle'
      ],
      'innova-champion-eagle': [
        'Fairway 3 (Sugar High Main Bag) · Sugar High 2-Foil ★ [7|4|-1|3]',
        'Premier Overstable Fairway Driver',
        'Headwind Torque Resistance, Hard 3-Fade & Forehand Flex'
      ],
      'innova-sugar-star-roadrunner': [
        'Driver 1 (Sugar High Main Bag) · Hot Pink Star Foil ★ [9|5|-4|1]',
        'High-Glide Turnover, Hyzer-Flip & Roller Distance',
        'High-Visibility Hot Pink Star Plastic'
      ],
      'innova-luster-firebird': [
        'Driver 2 (Sugar High Main Bag) · Luster Champion Foil ★ [9|3|0|4]',
        'Tour-Proven Headwind, Spike-Hyzer & Flare-Skip Utility',
        'High-Torque Forehand Get-Out-of-Trouble Driver'
      ],
      'innova-halo-wraith': [
        'Driver 3 (Sugar High Main Bag) · Two-Tone Halo Star ★ [11|5|-1|3]',
        'Controlled Low-Ceiling & Headwind Power Driver',
        'Extra 5-Glide Carry w/ Halo Rim Torque Resistance'
      ],
      'innova-halo-destroyer': [
        'Driver 4 (Sugar High Main Bag) · Flagship Halo Star ★ [12|5|-1|3]',
        'Speed 12 Max-Distance Championship Bomber',
        'Slices Headwinds w/ Commanding +3 Finish'
      ],
      'innova-aviar': [
        'Backup Vault · Sar-Ko-Par #1 ★ (2× Birdie)',
        'Mize #1 & #6 ★ (10/28 Pinpoint Approach!)',
        'Art Nine #7 ★ (Par)'
      ],
      'innova-sync': [
        'Putter 4 (Top Pocket) · Sar-Ko-Par #1 ★ (11/05 Parked Under Pin Birdie!)',
        'Mize #3, #4, #5 & #8 ★ (10/28 Wind Approach)',
        'Art Nine #1, #3, #4, #9 ★'
      ],
      'innova-toro': [
        'Approach 1 (Main) · Sar-Ko-Par #6 ★ (11/04 14ft Birdie!)',
        'Mize #1 & #3 ★ (10/28 Wind Debut!)',
        'Heavy Headwinds & Forehand Flicks (<200ft)'
      ],
      'innova-dx-alien': [
        'Approach 2 (Active In-Hand 11/05) · 176–179g Pink DX ★ [4|2|0|1]',
        'Ridged Sonic-Style Top · Point-and-Shoot Touch Mid',
        'Low 2-Glide Bullseye Approach'
      ],
      'innova-pig': [
        'Archived Vault · Replaced by Star Toro',
        'Harmon #6 ★ (Hill Stop)',
        'Sar-Ko-Par #9 ★'
      ],
      'innova-rollo': [
        'Midrange 5 (Main) · Sar-Ko-Par #9 ★ (5× Birdie incl. 11/05 -6 PB Finale!)',
        'Art Nine #3 ★ (Double Birdie!)',
        'Mize #6 & #7 ★ (10/28 Pink Basket Approach!)'
      ],
      'innova-mako3': [
        'Midrange 1 (Main) · Sar-Ko-Par #2 & #5 ★ (11/05 12ft H5 Birdie!)',
        'Mize #4 & #9 ★ (10/28 Hole #9 Basket Park!)',
        'Art Nine #6 & #9 ★ (2× Birdie)'
      ],
      'innova-jay': [
        'Midrange 2 (Main) · Mize #2 & #5 ★ (10/28 20ft Chain-Through!)',
        'Post-Round Field Test ★ ("Went Far for a Mid!")',
        'Bridges Mako3 & Roc3'
      ],
      'innova-roc3': [
        'Midrange 3 (Main) · Sar-Ko-Par #4 & #6 ★ (11/05 6ft H4 & 20ft H6 Birdies!)',
        'Art Nine #1 ★ (10/25 Birdie!)',
        'Mize #3, #8 & #9 ★'
      ],
      'innova-classic-glow-roc': [
        'Midrange 4 (Active In-Hand 11/05) · Sar-Ko-Par #4 ★ (11/05 Debut Par!)',
        'Classic Rancho Mold · Heavy +3 Wind-Fighting Fade',
        'Cedar Ridge & Black Hoof Midrange Anchor'
      ],
      'innova-leopard3': [
        'Backup Vault (Lost at Sar-Ko-Par) · Replaced by Glow Leopard3',
        '10/28 Field Test #2 ★ ("Lift Off, Down & Up" +15ft!)',
        'Cedar Ridge & Black Hoof Fairway Workhorse'
      ],
      'innova-archangel': [
        'Fairway 3 (Main) · Sar-Ko-Par #7 ★ (11/05 6ft Parked Birdie!)',
        '10/28 Field Test #2 ★ ("Doesn\'t Go Too Far Left!")',
        'Massive 6 Glide Fairway Driver'
      ],
      'innova-roadrunner': [
        'Driver 1 (Main) · Sar-Ko-Par #7 & #8 ★ (11/04 & 11/05 Pars)',
        '10/28 Field Test #1 ★ (+20ft Longest Driver!)',
        'Skipped 2ft from Hole #5 Pin!'
      ],
      'innova-classic-glow-beast': [
        'Driver 2 (Active In-Hand 11/05) · Sar-Ko-Par #8 ★ (11/05 234ft Debut Birdie!)',
        'Smooth S-Curve Control Distance Driver (260–340 ft)',
        'Bridges Roadrunner & Wraith'
      ],
      'innova-it': [
        'Fairway 1 (Main) · Sar-Ko-Par #2 & #3 ★ (11/05 Perfect FlightPath Birdie!)',
        'Mize #1, #5, #7 & #9 ★',
        'Black Hoof #1 ★ (Birdie)'
      ],
      'innova-firebird': [
        'Archived Vault · Replaced by Champion Eagle',
        'Sar-Ko-Par #4 & #7 ★',
        'Mize #3 & #4 (90° Swing)'
      ],
      'innova-mamba': [
        'Driver 3 (Main) · Sar-Ko-Par #3 & #7 ★ (10/28 3ft Birdie!)',
        'Mize #1, #2, #7, #8, #9 ★ (10/28 Hole #8 Glide!)',
        'Black Hoof #9 Par ★'
      ],
      'innova-classic-glow-wraith': [
        'Driver 4 (Active In-Hand 11/05) · 165–169g DX Classic Glow ★ [11|5|-1|3]',
        'Headwind Power Distance Driver · Refuses to Flip Over',
        'Cedar Ridge Hole #16 613ft Par Bomber!'
      ],
      'discraft-roach': [
        'Art Nine #2 & #3 ★ (2× Birdie!)',
        'Black Hoof #2 & #7 ★',
        'Harmon #6'
      ],
      'discraft-buzzz-ss': [
        'Harmon #7 ★ (Birdie)',
        'Mize #4 ★ (10/25 Win)',
        'Black Hoof #5 & #8'
      ],
      'discraft-cicada': [
        'Mize #2, #7 & #8 ★ (10/26 3× Par PB!)',
        'Harmon #1 & #9 ★',
        'Black Hoof #1 & #4'
      ]
    };

    const verifiedList = verifiedByDiscId[disc.id] || ['All-Around Utility Slot'];

    return {
      totalThrows: logs.length,
      birdies,
      pars,
      topCourses,
      consistentHoles,
      verifiedBadges: verifiedList,
      logs
    };
  };

  useEffect(() => {
    if (initialBagOwnerFilter) {
      setBagOwnerFilter(initialBagOwnerFilter);
    }
  }, [initialBagOwnerFilter]);

  useEffect(() => {
    if (initialSelectedDiscId) {
      const found = bag.find((d) => d.id === initialSelectedDiscId);
      if (found) {
        if (found.archived) {
          setBagOwnerFilter('archived');
        } else {
          setBagOwnerFilter(found.ownerId === 'jack' ? 'jack' : 'jeffery');
        }
        setLightboxDisc(found);
        setLightboxFlipped(false);
      }
    }
  }, [initialSelectedDiscId, bag]);

  const sortDriversToPutters = (discs: DiscItem[]) =>
    [...discs].sort((a, b) => b.speed - a.speed || b.glide - a.glide);

  const jefferyDiscs = sortDriversToPutters(
    bag.filter((d) => d.ownerId !== 'jack' && !d.archived)
  );
  const jackDiscs = sortDriversToPutters(
    bag.filter((d) => d.ownerId === 'jack' && !d.archived)
  );
  const archivedDiscs = sortDriversToPutters(bag.filter((d) => !!d.archived));
  const activeCombinedDiscs = sortDriversToPutters(bag.filter((d) => !d.archived));

  const visibleBag =
    bagOwnerFilter === 'jeffery'
      ? jefferyDiscs
      : bagOwnerFilter === 'jack'
      ? jackDiscs
      : bagOwnerFilter === 'archived'
      ? archivedDiscs
      : activeCombinedDiscs;

  return (
    <div className="space-y-6">
      {/* PRO TOUR TELEMETRY HEADER: BAG SWITCHER + FLIP ALL */}
      <div className="neon-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-mono-tabular text-[10px] font-extrabold uppercase tracking-widest text-[#FF5722]">
              PRO TOUR FLIGHT TELEMETRY // BAG ARMORY
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white break-words">
              TACTICAL BAG &amp; <span className="text-[#CCFF00]">COLLECTOR CARDS</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bag Owner Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#090D0B] border border-white/10">
              <button
                type="button"
                onClick={() => setBagOwnerFilter('jeffery')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                  bagOwnerFilter === 'jeffery'
                    ? 'bg-[#FF5722] text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Jeffery&apos;s Cotton Candy ({jefferyDiscs.length})
              </button>
              <button
                type="button"
                onClick={() => setBagOwnerFilter('jack')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                  bagOwnerFilter === 'jack'
                    ? 'bg-[#CCFF00] text-[#090D0B]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Jack&apos;s Discraft ({jackDiscs.length})
              </button>
              <button
                type="button"
                onClick={() => setBagOwnerFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                  bagOwnerFilter === 'all'
                    ? 'bg-[#CCFF00] text-[#090D0B]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Active Combined ({activeCombinedDiscs.length})
              </button>
              <button
                type="button"
                onClick={() => setBagOwnerFilter('archived')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                  bagOwnerFilter === 'archived'
                    ? 'bg-amber-400 text-[#090D0B]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                📦 Backup / Vault ({archivedDiscs.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const allFlipped = visibleBag.every((d) => flippedCardIds[d.id]);
                const nextState: Record<string, boolean> = { ...flippedCardIds };
                for (const d of visibleBag) {
                  nextState[d.id] = !allFlipped;
                }
                setFlippedCardIds(nextState);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#CCFF00] text-[#090D0B] text-xs font-extrabold hover:bg-[#CCFF00]/90 flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>
                {visibleBag.every((d) => flippedCardIds[d.id])
                  ? 'Flip All to Front'
                  : 'Flip All to Back'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* DISC PERFORMANCE & USAGE TELEMETRY: FAVORITES, MOST USED, LEAST THROWN & LEAST FAVORITE */}
      <div className="neon-card border-2 border-[#39FF14]/50 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-mono-tabular uppercase text-[#39FF14] font-extrabold">
              {activeTelemetryOwner === 'jack'
                ? 'Jack’s Discraft Performance & Usage Telemetry'
                : `Jeffery’s Disc Stats Across All ${history.length} Rounds & Voice Logs`}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
              🥏 My Disc Stats: Favorites, Most Used, Least Thrown &amp; Least Favorite
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowFullDiscTable((prev) => !prev)}
            className="px-3.5 py-1.5 rounded-xl bg-[#080B14] border border-[#00F0FF] text-xs font-extrabold text-[#00F0FF] hover:bg-[#00F0FF]/15 transition-colors self-start sm:self-auto"
          >
            {showFullDiscTable
              ? 'Hide Full All-Discs Leaderboard ▲'
              : `View All ${discTelemetry.allRows.length} Discs Leaderboard ▼`}
          </button>
        </div>

        {/* 4-Column Superlative Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {/* 1. FAVORITES (BEST SCORING & GO-TO CONFIDENCE) */}
          <div className="min-w-0 overflow-hidden p-3.5 rounded-xl bg-[#080B14] border border-[#39FF14]/50 space-y-2.5">
            <div>
              <div className="text-xs font-extrabold text-[#39FF14] uppercase tracking-wider">
                🏆 My Favorites (Best Scoring)
              </div>
              <p className="text-[11px] text-slate-400">
                Highest birdie rate, lowest average vs. par &amp; most trusted in commentary
              </p>
            </div>
            <div className="space-y-2">
              {discTelemetry.favorites.slice(0, 6).map((row, idx) => (
                <div
                  key={row.disc.id}
                  onClick={() => {
                    setLightboxDisc(row.disc);
                    setLightboxFlipped(false);
                  }}
                  className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#39FF14] cursor-pointer transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono-tabular font-extrabold text-[#39FF14]">
                        #{idx + 1}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.disc.colorHex }}
                      />
                      <span className="text-xs font-extrabold text-white truncate">
                        {row.disc.weightGrams ? `${row.disc.weightGrams}g ` : ''}
                        {row.disc.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {row.topCourse} · {row.parOrBetterRate}% Par or Better
                    </div>
                  </div>
                  <div className="text-right font-mono-tabular shrink-0">
                    <div className="text-xs font-extrabold text-[#39FF14]">
                      {row.birdies} Birdies ({row.birdieRate}%)
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {row.totalHolesUsed}H · Avg{' '}
                      {row.avgRelPar !== null
                        ? row.avgRelPar > 0
                          ? `+${row.avgRelPar}`
                          : row.avgRelPar
                        : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. MOST USED WORKHORSES */}
          <div className="min-w-0 overflow-hidden p-3.5 rounded-xl bg-[#080B14] border border-[#00F0FF]/50 space-y-2.5">
            <div>
              <div className="text-xs font-extrabold text-[#00F0FF] uppercase tracking-wider">
                🔥 Most Used Workhorses
              </div>
              <p className="text-[11px] text-slate-400">
                Ranked by total holes thrown (tee drives, approaches &amp; putts)
              </p>
            </div>
            <div className="space-y-2">
              {discTelemetry.mostUsed.map((row, idx) => {
                const maxHoles = Math.max(
                  1,
                  discTelemetry.mostUsed[0]?.totalHolesUsed || 1
                );
                const pct = Math.max(
                  10,
                  Math.round((row.totalHolesUsed / maxHoles) * 100)
                );
                return (
                  <div
                    key={row.disc.id}
                    onClick={() => {
                      setLightboxDisc(row.disc);
                      setLightboxFlipped(false);
                    }}
                    className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#00F0FF] cursor-pointer transition-colors space-y-1"
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
                    <div className="w-full h-1.5 rounded-full bg-[#080B14] overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-[#00F0FF] rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono-tabular text-slate-400">
                      <span>
                        {row.teeAndFairwayThrows} Tee/Fairway · {row.puttAndApproachThrows}{' '}
                        Putt/App
                      </span>
                      <span className="text-[#39FF14] font-bold">
                        {row.birdies} ★ Birdies
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. LEAST THROWN / NEWEST ADDITIONS */}
          <div className="min-w-0 overflow-hidden p-3.5 rounded-xl bg-[#080B14] border border-[#FACC15]/50 space-y-2.5">
            <div>
              <div className="text-xs font-extrabold text-[#FACC15] uppercase tracking-wider">
                🆕 Least Thrown (Newest / Specialty)
              </div>
              <p className="text-[11px] text-slate-400">
                Active bag discs with the fewest logged holes so far
              </p>
            </div>
            <div className="space-y-2">
              {discTelemetry.leastThrown.map((row) => (
                <div
                  key={row.disc.id}
                  onClick={() => {
                    setLightboxDisc(row.disc);
                    setLightboxFlipped(false);
                  }}
                  className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#FACC15] cursor-pointer transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.disc.colorHex }}
                      />
                      <span className="text-xs font-extrabold text-white truncate">
                        {row.disc.weightGrams ? `${row.disc.weightGrams}g ` : ''}
                        {row.disc.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      [{row.disc.speed}|{row.disc.glide}|{row.disc.turn}|{row.disc.fade}] ·{' '}
                      {row.topCourse}
                    </div>
                  </div>
                  <div className="text-right font-mono-tabular shrink-0">
                    <div className="text-xs font-extrabold text-[#FACC15]">
                      {row.totalHolesUsed}{' '}
                      {row.totalHolesUsed === 1 ? 'Hole' : 'Holes'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {row.birdies > 0 ? `${row.birdies} ★ Birdie` : 'Specialty / New'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. LEAST FAVORITE / TOUGHEST IN COMMENTARY */}
          <div className="min-w-0 overflow-hidden p-3.5 rounded-xl bg-[#080B14] border border-[#FF2E93]/50 space-y-2.5">
            <div>
              <div className="text-xs font-extrabold text-[#FF2E93] uppercase tracking-wider">
                ⚠️ Least Favorite / Toughest
              </div>
              <p className="text-[11px] text-slate-400">
                Highest strokes over par, touchy in woods, or retired/lost
              </p>
            </div>
            <div className="space-y-2">
              {discTelemetry.leastFavorite.map((row) => (
                <div
                  key={row.disc.id}
                  onClick={() => {
                    setLightboxDisc(row.disc);
                    setLightboxFlipped(false);
                  }}
                  className="p-2 rounded-lg bg-[#111629] border border-slate-800 hover:border-[#FF2E93] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-white truncate">
                      {row.disc.weightGrams ? `${row.disc.weightGrams}g ` : ''}
                      {row.disc.name}
                      {row.disc.archived ? ' (Archived)' : ''}
                    </span>
                    <span className="text-xs font-mono-tabular font-extrabold text-[#FF2E93] shrink-0">
                      Avg{' '}
                      {row.avgRelPar !== null
                        ? row.avgRelPar > 0
                          ? `+${row.avgRelPar}`
                          : row.avgRelPar
                        : '—'}{' '}
                      ({row.totalHolesUsed}H)
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

        {/* Expandable Complete All-Discs Sortable Leaderboard */}
        {showFullDiscTable && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-white">
                Complete Disc Leaderboard ({discTelemetry.allRows.length} Discs)
              </span>
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
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

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono-tabular">
                <thead>
                  <tr className="border-b border-slate-700 text-[#00F0FF] bg-[#080B14]">
                    <th className="py-2 px-2.5 font-sans">Disc</th>
                    <th className="py-2 px-2 text-center">Flight</th>
                    <th className="py-2 px-2 text-right">Holes Used</th>
                    <th className="py-2 px-2 text-right">Tee / Fairway</th>
                    <th className="py-2 px-2 text-right">Birdies</th>
                    <th className="py-2 px-2 text-right">Par+ %</th>
                    <th className="py-2 px-2 text-right">Avg vs Par</th>
                    <th className="py-2 px-2.5 font-sans">Commentary &amp; Flight Verdict</th>
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
                        onClick={() => {
                          setLightboxDisc(row.disc);
                          setLightboxFlipped(false);
                        }}
                        className="hover:bg-white/5 cursor-pointer"
                      >
                        <td className="py-2 px-2.5 font-sans font-extrabold text-white whitespace-nowrap">
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
                        <td className="py-2 px-2.5 font-sans text-slate-300">
                          {row.commentaryVerdict}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* FULL-WIDTH 3D COLLECTOR CARDS GROUPED BY DRIVERS -> MIDRANGES -> PUTTERS */}
      <div className="neon-card rounded-2xl p-4 sm:p-5 space-y-6">
        {(
          [
            {
              id: 'drivers',
              title: 'Drivers',
              badge: 'Speed 7–11',
              accent: '#FF5722',
              discs: visibleBag.filter((d) => d.speed >= 7)
            },
            {
              id: 'midranges',
              title: 'Midranges',
              badge: 'Speed 4–5',
              accent: '#CCFF00',
              discs: visibleBag.filter((d) => d.speed >= 4 && d.speed <= 6)
            },
            {
              id: 'putters',
              title: 'Putters',
              badge: 'Speed 2–3',
              accent: '#34D399',
              discs: visibleBag.filter((d) => d.speed <= 3)
            }
          ] as const
        )
          .filter((group) => group.discs.length > 0)
          .map((group) => (
            <div key={group.id} className="space-y-4">
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#090D0B] border border-white/10">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: group.accent }}
                  />
                  <h4
                    className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider"
                    style={{ color: group.accent }}
                  >
                    {group.title} ({group.discs.length})
                  </h4>
                </div>
                <span className="text-xs font-mono-tabular font-bold text-slate-400">
                  {group.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {group.discs.map((d) => {
                  const isFlipped = !!flippedCardIds[d.id];
                  const cardSrc = getDiscCardImageUrl(d);
                  const stats = getDiscConsistencyStats(d);
                  const liveFlight = buildLivePersonalFlightProfile(d, history);
                  const cardFlightSvg = computeFlightPathSvg(d, 'calm', 'flat');

                  return (
                    <div
                      key={d.id}
                      onClick={() => toggleFlipCard(d.id)}
                      className="collector-3d-scene w-full cursor-pointer select-none"
                    >
                      <div className={`collector-3d-card ${isFlipped ? 'is-flipped' : ''}`}>
                        {/* FRONT FACE OF 3D COLLECTOR CARD */}
                        <div
                          style={{
                            borderColor: d.colorHex,
                            boxShadow: '0 14px 32px -6px rgba(0,0,0,0.85)'
                          }}
                          className="collector-3d-face collector-3d-front border-2 bg-[#090D0B] p-2.5 flex flex-col justify-between gap-2"
                        >
                          <div className="flex items-center justify-between gap-2 px-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: d.colorHex,
                                  boxShadow: `0 0 8px ${d.colorHex}`
                                }}
                              />
                              <span className="font-mono-tabular text-xs font-extrabold text-[#CCFF00] truncate">
                                {d.cardNumber || d.brand}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => toggleFlipCard(d.id, e)}
                                className="px-2.5 py-0.5 rounded-md bg-[#CCFF00]/20 border border-[#CCFF00] text-xs font-extrabold text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#090D0B] flex items-center gap-1 transition-all"
                              >
                                <RotateCw className="w-3 h-3" />
                                <span>Flip ↻</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxDisc(d);
                                  setLightboxFlipped(false);
                                }}
                                className="px-2 py-0.5 rounded-md bg-[#FF5722]/20 border border-[#FF5722]/80 text-xs font-bold text-[#FF5722] hover:bg-[#FF5722] hover:text-white flex items-center gap-1 transition-all"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Enlarge</span>
                              </button>
                            </div>
                          </div>

                          <div className="aspect-[896/1200] w-full overflow-hidden rounded-xl bg-[#050807] border border-white/10 relative flex items-center justify-center">
                            {cardSrc && (
                              <img
                                src={cardSrc}
                                alt={`${d.brand} ${d.name} Collector Card`}
                                className="w-full h-full object-cover object-center"
                              />
                            )}
                            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 border border-[#CCFF00]/80 text-xs font-extrabold text-[#CCFF00] flex items-center gap-1 shadow-lg">
                              <RotateCw className="w-3 h-3" />
                              <span>Tap to Flip</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 px-0.5">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <span className="min-w-0 flex-1 font-display text-xs sm:text-[13px] font-bold uppercase text-white truncate">
                                {formatDiscCardTitle(d)}
                              </span>
                              <span className="font-mono-tabular text-[11px] font-bold text-slate-400 shrink-0">
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

                        {/* BACK FACE OF 3D COLLECTOR CARD (DETAILS + RHBH FLIGHT PATH) */}
                        <div
                          style={{
                            borderColor: d.colorHex,
                            boxShadow: `0 0 22px -4px ${d.colorHex}80`
                          }}
                          className="collector-3d-face collector-3d-back card-back-dark border-2 bg-[#0D1511] p-2.5 flex flex-col justify-between gap-1"
                        >
                          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
                            {/* Back Header */}
                            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-1">
                              <div className="min-w-0">
                                <div className="text-[10px] font-mono-tabular font-extrabold uppercase tracking-wider text-[#CCFF00] truncate">
                                  {d.cardNumber || d.brand} · {d.slotCategory}
                                </div>
                                <h4 className="font-display text-xs sm:text-sm font-extrabold uppercase text-white leading-tight truncate">
                                  {formatDiscCardTitle(d)}
                                </h4>
                              </div>
                              <span className="font-mono-tabular text-[10px] font-bold text-[#FF5722] shrink-0">
                                {d.idealMinFeet}–{d.idealMaxFeet} ft
                              </span>
                            </div>

                            <FlightReadoutBar
                              speed={d.speed}
                              glide={d.glide}
                              turn={d.turn}
                              fade={d.fade}
                              compact
                            />

                            {/* 3-Box Trading Card Stat Row */}
                            <div className="grid grid-cols-3 gap-1 text-center font-mono-tabular">
                              <div className="p-1 rounded-lg bg-[#111629] border border-slate-700">
                                <div className="text-[9px] font-bold text-slate-300 uppercase">
                                  Logged
                                </div>
                                <div className="text-[11px] font-extrabold text-white">
                                  {stats.totalThrows} {stats.totalThrows === 1 ? 'Hole' : 'Holes'}
                                </div>
                              </div>
                              <div className="p-1 rounded-lg bg-[#111629] border border-slate-700">
                                <div className="text-[9px] font-bold text-slate-300 uppercase">
                                  Birdie / Par
                                </div>
                                <div className="text-[11px] font-extrabold text-[#39FF14]">
                                  {stats.birdies}B · {stats.pars}P
                                </div>
                              </div>
                              <div className="p-1 rounded-lg bg-[#111629] border border-slate-700">
                                <div className="text-[9px] font-bold text-slate-300 uppercase">
                                  Top Course
                                </div>
                                <div className="text-[10px] font-extrabold text-[#00F0FF] truncate">
                                  {stats.topCourses[0]
                                    ? `${stats.topCourses[0].name} (${stats.topCourses[0].count}×)`
                                    : 'All Courses'}
                                </div>
                              </div>
                            </div>

                            {/* Personal Flight Behavior (From My Commentary) */}
                            <div className="p-1.5 rounded-lg bg-[#111629] border border-[#FF2E93]/60 space-y-0.5">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF2E93]">
                                🎯 How It Flies For Me (Commentary)
                              </div>
                              <p className="text-[10px] font-medium text-white leading-tight line-clamp-3">
                                {liveFlight.howItFliesForMe}
                              </p>
                            </div>

                            {/* My Release Cue */}
                            <div className="p-1.5 rounded-lg bg-[#111629] border border-[#00F0FF]/50 space-y-0.5">
                              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#00F0FF]">
                                🎙️ My Release Cue &amp; Tendency
                              </div>
                              <p className="text-[9.5px] font-medium text-slate-200 leading-tight line-clamp-2">
                                {liveFlight.swingCue}
                              </p>
                            </div>

                            {/* RHBH Flight Path Diagram filling the remaining Card Back space */}
                            <div className="flex-1 flex flex-col justify-between rounded-xl bg-[#05070E] border border-slate-700 p-2 min-h-[90px]">
                              <div className="flex items-center justify-between text-[10px] font-mono-tabular mb-0.5 px-0.5">
                                <span style={{ color: '#FACC15' }} className="font-bold">
                                  ← Fade ({d.fade})
                                </span>
                                <span style={{ color: '#38BDF8' }} className="font-extrabold">
                                  RHBH · Est. {cardFlightSvg.estimatedFeet} ft
                                </span>
                                <span style={{ color: '#FF2E93' }} className="font-bold">
                                  Turn ({d.turn}) →
                                </span>
                              </div>
                              <svg
                                viewBox="-55 18 370 292"
                                preserveAspectRatio="xMidYMid meet"
                                className="w-full flex-1 min-h-[70px] overflow-visible"
                                aria-label={`RHBH Flight Path for ${d.name}`}
                              >
                                {[
                                  { ft: 300, y: 48 },
                                  { ft: 225, y: 122 },
                                  { ft: 150, y: 196 }
                                ].map((g) => (
                                  <g key={g.ft}>
                                    <line
                                      x1={-40}
                                      y1={g.y}
                                      x2={300}
                                      y2={g.y}
                                      stroke="#1E293B"
                                      strokeDasharray="4 4"
                                      strokeWidth={1.3}
                                    />
                                    <text
                                      x={-36}
                                      y={g.y - 5}
                                      fill="#38BDF8"
                                      fontSize="13"
                                      fontWeight="700"
                                      fontFamily="JetBrains Mono, monospace"
                                    >
                                      {g.ft}ft
                                    </text>
                                  </g>
                                ))}
                                <line
                                  x1={130}
                                  y1={24}
                                  x2={130}
                                  y2={298}
                                  stroke="#475569"
                                  strokeDasharray="5 5"
                                  strokeWidth={1.5}
                                />
                                <path
                                  d={cardFlightSvg.pathD}
                                  fill="none"
                                  stroke={d.colorHex}
                                  strokeWidth={7.5}
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
                                <text
                                  x={cardFlightSvg.endX + 15}
                                  y={cardFlightSvg.endY + 4}
                                  fill="#FFFFFF"
                                  fontSize="13"
                                  fontWeight="800"
                                  fontFamily="JetBrains Mono, monospace"
                                >
                                  {cardFlightSvg.estimatedFeet}ft
                                </text>
                              </svg>
                            </div>
                          </div>

                          {/* Back Footer */}
                          <div className="pt-1 border-t border-slate-300 flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => toggleFlipCard(d.id, e)}
                              className="px-2 py-0.5 rounded-lg bg-[#00F0FF] text-slate-950 text-[11px] font-extrabold flex items-center gap-1 hover:bg-[#00F0FF]/90"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Flip ↻</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => toggleArchiveDisc(d.id, e)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold border transition-colors ${
                                d.archived
                                  ? 'bg-[#39FF14] text-slate-950 border-[#39FF14]'
                                  : 'bg-[#111629] text-[#FACC15] border-[#FACC15]/70 hover:bg-[#FACC15]/20'
                              }`}
                            >
                              {d.archived ? 'Restore' : 'Archive'}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxDisc(d);
                                setLightboxFlipped(false);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-[#FF2E93] text-white text-[11px] font-extrabold flex items-center gap-1 hover:bg-[#FF2E93]/90"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Enlarge</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* ENLARGE MODAL FOR FULL CARD DETAILS, INTERACTIVE FLIGHT LAB & ROUND COMMENTARY */}
      {lightboxDisc && (
        <div
          onClick={() => setLightboxDisc(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full max-h-[92vh] overflow-y-auto rounded-2xl bg-[#070A14] border-2 border-[#00F0FF] p-4 sm:p-6 space-y-5 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-mono-tabular font-bold text-[#00F0FF] uppercase">
                  {lightboxDisc.cardNumber || lightboxDisc.brand} · {lightboxDisc.slotCategory}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  {lightboxDisc.brand} {lightboxDisc.name} — [{lightboxDisc.speed} | {lightboxDisc.glide} | {lightboxDisc.turn} | {lightboxDisc.fade}]
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxFlipped(!lightboxFlipped)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00F0FF] text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{lightboxFlipped ? 'Show Card Front' : 'Flip Card ↻'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => toggleArchiveDisc(lightboxDisc.id, e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors ${
                    lightboxDisc.archived
                      ? 'bg-[#39FF14] text-slate-950 border-[#39FF14]'
                      : 'bg-[#111629] text-[#FACC15] border-[#FACC15]/70 hover:bg-[#FACC15]/20'
                  }`}
                >
                  {lightboxDisc.archived ? 'Restore to Main Bag' : 'Move to Backup / Vault'}
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxDisc(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {(() => {
              const st = getDiscConsistencyStats(lightboxDisc);
              const lf = buildLivePersonalFlightProfile(lightboxDisc, history);
              const lbSvg = computeFlightPathSvg(lightboxDisc, 'calm', simRelease);

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT 5 COLS: Large Flippable 3D Collector Card */}
                  <div className="lg:col-span-5 space-y-3">
                    <div
                      onClick={() => setLightboxFlipped(!lightboxFlipped)}
                      className="collector-3d-scene w-full cursor-pointer select-none"
                    >
                      <div className={`collector-3d-card ${lightboxFlipped ? 'is-flipped' : ''}`}>
                        <div className="collector-3d-face collector-3d-front border-2 border-[#00F0FF] bg-[#05070E] p-2.5 flex items-center justify-center">
                          <div className="aspect-[896/1200] w-full overflow-hidden rounded-xl bg-[#04060C] relative">
                            {getDiscCardImageUrl(lightboxDisc) && (
                              <img
                                src={getDiscCardImageUrl(lightboxDisc)!}
                                alt={lightboxDisc.name}
                                className="w-full h-full object-cover object-center"
                              />
                            )}
                            <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-lg bg-black/85 border border-[#39FF14] text-xs font-extrabold text-[#39FF14] flex items-center gap-1">
                              <RotateCw className="w-3.5 h-3.5" />
                              <span>Tap Card to Flip</span>
                            </div>
                          </div>
                        </div>

                        <div className="collector-3d-face collector-3d-back card-back-dark border-2 border-[#FF2E93] bg-[#0B0F1E] p-3.5 flex flex-col justify-between gap-2">
                          <div className="flex-1 flex flex-col gap-2 min-h-0">
                            <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-mono-tabular font-bold text-[#00F0FF]">
                                  {lightboxDisc.cardNumber || lightboxDisc.brand} · {lightboxDisc.slotCategory}
                                </div>
                                <h4 className="text-base sm:text-lg font-extrabold text-white">
                                  {formatDiscCardTitle(lightboxDisc)}
                                </h4>
                              </div>
                              <span className="font-mono-tabular text-xs font-extrabold text-[#39FF14]">
                                [{lightboxDisc.speed}|{lightboxDisc.glide}|{lightboxDisc.turn}|{lightboxDisc.fade}]
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-[#111629] border border-[#FF2E93]/60 space-y-1">
                              <div className="text-xs font-extrabold uppercase text-[#FF2E93]">
                                🎯 How It Flies For Me (From My Commentary)
                              </div>
                              <p className="text-xs text-white leading-snug">
                                {lf.howItFliesForMe}
                              </p>
                            </div>

                            <div className="p-2 rounded-xl bg-[#111629] border border-[#00F0FF]/60 space-y-1">
                              <div className="text-xs font-extrabold uppercase text-[#00F0FF]">
                                🎙️ My Release Cue &amp; Tendency
                              </div>
                              <p className="text-xs text-slate-200 leading-snug">
                                {lf.swingCue}
                              </p>
                            </div>

                            <div className="p-2 rounded-xl bg-[#111629] border border-[#FACC15]/60 space-y-1">
                              <div className="text-xs font-extrabold uppercase text-[#FACC15]">
                                ★ Go-To Holes &amp; Courses
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {st.verifiedBadges.map((b, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-md bg-[#080B14] border border-[#FACC15]/60 text-xs font-bold text-white"
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-center text-xs font-bold text-[#00F0FF] pt-1">
                            Tap anywhere on card to flip back ↻
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT 7 COLS: Interactive Flight Simulator, Full Details & Round Commentary */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Interactive RHBH Flight Simulator */}
                    <div className="p-4 rounded-2xl bg-[#0B0F1E] border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wide">
                          RHBH Flight Simulator (Release Angle)
                        </span>
                        <span className="text-xs font-mono-tabular font-bold text-[#39FF14]">
                          Range: {lightboxDisc.idealMinFeet}–{lightboxDisc.idealMaxFeet} ft (Est. {lbSvg.estimatedFeet} ft)
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#05070E] border border-slate-800">
                        {(
                          [
                            { id: 'hyzer', label: 'Hyzer Release' },
                            { id: 'flat', label: 'Flat Release' },
                            { id: 'anhyzer', label: 'Anhyzer Release' }
                          ] as const
                        ).map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSimRelease(r.id)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                              simRelease === r.id
                                ? 'bg-[#FF2E93] text-white font-extrabold'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>

                      <div className="rounded-xl bg-[#05070E] border border-slate-800 p-3 flex flex-col items-center">
                        <div className="w-full flex items-center justify-between text-xs font-mono-tabular mb-1 px-2">
                          <span style={{ color: '#FACC15' }} className="font-bold">
                            ← Fade Left ({lightboxDisc.fade})
                          </span>
                          <span style={{ color: '#FF2E93' }} className="font-bold">
                            Turn Right ({lightboxDisc.turn}) →
                          </span>
                        </div>
                        <svg
                          viewBox="0 0 260 320"
                          className="w-full max-w-[260px] h-[230px] overflow-visible"
                          aria-label={`RHBH Flight Path for ${lightboxDisc.name}`}
                        >
                          {[
                            { ft: 350, y: 40 },
                            { ft: 275, y: 100 },
                            { ft: 200, y: 160 },
                            { ft: 125, y: 220 }
                          ].map((g) => (
                            <g key={g.ft}>
                              <line
                                x1={20}
                                y1={g.y}
                                x2={240}
                                y2={g.y}
                                stroke="#1E293B"
                                strokeDasharray="3 3"
                                strokeWidth={1}
                              />
                              <text
                                x={24}
                                y={g.y - 4}
                                fill="#38BDF8"
                                fontSize="10"
                                fontWeight="600"
                                fontFamily="JetBrains Mono, monospace"
                              >
                                {g.ft} ft
                              </text>
                            </g>
                          ))}
                          <line
                            x1={130}
                            y1={20}
                            x2={130}
                            y2={295}
                            stroke="#334155"
                            strokeDasharray="4 4"
                            strokeWidth={1}
                          />
                          <path
                            d={lbSvg.pathD}
                            fill="none"
                            stroke={lightboxDisc.colorHex}
                            strokeWidth={4}
                            strokeLinecap="round"
                            style={{
                              filter: `drop-shadow(0 0 8px ${lightboxDisc.colorHex})`
                            }}
                          />
                          <rect
                            x={116}
                            y={292}
                            width={28}
                            height={7}
                            rx={2}
                            fill="#00F0FF"
                          />
                          <circle
                            cx={lbSvg.endX}
                            cy={lbSvg.endY}
                            r={6.5}
                            fill={lightboxDisc.colorHex}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                          />
                          <text
                            x={130}
                            y={312}
                            textAnchor="middle"
                            fill="#E2E8F0"
                            fontSize="10"
                            fontWeight="600"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            TEE PAD (RHBH)
                          </text>
                        </svg>
                      </div>
                    </div>

                    {/* Full Flight Analysis (From Commentary) & Release Cue */}
                    <div className="p-4 rounded-2xl bg-[#0B0F1E] border border-slate-800 space-y-3 text-xs sm:text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-[#39FF14]">
                          🎯 How It Flies For Me (Based on My Round Commentary)
                        </span>
                        {lightboxDisc.fieldTestRank && (
                          <span className="px-2 py-0.5 rounded-md bg-[#39FF14]/15 border border-[#39FF14]/50 text-[11px] font-mono-tabular font-bold text-[#39FF14]">
                            {lightboxDisc.fieldTestRank}
                          </span>
                        )}
                      </div>

                      <p className="text-white leading-relaxed">{lf.howItFliesForMe}</p>

                      <div className="p-2.5 rounded-xl bg-[#080B14] border border-[#00F0FF]/50 text-slate-200">
                        <span className="font-bold text-[#00F0FF]">
                          🎙️ My Release Cue &amp; Tendency Check:{' '}
                        </span>
                        {lf.swingCue}
                      </div>

                      {lightboxDisc.backComments && (
                        <div className="p-2.5 rounded-xl bg-[#080B14] border border-slate-800 text-slate-200">
                          <span className="font-bold text-[#FF2E93]">Field &amp; Round Notes: </span>
                          {lightboxDisc.backComments}
                        </div>
                      )}

                      {lightboxDisc.spotterWarning && (
                        <div className="p-2.5 rounded-xl bg-[#FACC15]/15 border border-[#FACC15] flex items-center gap-2 text-[#FACC15] font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{lightboxDisc.spotterWarning}</span>
                        </div>
                      )}
                    </div>

                    {/* Logged Round Commentary & Hole History */}
                    <div className="p-4 rounded-2xl bg-[#0B0F1E] border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-extrabold text-[#FACC15]">
                          🎙️ Logged Holes &amp; Round Commentary ({st.logs.length})
                        </span>
                        <span className="text-xs font-mono-tabular text-[#39FF14] font-bold">
                          {st.birdies} Birdies · {st.pars} Pars
                        </span>
                      </div>

                      {st.logs.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          No specific hole commentary logged for {lightboxDisc.name} yet.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {st.logs.map((lg, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-[#080B14] border border-slate-800 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2 font-mono-tabular">
                                <span className="font-bold text-[#00F0FF]">
                                  {lg.courseName} · Hole #{lg.holeNumber} ({lg.distance}ft, Par {lg.par})
                                </span>
                                <span className="font-extrabold text-[#39FF14]">
                                  {lg.date} {lg.score ? `· Score ${lg.score}` : ''}
                                </span>
                              </div>
                              {lg.commentary && (
                                <p className="text-slate-300 leading-snug">{lg.commentary}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
