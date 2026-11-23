import {
  CaddieScenario,
  CourseTemplate,
  DiscItem,
  HistoricalRound,
  HoleData,
  HoleShotMeta
} from '../data/initialData';
import { DEFAULT_VERIFIED_HOLE_PICKS, getVerifiedHoleKey } from './analytics';

export interface ParsedVoiceHole {
  holeNumber: number;
  par: number;
  distance: number;
  jefferyScore: number;
  jackScore?: number;
  thrownDiscId: string;
  discUsed: string;
  puttDistanceFeet?: number;
  summaryNote: string;
  rawSegment: string;
}

export interface ParsedVoiceRoundResult {
  courseKey: string;
  courseName: string;
  date: string;
  windCondition: CaddieScenario;
  soloMode: boolean;
  holes: ParsedVoiceHole[];
  totalPar: number;
  jefferyTotal: number;
  jackTotal?: number;
  fullTranscript: string;
}

const DISC_VOICE_PATTERNS: Array<{
  discId: string;
  displayName: string;
  regex: RegExp;
}> = [
  {
    discId: 'innova-halo-destroyer',
    displayName: 'Halo Destroyer',
    regex: /\b(halo\s+destroyer|the\s+destroyer|destroyer)\b/i
  },
  {
    discId: 'innova-halo-wraith',
    displayName: 'Halo Wraith',
    regex: /\b(halo\s+wraith|sugar\s+high\s+wraith|classic\s+glow\s+wraith|glow\s+wraith|the\s+wraith|wraith)\b/i
  },
  {
    discId: 'innova-luster-firebird',
    displayName: 'Luster Firebird',
    regex: /\b(luster\s+firebird|firebird|fire\s+bird)\b/i
  },
  {
    discId: 'innova-sugar-star-roadrunner',
    displayName: 'Sugar High Star Roadrunner',
    regex: /\b(sugar\s+high\s+roadrunner|star\s+roadrunner|gstar\s+roadrunner|roadrunner|road\s+runner|road\s+ground)\b/i
  },
  {
    discId: 'innova-glow-teebird',
    displayName: 'Glow Teebird',
    regex: /\b(glow\s+teebird|teebird|tee\s*bird|t[- ]?bird)\b/i
  },
  {
    discId: 'innova-glow-leopard3',
    displayName: 'Glow Leopard3',
    regex: /\b(glow\s+leopard\s*3|leopard\s*3|leopard)\b/i
  },
  {
    discId: 'innova-champion-eagle',
    displayName: 'Champion Eagle',
    regex: /\b(champion\s+eagle|the\s+eagle|eagle)\b/i
  },
  {
    discId: 'innova-proto-glow-mako3',
    displayName: 'Proto Glow Mako3',
    regex: /\b(proto\s+glow\s+mako\s*3|glow\s+mako\s*3|mako\s*3|miko\s*3|make\s*o\s*3|mako)\b/i
  },
  {
    discId: 'innova-sugar-star-rollo',
    displayName: 'Sugar High Star Rollo',
    regex: /\b(sugar\s+high\s+rollo|star\s+rollo|rollo|rolo)\b/i
  },
  {
    discId: 'innova-roc3',
    displayName: 'Roc3',
    regex: /\b(dx\s+roc\s*3|roc\s*3|rock\s*3)\b/i
  },
  {
    discId: 'innova-sugar-glow-roc',
    displayName: 'Sugar High DX Glow Roc',
    regex: /\b(sugar\s+high\s+roc|dx\s+glow\s+roc|classic\s+glow\s+(?:dx\s+)?roc|new\s+roc|new\s+rock|normal\s+roc|normal\s+rock|glow\s+roc|the\s+roc|the\s+rock|roc|rock)\b(?!\s*3)/i
  },
  {
    discId: 'innova-yeti-pro-aviar',
    displayName: 'Yeti Pro Aviar',
    regex: /\b(yeti\s+pro\s+aviar|yeti\s+pro|yeti\s+aviar|the\s+yeti|yeti)\b/i
  },
  {
    discId: 'innova-proto-glow-aviar',
    displayName: 'Proto Glow Aviar',
    regex: /\b(proto\s+glow\s+aviar|proto\s+aviar|glow\s+aviar)\b/i
  },
  {
    discId: 'innova-halloween-sync',
    displayName: 'Halloween Star Sync',
    regex: /\b(halloween\s+(?:star\s+)?sync|star\s+sync|sync|sink|xero|zero)\b/i
  },
  {
    discId: 'innova-it',
    displayName: 'IT',
    regex: /\b(halo\s+star\s+it|halo\s+it|the\s+it|with\s+the\s+it|throw\s+the\s+it|it\s+is\s+working|got\s+the\s+it\s+back)\b/i
  },
  {
    discId: 'innova-hot-pink-archangel',
    displayName: 'Hot Pink Archangel',
    regex: /\b(hot\s+pink\s+(?:dx\s+)?archangel|dx\s+archangel|archangel|arch\s+angel|ar\s+angel)\b/i
  },
  {
    discId: 'innova-mamba',
    displayName: 'Mamba',
    regex: /\b(star\s+mamba|mamba|mama)\b/i
  },
  {
    discId: 'innova-classic-glow-beast',
    displayName: 'Classic Glow Beast',
    regex: /\b(classic\s+glow\s+beast|glow\s+beast|the\s+beast|beast)\b/i
  },
  {
    discId: 'innova-dx-alien',
    displayName: 'DX Alien',
    regex: /\b(dx\s+alien|pink\s+alien|the\s+alien|alien)\b/i
  },
  {
    discId: 'innova-jay',
    displayName: 'Jay',
    regex: /\b(star\s+jay|the\s+jay|jay)\b/i
  },
  {
    discId: 'innova-toro',
    displayName: 'Toro',
    regex: /\b(star\s+toro|the\s+toro|toro)\b/i
  },
  {
    discId: 'innova-xt-glow-nova',
    displayName: 'XT Glow Nova',
    regex: /\b(xt\s+glow\s+nova|glow\s+nova|the\s+nova|nova)\b/i
  },
  {
    discId: 'innova-kc-pro-aviar',
    displayName: 'KC Pro Aviar',
    regex: /\b(kc\s+pro\s+aviar|kc\s+pro|avr\s+kc\s+pro)\b/i
  },
  {
    discId: 'innova-proto-glow-aviar',
    displayName: 'Proto Glow Aviar',
    regex: /\b(star\s+aviar|aviar|avr)\b/i
  }
];

export function detectDiscFromVoiceSegment(
  segment: string,
  fallbackCourseKey: string,
  holeNumber: number,
  bag: DiscItem[]
): { discId: string; discUsed: string } {
  for (const pat of DISC_VOICE_PATTERNS) {
    if (pat.regex.test(segment)) {
      const found = bag.find((d) => d.id === pat.discId);
      return {
        discId: pat.discId,
        discUsed: found?.name || pat.displayName
      };
    }
  }

  // Fallback to verified hole pick for this course & hole
  const holeKey = getVerifiedHoleKey(fallbackCourseKey, holeNumber);
  const verifiedId = DEFAULT_VERIFIED_HOLE_PICKS[holeKey] || 'innova-proto-glow-mako3';
  const verifiedDisc = bag.find((d) => d.id === verifiedId);
  return {
    discId: verifiedId,
    discUsed: verifiedDisc?.name || 'Proto Glow Mako3'
  };
}

function detectScoreFromSegment(segment: string, par: number): number {
  const lower = segment.toLowerCase();

  if (/\b(ace|aced\s+it|hole\s+in\s+one)\b/i.test(lower) && !/\balmost\s+aced\b/i.test(lower)) {
    return 1;
  }
  if (/\b(double\s+bogey|took\s+a\s+five|got\s+a\s+5)\b/i.test(lower)) {
    return par + 2;
  }
  if (
    /\b(birdie|birdied|with\s+a\s+bird|got\s+the\s+bird|made\s+the\s+birdie|for\s+birdie\s*!|bird\?\s*yeah|bird\s*,\s*bird)\b/i.test(
      lower
    ) &&
    !/\b(missed\s+the\s+birdie|bounced\s+out.*bird|for\s+par)\b/i.test(lower)
  ) {
    return Math.max(1, par - 1);
  }
  if (
    /\b(bogey|bogeyed|took\s+a\s+four|got\s+a\s+4|for\s+bogey)\b/i.test(lower) &&
    !/\bwiped\s+out\s+the\s+bogey\b/i.test(lower)
  ) {
    return par + 1;
  }
  if (/\b(par|parred|we'll\s+par\s+it|hard\s+it|pardon|hard\s+again|got\s+par)\b/i.test(lower)) {
    return par;
  }
  return par;
}

function extractPinDistanceFeet(segment: string): number | undefined {
  const underPin = /\b(right\s+under\s+the\s+(?:pin|basket)|tap[- ]in|within\s+1\s+foot|one\s+foot\s+away)\b/i.exec(
    segment
  );
  if (underPin) return 2;

  const ftMatch = /\b(\d{1,2})\s*(?:feet|foot|ft)\s*(?:away|from\s+the\s+(?:pin|basket|hole)|to\s+the\s+(?:left|right)|shy|past|behind)/i.exec(
    segment
  );
  if (ftMatch) {
    const val = parseInt(ftMatch[1], 10);
    if (val > 0 && val <= 65) return val;
  }
  return undefined;
}

function buildConciseHoleNote(
  segment: string,
  discUsed: string,
  score: number,
  par: number,
  pinFeet?: number
): string {
  const cleanLines = segment
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 2 &&
        !/^(test|um|uh|all right|okay|let's see|next hole|hole\s*\d+)/i.test(l)
    );

  const scoreLabel =
    score < par ? `Birdie ${score} ★` : score === par ? `Par ${score}` : `Bogey ${score}`;
  const distPart = pinFeet ? ` (parked ~${pinFeet}ft)` : '';

  if (cleanLines.length === 0) {
    return `Threw ${discUsed}${distPart} for ${scoreLabel}.`;
  }

  const bestSentence = cleanLines.slice(0, 3).join(' ').slice(0, 140);
  return `Threw ${discUsed}${distPart} (${scoreLabel}): "${bestSentence}"`;
}

export function parseVoiceLogTranscript(
  rawText: string,
  courses: CourseTemplate[],
  bag: DiscItem[],
  defaultCourseKey = 'sarko'
): ParsedVoiceRoundResult {
  const text = (rawText || '').trim();

  // 1. Detect Course
  let matchedCourse =
    courses.find((c) => c.key === defaultCourseKey) ||
    courses.find((c) => c.key === 'sarko') ||
    courses[0];

  for (const c of courses) {
    if (
      text.toLowerCase().includes(c.name.toLowerCase()) ||
      (c.key === 'sarko' && /\b(sar-ko-par|sarco\s*par|circle\s*bar|sarko)\b/i.test(text)) ||
      (c.key === 'mize' && /\bmize\b/i.test(text)) ||
      (c.key === 'harmon' && /\bharmon\b/i.test(text)) ||
      (c.key === 'blackhoof' && /\bblack\s*hoof\b/i.test(text)) ||
      (c.key === 'cedarridge' && /\bcedar\s*ridge\b/i.test(text)) ||
      (c.key === 'artnine' && /\bart\s*nine\b/i.test(text)) ||
      (c.key === 'smp_wooded' && /\b(shawnee\s*mission\s*wooded|smp\s*wooded)\b/i.test(text)) ||
      (c.key === 'prairie_pass' && /\b(prairie\s*pass|blue\s*valley|pleasant\s*ridge)\b/i.test(text)) ||
      (c.key === 'prairie_center' && /\bprairie\s*center\b/i.test(text)) ||
      (c.key === 'heritage_park' && /\bheritage(\s*park)?\b/i.test(text))
    ) {
      matchedCourse = c;
      break;
    }
  }

  // 2. Detect Date
  const dateMatch = text.match(/\b(202\d-\d{2}-\d{2})\b/);
  const roundDate = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);

  // 3. Detect Wind
  let windCondition: CaddieScenario = 'calm';
  if (/\b(headwind|into\s+the\s+wind|heavy\s+wind|windy)\b/i.test(text)) {
    windCondition = 'headwind';
  } else if (/\btailwind\b/i.test(text)) {
    windCondition = 'tailwind';
  }

  // 4. Check for explicit `## Hole-by-Hole Scorecard` lines first (e.g., `- **Hole #1** (138 ft, Par 3): Jeffery: 2`)
  const explicitScores: Record<number, { jeffery: number; jack?: number }> = {};
  const explicitRegex =
    /Hole\s*#?(\d+)[^\n\r:]*:\s*(?:Jeffery:\s*(\d+)|\*\*Jeffery\*\*:\s*(\d+))(?:\s*[,·|]\s*Jack:\s*(\d+))?/gi;
  let em: RegExpExecArray | null;
  while ((em = explicitRegex.exec(text)) !== null) {
    const hNum = parseInt(em[1], 10);
    const jSc = parseInt(em[2] || em[3], 10);
    const kSc = em[4] ? parseInt(em[4], 10) : undefined;
    if (hNum >= 1 && hNum <= 18 && jSc > 0) {
      explicitScores[hNum] = { jeffery: jSc, jack: kSc };
    }
  }

  // 5. Split narrative into hole segments if possible
  const narrativeBody = text.split(/##\s*Final\s*Standings|##\s*Hole-by-Hole/i)[0] || text;
  const holeSegments: Record<number, string> = {};

  // Check if explicit "Hole 1", "Hole 2" markers exist
  const holeHeaderMatches = Array.from(
    narrativeBody.matchAll(/(?:^|\n)\s*(?:[-*]\s*)?(?:\*\*)?Hole\s*#?(\d+)\b[^\n]*/gi)
  );

  if (holeHeaderMatches.length >= 2) {
    for (let i = 0; i < holeHeaderMatches.length; i++) {
      const hNum = parseInt(holeHeaderMatches[i][1], 10);
      const startIdx = holeHeaderMatches[i].index || 0;
      const endIdx =
        i + 1 < holeHeaderMatches.length
          ? holeHeaderMatches[i + 1].index || narrativeBody.length
          : narrativeBody.length;
      holeSegments[hNum] = narrativeBody.slice(startIdx, endIdx).trim();
    }
  } else {
    // Split by "Next hole" or divide paragraphs proportionally across the course holes
    const byNextHole = narrativeBody.split(/\bnext\s+hole\b/i);
    if (byNextHole.length >= 3) {
      byNextHole.forEach((seg, idx) => {
        const hNum = idx + 1;
        if (hNum <= matchedCourse.holes.length) {
          holeSegments[hNum] = seg.trim();
        }
      });
    } else {
      const paragraphs = narrativeBody
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0 && !/^(🎙️|Date:|Players:|---)/i.test(p));
      const totalHoles = matchedCourse.holes.length;
      const chunkSize = Math.max(1, Math.ceil(paragraphs.length / totalHoles));
      for (let hIdx = 0; hIdx < totalHoles; hIdx++) {
        const slice = paragraphs.slice(hIdx * chunkSize, (hIdx + 1) * chunkSize).join('\n');
        holeSegments[hIdx + 1] = slice;
      }
    }
  }

  const parsedHoles: ParsedVoiceHole[] = matchedCourse.holes.map((courseHole) => {
    const hNum = courseHole.number;
    const seg = holeSegments[hNum] || '';
    const { discId, discUsed } = detectDiscFromVoiceSegment(
      seg,
      matchedCourse.key,
      hNum,
      bag
    );
    const explicit = explicitScores[hNum];
    const jefferyScore = explicit?.jeffery || detectScoreFromSegment(seg, courseHole.par);
    const pinFeet = extractPinDistanceFeet(seg);
    const summaryNote = buildConciseHoleNote(
      seg,
      discUsed,
      jefferyScore,
      courseHole.par,
      pinFeet
    );

    return {
      holeNumber: hNum,
      par: courseHole.par,
      distance: courseHole.distance,
      jefferyScore,
      jackScore: explicit?.jack,
      thrownDiscId: discId,
      discUsed,
      puttDistanceFeet: pinFeet,
      summaryNote,
      rawSegment: seg
    };
  });

  const totalPar = parsedHoles.reduce((s, h) => s + h.par, 0);
  const jefferyTotal = parsedHoles.reduce((s, h) => s + h.jefferyScore, 0);
  const hasJack = parsedHoles.some((h) => typeof h.jackScore === 'number' && h.jackScore > 0);
  const jackTotal = hasJack
    ? parsedHoles.reduce((s, h) => s + (h.jackScore || h.par), 0)
    : undefined;

  return {
    courseKey: matchedCourse.key,
    courseName: matchedCourse.name,
    date: roundDate,
    windCondition,
    soloMode: !hasJack,
    holes: parsedHoles,
    totalPar,
    jefferyTotal,
    jackTotal,
    fullTranscript: text
  };
}

export function convertParsedVoiceRoundToHistoricalRound(
  parsed: ParsedVoiceRoundResult,
  existingHistory: HistoricalRound[]
): HistoricalRound {
  const highestExistingId = existingHistory.reduce((max, r) => Math.max(max, r.id || 0), 0);
  const nextId = Math.max(Date.now(), highestExistingId + 1);

  const holes: HoleData[] = parsed.holes.map((ph) => {
    const throws: Array<{ shotType: string; discId: string }> = [{ shotType: 'tee', discId: ph.thrownDiscId }];
    if (ph.jefferyScore >= 2) {
      throws.push({
        shotType: 'putt',
        discId:
          ph.thrownDiscId === 'innova-halloween-sync' || ph.thrownDiscId === 'innova-sync'
            ? 'innova-halloween-sync'
            : 'innova-kc-pro-aviar'
      });
    }

    const jeffMeta: HoleShotMeta = {
      throws,
      discUsed: ph.discUsed,
      thrownDiscId: ph.thrownDiscId,
      fairwayHit: ph.jefferyScore <= ph.par,
      puttDistance: 'C1',
      puttDistanceFeet: ph.puttDistanceFeet,
      scenarioUsed: parsed.windCondition,
      notes: ph.summaryNote,
      voiceNote: ph.summaryNote
    };

    const scores: Record<string, number> = { jeffery: ph.jefferyScore };
    if (!parsed.soloMode && ph.jackScore) {
      scores.jack = ph.jackScore;
    }

    return {
      number: ph.holeNumber,
      par: ph.par,
      distance: ph.distance,
      scores,
      voiceTranscript: ph.summaryNote,
      meta: {
        jeffery: jeffMeta
      }
    };
  });

  const players = [
    {
      id: 'jeffery',
      name: 'Jeffery',
      tag: 'J1',
      total: parsed.jefferyTotal
    }
  ];
  if (!parsed.soloMode && parsed.jackTotal) {
    players.push({
      id: 'jack',
      name: 'Jack',
      tag: 'J2',
      total: parsed.jackTotal
    });
  }

  const birdieHoles = parsed.holes
    .filter((h) => h.jefferyScore < h.par)
    .map((h) => `H#${h.holeNumber} (${h.discUsed})`)
    .join(', ');

  return {
    id: nextId,
    courseName: parsed.courseName,
    totalHoles: parsed.holes.length,
    date: parsed.date,
    duration: '00:26:00',
    par: parsed.totalPar,
    windCondition: parsed.windCondition,
    gameMode: 'stroke',
    notes: `${parsed.courseName} Voice Log Round (${parsed.date}) — Jeffery ${parsed.jefferyTotal} (${
      parsed.jefferyTotal - parsed.totalPar === 0
        ? 'E'
        : parsed.jefferyTotal - parsed.totalPar > 0
        ? `+${parsed.jefferyTotal - parsed.totalPar}`
        : parsed.jefferyTotal - parsed.totalPar
    })${birdieHoles ? ` · Birdies ★: ${birdieHoles}` : ''}`,
    roundTranscript: parsed.fullTranscript,
    players,
    holes,
    updatedAt: Date.now()
  };
}
