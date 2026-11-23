import {
  CaddieScenario,
  DiscItem,
  HistoricalRound,
  HoleData
} from '../data/initialData';

export function formatRelativePar(diff: number): string {
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
}

export function getScoreTerm(score: number, par: number): {
  label: string;
  shortLabel: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
} {
  if (!score || score <= 0) {
    return {
      label: 'Unscored',
      shortLabel: '—',
      textColor: 'text-slate-500',
      bgColor: 'bg-[#0D1120]',
      borderColor: 'border-slate-800'
    };
  }
  if (score === 1) {
    return {
      label: 'Ace',
      shortLabel: 'ACE',
      textColor: 'text-[#FACC15]',
      bgColor: 'bg-[#FACC15]/15',
      borderColor: 'border-[#FACC15]'
    };
  }
  const diff = score - par;
  if (diff <= -2) {
    return {
      label: 'Eagle',
      shortLabel: 'EAG',
      textColor: 'text-[#39FF14]',
      bgColor: 'bg-[#39FF14]/20',
      borderColor: 'border-[#39FF14]'
    };
  }
  if (diff === -1) {
    return {
      label: 'Birdie',
      shortLabel: 'BIR',
      textColor: 'text-[#39FF14]',
      bgColor: 'bg-[#39FF14]/15',
      borderColor: 'border-[#39FF14]/80'
    };
  }
  if (diff === 0) {
    return {
      label: 'Par',
      shortLabel: 'PAR',
      textColor: 'text-[#00F0FF]',
      bgColor: 'bg-[#00F0FF]/10',
      borderColor: 'border-[#00F0FF]/60'
    };
  }
  if (diff === 1) {
    return {
      label: 'Bogey',
      shortLabel: 'BOG',
      textColor: 'text-[#FF9E00]',
      bgColor: 'bg-[#FF9E00]/15',
      borderColor: 'border-[#FF9E00]/70'
    };
  }
  if (diff === 2) {
    return {
      label: 'Double Bogey',
      shortLabel: 'DBL',
      textColor: 'text-[#FF2E93]',
      bgColor: 'bg-[#FF2E93]/15',
      borderColor: 'border-[#FF2E93]/80'
    };
  }
  return {
    label: `+${diff}`,
    shortLabel: `+${diff}`,
    textColor: 'text-[#FF2E93]',
    bgColor: 'bg-[#FF2E93]/25',
    borderColor: 'border-[#FF2E93]'
  };
}

export interface HoleCaddyInsight {
  holeNumber: number;
  roundsPlayed: number;
  playerStats: Record<
    string,
    {
      lastScore: number | null;
      lastDate: string | null;
      lastDiscUsed: string | null;
      lastThrownDiscId: string | null;
      lastVoiceNote: string | null;
      bestDiscUsed: string | null;
      bestThrownDiscId: string | null;
      recentScores: number[];
      avgScore: number;
      bestScore: number | null;
      worstScore: number | null;
      birdies: number;
      pars: number;
      bogeysOrWorse: number;
    }
  >;
}

export function getHoleCaddyInsights(
  courseName: string,
  holeNumber: number,
  history: HistoricalRound[],
  playerIds: string[]
): HoleCaddyInsight {
  const targetCourseNorm = normalizeCourseKeyForPicks(courseName);
  const courseRounds = history.filter(
    (r) =>
      normalizeCourseKeyForPicks(r.courseName) === targetCourseNorm ||
      r.courseName.toLowerCase() === courseName.toLowerCase()
  );

  const playerStats: HoleCaddyInsight['playerStats'] = {};
  for (const pid of playerIds) {
    const scores: {
      score: number;
      par: number;
      date: string;
      discUsed: string | null;
      thrownDiscId: string | null;
      voiceNote: string | null;
    }[] = [];
    for (const r of courseRounds) {
      const h = r.holes.find((hole) => hole.number === holeNumber);
      if (h && h.scores[pid] && h.scores[pid] > 0) {
        const meta = h.meta?.[pid];
        const teeThrowDiscId =
          meta?.thrownDiscId ||
          meta?.throws?.find((t) => t.shotType === 'tee')?.discId ||
          meta?.throws?.[0]?.discId ||
          null;
        scores.push({
          score: h.scores[pid],
          par: h.par,
          date: r.date,
          discUsed: meta?.discUsed || null,
          thrownDiscId: teeThrowDiscId,
          voiceNote: meta?.voiceNote || meta?.notes || h.voiceTranscript || null
        });
      }
    }

    if (scores.length === 0) {
      playerStats[pid] = {
        lastScore: null,
        lastDate: null,
        lastDiscUsed: null,
        lastThrownDiscId: null,
        lastVoiceNote: null,
        bestDiscUsed: null,
        bestThrownDiscId: null,
        recentScores: [],
        avgScore: 0,
        bestScore: null,
        worstScore: null,
        birdies: 0,
        pars: 0,
        bogeysOrWorse: 0
      };
    } else {
      const sum = scores.reduce((acc, s) => acc + s.score, 0);
      const best = Math.min(...scores.map((s) => s.score));
      const worst = Math.max(...scores.map((s) => s.score));
      const bestEntry =
        scores.find((s) => s.score === best && (s.thrownDiscId || s.discUsed)) ||
        scores.find((s) => s.score === best) ||
        scores[0];
      const birdies = scores.filter((s) => s.score < s.par).length;
      const pars = scores.filter((s) => s.score === s.par).length;
      const bogeysOrWorse = scores.filter((s) => s.score > s.par).length;
      playerStats[pid] = {
        lastScore: scores[0].score,
        lastDate: scores[0].date,
        lastDiscUsed: scores[0].discUsed,
        lastThrownDiscId: scores[0].thrownDiscId,
        lastVoiceNote: scores[0].voiceNote,
        bestDiscUsed: bestEntry?.discUsed || null,
        bestThrownDiscId: bestEntry?.thrownDiscId || null,
        recentScores: scores.slice(0, 4).map((s) => s.score),
        avgScore: Number((sum / scores.length).toFixed(2)),
        bestScore: best,
        worstScore: worst,
        birdies,
        pars,
        bogeysOrWorse
      };
    }
  }

  return {
    holeNumber,
    roundsPlayed: courseRounds.length,
    playerStats
  };
}

export function getCoursePersonalBest(
  courseName: string,
  playerId: string,
  history: HistoricalRound[]
): { bestTotal: number | null; bestRelPar: number | null; avgTotal: number | null; roundsCount: number } {
  const targetCourseNorm = normalizeCourseKeyForPicks(courseName);
  const matching = history.filter(
    (r) =>
      (normalizeCourseKeyForPicks(r.courseName) === targetCourseNorm ||
        r.courseName.toLowerCase() === courseName.toLowerCase()) &&
      r.players.some((p) => p.id === playerId && p.total > 0)
  );

  if (matching.length === 0) {
    return { bestTotal: null, bestRelPar: null, avgTotal: null, roundsCount: 0 };
  }

  let bestTotal = Infinity;
  let bestRelPar = Infinity;
  let sumTotal = 0;

  for (const r of matching) {
    const p = r.players.find((pl) => pl.id === playerId)!;
    sumTotal += p.total;
    if (p.total < bestTotal) {
      bestTotal = p.total;
      bestRelPar = p.total - r.par;
    }
  }

  return {
    bestTotal,
    bestRelPar,
    avgTotal: Number((sumTotal / matching.length).toFixed(1)),
    roundsCount: matching.length
  };
}

export interface PlayerCareerProfile {
  playerId: string;
  roundsPlayed: number;
  holesPlayed: number;
  totalStrokes: number;
  totalPar: number;
  overallRelPar: number;
  avgRelParPer9: number;
  aces: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleOrWorse: number;
  bestRoundRelPar: { diff: number; courseName: string; date: string; score: number; par: number } | null;
  distanceBrackets: {
    label: string;
    rangeText: string;
    holesCount: number;
    avgRelPar: number;
  }[];
}

export function computePlayerCareerProfile(
  playerId: string,
  history: HistoricalRound[]
): PlayerCareerProfile {
  let roundsPlayed = 0;
  let holesPlayed = 0;
  let totalStrokes = 0;
  let totalPar = 0;
  let aces = 0;
  let birdies = 0;
  let pars = 0;
  let bogeys = 0;
  let doubleOrWorse = 0;
  let bestRoundRelPar: PlayerCareerProfile['bestRoundRelPar'] = null;

  const brackets = [
    { label: 'Putters & Touch (SPD 2–4)', rangeText: '< 185 ft', min: 0, max: 184, count: 0, diffSum: 0 },
    { label: 'Midrange Trio (SPD 5)', rangeText: '185–239 ft', min: 185, max: 239, count: 0, diffSum: 0 },
    { label: 'Fairway Workhorse (SPD 7–9)', rangeText: '240–299 ft', min: 240, max: 299, count: 0, diffSum: 0 },
    { label: 'Max Air Distance (SPD 11)', rangeText: '300+ ft', min: 300, max: 9999, count: 0, diffSum: 0 }
  ];

  for (const round of history) {
    const pSummary = round.players.find((p) => p.id === playerId);
    if (!pSummary) continue;

    roundsPlayed++;
    const roundDiff = pSummary.total - round.par;
    if (!bestRoundRelPar || roundDiff < bestRoundRelPar.diff) {
      bestRoundRelPar = {
        diff: roundDiff,
        courseName: round.courseName,
        date: round.date,
        score: pSummary.total,
        par: round.par
      };
    }

    for (const h of round.holes) {
      const s = h.scores[playerId];
      if (!s || s <= 0) continue;
      holesPlayed++;
      totalStrokes += s;
      totalPar += h.par;

      if (s === 1) aces++;
      const d = s - h.par;
      if (d <= -1) birdies++;
      else if (d === 0) pars++;
      else if (d === 1) bogeys++;
      else doubleOrWorse++;

      const b = brackets.find((br) => h.distance >= br.min && h.distance <= br.max);
      if (b) {
        b.count++;
        b.diffSum += d;
      }
    }
  }

  const overallRelPar = totalStrokes - totalPar;
  const avgRelParPer9 = holesPlayed > 0 ? Number(((overallRelPar / holesPlayed) * 9).toFixed(1)) : 0;

  return {
    playerId,
    roundsPlayed,
    holesPlayed,
    totalStrokes,
    totalPar,
    overallRelPar,
    avgRelParPer9,
    aces,
    birdies,
    pars,
    bogeys,
    doubleOrWorse,
    bestRoundRelPar,
    distanceBrackets: brackets.map((b) => ({
      label: b.label,
      rangeText: b.rangeText,
      holesCount: b.count,
      avgRelPar: b.count > 0 ? Number((b.diffSum / b.count).toFixed(2)) : 0
    }))
  };
}

export interface HeadToHeadSummary {
  sharedRounds: number;
  p1Wins: number;
  p2Wins: number;
  ties: number;
  sharedHoles: number;
  p1Skins: number;
  p2Skins: number;
  pushedHoles: number;
  p1TotalStrokesInShared: number;
  p2TotalStrokesInShared: number;
  roundByRound: Array<{
    id: number;
    date: string;
    courseName: string;
    par: number;
    p1Score: number;
    p2Score: number;
    winnerId: string | 'tie';
    margin: number;
  }>;
}

export function computeHeadToHead(
  p1Id: string,
  p2Id: string,
  history: HistoricalRound[]
): HeadToHeadSummary {
  let sharedRounds = 0;
  let p1Wins = 0;
  let p2Wins = 0;
  let ties = 0;
  let sharedHoles = 0;
  let p1Skins = 0;
  let p2Skins = 0;
  let pushedHoles = 0;
  let p1TotalStrokesInShared = 0;
  let p2TotalStrokesInShared = 0;
  const roundByRound: HeadToHeadSummary['roundByRound'] = [];

  for (const r of history) {
    const p1 = r.players.find((p) => p.id === p1Id);
    const p2 = r.players.find((p) => p.id === p2Id);
    if (!p1 || !p2) continue;

    sharedRounds++;
    p1TotalStrokesInShared += p1.total;
    p2TotalStrokesInShared += p2.total;

    let winnerId: string | 'tie' = 'tie';
    if (p1.total < p2.total) {
      p1Wins++;
      winnerId = p1Id;
    } else if (p2.total < p1.total) {
      p2Wins++;
      winnerId = p2Id;
    } else {
      ties++;
    }

    roundByRound.push({
      id: r.id,
      date: r.date,
      courseName: r.courseName,
      par: r.par,
      p1Score: p1.total,
      p2Score: p2.total,
      winnerId,
      margin: Math.abs(p1.total - p2.total)
    });

    for (const h of r.holes) {
      const s1 = h.scores[p1Id];
      const s2 = h.scores[p2Id];
      if (s1 > 0 && s2 > 0) {
        sharedHoles++;
        if (s1 < s2) p1Skins++;
        else if (s2 < s1) p2Skins++;
        else pushedHoles++;
      }
    }
  }

  return {
    sharedRounds,
    p1Wins,
    p2Wins,
    ties,
    sharedHoles,
    p1Skins,
    p2Skins,
    pushedHoles,
    p1TotalStrokesInShared,
    p2TotalStrokesInShared,
    roundByRound
  };
}

/**
 * Exact implementation of Page 3 "Quick-Pull Caddie Selector & Bag Synergy (On-Course Decision Matrix)"
 */
export function formatWindLabel(scenario?: CaddieScenario): string {
  switch (scenario) {
    case 'headwind':
      return 'Headwind';
    case 'tailwind':
      return 'Tailwind';
    case 'cross_lr':
      return 'L→R Crosswind';
    case 'cross_rl':
      return 'R→L Crosswind';
    default:
      return 'Calm / Tunnel';
  }
}

export function normalizeCourseKeyForPicks(courseKeyOrName?: string): string {
  const raw = (courseKeyOrName || '').toLowerCase();
  if (raw === 'sarko' || raw.includes('sar-ko-par')) return 'sarko';
  if (raw === 'harmon' || raw.includes('harmon')) return 'harmon';
  if (raw === 'blackhoof_18' || (raw.includes('black hoof') && raw.includes('championship'))) {
    return 'blackhoof_18';
  }
  if (raw === 'blackhoof' || (raw.includes('black hoof') && !raw.includes('championship'))) {
    return 'blackhoof';
  }
  if (raw === 'cedar_ridge' || raw === 'cedarridge' || raw.includes('cedar ridge')) return 'cedarridge';
  if (raw === 'wolfden' || raw.includes('wolf den')) return 'wolfden';
  if (raw === 'mize' || raw.includes('mize')) return 'mize';
  if (raw === 'artnine' || raw.includes('art nine')) return 'artnine';
  if (raw === 'smp_wooded' || raw.includes('shawnee mission wooded')) return 'smp_wooded';
  if (
    raw === 'prairie_pass' ||
    raw.includes('prairie pass') ||
    raw.includes('blue valley') ||
    raw.includes('pleasant ridge')
  ) {
    return 'prairie_pass';
  }
  if (raw === 'prairie_center' || raw.includes('prairie center')) return 'prairie_center';
  if (raw === 'california_trail' || raw.includes('california trail')) return 'california_trail';
  if (raw === 'wyandotte' || raw.includes('wyandotte')) return 'wyandotte';
  if (raw === 'heritage_park' || raw.includes('heritage')) return 'heritage_park';
  return raw.replace(/[^a-z0-9]/g, '');
}

export function getVerifiedHoleKey(courseKeyOrName: string, holeNumber: number): string {
  return `${normalizeCourseKeyForPicks(courseKeyOrName)}:${holeNumber}`;
}

/**
 * Jeffery's Verified Hole Picks ★ mapped to his active 17-Disc Main Bag:
 * 14 Cotton Candy "Sugar High" Stamped Innova Discs (Arrived 11/18!) + Star Sync + DX Archangel + Pink DX Alien!
 */
export const DEFAULT_VERIFIED_HOLE_PICKS: Record<string, string> = {
  // Sar-Ko-Par Trails (H1–H9) — 17-Disc Cotton Candy + Halloween Sync / Hot Pink Archangel / Alien Main Bag!
  'sarko:1': 'innova-halloween-sync',
  'sarko:2': 'innova-sugar-star-roadrunner',
  'sarko:3': 'innova-glow-leopard3',
  'sarko:4': 'innova-sugar-glow-roc',
  'sarko:5': 'innova-dx-alien',
  'sarko:6': 'innova-proto-glow-mako3',
  'sarko:7': 'innova-hot-pink-archangel',
  'sarko:8': 'innova-champion-eagle',
  'sarko:9': 'innova-sugar-star-rollo',
  // Harmon & Santa Fe Parks — Yardage-matched Cotton Candy + Core 3!
  'harmon:1': 'innova-glow-leopard3',
  'harmon:2': 'innova-halo-wraith',
  'harmon:3': 'innova-glow-teebird',
  'harmon:4': 'innova-hot-pink-archangel',
  'harmon:5': 'innova-sugar-star-roadrunner',
  'harmon:6': 'innova-proto-glow-mako3',
  'harmon:7': 'innova-sugar-star-rollo',
  'harmon:8': 'innova-halo-destroyer',
  'harmon:9': 'innova-sugar-glow-roc',
  // Black Hoof Flying Disc (9-Hole) — Cotton Candy + Core 3 Picks!
  'blackhoof:1': 'innova-hot-pink-archangel',
  'blackhoof:2': 'innova-hot-pink-archangel',
  'blackhoof:3': 'innova-sugar-star-roadrunner',
  'blackhoof:4': 'innova-sugar-glow-roc',
  'blackhoof:5': 'innova-sugar-star-rollo',
  'blackhoof:6': 'innova-proto-glow-mako3',
  'blackhoof:7': 'innova-halloween-sync',
  'blackhoof:8': 'innova-glow-leopard3',
  'blackhoof:9': 'innova-xt-glow-nova',
  // Black Hoof Championship (White to White · 18 Holes · Par 54 · 4,218 ft) — 11/23 65 (+11 PB Tie!) Picks!
  'blackhoof_18:1': 'innova-sugar-star-rollo',
  'blackhoof_18:2': 'innova-hot-pink-archangel',
  'blackhoof_18:3': 'innova-glow-leopard3',
  'blackhoof_18:4': 'innova-sugar-glow-roc',
  'blackhoof_18:5': 'innova-glow-teebird',
  'blackhoof_18:6': 'innova-glow-leopard3',
  'blackhoof_18:7': 'innova-sugar-star-roadrunner',
  'blackhoof_18:8': 'innova-proto-glow-mako3',
  'blackhoof_18:9': 'innova-sugar-glow-roc',
  'blackhoof_18:10': 'innova-sugar-star-rollo',
  'blackhoof_18:11': 'innova-proto-glow-mako3',
  'blackhoof_18:12': 'innova-sugar-star-roadrunner',
  'blackhoof_18:13': 'innova-halloween-sync',
  'blackhoof_18:14': 'innova-proto-glow-mako3',
  'blackhoof_18:15': 'innova-sugar-star-rollo',
  'blackhoof_18:16': 'innova-proto-glow-mako3',
  'blackhoof_18:17': 'innova-sugar-star-rollo',
  'blackhoof_18:18': 'innova-sugar-star-rollo',
  // Cedar Ridge (H1–H18, Par 58, 5,344ft) — Cotton Candy + Core 3 Lineup!
  'cedarridge:1': 'innova-sugar-star-roadrunner',
  'cedarridge:2': 'innova-sugar-star-roadrunner',
  'cedarridge:3': 'innova-glow-teebird',
  'cedarridge:4': 'innova-proto-glow-mako3',
  'cedarridge:5': 'innova-proto-glow-mako3',
  'cedarridge:6': 'innova-sugar-star-roadrunner',
  'cedarridge:7': 'innova-sugar-star-roadrunner',
  'cedarridge:8': 'innova-halo-destroyer',
  'cedarridge:9': 'innova-sugar-star-roadrunner',
  'cedarridge:10': 'innova-halloween-sync',
  'cedarridge:11': 'innova-sugar-star-rollo',
  'cedarridge:12': 'innova-halloween-sync',
  'cedarridge:13': 'innova-halo-wraith',
  'cedarridge:14': 'innova-sugar-star-roadrunner',
  'cedarridge:15': 'innova-sugar-star-roadrunner',
  'cedarridge:16': 'innova-halo-destroyer',
  'cedarridge:17': 'innova-hot-pink-archangel',
  'cedarridge:18': 'innova-hot-pink-archangel',
  // Mize Elementary (H1–H9, 218–389ft) — Cotton Candy + Core 3 Driver-First Lineup!
  'mize:1': 'innova-sugar-star-roadrunner',
  'mize:2': 'innova-sugar-star-roadrunner',
  'mize:3': 'innova-halo-wraith',
  'mize:4': 'innova-halo-wraith',
  'mize:5': 'innova-sugar-star-roadrunner',
  'mize:6': 'innova-halo-destroyer',
  'mize:7': 'innova-glow-teebird',
  'mize:8': 'innova-sugar-star-roadrunner',
  'mize:9': 'innova-hot-pink-archangel',
  // The Art Nine @ SMP (H1–H9, 84–146ft) — Cotton Candy + Halloween Sync / Alien Picks!
  'artnine:1': 'innova-sugar-glow-roc',
  'artnine:2': 'innova-dx-alien',
  'artnine:3': 'innova-sugar-star-rollo',
  'artnine:4': 'innova-proto-glow-mako3',
  'artnine:5': 'innova-halloween-sync',
  'artnine:6': 'innova-dx-alien',
  'artnine:7': 'innova-proto-glow-aviar',
  'artnine:8': 'innova-kc-pro-aviar',
  'artnine:9': 'innova-sugar-glow-roc',
  // Heritage Park DGC (All Silver / A Baskets, H1–H18) — Cotton Candy + Core 3!
  'heritage_park:1': 'innova-halo-wraith',
  'heritage_park:2': 'innova-sugar-star-roadrunner',
  'heritage_park:3': 'innova-halo-destroyer',
  'heritage_park:4': 'innova-glow-teebird',
  'heritage_park:5': 'innova-glow-leopard3',
  'heritage_park:6': 'innova-glow-teebird',
  'heritage_park:7': 'innova-halo-destroyer',
  'heritage_park:8': 'innova-halo-wraith',
  'heritage_park:9': 'innova-glow-leopard3',
  'heritage_park:10': 'innova-glow-teebird',
  'heritage_park:11': 'innova-sugar-star-roadrunner',
  'heritage_park:12': 'innova-sugar-star-roadrunner',
  'heritage_park:13': 'innova-glow-leopard3',
  'heritage_park:14': 'innova-sugar-star-roadrunner',
  'heritage_park:15': 'innova-glow-teebird',
  'heritage_park:16': 'innova-sugar-star-roadrunner',
  'heritage_park:17': 'innova-glow-leopard3',
  'heritage_park:18': 'innova-halo-wraith',
  // Shawnee Mission Wooded (H1–H18, Par 54, 4,881ft) — Cotton Candy + Halloween Sync / Hot Pink Archangel / Alien!
  'smp_wooded:1': 'innova-champion-eagle',
  'smp_wooded:2': 'innova-halloween-sync',
  'smp_wooded:3': 'innova-sugar-star-roadrunner',
  'smp_wooded:4': 'innova-proto-glow-mako3',
  'smp_wooded:5': 'innova-sugar-star-rollo',
  'smp_wooded:6': 'innova-glow-leopard3',
  'smp_wooded:7': 'innova-halo-wraith',
  'smp_wooded:8': 'innova-halo-wraith',
  'smp_wooded:9': 'innova-halo-wraith',
  'smp_wooded:10': 'innova-sugar-glow-roc',
  'smp_wooded:11': 'innova-proto-glow-mako3',
  'smp_wooded:12': 'innova-sugar-star-rollo',
  'smp_wooded:13': 'innova-proto-glow-mako3',
  'smp_wooded:14': 'innova-champion-eagle',
  'smp_wooded:15': 'innova-halloween-sync',
  'smp_wooded:16': 'innova-sugar-star-rollo',
  'smp_wooded:17': 'innova-glow-teebird',
  'smp_wooded:18': 'innova-halo-wraith',
  // Blue Valley "Prairie Pass" DG Course (Standard 18, Par 54, 4,209 ft) — Cotton Candy + Core 3!
  'prairie_pass:1': 'innova-glow-leopard3',
  'prairie_pass:2': 'innova-sugar-star-rollo',
  'prairie_pass:3': 'innova-proto-glow-mako3',
  'prairie_pass:4': 'innova-sugar-star-roadrunner',
  'prairie_pass:5': 'innova-sugar-star-roadrunner',
  'prairie_pass:6': 'innova-sugar-glow-roc',
  'prairie_pass:7': 'innova-halloween-sync',
  'prairie_pass:8': 'innova-hot-pink-archangel',
  'prairie_pass:9': 'innova-proto-glow-mako3',
  'prairie_pass:10': 'innova-sugar-star-rollo',
  'prairie_pass:11': 'innova-sugar-star-rollo',
  'prairie_pass:12': 'innova-hot-pink-archangel',
  'prairie_pass:13': 'innova-halo-wraith',
  'prairie_pass:14': 'innova-glow-leopard3',
  'prairie_pass:15': 'innova-glow-teebird',
  'prairie_pass:16': 'innova-halo-wraith',
  'prairie_pass:17': 'innova-halo-wraith',
  'prairie_pass:18': 'innova-glow-teebird',
  // Prairie Center Park (H1–H18, Par 55, 5,808 ft) — Cotton Candy + Core 3!
  'prairie_center:1': 'innova-sugar-star-roadrunner',
  'prairie_center:2': 'innova-sugar-glow-roc',
  'prairie_center:3': 'innova-proto-glow-mako3',
  'prairie_center:4': 'innova-glow-leopard3',
  'prairie_center:5': 'innova-sugar-star-roadrunner',
  'prairie_center:6': 'innova-sugar-star-roadrunner',
  'prairie_center:7': 'innova-dx-alien',
  'prairie_center:8': 'innova-sugar-star-roadrunner',
  'prairie_center:9': 'innova-sugar-star-roadrunner',
  'prairie_center:10': 'innova-sugar-star-rollo',
  'prairie_center:11': 'innova-glow-leopard3',
  'prairie_center:12': 'innova-halo-wraith',
  'prairie_center:13': 'innova-halo-destroyer',
  'prairie_center:14': 'innova-halo-wraith',
  'prairie_center:15': 'innova-sugar-star-roadrunner',
  'prairie_center:16': 'innova-glow-leopard3',
  'prairie_center:17': 'innova-halo-wraith',
  'prairie_center:18': 'innova-sugar-star-roadrunner'
};

export type CaddieStabilityFilter = 'hole_match' | 'understable' | 'stable' | 'overstable';

const MAIN_BAG_EQUIVALENT_MAP: Record<string, string[]> = {
  'innova-sync': [
    'innova-halloween-sync',
    'innova-proto-glow-aviar',
    'innova-yeti-pro-aviar',
    'innova-xt-glow-nova',
    'innova-kc-pro-aviar'
  ],
  'innova-aviar': ['innova-proto-glow-aviar', 'innova-yeti-pro-aviar', 'innova-kc-pro-aviar'],
  'innova-toro': ['innova-kc-pro-aviar', 'innova-sugar-glow-roc', 'innova-yeti-pro-aviar'],
  'innova-pig': ['innova-kc-pro-aviar', 'innova-yeti-pro-aviar', 'innova-sugar-glow-roc'],
  'innova-dx-alien': ['innova-xt-glow-nova', 'innova-proto-glow-aviar', 'innova-proto-glow-mako3'],
  'innova-mako3': ['innova-proto-glow-mako3', 'innova-xt-glow-nova'],
  'innova-jay': ['innova-proto-glow-mako3', 'innova-sugar-glow-roc'],
  'innova-roc3': ['innova-sugar-glow-roc', 'innova-proto-glow-mako3'],
  'innova-classic-glow-roc': ['innova-sugar-glow-roc', 'innova-proto-glow-mako3'],
  'innova-rollo': ['innova-sugar-star-rollo', 'innova-proto-glow-mako3'],
  'innova-it': ['innova-glow-leopard3', 'innova-glow-teebird', 'innova-sugar-star-roadrunner'],
  'innova-leopard3': ['innova-glow-leopard3', 'innova-glow-teebird', 'innova-sugar-star-roadrunner'],
  'innova-archangel': [
    'innova-hot-pink-archangel',
    'innova-glow-leopard3',
    'innova-sugar-star-roadrunner',
    'innova-glow-teebird'
  ],
  'innova-roadrunner': ['innova-sugar-star-roadrunner', 'innova-glow-leopard3'],
  'innova-classic-glow-beast': [
    'innova-halo-wraith',
    'innova-sugar-star-roadrunner',
    'innova-glow-teebird'
  ],
  'innova-mamba': ['innova-sugar-star-roadrunner', 'innova-halo-wraith', 'innova-halo-destroyer'],
  'innova-classic-glow-wraith': ['innova-halo-wraith', 'innova-halo-destroyer'],
  'innova-firebird': ['innova-luster-firebird', 'innova-champion-eagle']
};

export function recommendDiscsByStability(
  stabilityFilter: CaddieStabilityFilter,
  distanceFeet: number,
  scenario: CaddieScenario,
  bag: DiscItem[],
  courseKey?: string,
  holeNumber?: number
): {
  primary: DiscItem | null;
  secondary: DiscItem | null;
  finisher: DiscItem | null;
  driverAlts: DiscItem[];
  midAlts: DiscItem[];
  putterAlts: DiscItem[];
  shotCallout: string;
  secondaryCallout: string;
  finisherCallout: string;
  recommendedTierIndex: 0 | 1 | 2;
  yardageTierLabel: string;
} {
  const activeBag = bag.filter((d) => !d.archived && d.ownerId !== 'jack');
  const pool = activeBag.length > 0 ? activeBag : bag.filter((d) => !d.archived);
  const byId = (id: string): DiscItem | null => {
    const exact = pool.find((d) => d.id === id);
    if (exact) return exact;
    const alts = MAIN_BAG_EQUIVALENT_MAP[id];
    if (alts) {
      for (const altId of alts) {
        const matched = pool.find((d) => d.id === altId);
        if (matched) return matched;
      }
    }
    return null;
  };

  // Yardage-based primary slot:
  // >= 215 ft -> 0 (1. DRIVER)
  // 155–214 ft -> 1 (2. MID-RANGE)
  // < 155 ft -> 2 (3. PUTTER / APPROACH)
  const recommendedTierIndex: 0 | 1 | 2 =
    distanceFeet >= 215 ? 0 : distanceFeet >= 155 ? 1 : 2;
  const yardageTierLabel =
    distanceFeet >= 215
      ? `${distanceFeet} ft = Driver Yardage (1. Driver Recommended)`
      : distanceFeet >= 155
      ? `${distanceFeet} ft = Midrange / Fairway Yardage (2. Mid-Range or Low Driver)`
      : `${distanceFeet} ft = Short Touch Yardage (3. Putter or Touch Mid)`;

  if (stabilityFilter === 'understable') {
    const primaryDriver =
      distanceFeet >= 245
        ? byId('innova-sugar-star-roadrunner') || byId('innova-hot-pink-archangel') || byId('innova-glow-leopard3')
        : byId('innova-hot-pink-archangel') || byId('innova-glow-leopard3') || byId('innova-sugar-star-roadrunner');
    const driverAlts = [
      byId('innova-sugar-star-roadrunner'),
      byId('innova-hot-pink-archangel'),
      byId('innova-glow-leopard3')
    ].filter((d): d is DiscItem => Boolean(d));
    const mid = byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3');
    const putter = byId('innova-halloween-sync') || byId('innova-proto-glow-aviar') || byId('innova-xt-glow-nova');

    return {
      primary: primaryDriver,
      secondary: mid,
      finisher: putter,
      driverAlts,
      midAlts: [
        byId('innova-sugar-star-rollo'),
        byId('innova-proto-glow-mako3'),
        byId('innova-dx-alien')
      ].filter((d): d is DiscItem => Boolean(d)),
      putterAlts: [
        byId('innova-halloween-sync'),
        byId('innova-proto-glow-aviar'),
        byId('innova-yeti-pro-aviar'),
        byId('innova-xt-glow-nova')
      ].filter((d): d is DiscItem => Boolean(d)),
      shotCallout:
        primaryDriver?.id === 'innova-sugar-star-roadrunner'
          ? 'Star Roadrunner [9|5|-4|1] (Cotton Candy Main Bag) — Easy hyzer-flip distance, long right-turning pans & tailwind turnovers!'
          : primaryDriver?.id === 'innova-hot-pink-archangel'
          ? '170g DX Archangel [8|6|-4|1] (Main Bag Core 3) — Massive 6-glide woods threader (Prairie Pass H8 10ft pin-high gem!) paired w/ Glow Leopard3!'
          : 'Glow Leopard3 [7|5|-2|1] (Cotton Candy Color Glow) — Smooth wooded hyzer-flip & S-curve fairway.',
      secondaryCallout:
        'Star Rollo [5|6|-4|1] (Cotton Candy Main Bag) — Effortless RHBH right-turn shaper, uphill closer & fairway roller.',
      finisherCallout:
        '175g Star Sync [3|3|0|1] & Proto Glow Aviar [2|3|0|1] — Laser-straight throwing putters & touch glide.',
      recommendedTierIndex,
      yardageTierLabel
    };
  }

  if (stabilityFilter === 'stable') {
    const primaryDriver =
      distanceFeet >= 265
        ? byId('innova-halo-wraith') || byId('innova-glow-teebird')
        : distanceFeet >= 215
        ? byId('innova-glow-teebird') || byId('innova-glow-leopard3')
        : byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || byId('innova-glow-teebird');
    const mid = byId('innova-proto-glow-mako3') || byId('innova-dx-alien') || byId('innova-sugar-glow-roc');
    const putter =
      distanceFeet < 155
        ? byId('innova-halloween-sync') || byId('innova-xt-glow-nova')
        : byId('innova-dx-alien') || byId('innova-proto-glow-aviar') || byId('innova-xt-glow-nova');

    return {
      primary: primaryDriver,
      secondary: mid,
      finisher: putter,
      driverAlts: [
        byId('innova-glow-teebird'),
        byId('innova-glow-leopard3'),
        byId('innova-hot-pink-archangel'),
        byId('innova-halo-wraith'),
        byId('innova-sugar-star-roadrunner')
      ].filter((d): d is DiscItem => Boolean(d)),
      midAlts: [
        byId('innova-proto-glow-mako3'),
        byId('innova-dx-alien'),
        byId('innova-sugar-glow-roc')
      ].filter((d): d is DiscItem => Boolean(d)),
      putterAlts: [
        byId('innova-halloween-sync'),
        byId('innova-dx-alien'),
        byId('innova-xt-glow-nova'),
        byId('innova-proto-glow-aviar'),
        byId('innova-yeti-pro-aviar'),
        byId('innova-kc-pro-aviar')
      ].filter((d): d is DiscItem => Boolean(d)),
      shotCallout:
        primaryDriver?.id === 'innova-halo-wraith'
          ? 'Halo Wraith [11|5|-1|3] (Cotton Candy Main Bag) — Controlled low-ceiling power drive with dependable finish.'
          : primaryDriver?.id === 'innova-glow-teebird'
          ? 'Glow Teebird [7|5|0|2] (Cotton Candy Main Bag) — Pinpoint straight-to-fade 7-speed accuracy!'
          : 'Glow Leopard3 [7|5|-2|1] & DX Archangel [8|6|-4|1] — Smooth straight-to-gentle-fade tunnel fairways.',
      secondaryCallout:
        'Proto Glow Mako3 [5|5|0|0] & Pink DX Alien [4|2|0|1] — Point-and-shoot straight tunnel laser + low-skip bullseye touch!',
      finisherCallout:
        putter?.id === 'innova-halloween-sync'
          ? '175g Star Sync [3|3|0|1] — #1 straight tee putter (Sar-Ko H1 Basket Hit!) & wooded chute laser.'
          : putter?.id === 'innova-dx-alien'
          ? '178g Pink DX Alien [4|2|0|1] — Low-ceiling skip birdie & bullseye stopper (Sar-Ko H5 & Art Nine H6 Birdies!).'
          : '175g XT Glow Nova [2|2|0|0] & Proto Glow Aviar [2|3|0|1] — Dead-straight slope stopper & driving putter.',
      recommendedTierIndex,
      yardageTierLabel
    };
  }

  if (stabilityFilter === 'overstable') {
    const primaryDriver =
      distanceFeet >= 285
        ? byId('innova-halo-destroyer') || byId('innova-halo-wraith')
        : distanceFeet >= 250
        ? byId('innova-halo-wraith') || byId('innova-luster-firebird')
        : distanceFeet >= 215
        ? byId('innova-luster-firebird') || byId('innova-champion-eagle')
        : byId('innova-champion-eagle') || byId('innova-glow-teebird');
    const mid = byId('innova-sugar-glow-roc') || byId('innova-dx-alien');
    const putter = byId('innova-kc-pro-aviar') || byId('innova-yeti-pro-aviar');

    return {
      primary: primaryDriver,
      secondary: mid,
      finisher: putter,
      driverAlts: [
        byId('innova-halo-destroyer'),
        byId('innova-halo-wraith'),
        byId('innova-luster-firebird'),
        byId('innova-champion-eagle'),
        byId('innova-glow-teebird')
      ].filter((d): d is DiscItem => Boolean(d)),
      midAlts: [byId('innova-sugar-glow-roc'), byId('innova-dx-alien')].filter(
        (d): d is DiscItem => Boolean(d)
      ),
      putterAlts: [
        byId('innova-kc-pro-aviar'),
        byId('innova-yeti-pro-aviar'),
        byId('innova-dx-alien')
      ].filter((d): d is DiscItem => Boolean(d)),
      shotCallout:
        primaryDriver?.id === 'innova-halo-destroyer'
          ? 'Halo Destroyer [12|5|-1|3] (Cotton Candy Main Bag) — Flagship Speed 12 max-distance & headwind bomber!'
          : primaryDriver?.id === 'innova-halo-wraith'
          ? 'Halo Wraith [11|5|-1|3] (Cotton Candy Main Bag) — Tour-proven headwind distance control with +3 fade.'
          : primaryDriver?.id === 'innova-luster-firebird'
          ? 'Luster Firebird [9|3|0|4] (Cotton Candy Main Bag) — Fierce headwind fighter, flare-skip & forehand flex utility!'
          : '175g Champion Eagle [7|4|-1|3] (Cotton Candy Main Bag) — Overstable fairway control & Sar-Ko H8 5–7ft Birdie Parker!',
      secondaryCallout:
        'DX Glow Roc [4|4|0|3] (Cotton Candy Main Bag) — Classic Rancho wind-fighting mid with reliable +3 left finish.',
      finisherCallout:
        '175g KC Pro Aviar [2|3|0|2] & Yeti Pro Aviar [2|3|0|1] — Firm beaded wind putter & tacky concave approach.',
      recommendedTierIndex,
      yardageTierLabel
    };
  }

  const base = recommendDiscForScenario(distanceFeet, scenario, bag, courseKey, holeNumber);
  return {
    primary: base.primary,
    secondary: base.secondary,
    finisher: base.finisher,
    driverAlts: [
      byId('innova-halo-destroyer'),
      byId('innova-halo-wraith'),
      byId('innova-luster-firebird'),
      byId('innova-sugar-star-roadrunner'),
      byId('innova-hot-pink-archangel'),
      byId('innova-champion-eagle'),
      byId('innova-glow-teebird'),
      byId('innova-glow-leopard3')
    ].filter((d): d is DiscItem => Boolean(d)),
    midAlts: [
      byId('innova-sugar-glow-roc'),
      byId('innova-proto-glow-mako3'),
      byId('innova-sugar-star-rollo'),
      byId('innova-dx-alien')
    ].filter((d): d is DiscItem => Boolean(d)),
    putterAlts: [
      byId('innova-halloween-sync'),
      byId('innova-dx-alien'),
      byId('innova-xt-glow-nova'),
      byId('innova-proto-glow-aviar'),
      byId('innova-yeti-pro-aviar'),
      byId('innova-kc-pro-aviar')
    ].filter((d): d is DiscItem => Boolean(d)),
    shotCallout: base.shotCallout,
    secondaryCallout: base.secondaryCallout,
    finisherCallout: base.finisherCallout,
    recommendedTierIndex,
    yardageTierLabel
  };
}

export function recommendDiscForScenario(
  distanceFeet: number,
  scenario: CaddieScenario,
  bag: DiscItem[],
  courseKey?: string,
  holeNumber?: number
): {
  primary: DiscItem | null;
  secondary: DiscItem | null;
  finisher: DiscItem | null;
  synergyAlt: DiscItem | null;
  shotCallout: string;
  secondaryCallout: string;
  finisherCallout: string;
} {
  const activeBag = bag.filter((d) => !d.archived);
  const pool = activeBag.length > 0 ? activeBag : bag;

  const byId = (id: string): DiscItem | null => {
    const exact = pool.find((d) => d.id === id);
    if (exact) return exact;
    const alts = MAIN_BAG_EQUIVALENT_MAP[id];
    if (alts) {
      for (const altId of alts) {
        const matched = pool.find((d) => d.id === altId);
        if (matched) return matched;
      }
    }
    return null;
  };
  const normCourse = (courseKey || '').toLowerCase();

  // Always structured in strict order:
  // primary = 1. DRIVER (Mamba, Roadrunner, Archangel, or Leopard3)
  // secondary = 2. MID-RANGE (Glow Mako3, Star Jay, Star Rollo, or DX Roc3)
  // finisher = 3. PUTTER / APPROACH (Star Sync, Star Toro, or Star Aviar)

  // Course-Proven Hole Overrides for Sar-Ko-Par Trails (138–204 ft) — 17-Disc Cotton Candy + Sync / Archangel / Alien!
  if ((normCourse === 'sarko' || normCourse.includes('sar-ko-par')) && holeNumber) {
    if (holeNumber === 1) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: 'Glow Leopard3 [7|5|-2|1] — smooth 60% low touch line if throwing a fairway driver.',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] or Pink DX Alien [4|2|0|1] — point-and-shoot midrange.',
        finisherCallout:
          '★ VERIFIED #1 HOLE PICK (138 FT): 175g Star Sync off the tee — SMACKED THE BASKET on 11/16 (near-Ace Birdie 2!) + 5× career H1 Birdies! (Skip Nova off H1 tee!)'
      };
    }
    if (holeNumber === 2) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-sugar-glow-roc'),
        finisher: byId('innova-kc-pro-aviar') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout:
          '★ VERIFIED #1 DRIVER PICK (192 FT): Star Roadrunner [9|5|-4|1] (11/16 parked exact pin-high 3ft left for Birdie 2!) or Glow Leopard3 [7|5|-2|1].',
        secondaryCallout:
          '★ VERIFIED #1 STRAIGHT PICK: Proto Glow Mako3 [5|5|0|0] — dead-straight down right-center grass away from left woods!',
        finisherCallout:
          '175g KC Pro Aviar or 175g Star Sync — clean C1 closer (XT Glow Nova for tree scrambles).'
      };
    }
    if (holeNumber === 3) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout:
          '★ VERIFIED #1 HOLE PICK (162 FT): Glow Leopard3 [7|5|-2|1] or flat 170g DX Archangel (11/16 dropped right by basket — club down from Roadrunner!).',
        secondaryCallout:
          'Proto Glow Mako3 [5|5|0|0] — point-and-shoot straight tunnel line away from left fence.',
        finisherCallout:
          '★ VERIFIED APPROACH & PUTTER: 175g XT Glow Nova [2|2|0|0] scramble stopper + 175g KC Pro Aviar!'
      };
    }
    if (holeNumber === 4) {
      return {
        primary: byId('innova-champion-eagle') || byId('innova-glow-teebird') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-dx-alien'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout:
          '175g Champion Eagle [7|4|-1|3] or Glow Teebird [7|5|0|2] — dependable right-to-left hyzer pocket.',
        secondaryCallout:
          '★ VERIFIED #1 HOLE PICK (162 FT): Cotton Candy DX Glow Roc [4|4|0|3] — swing right around guardian trees and hook left into Circle 1!',
        finisherCallout:
          '175g XT Glow Nova [2|2|0|0] (11/16 parked right at pin!) or 178g Pink DX Alien [4|2|0|1]!'
      };
    }
    if (holeNumber === 5) {
      return {
        primary: byId('innova-hot-pink-archangel') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-dx-alien') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: '170g DX Archangel or Glow Leopard3 — smooth low corridor floater.',
        secondaryCallout:
          'Cotton Candy DX Glow Roc [4|4|0|3] or Proto Glow Mako3 [5|5|0|0] — split the center guardian tree.',
        finisherCallout:
          '★ VERIFIED #1 HOLE PICK (144 FT): 178g Pink DX Alien [4|2|0|1] — 11/16 low flat skip pin-high 10–15ft right for Birdie 2 ★!'
      };
    }
    if (holeNumber === 6) {
      return {
        primary: byId('innova-champion-eagle') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-sugar-glow-roc'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout:
          '175g Champion Eagle [7|4|-1|3] (11/16 clean left skip!) or 170g DX Archangel [8|6|-4|1].',
        secondaryCallout:
          '★ VERIFIED #1 HOLE PICK (165 FT): Cotton Candy Proto Glow Mako3 [5|5|0|0] — dead-straight laser right under Pin A!',
        finisherCallout:
          '175g XT Glow Nova scramble stopper & 175g KC Pro Aviar tap-in finisher!'
      };
    }
    if (holeNumber === 7) {
      return {
        primary: byId('innova-hot-pink-archangel') || byId('innova-champion-eagle') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-roach'),
        shotCallout:
          '★ VERIFIED #1 HOLE PICK (139 FT): 170g DX Archangel (90° chest-high low under branch!) or 175g Champion Eagle when you want guaranteed left fade!',
        secondaryCallout: 'DX Glow Roc [4|4|0|3] — low left-finishing midrange under the hanging branch.',
        finisherCallout:
          '175g XT Glow Nova glide approach & 175g KC Pro Aviar C1 birdie putter!'
      };
    }
    if (holeNumber === 8) {
      return {
        primary: byId('innova-champion-eagle') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout:
          '★ VERIFIED #1 HOLE PICK (171 FT): 175g Champion Eagle [7|4|-1|3] — 11/16 PARKED 5–7 FEET UNDER THE PIN for Birdie 2 ★! Or 170g DX Archangel!',
        secondaryCallout:
          'Cotton Candy DX Glow Roc [4|4|0|3] — high hyzer route into the southern wooded pocket.',
        finisherCallout:
          '175g XT Glow Nova safe approach behind pole + 175g KC Pro Aviar C1 chains!'
      };
    }
    if (holeNumber === 9) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-dx-alien'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: 'Cotton Candy Star Roadrunner [9|5|-4|1] — uphill turnover driver counterpart to Rollo.',
        secondaryCallout:
          '★ VERIFIED #1 HOLE PICK (141 FT): Cotton Candy Star Rollo [5|6|-4|1] — 6× career H9 Birdies! Match zip to the hill so you don’t overshoot!',
        finisherCallout:
          '★ VERIFIED HILL STOPPER & PUTTER: 175g XT Glow Nova (drained ~18ft downhill 11/16 Birdie!) + 175g KC Pro Aviar!'
      };
    }
  }

  // Course-Proven Hole Overrides for Harmon & Santa Fe Parks — Cotton Candy + Sync / Archangel / Alien!
  if ((normCourse === 'harmon' || normCourse.includes('harmon')) && holeNumber) {
    if (holeNumber === 1) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-sugar-star-roadrunner') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-sugar-glow-roc'),
        finisher: byId('innova-halloween-sync') || byId('innova-xt-glow-nova'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ YARDAGE DRIVER PICK (292 FT): Cotton Candy Glow Leopard3 [7|5|-2|1] — low glide under the oak canopy up the hill.',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] — clean 2nd shot straight up the fairway.',
        finisherCallout: '175g Star Sync — straight uphill approach & Circle 1 putt.'
      };
    }
    if (holeNumber === 2) {
      return {
        primary: byId('innova-halo-wraith') || byId('innova-sugar-star-roadrunner') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ YARDAGE DRIVER PICK (320 FT): Cotton Candy Halo Wraith [11|5|-1|3] or Star Roadrunner [9|5|-4|1] — max-glide tee drive.',
        secondaryCallout: 'Cotton Candy Star Rollo [5|6|-4|1] — smooth 2nd shot curving cleanly down the fairway.',
        finisherCallout: '175g Star Sync or KC Pro Aviar — smooth C1/C2 finisher.'
      };
    }
    if (holeNumber === 3) {
      return {
        primary: byId('innova-glow-teebird') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-dx-alien'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: '★ YARDAGE DRIVER PICK (215 FT): Cotton Candy Glow Teebird [7|5|0|2] — pinpoint fairway placement.',
        secondaryCallout: 'DX Glow Roc [4|4|0|3] or Pink DX Alien [4|2|0|1] — controlled approach onto sloped green.',
        finisherCallout: '175g XT Glow Nova [2|2|0|0] — stops dead on Harmon’s fast sloped green!'
      };
    }
    if (holeNumber === 4) {
      return {
        primary: byId('innova-hot-pink-archangel') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-xt-glow-nova'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: '★ YARDAGE DRIVER PICK (282 FT): 170g DX Archangel [8|6|-4|1] — high-glide straight carry safely clear of right ivy!',
        secondaryCallout: '★ TOP SCRAMBLE PICK: Proto Glow Mako3 [5|5|0|0] — dead-straight woods recovery laser.',
        finisherCallout: '175g Star Sync or XT Glow Nova — reliable approach & C1 chains.'
      };
    }
    if (holeNumber === 5) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-teebird') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-dx-alien') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ YARDAGE DRIVER PICK (247 FT): Cotton Candy Star Roadrunner [9|5|-4|1] or Glow Teebird [7|5|0|2].',
        secondaryCallout: '★ APPROACH PICK: DX Glow Roc [4|4|0|3] — dependable left-fade finish into guarded green!',
        finisherCallout: '178g Pink DX Alien or 175g KC Pro Aviar — tap-in Par closer.'
      };
    }
    if (holeNumber === 6) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-yeti-pro-aviar'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: 'Glow Leopard3 [7|5|-2|1] — powered-down 70% fairway option with minimal skip.',
        secondaryCallout: '★ TOP TEE PICK (230 FT): Proto Glow Mako3 [5|5|0|0] — straight laser to the hill.',
        finisherCallout: '★ SLOPED GREEN STOPPER: 175g XT Glow Nova [2|2|0|0] or Yeti Pro Aviar — grabs the hill and stops dead!'
      };
    }
    if (holeNumber === 7) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: 'Cotton Candy Star Roadrunner [9|5|-4|1] — smooth air-shot or long roller option.',
        secondaryCallout: '★ BIRDIE 2 MVP (168 FT): Cotton Candy Star Rollo [5|6|-4|1] — downhill right-turning glide or roller to the pin!',
        finisherCallout: '175g Star Sync / KC Pro Aviar — C1 Birdie finisher!'
      };
    }
    if (holeNumber === 8) {
      return {
        primary: byId('innova-halo-destroyer') || byId('innova-halo-wraith') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: '★ YARDAGE DRIVER PICK (346 FT): Cotton Candy Halo Destroyer [12|5|-1|3] or Halo Wraith [11|5|-1|3] — big distance off the tee!',
        secondaryCallout: 'Star Rollo or Proto Glow Mako3 — clean 2nd shot through the tree gap.',
        finisherCallout: '175g KC Pro Aviar or Proto Glow Aviar — clean C1 chains finisher.'
      };
    }
    if (holeNumber === 9) {
      return {
        primary: byId('innova-champion-eagle') || byId('innova-glow-teebird') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '175g Champion Eagle [7|4|-1|3] — beat the guardian tree off the 196ft tee.',
        secondaryCallout: '★ YARDAGE MID PICK (196 FT): DX Glow Roc [4|4|0|3] — dependable fade around the center tree to the water tower.',
        finisherCallout: '175g Star Sync — straight approach & firm center-chains putt.'
      };
    }
  }

  // Course-Proven Hole Overrides for Mize Elementary (All 9 holes are 218–389ft) — Cotton Candy + Sync / Archangel / Alien!
  if ((normCourse === 'mize' || normCourse.includes('mize')) && holeNumber) {
    if (holeNumber === 1) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ VERIFIED DRIVER PICK (218 FT): Cotton Candy Star Roadrunner [9|5|-4|1] or Glow Leopard3 [7|5|-2|1].',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] — straight open midrange option.',
        finisherCallout: '175g Star Sync or Proto Glow Aviar — clean 80% approach & C1 putt.'
      };
    }
    if (holeNumber === 2) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-teebird') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-sugar-glow-roc'),
        finisher: byId('innova-halloween-sync') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ VERIFIED #1 HOLE PICK (264 FT): Cotton Candy Star Roadrunner [9|5|-4|1] — straight down left-center grass clear of right woods!',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] — dead-straight midrange option.',
        finisherCallout: '175g Star Sync — dead-straight approach & Par putt.'
      };
    }
    if (holeNumber === 3) {
      return {
        primary: byId('innova-halo-wraith') || byId('innova-sugar-star-roadrunner') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ VERIFIED #1 DRIVER PICK (294 FT): Cotton Candy Halo Wraith [11|5|-1|3] or Star Roadrunner — flat 90° chest pull across open field!',
        secondaryCallout: 'DX Glow Roc [4|4|0|3] — wind-fighting 2nd shot.',
        finisherCallout: '★ WIND WINNER: 175g Star Sync ("Sync is the one to do in the wind for sure!").'
      };
    }
    if (holeNumber === 4) {
      return {
        primary: byId('innova-halo-wraith') || byId('innova-sugar-star-roadrunner') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: '★ VERIFIED #1 TEE DRIVER (296 FT): Cotton Candy Halo Wraith [11|5|-1|3] or Star Roadrunner to the 150ft landing zone.',
        secondaryCallout: '★ 150-FT APPROACH MAGIC: Proto Glow Mako3 [5|5|0|0] — site of your legendary 150-ft Mako3 throw-in Birdie 2!',
        finisherCallout: '175g Star Sync — smooth straight approach & tap-in Par.'
      };
    }
    if (holeNumber === 5) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-kc-pro-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ VERIFIED #1 HOLE PICK (296 FT): Cotton Candy Star Roadrunner [9|5|-4|1] — proven 2-foot skip-to-pin line past baseball backstop!',
        secondaryCallout: 'Proto Glow Mako3 or Pink DX Alien — pinpoint placement past the fence.',
        finisherCallout: '175g Star Sync — confident approach around the backstop.'
      };
    }
    if (holeNumber === 6) {
      return {
        primary: byId('innova-halo-destroyer') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ VERIFIED DRIVER PICK (310 FT): Cotton Candy Halo Destroyer [12|5|-1|3] or 170g DX Archangel across bus loop.',
        secondaryCallout: '★ FAIRWAY LASER: Cotton Candy Star Rollo [5|6|-4|1] — straight high-glide fairway option!',
        finisherCallout: '175g Star Sync or Proto Glow Aviar — uphill green approach.'
      };
    }
    if (holeNumber === 7) {
      return {
        primary: byId('innova-glow-teebird') || byId('innova-halo-wraith') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-dx-alien'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ YARDAGE DRIVER PICK (324 FT): Cotton Candy Glow Teebird [7|5|0|2] or Halo Wraith low past middle guardian trees!',
        secondaryCallout: 'Cotton Candy Star Rollo or Proto Glow Mako3 — smooth 2nd-shot placement.',
        finisherCallout: '★ LOW-CEILING PAR SAVER: 175g Star Sync or Pink DX Alien low under the tree branch!'
      };
    }
    if (holeNumber === 8) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ VERIFIED #1 HOLE PICK (235 FT): Cotton Candy Star Roadrunner [9|5|-4|1] or Glow Leopard3 — big glide right between the two trees!',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] — dead-straight midrange option.',
        finisherCallout: '175g Star Sync or Proto Glow Aviar — straight approach through the two trees.'
      };
    }
    if (holeNumber === 9) {
      return {
        primary: byId('innova-hot-pink-archangel') || byId('innova-halo-destroyer') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-xt-glow-nova'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ VERIFIED #1 DRIVER PICK (389 FT): 170g DX Archangel [8|6|-4|1] ("stayed straight!") or Halo Destroyer along the south tree line!',
        secondaryCallout: '★ 2ND-SHOT MVP: Proto Glow Mako3 [5|5|0|0] — parks right by the uphill pin!',
        finisherCallout: '★ UPHILL PIN PARKER: 175g Star Sync or XT Glow Nova uphill approach!'
      };
    }
  }

  // Course-Proven Hole Overrides for Black Hoof Park 9-Hole — Cotton Candy + Sync / Archangel / Alien!
  if (
    (normCourse === 'blackhoof' ||
      (normCourse.includes('black hoof') &&
        !normCourse.includes('championship') &&
        !normCourse.includes('18'))) &&
    holeNumber
  ) {
    if (holeNumber === 1) {
      return {
        primary: byId('innova-hot-pink-archangel') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-kc-pro-aviar') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ VERIFIED #1 HOLE PICK (191 FT): 170g DX Archangel or Glow Leopard3 — smooth meadow hyzer-flip (11/01 Par 3!).',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] — dead-straight 191ft left-center laser.',
        finisherCallout: '175g KC Pro Aviar (11/01 parked right under pin!) or 175g Star Sync.'
      };
    }
    if (holeNumber === 2) {
      return {
        primary: byId('innova-hot-pink-archangel') || byId('innova-glow-teebird') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-sugar-glow-roc'),
        finisher: byId('innova-kc-pro-aviar') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ PERSONAL FLIGHT MATCH (204 FT): 170g DX Archangel [8|6|-4|1] or Glow Teebird across the uphill meadow.',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] — straight wind-resistant mid.',
        finisherCallout: '175g KC Pro Aviar (11/01 nearly birdied uphill approach!) or 175g Star Sync.'
      };
    }
    if (holeNumber === 3) {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: '★ #1 DISTANCE MATCH (225 FT): Cotton Candy Star Roadrunner [9|5|-4|1] or 170g DX Archangel across the northern meadow!',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] — straight fairway option.',
        finisherCallout: '175g Star Sync or Proto Glow Aviar — smooth C1 chains.'
      };
    }
    if (holeNumber === 4) {
      return {
        primary: byId('innova-champion-eagle') || byId('innova-glow-teebird') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-dx-alien'),
        finisher: byId('innova-kc-pro-aviar') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: '175g Champion Eagle [7|4|-1|3] or Glow Teebird — controlled hyzer safely left of Monticello Rd.',
        secondaryCallout: '★ LAYOUT MATCH (146 FT): Cotton Candy DX Glow Roc [4|4|0|3] — fades naturally left away from the road!',
        finisherCallout: '175g KC Pro Aviar or 178g Pink DX Alien — reliable approach & putt.'
      };
    }
    if (holeNumber === 5) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: 'Glow Leopard3 [7|5|-2|1] — 65% touch wooded tunnel shot.',
        secondaryCallout: '★ WOODED RIGHT-TURN PICK (151 FT): Cotton Candy Star Rollo [5|6|-4|1] — 11/01 Par 3 turning right into the woods!',
        finisherCallout: '★ APPROACH PICK: 175g XT Glow Nova (11/01 stuck approach & putt!) or 175g Star Sync.'
      };
    }
    if (holeNumber === 6) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-sugar-star-roadrunner') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-sugar-star-rollo'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: 'Glow Leopard3 [7|5|-2|1] — gentle right-drifting hyzer-flip.',
        secondaryCallout: '★ S-CURVE MATCH (167 FT): Cotton Candy Proto Glow Mako3 or Star Rollo along the southern tree line!',
        finisherCallout: '175g XT Glow Nova or Star Sync — straight approach & C1 putt.'
      };
    }
    if (holeNumber === 7) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
        finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: 'Glow Leopard3 [7|5|-2|1] — touch woods placement.',
        secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] — zero-fade 142ft wooded gap shot (11/01 Par 3!).',
        finisherCallout: '★ TOP TEE PICK (142 FT): 175g Star Sync [3|3|0|1] or Proto Glow Aviar into the wooded pocket.'
      };
    }
    if (holeNumber === 8) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-champion-eagle') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: '★ VERIFIED TEE PICK (212 FT): Cotton Candy Glow Leopard3 or 175g Champion Eagle along the woods edge.',
        secondaryCallout: 'Cotton Candy Star Rollo [5|6|-4|1] — stays safely right of the left-side trees!',
        finisherCallout: '175g XT Glow Nova — stops cleanly in breeze.'
      };
    }
    if (holeNumber === 9) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-sugar-star-roadrunner') || null,
        secondary: byId('innova-proto-glow-mako3') || byId('innova-sugar-glow-roc'),
        finisher: byId('innova-xt-glow-nova') || byId('innova-halloween-sync'),
        synergyAlt: byId('discraft-cicada'),
        shotCallout: 'Glow Leopard3 [7|5|-2|1] — 90° flat swing closer.',
        secondaryCallout: '★ CLOSER PICK (167 FT): Proto Glow Mako3 or DX Glow Roc back toward the parking lot.',
        finisherCallout: '175g XT Glow Nova (11/01 tomahawk over guardian tree!) or 175g Star Sync.'
      };
    }
  }

  // Course-Proven Hole Overrides for The Art Nine @ SMP — Cotton Candy + Sync / Alien!
  if ((normCourse === 'artnine' || normCourse.includes('art nine')) && holeNumber) {
    if (holeNumber === 1) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-xt-glow-nova'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: 'Glow Leopard3 [7|5|-2|1] — 50% touch shot if throwing a fairway.',
        secondaryCallout: '★ VERIFIED #1 HOLE PICK (132 FT): Cotton Candy DX Glow Roc [4|4|0|3] — dead-straight tunnel opener (11/17 Par 3)!',
        finisherCallout: '★ THROWING PUTTER: 175g Star Sync [3|3|0|1] — straight down the chute & C1 birdie putter!'
      };
    }
    if (holeNumber === 3 || holeNumber === 4 || holeNumber === 5 || holeNumber === 8) {
      return {
        primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher:
          holeNumber === 8
            ? byId('innova-kc-pro-aviar') || byId('innova-halloween-sync')
            : byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: 'Glow Leopard3 [7|5|-2|1] — standstill touch option.',
        secondaryCallout:
          holeNumber === 3
            ? '★ VERIFIED #1 HOLE PICK: Cotton Candy Star Rollo [5|6|-4|1] — dead-on line to the pin (Double Birdie 2 hole!).'
            : holeNumber === 5
            ? '★ VERIFIED #1 HOLE PICK: Cotton Candy Star Rollo or DX Glow Roc — thread right between the two trees!'
            : '★ VERIFIED WOODS SHAPER: Cotton Candy Star Rollo or Proto Glow Mako3 down the wooded hallway.',
        finisherCallout:
          holeNumber === 8
            ? '★ 11/17 TEE PICK: 175g KC Pro Aviar off the tee straight into C1 (or 175g Star Sync)!'
            : '★ VERIFIED APPROACH / PUTTER: 175g Star Sync [3|3|0|1] or 175g KC Pro Aviar!'
      };
    }
    return {
      primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
      secondary:
        holeNumber === 9
          ? byId('innova-sugar-glow-roc') || byId('innova-proto-glow-mako3')
          : byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
      finisher:
        holeNumber === 6 || holeNumber === 2
          ? byId('innova-dx-alien') || byId('innova-proto-glow-aviar')
          : byId('innova-proto-glow-aviar') || byId('innova-halloween-sync'),
      synergyAlt: byId('discraft-roach'),
      shotCallout: 'Glow Leopard3 [7|5|-2|1] — 50% standstill touch shot under low ceiling.',
      secondaryCallout:
        holeNumber === 6
          ? '★ VERIFIED #1 HOLE PICK: Proto Glow Mako3 [5|5|0|0] (2× Birdie!) or 178g Pink DX Alien (11/17 Birdie 2!).'
          : holeNumber === 9
          ? '★ VERIFIED #1 HOLE PICK: Cotton Candy DX Glow Roc [4|4|0|3] (11/17 walk-off downhill Birdie 2 for Even Par!) or Proto Glow Mako3!'
          : '★ STRAIGHT WOODS LASER: Proto Glow Mako3 [5|5|0|0] — zero-turn, zero-fade down the tight chute.',
      finisherCallout:
        holeNumber === 6
          ? '★ 11/17 BIRDIE PICK: 178g Pink DX Alien [4|2|0|1] + 175g KC Pro Aviar!'
          : '★ #1 SHORT-HOLE PUTTER: Proto Glow Aviar [2|3|0|1], Yeti Pro Aviar, or 175g Star Sync!'
    };
  }

  // Generic Yardage Tier 1: Short Holes (< 185 ft) — 17-Disc Cotton Candy + Sync / Archangel / Alien!
  if (distanceFeet < 185) {
    if (scenario === 'headwind' || scenario === 'cross_rl') {
      return {
        primary: byId('innova-champion-eagle') || byId('innova-luster-firebird') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-dx-alien'),
        finisher: byId('innova-kc-pro-aviar') || byId('innova-halloween-sync'),
        synergyAlt: byId('innova-halloween-sync'),
        shotCallout: '175g Champion Eagle [7|4|-1|3] or Luster Firebird [9|3|0|4] — wind-fighting low skip line.',
        secondaryCallout: 'Cotton Candy DX Glow Roc [4|4|0|3] — low hyzer midrange punch with dependable left finish.',
        finisherCallout:
          '★ TOP WIND PICK (<185 FT): 175g KC Pro Aviar [2|3|0|2], Yeti Pro Aviar, or 178g Pink DX Alien — holds firm in headwinds!'
      };
    }
    if (scenario === 'tailwind') {
      return {
        primary: byId('innova-hot-pink-archangel') || byId('innova-glow-leopard3') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-roach'),
        shotCallout: '170g DX Archangel [8|6|-4|1] or Glow Leopard3 — easy 60% tailwind glide.',
        secondaryCallout: 'Cotton Candy Star Rollo [5|6|-4|1] — effortless right-turning midrange glide.',
        finisherCallout:
          '★ TOP TEE PICK (<185 FT): 175g Star Sync [3|3|0|1] or Proto Glow Aviar — straight throwing putter right to chains!'
      };
    }
    return {
      primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
      secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
      finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
      synergyAlt: byId('discraft-roach'),
      shotCallout: 'Cotton Candy Glow Leopard3 [7|5|-2|1] or 170g DX Archangel — controlled 65% fairway glide.',
      secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] & Pink DX Alien [4|2|0|1] — dead-straight laser & low-skip touch.',
      finisherCallout:
        '★ TOP TEE PICK (<185 FT): 175g Star Sync [3|3|0|1] or Proto Glow Aviar — dead-straight throwing putter down the pipe!'
    };
  }

  // Generic Yardage Tier 2: Midrange / Short Fairway Holes (185 to 239 ft) — Cotton Candy + Core 3!
  if (distanceFeet < 240) {
    if (scenario === 'headwind' || scenario === 'cross_rl') {
      return {
        primary: byId('innova-champion-eagle') || byId('innova-glow-teebird') || null,
        secondary: byId('innova-sugar-glow-roc') || byId('innova-dx-alien'),
        finisher: byId('innova-kc-pro-aviar') || byId('innova-yeti-pro-aviar'),
        synergyAlt: byId('innova-luster-firebird'),
        shotCallout: '★ WIND DRIVER (185–239 FT): 175g Champion Eagle [7|4|-1|3] or Glow Teebird [7|5|0|2] — slices wind with crisp fade.',
        secondaryCallout: '★ TOP MID PICK: Cotton Candy DX Glow Roc [4|4|0|3] — handles headwinds & R→L gusts with reliable left finish.',
        finisherCallout: '175g KC Pro Aviar [2|3|0|2] or Yeti Pro Aviar — firm wind-fighting putter & approach.'
      };
    }
    if (scenario === 'tailwind') {
      return {
        primary: byId('innova-sugar-star-roadrunner') || byId('innova-hot-pink-archangel') || null,
        secondary: byId('innova-sugar-star-rollo') || byId('innova-proto-glow-mako3'),
        finisher: byId('innova-halloween-sync') || byId('innova-proto-glow-aviar'),
        synergyAlt: byId('discraft-buzzz-ss'),
        shotCallout: '★ DRIVER OPTION (185–239 FT): Cotton Candy Star Roadrunner [9|5|-4|1] or 170g DX Archangel [8|6|-4|1] — effortless high-glide S-curve!',
        secondaryCallout: '★ TOP MID PICK: Cotton Candy Star Rollo [5|6|-4|1] — effortless right-turning pan, uphill closer, or roller.',
        finisherCallout: '175g Star Sync or XT Glow Nova — straight approach & C1 putt.'
      };
    }
    return {
      primary: byId('innova-glow-leopard3') || byId('innova-hot-pink-archangel') || null,
      secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
      finisher: byId('innova-halloween-sync') || byId('innova-xt-glow-nova'),
      synergyAlt: byId('discraft-buzzz-ss'),
      shotCallout: '★ DRIVER PICK (185–239 FT): Cotton Candy Glow Leopard3 [7|5|-2|1], Glow Teebird [7|5|0|2], or 170g DX Archangel!',
      secondaryCallout: '★ TOP MID PICK: Proto Glow Mako3 [5|5|0|0] & Pink DX Alien [4|2|0|1] — laser-straight down wooded hallways.',
      finisherCallout: '175g Star Sync & 175g XT Glow Nova — dead-straight approach & zero-roll stopper.'
    };
  }

  // Generic Yardage Tier 3: Fairway & Distance Driver Holes (240+ ft) — Cotton Candy + Core 3!
  if (distanceFeet >= 295) {
    return {
      primary: byId('innova-halo-destroyer') || byId('innova-halo-wraith') || null,
      secondary: byId('innova-proto-glow-mako3') || byId('innova-dx-alien'),
      finisher: byId('innova-halloween-sync') || byId('innova-xt-glow-nova'),
      synergyAlt: byId('discraft-cicada'),
      shotCallout:
        '★ TOP BOMBER PICK (295+ FT): Cotton Candy Halo Destroyer [12|5|-1|3] or Halo Wraith [11|5|-1|3] — flagship max-distance & low-ceiling power!',
      secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] or Pink DX Alien [4|2|0|1] — laser-straight 2nd shot.',
      finisherCallout: '175g Star Sync or XT Glow Nova — dead-straight approach & C1 putt.'
    };
  }

  return {
    primary: byId('innova-sugar-star-roadrunner') || byId('innova-glow-teebird') || byId('innova-hot-pink-archangel') || null,
    secondary: byId('innova-proto-glow-mako3') || byId('innova-sugar-glow-roc'),
    finisher: byId('innova-halloween-sync') || byId('innova-xt-glow-nova'),
    synergyAlt: byId('discraft-cicada'),
    shotCallout:
      '★ TOP DRIVER PICK (240–295 FT): Cotton Candy Star Roadrunner [9|5|-4|1], Glow Teebird [7|5|0|2], or 170g DX Archangel [8|6|-4|1]!',
    secondaryCallout: 'Proto Glow Mako3 [5|5|0|0] or DX Glow Roc [4|4|0|3] — workhorse 2nd shot.',
    finisherCallout: '175g Star Sync or 175g XT Glow Nova — pinpoint approach & C1 chains.'
  };
}

export interface CourseSatelliteLayoutInfo {
  courseKey: string;
  courseName: string;
  imageUrl: string;
  udiscParRating: number;
  difficultyLabel: string;
  totalFeet: number;
  overviewNote: string;
  holeGeometry: Record<
    number,
    {
      direction: string;
      hazards: string;
      personalFlightMatch: string;
    }
  >;
}

export const COURSE_SATELLITE_LAYOUTS: Record<string, CourseSatelliteLayoutInfo> = {
  sarko: {
    courseKey: 'sarko',
    courseName: 'Sar-Ko-Par Trails',
    imageUrl: './assets/course_maps/udisc_sarko.jpg',
    udiscParRating: 123,
    difficultyLabel: 'Very Short · Technical Park & Woods',
    totalFeet: 1377,
    overviewNote:
      'Plays between Indian Trails Pool (west), basketball/tennis courts (north), and the southern wooded grove.',
    holeGeometry: {
      1: {
        direction: '138 ft South (Tee below basketball court → Pin A)',
        hazards: 'Walking path crosses fairway; dense tree line on right.',
        personalFlightMatch:
          '175g Star Sync off the tee — 3 straight Birdie 2s across 11/04 & both 11/05 rounds parked right under the pin!'
      },
      2: {
        direction: '204 ft Northeast (Pin 1 → Pin B near tennis courts)',
        hazards: 'Thick snake woods border the ENTIRE left side of the fairway!',
        personalFlightMatch:
          '170g Halo Star IT (11/05 R1 flew exact card flight path to 1ft deep/5ft right!) or 176g Glow Mako3 (11/03 Birdie 2 & 11/04 Par 3) aimed slightly right!'
      },
      3: {
        direction: '162 ft Southeast (South of blue tennis courts → Pin B)',
        hazards: 'Curving walking path on right; guardian canopy near pin.',
        personalFlightMatch:
          '170g Halo Star IT [7|6|-2|1] — 11/05 R1 parked within 1 FOOT of the pin for a tap-in Birdie 2 ("IT is working for me, man!") + XT Glow Nova approach stopper.'
      },
      4: {
        direction: '163 ft Southeast (Into SE wooded corner → Pin B)',
        hazards: 'Tight wooded gap with low ceiling & guardian trees.',
        personalFlightMatch:
          '174g DX Roc3 ("heavy tea kettle" grip — 11/05 R2 Birdie 2, 11/03 5ft Birdie 2 & 10/30 Pin Hit!) or 180g Classic Glow Roc (11/05 R1 Par 3 debut!).'
      },
      5: {
        direction: '142 ft Southwest (SE corner → Pin B along south woods)',
        hazards: 'Center guardian tree in a narrow wooded corridor.',
        personalFlightMatch:
          '174g DX Roc3 (11/05 R2 Birdie 2 — swung wide right of the center tree and curved left to 15ft!) or 176g Glow Mako3 straight left-gap laser.'
      },
      6: {
        direction: '136 ft North (South woods → Pin A)',
        hazards: 'Trees left toward pond; guardian tree in front of basket.',
        personalFlightMatch:
          '176g Glow Mako3 (11/05 R2 parked 2 FEET under the pin for Birdie 2!) or 170g DX Archangel (11/04 & 10/29 Birdie 2s to 14–15ft!).'
      },
      7: {
        direction: '127 ft Southwest (Near Pin 3 → Center Pin A)',
        hazards: 'Very low hanging tree branch guarding the direct air line.',
        personalFlightMatch:
          '170g DX Archangel (11/05 R2 parked 3ft under pin with 90° chest-high elbow + "tea-kettle" wrist!) or 168g GStar Roadrunner (11/05 R1 & 11/04 parked under pin!).'
      },
      8: {
        direction: '174 ft Southwest (Center fairway → Southern wooded Pin B)',
        hazards: 'Narrows into a wooded pocket with pond behind/left.',
        personalFlightMatch:
          '170g DX Archangel (11/05 R2 Birdie 2 — upright 90° release to 20ft!), 170g Halo Star IT (11/05 R1 skip-and-roll to 15ft & 11/04 Birdie!), or DX Roc3 (11/04 high hyzer Birdie!).'
      },
      9: {
        direction: '131 ft North (SW corner → Pin A beside pool building)',
        hazards: 'Woods on right, pool fence on left, slight uphill finish.',
        personalFlightMatch:
          '172g Star Rollo with firm uphill zip — 11/05 R2 Birdie 2 closer (sealed 21 / -6 PB & 6-hole birdie streak!) + 5× career H9 Birdies!'
      }
    }
  },
  mize: {
    courseKey: 'mize',
    courseName: 'Mize Elementary',
    imageUrl: './assets/course_maps/udisc_mize.jpg',
    udiscParRating: 169,
    difficultyLabel: 'Mid-Length · Open Field & Tree-Line Perimeter',
    totalFeet: 2625,
    overviewNote:
      'Wraps counter-clockwise around Mize Elementary School: East field (H1–H4), North baseball diamond & bus loop (H5–H6), West Mize Rd lawn (H7–H8), and South driveway hill (H9).',
    holeGeometry: {
      1: {
        direction: '218 ft Southeast (Sidewalk corner → SE woodline pin)',
        hazards: 'No concrete tee pad; woods behind basket.',
        personalFlightMatch:
          '170g Halo Star IT won your 10/23 3-driver field test here (lowest tilt, farthest glide); use Star Sync at 80% on approach so you don\'t overshoot.'
      },
      2: {
        direction: '264 ft NNE (Along eastern woods edge)',
        hazards: 'Thick eastern woods along the entire right side.',
        personalFlightMatch:
          '176g Glow Mako3 (#1 straight distance mid, +10–15 ft on left-center line) stays safely left of the right-side woods + Star Sync approach.'
      },
      3: {
        direction: '294 ft Northwest (Eastern woods → Sidewalk pin)',
        hazards: 'Wide open cross-field shot; skying the disc robs 40+ ft.',
        personalFlightMatch:
          'Swing arm flat at a 90° chest angle with Firebird / Halo IT + 174g DX Roc3 2nd shot to eliminate right-side-up tilt!'
      },
      4: {
        direction: '296 ft Northeast (Sidewalk → NE woods corner)',
        hazards: 'Woods behind and right of the pin.',
        personalFlightMatch:
          'Halo Star IT tee shot + 176g Glow Mako3 from 150 ft (site of your legendary 150-ft throw-in Birdie 2!).'
      },
      5: {
        direction: '296 ft West (NE corner → Past baseball diamond backstop)',
        hazards: 'Baseball infield & tall chain-link backstop fence near pin.',
        personalFlightMatch:
          'Keep 170g Halo Star IT flat off the tee so it holds its true S-curve; approach with Star Sync around the fence.'
      },
      6: {
        direction: '310 ft West (North of school building across bus loop)',
        hazards: 'Small outbuilding, bus loop pavement, and low tree canopy on 2nd shot.',
        personalFlightMatch:
          '172g Star Rollo off the tee (#1 field-test distance!) + low standstill 152g Star Mamba under the tree + Star Sync uphill approach (won\'t fade left like Aviar).'
      },
      7: {
        direction: '324 ft SSW (Down western lawn parallel to Mize Rd)',
        hazards: 'Middle guardian trees & low hanging branch near green.',
        personalFlightMatch:
          'Aim 170g Halo Star IT at the middle trees with a low release + keep 175g Star Sync low under the branch for Par 3.'
      },
      8: {
        direction: '235 ft Southeast (SW lawn → Pin between two trees near parking lot)',
        hazards: 'Two guardian trees framing the green; parking lot left.',
        personalFlightMatch:
          '152g Star Mamba (#1 driver distance in field test) counters your natural tilt for a huge straight drive + Star Aviar through the center of the 2 trees!'
      },
      9: {
        direction: '389 ft East (Along south driveway & tree line → Uphill NE pin)',
        hazards: 'Paved school road on left (scuffs discs!), parked vehicles, and steep uphill finish.',
        personalFlightMatch:
          '170g Halo Star IT aimed left of the tree line + 152g Star Mamba 2nd shot + 175g Star Sync uphill 3rd shot parked to 4–8 ft!'
      }
    }
  },
  harmon: {
    courseKey: 'harmon',
    courseName: 'Harmon Park',
    imageUrl: './assets/course_maps/udisc_harmon.jpg',
    udiscParRating: 151,
    difficultyLabel: 'Short · Elevation, Water Tower & Mature Oaks',
    totalFeet: 2143,
    overviewNote:
      'Loops from the south oak hill (H1–H4) up the eastern boundary (H5–H6), past Harmon Park Playground (H7–H8), and finishes at the iconic white water tower (H9).',
    holeGeometry: {
      1: {
        direction: '292 ft East (South of paved path)',
        hazards: 'Low oak canopy up a gradual hill.',
        personalFlightMatch:
          '170g Halo Star IT kept low (90° chest swing) + Glow Mako3 + Star Sync.'
      },
      2: {
        direction: '320 ft WNW (Back toward Delmar St)',
        hazards: 'Long open fairway with park path on right.',
        personalFlightMatch:
          '152g Star Mamba (#1 driver distance) + 172g Star Rollo 2nd shot curving right-to-left.'
      },
      3: {
        direction: '215 ft East (Along southern park edge)',
        hazards: 'Sloped green where putters can glide past.',
        personalFlightMatch:
          '170g Halo Star IT or DX Roc3 tee shot + 175g XT Pig approach so it drops and stops!'
      },
      4: {
        direction: '282 ft ENE (To far SE corner pin)',
        hazards: 'Thick ivy/woods along the right boundary.',
        personalFlightMatch:
          '170g Halo Star IT aimed left of the ivy + 176g Glow Mako3 straight laser recovery.'
      },
      5: {
        direction: '247 ft North (Up the eastern boundary)',
        hazards: 'Buildings/parking lot right; mature trees guarding green.',
        personalFlightMatch:
          '170g Halo Star IT tee shot + 174g DX Roc3 left-fade approach right to the pin.'
      },
      6: {
        direction: '230 ft North (To NE corner elevated/sloped green)',
        hazards: 'Steeply sloped green prone to roll-aways.',
        personalFlightMatch:
          '176g Glow Mako3 straight tee drive + 175g Galactic XT Pig ("Going with the Pig, because it stops!").'
      },
      7: {
        direction: '168 ft SSW (From north pin toward Harmon Playground)',
        hazards: 'Playground right-ahead; open downhill roller lane.',
        personalFlightMatch:
          '172g Star Rollo S-curve or roller right to the pin (10/21 Double Birdie 2 hole!).'
      },
      8: {
        direction: '346 ft Southwest (Longest hole — doglegs SW past playground)',
        hazards: 'Playground on right; mature trees pinching the middle.',
        personalFlightMatch:
          '172g Star Rollo / 152g Star Mamba off the tee + 176g Glow Mako3 through the tree gap.'
      },
      9: {
        direction: '196 ft West (Finishing at the base of the white water tower)',
        hazards: 'Guardian tree in center fairway; water tower enclosure behind.',
        personalFlightMatch:
          '170g Halo Star IT or 174g DX Roc3 shaping around the guardian tree + Star Sync putt.'
      }
    }
  },
  blackhoof: {
    courseKey: 'blackhoof',
    courseName: 'Black Hoof Park',
    imageUrl: './assets/course_maps/udisc_blackhoof.jpg',
    udiscParRating: 146,
    difficultyLabel: 'Short · Open Meadow (H1–H4) & Wooded Creek (H5–H9)',
    totalFeet: 1712,
    overviewNote:
      'Family-friendly 9-hole loop between the eastern parking lot, Monticello Rd on the west (H1–H4 meadow), and the southern wooded trail (H5–H9).',
    holeGeometry: {
      1: {
        direction: '191 ft West (From parking lot path into open meadow)',
        hazards: 'Guardian trees behind pin.',
        personalFlightMatch:
          '170g Halo Star IT (parked to 10ft on 10/20 for Birdie 2!) or 176g Glow Mako3.'
      },
      2: {
        direction: '204 ft Northeast (Across open grass toward north lot)',
        hazards: 'Exposed to Kansas crosswinds.',
        personalFlightMatch:
          '152g Star Mamba or 170g Halo Star IT uses your natural hyzer tilt to glide 204 ft.'
      },
      3: {
        direction: '225 ft WSW (Northern meadow toward Monticello Rd)',
        hazards: 'Trees lining right and left.',
        personalFlightMatch:
          '152g Star Mamba (#1 field-test driver distance) or 176g Glow Mako3.'
      },
      4: {
        direction: '146 ft Southeast (Parallel to Monticello Rd on right)',
        hazards: 'Monticello Rd on right; tree cluster near pin.',
        personalFlightMatch:
          '174g DX Roc3 or 175g XT Pig fades naturally left away from the road!'
      },
      5: {
        direction: '151 ft South (Across paved path into southern woods)',
        hazards: 'Narrow wooded entrance gap.',
        personalFlightMatch:
          '176g Glow Mako3 or 175g Star Sync (80% power) pipes the straight tunnel.'
      },
      6: {
        direction: '167 ft ENE (Along southern wooded edge)',
        hazards: 'Heavy woods on right; path on left.',
        personalFlightMatch:
          '172g Star Rollo tiny S-curve (#1 Mize field-test shot) or Glow Mako3.'
      },
      7: {
        direction: '142 ft South (From path into deep wooded pocket)',
        hazards: 'Tight wooded tunnel.',
        personalFlightMatch:
          '175g Star Sync or 175g Star Aviar (index finger off rim for dead-straight flight).'
      },
      8: {
        direction: '212 ft ENE (Along southern forest line)',
        hazards: 'Dense trees bordering the left fairway.',
        personalFlightMatch:
          '172g Star Rollo or 170g Halo Star IT stays right of the left-side trees.'
      },
      9: {
        direction: '167 ft Northwest (Back across lawn toward parking lot)',
        hazards: 'Walking path & trees guarding left side of green.',
        personalFlightMatch:
          '174g DX Roc3 or 176g Glow Mako3 for a clean Par/Birdie finish.'
      }
    }
  },
  artnine: {
    courseKey: 'artnine',
    courseName: 'The Art Nine',
    imageUrl: './assets/course_maps/udisc_artnine.jpg',
    udiscParRating: 119,
    difficultyLabel: 'Very Short · Dense Shawnee Mission Forest Tunnels',
    totalFeet: 1031,
    overviewNote:
      'Ultra-short, heavily wooded 9-hole technical loop (87–145 ft) inside Shawnee Mission Park where straight putters (Aviar, Sync) and Mako3/Rollo rule.',
    holeGeometry: {
      1: {
        direction: '145 ft SSW (Wooded chute)',
        hazards: 'Tight forest corridor on both sides.',
        personalFlightMatch:
          '175g Star Sync (80% power) or 176g Glow Mako3 dead-straight down the chute.'
      },
      2: {
        direction: '96 ft Southwest (Short wooded ace run)',
        hazards: 'Guardian trunks framing the basket.',
        personalFlightMatch:
          '175g Star Aviar with index finger tucked off the rim (flew dead straight in your 10/23 field test!).'
      },
      3: {
        direction: '99 ft ESE (Southern woods)',
        hazards: 'Low canopy & tight gap.',
        personalFlightMatch: '175g Star Aviar or 175g Galactic XT Pig.'
      },
      4: {
        direction: '136 ft East (Straight wooded tunnel)',
        hazards: 'Narrow tree-lined hallway.',
        personalFlightMatch: '175g Star Sync or 176g Glow Mako3.'
      },
      5: {
        direction: '112 ft WNW (Center woods)',
        hazards: 'Slight elevation & trees.',
        personalFlightMatch: '175g Star Sync (won\'t fade left uphill) or Star Aviar.'
      },
      6: {
        direction: '112 ft East (Center clearing)',
        hazards: 'Trees pinching the right/left.',
        personalFlightMatch: '175g Star Sync or 172g Star Rollo touch shot.'
      },
      7: {
        direction: '87 ft SSE (Shortest hole on course)',
        hazards: 'Pocket green surrounded by trees.',
        personalFlightMatch: '175g Star Aviar or 175g XT Pig bullseye run.'
      },
      8: {
        direction: '115 ft NNW (Eastern tree corridor)',
        hazards: 'Narrow wooded lane.',
        personalFlightMatch: '175g Star Sync or 175g Star Aviar.'
      },
      9: {
        direction: '131 ft Northwest (Closing tunnel toward H1)',
        hazards: 'Longer wooded corridor.',
        personalFlightMatch: '176g Glow Mako3 or 175g Star Sync.'
      }
    }
  },
  blackhoof_18: {
    courseKey: 'blackhoof_18',
    courseName: 'Black Hoof Championship (White to White)',
    imageUrl: './assets/aistudio/image_bdc10b31.png',
    udiscParRating: 171,
    difficultyLabel: 'Short · White to White · 18 Holes · Par 54 · Global Avg +2 (56)',
    totalFeet: 4219,
    overviewNote:
      'Black Hoof Driven by Henderson Engineers (White to White layout): 18 holes, Par 54, 4,219 ft total (most holes between 183 ft and 310 ft).',
    holeGeometry: {
      1: {
        direction: '183 ft · Par 3 (White to White)',
        hazards: 'Wooded opening corridor.',
        personalFlightMatch: '176g Glow Mako3 or 175g Star Sync straight down the pipe.'
      },
      2: {
        direction: '250 ft · Par 3 (White to White)',
        hazards: 'Fairway placement.',
        personalFlightMatch: '170g Halo Star IT or 166g GStar Leopard3.'
      },
      3: {
        direction: '206 ft · Par 3 (White to White)',
        hazards: 'Wooded gap.',
        personalFlightMatch: '176g Glow Mako3 or 170g Halo Star IT.'
      },
      4: {
        direction: '197 ft · Par 3 (White to White)',
        hazards: 'Technical line.',
        personalFlightMatch: '176g Glow Mako3 or 174g DX Roc3.'
      },
      5: {
        direction: '315 ft · Par 3 (White to White)',
        hazards: 'Longer fairway stretch.',
        personalFlightMatch: '152g Star Mamba or 169g GStar Roadrunner.'
      },
      6: {
        direction: '310 ft · Par 3 (White to White)',
        hazards: 'Full fairway drive.',
        personalFlightMatch: '152g Star Mamba or 170g Halo Star IT.'
      },
      7: {
        direction: '382 ft · Par 3 (White to White · Longest Hole)',
        hazards: 'Longest hole on White-to-White layout.',
        personalFlightMatch: '152g Star Mamba max-glide drive + midrange/putter approach.'
      },
      8: {
        direction: '236 ft · Par 3 (White to White)',
        hazards: 'Midrange / short fairway gap.',
        personalFlightMatch: '170g Halo Star IT or 176g Glow Mako3.'
      },
      9: {
        direction: '206 ft · Par 3 (White to White)',
        hazards: 'Front 9 closer.',
        personalFlightMatch: '176g Glow Mako3 or 174g DX Roc3.'
      },
      10: {
        direction: '294 ft · Par 3 (White to White)',
        hazards: 'Back 9 starter.',
        personalFlightMatch: '152g Star Mamba or 170g Halo Star IT.'
      },
      11: {
        direction: '221 ft · Par 3 (White to White)',
        hazards: 'Wooded fairway.',
        personalFlightMatch: '176g Glow Mako3 or 172g Star Rollo.'
      },
      12: {
        direction: '252 ft · Par 3 (White to White)',
        hazards: 'Fairway drive.',
        personalFlightMatch: '170g Halo Star IT or 166g DX Archangel.'
      },
      13: {
        direction: '105 ft · Par 3 (White to White · Shortest Hole)',
        hazards: 'Short technical pocket green.',
        personalFlightMatch: '175g Star Sync or 175g KC Pro Aviar ace run.'
      },
      14: {
        direction: '185 ft · Par 3 (White to White)',
        hazards: 'Wooded tunnel.',
        personalFlightMatch: '176g Glow Mako3 or 175g Star Sync.'
      },
      15: {
        direction: '237 ft · Par 3 (White to White)',
        hazards: 'Controlled fairway.',
        personalFlightMatch: '170g Halo Star IT or 176g Glow Mako3.'
      },
      16: {
        direction: '260 ft · Par 3 (White to White)',
        hazards: 'Fairway stretch.',
        personalFlightMatch: '170g Halo Star IT or 152g Star Mamba.'
      },
      17: {
        direction: '201 ft · Par 3 (White to White)',
        hazards: 'Penultimate wooded gap.',
        personalFlightMatch: '176g Glow Mako3 or 174g DX Roc3.'
      },
      18: {
        direction: '178 ft · Par 3 (White to White)',
        hazards: '18th hole closer.',
        personalFlightMatch: '175g Star Sync or 176g Glow Mako3 birdie look.'
      }
    }
  },
  smp_wooded: {
    courseKey: 'smp_wooded',
    courseName: 'Shawnee Mission Wooded',
    imageUrl: '',
    udiscParRating: 175,
    difficultyLabel: 'Mid-Length · Technical Forest Tunnels & Elevation · 18 Holes · Par 54',
    totalFeet: 4881,
    overviewNote:
      'Shawnee Mission Park’s 18-hole wooded course (4,881 ft, Par 54): blends tight oak/hickory tunnels, scenic elevation drops (H10, H13), uphill climbs (H12, H15, H16), and long low-ceiling bombers (H7, H9, H11, H18).',
    holeGeometry: {
      1: {
        direction: '260 ft Slight Left (Water near right tee area)',
        hazards: 'Pond/water right near tee; framed tree corridor.',
        personalFlightMatch: '168g GStar Roadrunner kept flat off tee + DX Roc3 / XT Glow Nova approach.'
      },
      2: {
        direction: '177 ft Straight Wooded Tunnel',
        hazards: 'Early guardian trunks 10–15 ft ahead of tee.',
        personalFlightMatch: '176g Glow Mako3 dead-level down the center chute.'
      },
      3: {
        direction: '187 ft Tight Wooded Corridor',
        hazards: 'Dense trees lining both sides + guardian tree ~30 ft from pin.',
        personalFlightMatch: '170g DX Archangel upright chest-high release (11/10 Par 3 ★!).'
      },
      4: {
        direction: '305 ft Straight-to-Slight-Right Chute (Near Renner Rd)',
        hazards: 'Initial tee gap + wooded hallway needing slight right drift.',
        personalFlightMatch: '176g Glow Mako3 off tee + 172g Star Rollo right-turning 2nd shot.'
      },
      5: {
        direction: '208 ft Dogleg Right Wooded Pocket',
        hazards: 'Guardian trunks pinching left; basket tucked right.',
        personalFlightMatch: '172g Star Rollo right-turn tee + 175g Star Sync laser (11/10 parked 3ft for Par 3 ★!).'
      },
      6: {
        direction: '187 ft Wooded Corridor to Left Clearing',
        hazards: 'Framed timber tunnel opening near green.',
        personalFlightMatch: '170g Halo Star IT placement + 175g Star Sync putt (11/10 Par 3 ★!).'
      },
      7: {
        direction: '355 ft Low-Ceiling Slight-Left Fairway',
        hazards: 'Low canopy ceiling & thick rough along sides.',
        personalFlightMatch: '171g Classic Glow Wraith flat low drive ("Excellent, flat, good job Wraith!") + Sync.'
      },
      8: {
        direction: '302 ft Open Fairway Finishing Left',
        hazards: 'Wide open start narrowing left toward guarded green.',
        personalFlightMatch: 'Aim wide right with Roadrunner / Wraith + 175g Star Sync ("All-Star!") approach.'
      },
      9: {
        direction: '375 ft Long Wooded S-Curve (Deep Blue Pin)',
        hazards: 'Low ceiling off tee + long winding wooded approach to blue basket.',
        personalFlightMatch: '171g Classic Glow Wraith low flat tee shot + Mako3 / Rollo placement.'
      },
      10: {
        direction: '248 ft Downhill Dogleg Left',
        hazards: 'Early guardian tree off tee + downhill slope behind pin.',
        personalFlightMatch: '174g DX Roc3 hyzer around early tree + float 175g XT Glow Nova downhill to pin.'
      },
      11: {
        direction: '444 ft Monster S-Curve Par 3 (Longest Hole)',
        hazards: 'Initial wooded chute opening into a 444 ft fairway.',
        personalFlightMatch: 'Roadrunner / Mako3 straight out of the chute + 180g Star Jay approach.'
      },
      12: {
        direction: '223 ft Uphill Slight-Right Fairway',
        hazards: 'Steady uphill grade robbing low-glide discs.',
        personalFlightMatch: '172g Star Rollo with level tea-kettle wrist right up to the pin (11/10 Par 3 ★!).'
      },
      13: {
        direction: '277 ft Scenic Downhill Straight Shot',
        hazards: 'Open breeze near green lifting high putts.',
        personalFlightMatch: '176g Glow Mako3 dead-flat laser the whole way ("Straight, beauty, perfect!").'
      },
      14: {
        direction: '243 ft Dogleg Left Wooded Lane',
        hazards: 'Wooded bend finishing left to guarded pin.',
        personalFlightMatch: '170g DX Archangel into the left lane + parked approach (11/10 Par 3 ★!).'
      },
      15: {
        direction: '189 ft Straight Wooded Hallway to Uphill Green',
        hazards: 'Narrow timber corridor + scary uphill putt.',
        personalFlightMatch: '180g Star Jay glide loop to 10ft right + KC Pro Aviar (11/10 Par 3 ★!).'
      },
      16: {
        direction: '338 ft Long Uphill Wooded Stretch',
        hazards: 'Overhanging branches off tee & thick rough on steep climb.',
        personalFlightMatch: 'Keep Roadrunner nose-down off tee + 172g Star Rollo uphill skip shot.'
      },
      17: {
        direction: '214 ft Wind-Exposed Slight-Left Fairway',
        hazards: 'Headwind exposure lifting nose-up tee shots.',
        personalFlightMatch: 'Keep tee shot low + 180g Star Jay pinpoint approach (11/10 Par 3 ★!).'
      },
      18: {
        direction: '347 ft Dogleg Right Closing Par 3',
        hazards: 'Guardian tree in fairway + rough short of finishing basket.',
        personalFlightMatch: '172g Star Rollo curved right around tree + Pink DX Alien parked under pin (11/10 Par 3 ★!).'
      }
    }
  },
  prairie_pass: {
    courseKey: 'prairie_pass',
    courseName: 'Blue Valley "Prairie Pass" DG Course',
    imageUrl: '',
    udiscParRating: 160,
    difficultyLabel: 'Standard Layout · 18 Holes · Par 54 · Global Avg E (54) · "18-Hole Sar-Ko-Par!"',
    totalFeet: 4209,
    overviewNote:
      'Park in Pleasant Ridge Middle School lot (Overland Park, KS · Est. 2010 · 4.0★ / 2,117 ratings). Concrete tees, Black Hole Portal baskets, moderate hills, open prairie & dense wooded holes (with 2 hanging tires in the woods!). Site of Jeffery’s 65 (+11) & Jack’s 71 (+17) Double All-Time 18-Hole PBs on 2026-11-15!',
    holeGeometry: {
      1: {
        direction: '216 ft Standard Opener (Steep hill & OB left · Center guardian tree)',
        hazards: 'Steep drop-off & OB left; uphill comebacker if past pin.',
        personalFlightMatch:
          'Keep Leopard3, Teebird, or Rollo straight down center away from the left drop.'
      },
      2: {
        direction: '218 ft Short Pin (vs. 282 ft Advanced Pin)',
        hazards: 'Trees pinching left; Short vs. Long basket split.',
        personalFlightMatch:
          '172g Star Rollo right of left-side trouble + parked approach under pin (11/15 Par 3 ★!).'
      },
      3: {
        direction: '232 ft Straight Downhill Roll-Away Green',
        hazards: 'Sloped downhill green behind basket.',
        personalFlightMatch:
          '192 ft Glow Mako3 drive + soft KC Pro Aviar/Nova approach (11/15 Double Par 3s w/ Jack’s 15 ft putt!).'
      },
      4: {
        direction: '236 ft Straight Tree-Framed Corridor',
        hazards: 'Trees framing both sides of fairway.',
        personalFlightMatch:
          '169g GStar Roadrunner ~200 ft low "straight box-cutter line" + C1 putt (11/15 Double Par 3s ★!).'
      },
      5: {
        direction: '270 ft Longest Front-9 Stretch',
        hazards: 'Dense tree line along right side.',
        personalFlightMatch:
          'Keep Roadrunner or Teebird nose-down off tee to stay clear of right-side trees.'
      },
      6: {
        direction: '215 ft Park Lane (Storm Gutter Hazard Left)',
        hazards: 'Early left tree + storm drain gutter 1 ft from green edge!',
        personalFlightMatch:
          'DX Roc3 / Glow Roc high enough to clear the left tree and check safely clear of the drain.'
      },
      7: {
        direction: '195 ft Dense Woods Chute (Hanging Tire #1)',
        hazards: 'Tight scary timber gap with hanging tire landmark.',
        personalFlightMatch:
          'Commit to dead-level Glow Mako3 or Star Sync straight down the center chute.'
      },
      8: {
        direction: '202 ft Slight-Left Low-Canopy Pin',
        hazards: 'Guardian tree & low ceiling guarding Circle 1.',
        personalFlightMatch:
          '170g DX Archangel parked pin-high 10 ft left ("Like an angel! Permanent keep in the bag!" · 11/15 Par 3 ★!).'
      },
      9: {
        direction: '195 ft Wooded Gap Near Night-Golf Lights',
        hazards: 'Early guardian trunks 50 ft off tee.',
        personalFlightMatch:
          'Glow Mako3 dead-straight through the 50-ft gap for a clean Front-9 closer.'
      },
      10: {
        direction: '235 ft Downhill Back-9 Opener',
        hazards: 'Fast downhill roll-away behind basket.',
        personalFlightMatch:
          '"10 out of 10" 172g Star Rollo glide drive + clutch 15-ft comebacker (11/15 Par 3 ★!).'
      },
      11: {
        direction: '252 ft Woods Wrap to Elevated Thorn Mound',
        hazards: 'Raised mound basket surrounded by thorny brush.',
        personalFlightMatch:
          'Star Rollo right-turning tee + 175g XT Glow Nova dead-stop right on top of the mound!'
      },
      12: {
        direction: '193 ft Shortest Hole — Straight Woods Tunnel',
        hazards: 'Wooded branches framing entire 193-ft corridor.',
        personalFlightMatch:
          '170g DX Archangel or Glow Mako3 threaded straight through the woods (11/15 Par 3 ★!).'
      },
      13: {
        direction: '298 ft Longest Hole on Standard Layout',
        hazards: 'Full prairie carry; thick bushes behind basket.',
        personalFlightMatch:
          'Roadrunner / Wraith chest-high pull + ~150 ft 178g Pink DX Alien laser approach!'
      },
      14: {
        direction: '197 ft Woods Pocket (Hanging Tire #2 & Thorns)',
        hazards: 'Low wooded ceiling + thorny rough.',
        personalFlightMatch:
          'Halo Star IT / Mako3 kept nose-down + C1 putt (11/15 Double Par 3s ★ → Tee 15 RPS tiebreaker!).'
      },
      15: {
        direction: '242 ft Open Slight-Left Fairway',
        hazards: 'Afternoon sun in eyes; sloped green prone to rolls.',
        personalFlightMatch:
          'Roadrunner / Teebird skip-hop + hyzer approach that checks up near pin.'
      },
      16: {
        direction: '270 ft Steep Downhill Danger Pin',
        hazards: 'Scary steep downhill slope right behind basket!',
        personalFlightMatch:
          '168g Classic Glow Wraith straight bomb + 175g XT Glow Nova stop-and-drop on slope (11/15 Par 3 ★!).'
      },
      17: {
        direction: '282 ft Long Straight Prairie Fairway',
        hazards: '2nd-longest hole; low western sun on approach.',
        personalFlightMatch:
          'Roadrunner / Wraith flat drive + level Pink DX Alien approach.'
      },
      18: {
        direction: '260 ft Guardian-Tree Closer (Back to Hole 1)',
        hazards: 'Guardian tree in fairway + fast roll-away green.',
        personalFlightMatch:
          'Halo Star IT / Teebird around tree + XT Glow Nova approach to seal the round!'
      }
    }
  },
  prairie_center: {
    courseKey: 'prairie_center',
    courseName: 'Prairie Center Park',
    imageUrl: '',
    udiscParRating: 181,
    difficultyLabel: 'Mid-to-Long Park · 18 Holes · Par 55 · 5,808 ft · Signature 604ft Par 4 Water Hole',
    totalFeet: 5808,
    overviewNote:
      'Sprawling 18-hole Olathe park layout (5,808 ft, Par 55) mixing mature tree-framed fairways, a 517-ft dogleg-left H12, and a signature 604-ft Par 4 water hole on H13. Jeffery shot 77 (+22) & Jack 86 (+31) on 2026-11-08.',
    holeGeometry: {}
  },
  cedarridge: {
    courseKey: 'cedarridge',
    courseName: 'Cedar Ridge',
    imageUrl: '',
    udiscParRating: 186,
    difficultyLabel: 'Heavy Championship Woods · 18 Holes · Par 58 · 5,344 ft · Four Par-4 Monsters',
    totalFeet: 5344,
    overviewNote:
      'Rugged, heavily wooded 18-hole test at Wyandotte County Lake / Bonner Springs (Par 58, 5,344 ft) featuring narrow timber tunnels, swamp bridge H4, steep ravines, and a 613-ft Par 4 H16.',
    holeGeometry: {}
  },
  california_trail: {
    courseKey: 'california_trail',
    courseName: 'California Trail MS',
    imageUrl: '',
    udiscParRating: 168,
    difficultyLabel: 'Open School Hills & Par 4 Closers · 9 Holes · Par 29 · 3,043 ft',
    totalFeet: 3043,
    overviewNote:
      'Long 9-hole school campus loop in Olathe, KS (Par 29, 3,043 ft) featuring sand volleyball H1, downhill-to-uphill soccer vistas, and back-to-back Par 4 finishers (467 ft H8 & 532 ft H9 — site of Jack’s 47-ft putt!).',
    holeGeometry: {}
  },
  wyandotte: {
    courseKey: 'wyandotte',
    courseName: 'Wyandotte County Park',
    imageUrl: '',
    udiscParRating: 198,
    difficultyLabel: 'Championship Bomber Park · 18 Holes · Par 63 · 8,296 ft · Veteran Baskets',
    totalFeet: 8296,
    overviewNote:
      'Massive 8,296-ft championship-scale course in Bonner Springs, KS (Par 63) with sprawling multi-shot Par 4s, rolling hills, and Dynamic Discs Veteran targets.',
    holeGeometry: {}
  },
  wolfden: {
    courseKey: 'wolfden',
    courseName: 'Wolf Den @ Mission Trail',
    imageUrl: '',
    udiscParRating: 174,
    difficultyLabel: 'Wooded Creek & Meadow · 18 Holes · Par 54 · 5,011 ft',
    totalFeet: 5011,
    overviewNote:
      'Scenic 18-hole Leawood layout (5,011 ft, Par 54) winding along Tomahawk Creek trails and wooded pockets behind Mission Trail Elementary.',
    holeGeometry: {}
  },
  heritage_park: {
    courseKey: 'heritage_park',
    courseName: 'Heritage Park',
    imageUrl: '',
    udiscParRating: 188,
    difficultyLabel: 'Championship Tournament Course · 18 Holes · Olathe, KS',
    totalFeet: 6150,
    overviewNote:
      'Premier Johnson County tournament course in Olathe, KS blending open bomber prairie grass fairways with technical creek-side woods.',
    holeGeometry: {}
  }
};

export function getCourseHoleLayoutIntel(
  courseNameOrKey: string,
  holeNumber?: number
): {
  layout: CourseSatelliteLayoutInfo | null;
  holeIntel: { direction: string; hazards: string; personalFlightMatch: string } | null;
} {
  const norm = (courseNameOrKey || '').toLowerCase();
  let key = '';
  if (norm === 'smp_wooded' || norm.includes('shawnee mission wooded')) key = 'smp_wooded';
  else if (
    norm === 'prairie_pass' ||
    norm.includes('prairie pass') ||
    norm.includes('blue valley') ||
    norm.includes('pleasant ridge')
  ) {
    key = 'prairie_pass';
  } else if (norm === 'prairie_center' || norm.includes('prairie center')) {
    key = 'prairie_center';
  } else if (norm === 'cedar_ridge' || norm === 'cedarridge' || norm.includes('cedar ridge')) {
    key = 'cedarridge';
  } else if (norm === 'california_trail' || norm.includes('california trail')) {
    key = 'california_trail';
  } else if (norm === 'wyandotte' || norm.includes('wyandotte')) {
    key = 'wyandotte';
  } else if (norm === 'wolfden' || norm.includes('wolf den')) {
    key = 'wolfden';
  } else if (norm === 'heritage_park' || norm.includes('heritage')) {
    key = 'heritage_park';
  } else if (norm.includes('sar') || norm === 'sarko') key = 'sarko';
  else if (norm.includes('mize')) key = 'mize';
  else if (norm.includes('harmon')) key = 'harmon';
  else if (
    norm === 'blackhoof_18' ||
    ((norm.includes('black') || norm.includes('hoof')) &&
      (norm.includes('championship') || norm.includes('18') || norm.includes('white')))
  ) {
    key = 'blackhoof_18';
  } else if (norm.includes('black') || norm.includes('hoof')) key = 'blackhoof';
  else if (norm.includes('art')) key = 'artnine';

  const layout = key ? COURSE_SATELLITE_LAYOUTS[key] || null : null;
  const holeIntel =
    layout && holeNumber && layout.holeGeometry[holeNumber]
      ? layout.holeGeometry[holeNumber]
      : null;
  return { layout, holeIntel };
}

export type HoleFairwayShape =
  | 'straight'
  | 'tunnel'
  | 'slight_left'
  | 'dogleg_left'
  | 'slight_right'
  | 'dogleg_right'
  | 's_curve';

export type HoleElevationProfile = 'flat' | 'uphill' | 'downhill';
export type HoleCorridorType = 'tight_woods' | 'park' | 'open';

export interface HoleVisualOutlineSpec {
  shape: HoleFairwayShape;
  shapeLabel: string;
  elevation: HoleElevationProfile;
  elevationLabel: string;
  corridor: HoleCorridorType;
  corridorLabel: string;
  hasGuardianTree: boolean;
  treesSide?: 'both' | 'left' | 'right' | 'none';
  walkingPath?: 'cross' | 'left' | 'right' | null;
  waterHazard?: 'left' | 'right' | 'behind' | 'short' | null;
  obHazard?: 'left' | 'right' | 'behind' | null;
  udiscMapUrl?: string | null;
  pinNote: string;
  flightLineTip: string;
}

const SHAPE_LABELS: Record<HoleFairwayShape, string> = {
  straight: '↑ Straight Fairway',
  tunnel: '║ Tight Tunnel',
  slight_left: '↖ Slight Left',
  dogleg_left: '↰ Dogleg Left',
  slight_right: '↗ Slight Right',
  dogleg_right: '↱ Dogleg Right',
  s_curve: '∿ S-Curve Lane'
};

const ELEVATION_LABELS: Record<HoleElevationProfile, string> = {
  flat: '📐 Flat Grade',
  uphill: '⛰️ Uphill Play',
  downhill: '📉 Downhill Float'
};

const CORRIDOR_LABELS: Record<HoleCorridorType, string> = {
  tight_woods: '🌲 Tight Woods',
  park: '🌳 Framed Park',
  open: '☀️ Open Fairway'
};

type CompactOutlineOverride = {
  s: HoleFairwayShape;
  e: HoleElevationProfile;
  c: HoleCorridorType;
  g?: boolean;
  ts?: 'both' | 'left' | 'right' | 'none';
  p?: 'cross' | 'left' | 'right';
  w?: 'left' | 'right' | 'behind' | 'short';
  ob?: 'left' | 'right' | 'behind';
  pin: string;
  tip: string;
};

const CURATED_HOLE_OUTLINES: Record<string, Record<number, CompactOutlineOverride>> = {
  smp_wooded: {
    1: { s: 'slight_left', e: 'flat', c: 'park', g: true, w: 'right', pin: 'Water right near tee · Framed slight-left green', tip: 'Keep Roadrunner or Eagle flat down center; avoid nose-up stall.' },
    2: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: 'Mando logs against trees 15 ft out · Dead-straight pin', tip: 'Skip Star Sync or Glow Mako3 level straight through the gap (11/17 Par ★).' },
    3: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: 'Narrow forest chute · Late guardian tree ~30 ft out', tip: 'Roadrunner (<5ft kick 11/17!) or upright 90° Archangel right to C1.' },
    4: { s: 'slight_right', e: 'flat', c: 'tight_woods', ob: 'left', pin: '305 ft corridor parallel to Renner Rd · Drifts right', tip: 'Roadrunner/Mako3 through initial gap + Star Rollo / Nova approach.' },
    5: { s: 'dogleg_right', e: 'flat', c: 'tight_woods', g: true, pin: 'Pin tucked right past guardian trees · ★ 11/17 Birdie 2!', tip: '172g Star Rollo glides right under the basket for tap-in Birdie!' },
    6: { s: 'straight', e: 'flat', c: 'tight_woods', pin: '187 ft wooded lane opening on left ~40 ft short', tip: 'Halo Star IT smooth placement + Star Sync putt (Par ★).' },
    7: { s: 'slight_left', e: 'flat', c: 'tight_woods', pin: '355 ft low-ceiling wooded fairway to White Pin', tip: 'Classic Glow Wraith driven low & flat + committed Mako3/Alien approach.' },
    8: { s: 'dogleg_left', e: 'flat', c: 'park', pin: '302 ft open tee narrowing left to guarded basket', tip: 'Wraith straight 150+ ft drive + commit firmly on 2nd shot (don\'t baby it!).' },
    9: { s: 's_curve', e: 'downhill', c: 'tight_woods', g: true, pin: '375 ft trek (Shorter Tee Pad Available · Blue Pin Only!)', tip: 'Play short tee w/ Classic Glow Wraith 180+ ft + XT Glow Nova to chains.' },
    10: { s: 'dogleg_left', e: 'downhill', c: 'tight_woods', g: true, pin: '248 ft downhill left bend (Blue Pin Only — No White Basket!)', tip: 'Release on time past right trees w/ Roc + float XT Glow Nova downhill.' },
    11: { s: 's_curve', e: 'flat', c: 'park', g: true, pin: '444 ft monster Par 3: wooded exit into windy open fairway', tip: 'Keep nose down out of trees, then rip Mako3 + Star Jay into C1.' },
    12: { s: 'slight_right', e: 'uphill', c: 'tight_woods', ob: 'left', pin: '223 ft uphill climb · Street OB left! · ★ 2× Par Lock', tip: 'Avoid street left—throw Star Rollo uphill + XT Glow Nova stop (Par ★).' },
    13: { s: 'straight', e: 'downhill', c: 'park', pin: '277 ft scenic downhill laser straight at white pin', tip: 'Throw Glow Mako3 chest-high & flat (don\'t throw 2ft worm-burners!).' },
    14: { s: 'dogleg_left', e: 'flat', c: 'tight_woods', pin: '243 ft wooded corridor bending left to guarded pin', tip: 'Champion Eagle left lane + XT Glow Nova approach to C1.' },
    15: { s: 'tunnel', e: 'uphill', c: 'tight_woods', g: true, pin: '189 ft straight wooded chute · ★ 2× Par Lock (11/10 & 11/17)', tip: '175g Star Sync dead-straight to 20ft (11/17) or Star Jay glide loop!' },
    16: { s: 'slight_right', e: 'uphill', c: 'tight_woods', g: true, pin: '338 ft steep uphill climb · Low branches & thick rough', tip: 'Aim 172g Star Rollo at center tree + uphill Rollo climb right to 5ft!' },
    17: { s: 'slight_left', e: 'flat', c: 'park', pin: '214 ft framed fairway exposed to headwinds', tip: 'Keep tee low in breeze + low-glide Alien/Nova (Sync rolls in wind).' },
    18: { s: 'dogleg_right', e: 'flat', c: 'park', g: true, pin: '347 ft closer bending right around guardian tree', tip: 'Classic Glow Wraith straight bomb (or Rollo right) + Pink DX Alien!' }
  },
  // Verified hole-for-hole directly from UDisc Sar-Ko-Par satellite layout (udisc_sarko.jpg)
  sarko: {
    1: { s: 'straight', e: 'flat', c: 'park', ts: 'left', p: 'cross', pin: '138 ft South (below basketball court → Pin A across path)', tip: '175g Star Sync dead-straight at 80%; aim chains-low in headwind.' },
    2: { s: 'straight', e: 'flat', c: 'open', ts: 'left', pin: '192 ft NE · Thick woods wall on ENTIRE left, open grass right!', tip: 'Aim Halo Star IT or Glow Mako3 down right-center grass away from left woods.' },
    3: { s: 'straight', e: 'flat', c: 'park', g: true, ob: 'left', p: 'right', pin: '162 ft SE · Tennis courts left, curving path right → Pin B', tip: 'Flat straight Halo Star IT or Roadrunner ace-run right to Pin B.' },
    4: { s: 'slight_left', e: 'flat', c: 'tight_woods', g: true, pin: '162 ft SE into wooded corner · Right-to-left hyzer pocket', tip: 'Swing Classic Glow Roc or DX Roc3 wide right into Circle 1.' },
    5: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '144 ft WSW wooded chute · Center guardian tree split', tip: 'Skip Classic Glow Roc / DX Roc3 low or thread DX Archangel straight.' },
    6: { s: 'straight', e: 'flat', c: 'tight_woods', g: true, pin: '165 ft NNE out of southern woods → Pin A behind guardian tree', tip: 'Glow Mako3, DX Roc3, or DX Archangel low and straight into C1.' },
    7: { s: 'slight_left', e: 'flat', c: 'park', g: true, pin: '139 ft SW · Low-hanging branch guarding raised mound Pin A', tip: '90° chest-high Halo Star IT or DX Archangel low under the branch.' },
    8: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '171 ft SW · Park tee narrowing into southern wooded pocket Pin B', tip: 'Roadrunner or DX Archangel kept low under branches into the pocket.' },
    9: { s: 'slight_right', e: 'uphill', c: 'park', ts: 'right', ob: 'left', pin: '141 ft NNE uphill · Pool fence left, woods right, roll-away green', tip: 'Firm Star Rollo up the hill; settle putts softly to avoid roll-aways!' }
  },
  // Verified from UDisc Art Nine satellite layout (udisc_artnine.jpg)
  artnine: {
    1: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '145 ft SSW narrow forest chute opener', tip: 'DX Roc3 or Star Sync 80% straight down the tunnel.' },
    2: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '96 ft SW short wooded ace run framed by trunks', tip: 'Halo Star IT 50% touch or KC Pro Aviar straight at chains.' },
    3: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '99 ft ESE low-canopy wooded gap', tip: 'Star Rollo or Star Sync smooth touch shot.' },
    4: { s: 'tunnel', e: 'flat', c: 'tight_woods', pin: '136 ft East straight tree-lined hallway', tip: 'Star Rollo / Glow Mako3 dead-straight down the gut.' },
    5: { s: 'slight_right', e: 'uphill', c: 'tight_woods', g: true, pin: '112 ft WNW slight uphill split between trees', tip: 'Star Rollo or DX Roc3 clean gap shot.' },
    6: { s: 'straight', e: 'uphill', c: 'tight_woods', pin: '112 ft East uphill wooded corridor', tip: 'Glow Mako3 dead-straight uphill laser (back-to-back Birdies!).' },
    7: { s: 'straight', e: 'flat', c: 'tight_woods', g: true, pin: '87 ft SSE shortest pocket green in trees', tip: 'Star Sync or Pink DX Alien bullseye run.' },
    8: { s: 'tunnel', e: 'flat', c: 'tight_woods', pin: '115 ft NNW eastern wooded lane', tip: 'Star Rollo or Glow Mako3 smooth corridor float.' },
    9: { s: 'tunnel', e: 'downhill', c: 'tight_woods', g: true, pin: '131 ft NW downhill closing forest chute', tip: 'Glow Mako3 controlled downhill gap shot.' }
  },
  // Verified from UDisc Mize Elementary satellite layout (udisc_mize.jpg)
  mize: {
    1: { s: 'straight', e: 'flat', c: 'open', ts: 'right', pin: '218 ft SE from sidewalk corner to SE woodline pin', tip: 'Halo Star IT or Roadrunner smooth open drive + Sync approach.' },
    2: { s: 'straight', e: 'flat', c: 'open', ts: 'right', pin: '264 ft NNE · Thick eastern woods wall along entire right!', tip: 'Glow Mako3 or Roadrunner aimed down left-center grass away from right woods.' },
    3: { s: 'straight', e: 'flat', c: 'open', ts: 'none', pin: '294 ft NW wide-open cross-field bomber to sidewalk pin', tip: 'Keep Mamba or Halo IT flat at 90° chest height for max glide.' },
    4: { s: 'straight', e: 'flat', c: 'open', ts: 'right', pin: '296 ft NE across field to NE woods corner pin', tip: 'Mamba / Halo IT drive + Glow Mako3 approach (150ft throw-in hole!).' },
    5: { s: 'straight', e: 'flat', c: 'park', ts: 'right', ob: 'left', pin: '296 ft West · Woods right, baseball diamond & backstop left', tip: 'GStar Roadrunner flat skip line past the baseball fence.' },
    6: { s: 'straight', e: 'uphill', c: 'park', g: true, p: 'cross', pin: '310 ft West across school bus loop & small outbuilding', tip: 'Star Rollo / Mamba tee + low shot under canopy + Sync uphill.' },
    7: { s: 'straight', e: 'flat', c: 'park', g: true, ob: 'right', pin: '324 ft SSW parallel to Mize Rd · Middle guardian trees', tip: 'Halo Star IT low past middle trees + Star Sync under low branch.' },
    8: { s: 'straight', e: 'flat', c: 'park', g: true, ob: 'left', pin: '235 ft SE · Parking lot left, pin framed between two trees', tip: 'Star Mamba straight drive + putter split between the two trees.' },
    9: { s: 'slight_left', e: 'uphill', c: 'park', ts: 'right', ob: 'left', pin: '389 ft East · Paved driveway left, woods right → Uphill finish', tip: 'Halo IT / Archangel along driveway grass + Star Sync uphill approach.' }
  },
  // Verified from UDisc Harmon Park satellite layout (udisc_harmon.jpg)
  harmon: {
    1: { s: 'straight', e: 'uphill', c: 'park', p: 'left', pin: '292 ft East up gradual hill under mature oaks', tip: 'Halo Star IT kept low under oak canopy + Glow Mako3.' },
    2: { s: 'straight', e: 'flat', c: 'open', p: 'right', pin: '320 ft WNW back toward Delmar St · Path on right', tip: 'Star Mamba max-glide drive + Star Rollo 2nd shot.' },
    3: { s: 'slight_right', e: 'flat', c: 'park', ts: 'right', pin: '215 ft East along southern border · Fast sloped green', tip: 'Halo Star IT tee + low-glide Toro / Alien / Nova stopper.' },
    4: { s: 'straight', e: 'flat', c: 'park', ts: 'right', pin: '282 ft ENE to SE corner · Thick ivy/woods along right', tip: 'DX Archangel or Halo IT aimed left of right-side ivy.' },
    5: { s: 'straight', e: 'flat', c: 'park', g: true, ob: 'right', pin: '247 ft North · Building/lot right, guardian trees at green', tip: 'Roadrunner / Halo IT tee + DX Roc3 left-fade approach.' },
    6: { s: 'straight', e: 'uphill', c: 'park', pin: '230 ft North to steep roll-away green in NE corner', tip: 'Star Jay / Mako3 tee + XT Glow Nova / Alien to stop on hill.' },
    7: { s: 'slight_right', e: 'downhill', c: 'park', pin: '168 ft SSW downhill toward Harmon Playground', tip: 'Star Rollo S-curve or roller right to pin (Double Birdie hole!).' },
    8: { s: 'dogleg_left', e: 'flat', c: 'park', g: true, pin: '346 ft SW longest hole bending past playground & center trees', tip: 'Roadrunner / Mamba tee + Glow Mako3 through center gap.' },
    9: { s: 'straight', e: 'flat', c: 'park', g: true, pin: '196 ft West finishing at base of white water tower', tip: 'Star Jay or DX Roc3 around center guardian tree.' }
  },
  // Verified from UDisc Black Hoof 9-Hole satellite layout (udisc_blackhoof.jpg)
  blackhoof: {
    1: { s: 'straight', e: 'flat', c: 'open', g: true, pin: '191 ft West from parking path into open meadow', tip: 'DX Archangel or Halo Star IT smooth meadow hyzer-flip.' },
    2: { s: 'straight', e: 'flat', c: 'open', pin: '204 ft NE across open grass toward north lot', tip: 'DX Archangel or Star Mamba using natural glide across meadow.' },
    3: { s: 'straight', e: 'flat', c: 'open', pin: '225 ft WSW across north meadow toward Monticello Rd', tip: 'Roadrunner or DX Archangel flat drive.' },
    4: { s: 'slight_left', e: 'flat', c: 'park', ts: 'left', ob: 'right', pin: '146 ft SE · Monticello Rd right, tree cluster near pin', tip: 'DX Roc3 or Star Toro fading safely left away from road.' },
    5: { s: 'tunnel', e: 'flat', c: 'tight_woods', p: 'cross', pin: '151 ft South across paved path into tight wooded gap', tip: 'Star Rollo or Glow Mako3 straight through the entrance gap.' },
    6: { s: 'slight_right', e: 'flat', c: 'park', ts: 'right', p: 'left', pin: '167 ft ENE emerging along southern tree line to path pin', tip: 'Glow Mako3 or Star Rollo gentle right-drifting line.' },
    7: { s: 'tunnel', e: 'flat', c: 'tight_woods', p: 'cross', pin: '142 ft South across path into deep southern wooded pocket', tip: 'Glow Mako3 or Star Sync 80% straight down the chute.' },
    8: { s: 'straight', e: 'flat', c: 'park', ts: 'right', p: 'left', pin: '185 ft ENE · Woods right, paved trail left', tip: 'Halo Star IT controlled fairway shot along the tree edge.' },
    9: { s: 'straight', e: 'flat', c: 'open', p: 'left', pin: '167 ft NW open lawn closer back toward parking lot', tip: 'Glow Mako3, DX Roc3, or XT Glow Nova right to chains.' }
  },
  prairie_pass: {
    1: { s: 'straight', e: 'uphill', c: 'park', g: true, ob: 'left', pin: '216 ft Standard opener · Steep hill & OB left', tip: 'Aim straight down center; avoid uphill comebackers.' },
    2: { s: 'slight_right', e: 'flat', c: 'park', pin: '218 ft Short Pin (vs 282ft Adv) · ★ 11/15 Par Lock', tip: 'Star Rollo right of left trouble + parked approach under pin!' },
    3: { s: 'straight', e: 'downhill', c: 'park', pin: '232 ft straight to downhill roll-away green · ★ 11/15 Double Par', tip: '192ft Mako3/Leopard3 drive + soft KC Pro Aviar so it doesn\'t roll.' },
    4: { s: 'straight', e: 'flat', c: 'park', g: true, pin: '236 ft straight tree-framed lane · ★ 11/15 Double Par', tip: '200ft "straight box-cutter line" Roadrunner drive + C1 putt!' },
    5: { s: 's_curve', e: 'flat', c: 'park', ts: 'right', pin: '270 ft long Front-9 stretch · Trees bordering right', tip: 'Keep Roadrunner/Teebird nose-down off tee to clear right trees.' },
    6: { s: 'slight_left', e: 'flat', c: 'park', w: 'left', pin: '215 ft park lane · Storm drain gutter hazard left', tip: 'Keep Roc/Teebird high enough to clear left tree & storm gutter.' },
    7: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '195 ft dense scary woods w/ hanging tire #1', tip: 'Commit to dead-level Mako3 or Sync straight down center chute.' },
    8: { s: 'slight_left', e: 'flat', c: 'park', g: true, pin: '202 ft around tree to low-canopy pin · ★ 11/15 Archangel Gem', tip: '170g DX Archangel parked pin-high 10ft left ("Like an angel!")!' },
    9: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '195 ft straight woods chute near night-game lights', tip: 'Thread Mako3 cleanly past the 50ft early guardian trunks.' },
    10: { s: 'straight', e: 'downhill', c: 'open', pin: '235 ft slight downhill Back-9 opener · ★ 11/15 Par Lock', tip: '"10 out of 10" Rollo glide drive; careful of 15ft downhill roll-away!' },
    11: { s: 'dogleg_right', e: 'uphill', c: 'tight_woods', g: true, pin: '252 ft woods wrap to elevated mound pin w/ thorns', tip: 'Rollo right wrap + XT Glow Nova stop-and-drop on top of mound!' },
    12: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '193 ft shortest hole straight through woods · ★ 11/15 Par Lock', tip: 'Thread Archangel or Mako3 straight through the wooded branches!' },
    13: { s: 'straight', e: 'flat', c: 'open', pin: '298 ft longest hole on Standard Layout · Bushes behind pin', tip: 'Roadrunner/Wraith chest-high pull + 150ft DX Alien straight laser.' },
    14: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '197 ft woods pocket w/ hanging tire #2 & thorns · ★ 11/15 Double Par', tip: 'Keep tee shot nose-down through trees + confident C1 putt.' },
    15: { s: 'slight_left', e: 'flat', c: 'open', pin: '242 ft open fairway · Pin tucked left in afternoon sun', tip: 'Roadrunner/Teebird skip-hop + hyzer approach that checks instead of rolling.' },
    16: { s: 'straight', e: 'downhill', c: 'open', pin: '270 ft steep downhill danger pin · ★ 11/15 Par Lock', tip: 'Wraith straight bomb + XT Glow Nova stop-and-drop on scary slope!' },
    17: { s: 'straight', e: 'flat', c: 'open', pin: '282 ft 2nd longest hole · Straight open prairie lane', tip: 'Roadrunner/Wraith flat drive + keep approach level into low sun.' },
    18: { s: 'slight_left', e: 'uphill', c: 'park', g: true, pin: '260 ft guardian-tree closer back toward Hole 1', tip: 'Shape around guardian tree + XT Glow Nova approach so it doesn\'t roll long.' }
  },
  prairie_center: {
    1: { s: 'straight', e: 'flat', c: 'park', pin: '273 ft tree-framed park opener', tip: 'GStar Roadrunner flat down center + KC Pro Aviar.' },
    2: { s: 'slight_left', e: 'flat', c: 'park', g: true, ob: 'left', pin: '269 ft framed fairway · OB line left', tip: 'Roadrunner / Classic Glow Roc keeping safely inside left OB.' },
    3: { s: 'straight', e: 'flat', c: 'park', g: true, pin: '265 ft mature trees guarding approach', tip: 'Level Glow Mako3 off tee + confident approach.' },
    4: { s: 'dogleg_right', e: 'uphill', c: 'park', pin: '314 ft uphill basket tucked to the right', tip: 'Halo Star IT tee + upward-angled Star Sync approach.' },
    5: { s: 'straight', e: 'flat', c: 'open', pin: '254 ft open fairway · Skip-friendly green', tip: 'Roadrunner drive + low Star Sync skip to Circle 1.' },
    6: { s: 'slight_left', e: 'flat', c: 'park', ob: 'right', pin: '353 ft park stretch · Walking path nearby', tip: 'Roadrunner tee + Star Jay aimed slightly right of pin.' },
    7: { s: 's_curve', e: 'flat', c: 'park', g: true, pin: '365 ft tree-framed fairway · Low-ceiling green', tip: 'Roadrunner tee + level Mako3 + low DX Alien punch under branches.' },
    8: { s: 'straight', e: 'flat', c: 'park', g: true, pin: '301 ft low limbs off tee · Open C1 green', tip: 'Roadrunner low drive + DX Alien / Sync approach.' },
    9: { s: 'tunnel', e: 'flat', c: 'park', g: true, pin: '332 ft center guardian tree window off tee', tip: 'Thread Roadrunner through gap + Classic Glow Roc 2nd shot.' },
    10: { s: 'slight_right', e: 'flat', c: 'tight_woods', g: true, pin: '226 ft low-branch wooded pocket', tip: '75% touch Star Rollo or Mako3 + DX Alien low scramble.' },
    11: { s: 'straight', e: 'downhill', c: 'open', pin: '213 ft open downhill shot from hilltop tee', tip: 'Chest-high Halo Star IT; keep downhill approach level so it glides.' },
    12: { s: 'dogleg_left', e: 'flat', c: 'park', g: true, ob: 'left', pin: '517 ft monster dogleg-left · Trees guarding OB left', tip: 'Classic Glow Wraith big hyzer + Glow Mako3 through tree gaps.' },
    13: { s: 's_curve', e: 'flat', c: 'park', w: 'right', pin: '604 ft Par 4 signature water hole', tip: 'Two controlled Roadrunner / Halo IT placements keeping dry of water.' },
    14: { s: 'slight_left', e: 'flat', c: 'open', pin: '355 ft long park Par 3', tip: 'Star Mamba or Roadrunner max-glide fairway drive.' },
    15: { s: 'straight', e: 'flat', c: 'park', pin: '319 ft framed fairway stretch', tip: 'Roadrunner / Mamba flat pull + Sync upshot.' },
    16: { s: 'straight', e: 'flat', c: 'park', pin: '235 ft birdie/par scoring hole', tip: 'Halo Star IT smooth tee shot right into Circle 1.' },
    17: { s: 'slight_left', e: 'flat', c: 'park', pin: '321 ft penultimate park fairway', tip: 'Roadrunner / Wraith drive + Roc3 / Sync approach.' },
    18: { s: 'slight_left', e: 'flat', c: 'park', g: true, pin: '292 ft closing hole framed by guardian trees', tip: 'Roadrunner tee + Star Sync straight approach to chains.' }
  },
  cedarridge: {
    1: { s: 'tunnel', e: 'flat', c: 'tight_woods', pin: '261 ft wooded Cedar Ridge opener', tip: 'Roadrunner smooth tunnel drive down center.' },
    2: { s: 'slight_left', e: 'flat', c: 'tight_woods', g: true, pin: '289 ft tight timber corridor', tip: 'Stay in the center lane; pitch out cleanly if off-fairway.' },
    3: { s: 'straight', e: 'uphill', c: 'tight_woods', pin: '283 ft uphill straight wooded chute', tip: 'Halo IT / Mako3 straight uphill + XT Glow Nova under pin.' },
    4: { s: 'dogleg_left', e: 'downhill', c: 'tight_woods', w: 'short', pin: '392 ft Par 4 across bridge over swamp water', tip: 'Play safe Glow Mako3 + DX Roc3 placement across bridge.' },
    5: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '243 ft scary narrow timber gap', tip: 'Glow Mako3 dead-straight 80% swing + XT Glow Nova.' },
    6: { s: 'tunnel', e: 'flat', c: 'tight_woods', pin: '456 ft Par 4 long wooded tunnel to white pin', tip: 'Roadrunner tee + Glow Mako3 fairway laser + KC Pro Aviar.' },
    7: { s: 'dogleg_left', e: 'downhill', c: 'tight_woods', pin: '270 ft through fence gap curving down-left', tip: 'Roadrunner straight to gap + Star Toro / Nova left bend.' },
    8: { s: 'dogleg_left', e: 'downhill', c: 'tight_woods', g: true, pin: '301 ft steep hilly fairway curving left', tip: 'Star Mamba / Roadrunner glide + touch putt on sloped green.' },
    9: { s: 'tunnel', e: 'uphill', c: 'tight_woods', g: true, pin: '207 ft uphill tree gauntlet', tip: 'Roadrunner / Mako3 straight through tiny center trunks.' },
    10: { s: 'straight', e: 'downhill', c: 'tight_woods', pin: '147 ft pretty downhill wooded ace run', tip: 'Star Sync or Star Jay controlled downhill float.' },
    11: { s: 'dogleg_right', e: 'uphill', c: 'tight_woods', g: true, pin: '228 ft dense trees requiring right-turning line', tip: 'Star Rollo smooth right-drifting tee shot.' },
    12: { s: 'tunnel', e: 'flat', c: 'tight_woods', g: true, pin: '138 ft short technical wooded pocket', tip: 'Star Sync 80% straight shot at the pin.' },
    13: { s: 's_curve', e: 'uphill', c: 'tight_woods', g: true, pin: '234 ft split right/left fairway to C1 hill', tip: 'Pick wider gap off tee + XT Glow Nova hill stopper.' },
    14: { s: 'tunnel', e: 'flat', c: 'tight_woods', pin: '258 ft pure straight wooded corridor', tip: 'GStar Roadrunner smooth hyzer-flip without hitting a tree!' },
    15: { s: 'straight', e: 'flat', c: 'tight_woods', g: true, pin: '189 ft tight woods · Low ceiling', tip: 'Roadrunner or Glow Mako3 low laser.' },
    16: { s: 's_curve', e: 'flat', c: 'park', ob: 'right', pin: '613 ft monster Par 4 · Thorny brush rough', tip: 'DX Archangel / Roadrunner max-glide fairway placements + Nova.' },
    17: { s: 'tunnel', e: 'flat', c: 'tight_woods', pin: '503 ft Par 4 · 20-ft-wide timber hallway', tip: 'DX Archangel tee + Glow Mako3 straight down the gut.' },
    18: { s: 'dogleg_right', e: 'flat', c: 'tight_woods', g: true, pin: '332 ft closer with basket tucked right in trees', tip: 'DX Archangel tee + Star Rollo curving right to green.' }
  },
  california_trail: {
    1: { s: 'slight_left', e: 'flat', c: 'park', pin: '227 ft opener near sand volleyball pit · ★ 10/29 Par', tip: 'Keep Leopard3/Teebird nose-down + Star Sync 50ft approach.' },
    2: { s: 'straight', e: 'flat', c: 'park', g: true, pin: '280 ft past "No Parking Fire Lane" guardian tree', tip: 'Roadrunner flat past Fire Lane tree + Star Jay level approach.' },
    3: { s: 'straight', e: 'downhill', c: 'open', pin: '291 ft hill drive overlooking soccer park · ★ 10/29 Par', tip: 'Roadrunner bomber off hill + Star Sync parked 8–10ft!' },
    4: { s: 'straight', e: 'flat', c: 'open', pin: '291 ft open campus fairway', tip: 'Roadrunner flat down center + commit firmly on 2nd shot.' },
    5: { s: 'straight', e: 'flat', c: 'open', pin: '336 ft long Par 3 bomber · ★ 10/29 Par', tip: 'Mamba/Wraith low drive + full-strength Star Jay parked 4ft shy!' },
    6: { s: 'slight_left', e: 'flat', c: 'park', g: true, pin: '352 ft longest Par 3 · Guardian tree at green', tip: 'Roadrunner/Wraith straight pull + Sync curve around guardian tree.' },
    7: { s: 'slight_left', e: 'flat', c: 'park', g: true, pin: '267 ft early guardian tree · ★ 10/29 35ft Par Putt!', tip: 'Beat early tree cleanly + confident C2/C1 putt.' },
    8: { s: 's_curve', e: 'uphill', c: 'open', pin: '467 ft Par 4 hill climb', tip: 'Two controlled driver/midrange placements onto hill before C1 bid.' },
    9: { s: 'slight_left', e: 'uphill', c: 'park', g: true, ob: 'left', pin: '532 ft Monster Par 4 finale · ★ Jack’s 47ft Putt!', tip: 'Two Leopard3/Roadrunner placements + Toro/Roc uphill around tree!' }
  }
};

/**
 * Synthesizes a structured visual fairway/hole layout outline for ANY hole on ANY course
 * so the Live Scorecard can display a clean UDisc-style Top-Down Tee Sign diagram!
 */
export function getHoleVisualOutlineSpec(
  courseNameOrKey: string,
  holeNumber: number,
  distanceFeet: number,
  par: number,
  holeHint?: string
): HoleVisualOutlineSpec {
  const normKey = normalizeCourseKeyForPicks(courseNameOrKey);
  const { layout, holeIntel } = getCourseHoleLayoutIntel(courseNameOrKey, holeNumber);
  const udiscMapUrl =
    layout?.imageUrl && layout.imageUrl.trim().length > 0 ? layout.imageUrl : null;

  const curated = CURATED_HOLE_OUTLINES[normKey]?.[holeNumber];
  if (curated) {
    return {
      shape: curated.s,
      shapeLabel: SHAPE_LABELS[curated.s],
      elevation: curated.e,
      elevationLabel: ELEVATION_LABELS[curated.e],
      corridor: curated.c,
      corridorLabel: CORRIDOR_LABELS[curated.c],
      treesSide: curated.ts || 'both',
      walkingPath: curated.p || null,
      hasGuardianTree: Boolean(curated.g),
      waterHazard: curated.w || null,
      obHazard: curated.ob || null,
      pinNote: curated.pin,
      flightLineTip: curated.tip,
      udiscMapUrl
    };
  }

  // Automatic synthesis from satellite layout intel, hole hints, and yardage for all other courses
  const combinedText = [
    holeIntel?.direction,
    holeIntel?.hazards,
    holeIntel?.personalFlightMatch,
    holeHint
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let elevation: HoleElevationProfile = 'flat';
  if (/\buphill\b|\bgradual hill\b|\bsteep climb\b/.test(combinedText)) {
    elevation = 'uphill';
  } else if (/\bdownhill\b/.test(combinedText)) {
    elevation = 'downhill';
  }

  let corridor: HoleCorridorType = distanceFeet >= 310 ? 'open' : 'park';
  if (
    normKey === 'artnine' ||
    normKey === 'wolfden' ||
    /\btunnel\b|\bchute\b|\btight wood|\bnarrow wood|\bforest|\bdeep wood/.test(combinedText)
  ) {
    corridor = 'tight_woods';
  } else if (/\bopen meadow\b|\bopen grass\b|\bwide open\b|\bopen bomber\b/.test(combinedText)) {
    corridor = 'open';
  }

  let shape: HoleFairwayShape = corridor === 'tight_woods' ? 'tunnel' : 'straight';
  if (/\bdogleg[s\s-]*right\b|\bright-curving\b|\btucked right\b|\brollo\b/.test(combinedText)) {
    shape = distanceFeet >= 210 ? 'dogleg_right' : 'slight_right';
  } else if (/\bdogleg[s\s-]*left\b|\bfades naturally left\b|\bleft-fade\b|\broc3\b/.test(combinedText)) {
    shape = distanceFeet >= 240 ? 'dogleg_left' : 'slight_left';
  } else if (/\bs-curve\b|\bhyzer-flip\b|\bmamba\b/.test(combinedText) && distanceFeet >= 250) {
    shape = 's_curve';
  }

  const hasGuardianTree = /\bguardian\b|\bbranch\b|\btwo trees\b|\btree cluster\b/.test(
    combinedText
  );
  let waterHazard: 'left' | 'right' | 'behind' | 'short' | null = null;
  if (/\bwater\b|\bpond\b|\bcreek\b|\bswamp\b|\blake\b/.test(combinedText)) {
    waterHazard = /\bleft\b/.test(combinedText)
      ? 'left'
      : /\bbehind\b/.test(combinedText)
      ? 'behind'
      : 'right';
  }

  let obHazard: 'left' | 'right' | 'behind' | null = null;
  if (/\broad\b|\bfence\b|\bpaved\b|\bsidewalk\b|\bparking lot\b/.test(combinedText)) {
    obHazard = /\bleft\b/.test(combinedText) ? 'left' : 'right';
  }

  const pinNote =
    holeIntel?.direction && holeIntel?.hazards
      ? `${holeIntel.direction} · ${holeIntel.hazards.replace(/\.$/, '')}`
      : holeHint
      ? holeHint.split('—')[0].trim()
      : `${distanceFeet} ft Par ${par} ${SHAPE_LABELS[shape].replace(/^[^\s]+\s/, '')}`;

  const flightLineTip =
    holeIntel?.personalFlightMatch ||
    (holeHint && holeHint.includes('—') ? holeHint.split('—')[1].trim() : '') ||
    (distanceFeet < 175
      ? 'Throw Star Sync or Glow Mako3 flat at 80% straight at the basket.'
      : distanceFeet < 245
      ? 'Pipe Halo Star IT or Glow Mako3 with a level chest-high release.'
      : 'Drive flat with GStar Roadrunner or Classic Glow Wraith to set up an easy C1 putt.');

  let treesSide: 'both' | 'left' | 'right' | 'none' =
    corridor === 'open' ? 'none' : 'both';
  if (corridor !== 'tight_woods') {
    if (/\bwoods on left\b|\bleft tree line\b|\bdense woods left\b/.test(combinedText)) {
      treesSide = 'left';
    } else if (
      /\bwoods on right\b|\bright tree line\b|\bdense woods right\b/.test(combinedText)
    ) {
      treesSide = 'right';
    }
  }

  return {
    shape,
    shapeLabel: SHAPE_LABELS[shape],
    elevation,
    elevationLabel: ELEVATION_LABELS[elevation],
    corridor,
    corridorLabel: CORRIDOR_LABELS[corridor],
    treesSide,
    walkingPath: null,
    hasGuardianTree,
    waterHazard,
    obHazard,
    pinNote,
    flightLineTip,
    udiscMapUrl
  };
}

/**
 * Strictly checks whether a hole commentary / voice note explicitly mentions the given disc by name.
 */
export function doesCommentaryMentionDisc(
  disc: DiscItem,
  rawText: string,
  roundDate?: string
): boolean {
  const text = (rawText || '').trim();
  if (!text) return false;
  // Exclude pre-arrival shipping mentions ("while the physical discs are still in transit in the mail")
  if (/\bstill in transit\b|\bin transit in the mail\b/i.test(text)) {
    if (
      disc.id === 'innova-dx-alien' ||
      disc.id === 'innova-classic-glow-beast' ||
      disc.id === 'innova-classic-glow-wraith' ||
      disc.id === 'innova-classic-glow-roc'
    ) {
      return false;
    }
  }

  switch (disc.id) {
    case 'innova-it':
      return /\b(halo\s*star\s*it|halo\s*it|purple\s*it|the\s+it|throw\s+the\s+it|threw\s+the\s+it|with\s+the\s+it|it\s+is\s+working|it\s+went\s+right)\b/i.test(
        text
      );
    case 'innova-roc3':
      return /\b(roc\s*3|rock\s*3)\b/i.test(text);
    case 'innova-classic-glow-roc':
      return (
        (!roundDate || (roundDate >= '2026-11-05' && roundDate < '2026-11-18')) &&
        /\b(classic\s+glow\s+(?:dx\s+)?roc|glow\s+roc|new\s+roc|normal\s+roc|\broc\b|\brock\b)\b/i.test(
          text
        ) &&
        !/\b(roc\s*3|rock\s*3)\b/i.test(text)
      );
    case 'innova-sugar-glow-roc':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(dx\s+glow\s+roc|glow\s+roc|sugar\s+high\s+roc|\broc\b|\brock\b)\b/i.test(text) &&
        !/\b(roc\s*3|rock\s*3)\b/i.test(text)
      );
    case 'innova-kc-pro-aviar':
      return /\b(kc\s*pro(?:\s*aviar)?|kc\s+aviar)\b/i.test(text);
    case 'innova-proto-glow-aviar':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        (/\b(proto\s*glow\s*aviar|glow\s*aviar)\b/i.test(text) ||
          (/\baviar\b/i.test(text) &&
            !/\bkc\s*(?:pro\s*)?aviar\b/i.test(text) &&
            !/\byeti\b/i.test(text)))
      );
    case 'innova-yeti-pro-aviar':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(yeti(?:\s*pro)?(?:\s*aviar)?)\b/i.test(text)
      );
    case 'innova-aviar':
      return (
        (!roundDate || roundDate < '2026-11-18') &&
        (/\bstar\s+aviar\b/i.test(text) ||
          (/\baviar\b/i.test(text) && !/\bkc\s*(?:pro\s*)?aviar\b/i.test(text)))
      );
    case 'innova-xt-glow-nova':
      return /\bnova\b/i.test(text);
    case 'innova-sync':
      return (!roundDate || roundDate < '2026-11-23') && /\b(sync|xero)\b/i.test(text);
    case 'innova-halloween-sync':
      return (
        Boolean(roundDate && roundDate >= '2026-11-23') &&
        /\b(halloween\s*(star\s*)?sync|sync)\b/i.test(text)
      );
    case 'innova-dx-alien':
      return (!roundDate || roundDate >= '2026-11-05') && /\balien\b/i.test(text);
    case 'innova-classic-glow-beast':
      return (!roundDate || roundDate >= '2026-11-05') && /\bbeast\b/i.test(text);
    case 'innova-classic-glow-wraith':
      return (
        (!roundDate || (roundDate >= '2026-11-05' && roundDate < '2026-11-18')) &&
        /\bwraith\b/i.test(text)
      );
    case 'innova-halo-wraith':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(halo\s*wraith|wraith)\b/i.test(text)
      );
    case 'innova-halo-destroyer':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(halo\s*destroyer|destroyer)\b/i.test(text)
      );
    case 'innova-champion-eagle':
      return (
        (/\bchampion\s+eagle\b/i.test(text) || /\beagle\b/i.test(text)) &&
        !/\beagle\s*2\b/i.test(text)
      );
    case 'innova-toro':
      return /\btoro\b/i.test(text);
    case 'innova-mako3':
      return (
        (!roundDate || roundDate < '2026-11-18') &&
        /\b(mako\s*3|mako|miko\s*3)\b/i.test(text)
      );
    case 'innova-proto-glow-mako3':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(proto\s*glow\s*mako\s*3|mako\s*3|mako|miko\s*3)\b/i.test(text)
      );
    case 'innova-jay':
      return /\b(star\s+jay|jay)\b/i.test(text);
    case 'innova-rollo':
      return (
        (!roundDate || roundDate < '2026-11-18') &&
        /\b(rollo|rolo)\b/i.test(text)
      );
    case 'innova-sugar-star-rollo':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(rollo|rolo)\b/i.test(text)
      );
    case 'innova-archangel':
      return (
        (!roundDate || roundDate < '2026-11-23') &&
        /\b(archangel|arch\s*angel|ar\s*angel)\b/i.test(text)
      );
    case 'innova-hot-pink-archangel':
      return (
        Boolean(roundDate && roundDate >= '2026-11-23') &&
        /\b(hot\s*pink\s*(dx\s*)?archangel|archangel|arch\s*angel|ar\s*angel)\b/i.test(text)
      );
    case 'innova-roadrunner':
      return (
        (!roundDate || roundDate < '2026-11-18') &&
        /\b(roadrunner|road\s*runner)\b/i.test(text)
      );
    case 'innova-sugar-star-roadrunner':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(roadrunner|road\s*runner)\b/i.test(text)
      );
    case 'innova-mamba':
      return /\bmamba\b/i.test(text);
    case 'innova-leopard3':
      return (
        (!roundDate || roundDate < '2026-11-18') &&
        /\b(leopard\s*3|leopard)\b/i.test(text)
      );
    case 'innova-glow-leopard3':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(glow\s*leopard\s*3|leopard\s*3|leopard)\b/i.test(text)
      );
    case 'innova-glow-teebird':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(glow\s*teebird|teebird|tee\s*bird)\b/i.test(text)
      );
    case 'innova-firebird':
      return (!roundDate || roundDate < '2026-11-18') && /\bfirebird\b/i.test(text);
    case 'innova-luster-firebird':
      return (
        Boolean(roundDate && roundDate >= '2026-11-18') &&
        /\b(luster\s*firebird|firebird)\b/i.test(text)
      );
    case 'innova-pig':
      return /\bpig\b/i.test(text);
    case 'discraft-roach':
      return /\broach\b/i.test(text);
    case 'discraft-buzzz-ss':
      return /\bbuzzz\b/i.test(text);
    case 'discraft-cicada':
      return /\bcicada\b/i.test(text);
    default: {
      const escaped = disc.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
    }
  }
}

/**
 * Dynamically synthesizes how a disc flies for Jeffery by combining his 10/23 Mize 9-disc
 * field test baseline with live round commentary & scores across his entire round history.
 */
export function buildLivePersonalFlightProfile(
  disc: DiscItem,
  history: HistoricalRound[]
): {
  liveSummary: string;
  howItFliesForMe: string;
  swingCue: string;
  latestRoundQuote: string | null;
  loggedCount: number;
  birdieCount: number;
  parCount: number;
  windSuccessTags: string[];
  autoTunedTip: string;
} {
  const nameLower = disc.name.toLowerCase();
  const idShort = disc.id.replace('innova-', '').replace('discraft-', '').toLowerCase();
  const targetPlayerId = disc.ownerId === 'jack' ? 'jack' : 'jeffery';

  let loggedCount = 0;
  let birdieCount = 0;
  let parCount = 0;
  let latestRoundQuote: string | null = null;
  const windSet = new Set<string>();
  const recentQuotes: string[] = [];

  for (const r of history) {
    for (const h of r.holes) {
      const pMeta = h.meta?.[targetPlayerId];
      const usedDisc = (pMeta?.discUsed || '').toLowerCase();
      const thrownId = pMeta?.thrownDiscId || '';
      const inThrowsArray = Boolean(
        pMeta?.throws?.some((t) => t.discId === disc.id)
      );
      const candidateTexts = [
        h.voiceTranscript,
        pMeta?.voiceNote,
        pMeta?.notes,
        h.notes
      ]
        .map((t) => (t || '').trim())
        .filter(Boolean);

      const voice =
        candidateTexts.find((t) => doesCommentaryMentionDisc(disc, t, r.date)) || '';
      const voiceMatched = Boolean(voice);

      const isCottonCandyEra = Boolean(r.date && r.date >= '2026-11-18');
      const isHalloweenHotPinkEra = Boolean(r.date && r.date >= '2026-11-23');
      const isReplacedVaultMold =
        disc.id === 'innova-rollo' ||
        disc.id === 'innova-roadrunner' ||
        disc.id === 'innova-mako3' ||
        disc.id === 'innova-classic-glow-wraith' ||
        disc.id === 'innova-classic-glow-roc' ||
        disc.id === 'innova-leopard3' ||
        disc.id === 'innova-firebird' ||
        disc.id === 'innova-aviar';
      const isNewCottonCandyMold =
        disc.id === 'innova-sugar-star-rollo' ||
        disc.id === 'innova-sugar-star-roadrunner' ||
        disc.id === 'innova-proto-glow-mako3' ||
        disc.id === 'innova-halo-wraith' ||
        disc.id === 'innova-sugar-glow-roc' ||
        disc.id === 'innova-glow-leopard3' ||
        disc.id === 'innova-glow-teebird' ||
        disc.id === 'innova-luster-firebird' ||
        disc.id === 'innova-yeti-pro-aviar' ||
        disc.id === 'innova-proto-glow-aviar' ||
        disc.id === 'innova-halo-destroyer';
      const isReplacedNov23VaultMold =
        disc.id === 'innova-sync' || disc.id === 'innova-archangel';
      const isNewNov23Mold =
        disc.id === 'innova-halloween-sync' || disc.id === 'innova-hot-pink-archangel';

      const allowNameMatch =
        (!isReplacedVaultMold || !isCottonCandyEra) &&
        (!isNewCottonCandyMold || isCottonCandyEra) &&
        (!isReplacedNov23VaultMold || !isHalloweenHotPinkEra) &&
        (!isNewNov23Mold || isHalloweenHotPinkEra);

      const discUsedMatched =
        thrownId === disc.id ||
        inThrowsArray ||
        (allowNameMatch &&
          (usedDisc === nameLower ||
            (disc.id === 'innova-sync' &&
              (usedDisc.includes('sync') || usedDisc.includes('xero'))) ||
            (disc.id === 'innova-halloween-sync' && usedDisc.includes('sync')) ||
            (disc.id === 'innova-hot-pink-archangel' && usedDisc.includes('archangel')) ||
            (disc.id === 'innova-roc3' && usedDisc.includes('roc3')) ||
            (disc.id === 'innova-classic-glow-roc' &&
              (usedDisc.includes('classic glow roc') || usedDisc === 'roc')) ||
            (disc.id === 'innova-sugar-glow-roc' &&
              (usedDisc.includes('glow roc') || usedDisc === 'roc')) ||
            (disc.id === 'innova-proto-glow-mako3' && usedDisc.includes('mako')) ||
            (disc.id === 'innova-sugar-star-rollo' && usedDisc.includes('rollo')) ||
            (disc.id === 'innova-sugar-star-roadrunner' && usedDisc.includes('roadrunner')) ||
            (disc.id === 'innova-halo-wraith' && usedDisc.includes('wraith')) ||
            (disc.id === 'innova-glow-leopard3' && usedDisc.includes('leopard')) ||
            (disc.id === 'innova-glow-teebird' && usedDisc.includes('teebird')) ||
            (disc.id === 'innova-luster-firebird' && usedDisc.includes('firebird')) ||
            (disc.id === 'innova-yeti-pro-aviar' && usedDisc.includes('yeti')) ||
            (disc.id === 'innova-proto-glow-aviar' &&
              (usedDisc.includes('proto glow aviar') || usedDisc === 'aviar')) ||
            (disc.id === 'innova-halo-destroyer' && usedDisc.includes('destroyer')) ||
            (disc.id !== 'innova-it' &&
              disc.id !== 'innova-roc3' &&
              disc.id !== 'innova-classic-glow-roc' &&
              disc.id !== 'innova-aviar' &&
              !isNewCottonCandyMold &&
              !isNewNov23Mold &&
              usedDisc.includes(idShort)) ||
            (disc.id === 'innova-aviar' &&
              (usedDisc === 'aviar' || usedDisc === 'star aviar'))));

      const matched = discUsedMatched || voiceMatched;

      if (matched) {
        loggedCount++;
        const sc = h.scores?.[targetPlayerId] || 0;
        if (sc > 0 && sc < h.par) birdieCount++;
        else if (sc > 0 && sc === h.par) parCount++;

        const w = pMeta?.scenarioUsed || r.windCondition;
        if (w && sc > 0 && sc <= h.par) {
          windSet.add(w.toUpperCase());
        }

        if (voiceMatched && voice && recentQuotes.length < 3) {
          const shortCourse = r.courseName.split(' ')[0];
          recentQuotes.push(
            `${r.date.slice(5)} ${shortCourse} H${h.number}: "${voice.slice(0, 115)}${voice.length > 115 ? '...' : ''}"`
          );
          if (!latestRoundQuote) {
            latestRoundQuote = `${r.date.slice(5)} ${shortCourse} #${h.number} (${sc > 0 ? `Score ${sc}` : `Par ${h.par}`}): ${voice}`;
          }
        }
      }
    }
  }

  const baseNote = disc.personalFlightNotes || disc.moldAndFlight;
  let howItFliesForMe = baseNote;
  let swingCue =
    'Keep elbow at 90° chest-high with a level "tea-kettle" wrist release and follow through smoothly.';

  if (disc.id === 'innova-kc-pro-aviar') {
    howItFliesForMe =
      'Fleshed out across my 21 (-6 PB), 11/09 22 (-5), and 11/08 Prairie Center rounds: My #1 C1/C2 chain hunter and uphill approach putter. In firm KC Pro plastic, it releases cleanly off the thumb and holds a straight line inside 25ft—powering TWO 6-hole birdie streaks at Sar-Ko-Par (11/05 H4–H9 & 11/09 H3–H8, including a scary 15ft H2 par save, a long H3 birdie, a locked-in H4 birdie, and a 15ft H8 rim-bounce birdie!).';
    swingCue =
      'Index finger off the rim, weight on front foot, and stroke straight through the chains without hesitating ("Lock in! Did it!").';
  } else if (disc.id === 'innova-xt-glow-nova') {
    howItFliesForMe =
      '🏆 #1 Dead-Straight Approach, Scramble & Slope Stopper [2|2|0|0]! On 11/23 Black Hoof Championship (65 / +11 18-Hole PB tie!), went 11-for-11 on clutch approaches — sticking H1 a couple feet away, H5 5ft under the pin after Glow Teebird, H8 & H9 Double Pars, H15 Par, and H18 tap-in Par! Also drained the ~18ft downhill Birdie closer on 11/16 Sar-Ko H9!';
    swingCue =
      'Point-and-shoot flat release on approaches, mound/downhill greens & wooded scrambles — sits dead where it lands!';
  } else if (disc.id === 'innova-halloween-sync') {
    howItFliesForMe =
      '🎃 Brand-New Halloween Edition Hot Pink Star Sync [3|3|0|1] — 2/2 Pars (0.00 avg!) in its 11/23 Black Hoof Championship debut! Threaded EVERY tree on 105ft H13 grazing the basket top ("No idea how I missed all those trees—that Sync went right where I was aiming!") and drained a 10ft Par on 294ft H10 during your 65 (+11) 18-Hole PB tie!';
    swingCue =
      'Step up without overthinking—relaxed 80% flat chest-high pull straight at the chains!';
  } else if (disc.id === 'innova-sync') {
    howItFliesForMe =
      '📦 Backup Vault All-Star (131 pre-11/23 holes, 27 Birdies — Replaced 11/23 by Halloween Star Sync)! SMACKED THE BASKET on Sar-Ko H1 (11/16 near-Ace Birdie 2!), parked SMP Wooded H5 to 3ft (11/17), and birdied Art Nine H7 (11/22 24 / -3 PB tie!).';
    swingCue =
      'Vaulted 11/23 — throw your brand-new Halloween Star Sync (#05) on this exact straight line!';
  } else if (disc.id === 'innova-toro') {
    howItFliesForMe =
      'Flies like a heavy, torque-resistant approach brick [4|2|0|3] that refuses to turn over and hooks reliably left to brake by the pin. Saved Par up the wooded lane on Sar-Ko-Par H5 (11/04: "Toro was good, got me up there!") and parked a 3rd-shot uphill approach around a guardian tree on Cal Trail H9 (532ft Par 4). Won’t glide past the basket, but will dump left early if thrown softly.';
    swingCue =
      'Aim 15–20ft right of the pin on RHBH approaches (or flick forehand) and let its +3 fade hook around guardian trees and sit.';
  } else if (disc.id === 'innova-dx-alien') {
    howItFliesForMe =
      'My low-ceiling skip-birdie & UFO tree-dodge touch hybrid [4|2|0|1]! On 11/23 Black Hoof Championship (65 PB tie!), pulled off a legendary scramble on H12 ("Missed the trees like an alien UFO would!"); skipped pin-high for Birdie 2 on Sar-Ko H5 (11/16) & set up Art Nine H6 20ft Birdie (11/17)!';
    swingCue =
      'Lock your thumb into the ridged saucer groove and punch it low and flat—skips pin-high under low ceilings without sailing long.';
  } else if (disc.id === 'innova-proto-glow-mako3') {
    howItFliesForMe =
      'Breakout Cotton Candy "Sugar High" straight woods laser [5|5|0|0]! Sparked your 11/22 BOGEY-FREE 24 (-3) Art Nine PB tie (H3 skip Birdie 2 + H9 chain-out for 23!), laced SMP Wooded H15 Par, and started your 3-Par streak on 11/23 Black Hoof Championship H8 (65 / +11 18-Hole PB tie!)!';
    swingCue =
      'Stay upright with a dead-level chest-high pull-through—focus on releasing on time without drifting late right.';
  } else if (disc.id === 'innova-sugar-star-rollo') {
    howItFliesForMe =
      '🏆 11/23 BLACK HOOF CHAMPIONSHIP MVP [5|6|-4|1]!! Flipped up on 201ft H17 for your 1st Cotton Candy Star Rollo BIRDIE 2 ★ ("Flip up, flip up—IT DID IT!! Rollo is my disc, man! Birdie, dude!"), bombed 237+ ft downhill to the blue pin on H15 Par, & locked in Pars on H1, 294ft H10 & uphill H18 to tie your All-Time 18-Hole PB (65 / +11)!';
    swingCue =
      'Swing your hips ("belly button at target!") with firm flat chest-high zip—don’t be afraid to throw it far and let the -4 turn flip up!';
  } else if (disc.id === 'innova-sugar-star-roadrunner') {
    howItFliesForMe =
      'Cotton Candy Hot Pink Star distance workhorse [9|5|-4|1]! On 11/23 Black Hoof Championship (65 PB tie!), twisted the hips down the 382ft longest hole H7 ("Went the distance! I was proud of that 4!"), plus 11/22 SMP Wooded H13 debut!';
    swingCue =
      'Drive through with hip rotation ("belly button at target") and keep the nose down so its 9-speed glide carries dead straight or pans right.';
  } else if (disc.id === 'innova-halo-wraith') {
    howItFliesForMe =
      'Cotton Candy Two-Tone Halo Star Speed 11 power bomber [11|5|-1|3]! Debuted off the tee on 11/22 at Shawnee Mission Wooded on 355ft H7 and closing 347ft H18—helping shave 7 strokes off your 11/17 score for a 71 (+17)! Premium Halo rim resists gusty headwinds with a reliable +3 left finish.';
    swingCue =
      'Keep it low and flat under the ceiling with a full follow-through so Halo rim stability drives forward before hooking left.';
  } else if (disc.id === 'innova-sugar-glow-roc') {
    howItFliesForMe =
      'Breakout Cotton Candy DX Glow Rancho Roc [4|4|0|3]! Locked in H9 Double Par during your 11/23 Black Hoof 65 (+11) PB tie, right after stealing the show on 11/22 SMP Wooded with 4 clutch Pars (H6, 15ft downhill H10, dead-straight H14 & H17) + Art Nine H1 Par!';
    swingCue =
      'Commit to a firm flat pull-through with tea-kettle wrist low—flies dead straight with a gentle predictable left check in wind.';
  } else if (disc.id === 'innova-yeti-pro-aviar') {
    howItFliesForMe =
      'Breakout Cotton Candy concave-top beaded putter [2|3|0|1]! Powered your 11/22 BOGEY-FREE 24 (-3) Art Nine PB tie (wild tree-bending H5 Birdie 2!), hit metal from 45–50ft on SMP Wooded H9, and closed out your 11/23 Black Hoof H17 Rollo Birdie in 42°F sunshine!';
    swingCue =
      'Lock your thumb into the concave puddle top, keep weight forward, and pop straight through the chains with tacky confidence.';
  } else if (disc.id === 'innova-proto-glow-aviar') {
    howItFliesForMe =
      'Cotton Candy Mint Collector beadless putter [2|3|0|1] — Debuted on 11/23 Black Hoof Championship (65 PB tie!) across H2, H6, H11 & H14 ("Color Aviar")! Commit smoothly without holding back for straight beadless float!';
    swingCue =
      'Don’t throw scared—trust a smooth 80% flat pull with index finger tucked cleanly under the beadless rim.';
  } else if (disc.id === 'innova-glow-teebird') {
    howItFliesForMe =
      '🏆 Breakout Cotton Candy 7-Speed Fairway [7|5|0|2]! On 11/23 Black Hoof Championship (65 PB tie!), striped a gorgeous S-glide on 315ft H5 ("Like a little snake—goes right then flows back left!") for a monster Par 3 ★, right after its gusty-wind SMP Wooded H1 debut (11/22)!';
    swingCue =
      'Aim 8–12ft right of the pin and pull flat & chest-high—holds zero turn for 80% of flight before a clean +2 left settle.';
  } else if (disc.id === 'innova-glow-leopard3') {
    howItFliesForMe =
      'Cotton Candy Aqua Color Glow Champion fairway [7|5|-2|1]! Unlocked your hip-rotation cue on 11/23 Black Hoof Championship H3 ("Swing your hips—belly button at target!") with clean skip-skip-skip carries on H3 & H6!';
    swingCue =
      'Swing your hips so your belly button finishes facing the target with a flat chest-high release for smooth wooded hyzer-flips.';
  } else if (disc.id === 'innova-luster-firebird') {
    howItFliesForMe =
      'Cotton Candy Luster Champion wind & skip utility [9|3|0|4]! Debuted on 11/22 at Shawnee Mission Wooded—anchored a clutch Par 3 on 302ft H8 paired with Pink DX Alien and fought gusty wind on H9!';
    swingCue =
      'Pull strictly for headwinds, sharp dogleg-left corners, or low flare-skips aimed well right of the basket.';
  } else if (disc.id === 'innova-halo-destroyer') {
    howItFliesForMe =
      'Flagship Cotton Candy Speed 12 Neon Chartreuse Halo Destroyer [12|5|-1|3]! In-hand Main Bag max-distance & stiff-headwind bomber for 300–600ft open Championship fairways—awaiting its first logged tee rip!';
    swingCue =
      'Save for wide-open 300+ ft fairways or fierce headwinds; release low and flat with room on the right for its +3 finish.';
  } else if (disc.id === 'innova-mako3') {
    howItFliesForMe =
      'My purest angle-integrity truth-teller [5|5|0|0]. On 11/10 at Shawnee Mission Wooded H13 (277ft downhill), I striped it dead-flat the entire flight ("Straight, beauty, perfect! Flat as can be the whole way!"). Also laced 11/09 Sar-Ko-Par H2, parked 2ft on 11/05 Sar-Ko H6 (21 PB), and birdied Art Nine H6 back-to-back. Tendency: Turning my wrist pulls it left into early trees.';
    swingCue =
      'Stay upright, keep the disc dead-level ("Level is what I’m looking at"), and shift weight from back-left to front-right foot.';
  } else if (disc.id === 'innova-jay') {
    howItFliesForMe =
      'Flies like a power-ready Mako3 with a dependable 10-foot left check and glide finish [5|4|0|1]. Delivered two clutch Back-9 Par 3s on 11/10 at Shawnee Mission Wooded: a cool glide loop to 10ft on H15 and a pinpoint headwind approach on H17 ("Almost said I did that one too high, but it was perfect!"). Also parked Cal Trail H5 (336ft) to 4ft and birdied Sar-Ko H5!';
    swingCue =
      'Commit to a full-strength flat rip and aim 10ft right of the basket so its +1 fade and skip check right to the pin.';
  } else if (disc.id === 'innova-roc3') {
    howItFliesForMe =
      'My go-to hyzer midrange [5|4|0|3] for 140–225ft shots that need to swing wide right around guardian trees and finish left in Circle 1. On 11/09 in calm air on Sar-Ko-Par H6, it missed every tree and glided right into C1 for Birdie 2 ("Fantastic, Roc3! Went right up there to Circle 1, didn’t hit a tree at all!"), sparked my 6-hole birdie streak on 11/05 (H4 & H5 Birdies), and birdied Art Nine H5 (11/08).';
    swingCue =
      'Align disc down the forearm ("heavy tea-kettle" grip), swing wide right of guardian trees, and trust the late +3 left fade.';
  } else if (disc.id === 'innova-classic-glow-roc') {
    howItFliesForMe =
      'My max-weight 180g Rancho-mold control mid [4|4|0|3]—straighter under flat snap than Roc3 with a smooth late check! On 11/17 at The Art Nine, I laced it dead-straight downhill on Hole #9 for a walk-off Birdie 2 to seal a 16-minute Even-Par 27 ("Roc, that looks straight, man, downhill—Good! Birdie! Even, huh?")! Also parked Sar-Ko H4 for Birdie 2 (11/09).';
    swingCue =
      'Throw firm and flat on 130–220ft tunnels & downhill lines when you want dead-straight control with a gentle late check.';
  } else if (disc.id === 'innova-rollo') {
    howItFliesForMe =
      'My ONLY guaranteed RHBH right-turning midrange [5|6|-4|1] and uphill weapon! On 11/17 at Shawnee Mission Wooded, it glided right under the 208ft dogleg-right H5 basket ("Rollo gets the honor—Birdie!"), saved Par uphill on H12, and conquered steep 338ft uphill H16 in 3 throws to 5ft! Plus Prairie Pass H2/H10 Pars & 6× Sar-Ko H9 Birdies!';
    swingCue =
      'Keep the "tea-kettle" wrist level with firm chest-high zip ("Only disc that ever goes right is the Rollo!").';
  } else if (disc.id === 'innova-it') {
    howItFliesForMe =
      'My #1 pinpoint fairway driver [7|6|-2|1]! With my chest-high "tea-kettle" release, it flies the exact S-curve printed on the card. Parked 5ft past Sar-Ko-Par H7 on 11/09 for Birdie 2 ("IT was perfect!"), earned Par 3s on Shawnee Mission Wooded H6 & H17 (11/10) and Prairie Center H13 & H16 (11/08), and parked 1ft on Sar-Ko H3 (11/05)! Note: Keep nose down into headwinds.';
    swingCue =
      'Keep elbow at 90° chest-high with the "heavy tea-kettle" wrist—keep the nose down when throwing into a breeze.';
  } else if (disc.id === 'innova-champion-eagle') {
    howItFliesForMe =
      'Breakout Cotton Candy "Sugar High" 2-Foil fairway workhorse [7|4|-1|3]! On 11/16 at Sar-Ko-Par R2 H8 (171ft), I parked it 5–7 FEET UNDER THE PIN ("That’s under the pin, dude! 5, 6, 7 feet away—Birdied!") during a bogey-free 24 (-3), plus earned Par 3s on R1 H8 & R2 H4 and a clean left skip on R1 H6! Dependable +3 left finish when Archangel stays too straight.';
    swingCue =
      'Aim right of guarded pockets and commit to a crisp flat release so it skips and hooks left right under the basket.';
  } else if (disc.id === 'innova-hot-pink-archangel') {
    howItFliesForMe =
      '🪽 Brand-New Hot Pink DX Archangel [8|6|-4|1] — BACK IN THE 100% COMPLETE BAG on 11/23 Black Hoof Championship! Debuted on 250ft H2 ("Got a new one!") during your 65 (+11) 18-Hole PB tie, taking over the beloved 6-glide wooded fairway slot from your vaulted Royal Blue DX Archangel!';
    swingCue =
      '"Don’t bend down—stay straight up when I release it" with a smooth chest-high pull-through.';
  } else if (disc.id === 'innova-archangel') {
    howItFliesForMe =
      '📦 Backup Vault Legend (39 pre-11/23 holes, 8 Birdies, 77% Par+ — Replaced 11/23 by Hot Pink Archangel)! Parked 202ft Prairie Pass H8 pin-high 10ft left ("Like an angel! Permanent, keep this one!"), threaded 193ft wooded H12, and went back-to-back Birdie 2s on Sar-Ko H7/H8 in your 21 (-6 PB)!';
    swingCue =
      'Vaulted 11/23 — throw your new Hot Pink Archangel (#13) with the same upright chest-high pull!';
  } else if (disc.id === 'innova-roadrunner') {
    howItFliesForMe =
      'My #1 all-around distance driver and birdie catalyst [9|5|-4|1]! On 11/16 at Sar-Ko-Par R2 H2 (192ft), my Purple 168g GStar Roadrunner parked exact pin-high 3 FEET left ("Purple, there he is—exact distance of the pin, 3 feet away to the left! Birdie!"), right after striping a 200ft "straight box-cutter line" on Prairie Pass H4 (11/15)! Club down on 162ft H3 so it doesn’t sail long.';
    swingCue =
      'Smooth, level chest-high pull—avoid nose-up releases on the 1st tee or uphill drives so its 9-speed glide penetrates forward.';
  } else if (disc.id === 'innova-classic-glow-beast') {
    howItFliesForMe =
      'Mixed / skeptical feel so far [10|5|-2|2]. On 11/10 at Shawnee Mission Wooded, it hit a nice wide-right hyzer line on open H8 ("Great shot, Beast!"), but pulled hard left twice on 444ft H11 ("Not sure I like the Beast all that much"), after clipping trees on 11/08 Prairie Center H2 & H7. Demands wide-open right-to-left space and full flat snap so its +2 fade doesn’t dump left.';
    swingCue =
      'Use only on wide-open fairways aimed well right with a flat, nose-down snap—club down to Roadrunner or Wraith in tight woods.';
  } else if (disc.id === 'innova-mamba') {
    howItFliesForMe =
      'My featherlight 152g max-glide bomber [11|6|-5|1]! Delivers effortless carry on 300–460ft open fairways (Cal Trail H5/H8, Mize H3/H4/H8, Prairie Center H14/H15/H17) and parked Sar-Ko-Par H7 on 10/29 & 10/30. Commentary insight: As my arm speed has increased, the 152g Mamba can overpower 160ft holes into the woods (like Sar-Ko-Par H3 on 10/30) or flip hard if thrown high—so I now club down to Halo IT / Archangel / Roadrunner on shorter holes and save Mamba for long open bombers!';
    swingCue =
      'Keep the release low and smooth at 80% effort so the 152g weight and 6-glide carry straight; club down on holes under 220ft.';
  } else if (disc.id === 'innova-classic-glow-wraith') {
    howItFliesForMe =
      'Breakthrough low-ceiling 11-speed bomber [11|5|-1|3]! On 11/17 at Shawnee Mission Wooded, it crushed 150–180+ ft over halfway on H7, H8 & H9—and after being found on H18 ("I found the Wraith!"), striped a dead-straight closing bomb down H18! Also bombed downhill Prairie Pass H16 for Par 3 (11/15).';
    swingCue =
      'Keep the trajectory low and flat ("kept it down like I was supposed to") and release cleanly out in front so it doesn’t leak right.';
  } else if (disc.id === 'discraft-roach') {
    howItFliesForMe =
      'Jack’s deadly beadless putter & approach sniper [2|3|0|1]! On 11/09 at Sar-Ko-Par (Even-Par 27!), Jack threw a 50-foot Roach approach on H7 that parked 2 feet from the pin ("Threw that putter right where it was about two feet—this Roach!"). Also powered his bogey-free 24 (-3) PB at The Art Nine on 11/08 and his 47-foot stride-measured bomb putt on Cal Trail H9 (10/29)!';
    swingCue =
      'Point-and-shoot flat release with a full, confident follow-through straight into the chains or bullseye.';
  } else if (disc.id === 'discraft-buzzz-ss') {
    howItFliesForMe =
      'Jack’s laser-straight woods midrange & S-curve shaper [5|4|-2|1]! On 11/09 at Sar-Ko-Par, Jack nearly aced Hole 1 (138ft) off the tee ("Right in there! Oh my gosh, I thought that was gonna be a hole-in-one!") for Birdie 2 and carved a sweet uphill S-curve on H9 ("Yeah, buddy! Your S-curves!") to seal an Even-Par 27! Also parked Art Nine H2 for Birdie 2 and piped Prairie Center H11 for an outright Par 3 skin win on 11/08.';
    swingCue =
      'Smooth flat release down the center gap—let the -2 turn and 4 glide carve a natural S-curve right to the basket.';
  } else if (disc.id === 'discraft-cicada') {
    howItFliesForMe =
      'Jack’s #1 S-curve fairway bomber [7|6|-1|1]! As Jeffery noted on Sar-Ko-Par H8 on 11/09 ("Jack always goes right through there—perfect!") and Black Hoof H3 ("Jack’s is this beautiful S-curve that he gets on his Cicada!"), Jack threads center gaps and shapes high-glide S-curves with his yellow Cicada—winning 3 long holes outright at Prairie Center on 11/08 (H3 265ft, H14 355ft & H17 321ft)!';
    swingCue =
      'Smooth, level pull—trust the 6 glide and balanced [-1|1] numbers to pipe center gaps and carve long S-curves.';
  } else if (disc.id === 'innova-leopard3') {
    howItFliesForMe =
      'Archived Vault (Left on Sar-Ko-Par H8 on 11/02 · Replaced in active bag by 170g Halo Star IT): Flew as a smooth hyzer-flip fairway driver—won the 10/30 Sar-Ko-Par H8 test drive, parked H4 to 10ft in my 10/29 21 (-6 PB) round, and carried Cal Trail H8/H9 Par 4s. Halo Star IT and GStar Roadrunner now cover this exact slot!';
    swingCue =
      'Release flat or on a slight hyzer; keep it low off elevated tees (thrown too high on Cal Trail H1 it dove left into the sand).';
  } else if (disc.id === 'innova-aviar') {
    howItFliesForMe =
      'Archived Vault (Replaced in active bag by KC Pro Aviar & Star Sync): Beadless driving/approach putter that flew dead-straight when I tucked my index finger off the rim, finishing with a gentle +1 left curve (parked Sar-Ko-Par H1 to 6–7ft for Birdie 2 on 10/29, scrambled out of the woods under the basket on H3 on 10/30, and smacked the metal pan from 40ft on Black Hoof H3 on 11/01).';
    swingCue =
      'Tuck index finger under the rim (not on the front edge) for a clean, wobble-free straight release.';
  } else if (disc.id === 'innova-firebird') {
    howItFliesForMe =
      'Archived Vault (Replaced in active bag by 175g Champion Eagle): Ultra-overstable [9|3|0|4] utility driver that hooks immediately left and skips hard. Earned early Sar-Ko-Par H4 & H7 hyzer birdies before I transitioned to the more controllable Speed 7 Champion Eagle [7|4|-1|3].';
    swingCue =
      'Use only for sharp dogleg-left utility hooks, low skip shots, or heavy headwinds.';
  } else if (disc.id === 'innova-pig') {
    howItFliesForMe =
      'Archived Vault (Replaced in active bag by 175g Star Toro & XT Glow Nova): Thumbtrac heavy-fade approach putter [4|1|0|3] that dropped and stopped on steep hills ("Going with the Pig, because it stops!" on Harmon H6 & Black Hoof H8).';
    swingCue =
      'Lock thumb into the Thumbtrac groove and aim right of the pin on sloped greens where roll-aways lurk.';
  }

  const autoTunedTip = `${howItFliesForMe} (${loggedCount} logged throws · ${birdieCount} Birdies / ${parCount} Pars)`;

  return {
    liveSummary: howItFliesForMe,
    howItFliesForMe,
    swingCue,
    latestRoundQuote,
    loggedCount,
    birdieCount,
    parCount,
    windSuccessTags: Array.from(windSet),
    autoTunedTip
  };
}


/**
 * Generates an SVG cubic bezier path and landing coordinate for RHBH flight visualization
 */
export function computeFlightPathSvg(
  disc: DiscItem,
  wind: CaddieScenario = 'calm',
  releaseAngle: 'flat' | 'hyzer' | 'anhyzer' = 'flat'
): {
  pathD: string;
  endX: number;
  endY: number;
  apexX: number;
  apexY: number;
  estimatedFeet: number;
} {
  // SVG viewport: Tee pad at (130, 294), flying upward toward top (300ft at y=48, 225ft at y=122, 150ft at y=196).
  const startX = 130;
  const startY = 294;

  // Distance ratio calibrated and stretched for real bag ranges (150ft -> y=196, 225ft -> y=122, 300ft -> y=48)
  let windDistMod = 1.0;
  if (wind === 'tailwind') windDistMod = 1.08;
  if (wind === 'headwind') windDistMod = disc.turn <= -3 ? 0.85 : 0.94;
  if (wind === 'cross_lr' || wind === 'cross_rl') windDistMod = 0.97;

  const estFeet = Math.round(disc.idealMaxFeet * windDistMod);
  const rawEndY = Math.round(196 - ((estFeet - 150) / 75) * 74);
  const endY = Math.min(220, Math.max(26, rawEndY));

  // Effective high-speed turn (negative turns right -> +X in RHBH)
  let effTurn = disc.turn;
  if (wind === 'headwind') effTurn -= 1.5; // Headwind magnifies turn
  if (wind === 'tailwind') effTurn += 1.0; // Tailwind dampens turn
  if (wind === 'cross_lr') effTurn -= 0.9; // L->R pushes right
  if (wind === 'cross_rl') effTurn += 0.6; // R->L resists right turn
  if (releaseAngle === 'hyzer') effTurn += 1.5; // Hyzer absorbs turn
  if (releaseAngle === 'anhyzer') effTurn -= 1.8; // Anhyzer forces right drift

  // Effective low-speed fade (positive fades left -> -X in RHBH)
  let effFade = disc.fade;
  if (wind === 'headwind') effFade = Math.max(0, effFade - 0.8);
  if (wind === 'tailwind') effFade += 0.6;
  if (wind === 'cross_lr') effFade = Math.max(0, effFade - 0.6);
  if (wind === 'cross_rl') effFade += 0.9;
  if (releaseAngle === 'hyzer') effFade += 0.8;
  if (releaseAngle === 'anhyzer') effFade = Math.max(0, effFade - 1.0);

  // High-speed turn pull to the right (positive X offset from center 130, stretched laterally)
  const turnPullX = Math.min(242, Math.max(38, startX + (-effTurn) * 23));
  const turnPullY = Math.round(startY - (startY - endY) * 0.58);

  // Net landing X position (combines high speed turn drift and late left fade)
  const netLateral = (-effTurn) * 15 - effFade * 24;
  const endX = Math.min(240, Math.max(22, Math.round(startX + netLateral)));

  const cp1X = startX + (turnPullX - startX) * 0.55;
  const cp1Y = Math.round(startY - (startY - endY) * 0.34);

  const cp2X = turnPullX;
  const cp2Y = Math.round(startY - (startY - endY) * 0.78);

  const pathD = `M ${startX} ${startY} C ${Math.round(cp1X)} ${cp1Y}, ${Math.round(cp2X)} ${cp2Y}, ${endX} ${endY}`;

  return {
    pathD,
    endX,
    endY,
    apexX: Math.round(turnPullX),
    apexY: turnPullY,
    estimatedFeet: estFeet
  };
}

export function computeLiveSkinsAndMatch(
  holes: HoleData[],
  p1Id: string,
  p2Id: string
): {
  p1SkinsWon: number;
  p2SkinsWon: number;
  currentCarryover: number;
  matchStatusText: string;
  holeWinners: Record<number, { winner: string | 'push' | 'unplayed'; skinsAwarded: number }>;
} {
  let p1SkinsWon = 0;
  let p2SkinsWon = 0;
  let carryover = 0;
  let p1HolesUp = 0;
  const holeWinners: Record<number, { winner: string | 'push' | 'unplayed'; skinsAwarded: number }> = {};

  for (const h of holes) {
    const s1 = h.scores[p1Id] || 0;
    const s2 = h.scores[p2Id] || 0;
    if (s1 === 0 || s2 === 0) {
      holeWinners[h.number] = { winner: 'unplayed', skinsAwarded: 0 };
      continue;
    }

    const pot = 1 + carryover;
    if (s1 < s2) {
      p1SkinsWon += pot;
      carryover = 0;
      p1HolesUp += 1;
      holeWinners[h.number] = { winner: p1Id, skinsAwarded: pot };
    } else if (s2 < s1) {
      p2SkinsWon += pot;
      carryover = 0;
      p1HolesUp -= 1;
      holeWinners[h.number] = { winner: p2Id, skinsAwarded: pot };
    } else {
      carryover += 1;
      holeWinners[h.number] = { winner: 'push', skinsAwarded: 0 };
    }
  }

  let matchStatusText = 'All Square (AS)';
  if (p1HolesUp > 0) matchStatusText = `${p1Id === 'jeffery' ? 'Jeffery' : 'P1'} ${p1HolesUp} UP`;
  else if (p1HolesUp < 0) matchStatusText = `${p2Id === 'jack' ? 'Jack' : 'P2'} ${Math.abs(p1HolesUp)} UP`;

  return {
    p1SkinsWon,
    p2SkinsWon,
    currentCarryover: carryover,
    matchStatusText,
    holeWinners
  };
}

export function recommendJackDisc(
  distanceFeet: number,
  bag: DiscItem[]
): DiscItem | null {
  const jackDiscs = bag.filter((d) => d.ownerId === 'jack');
  const byId = (id: string) => jackDiscs.find((d) => d.id === id) || null;
  if (distanceFeet < 175) {
    return byId('discraft-roach') || jackDiscs[0] || null;
  }
  if (distanceFeet <= 240) {
    return byId('discraft-buzzz-ss') || jackDiscs[0] || null;
  }
  return byId('discraft-cicada') || jackDiscs[0] || null;
}

export interface CourseSummaryDossier {
  courseName: string;
  roundsPlayed: number;
  holesCount: number;
  par: number;
  totalFeet: number;
  courseVibe: string;
  scoringOverview: string;
  conditionsAndWindRecap: string;
  commentaryHighlights: string[];
  bestScoringHoles: Array<{
    holeNumber: number;
    par: number;
    distance: number;
    avgScore: number;
    bestScore: number;
  }>;
  toughestHoles: Array<{
    holeNumber: number;
    par: number;
    distance: number;
    avgScore: number;
    verifiedDisc: string;
  }>;
  topGoToDiscs: Array<{ name: string; count: number }>;
}

export function buildCourseSummary(
  courseName: string,
  history: HistoricalRound[],
  bag: DiscItem[] = []
): CourseSummaryDossier {
  const normKey = normalizeCourseKeyForPicks(courseName);
  const courseRounds = history.filter(
    (r) =>
      normalizeCourseKeyForPicks(r.courseName) === normKey ||
      r.courseName.toLowerCase() === courseName.toLowerCase()
  );

  const sampleRound = courseRounds[0];
  const holesCount = sampleRound?.totalHoles || sampleRound?.holes.length || 9;
  const par =
    sampleRound?.par ||
    (sampleRound ? sampleRound.holes.reduce((s, h) => s + (h.par || 3), 0) : 27);
  const totalFeet = sampleRound
    ? sampleRound.holes.reduce((s, h) => s + (h.distance || 0), 0)
    : 1800;

  const jeffPB = getCoursePersonalBest(courseName, 'jeffery', history);
  const jackPB = getCoursePersonalBest(courseName, 'jack', history);

  // Compute historical wind & conditions recap from all rounds at this course
  const windCounts: Record<string, number> = {
    calm: 0,
    headwind: 0,
    tailwind: 0,
    cross_lr: 0,
    cross_rl: 0
  };
  let jeffBirdiesHere = 0;
  let jeffParsHere = 0;
  let jackBirdiesHere = 0;
  let jackParsHere = 0;
  const discFreq = new Map<string, number>();

  for (const r of courseRounds) {
    const w = r.windCondition || 'calm';
    windCounts[w] = (windCounts[w] || 0) + 1;
    for (const h of r.holes) {
      const sJ = h.scores?.jeffery || 0;
      const sK = h.scores?.jack || 0;
      if (sJ > 0 && sJ < h.par) jeffBirdiesHere++;
      else if (sJ > 0 && sJ === h.par) jeffParsHere++;
      if (sK > 0 && sK < h.par) jackBirdiesHere++;
      else if (sK > 0 && sK === h.par) jackParsHere++;

      const dUsed = h.meta?.jeffery?.discUsed;
      if (dUsed) {
        discFreq.set(dUsed, (discFreq.get(dUsed) || 0) + 1);
      }
    }
  }

  // Hole-by-hole averages for best & toughest holes
  const holeStats: Array<{
    holeNumber: number;
    par: number;
    distance: number;
    avgScore: number;
    bestScore: number;
    avgRelPar: number;
    verifiedDisc: string;
  }> = [];

  for (let hNum = 1; hNum <= holesCount; hNum++) {
    const scores: number[] = [];
    let hPar = 3;
    let hDist = 180;
    for (const r of courseRounds) {
      const h = r.holes.find((x) => x.number === hNum);
      if (!h) continue;
      if (h.par) hPar = h.par;
      if (h.distance) hDist = h.distance;
      const sc = h.scores?.jeffery || 0;
      if (sc > 0) scores.push(sc);
    }
    if (scores.length > 0) {
      const avg = Number(
        (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
      );
      const best = Math.min(...scores);
      const vKey = getVerifiedHoleKey(courseName, hNum);
      const vId = DEFAULT_VERIFIED_HOLE_PICKS[vKey];
      const vDisc = bag.find((d) => d.id === vId)?.name || 'Glow Mako3 / Halo IT';
      holeStats.push({
        holeNumber: hNum,
        par: hPar,
        distance: hDist,
        avgScore: avg,
        bestScore: best,
        avgRelPar: Number((avg - hPar).toFixed(2)),
        verifiedDisc: vDisc
      });
    }
  }

  const bestScoringHoles = [...holeStats]
    .sort((a, b) => a.avgRelPar - b.avgRelPar || a.bestScore - b.bestScore)
    .slice(0, 3);
  const toughestHoles = [...holeStats]
    .sort((a, b) => b.avgRelPar - a.avgRelPar)
    .slice(0, 3);
  const topGoToDiscs = Array.from(discFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const windParts: string[] = [];
  if (windCounts.calm > 0) windParts.push(`${windCounts.calm} calm`);
  if (windCounts.headwind > 0) windParts.push(`${windCounts.headwind} headwind`);
  if (windCounts.tailwind > 0) windParts.push(`${windCounts.tailwind} tailwind`);
  if (windCounts.cross_lr + windCounts.cross_rl > 0) {
    windParts.push(`${windCounts.cross_lr + windCounts.cross_rl} crosswind`);
  }
  const windBreakdownText =
    windParts.length > 0 ? windParts.join(', ') : 'calm conditions';

  let courseVibe = `${holesCount}-hole layout (Par ${par} · ${totalFeet.toLocaleString()} ft) with ${courseRounds.length} logged ${courseRounds.length === 1 ? 'round' : 'rounds'}.`;
  let conditionsAndWindRecap = `Played ${courseRounds.length} ${courseRounds.length === 1 ? 'round' : 'rounds'} here (${windBreakdownText}).`;
  let commentaryHighlights: string[] = [];

  if (normKey === 'sarko') {
    courseVibe =
      'Jeffery & Jack’s #1 home 9-hole technical park loop (1,414 ft, Par 27) in Lenexa—featuring short 138–192 ft tree-guarded pins, dense left woods / open right lawn on H2, mid-fairway paved trail crossings on H6 & H7, and the signature uphill H9 closer.';
    conditionsAndWindRecap = `Recap across ${courseRounds.length} rounds (${windBreakdownText}): Calm autumn afternoons & dusk rounds produced both 21 (-6) Course PB rounds (10/29 & 11/05 R2), the 11/09 71°F 22 (-5), and a chilly short-sleeve Friday 25 (-2) Bogey-Free round on 11/13, while heavy gusts (11/03 23 / -4 & 11/11 28 / +1) proved flat Halo Star IT (H3), low-skip Classic Glow Roc (H5), Star Sync (H1/H9 safety), XT Glow Nova (H2 scramble), and KC Pro Aviar hold firm in Kansas air.`;
    commentaryHighlights = [
      '🏆 Twice tied All-Time Course Record 21 (-6) on 10/29 & 11/05 R2 (closed 11/05 with 6 straight birdies on H4–H9!) + shot 22 (-5) on 11/09 + Bogey-Free 25 (-2) on chilly 11/13!',
      '🎯 Signature Hole Locks: Star Sync on H1 (3 straight parked Birdies 11/04–11/05 + 11/13 Birdie 2) & H9 safe hill layup (11/13 Bogey-Free finisher!), Glow Mako3 / Halo IT / XT Glow Nova scramble on H2, Halo Star IT on H3, DX Roc3 / Classic Glow Roc on H4 & H5, DX Archangel / Glow Mako3 on H6, Halo Star IT on H7, Roadrunner / DX Archangel on H8.',
      '🔥 Jack’s Course Best: Tied his Sar-Ko-Par Personal Best 27 (Even Par) on 11/09 (nearly aced H1 for Birdie 2 + parked a 50ft Roach approach to 2ft on H7!) and 10/23!'
    ];
  } else if (normKey === 'smp_wooded') {
    courseVibe =
      'Technical 18-hole forest & elevation course inside Shawnee Mission Park (4,881 ft, Par 54) featuring tight oak/hickory tunnels (H2–H6, H15), downhill lasers (H10, H13), uphill climbs (H12, H16), and long low-ceiling bombers (H7, H9, H11, H18).';
    conditionsAndWindRecap = `Recap from 11/10 18-hole debut (${windBreakdownText}): Opened in dead-calm midday air beneath the woods canopy before a slight afternoon breeze picked up on the exposed downhill/open greens on H13 and H17.`;
    commentaryHighlights = [
      '🏆 11/10 18-Hole Debut: Jeffery 69 (+15 · Front 36 / Back 33 · 8 Par 3s ★ on H3, H5, H6, H12, H14, H15, H17 & 347ft H18—parring 5 of the final 7 holes!).',
      '👽 347ft H18 Closer Gem: Curved 172g Star Rollo right around the guardian tree, then parked 178g Pink DX Alien right under the basket ("Right there by the pin! I almost thought it was going in—beauty! Love the Alien!") for Par 3!',
      '🚀 Breakthrough Drivers & Mids: 171g Classic Glow Wraith ripped flat low drives on H7 & H9 ("Kept it down like I was supposed to, great flight!"), 176g Glow Mako3 piped a 277ft downhill laser on H13, 170g DX Archangel threaded H3 & H14, 180g Star Jay locked in H15 & H17, and 175g Star Sync shined as an "All-Star" approach disc!'
    ];
  } else if (normKey === 'artnine') {
    courseVibe =
      'Ultra-short, tightly wooded 9-hole finesse loop (1,031 ft, Par 27 · 84–146 ft holes) carved through Shawnee Mission Park’s forest tunnels where straight putters and touch midranges shine.';
    conditionsAndWindRecap = `Recap across ${courseRounds.length} rounds (${windBreakdownText}): Sheltered beneath the Shawnee Mission Park forest canopy, so wind rarely affects flight paths—clean release angle and tree-gap accuracy decide every hole.`;
    commentaryHighlights = [
      '🏆 Historic 11/08 Father-Son 24 (-3) Under-Par Tie! Jeffery shot 24 (-3, tying his 10/25 Course PB with 4 Birdies on H2, H5, H6 & H7) and Jack shot a BOGEY-FREE 24 (-3, his first-ever under-par round with 3 Birdies on H2, H3 & H8!).',
      '🎯 Double Birdie Magic: Jeffery & Jack carded matching Birdie 2s on H2 (11/08 w/ Halo IT & Buzzz SS) and H3 (10/25 w/ Star Rollo & Roach).',
      '🌲 Uphill H6 Lock: 176g Glow Mako3 has birdied the 116ft uphill 6th hole in back-to-back Art Nine visits (10/25 & 11/08).'
    ];
  } else if (normKey === 'prairie_pass') {
    courseVibe =
      'Fun "18-Hole Sar-Ko-Par" style Overland Park course at Pleasant Ridge Middle School (4,209 ft Standard Layout · Par 54 · UDisc Par Rating 160 · Global Avg E) mixing open prairie fairways, elevated mound & downhill greens (H11 & H16), and clean wooded tunnels with hanging tires (H7, H9, H12 & H14).';
    conditionsAndWindRecap = `Recap from 11/15 18-hole debut (${windBreakdownText}): Played in chilly autumn crosswinds and bright low winter sun on the Back 9—where Star Rollo, Roadrunner, Archangel, Wraith & XT Glow Nova powered career-best 18-hole scores for BOTH players!`;
    commentaryHighlights = [
      '🏆 11/15 DOUBLE ALL-TIME 18-HOLE PERSONAL BESTS! Jeffery shot 65 (+11 · Front 33 / Back 32 · 8 Par 3s ★ on H2, H3, H4, H8, H10, H12, H14 & H16—beating his 69 SMP Wooded PB by 4 strokes!) & Jack shot 71 (+17 · Front 36 / Back 35 · 3 Par 3s ★ on H3, H4 & H14, zero 6s/7s—crushing his 86 Prairie Center PB by 15 strokes!).',
      '😇 Shot of the Round (H8 · 202ft): Jeffery parked 170g DX Archangel exact pin-high 10 feet left ("Like an angel! You have to keep that one in the bag—permanent, keep this one!") and threaded 193ft wooded H12 for Par 3!',
      '🛑 Slope-Stopper Clinic (H11 & H16): 175g XT Glow Nova stopped dead on top of H11’s elevated thorn mound ("Stop at the top—perfect!") and held the steep downhill green on 270ft H16 after a dead-straight 171g Classic Glow Wraith drive for Par 3!'
    ];
  } else if (normKey === 'prairie_center' || courseName.toLowerCase().includes('prairie center')) {
    courseVibe =
      'Sprawling 18-hole Olathe championship park course (5,808 ft, Par 55) featuring long 250–365 ft tree-framed Par 3s, the 517-ft dogleg-left H12, and the 604-ft Par-4 H13 water hole—with more open recovery lanes than Cedar Ridge.';
    conditionsAndWindRecap = `Recap from 11/08 18-hole debut (${windBreakdownText}): Played in comfortable Sunday morning/afternoon air as Part 1 of a 27-hole father-son day before The Art Nine. Long open fairways rewarded flat GStar Roadrunner drives and low Star Sync / DX Alien approaches.`;
    commentaryHighlights = [
      '🏆 11/08 18-Hole Debut: Jeffery 77 (+22, 4 Par 3s ★ on H1 273ft, H5 254ft, H8 301ft & H16 235ft) & Jack 86 (+31, downhill Par 3 ★ on H11 & won 4 holes outright: H3, H11, H14 & H17!).',
      '🚀 Roadrunner & Alien Clinic: 169g GStar Roadrunner carried Jeffery’s best drives (H1, H5, H8, H13 & threading the tiny guardian-tree window on H9!), while 178g DX Alien parked low under branches on H7, H8 & H10 ("Alien’s great!").',
      '🆕 Wraith & Beast Course Debuts: Threw 168g Classic Glow Beast on H2/H7 and made the first-ever throw with 171g Classic Glow Wraith on the 517ft 12th hole.'
    ];
  } else if (normKey === 'mize') {
    courseVibe =
      'Long, open 9-hole hilltop course in Shawnee (2,616 ft, Par 27 · 218–389 ft holes) with elevation changes, road/fence OB lines, and wide fairways built for Speed 9–11 distance drivers.';
    conditionsAndWindRecap = `Recap across ${courseRounds.length} rounds (${windBreakdownText}): Exposed hilltop fairways often catch breezy Kansas crosswinds and headwinds (including the 10/28 New Disc Field Test), making Roadrunner, Mamba, and Star Jay key performers.`;
    commentaryHighlights = [
      '🏆 Course Personal Bests: Jeffery 29 (+2 on 10/23 & 10/25, highlighted by a legendary 150-foot Glow Mako3 throw-in Birdie 2 on H4!) & Jack 35 (+8 on 10/26).',
      '🧪 Home of the 9-Disc & New Driver Field Tests (10/23 & 10/28): 168g GStar Roadrunner won #1 max distance (+20ft farthest & skipped 2ft from H5’s basket for Birdie 2!), and 172g Star Rollo won #1 midrange S-curve.',
      '🎯 Key Scoring Holes: H1 (218ft), H5 (235ft Roadrunner skip lane), and H9 (229ft uphill finish).'
    ];
  } else if (normKey === 'blackhoof') {
    courseVibe =
      'Scenic 9-hole course at Black Hoof Park in Lenexa (1,712 ft, Par 27) split between open grassy meadow holes (H1–H4) and tight wooded creek-side tunnels (H5–H9).';
    conditionsAndWindRecap = `Recap across ${courseRounds.length} rounds (${windBreakdownText}): Played in dead-calm twilight (10/20 Even-Par 27!) and breezy afternoon crosswinds (11/01 30 / +3 after Cedar Ridge), where open meadow holes H1–H4 catch the breeze before entering the sheltered woods on H5–H8.`;
    commentaryHighlights = [
      '🏆 Course Personal Bests: Jeffery 27 (Even Par in 10/20 twilight round; plus 30 / +3 on 11/01 with 5 straight opening Pars!) & Jack 31 (+4 on 10/20).',
      '🎯 Meadow vs. Woods Gameplan: DX Archangel, Halo Star IT & KC Pro Aviar dominate the open H1–H4 stretch (40ft Aviar pan hit on H3 & near-throw-in on H2!), while Star Rollo (H5 right dogleg), Glow Mako3 (H7), and XT Glow Nova (H9 tomahawk over trees!) rule the woods.',
      '⚡ Jack’s Highlight: Carved a textbook S-curve with his yellow Discraft Cicada on H3 (11/01) and won H4 outright on 10/20 with a low skip to 3ft!'
    ];
  } else if (normKey === 'cedarridge') {
    courseVibe =
      'Heavily wooded, steep 18-hole championship gauntlet in Bonner Springs (5,344 ft, Par 58) with tight 20-ft timber corridors, swamp water on H4, and a 613-ft Par-4 16th hole.';
    conditionsAndWindRecap = `Recap from 11/01 18-hole trek (${windBreakdownText}): Dense forest canopy shields most fairways from wind, turning every hole into an angle-control and gap-hitting test ("Why aren’t the trees the baskets?!").`;
    commentaryHighlights = [
      '🏆 11/01 18-Hole Benchmark: Jeffery 86 (+28, 3 Pars on H12 138ft, H14 258ft & the 613ft Par-4 H16!) & Jack 92 (+34, clean Par 3 on H13 & won 5 hole skins!).',
      '🧪 Post-H16 5-Driver Field Test: Confirmed exact left-to-right stability spread—Champion Eagle (farthest left) → Roadrunner → Mamba → Leopard3 → DX Archangel (farthest distance & 20ft right).',
      '🛠️ Gear MVP: Telescoping Dynamic Discs Retriever rescued multiple discs from thorny brush and barbed-wire rough on H16!'
    ];
  } else if (courseName.toLowerCase().includes('california')) {
    courseVibe =
      'Long 9-hole school & park layout in Olathe (3,043 ft, Par 29) featuring 7 long Par 3s (227–352 ft) and back-to-back monster Par 4 closers on H8 (467 ft) and H9 (532 ft).';
    conditionsAndWindRecap = `Recap from 10/29 evening round (${windBreakdownText}): Calm autumn dusk air with migrating flocks overhead—ideal conditions for testing full-power Roadrunner, Mamba, and Star Jay drives.`;
    commentaryHighlights = [
      '🏆 10/29 Debut Round: Jeffery 34 (+5, 4 Pars on H1, H3, H5 & H7!) & Jack 45 (+16, highlighted by a stride-measured 47-foot bomb putt on the 532ft 9th hole!).',
      '🎯 Shot of the Day: Jeffery ripped a full-strength 180g Star Jay 2nd shot on the 336ft 5th hole to 4 feet shy of the pin for Par 3, and drained a ~35ft Star Sync putt on H7 after an early tree kick!',
      '🛸 Memorable Finale: Finished H9 at dusk Playing Higher/Lower yardage trivia and spotting a mysterious single-light helicopter/UFO in the sky!'
    ];
  } else if (normKey === 'harmon') {
    courseVibe =
      'Classic 9-hole park course in Prairie Village (2,135 ft, Par 27) with mature park trees, sloped roll-away greens (H3 & H6), a downhill roller lane on H7, and the water-tower finale on H9.';
    conditionsAndWindRecap = `Recap across ${courseRounds.length} rounds (${windBreakdownText}): Open park fairways with breezy crosswinds and fast, sloped greens where low-glide approach discs (Toro, Nova, Alien) prevent roll-aways.`;
    commentaryHighlights = [
      '🏆 Course Personal Bests: Jeffery 29 (+2) & Jack 35 (+8), highlighted by Double Birdie 2s on the 168ft downhill 7th hole!',
      '🛑 Sloped Green Rule: H3 and H6 feature steep greens behind the pin—always approach with Star Toro or XT Glow Nova so it drops and stops.'
    ];
  } else {
    commentaryHighlights = [
      `Logged ${courseRounds.length} ${courseRounds.length === 1 ? 'round' : 'rounds'} at ${courseName} (${holesCount} holes · Par ${par} · ${totalFeet.toLocaleString()} ft).`,
      `Jeffery has recorded ${jeffBirdiesHere} Birdies and ${jeffParsHere} Pars here; Jack has recorded ${jackBirdiesHere} Birdies and ${jackParsHere} Pars.`
    ];
  }

  const jeffSummaryText =
    jeffPB.bestTotal !== null
      ? `Jeffery PB: ${jeffPB.bestTotal} (${formatRelativePar(jeffPB.bestRelPar || 0)}) · Avg ${jeffPB.avgTotal} (${jeffBirdiesHere} Birdies, ${jeffParsHere} Pars)`
      : 'No Jeffery scores logged yet';
  const jackSummaryText =
    jackPB.bestTotal !== null
      ? `Jack PB: ${jackPB.bestTotal} (${formatRelativePar(jackPB.bestRelPar || 0)}) · Avg ${jackPB.avgTotal} (${jackBirdiesHere} Birdies, ${jackParsHere} Pars)`
      : 'Solo rounds only so far';

  return {
    courseName,
    roundsPlayed: courseRounds.length,
    holesCount,
    par,
    totalFeet,
    courseVibe,
    scoringOverview: `${jeffSummaryText}  |  ${jackSummaryText}`,
    conditionsAndWindRecap,
    commentaryHighlights,
    bestScoringHoles,
    toughestHoles,
    topGoToDiscs
  };
}

export function buildCleanNotesStarterHeader(params: {
  courseName: string;
  date: string;
  windCondition?: CaddieScenario;
  holes: HoleData[];
  players: { id: string; name: string; tag?: string }[];
}): string {
  const { courseName, date, holes, players } = params;
  const totalPar = holes.reduce((acc, h) => acc + h.par, 0);
  const totalDist = holes.reduce((acc, h) => acc + h.distance, 0);
  const playerNames = players.map((p) => p.name).join(' & ');
  const nowTime = new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });

  return `🎙️ ${courseName} (${holes.length} Holes · Par ${totalPar} · ${totalDist.toLocaleString()} ft)
Date: ${date} · ${nowTime}
Players: ${playerNames}

`;
}

export function buildNotebookGeminiDossier(params: {
  courseName: string;
  date: string;
  windCondition: CaddieScenario;
  duration: string;
  holes: HoleData[];
  players: { id: string; name: string; tag?: string }[];
  roundTranscript?: string;
  bag: DiscItem[];
}): string {
  const {
    courseName,
    date,
    windCondition,
    duration,
    holes,
    players,
    roundTranscript
  } = params;

  const hasAnyScore = holes.some((h) => players.some((p) => (h.scores[p.id] || 0) > 0));
  const hasAnyTranscript =
    Boolean(roundTranscript && roundTranscript.trim().length > 0) ||
    holes.some((h) => Boolean(h.voiceTranscript && h.voiceTranscript.trim().length > 0));

  // If copying at the start of a round (before scores or voice transcript are entered),
  // return ONLY the clean, minimal starter header for iPhone Notes!
  if (!hasAnyScore && !hasAnyTranscript) {
    return buildCleanNotesStarterHeader({
      courseName,
      date,
      windCondition,
      holes,
      players
    });
  }

  const totalPar = holes.reduce((acc, h) => acc + h.par, 0);
  const totalDist = holes.reduce((acc, h) => acc + h.distance, 0);

  const playerSummaries = players
    .map((p) => {
      const strokes = holes.reduce((s, h) => s + (h.scores[p.id] || h.par), 0);
      const diff = strokes - totalPar;
      return `- **${p.name} (${p.tag || p.id})**: ${strokes} throws (${formatRelativePar(diff)})`;
    })
    .join('\n');

  const holeLines = holes
    .map((h) => {
      const scoreParts = players
        .map((p) => {
          const sc = h.scores[p.id] || 0;
          const meta = h.meta?.[p.id];
          const extras: string[] = [];
          if (meta?.discUsed) extras.push(`Disc: ${meta.discUsed}`);
          if (meta?.fairwayHit) extras.push('Fairway Hit');
          if (meta?.puttDistance) extras.push(`${meta.puttDistance} Make`);
          if (meta?.obStrokes) extras.push(`OB +${meta.obStrokes}`);
          if (meta?.voiceNote) extras.push(`Note: "${meta.voiceNote}"`);
          return `${p.name}: ${sc > 0 ? sc : 'Unscored'}${
            extras.length > 0 ? ` [${extras.join(', ')}]` : ''
          }`;
        })
        .join(' | ');

      const holeVoice = h.voiceTranscript
        ? `\n  - **Notes**: "${h.voiceTranscript}"`
        : '';

      return `- **Hole #${h.number}** (${h.distance} ft, Par ${h.par}): ${scoreParts}${holeVoice}`;
    })
    .join('\n');

  return `# ${courseName.toUpperCase()} — ROUND SUMMARY & SCORECARD
- **Course**: ${courseName} (${holes.length} Holes · Par ${totalPar} · ${totalDist.toLocaleString()} ft)
- **Date**: ${date} | **Duration**: ${duration}

## Final Standings
${playerSummaries}

## Hole-by-Hole Scorecard
${holeLines}${
    roundTranscript && roundTranscript.trim().length > 0
      ? `\n\n## Round Voice Notes\n${roundTranscript.trim()}\n`
      : '\n'
  }`;
}

export interface DiscTelemetryRow {
  disc: DiscItem;
  totalHolesUsed: number;
  teeAndFairwayThrows: number;
  puttAndApproachThrows: number;
  birdies: number;
  pars: number;
  bogeysOrWorse: number;
  birdieRate: number;
  parOrBetterRate: number;
  avgRelPar: number | null;
  topCourse: string;
  lastUsedDate: string | null;
  commentaryVerdict: string;
}

export interface DiscBagTelemetrySummary {
  favorites: DiscTelemetryRow[];
  mostUsed: DiscTelemetryRow[];
  leastFavorite: DiscTelemetryRow[];
  leastThrown: DiscTelemetryRow[];
  allRows: DiscTelemetryRow[];
}

const DISC_COMMENTARY_VERDICTS: Record<string, string> = {
  'innova-roc3':
    '🏆 #1 Birdie-Rate Midrange! Money right-to-left hyzer finish on Sar-Ko H4/H5/H7 & Art Nine H5—including 11/13 H4 Birdie 2 while dialing the straight pull-through tee-kettle low cue!',
  'innova-halloween-sync':
    '🎃 Brand-New Halloween Edition Hot Pink Star Sync [3|3|0|1] — 2/2 Pars (0.00 avg!) in its 11/23 Black Hoof debut (threaded H13 trees grazing basket top + drained H10 Par)!',
  'innova-hot-pink-archangel':
    '🪽 Brand-New Hot Pink DX Archangel [8|6|-4|1] — BACK IN THE BAG on 11/23 Black Hoof H2! Succeeds your vaulted 8-Birdie Royal Blue Archangel!',
  'innova-sync':
    '📦 Backup Vault All-Star (131H, 27 Birdies · Replaced 11/23 by Halloween Star Sync)! SMACKED THE BASKET on Sar-Ko H1 (11/16), parked SMP Wooded H5 to 3ft, & birdied Art Nine H7!',
  'innova-kc-pro-aviar':
    '🏆 #1 Go-To Chain Putter (64% Par+, 30 Birdies)! Powered both 6-hole birdie streaks (11/05 & 11/09), 11/16 H3 Par save, & 20+ ft heavy-wind floater Par on Sar-Ko H7 (11/11).',
  'innova-archangel':
    '📦 Backup Vault Legend (39H, 8 Birdies, 77% Par+ · Replaced 11/23 by Hot Pink Archangel)! Parked Prairie Pass H8 pin-high 10ft left ("Like an angel! Permanent, keep this one!") & Sar-Ko H7/H8 Birdies!',
  'innova-it':
    '⭐ Pinpoint Fairway Favorite! Striped a dead-flat heavy-wind ace-run Birdie 2 on Sar-Ko H3 (11/11), 1ft park on H3 (11/05), 5ft past H7 (11/09) & SMP Wooded H6/H17 Pars.',
  'innova-mako3':
    '⭐ #1 Dead-Straight Midrange Workhorse! Bombed ~192ft on Prairie Pass H3 for Par 3 (11/15), 277ft flat downhill laser on SMP Wooded H13 & 12 Birdies.',
  'innova-rollo':
    '⭐ #1 Right-Turn & Uphill Weapon! Parked 208ft SMP Wooded H5 right under basket for Birdie 2 (11/17!), climbed 338ft H16 to 5ft, + Prairie Pass H2/H10 Pars & 6× Sar-Ko H9 Birdies!',
  'innova-roadrunner':
    '🔥 #1 Distance & Pin-High Workhorse! Parked 192ft Sar-Ko H2 3ft left (11/16), threaded SMP Wooded H3 <5ft (11/17), & striped 200ft Prairie Pass H4!',
  'innova-mamba':
    '⚡ Most Thrown Distance Driver off the Tee — bombs 300+ ft open fairways, but easily overpowers <180ft woods holes into trees.',
  'innova-jay':
    '⭐ Clutch Back-9 Midrange! Locked in Par 3s on SMP Wooded H15 (10ft glide loop) & H17 headwind ("It was perfect!"), plus Cal Trail H5 4ft park.',
  'innova-xt-glow-nova':
    '🏆 #1 Clutch Approach, Scramble & Slope Stopper! Went 11-for-11 on Black Hoof approaches (11/23 65 PB tie: stuck H1, H5 5ft, H8, H9, H15 & H18 Pars!) + drained ~18ft downhill Sar-Ko H9 Birdie!',
  'innova-toro':
    '⚠️ Pulled from Physical Bag before 11/15 Prairie Pass — dumps hard left (+3 fade) if thrown like a normal mid.',
  'innova-champion-eagle':
    '⭐ Breakout Cotton Candy Fairway [7|4|-1|3]! Parked Sar-Ko H8 5–7ft under the pin for Birdie 2 (11/16 bogey-free 24 / -3!), plus clean H8/H4 Pars & left skips.',
  'innova-dx-alien':
    '⭐ Low-Skip Birdie & Approach Laser! Set up Art Nine H6 20ft Birdie (11/17), skipped pin-high on Sar-Ko H5 for Birdie 2 (11/16), & fired 150ft Prairie Pass H13 laser!',
  'innova-classic-glow-roc':
    '⭐ Straight Tunnel & Wind Midrange! Walk-off downhill Birdie 2 on Art Nine H9 to seal 16-min Even Par (11/17!), plus Sar-Ko H4 & H5 Birdie 2s!',
  'innova-classic-glow-beast':
    '⚠️ Pulled from Physical Bag before 11/15 Prairie Pass — pulled left on SMP Wooded H11 ("Not sure I like the Beast all that much").',
  'innova-classic-glow-wraith':
    '🚀 Breakthrough Low-Ceiling 11-Speed Bomber! Crushed H7/H8/H9 & found-on-H18 straight bomb at SMP Wooded (11/17), plus downhill Prairie Pass H16 Par!',
  'innova-aviar':
    '📦 Archived Vault (36 holes, 5 Birdies) — trusty beadless Star putter before KC Pro Aviar took over primary putting duties.',
  'innova-pig':
    '📦 Archived Vault (26 holes, 73% Par+, +0.04 avg) — great thumbtrack hill-stopper before being retired for Star Toro & DX Alien.',
  'innova-leopard3':
    '📦 Archived / Lost on Sar-Ko H1 (15 holes, 7% Birdies, +0.53 avg) — replaced by Halo Star IT & Roadrunner.',
  'innova-firebird':
    '📦 Archived / Lost on Mize H1 (15 holes, 40% Birdies) — early headwind/skip workhorse before being lost in heavy rough.',
  'innova-proto-glow-aviar':
    '🍬 Cotton Candy Debut 11/23! First throws on Black Hoof Championship (65 PB tie!) H2, H6, H11 & H14 ("Color Aviar") — 16 of 17 active discs now logged!',
  'innova-yeti-pro-aviar':
    '🏆 Breakout Cotton Candy Putter [2|3|0|1]! Powered 11/22 BOGEY-FREE 24 (-3) Art Nine PB tie (H5 tree-bending Birdie 2!) + sealed 11/23 Black Hoof H17 Birdie!',
  'innova-sugar-glow-roc':
    '🏆 Breakout Cotton Candy Midrange [4|4|0|3]! 11/23 Black Hoof H9 Double Par (65 PB tie!) + 4 Pars on 11/22 SMP Wooded (H6, 15ft H10, H14, H17)!',
  'innova-proto-glow-mako3':
    '🏆 Breakout Cotton Candy Woods Laser [5|5|0|0]! Art Nine H3 Birdie + H9 chain-out for 23 (11/22), SMP H15 Par, & Black Hoof H8 Double Par (11/23 65 PB tie)!',
  'innova-sugar-star-rollo':
    '🏆 11/23 BLACK HOOF MVP [5|6|-4|1]!! Flipped up on H17 for 1st Cotton Candy Birdie 2 ("IT DID IT!! Rollo is my disc!") + 237ft+ H15 bomb & 4 Pars in 65 PB tie!',
  'innova-glow-leopard3':
    '🍬 Cotton Candy Color Glow Fairway [7|5|-2|1] — Unlocked hip-rotation skip carries ("belly button at target!") on 11/23 Black Hoof Championship H3 & H6!',
  'innova-glow-teebird':
    '🏆 Breakout Cotton Candy Fairway [7|5|0|2]! Striped a snake S-glide on 315ft Black Hoof H5 for Monster Par 3 (11/23 65 PB tie!) + SMP Wooded H1 wind opener!',
  'innova-sugar-star-roadrunner':
    '⭐ Cotton Candy Hot Pink Star [9|5|-4|1] — Twisted hips down 382ft Black Hoof H7 for proud Bogey 4 (11/23 65 PB tie!) + SMP Wooded H13 debut!',
  'innova-luster-firebird':
    '⭐ Cotton Candy Headwind & Skip Debut [9|3|0|4]! Locked in Par 3 on 11/22 SMP Wooded H8 paired w/ Pink DX Alien!',
  'innova-halo-wraith':
    '🚀 Cotton Candy Two-Tone Halo Bomber [11|5|-1|3] — Debuted off the tee on 11/22 SMP Wooded H7 & closing H18 (71 / +17 — 7 strokes better than 11/17)!',
  'innova-halo-destroyer':
    '🍬 Arrived 11/18! Cotton Candy In-Hand Main Bag [12|5|-1|3] — Flagship Speed 12 Neon Chartreuse Halo Destroyer for max-distance open bombers & stiff headwinds!',
  'discraft-roach':
    '🏆 Jack’s #1 Go-To Putter & Ace-Run Laser! Drained the 47-ft Cal Trail putt, 3 Birdies in his bogey-free 24 (-3) Art Nine PB, and H1 near-ace Birdie on 11/09.',
  'discraft-buzzz-ss':
    '⭐ Jack’s Dead-Straight Tunnel Workhorse! Parked Art Nine H2 for Double Birdie 2 and splits tight wooded gaps on Sar-Ko H8 & Black Hoof.',
  'discraft-cicada':
    '🚀 Jack’s High-Glide Fairway Bomber! Powers Jack’s gorgeous natural S-curve drives on 230–350+ ft holes at Prairie Center, Cedar Ridge & Mize.'
};

export type BagGroupingFilter =
  | 'jeffery'
  | 'jack'
  | 'all'
  | 'archived'
  | 'jeffery_all';

export function computeDiscBagTelemetry(
  history: HistoricalRound[],
  bag: DiscItem[],
  groupingFilter: BagGroupingFilter = 'jeffery_all'
): DiscBagTelemetrySummary {
  const shortenCourse = (cName: string) => {
    if (cName.includes('Shawnee Mission Wooded')) return 'SMP Wooded';
    if (cName.includes('Sar-Ko-Par')) return 'Sar-Ko-Par';
    if (cName.includes('Harmon')) return 'Harmon';
    if (cName.includes('Black Hoof')) return 'Black Hoof';
    if (cName.includes('Cedar Ridge')) return 'Cedar Ridge';
    if (cName.includes('Mize')) return 'Mize';
    if (cName.includes('Art Nine')) return 'Art Nine';
    if (cName.includes('Prairie Pass') || cName.includes('Blue Valley')) return 'Prairie Pass';
    if (cName.includes('Prairie Center')) return 'Prairie Ctr';
    if (cName.includes('California Trail')) return 'Cal Trail';
    if (cName.includes('Wyandotte')) return 'Wyandotte';
    return cName;
  };

  const candidateDiscs = bag.filter((d) => {
    if (d.id.endsWith('-alt')) return false;
    const dOwner = d.ownerId || 'jeffery';
    if (groupingFilter === 'jeffery') {
      return dOwner === 'jeffery' && !d.archived;
    }
    if (groupingFilter === 'jack') {
      return dOwner === 'jack' && !d.archived;
    }
    if (groupingFilter === 'all') {
      return !d.archived;
    }
    if (groupingFilter === 'archived') {
      return Boolean(d.archived);
    }
    // 'jeffery_all' -> All Jeffery Career (Cotton Candy Main Bag + Backup / Vault)
    return dOwner === 'jeffery';
  });

  const allRows: DiscTelemetryRow[] = candidateDiscs.map((d) => {
    const rowOwner: 'jeffery' | 'jack' = d.ownerId === 'jack' ? 'jack' : 'jeffery';
    let totalHolesUsed = 0;
    let teeAndFairwayThrows = 0;
    let puttAndApproachThrows = 0;
    let birdies = 0;
    let pars = 0;
    let bogeysOrWorse = 0;
    let totalRelPar = 0;
    let scoredHoles = 0;
    let lastUsedDate: string | null = null;
    const courseCounts = new Map<string, number>();

    for (const r of history) {
      for (const h of r.holes) {
        const m = h.meta?.[rowOwner];
        const uName = (m?.discUsed || '').toLowerCase();
        const dName = d.name.toLowerCase();
        const matchesUsedName =
          Boolean(uName) &&
          ((uName === dName &&
            !(
              (d.id === 'innova-proto-glow-mako3' ||
                d.id === 'innova-sugar-star-rollo' ||
                d.id === 'innova-sugar-star-roadrunner' ||
                d.id === 'innova-sugar-glow-roc' ||
                d.id === 'innova-glow-leopard3' ||
                d.id === 'innova-glow-teebird' ||
                d.id === 'innova-luster-firebird' ||
                d.id === 'innova-halo-wraith' ||
                d.id === 'innova-halo-destroyer' ||
                d.id === 'innova-proto-glow-aviar' ||
                d.id === 'innova-yeti-pro-aviar') &&
              r.date < '2026-11-18'
            ) &&
            !(
              (d.id === 'innova-halloween-sync' || d.id === 'innova-hot-pink-archangel') &&
              r.date < '2026-11-23'
            ) &&
            !(
              (d.id === 'innova-sync' || d.id === 'innova-archangel') &&
              r.date >= '2026-11-23'
            )) ||
            (uName === 'sync' && d.id === 'innova-halloween-sync' && r.date >= '2026-11-23') ||
            (uName === 'archangel' && d.id === 'innova-hot-pink-archangel' && r.date >= '2026-11-23') ||
            (uName === 'it' && d.id === 'innova-it') ||
            (uName === 'halo it' && d.id === 'innova-it') ||
            (uName === 'xero' && d.id === 'innova-sync' && r.date < '2026-11-23') ||
            (uName === 'pig' && d.id === 'innova-pig') ||
            (uName === 'buzzz' && d.id === 'discraft-buzzz-ss'));

        const inThrows = m?.throws?.some((t) => t.discId === d.id) || false;
        const isTeeOrFairway =
          m?.throws?.some(
            (t) =>
              (t.shotType === 'tee' || t.shotType === 'fairway') &&
              t.discId === d.id
          ) ||
          m?.thrownDiscId === d.id ||
          matchesUsedName;
        const isPuttOrApproach =
          m?.throws?.some(
            (t) =>
              (t.shotType === 'putt' || t.shotType === 'approach') &&
              t.discId === d.id
          ) || false;

        const text = [h.voiceTranscript, m?.voiceNote, m?.notes]
          .filter(Boolean)
          .join(' ');
        const inText = text ? doesCommentaryMentionDisc(d, text, r.date) : false;

        if (inThrows || isTeeOrFairway || inText) {
          totalHolesUsed++;
          if (isTeeOrFairway) {
            teeAndFairwayThrows++;
          } else if (
            isPuttOrApproach ||
            d.type === 'Putter' ||
            d.slotCategory.toLowerCase().includes('approach')
          ) {
            puttAndApproachThrows++;
          } else {
            teeAndFairwayThrows++;
          }

          if (!lastUsedDate || r.date > lastUsedDate) {
            lastUsedDate = r.date;
          }

          const cShort = shortenCourse(r.courseName);
          courseCounts.set(cShort, (courseCounts.get(cShort) || 0) + 1);

          const sc = h.scores?.[rowOwner] || 0;
          if (sc > 0) {
            scoredHoles++;
            totalRelPar += sc - h.par;
            if (sc < h.par) birdies++;
            else if (sc === h.par) pars++;
            else bogeysOrWorse++;
          }
        }
      }
    }

    const avgRelPar =
      scoredHoles > 0 ? Number((totalRelPar / scoredHoles).toFixed(2)) : null;
    const birdieRate =
      scoredHoles > 0 ? Math.round((birdies / scoredHoles) * 100) : 0;
    const parOrBetterRate =
      scoredHoles > 0 ? Math.round(((birdies + pars) / scoredHoles) * 100) : 0;

    const topCourseEntry = Array.from(courseCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const topCourse = topCourseEntry
      ? `${topCourseEntry[0]} (${topCourseEntry[1]}×)`
      : '—';

    return {
      disc: d,
      totalHolesUsed,
      teeAndFairwayThrows,
      puttAndApproachThrows,
      birdies,
      pars,
      bogeysOrWorse,
      birdieRate,
      parOrBetterRate,
      avgRelPar,
      topCourse,
      lastUsedDate,
      commentaryVerdict:
        DISC_COMMENTARY_VERDICTS[d.id] ||
        d.personalFlightNotes ||
        d.caddieRoleNote ||
        'Active bag disc.'
    };
  });

  const thrownRows = allRows.filter((r) => r.totalHolesUsed > 0);
  const unthrownRows = allRows.filter((r) => r.totalHolesUsed === 0);

  // 1. Most Used: Strictly within the active Collector Card Grouping
  const mostUsed = [...allRows]
    .sort(
      (a, b) =>
        b.totalHolesUsed - a.totalHolesUsed ||
        b.teeAndFairwayThrows - a.teeAndFairwayThrows ||
        b.birdies - a.birdies
    )
    .slice(0, 6);

  // 2. My Favorites: Strictly within the active Collector Card Grouping!
  const favoritePriorityOrder = [
    'innova-roc3',
    'innova-halloween-sync',
    'innova-sync',
    'innova-kc-pro-aviar',
    'innova-sugar-star-rollo',
    'innova-sugar-glow-roc',
    'innova-xt-glow-nova',
    'innova-champion-eagle',
    'innova-mako3',
    'innova-it',
    'innova-roadrunner',
    'innova-archangel',
    'innova-rollo',
    'innova-dx-alien',
    'innova-proto-glow-mako3',
    'innova-jay',
    'innova-classic-glow-roc',
    'innova-classic-glow-wraith',
    'discraft-roach',
    'discraft-buzzz-ss',
    'discraft-cicada',
    'innova-hot-pink-archangel',
    'innova-sugar-star-roadrunner',
    'innova-glow-teebird',
    'innova-glow-leopard3',
    'innova-yeti-pro-aviar',
    'innova-proto-glow-aviar',
    'innova-luster-firebird',
    'innova-halo-wraith',
    'innova-halo-destroyer'
  ];

  const toughCommentaryOrder = [
    'innova-classic-glow-beast',
    'innova-toro',
    'innova-leopard3',
    'innova-mamba',
    'innova-firebird'
  ];

  const pureToughOnlyIds = new Set([
    'innova-classic-glow-beast',
    'innova-toro',
    'innova-leopard3'
  ]);

  // Clutch approach/scramble stoppers & primary putters get thrown mostly after tough tee shots
  // (recovery/save bias) — never unfairly brand them "Least Favorite / Toughest"!
  const protectedApproachAndPutterIds = new Set([
    'innova-xt-glow-nova',
    'innova-kc-pro-aviar',
    'innova-yeti-pro-aviar',
    'innova-halloween-sync',
    'innova-sync',
    'innova-dx-alien'
  ]);

  const thrownFavoriteCandidates = thrownRows.filter(
    (r) => !pureToughOnlyIds.has(r.disc.id) || thrownRows.length <= 2
  );

  const sortedThrownFavorites = [...thrownFavoriteCandidates].sort((a, b) => {
    const idxA = favoritePriorityOrder.indexOf(a.disc.id);
    const idxB = favoritePriorityOrder.indexOf(b.disc.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return (
      (a.avgRelPar ?? 99) - (b.avgRelPar ?? 99) ||
      b.birdieRate - a.birdieRate ||
      b.totalHolesUsed - a.totalHolesUsed
    );
  });

  const sortedUnthrownFavorites = [...unthrownRows].sort((a, b) => {
    const idxA = favoritePriorityOrder.indexOf(a.disc.id);
    const idxB = favoritePriorityOrder.indexOf(b.disc.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.disc.speed - b.disc.speed;
  });

  const favorites = [...sortedThrownFavorites, ...sortedUnthrownFavorites].slice(0, 6);

  // 3. Least Thrown: Strictly within the active Collector Card Grouping
  const leastThrown = [...allRows]
    .sort(
      (a, b) =>
        a.totalHolesUsed - b.totalHolesUsed ||
        a.teeAndFairwayThrows - b.teeAndFairwayThrows
    )
    .slice(0, 6);

  // 4. Worst Favorites / Toughest: Strictly within the active Collector Card Grouping!
  // Never contradict My Favorites, and never penalize clutch scramble/approach stoppers (like XT Glow Nova)
  // for saving bogeys after tough tee shots.
  const favoriteIdsInGroup = new Set(favorites.map((r) => r.disc.id));
  const multiHoleThrownRows = thrownRows.filter((r) => r.totalHolesUsed >= 2);
  const baseWorstSource = multiHoleThrownRows.length >= 3 ? multiHoleThrownRows : thrownRows;
  const strictWorstPool = baseWorstSource.filter(
    (r) =>
      !favoriteIdsInGroup.has(r.disc.id) &&
      !protectedApproachAndPutterIds.has(r.disc.id)
  );
  const relaxedWorstPool = baseWorstSource.filter(
    (r) => !protectedApproachAndPutterIds.has(r.disc.id)
  );
  const topFavoriteIdInGroup =
    thrownRows.length > 1 ? sortedThrownFavorites[0]?.disc.id : null;
  const fallbackWorstPool = thrownRows.filter(
    (r) => r.disc.id !== topFavoriteIdInGroup && r.disc.id !== 'innova-xt-glow-nova'
  );
  const effectiveWorstPool =
    strictWorstPool.length >= 3
      ? strictWorstPool
      : relaxedWorstPool.length > 0
      ? relaxedWorstPool
      : fallbackWorstPool.length > 0
      ? fallbackWorstPool
      : thrownRows;

  const leastFavorite = [...effectiveWorstPool]
    .sort((a, b) => {
      const toughIdxA = toughCommentaryOrder.indexOf(a.disc.id);
      const toughIdxB = toughCommentaryOrder.indexOf(b.disc.id);
      const isToughA = toughIdxA !== -1 && (a.avgRelPar ?? 0) >= 0.2;
      const isToughB = toughIdxB !== -1 && (b.avgRelPar ?? 0) >= 0.2;
      if (isToughA && isToughB) return toughIdxA - toughIdxB;
      if (isToughA) return -1;
      if (isToughB) return 1;
      return (
        (b.avgRelPar ?? -99) - (a.avgRelPar ?? -99) ||
        a.parOrBetterRate - b.parOrBetterRate ||
        a.birdieRate - b.birdieRate
      );
    })
    .slice(0, 6);

  return {
    favorites,
    mostUsed,
    leastFavorite,
    leastThrown,
    allRows: [...allRows].sort(
      (a, b) =>
        Number(Boolean(a.disc.archived)) - Number(Boolean(b.disc.archived)) ||
        b.totalHolesUsed - a.totalHolesUsed
    )
  };
}

// ============================================================================
// INTERACTIVE RHBH SHOT FINDER (DISTANCE + LEFT / STRAIGHT / RIGHT CADDIE)
// ============================================================================
export type RhbhShotShape =
  | 'hard_left'
  | 'gentle_left'
  | 'straight'
  | 'gentle_right'
  | 'hard_right';

export type RhbhTerrain = 'open' | 'low_ceiling' | 'uphill' | 'downhill';

export interface RhbhShotQuery {
  distanceFeet: number;
  shape: RhbhShotShape;
  wind?: CaddieScenario;
  terrain?: RhbhTerrain;
}

export interface RhbhShotRecommendation {
  disc: DiscItem;
  rank: 1 | 2 | 3;
  matchScore: number;
  releaseAngle: 'hyzer' | 'flat' | 'anhyzer';
  releaseLabel: string;
  powerPct: number;
  powerLabel: string;
  estCarryFeet: number;
  aimCue: string;
  whyBadge: string;
  coachingNote: string;
}

export interface RhbhShotFinderResult {
  query: Required<RhbhShotQuery>;
  effectiveDistanceFeet: number;
  topPick: RhbhShotRecommendation | null;
  alternatives: RhbhShotRecommendation[];
  allRanked: RhbhShotRecommendation[];
  shapeSummary: string;
}

/**
 * Parses a natural-language voice or text shot phrase like:
 *   "180 feet go left", "140 right uphill", "260 straight headwind", "95 downhill left"
 */
export function parseRhbhShotQuery(
  rawText: string,
  current: Required<RhbhShotQuery>
): { next: Required<RhbhShotQuery>; matchedFields: string[] } {
  const lower = rawText.toLowerCase().trim();
  const next: Required<RhbhShotQuery> = { ...current };
  const matchedFields: string[] = [];

  // 1. Distance extraction (supports "185", "185 feet", "185ft", "185'", "two hundred")
  const numMatch = lower.match(/\b(\d{2,3})\s*(?:ft|feet|foot|'|yards?)?\b/);
  if (numMatch) {
    const parsed = parseInt(numMatch[1], 10);
    if (!Number.isNaN(parsed) && parsed >= 25 && parsed <= 600) {
      next.distanceFeet = Math.max(30, Math.min(450, parsed));
      matchedFields.push(`${next.distanceFeet} ft`);
    }
  } else if (/\b(hundred and fifty|150)\b/.test(lower)) {
    next.distanceFeet = 150;
    matchedFields.push('150 ft');
  } else if (/\b(two hundred|200)\b/.test(lower)) {
    next.distanceFeet = 200;
    matchedFields.push('200 ft');
  } else if (/\b(two fifty|250)\b/.test(lower)) {
    next.distanceFeet = 250;
    matchedFields.push('250 ft');
  } else if (/\b(three hundred|300)\b/.test(lower)) {
    next.distanceFeet = 300;
    matchedFields.push('300 ft');
  } else if (/\b(hundred|100)\b/.test(lower)) {
    next.distanceFeet = 100;
    matchedFields.push('100 ft');
  }

  // 2. Shot shape extraction (RHBH)
  if (
    /\b(hard\s+left|sharp\s+left|big\s+left|hook\s+left|dogleg\s+left|spike\s+hyzer|hard\s+hyzer|skip\s+left|way\s+left)\b/.test(
      lower
    )
  ) {
    next.shape = 'hard_left';
    matchedFields.push('Hard Left');
  } else if (
    /\b(slight\s+left|gentle\s+left|little\s+left|soft\s+left|bit\s+left|fade\s+left|finish\s+left)\b/.test(
      lower
    )
  ) {
    next.shape = 'gentle_left';
    matchedFields.push('Gentle Left');
  } else if (/\b(left|hyzer|hook)\b/.test(lower)) {
    next.shape = 'hard_left';
    matchedFields.push('Go Left');
  } else if (
    /\b(hard\s+right|sharp\s+right|big\s+right|dogleg\s+right|turnover|turn\s+right|anhyzer|way\s+right|bend\s+right|curve\s+right)\b/.test(
      lower
    )
  ) {
    next.shape = 'hard_right';
    matchedFields.push('Go Right');
  } else if (
    /\b(slight\s+right|gentle\s+right|little\s+right|soft\s+right|bit\s+right|drift\s+right|s[- ]?curve)\b/.test(
      lower
    )
  ) {
    next.shape = 'gentle_right';
    matchedFields.push('Gentle Right');
  } else if (/\b(right)\b/.test(lower)) {
    next.shape = 'hard_right';
    matchedFields.push('Go Right');
  } else if (
    /\b(dead\s+straight|straight|tunnel|laser|flat|narrow|gap|center)\b/.test(lower)
  ) {
    next.shape = 'straight';
    matchedFields.push('Dead Straight');
  }

  // 3. Wind extraction
  if (/\b(head\s*wind|into\s+the\s+wind|windy|gusty)\b/.test(lower)) {
    next.wind = 'headwind';
    matchedFields.push('Headwind');
  } else if (/\b(tail\s*wind|with\s+the\s+wind|wind\s+at\s+my\s+back)\b/.test(lower)) {
    next.wind = 'tailwind';
    matchedFields.push('Tailwind');
  } else if (/\b(cross\s*wind|left\s+to\s+right)\b/.test(lower)) {
    next.wind = 'cross_lr';
    matchedFields.push('Crosswind');
  } else if (/\b(calm|no\s+wind|still)\b/.test(lower)) {
    next.wind = 'calm';
    matchedFields.push('Calm');
  }

  // 4. Terrain / ceiling extraction
  if (/\b(up\s*hill|steep|climb|elevated)\b/.test(lower)) {
    next.terrain = 'uphill';
    matchedFields.push('Uphill');
  } else if (/\b(down\s*hill|slope|mound|roll\s*away|stop\s+dead)\b/.test(lower)) {
    next.terrain = 'downhill';
    matchedFields.push('Downhill');
  } else if (/\b(low\s+ceiling|low\s+branch|branches|woods|wooded|trees|canopy|skip)\b/.test(lower)) {
    next.terrain = 'low_ceiling';
    matchedFields.push('Low Ceiling');
  } else if (/\b(open|wide\s+open|meadow|field)\b/.test(lower)) {
    next.terrain = 'open';
    matchedFields.push('Open');
  }

  return { next, matchedFields };
}

/**
 * Computes RHBH-calibrated Top-3 disc recommendations from Jeffery's active bag
 * given exact distance to the pin, desired Left / Straight / Right shot shape,
 * wind condition, and terrain/ceiling modifier.
 */
export function recommendRhbhShotDiscs(
  queryInput: RhbhShotQuery,
  bag: DiscItem[]
): RhbhShotFinderResult {
  const query: Required<RhbhShotQuery> = {
    distanceFeet: Math.max(30, Math.min(450, Math.round(queryInput.distanceFeet))),
    shape: queryInput.shape,
    wind: queryInput.wind || 'calm',
    terrain: queryInput.terrain || 'open'
  };

  const activeJeffery = bag.filter((d) => !d.archived && d.ownerId !== 'jack');
  const pool = activeJeffery.length > 0 ? activeJeffery : bag.filter((d) => !d.archived);

  // Effective playing distance adjusted for elevation & wind
  let effDist = query.distanceFeet;
  if (query.terrain === 'uphill') effDist = Math.round(effDist * 1.18);
  if (query.terrain === 'downhill') effDist = Math.round(effDist * 0.85);
  if (query.wind === 'headwind') effDist = Math.round(effDist * 1.07);
  if (query.wind === 'tailwind') effDist = Math.round(effDist * 0.94);

  const shapeTargets: Record<
    RhbhShotShape,
    {
      label: string;
      targetNetBias: number; // negative = RHBH fades LEFT, 0 = STRAIGHT, positive = RHBH turns RIGHT
      preferredFadeMin: number;
      preferredFadeMax: number;
    }
  > = {
    hard_left: {
      label: '↰ Hard Left / Hyzer Hook (RHBH Fade Left)',
      targetNetBias: -3.2,
      preferredFadeMin: 2,
      preferredFadeMax: 4
    },
    gentle_left: {
      label: '↖ Gentle Left (Straight → Soft Left Finish)',
      targetNetBias: -1.35,
      preferredFadeMin: 1,
      preferredFadeMax: 2.5
    },
    straight: {
      label: '↑ Dead Straight (Zero-Fade Laser Tunnel)',
      targetNetBias: -0.2,
      preferredFadeMin: 0,
      preferredFadeMax: 1.5
    },
    gentle_right: {
      label: '↗ Gentle Right (Smooth RHBH Drift / S-Curve)',
      targetNetBias: 1.45,
      preferredFadeMin: 0,
      preferredFadeMax: 1.5
    },
    hard_right: {
      label: '↱ Turn Right (RHBH Turnover / Anhyzer Pan)',
      targetNetBias: 2.85,
      preferredFadeMin: 0,
      preferredFadeMax: 1
    }
  };

  const targetCfg = shapeTargets[query.shape];

  const scoredWithRaw = pool.map((disc) => {
    // Wind-adjusted effective flight numbers for RHBH
    let effTurn = disc.turn;
    let effFade = disc.fade;
    if (query.wind === 'headwind') {
      effTurn -= 1.2;
      effFade = Math.max(0, effFade - 0.5);
    } else if (query.wind === 'tailwind') {
      effTurn += 0.9;
      effFade += 0.5;
    } else if (query.wind === 'cross_lr') {
      effTurn -= 0.6;
      effFade = Math.max(0, effFade - 0.3);
    } else if (query.wind === 'cross_rl') {
      effTurn += 0.5;
      effFade += 0.6;
    }
    if (query.terrain === 'uphill') {
      // Uphill slows the disc early, making every disc act more overstable
      effTurn += 0.8;
      effFade += 0.6;
    } else if (query.terrain === 'downhill') {
      // Downhill keeps airspeed up slightly longer
      effTurn -= 0.4;
      effFade = Math.max(0, effFade - 0.3);
    }

    // Positive netBias => RHBH drifts RIGHT; Negative netBias => RHBH hooks LEFT
    const netBias = -effTurn * 0.95 - effFade * 1.15;

    // 1. DISTANCE FIT SCORE (0–48 pts)
    // Calibrated comfort band for Jeffery's arm speed
    const sweetSpot =
      disc.speed <= 3
        ? Math.min(disc.idealMaxFeet - 25, 148)
        : disc.speed <= 5
        ? Math.round((disc.idealMinFeet + disc.idealMaxFeet) * 0.52)
        : disc.speed <= 8
        ? Math.round((disc.idealMinFeet + disc.idealMaxFeet) * 0.55)
        : Math.round((disc.idealMinFeet + disc.idealMaxFeet) * 0.58);

    let distScore = 44;
    if (effDist < disc.idealMinFeet) {
      const underBy = disc.idealMinFeet - effDist;
      // Putters handle short distances cleanly (<100ft); fast drivers are penalized heavily on short shots
      const underPenaltyRate =
        disc.speed <= 4 ? 0.14 : disc.speed <= 5 ? 0.28 : disc.speed <= 8 ? 0.48 : 0.65;
      distScore -= underBy * underPenaltyRate;
      // Exception: Firebird skip-hook around a tree at 140–195ft is a real utility shot!
      if (disc.id === 'innova-luster-firebird' && query.shape === 'hard_left' && effDist >= 135) {
        distScore += 16;
      }
    } else if (effDist > disc.idealMaxFeet) {
      const overBy = effDist - disc.idealMaxFeet;
      distScore -= overBy * 0.52;
    } else {
      const distFromSweet = Math.abs(effDist - sweetSpot);
      distScore -= Math.min(14, distFromSweet * 0.085);
    }

    // Extra discipline: keep short shots (<145ft) putter/mid-led and long shots (>265ft) fairway/driver-led
    if (effDist <= 135 && disc.speed <= 4) distScore += 8;
    if (effDist <= 120 && disc.speed >= 7) distScore -= 18;
    if (effDist >= 145 && effDist <= 225 && disc.speed >= 4 && disc.speed <= 6) distScore += 7;
    if (effDist >= 225 && effDist <= 300 && disc.speed >= 7 && disc.speed <= 9) distScore += 7;
    if (effDist >= 295 && disc.speed >= 9) distScore += 9;

    // 2. RHBH SHOT SHAPE FIT SCORE (0–46 pts)
    const biasDiff = Math.abs(netBias - targetCfg.targetNetBias);
    let shapeScore = Math.max(0, 44 - biasDiff * 8.2);

    // Specific disc-golf RHBH flight-physics refinements:
    if (query.shape === 'hard_left') {
      if (disc.fade >= 3) shapeScore += 10;
      if (disc.fade === 2 && effDist <= 165) shapeScore += 8; // KC Pro Aviar hyzer approach
      if (disc.turn <= -2) shapeScore -= 18; // Understable discs fight against going hard left!
      if (disc.fade === 0) shapeScore -= 20;
    } else if (query.shape === 'gentle_left') {
      if (disc.fade >= 1 && disc.fade <= 2 && disc.turn >= -1) shapeScore += 9;
      if (disc.turn <= -3) shapeScore -= 12;
      if (disc.fade >= 4) shapeScore -= 8; // Firebird hooks harder than "gentle"
    } else if (query.shape === 'straight') {
      if (disc.turn === 0 && disc.fade === 0) shapeScore += 13; // XT Glow Nova & Proto Glow Mako3!
      if (disc.id === 'innova-halloween-sync' && effDist <= 200) shapeScore += 10; // Proven dead-straight tee putter!
      if (disc.id === 'innova-glow-leopard3' && effDist >= 195 && effDist <= 305) shapeScore += 8; // Hyzer-flip laser
      if (disc.id === 'innova-glow-teebird' && effDist >= 210 && effDist <= 305) shapeScore += 6;
      if (disc.id === 'innova-halo-wraith' && effDist >= 295) shapeScore += 7;
      if (disc.fade >= 4) shapeScore -= 16;
      if (disc.turn <= -4 && query.wind === 'headwind') shapeScore -= 14;
    } else if (query.shape === 'gentle_right') {
      if (disc.turn <= -2 && disc.fade <= 1) shapeScore += 10;
      if (disc.turn === 0 && disc.fade === 0 && effDist <= 220) shapeScore += 7; // Nova / Mako3 gentle anhyzer holds right!
      if (disc.fade >= 3) shapeScore -= 16;
      // Avoid burning -4 rollers in stiff headwinds
      if (query.wind === 'headwind' && disc.turn <= -4) shapeScore -= 12;
    } else if (query.shape === 'hard_right') {
      if (disc.turn <= -4 && disc.fade <= 1) shapeScore += 14; // Star Rollo, Hot Pink DX Archangel, Star Roadrunner!
      if (disc.turn === -2 && disc.fade <= 1) shapeScore += 7; // Glow Leopard3 anhyzer
      if (disc.fade === 0 && effDist <= 165) shapeScore += 10; // XT Glow Nova anhyzer never fights left!
      if (disc.fade >= 2) shapeScore -= 20;
      if (query.wind === 'headwind' && disc.turn <= -4) shapeScore -= 10; // Headwind turns Leopard3/Mako3 right cleanly without cut-rolling
    }

    // 3. TERRAIN & WIND MODIFIERS
    let modScore = 0;
    if (query.terrain === 'low_ceiling') {
      if (disc.id === 'innova-dx-alien') modScore += 11; // Low 2-glide branch-ducking laser!
      if (disc.glide <= 3) modScore += 6;
      if (disc.id === 'innova-halo-wraith' && effDist >= 245) modScore += 8;
      if (disc.id === 'innova-luster-firebird' && query.shape === 'hard_left') modScore += 7;
      if (disc.glide >= 6 && effDist < 175) modScore -= 5;
    } else if (query.terrain === 'uphill') {
      if (disc.glide >= 5 && disc.turn <= -2) modScore += 9; // Rollo, Archangel, Roadrunner, Leopard3 climb hills!
      if (disc.id === 'innova-sugar-star-rollo' && effDist <= 245) modScore += 7;
      if (disc.fade >= 3 && query.shape !== 'hard_left') modScore -= 7;
    } else if (query.terrain === 'downhill') {
      if (disc.id === 'innova-xt-glow-nova' && effDist <= 190) modScore += 14; // Stops dead on slopes/mounds!
      if (disc.id === 'innova-dx-alien' && effDist <= 215) modScore += 8;
      if (disc.id === 'innova-yeti-pro-aviar' && effDist <= 165) modScore += 7;
      if (disc.glide <= 3) modScore += 5;
      if (disc.speed >= 10 && effDist < 280) modScore -= 8;
    }

    if (query.wind === 'headwind') {
      if (disc.fade >= 2 && disc.turn >= -1) modScore += 6;
      if (disc.turn <= -4 && query.shape !== 'hard_right') modScore -= 9;
    } else if (query.wind === 'tailwind') {
      if (disc.glide >= 5 && disc.turn <= -1) modScore += 5;
    }

    // Determine best RHBH release angle for THIS disc on THIS shot
    let releaseAngle: 'hyzer' | 'flat' | 'anhyzer' = 'flat';
    if (query.shape === 'hard_left') {
      releaseAngle = disc.fade >= 3 ? 'flat' : 'hyzer';
    } else if (query.shape === 'gentle_left') {
      releaseAngle = disc.turn <= -2 ? 'hyzer' : 'flat';
    } else if (query.shape === 'straight') {
      if (disc.turn <= -2) releaseAngle = 'hyzer'; // Hyzer-flip straight!
      else releaseAngle = 'flat';
    } else if (query.shape === 'gentle_right') {
      if (disc.turn <= -2) releaseAngle = 'flat';
      else releaseAngle = 'anhyzer';
    } else if (query.shape === 'hard_right') {
      if (disc.turn <= -4 && query.wind !== 'tailwind') releaseAngle = 'flat';
      else releaseAngle = 'anhyzer';
    }

    const flightPreview = computeFlightPathSvg(disc, query.wind, releaseAngle);
    const estCarryFeet = flightPreview.estimatedFeet;

    // Power % calibration
    const rawPower = Math.round((effDist / Math.max(120, estCarryFeet)) * 100);
    const powerPct = Math.max(45, Math.min(100, rawPower));
    const powerLabel =
      powerPct <= 62
        ? `🪶 Touch ${powerPct}%`
        : powerPct <= 82
        ? `🎯 Smooth ${powerPct}%`
        : powerPct <= 94
        ? `⚡ Firm ${powerPct}%`
        : `🔥 Full ${powerPct}%`;

    const releaseLabel =
      releaseAngle === 'hyzer'
        ? disc.turn <= -2 && query.shape === 'straight'
          ? 'Hyzer-Flip (Tilt → Stand Up)'
          : 'Hyzer Tilt (Edge Down)'
        : releaseAngle === 'anhyzer'
        ? 'Anhyzer Tilt (Nose Flat, Right Drift)'
        : 'Flat Release (90° Chest Pull)';

    // Aim & Coaching Cue tailored to Jeffery's RHBH form!
    const aimCue =
      query.shape === 'hard_left'
        ? `Aim 18–25 ft RIGHT of basket · ${
            releaseAngle === 'hyzer' ? 'Tilt edge down (hyzer)' : 'Throw flat & let +' + disc.fade + ' fade hook left'
          }`
        : query.shape === 'gentle_left'
        ? `Aim 8–12 ft RIGHT of basket · Smooth flat chest-high pull so +${disc.fade} fade settles pin-high`
        : query.shape === 'straight'
        ? releaseAngle === 'hyzer'
          ? `Aim dead at pin · Gentle hyzer-flip + heavy tea-kettle wrist low so it flips flat & lasers straight`
          : `Aim dead at pin · 90° chest-high pull-through + heavy tea-kettle low wrist (zero fade!)`
        : query.shape === 'gentle_right'
        ? `Aim 8–12 ft LEFT of basket · ${
            releaseAngle === 'anhyzer'
              ? 'Slight anhyzer nose-flat tilt so it drifts right without fighting back'
              : `Flat smooth pull — let the ${disc.turn} turn glide smoothly right`
          }`
        : `Aim 15–22 ft LEFT of basket · ${
            releaseAngle === 'anhyzer'
              ? 'Committed RHBH anhyzer release (keep nose down!) so it holds right all the way to the pin'
              : `Flat chest-high rip — ${disc.turn} turn pans effortlessly right without needing a forehand!`
          }`;

    const whyParts: string[] = [];
    if (query.terrain === 'downhill' && disc.id === 'innova-xt-glow-nova') {
      whyParts.push('Stops dead on slope');
    } else if (query.terrain === 'low_ceiling' && disc.id === 'innova-dx-alien') {
      whyParts.push('Low 2-glide under branches');
    } else if (query.terrain === 'uphill' && disc.glide >= 5 && disc.turn <= -2) {
      whyParts.push(`${disc.glide}-glide hill climber`);
    } else if (query.wind === 'headwind' && disc.fade >= 2) {
      whyParts.push('Headwind torque-resistant');
    } else if (query.shape === 'hard_right' && disc.turn <= -4) {
      whyParts.push(`${disc.turn} turn RHBH right panner`);
    } else if (query.shape === 'hard_left' && disc.fade >= 3) {
      whyParts.push(`+${disc.fade} reliable left hook`);
    } else if (query.shape === 'straight' && disc.fade === 0) {
      whyParts.push('Zero-fade laser');
    } else if (disc.id === 'innova-halloween-sync' && effDist <= 195) {
      whyParts.push('#1 throwing putter');
    } else {
      whyParts.push(`Calibrated ${disc.idealMinFeet}–${disc.idealMaxFeet} ft`);
    }

    const rawScore = distScore + shapeScore + modScore;
    const totalScore = Math.max(10, Math.min(99, Math.round(rawScore)));

    return {
      rawScore,
      rec: {
        disc,
        rank: 1 as 1 | 2 | 3,
        matchScore: totalScore,
        releaseAngle,
        releaseLabel,
        powerPct,
        powerLabel,
        estCarryFeet,
        aimCue,
        whyBadge: whyParts[0],
        coachingNote: disc.caddieRoleNote || disc.courseStrategy
      }
    };
  });

  scoredWithRaw.sort((a, b) => b.rawScore - a.rawScore || a.rec.disc.speed - b.rec.disc.speed);

  const ranked: RhbhShotRecommendation[] = scoredWithRaw.map((item, idx) => ({
    ...item.rec,
    rank: Math.min(3, idx + 1) as 1 | 2 | 3
  }));

  return {
    query,
    effectiveDistanceFeet: effDist,
    topPick: ranked[0] || null,
    alternatives: ranked.slice(1, 3),
    allRanked: ranked,
    shapeSummary: targetCfg.label
  };
}




