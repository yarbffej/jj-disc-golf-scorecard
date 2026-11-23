import {
  ActiveRoundState,
  CourseTemplate,
  DiscItem,
  HistoricalRound,
  PlayerRosterItem
} from '../data/initialData';
import {
  DEFAULT_VERIFIED_HOLE_PICKS,
  buildLivePersonalFlightProfile,
  computeHeadToHead,
  computePlayerCareerProfile,
  formatRelativePar,
  getCourseHoleLayoutIntel,
  getCoursePersonalBest,
  getHoleCaddyInsights,
  getVerifiedHoleKey
} from './analytics';

export interface FullReportInput {
  history: HistoricalRound[];
  bag: DiscItem[];
  courses: CourseTemplate[];
  roster: PlayerRosterItem[];
  roundState?: ActiveRoundState;
}

export function generateFullChatGptReport(input: FullReportInput): string {
  const { history, bag, courses, roster } = input;
  const exportTimestamp = new Date().toISOString();

  // Load any custom verified picks from localStorage merged with defaults
  let verifiedPicks: Record<string, string> = { ...DEFAULT_VERIFIED_HOLE_PICKS };
  try {
    const saved = localStorage.getItem('jj_disc_golf_verified_hole_picks_v10');
    if (saved) {
      verifiedPicks = { ...verifiedPicks, ...JSON.parse(saved) };
    }
  } catch {
    // ignore storage errors
  }

  const jefferyProfile = computePlayerCareerProfile('jeffery', history);
  const jackProfile = computePlayerCareerProfile('jack', history);
  const h2h = computeHeadToHead('jeffery', 'jack', history);

  const jefferyActiveDiscs = bag.filter((d) => d.ownerId !== 'jack' && !d.archived);
  const jefferyArchivedDiscs = bag.filter((d) => d.ownerId !== 'jack' && d.archived);
  const jackDiscs = bag.filter((d) => d.ownerId === 'jack');

  const lines: string[] = [];

  lines.push('# JEFFERY & JACK DISC GOLF — MASTER ANALYTICS, BAG & ROUND TELEMETRY DOSSIER');
  lines.push(`Generated: ${exportTimestamp}`);
  lines.push(
    `Total Recorded Rounds: ${history.length} | Active Courses: ${courses.length} | Total Tracked Discs: ${bag.length} (${jefferyActiveDiscs.length} Jeffery Active, ${jackDiscs.length} Jack Active, ${jefferyArchivedDiscs.length} Jeffery Archived)`
  );
  lines.push(
    'Purpose: Complete structured dataset of all player career statistics, course/hole splits, disc flight numbers, plastic/weight specs, field-test telemetry, and chronological round voice logs for deep Google Gemini analysis.'
  );
  lines.push('');

  // ============================================================================
  // SECTION 1: CAREER PLAYER PROFILES & DISTANCE BRACKET SPLITS
  // ============================================================================
  lines.push('================================================================================');
  lines.push('## 1. OVERALL CAREER PLAYER STATISTICS & DISTANCE BRACKET SPLITS');
  lines.push('================================================================================');
  lines.push('');

  const renderPlayerProfile = (title: string, p: ReturnType<typeof computePlayerCareerProfile>) => {
    const avgStrokesPerRound =
      p.roundsPlayed > 0 ? (p.totalStrokes / p.roundsPlayed).toFixed(2) : '0.00';
    const avgScorePerHole =
      p.holesPlayed > 0 ? (p.totalStrokes / p.holesPlayed).toFixed(2) : '0.00';
    const birdieRate =
      p.holesPlayed > 0 ? ((p.birdies / p.holesPlayed) * 100).toFixed(1) : '0.0';
    const parRate =
      p.holesPlayed > 0 ? ((p.pars / p.holesPlayed) * 100).toFixed(1) : '0.0';
    const bogeyRate =
      p.holesPlayed > 0 ? ((p.bogeys / p.holesPlayed) * 100).toFixed(1) : '0.0';
    const dblRate =
      p.holesPlayed > 0 ? ((p.doubleOrWorse / p.holesPlayed) * 100).toFixed(1) : '0.0';

    lines.push(`### ${title}`);
    lines.push(`- **Rounds Played**: ${p.roundsPlayed} rounds (${p.holesPlayed} total holes scored)`);
    lines.push(
      `- **Career Strokes vs. Par**: ${p.totalStrokes} strokes on Par ${p.totalPar} (${formatRelativePar(p.overallRelPar)} cumulative)`
    );
    lines.push(
      `- **Average 9-Hole Score Relative to Par**: ${formatRelativePar(p.avgRelParPer9)} per 9 holes (Avg ${avgStrokesPerRound} strokes/round, ${avgScorePerHole} strokes/hole)`
    );
    if (p.bestRoundRelPar) {
      lines.push(
        `- **Career Best Round**: ${p.bestRoundRelPar.score} (${formatRelativePar(p.bestRoundRelPar.diff)}) on Par ${p.bestRoundRelPar.par} at ${p.bestRoundRelPar.courseName} (${p.bestRoundRelPar.date})`
      );
    }
    lines.push(`- **Scoring Distribution**:`);
    lines.push(`  - Aces: ${p.aces}`);
    lines.push(`  - Birdies (or better): ${p.birdies} (${birdieRate}%)`);
    lines.push(`  - Pars: ${p.pars} (${parRate}%)`);
    lines.push(`  - Bogeys (+1): ${p.bogeys} (${bogeyRate}%)`);
    lines.push(`  - Double Bogeys or Worse (+2+): ${p.doubleOrWorse} (${dblRate}%)`);
    lines.push(`- **Scoring Efficiency by Hole Distance Bracket**:`);
    for (const b of p.distanceBrackets) {
      lines.push(
        `  - ${b.label} (${b.rangeText}): ${b.holesCount} holes played | Avg Relative to Par: ${b.avgRelPar > 0 ? `+${b.avgRelPar}` : b.avgRelPar} strokes/hole`
      );
    }
    lines.push('');
  };

  renderPlayerProfile('1A. Jeffery (Primary Player — RHBH · 17-Disc Cotton Candy + Sync / Archangel / Alien Main Bag)', jefferyProfile);
  renderPlayerProfile('1B. Jack (Rival / Duo Partner — Discraft Lineup)', jackProfile);

  // ============================================================================
  // SECTION 2: HEAD-TO-HEAD RIVALRY SUMMARY
  // ============================================================================
  lines.push('================================================================================');
  lines.push('## 2. HEAD-TO-HEAD RIVALRY & SKINS TELEMETRY (JEFFERY VS. JACK)');
  lines.push('================================================================================');
  lines.push(`- **Shared Duo Rounds Completed**: ${h2h.sharedRounds}`);
  lines.push(`- **Solo Rounds Completed (Jeffery Only)**: ${jefferyProfile.roundsPlayed - h2h.sharedRounds}`);
  lines.push(
    `- **Head-to-Head Match Record**: Jeffery ${h2h.p1Wins} Wins — Jack ${h2h.p2Wins} Wins — ${h2h.ties} Ties`
  );
  lines.push(
    `- **Cumulative Strokes in Shared Rounds**: Jeffery ${h2h.p1TotalStrokesInShared} vs. Jack ${h2h.p2TotalStrokesInShared} (Diff: ${h2h.p1TotalStrokesInShared - h2h.p2TotalStrokesInShared} strokes)`
  );
  lines.push(
    `- **Hole-by-Hole Skins Breakdown (${h2h.sharedHoles} shared holes)**: Jeffery Won ${h2h.p1Skins} Holes | Jack Won ${h2h.p2Skins} Holes | Pushed/Tied ${h2h.pushedHoles} Holes`
  );
  lines.push('');
  lines.push('### Head-to-Head Round-by-Round Match Log:');
  for (const m of h2h.roundByRound) {
    const jRel = formatRelativePar(m.p1Score - m.par);
    const kRel = formatRelativePar(m.p2Score - m.par);
    const winLabel =
      m.winnerId === 'jeffery'
        ? `Jeffery won by ${m.margin}`
        : m.winnerId === 'jack'
        ? `Jack won by ${m.margin}`
        : 'Tied';
    lines.push(
      `- **${m.date} | ${m.courseName} (Par ${m.par})**: Jeffery ${m.p1Score} (${jRel}) vs. Jack ${m.p2Score} (${kRel}) → ${winLabel}`
    );
  }
  lines.push('');

  // ============================================================================
  // SECTION 3: COMPLETE DISC BAG INVENTORY & FLIGHT TELEMETRY
  // ============================================================================
  lines.push('================================================================================');
  lines.push('## 3. COMPLETE DISC BAG INVENTORY, SPECS & LIVE FLIGHT TELEMETRY');
  lines.push('================================================================================');
  lines.push('');

  // Reverse map verified hole picks per disc ID
  const picksByDiscId: Record<string, string[]> = {};
  for (const [holeKey, discId] of Object.entries(verifiedPicks)) {
    if (!picksByDiscId[discId]) picksByDiscId[discId] = [];
    picksByDiscId[discId].push(holeKey.toUpperCase());
  }

  const renderDiscGroup = (groupTitle: string, discs: DiscItem[]) => {
    lines.push(`### ${groupTitle} (${discs.length} Discs)`);
    lines.push('');
    discs.forEach((d, idx) => {
      const liveProfile = buildLivePersonalFlightProfile(d, history);
      const verifiedHoles = picksByDiscId[d.id] || [];
      lines.push(
        `#### ${idx + 1}. ${d.brand} ${d.name} — [${d.speed} | ${d.glide} | ${d.turn} | ${d.fade}] (${d.archived ? 'ARCHIVED VAULT' : 'ACTIVE BAG'})`
      );
      lines.push(`- **Disc ID**: \`${d.id}\` | **Owner**: ${d.ownerId.toUpperCase()}`);
      lines.push(
        `- **Type & Slot**: ${d.type} | **Speed Tier**: ${d.speedTier} | **Stability**: ${d.stabilitySlot} | **Category**: ${d.slotCategory}`
      );
      lines.push(
        `- **Plastic & Weight**: ${d.plastic} | ${d.weightGrams ? `${d.weightGrams}g` : 'Weight Unspecified'} | **Color/Stamp**: ${d.colorStamp}${d.orderNumber ? ` | **Order Provenance**: ${d.orderNumber}` : ''}${d.price ? ` (${d.price})` : ''}`
      );
      lines.push(
        `- **Flight Numbers**: Speed ${d.speed} | Glide ${d.glide} | Turn ${d.turn} | Fade ${d.fade}`
      );
      lines.push(`- **Target Distance Window**: ${d.idealMinFeet}–${d.idealMaxFeet} ft`);
      lines.push(`- **Mold & Flight Characteristics**: ${d.moldAndFlight}`);
      lines.push(`- **Course Strategy**: ${d.courseStrategy}`);
      if (d.caddieRoleNote) {
        lines.push(`- **Caddie Role Note**: ${d.caddieRoleNote}`);
      }
      if (d.fieldTestRank) {
        lines.push(`- **Field Test Ranking / Benchmark**: ${d.fieldTestRank}`);
      }
      if (d.personalFlightNotes) {
        lines.push(`- **Personal Flight Notes**: ${d.personalFlightNotes}`);
      }
      if (d.backComments) {
        lines.push(`- **Trading Card Back Insights**: ${d.backComments}`);
      }
      if (d.transcriptStats) {
        lines.push(`- **Recorded Voice Log Stats**: ${d.transcriptStats}`);
      }
      if (d.spotterWarning) {
        lines.push(`- **Spotter Warning**: ${d.spotterWarning}`);
      }
      lines.push(
        `- **Live Round Usage Telemetry**: Logged in ${liveProfile.loggedCount} hole records (${liveProfile.birdieCount} Birdies, ${liveProfile.parCount} Pars)`
      );
      lines.push(`- **Auto-Tuned Personal Flight Synthesis**: ${liveProfile.autoTunedTip}`);
      if (liveProfile.latestRoundQuote) {
        lines.push(`- **Latest Logged Hole Commentary**: "${liveProfile.latestRoundQuote}"`);
      }
      if (verifiedHoles.length > 0) {
        lines.push(`- **Verified #1 Tee/Approach Pick On Holes**: ${verifiedHoles.join(', ')}`);
      }
      lines.push('');
    });
  };

  renderDiscGroup(
    "3A. Jeffery's Active 17-Disc Main Bag (14 Cotton Candy + Halloween Star Sync / Hot Pink Archangel / Pink DX Alien)",
    jefferyActiveDiscs
  );
  renderDiscGroup("3B. Jack's Discraft Lineup", jackDiscs);
  if (jefferyArchivedDiscs.length > 0) {
    renderDiscGroup(
      "3C. Jeffery's Backup / Reserve Vault Discs (Replaced in Active Bag)",
      jefferyArchivedDiscs
    );
  }
  lines.push('### 3D. Active 17-Disc Main Bag Architecture (Cotton Candy + Hot Pink Core 3)');
  lines.push('- **Putters & Approach (6 Discs)**: #01 XT Glow Nova [2|2|0|0], #02 Proto Glow Aviar [2|3|0|1], #03 Yeti Pro Aviar [2|3|0|1], #04 KC Pro Aviar [2|3|0|2], #05 Hot Pink Star Sync — Halloween Edition [3|3|0|1], #06 Pink DX Alien [4|2|0|1]');
  lines.push('- **Midranges (3 Discs)**: #07 DX Glow Roc [4|4|0|3], #08 Proto Glow Mako3 [5|5|0|0], #09 Star Rollo [5|6|-4|1]');
  lines.push('- **Fairway Drivers (4 Discs)**: #10 Glow Leopard3 [7|5|-2|1], #11 Glow Teebird [7|5|0|2], #12 Champion Eagle [7|4|-1|3], #13 Hot Pink DX Archangel [8|6|-4|1]');
  lines.push('- **Distance Drivers (4 Discs)**: #14 Hot Pink Star Roadrunner [9|5|-4|1], #15 Luster Firebird [9|3|0|4], #16 Halo Wraith [11|5|-1|3], #17 Halo Destroyer [12|5|-1|3]');
  lines.push('');

  // ============================================================================
  // SECTION 4: COURSE-BY-COURSE & HOLE-BY-HOLE PERFORMANCE MATRIX
  // ============================================================================
  lines.push('================================================================================');
  lines.push('## 4. COURSE-BY-COURSE & HOLE-BY-HOLE PERFORMANCE MATRIX');
  lines.push('================================================================================');
  lines.push('');

  for (const course of courses) {
    const coursePar = course.holes.reduce((s, h) => s + h.par, 0);
    const courseDist = course.holes.reduce((s, h) => s + h.distance, 0);
    const jeffPB = getCoursePersonalBest(course.name, 'jeffery', history);
    const jackPB = getCoursePersonalBest(course.name, 'jack', history);
    const { layout } = getCourseHoleLayoutIntel(course.key || course.name);

    lines.push(`### COURSE: ${course.name} (${course.location})`);
    lines.push(
      `- **Course Specs**: ${course.totalHoles} Holes | Total Par: ${coursePar} | Total Distance: ${courseDist.toLocaleString()} ft (Avg ${Math.round(courseDist / course.totalHoles)} ft/hole)`
    );
    if (layout) {
      lines.push(
        `- **Terrain & Canopy Profile**: ${layout.difficultyLabel} | Overview: ${layout.overviewNote}`
      );
    }
    lines.push(
      `- **Jeffery Course Record**: ${jeffPB.roundsCount} rounds played | Personal Best: ${
        jeffPB.bestTotal !== null
          ? `${jeffPB.bestTotal} (${formatRelativePar(jeffPB.bestRelPar || 0)})`
          : 'N/A'
      } | Average Score: ${
        jeffPB.avgTotal !== null
          ? `${jeffPB.avgTotal} (${formatRelativePar(Number((jeffPB.avgTotal - coursePar).toFixed(1)))})`
          : 'N/A'
      }`
    );
    lines.push(
      `- **Jack Course Record**: ${jackPB.roundsCount} rounds played | Personal Best: ${
        jackPB.bestTotal !== null
          ? `${jackPB.bestTotal} (${formatRelativePar(jackPB.bestRelPar || 0)})`
          : 'N/A'
      } | Average Score: ${
        jackPB.avgTotal !== null
          ? `${jackPB.avgTotal} (${formatRelativePar(Number((jackPB.avgTotal - coursePar).toFixed(1)))})`
          : 'N/A'
      }`
    );
    lines.push('');
    lines.push('#### Hole-by-Hole Breakdown:');

    for (const h of course.holes) {
      const insight = getHoleCaddyInsights(course.name, h.number, history, ['jeffery', 'jack']);
      const jStat = insight.playerStats.jeffery;
      const kStat = insight.playerStats.jack;
      const vKey = getVerifiedHoleKey(course.key || course.name, h.number);
      const verifiedDiscId = verifiedPicks[vKey];
      const verifiedDisc = bag.find((d) => d.id === verifiedDiscId);
      const { holeIntel } = getCourseHoleLayoutIntel(course.key || course.name, h.number);

      lines.push(
        `- **Hole #${h.number} (Par ${h.par} · ${h.distance} ft)**${
          verifiedDisc
            ? ` | ★ Verified Pick: ${verifiedDisc.weightGrams || ''}g ${verifiedDisc.plastic} ${verifiedDisc.name} [${verifiedDisc.speed}|${verifiedDisc.glide}|${verifiedDisc.turn}|${verifiedDisc.fade}]`
            : ''
        }`
      );
      if (h.hint) {
        lines.push(`  - Caddie Note: ${h.hint}`);
      }
      if (holeIntel) {
        lines.push(
          `  - Satellite Geometry: ${holeIntel.direction} | Hazards: ${holeIntel.hazards} | Flight Match: ${holeIntel.personalFlightMatch}`
        );
      }
      if (jStat && jStat.recentScores.length > 0) {
        lines.push(
          `  - **Jeffery Stats**: Avg ${jStat.avgScore} (${formatRelativePar(Number((jStat.avgScore - h.par).toFixed(2)))}) | Best: ${jStat.bestScore} | Worst: ${jStat.worstScore} | Last: ${jStat.lastScore} (${jStat.lastDate}) | Birdies: ${jStat.birdies}, Pars: ${jStat.pars}, Bogeys+: ${jStat.bogeysOrWorse} | Recent Scores: [${jStat.recentScores.join(', ')}]${jStat.lastDiscUsed ? ` | Last Disc: ${jStat.lastDiscUsed}` : ''}`
        );
      } else {
        lines.push(`  - **Jeffery Stats**: No recorded scores yet`);
      }
      if (kStat && kStat.recentScores.length > 0) {
        lines.push(
          `  - **Jack Stats**: Avg ${kStat.avgScore} (${formatRelativePar(Number((kStat.avgScore - h.par).toFixed(2)))}) | Best: ${kStat.bestScore} | Worst: ${kStat.worstScore} | Last: ${kStat.lastScore} (${kStat.lastDate}) | Birdies: ${kStat.birdies}, Pars: ${kStat.pars}, Bogeys+: ${kStat.bogeysOrWorse} | Recent Scores: [${kStat.recentScores.join(', ')}]`
        );
      }
    }
    lines.push('');
  }

  // ============================================================================
  // SECTION 5: COMPLETE CHRONOLOGICAL ROUND HISTORY & VOICE LOG ARCHIVE
  // ============================================================================
  lines.push('================================================================================');
  lines.push('## 5. COMPLETE CHRONOLOGICAL ROUND-BY-ROUND SCORECARDS & VOICE TRANSCRIPTS');
  lines.push('================================================================================');
  lines.push('');

  history.forEach((round, idx) => {
    const totalDist = round.holes.reduce((s, h) => s + h.distance, 0);
    const playerSummaryText = round.players
      .map((p) => `${p.name}: ${p.total} (${formatRelativePar(p.total - round.par)})`)
      .join(' | ');

    lines.push(
      `### Round #${history.length - idx}: ${round.date} — ${round.courseName} (Par ${round.par} · ${totalDist.toLocaleString()} ft)`
    );
    lines.push(
      `- **Round ID**: ${round.id} | **Duration**: ${round.duration} | **Wind**: ${(round.windCondition || 'calm').toUpperCase()} | **Standings**: ${playerSummaryText}`
    );
    if (round.notes) {
      lines.push(`- **Round Summary Note**: ${round.notes}`);
    }
    lines.push('- **Hole-by-Hole Scorecard & Shot Telemetry**:');
    for (const h of round.holes) {
      const pScores = round.players
        .map((p) => {
          const sc = h.scores[p.id];
          const meta = h.meta?.[p.id];
          const metaParts: string[] = [];
          if (meta?.discUsed) metaParts.push(`Disc: ${meta.discUsed}`);
          if (meta?.puttDistance) metaParts.push(`Putt: ${meta.puttDistance}`);
          if (meta?.fairwayHit) metaParts.push('Fairway Hit');
          if (meta?.obStrokes) metaParts.push(`OB: +${meta.obStrokes}`);
          return `${p.name}: ${sc || '—'}${metaParts.length > 0 ? ` (${metaParts.join(', ')})` : ''}`;
        })
        .join(' | ');
      const transcriptNote = h.voiceTranscript ? ` — Note: "${h.voiceTranscript}"` : '';
      lines.push(
        `  - H#${h.number} (Par ${h.par}, ${h.distance} ft): ${pScores}${transcriptNote}`
      );
    }
    if (round.roundTranscript) {
      lines.push('- **Full Round Voice Log / Narrative**:');
      lines.push(round.roundTranscript);
    }
    lines.push('');
  });

  // ============================================================================
  // SECTION 6: SUGGESTED GOOGLE GEMINI ANALYSIS INSTRUCTIONS
  // ============================================================================
  lines.push('================================================================================');
  lines.push('## 6. INSTRUCTIONS FOR GOOGLE GEMINI DEEP ANALYSIS');
  lines.push('================================================================================');
  lines.push(
    'Please analyze the complete dataset above for Jeffery (RHBH thrower) and provide actionable insights on:'
  );
  lines.push(
    '1. **Bag Synergy, Overlap & Slot Gaps**: Evaluate Jeffery’s active 17-disc Main Bag (14 Cotton Candy + Hot Pink Core 3) across his 6 Putters/Approach (XT Glow Nova [2|2|0|0], Proto Glow Aviar [2|3|0|1], Yeti Pro Aviar [2|3|0|1], KC Pro Aviar [2|3|0|2], Hot Pink Halloween Star Sync [3|3|0|1], Pink DX Alien [4|2|0|1]), 3 Midranges (DX Glow Roc [4|4|0|3], Proto Glow Mako3 [5|5|0|0], Star Rollo [5|6|-4|1]), 4 Fairways (Glow Leopard3 [7|5|-2|1], Glow Teebird [7|5|0|2], Champion Eagle [7|4|-1|3], Hot Pink DX Archangel [8|6|-4|1]), and 4 Distance Drivers (Hot Pink Star Roadrunner [9|5|-4|1], Luster Firebird [9|3|0|4], Halo Wraith [11|5|-1|3], Halo Destroyer [12|5|-1|3]). Identify any speed/stability overlaps and recommend course-specific primary pulls.'
  );
  lines.push(
    '2. **Scoring Leaks & Distance Bracket Optimization**: Analyze Jeffery’s scoring averages across the 4 distance brackets (<185 ft, 185–239 ft, 240–299 ft, 300+ ft) and pinpoint which specific holes on Sar-Ko-Par Trails, Mize Elementary, California Trail MS, Harmon Park, Black Hoof, and Art Nine offer the highest stroke-saving potential.'
  );
  lines.push(
    '3. **Flight Tendency & Release Mechanics**: Based on the voice transcripts (e.g., RHBH nose-up/high release tendencies causing early left fade vs. low flat releases with Mamba/Roadrunner/Archangel/Mako3), give 3 concrete form/aim cues tailored to his discs.'
  );
  lines.push(
    '4. **Course-Specific Gameplans**: Provide a hole-by-hole tee + approach cheat sheet for his most-played courses to help break his current Personal Bests.'
  );

  const dossierText = lines.join('\n');
  syncDossierToDashboard(dossierText);
  return dossierText;
}

export function syncDossierToDashboard(dossierText: string): void {
  if (typeof window === 'undefined' || !dossierText) return;
  try {
    localStorage.setItem('jj_disc_golf_latest_dossier_v1', dossierText);
    localStorage.setItem('jj_disc_golf_last_sync_time', new Date().toLocaleString());
  } catch {
    // Ignore storage quota errors
  }
  try {
    // Direct exact match for window.frames['analytics-dashboard']?.postMessage(...)
    (window.frames as unknown as Record<string, Window | undefined>)[
      'analytics-dashboard'
    ]?.postMessage({ type: 'DISC_GOLF_DOSSIER_SYNC', dossierText }, '*');
  } catch {
    // Ignore cross-frame postMessage errors
  }
}


