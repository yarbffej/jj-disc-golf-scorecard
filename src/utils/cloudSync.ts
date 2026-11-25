import {
  ActiveRoundState,
  AppExportPayload,
  BgThemeMode,
  CaddieScenario,
  CourseTemplate,
  DiscItem,
  HistoricalRound,
  HoleData,
  INITIAL_COURSE_TEMPLATES,
  INITIAL_DISC_BAG,
  INITIAL_USER_EXPORT,
  PUBLIC_HD_CARD_MAP,
  PlayerRosterItem
} from '../data/initialData';

export const VALID_BG_THEMES: readonly BgThemeMode[] = [
  'adventure',
  'midnight',
  'sugar',
  'glow',
  'turf',
  'sunset',
  'synthwave',
  'championship'
] as const;

export function isValidBgTheme(val: unknown): val is BgThemeMode {
  return typeof val === 'string' && (VALID_BG_THEMES as readonly string[]).includes(val);
}
import { DEFAULT_VERIFIED_HOLE_PICKS } from './analytics';
import {
  generateFullChatGptReport,
  syncDossierToDashboard
} from './reportGenerator';

export const MASTER_STORAGE_KEY = 'jj_disc_golf_v115_master_state';
export const LEGACY_STORAGE_KEYS = [
  'jj_disc_golf_v114_master_state',
  'jj_disc_golf_v113_master_state',
  'jj_disc_golf_v112_master_state',
  'jj_disc_golf_v111_master_state',
  'jj_disc_golf_v110_master_state',
  'jj_disc_golf_v109_master_state',
  'jj_disc_golf_v108_master_state',
  'jj_disc_golf_v107_master_state',
  'jj_disc_golf_v106_master_state',
  'jj_disc_golf_v105_master_state',
  'jj_disc_golf_v104_master_state',
  'jj_disc_golf_v103_master_state',
  'jj_disc_golf_v102_master_state',
  'jj_disc_golf_v101_master_state',
  'jj_disc_golf_v100_master_state',
  'jj_disc_golf_v99_master_state',
  'jj_disc_golf_v98_master_state',
  'jj_disc_golf_v97_master_state',
  'jj_disc_golf_v96_master_state',
  'jj_disc_golf_v95_master_state',
  'jj_disc_golf_v94_master_state',
  'jj_disc_golf_v93_master_state',
  'jj_disc_golf_v92_master_state',
  'jj_disc_golf_v91_master_state',
  'jj_disc_golf_v90_master_state',
  'jj_disc_golf_v89_master_state',
  'jj_disc_golf_v88_master_state',
  'jj_disc_golf_v87_master_state',
  'jj_disc_golf_v86_master_state',
  'jj_disc_golf_v85_master_state',
  'jj_disc_golf_v84_master_state',
  'jj_disc_golf_v83_master_state',
  'jj_disc_golf_v82_master_state',
  'jj_disc_golf_v81_master_state',
  'jj_disc_golf_v80_master_state',
  'jj_disc_golf_v79_master_state',
  'jj_disc_golf_v78_master_state',
  'jj_disc_golf_v77_master_state',
  'jj_disc_golf_v76_master_state',
  'jj_disc_golf_v75_master_state',
  'jj_disc_golf_v74_master_state',
  'jj_disc_golf_v73_master_state',
  'jj_disc_golf_v72_master_state',
  'jj_disc_golf_v71_master_state',
  'jj_disc_golf_v70_master_state',
  'jj_disc_golf_v69_master_state'
];
export const VERIFIED_PICKS_STORAGE_KEY = 'jj_disc_golf_verified_hole_picks_v10';
export const THEME_STORAGE_KEY = 'jj_disc_golf_bg_theme_v4';
export const DOSSIER_STORAGE_KEY = 'jj_disc_golf_latest_dossier_v1';
export const HD_CARDS_STORAGE_KEY = 'jj_disc_golf_hd_cards_v1';
export const CLOUD_DEVICE_ID_KEY = 'jj_disc_golf_cloud_device_id';
export const CLOUD_LAST_SYNC_KEY = 'jj_disc_golf_cloud_last_sync';
export const CLOUD_SYNC_CHANNEL = 'jbray-dg-199x-sync';
export const DELETED_IDS_STORAGE_KEY = 'dg_deleted_ids';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'idle';

export interface CloudSyncDeltaPacket {
  v: number;
  channel: string;
  deviceId: string;
  updatedAt: number;
  blobUrl?: string;
  customRounds: HistoricalRound[];
  allRoundIds?: number[];
  roundState?: ActiveRoundState;
  isRoundInProgress?: boolean;
  bagOverrides?: Array<Partial<DiscItem> & { id: string; updatedAt?: number }>;
  verifiedHolePicks?: Record<string, string>;
  bgTheme?: BgThemeMode;
  deletedIds?: string[];
  forceOverwrite?: boolean;
  forceOverwriteAt?: number;
}

interface NtfyChunkEnvelope {
  _dgSyncChunk: true;
  channel: string;
  batchId: string;
  deviceId: string;
  updatedAt: number;
  chunkIndex: number;
  totalChunks: number;
  data: string;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server-node';
  try {
    const existing = localStorage.getItem(CLOUD_DEVICE_ID_KEY);
    if (existing) return existing;
    const created = `dg-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
    localStorage.setItem(CLOUD_DEVICE_ID_KEY, created);
    return created;
  } catch {
    return 'dg-browser';
  }
}

export function normalizeCourseSignature(courseName?: string): string {
  const raw = (courseName || '').toLowerCase();
  if (
    raw.includes('shawnee mission wooded') ||
    raw.includes('smp_wooded') ||
    raw.includes('smp wooded') ||
    (raw.includes('shawnee mission') && !raw.includes('art nine'))
  ) {
    return 'smp_wooded';
  }
  if (
    raw === 'prairie_pass' ||
    raw.includes('prairie pass') ||
    raw.includes('blue valley') ||
    raw.includes('pleasant ridge')
  ) {
    return 'prairie_pass';
  }
  if (raw === 'prairie_center' || raw.includes('prairie center')) return 'prairie_center';
  if (raw.includes('sar-ko-par') || raw.includes('sarko')) return 'sarko';
  if (raw.includes('mize')) return 'mize';
  if (raw.includes('art nine')) return 'artnine';
  if (raw.includes('harmon')) return 'harmon';
  if (raw.includes('california trail') || raw.includes('cal trail')) return 'caltrail';
  if (raw === 'blackhoof_18' || (raw.includes('black hoof') && (raw.includes('championship') || raw.includes('white')))) return 'blackhoof_18';
  if (raw.includes('black hoof') && !raw.includes('championship')) return 'blackhoof';
  if (raw.includes('cedar ridge') || raw.includes('cedarridge')) return 'cedarridge';
  if (raw.includes('wyandotte')) return 'wyandotte';
  if (raw.includes('heritage')) return 'heritage_park';
  if (raw.includes('wolf den') || raw.includes('mission trail')) return 'wolfden';
  return raw.replace(/[^a-z0-9]/g, '');
}

export function getRoundDedupeSignature(round: HistoricalRound): string {
  const courseSig = normalizeCourseSignature(round.courseName);
  const playerTotals = (round.players || [])
    .map((p) => `${p.id.toLowerCase()}:${p.total}`)
    .sort()
    .join('|');
  return `${round.date || ''}::${courseSig}::${playerTotals}`;
}

export function getRoundFallbackScoreSignature(round: HistoricalRound): string {
  const courseSig = normalizeCourseSignature(round.courseName);
  const jeffTotal =
    round.players?.find((p) => p.id.toLowerCase() === 'jeffery')?.total ?? '';
  return `${round.date || ''}::${courseSig}::j:${jeffTotal}`;
}

export function getRoundDeterministicFallbackSignature(
  round: (Partial<HistoricalRound> & { course?: string; totalScore?: number | string }) | undefined | null
): string {
  const datePart = String(round?.date || '').trim();
  const coursePart = String(round?.course || round?.courseName || '').trim();
  const totalScorePart =
    round?.totalScore !== undefined && round?.totalScore !== null
      ? String(round.totalScore)
      : String(
          round?.players?.find(
            (p) => String(p?.id || '').toLowerCase() === 'jeffery'
          )?.total ??
            round?.players?.[0]?.total ??
            ''
        );
  return `${datePart}_${coursePart}_${totalScorePart}`;
}

export function getRoundNormalizedFallbackSignature(
  round: (Partial<HistoricalRound> & { course?: string; totalScore?: number | string }) | undefined | null
): string {
  const datePart = String(round?.date || '').trim();
  const coursePart = normalizeCourseSignature(
    round?.course || round?.courseName
  );
  const totalScorePart =
    round?.totalScore !== undefined && round?.totalScore !== null
      ? String(round.totalScore)
      : String(
          round?.players?.find(
            (p) => String(p?.id || '').toLowerCase() === 'jeffery'
          )?.total ??
            round?.players?.[0]?.total ??
            ''
        );
  return `${datePart}_${coursePart}_${totalScorePart}`;
}

export function getRoundTombstoneKeys(round: HistoricalRound): string[] {
  const keys = new Set<string>();
  if (round && round.id !== undefined && round.id !== null) {
    keys.add(String(round.id));
    keys.add(`round:${round.id}`);
  }
  if (round && (round.date || round.courseName)) {
    keys.add(getRoundDeterministicFallbackSignature(round));
    keys.add(getRoundNormalizedFallbackSignature(round));
    keys.add(getRoundDedupeSignature(round));
    keys.add(getRoundFallbackScoreSignature(round));
  }
  return Array.from(keys);
}

const CANONICAL_BUILT_IN_ROUND_IDS = new Set<number>(
  INITIAL_USER_EXPORT.history.map((r) => r.id)
);

const CANONICAL_BUILT_IN_TOMBSTONE_KEYS = new Set<string>(
  INITIAL_USER_EXPORT.history.flatMap((r) => getRoundTombstoneKeys(r))
);

function isProtectedCanonicalKey(key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed) return true;
  if (CANONICAL_BUILT_IN_TOMBSTONE_KEYS.has(trimmed)) return true;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('cedar_ridge') ||
    lower.includes('cedarridge') ||
    lower.includes('cedar ridge') ||
    lower.includes('1762016400001') ||
    lower.includes('1762012800001') ||
    lower.includes('1762030800002')
  ) {
    return true;
  }
  return false;
}

export function readDeletedIdsFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  const collected = new Set<string>();
  try {
    const raw = localStorage.getItem(DELETED_IDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item !== null && item !== undefined && String(item).trim()) {
            const val = String(item).trim();
            if (!isProtectedCanonicalKey(val)) {
              collected.add(val);
            }
          }
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  try {
    const masterRaw = localStorage.getItem(MASTER_STORAGE_KEY);
    if (masterRaw) {
      const parsedMaster = JSON.parse(masterRaw);
      if (Array.isArray(parsedMaster?.deletedIds)) {
        for (const item of parsedMaster.deletedIds) {
          if (item !== null && item !== undefined && String(item).trim()) {
            const val = String(item).trim();
            if (!isProtectedCanonicalKey(val)) {
              collected.add(val);
            }
          }
        }
      }
    }
  } catch {
    // Ignore
  }

  return Array.from(collected);
}

export function writeDeletedIdsToStorage(ids: Iterable<string | number>): string[] {
  const normalized = Array.from(
    new Set(
      Array.from(ids)
        .filter((x) => x !== null && x !== undefined && String(x).trim() !== '')
        .map((x) => String(x).trim())
        .filter((x) => !isProtectedCanonicalKey(x))
    )
  );
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore quota errors
    }
  }
  return normalized;
}

export function mergeDeletedIds(
  ...lists: Array<Iterable<string | number> | undefined>
): string[] {
  const set = new Set<string>(readDeletedIdsFromStorage());
  for (const list of lists) {
    if (!list) continue;
    for (const item of list) {
      if (item !== null && item !== undefined && String(item).trim() !== '') {
        const val = String(item).trim();
        if (!isProtectedCanonicalKey(val)) {
          set.add(val);
        }
      }
    }
  }
  return writeDeletedIdsToStorage(set);
}

export function isRoundDeleted(
  round: HistoricalRound | undefined | null,
  deletedSet: Set<string>
): boolean {
  if (!round) return true;
  if (typeof round.id === 'number' && CANONICAL_BUILT_IN_ROUND_IDS.has(round.id)) {
    return false;
  }
  if (deletedSet.size === 0) return false;
  for (const key of getRoundTombstoneKeys(round)) {
    if (deletedSet.has(key)) return true;
  }
  return false;
}

export function isDiscDeleted(
  disc: { id?: string } | undefined | null,
  deletedSet: Set<string>
): boolean {
  if (!disc || !disc.id) return true;
  if (deletedSet.size === 0) return false;
  return (
    deletedSet.has(String(disc.id)) || deletedSet.has(`disc:${disc.id}`)
  );
}

export function recordDeletedRound(
  roundOrId: HistoricalRound | number,
  existingHistory: HistoricalRound[] = []
): string[] {
  const newKeys: string[] = [];
  if (typeof roundOrId === 'number') {
    newKeys.push(String(roundOrId), `round:${roundOrId}`);
    const matched = existingHistory.find((r) => r.id === roundOrId);
    if (matched) {
      newKeys.push(...getRoundTombstoneKeys(matched));
    }
  } else if (roundOrId && typeof roundOrId === 'object') {
    newKeys.push(...getRoundTombstoneKeys(roundOrId));
  }
  return mergeDeletedIds(newKeys);
}

export function recordDeletedItem(itemId: string | number): string[] {
  const idStr = String(itemId).trim();
  if (!idStr) return readDeletedIdsFromStorage();
  return mergeDeletedIds([idStr, `disc:${idStr}`, `round:${idStr}`]);
}

function getRoundCompletenessScore(r: HistoricalRound): number {
  let score = 0;
  if (r.roundTranscript && r.roundTranscript.trim().length > 0) {
    score += r.roundTranscript.length;
  }
  if (r.notes && r.notes.trim().length > 0) {
    score += r.notes.length;
  }
  for (const h of r.holes || []) {
    if (h.voiceTranscript) score += h.voiceTranscript.length;
    if (h.meta) score += Object.keys(h.meta).length * 25;
  }
  return score;
}

function mergeTwoRounds(a: HistoricalRound, b: HistoricalRound): HistoricalRound {
  const aTime = a.updatedAt || 0;
  const bTime = b.updatedAt || 0;
  const aRichness = getRoundCompletenessScore(a);
  const bRichness = getRoundCompletenessScore(b);
  const aIsCanonical = CANONICAL_BUILT_IN_ROUND_IDS.has(a.id);
  const bIsCanonical = CANONICAL_BUILT_IN_ROUND_IDS.has(b.id);

  // Always prefer the canonical / commentary-enriched round so raw phone scorecards
  // (which previously auto-populated recommended hole picks) never overwrite actual thrown discs!
  const primary =
    aIsCanonical && !bIsCanonical && aRichness >= bRichness
      ? a
      : bIsCanonical && !aIsCanonical && bRichness >= aRichness
      ? b
      : Math.abs(aRichness - bRichness) > 100
      ? aRichness >= bRichness
        ? a
        : b
      : bTime > aTime
      ? b
      : aTime > bTime
      ? a
      : bRichness >= aRichness
      ? b
      : a;
  const secondary = primary === b ? a : b;

  const mergedHoles: HoleData[] = (primary.holes || []).map((pHole, idx) => {
    const sHole =
      (secondary.holes || []).find((h) => h.number === pHole.number) ||
      secondary.holes?.[idx];
    if (!sHole) return pHole;
    const pHasCommentary = Boolean(
      pHole.voiceTranscript || pHole.meta?.jeffery?.voiceNote
    );
    const sHasCommentary = Boolean(
      sHole.voiceTranscript || sHole.meta?.jeffery?.voiceNote
    );
    const winningMeta =
      pHasCommentary || !sHasCommentary
        ? { ...(sHole.meta || {}), ...(pHole.meta || {}) }
        : { ...(pHole.meta || {}), ...(sHole.meta || {}) };
    return {
      ...sHole,
      ...pHole,
      scores: { ...(sHole.scores || {}), ...(pHole.scores || {}) },
      meta: winningMeta,
      voiceTranscript: pHole.voiceTranscript || sHole.voiceTranscript,
      notes: pHole.notes || sHole.notes
    };
  });

  return {
    ...secondary,
    ...primary,
    holes: mergedHoles,
    roundTranscript: primary.roundTranscript || secondary.roundTranscript,
    notes: primary.notes || secondary.notes,
    updatedAt: Math.max(aTime, bTime, rIdTimestampFallback(primary.id))
  };
}

function rIdTimestampFallback(id?: number): number {
  if (!id) return 0;
  // If ID is a millisecond timestamp (e.g. 1761854400001), use it as baseline
  if (id > 1_600_000_000_000 && id < 2_500_000_000_000) return id;
  return 0;
}

export function sortRoundsChronologically(rounds: HistoricalRound[]): HistoricalRound[] {
  return [...rounds].sort(
    (a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id
  );
}

/**
 * Non-destructive union merge of round histories by Round ID and (date + course + score) signature,
 * keeping the version with the latest `updatedAt` timestamp and richest hole telemetry,
 * while strictly filtering out any round present in `deletedIds` BEFORE and AFTER merging.
 */
export function mergeRoundHistories(
  localRounds: HistoricalRound[] = [],
  remoteRounds: HistoricalRound[] = [],
  extraDeletedIds?: Iterable<string | number>
): HistoricalRound[] {
  const deletedSet = new Set<string>(mergeDeletedIds(extraDeletedIds));
  const byId = new Map<number, HistoricalRound>();
  const sigToId = new Map<string, number>();

  const builtInCourseDateScoreKeys = new Map<string, number>();
  const builtInSingleRoundDateCourseKeys = new Map<string, number>();
  const canonicalDateCourseCounts = new Map<string, number>();
  for (const canonical of INITIAL_USER_EXPORT.history) {
    if (canonical && typeof canonical.id === 'number') {
      const dcKey = `${canonical.date}::${normalizeCourseSignature(canonical.courseName)}`;
      canonicalDateCourseCounts.set(dcKey, (canonicalDateCourseCounts.get(dcKey) || 0) + 1);
    }
  }
  for (const canonical of INITIAL_USER_EXPORT.history) {
    if (
      canonical &&
      typeof canonical.id === 'number' &&
      !isRoundDeleted(canonical, deletedSet)
    ) {
      byId.set(canonical.id, canonical);
      const sig = getRoundDedupeSignature(canonical);
      sigToId.set(sig, canonical.id);
      const canonCourseNorm = normalizeCourseSignature(canonical.courseName);
      const canonJ = canonical.players?.find((p) => p.id === 'jeffery')?.total ?? '';
      builtInCourseDateScoreKeys.set(
        `${canonical.date}::${canonCourseNorm}::${canonJ}`,
        canonical.id
      );
      const dcKey = `${canonical.date}::${canonCourseNorm}`;
      const isSingleCanonicalDayCourse =
        (canonicalDateCourseCounts.get(dcKey) || 0) === 1 &&
        ((canonical.totalHoles || canonical.holes.length) >= 18 ||
          canonical.date === '2026-11-25' ||
          canonical.date === '2026-11-23' ||
          canonical.date === '2026-11-22' ||
          canonical.date === '2026-11-17' ||
          canonical.date === '2026-11-15');
      if (isSingleCanonicalDayCourse) {
        builtInSingleRoundDateCourseKeys.set(dcKey, canonical.id);
      }
    }
  }

  const upsertRound = (candidate: HistoricalRound) => {
    if (!candidate || typeof candidate.id !== 'number') return;
    if (!Array.isArray(candidate.holes) || candidate.holes.length === 0) return;
    // Filter out any round whose ID or fallback signature is in deletedIds BEFORE merging
    if (isRoundDeleted(candidate, deletedSet)) return;
    // Filter out accidental 2026-11-03 Harmon Park flip (replaced by canonical 2026-11-03 Sar-Ko-Par round)
    let courseNorm = normalizeCourseSignature(candidate.courseName);
    if (candidate.date === '2026-11-03' && courseNorm === 'harmon') return;

    const candJ = candidate.players?.find((p) => p.id === 'jeffery')?.total ?? '';
    // Normalize 2026-11-08 Art Nine round (1794178980671) that was accidentally logged under default Sar-Ko-Par Trails on phone
    if (
      candidate.id === 1794178980671 ||
      (candidate.date === '2026-11-08' && courseNorm === 'sarko' && Number(candJ) === 24)
    ) {
      const artNineDistances = [132, 103, 100, 146, 111, 116, 84, 102, 137];
      candidate = {
        ...candidate,
        id: 1794178980671,
        courseName: 'The Art Nine @ SMP',
        holes: candidate.holes.map((h, idx) => ({
          ...h,
          distance: artNineDistances[idx] ?? h.distance
        }))
      };
      courseNorm = 'artnine';
    }

    const sig = getRoundDedupeSignature(candidate);
    const courseDateScoreKey = `${candidate.date}::${courseNorm}::${candJ}`;

    // 1. Direct ID match
    if (byId.has(candidate.id)) {
      const existing = byId.get(candidate.id)!;
      if (CANONICAL_BUILT_IN_ROUND_IDS.has(existing.id)) {
        // Canonical built-in rounds from INITIAL_USER_EXPORT.history are authoritative
        return;
      }
      const merged = mergeTwoRounds(existing, candidate);
      if (!isRoundDeleted(merged, deletedSet)) {
        byId.set(candidate.id, merged);
        sigToId.set(getRoundDedupeSignature(merged), candidate.id);
      } else {
        byId.delete(candidate.id);
      }
      return;
    }

    // 2. Exact date + course + score signature match
    const matchedIdBySig = sigToId.get(sig);
    if (matchedIdBySig !== undefined && byId.has(matchedIdBySig)) {
      const existing = byId.get(matchedIdBySig)!;
      if (CANONICAL_BUILT_IN_ROUND_IDS.has(existing.id)) {
        return;
      }
      const merged = mergeTwoRounds(existing, { ...candidate, id: existing.id });
      if (!isRoundDeleted(merged, deletedSet)) {
        byId.set(existing.id, merged);
      } else {
        byId.delete(existing.id);
      }
      return;
    }

    // 3. Built-in canonical round on same date & course (exact score OR single-round canonical 18H/11-17 day-course)
    const builtInId = builtInCourseDateScoreKeys.get(courseDateScoreKey);
    if (builtInId !== undefined && byId.has(builtInId)) {
      // Keep canonical built-in round's verified hole discs & commentary authoritative
      return;
    }
    const singleDayCourseId = builtInSingleRoundDateCourseKeys.get(
      `${candidate.date}::${courseNorm}`
    );
    if (singleDayCourseId !== undefined && byId.has(singleDayCourseId)) {
      // Collapse any duplicate device-scored copy of a canonical 18-hole / 11-17 round
      return;
    }

    // 4. Brand-new round — add to union
    byId.set(candidate.id, {
      ...candidate,
      updatedAt: candidate.updatedAt || rIdTimestampFallback(candidate.id) || Date.now()
    });
    sigToId.set(sig, candidate.id);
  };

  for (const r of localRounds) upsertRound(r);
  for (const r of remoteRounds) upsertRound(r);

  return sortRoundsChronologically(
    Array.from(byId.values()).filter((r) => !isRoundDeleted(r, deletedSet))
  );
}

/**
 * Non-destructive union merge of disc bags by Disc ID and latest `updatedAt` timestamp,
 * filtering out any disc present in `deletedIds`.
 */
export function mergeDiscBags(
  localBag: DiscItem[] = [],
  remoteBag: DiscItem[] = [],
  extraDeletedIds?: Iterable<string | number>
): DiscItem[] {
  const deletedSet = new Set<string>(mergeDeletedIds(extraDeletedIds));
  const byId = new Map<string, DiscItem>();

  for (const baseDisc of INITIAL_DISC_BAG) {
    if (!isDiscDeleted(baseDisc, deletedSet)) {
      byId.set(baseDisc.id, baseDisc);
    }
  }

  const upsertDisc = (d: DiscItem) => {
    if (!d || !d.id) return;
    if (isDiscDeleted(d, deletedSet)) {
      byId.delete(d.id);
      return;
    }
    const existing = byId.get(d.id);
    if (!existing) {
      byId.set(d.id, d);
      return;
    }
    const canonicalBase = INITIAL_DISC_BAG.find((b) => b.id === d.id);
    const existingTime = existing.updatedAt || 0;
    const candidateTime = d.updatedAt || 0;
    const winner = candidateTime >= existingTime ? d : existing;
    const loser = winner === d ? existing : d;

    // v114 Cutover (2026-11-23T22:20:00Z): Old Star Sync & Royal Blue DX Archangel moved cleanly to
    // Backup Vault and replaced in the 17-disc Main Bag by Halloween Star Sync & Hot Pink Archangel.
    const SUGAR_HIGH_MAIN_BAG_CUTOVER_TS = 1795472400000;
    const forceArchived =
      d.id === 'innova-leopard3' || d.id === 'innova-aviar'
        ? true
        : (winner.updatedAt || 0) >= SUGAR_HIGH_MAIN_BAG_CUTOVER_TS &&
          typeof winner.archived === 'boolean'
        ? winner.archived
        : canonicalBase?.archived ?? winner.archived ?? loser.archived;

    byId.set(d.id, {
      ...loser,
      ...winner,
      archived: forceArchived,
      cardNumber: canonicalBase?.cardNumber || winner.cardNumber || loser.cardNumber,
      slotCategory: canonicalBase?.slotCategory || winner.slotCategory || loser.slotCategory,
      orderNumber: canonicalBase?.orderNumber || winner.orderNumber || loser.orderNumber,
      price: canonicalBase?.price || winner.price || loser.price,
      colorStamp: canonicalBase?.colorStamp || winner.colorStamp || loser.colorStamp,
      colorHex: canonicalBase?.colorHex || winner.colorHex || loser.colorHex,
      weightGrams:
        canonicalBase?.weightGrams !== undefined
          ? canonicalBase.weightGrams
          : winner.weightGrams ?? loser.weightGrams,
      speed: canonicalBase?.speed ?? winner.speed ?? loser.speed,
      glide: canonicalBase?.glide ?? winner.glide ?? loser.glide,
      turn: canonicalBase?.turn ?? winner.turn ?? loser.turn,
      fade: canonicalBase?.fade ?? winner.fade ?? loser.fade,
      moldAndFlight: canonicalBase?.moldAndFlight || winner.moldAndFlight || loser.moldAndFlight,
      courseStrategy: canonicalBase?.courseStrategy || winner.courseStrategy || loser.courseStrategy,
      personalFlightNotes:
        canonicalBase?.personalFlightNotes || winner.personalFlightNotes || loser.personalFlightNotes,
      fieldTestRank: canonicalBase?.fieldTestRank || winner.fieldTestRank || loser.fieldTestRank,
      transcriptStats:
        canonicalBase?.transcriptStats || winner.transcriptStats || loser.transcriptStats,
      caddieRoleNote: canonicalBase?.caddieRoleNote || winner.caddieRoleNote || loser.caddieRoleNote,
      backComments: canonicalBase?.backComments || winner.backComments || loser.backComments,
      cardImage:
        PUBLIC_HD_CARD_MAP[d.id] ||
        canonicalBase?.cardImage ||
        winner.cardImage ||
        loser.cardImage ||
        undefined,
      updatedAt: Math.max(existingTime, candidateTime)
    });
  };

  for (const d of localBag) upsertDisc(d);
  for (const d of remoteBag) upsertDisc(d);

  return Array.from(byId.values()).filter((d) => !isDiscDeleted(d, deletedSet));
}

export function mergeCourseTemplates(
  localCourses: CourseTemplate[] = [],
  remoteCourses: CourseTemplate[] = []
): CourseTemplate[] {
  const byKey = new Map<string, CourseTemplate>();
  for (const c of localCourses) {
    if (c && c.key) byKey.set(c.key, c);
  }
  for (const c of remoteCourses) {
    if (!c || !c.key) continue;
    const existing = byKey.get(c.key);
    if (!existing || (c.updatedAt || 0) >= (existing.updatedAt || 0)) {
      byKey.set(c.key, { ...existing, ...c });
    }
  }
  // Built-in canonical course templates (including updated hole distances/pars) take precedence
  for (const c of INITIAL_COURSE_TEMPLATES) {
    byKey.set(c.key, c);
  }
  return Array.from(byKey.values());
}

export function mergeRosters(
  localRoster: PlayerRosterItem[] = [],
  remoteRoster: PlayerRosterItem[] = []
): PlayerRosterItem[] {
  const byId = new Map<string, PlayerRosterItem>();
  for (const p of INITIAL_USER_EXPORT.roster) byId.set(p.id, p);
  for (const p of localRoster) if (p?.id) byId.set(p.id, p);
  for (const p of remoteRoster) if (p?.id) byId.set(p.id, { ...byId.get(p.id), ...p });
  return Array.from(byId.values());
}

function countScoredHoles(rs?: ActiveRoundState): number {
  if (!rs || !Array.isArray(rs.holes)) return 0;
  return rs.holes.filter((h) =>
    Object.values(h.scores || {}).some((s) => typeof s === 'number' && s > 0)
  ).length;
}

export function mergeActiveRoundStates(
  localRs?: ActiveRoundState,
  remoteRs?: ActiveRoundState
): ActiveRoundState {
  if (!localRs && !remoteRs) return INITIAL_USER_EXPORT.roundState;
  if (!localRs) return remoteRs!;
  // Always keep this device's local active scorecard authoritative so a finished/reset round
  // or course switch is never overwritten by a stale remote active scorecard.
  return localRs;
}

export interface MergedCloudResult {
  payload: AppExportPayload;
  hasRemoteUpdates: boolean;
  needsCloudPush: boolean;
  totalRounds: number;
}

/**
 * Computes a stable JSON fingerprint of ONLY the actual data (`rounds`, `bags`, `deletedIds`,
 * and active scorecard scores). NEVER includes `updatedAt`, `lastUpdated`, or `exportDate`
 * timestamps so identical state across devices never triggers an infinite sync loop.
 */
export function computeDataFingerprint(
  payload: Partial<AppExportPayload> | undefined | null
): string {
  if (!payload) return '';
  const del = Array.from(
    new Set(
      (payload.deletedIds || [])
        .filter((x) => x !== null && x !== undefined && String(x).trim() !== '')
        .map((x) => String(x).trim())
    )
  ).sort();
  const delSet = new Set<string>(del);

  const rounds = (Array.isArray(payload.history) ? payload.history : [])
    .filter((r) => !isRoundDeleted(r, delSet))
    .map((r) => ({
      id: r.id,
      sig: getRoundDeterministicFallbackSignature(r),
      players: (r.players || [])
        .map((p) => `${p.id}:${p.total}`)
        .sort()
        .join(','),
      holes: (r.holes || [])
        .map(
          (h) =>
            `${h.number}:${h.scores?.jeffery || 0}-${h.scores?.jack || 0}:${(h.voiceTranscript || '').length}`
        )
        .join('|'),
      transcriptLen: (r.roundTranscript || '').length
    }))
    .sort((a, b) => a.id - b.id);

  const bags = (Array.isArray(payload.bag) ? payload.bag : [])
    .filter((d) => !isDiscDeleted(d, delSet))
    .map((d) => ({
      id: d.id,
      archived: Boolean(d.archived),
      weight: d.weightGrams || 0,
      notes: d.personalFlightNotes || ''
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const activeHoles = (payload.roundState?.holes || [])
    .map((h) => `${h.number}:${h.scores?.jeffery || 0}-${h.scores?.jack || 0}`)
    .join('|');

  return JSON.stringify({
    rounds,
    bags,
    deletedIds: del,
    activeCourse: payload.roundState?.courseKey || '',
    activeHoles
  });
}

/**
 * Master non-destructive merge combining local and remote AppExportPayload states.
 * Always unions `local.deletedIds` and `remote.deletedIds` FIRST and filters out
 * deleted items before merging rounds or updating localStorage / Master Dashboard.
 */
export function mergeCloudPayloads(
  local: Partial<AppExportPayload>,
  remote: Partial<AppExportPayload>
): MergedCloudResult {
  // 1. Always union local.deletedIds, remote.deletedIds, and persistent dg_deleted_ids first.
  // Never infer tombstones from missing rounds so a new offline round on one device is NEVER wiped out by another device.
  const combinedDeletedIds = mergeDeletedIds(local.deletedIds, remote.deletedIds);
  const deletedSet = new Set<string>(combinedDeletedIds);

  // 2. Filter out any round or item in combinedDeletedIds BEFORE merging (even if result is [])
  const localHistory = (Array.isArray(local.history) ? local.history : []).filter(
    (r) => !isRoundDeleted(r, deletedSet)
  );
  const remoteHistory = (Array.isArray(remote.history) ? remote.history : []).filter(
    (r) => !isRoundDeleted(r, deletedSet)
  );

  const mergedHistory = mergeRoundHistories(
    localHistory,
    remoteHistory,
    combinedDeletedIds
  );
  const mergedBag = mergeDiscBags(
    (local.bag || []).filter((d) => !isDiscDeleted(d, deletedSet)),
    (remote.bag || []).filter((d) => !isDiscDeleted(d, deletedSet)),
    combinedDeletedIds
  );
  const mergedCourses = mergeCourseTemplates(local.courses || [], remote.courses || []);
  const mergedRoster = mergeRosters(local.roster || [], remote.roster || []);
  const mergedRoundState = mergeActiveRoundStates(local.roundState, remote.roundState);

  const localTime = local.updatedAt || 0;
  const remoteTime = remote.updatedAt || 0;

  const activeBagIdSet = new Set(
    mergedBag.filter((d) => !d.archived).map((d) => d.id)
  );
  const rawMergedVerifiedPicks: Record<string, string> = {
    ...DEFAULT_VERIFIED_HOLE_PICKS,
    ...(remoteTime > localTime
      ? { ...(local.verifiedHolePicks || {}), ...(remote.verifiedHolePicks || {}) }
      : { ...(remote.verifiedHolePicks || {}), ...(local.verifiedHolePicks || {}) })
  };
  const mergedVerifiedPicks: Record<string, string> = { ...DEFAULT_VERIFIED_HOLE_PICKS };
  for (const [hk, discId] of Object.entries(rawMergedVerifiedPicks)) {
    if (discId && activeBagIdSet.has(discId)) {
      mergedVerifiedPicks[hk] = discId;
    } else if (DEFAULT_VERIFIED_HOLE_PICKS[hk]) {
      mergedVerifiedPicks[hk] = DEFAULT_VERIFIED_HOLE_PICKS[hk];
    }
  }

  const payload: AppExportPayload = {
    app: 'Jeffery & Jack Disc Golf Scorecard',
    version: 'v115',
    exportDate: new Date().toISOString(),
    updatedAt: Math.max(localTime, remoteTime),
    deviceId: local.deviceId || getOrCreateDeviceId(),
    history: mergedHistory,
    roster: mergedRoster,
    roundState: mergedRoundState,
    webhookUrl:
      (remoteTime > localTime ? remote.webhookUrl : local.webhookUrl) ||
      local.webhookUrl ||
      remote.webhookUrl ||
      INITIAL_USER_EXPORT.webhookUrl,
    timerState: local.timerState || remote.timerState || INITIAL_USER_EXPORT.timerState,
    courses: mergedCourses,
    bag: mergedBag,
    isRoundInProgress:
      typeof local.isRoundInProgress === 'boolean'
        ? local.isRoundInProgress
        : countScoredHoles(mergedRoundState) > 0,
    verifiedHolePicks: mergedVerifiedPicks,
    bgTheme:
      local.bgTheme ||
      (remoteTime > localTime ? remote.bgTheme : local.bgTheme) ||
      'turf',
    deletedIds: combinedDeletedIds,
    forceOverwrite: false
  };

  // Compare ONLY actual data fingerprints (never timestamps!)
  const localFp = computeDataFingerprint(local);
  const remoteFp = computeDataFingerprint(remote);
  const mergedFp = computeDataFingerprint(payload);

  return {
    payload,
    hasRemoteUpdates: mergedFp !== localFp,
    needsCloudPush: mergedFp !== remoteFp,
    totalRounds: mergedHistory.length
  };
}

/**
 * Inspects all localStorage keys used by the app and builds a unified AppExportPayload snapshot.
 */
export function readLocalStorageSnapshot(): AppExportPayload {
  let parsedMaster: Partial<AppExportPayload> = {};
  try {
    let raw = localStorage.getItem(MASTER_STORAGE_KEY);
    if (!raw) {
      for (const k of LEGACY_STORAGE_KEYS) {
        const cand = localStorage.getItem(k);
        if (cand) {
          raw = cand;
          break;
        }
      }
    }
    if (raw) {
      parsedMaster = JSON.parse(raw);
    }
  } catch {
    // Ignore parse errors
  }

  const deletedIds = mergeDeletedIds(parsedMaster.deletedIds);
  const deletedSet = new Set<string>(deletedIds);

  let verifiedHolePicks: Record<string, string> = { ...DEFAULT_VERIFIED_HOLE_PICKS };
  try {
    const rawPicks = localStorage.getItem(VERIFIED_PICKS_STORAGE_KEY);
    if (rawPicks) {
      verifiedHolePicks = { ...verifiedHolePicks, ...JSON.parse(rawPicks) };
    }
  } catch {
    // Ignore
  }

  let bgTheme: BgThemeMode = 'turf';
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidBgTheme(savedTheme)) {
      bgTheme = savedTheme;
    }
  } catch {
    // Ignore
  }

  // Also check if the Master Dashboard stored any newer rounds in jj_disc_golf_latest_dossier_v1
  let dossierRounds: HistoricalRound[] = [];
  try {
    const savedDossier = localStorage.getItem(DOSSIER_STORAGE_KEY);
    if (savedDossier && savedDossier.length > 200) {
      dossierRounds = parseDossierTextIntoRounds(
        savedDossier,
        parsedMaster.history || INITIAL_USER_EXPORT.history,
        parsedMaster.courses || INITIAL_COURSE_TEMPLATES
      ).filter((r) => !isRoundDeleted(r, deletedSet));
    }
  } catch {
    // Ignore
  }

  const history = mergeRoundHistories(
    (parsedMaster.history || INITIAL_USER_EXPORT.history).filter(
      (r) => !isRoundDeleted(r, deletedSet)
    ),
    dossierRounds,
    deletedIds
  );

  return {
    app: 'Jeffery & Jack Disc Golf Scorecard',
    version: 'v115',
    exportDate: new Date().toISOString(),
    updatedAt: parsedMaster.updatedAt || Date.now(),
    deviceId: getOrCreateDeviceId(),
    history,
    roster: mergeRosters(parsedMaster.roster, INITIAL_USER_EXPORT.roster),
    roundState: parsedMaster.roundState || INITIAL_USER_EXPORT.roundState,
    webhookUrl: parsedMaster.webhookUrl || INITIAL_USER_EXPORT.webhookUrl,
    timerState: parsedMaster.timerState || INITIAL_USER_EXPORT.timerState,
    courses: mergeCourseTemplates(parsedMaster.courses, INITIAL_COURSE_TEMPLATES),
    bag: mergeDiscBags(parsedMaster.bag, INITIAL_DISC_BAG, deletedIds),
    isRoundInProgress: Boolean(parsedMaster.isRoundInProgress),
    verifiedHolePicks,
    bgTheme,
    deletedIds
  };
}

/**
 * Writes merged state back to all relevant localStorage keys and dispatches live sync messages
 * (`SYNC_DASHBOARD_STATE` and `DISC_GOLF_DOSSIER_SYNC`) to the Master Dashboard iframe.
 */
export function writeMergedStateToLocalStorageAndDashboard(
  merged: AppExportPayload
): string {
  const combinedDeletedIds = mergeDeletedIds(merged.deletedIds);
  const deletedSet = new Set<string>(combinedDeletedIds);
  const cleanHistory = (merged.history || []).filter(
    (r) => !isRoundDeleted(r, deletedSet)
  );
  const cleanBag = (merged.bag || INITIAL_DISC_BAG).filter(
    (d) => !isDiscDeleted(d, deletedSet)
  );

  try {
    const compactBag = cleanBag.map((d) => ({
      ...d,
      cardImage:
        d.cardImage && d.cardImage.startsWith('data:')
          ? PUBLIC_HD_CARD_MAP[d.id] || undefined
          : d.cardImage
    }));

    localStorage.setItem(
      MASTER_STORAGE_KEY,
      JSON.stringify({
        ...merged,
        history: cleanHistory,
        bag: compactBag,
        deletedIds: combinedDeletedIds
      })
    );

    if (merged.verifiedHolePicks) {
      localStorage.setItem(
        VERIFIED_PICKS_STORAGE_KEY,
        JSON.stringify(merged.verifiedHolePicks)
      );
    }
    if (merged.bgTheme) {
      localStorage.setItem(THEME_STORAGE_KEY, merged.bgTheme);
    }
  } catch {
    // Ignore quota errors
  }

  const dossierText = generateFullChatGptReport({
    history: cleanHistory,
    bag: cleanBag,
    courses: merged.courses || INITIAL_COURSE_TEMPLATES,
    roster: merged.roster || INITIAL_USER_EXPORT.roster,
    roundState: merged.roundState
  });

  syncDossierToDashboard(dossierText);

  try {
    const dashFrame = (
      window.frames as unknown as Record<string, Window | undefined>
    )['analytics-dashboard'];
    if (dashFrame && typeof dashFrame.postMessage === 'function') {
      dashFrame.postMessage(
        {
          type: 'SYNC_DASHBOARD_STATE',
          payload: {
            state: merged,
            dossierText,
            updatedAt: merged.updatedAt || Date.now()
          }
        },
        '*'
      );
      dashFrame.postMessage(
        { type: 'DISC_GOLF_DOSSIER_SYNC', dossierText },
        '*'
      );
    }
  } catch {
    // Ignore cross-frame errors
  }

  return dossierText;
}

/**
 * Parses Section 5 (`### Round #...`) from a Master Telemetry Dossier string so any round
 * pasted or updated inside `disc_golf_dashboard_ai_studio.html` is synced back into the
 * main Scorecard app's `history` and Cloud Sync!
 */
export function parseDossierTextIntoRounds(
  rawText: string,
  existingHistory: HistoricalRound[] = [],
  existingCourses: CourseTemplate[] = INITIAL_COURSE_TEMPLATES
): HistoricalRound[] {
  if (!rawText || !rawText.includes('## 5. COMPLETE CHRONOLOGICAL')) {
    return [];
  }

  const sec5 = rawText.split('## 5. COMPLETE CHRONOLOGICAL')[1]?.split('## 6. INSTRUCTIONS')[0] || rawText;
  const roundBlocks = sec5.split(
    /### Round #(\d+):\s*(\d{4}-\d{2}-\d{2})\s*—\s*([^\n\r(]+)\(Par\s*(\d+)\s*·\s*([\d,]+)\s*ft\)/g
  );
  if (roundBlocks.length <= 1) return [];

  const parsedRounds: HistoricalRound[] = [];

  for (let i = 1; i < roundBlocks.length; i += 6) {
    const rNum = parseInt(roundBlocks[i], 10);
    const rDate = roundBlocks[i + 1].trim();
    const rCourse = roundBlocks[i + 2].trim();
    const rPar = parseInt(roundBlocks[i + 3], 10);
    const body = roundBlocks[i + 5] || '';

    const idMatch = body.match(/\*\*Round ID\*\*:\s*(\d+)/i);
    const durMatch = body.match(/\*\*Duration\*\*:\s*([0-9:]+)/i);
    const windMatch = body.match(/\*\*Wind\*\*:\s*([A-Z_]+)/i);
    const jStandMatch = body.match(/Jeffery:\s*(\d+)\s*\(([+-]?\d+|E)\)/i);
    const kStandMatch = body.match(/Jack:\s*(\d+)\s*\(([+-]?\d+|E)\)/i);

    if (!jStandMatch) continue;

    const roundId = idMatch
      ? parseInt(idMatch[1], 10)
      : Date.parse(rDate) + rNum;

    // If we already have this exact round ID and identical scores, keep existing
    const existingById = existingHistory.find((r) => r.id === roundId);
    const jTotal = parseInt(jStandMatch[1], 10);
    const kTotal = kStandMatch ? parseInt(kStandMatch[1], 10) : null;

    if (
      existingById &&
      existingById.players.find((p) => p.id === 'jeffery')?.total === jTotal &&
      (kTotal === null ||
        existingById.players.find((p) => p.id === 'jack')?.total === kTotal)
    ) {
      parsedRounds.push(existingById);
      continue;
    }

    const matchedCourse = existingCourses.find(
      (c) =>
        normalizeCourseSignature(c.name) === normalizeCourseSignature(rCourse)
    );

    const holes: HoleData[] = [];
    const holeLineRegex =
      /-\s*H#(\d+)\s*\(Par\s*(\d+),\s*(\d+)\s*ft\):\s*([^\n\r]+)/g;
    let hm: RegExpExecArray | null;
    while ((hm = holeLineRegex.exec(body)) !== null) {
      const hNum = parseInt(hm[1], 10);
      const hPar = parseInt(hm[2], 10);
      const hDist = parseInt(hm[3], 10);
      const rest = hm[4];

      const jHoleScoreMatch = rest.match(/Jeffery:\s*(\d+)/i);
      const kHoleScoreMatch = rest.match(/Jack:\s*(\d+)/i);
      const noteMatch = rest.match(/—\s*Note:\s*"([^"]+)"/i);

      const scores: Record<string, number> = {};
      if (jHoleScoreMatch) scores.jeffery = parseInt(jHoleScoreMatch[1], 10);
      if (kHoleScoreMatch) scores.jack = parseInt(kHoleScoreMatch[1], 10);

      holes.push({
        number: hNum,
        par: hPar,
        distance: hDist,
        scores,
        voiceTranscript: noteMatch ? noteMatch[1] : undefined
      });
    }

    if (holes.length === 0 && matchedCourse) {
      for (const ch of matchedCourse.holes) {
        holes.push({
          number: ch.number,
          par: ch.par,
          distance: ch.distance,
          scores: { jeffery: ch.par }
        });
      }
    }

    const narrSplit = body.split(/\*\*Full Round Voice Log \/ Narrative\*\*:\s*/i);
    const roundTranscript = narrSplit[1]
      ? narrSplit[1].split('====')[0].trim()
      : '';

    const players = [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: jTotal }];
    if (kTotal !== null) {
      players.push({ id: 'jack', name: 'Jack', tag: 'J2', total: kTotal });
    }

    const candidateRound: HistoricalRound = {
      id: roundId,
      courseName: rCourse,
      totalHoles: holes.length || matchedCourse?.totalHoles || 9,
      date: rDate,
      duration: durMatch ? durMatch[1] : '00:30:00',
      par: rPar,
      players,
      holes,
      windCondition: (windMatch
        ? windMatch[1].toLowerCase()
        : 'calm') as CaddieScenario,
      roundTranscript,
      gameMode: 'stroke',
      updatedAt: Date.now()
    };

    const deletedSet = new Set<string>(readDeletedIdsFromStorage());
    if (!isRoundDeleted(candidateRound, deletedSet)) {
      parsedRounds.push(candidateRound);
    }
  }

  return parsedRounds;
}

/**
 * Builds a compact delta packet containing newly logged/updated rounds, active scorecard state,
 * bag overrides, and `deletedIds` tombstones so cross-device relay messages stay fast and lightweight.
 */
function buildCompactDeltaPacket(state: AppExportPayload): CloudSyncDeltaPacket {
  const combinedDeletedIds = mergeDeletedIds(state.deletedIds);
  const deletedSet = new Set<string>(combinedDeletedIds);

  const builtInById = new Map<number, HistoricalRound>();
  for (const r of INITIAL_USER_EXPORT.history) {
    builtInById.set(r.id, r);
  }

  // Include all custom rounds plus any built-in rounds whose scores or transcripts were modified,
  // excluding any round present in `deletedIds`
  const customRounds = (state.history || []).filter((r) => {
    if (isRoundDeleted(r, deletedSet)) return false;
    const builtIn = builtInById.get(r.id);
    if (!builtIn) return true;
    const bJ = builtIn.players.find((p) => p.id === 'jeffery')?.total;
    const rJ = r.players.find((p) => p.id === 'jeffery')?.total;
    return bJ !== rJ || (r.updatedAt || 0) > 1_762_000_000_000;
  });

  const builtInBagById = new Map<string, DiscItem>();
  for (const d of INITIAL_DISC_BAG) {
    builtInBagById.set(d.id, d);
  }

  const bagOverrides: Array<Partial<DiscItem> & { id: string; updatedAt?: number }> = [];
  for (const d of state.bag || []) {
    if (isDiscDeleted(d, deletedSet)) continue;
    const base = builtInBagById.get(d.id);
    if (!base) {
      const { cardImage, ...rest } = d;
      bagOverrides.push({
        ...rest,
        cardImage:
          cardImage && !cardImage.startsWith('data:') ? cardImage : undefined
      });
    } else if (
      d.archived !== base.archived ||
      d.personalFlightNotes !== base.personalFlightNotes ||
      d.weightGrams !== base.weightGrams ||
      (d.updatedAt || 0) > 0
    ) {
      bagOverrides.push({
        id: d.id,
        archived: d.archived,
        personalFlightNotes: d.personalFlightNotes,
        weightGrams: d.weightGrams,
        updatedAt: d.updatedAt
      });
    }
  }

  return {
    v: 1,
    channel: CLOUD_SYNC_CHANNEL,
    deviceId: state.deviceId || getOrCreateDeviceId(),
    updatedAt: state.updatedAt || Date.now(),
    customRounds,
    allRoundIds: (state.history || [])
      .filter((r) => !isRoundDeleted(r, deletedSet))
      .map((r) => r.id),
    roundState: state.roundState,
    isRoundInProgress: state.isRoundInProgress,
    bagOverrides,
    verifiedHolePicks: state.verifiedHolePicks,
    bgTheme: state.bgTheme,
    deletedIds: combinedDeletedIds,
    forceOverwrite: state.forceOverwrite,
    forceOverwriteAt: state.forceOverwriteAt
  };
}

function expandDeltaPacketToPayload(delta: CloudSyncDeltaPacket): Partial<AppExportPayload> {
  const combinedDeletedIds = mergeDeletedIds(delta.deletedIds);
  const deletedSet = new Set<string>(combinedDeletedIds);

  const history = mergeRoundHistories(
    INITIAL_USER_EXPORT.history,
    (delta.customRounds || []).filter((r) => !isRoundDeleted(r, deletedSet)),
    combinedDeletedIds
  );

  const bag = INITIAL_DISC_BAG.filter((d) => !isDiscDeleted(d, deletedSet)).map(
    (baseDisc) => {
      const override = (delta.bagOverrides || []).find((o) => o.id === baseDisc.id);
      return override ? ({ ...baseDisc, ...override } as DiscItem) : baseDisc;
    }
  );
  for (const ov of delta.bagOverrides || []) {
    if (
      !isDiscDeleted(ov, deletedSet) &&
      !bag.some((d) => d.id === ov.id) &&
      ov.name
    ) {
      bag.push(ov as DiscItem);
    }
  }

  return {
    updatedAt: delta.updatedAt,
    deviceId: delta.deviceId,
    history,
    bag,
    roundState: delta.roundState,
    isRoundInProgress: delta.isRoundInProgress,
    verifiedHolePicks: delta.verifiedHolePicks,
    bgTheme: delta.bgTheme,
    deletedIds: combinedDeletedIds,
    forceOverwrite: delta.forceOverwrite,
    forceOverwriteAt: delta.forceOverwriteAt
  };
}

/**
 * Executes a network fetch wrapped with an AbortController timeout (default 2500ms)
 * and a try/finally block so slow or unreachable endpoints never hang Cloud Sync.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 2500
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch {
      // Ignore abort errors
    }
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Pushes the latest merged state to:
 * 1. Local Vite/Express server endpoint `/api/sync` (persisted to `./cloud_sync_state.json`)
 * 2. Cross-device browser relay (`ntfy.sh/jbray-dg-199x-sync` chunked JSON packets + `bytebin` blob fallback)
 */
export async function pushStateToCloud(
  state: AppExportPayload
): Promise<{ ok: boolean; syncedState?: AppExportPayload }> {
  let serverMergedState: AppExportPayload | undefined;
  let anySuccess = false;

  const combinedDeletedIds = mergeDeletedIds(state.deletedIds);
  const deletedSet = new Set<string>(combinedDeletedIds);

  const compactBag = (state.bag || INITIAL_DISC_BAG)
    .filter((d) => !isDiscDeleted(d, deletedSet))
    .map((d) => ({
      ...d,
      cardImage:
        d.cardImage && d.cardImage.startsWith('data:')
          ? PUBLIC_HD_CARD_MAP[d.id] || undefined
          : d.cardImage
    }));

  const cleanState: AppExportPayload = {
    ...state,
    history: (state.history || []).filter((r) => !isRoundDeleted(r, deletedSet)),
    bag: compactBag,
    deletedIds: combinedDeletedIds,
    updatedAt: state.updatedAt || Date.now(),
    deviceId: state.deviceId || getOrCreateDeviceId()
  };

  // 1. Push to /api/sync server endpoint (with 2500ms AbortController timeout)
  try {
    const res = await fetchWithTimeout(
      '/api/sync',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanState)
      },
      2500
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        serverMergedState = data.state as AppExportPayload;
      }
      anySuccess = true;
    }
  } catch {
    // Server endpoint may be unavailable on static hosts; proceed to cloud relay
  } finally {
    // Completed /api/sync attempt
  }

  // 2. Push compact delta packet to cross-device relay (ntfy.sh + bytebin pointer fallback)
  try {
    const delta = buildCompactDeltaPacket(
      cleanState.forceOverwrite ? cleanState : serverMergedState || cleanState
    );

    // Optional full blob upload to bytebin.lucko.me (CORS-enabled JSON store)
    try {
      const blobRes = await fetchWithTimeout(
        'https://bytebin.lucko.me/post',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(delta)
        },
        2500
      );
      if (blobRes.ok) {
        const blobData = await blobRes.json();
        if (blobData && blobData.key) {
          delta.blobUrl = `https://bytebin.lucko.me/${blobData.key}`;
        }
      }
    } catch {
      // Ignore if bytebin is unreachable; chunked ntfy payload carries full delta
    } finally {
      // Completed bytebin attempt
    }

    const serializedDelta = JSON.stringify(delta);
    const MAX_CHUNK_SIZE = 2600;
    const totalChunks = Math.max(
      1,
      Math.ceil(serializedDelta.length / MAX_CHUNK_SIZE)
    );
    const batchId = `${delta.updatedAt}-${Math.random().toString(36).slice(2, 6)}`;

    for (let i = 0; i < totalChunks; i++) {
      const slice = serializedDelta.slice(
        i * MAX_CHUNK_SIZE,
        (i + 1) * MAX_CHUNK_SIZE
      );
      const envelope: NtfyChunkEnvelope = {
        _dgSyncChunk: true,
        channel: CLOUD_SYNC_CHANNEL,
        batchId,
        deviceId: delta.deviceId,
        updatedAt: delta.updatedAt,
        chunkIndex: i,
        totalChunks,
        data: slice
      };
      const ntfyRes = await fetchWithTimeout(
        `https://ntfy.sh/${CLOUD_SYNC_CHANNEL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            Title: 'DG Cloud Sync'
          },
          body: JSON.stringify(envelope)
        },
        2500
      );
      if (ntfyRes.ok) {
        anySuccess = true;
      }
    }
  } catch {
    // Ignore network errors when offline
  } finally {
    if (anySuccess) {
      try {
        localStorage.setItem(CLOUD_LAST_SYNC_KEY, new Date().toISOString());
      } catch {
        // Ignore
      }
    }
  }

  return { ok: anySuccess, syncedState: serverMergedState };
}

/**
 * Pulls remote state from both `/api/sync` (`./cloud_sync_state.json`) and the cross-device
 * `ntfy.sh/jbray-dg-199x-sync` relay, merging all rounds, scores, and bags non-destructively.
 * Strictly respects `deletedIds` tombstones and `forceOverwriteAt` checkpoints, and never
 * triggers `hasRemoteUpdates` unless the actual data fingerprint changed.
 */
export async function pullAndMergeFromCloud(
  currentLocalState: AppExportPayload
): Promise<{
  ok: boolean;
  mergedState: AppExportPayload;
  hasRemoteUpdates: boolean;
  needsCloudPush: boolean;
}> {
  const initialLocalFp = computeDataFingerprint(currentLocalState);
  let workingState: AppExportPayload = {
    ...currentLocalState,
    deletedIds: mergeDeletedIds(currentLocalState.deletedIds)
  };
  let anyReachable = false;
  let latestRemoteFp = initialLocalFp;

  // 1. Pull from local/container server endpoint `/api/sync`
  let serverState: AppExportPayload | null = null;
  try {
    const res = await fetchWithTimeout(
      `/api/sync?t=${Date.now()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      },
      2500
    );
    if (res.ok) {
      anyReachable = true;
      const data = await res.json();
      if (data && data.state && Array.isArray(data.state.history)) {
        serverState = data.state as AppExportPayload;
        latestRemoteFp = computeDataFingerprint(serverState);
      }
    }
  } catch {
    // Ignore if server route is unavailable
  } finally {
    // Completed /api/sync pull attempt
  }

  // 2. Pull from cross-device ntfy.sh relay (`jbray-dg-199x-sync`)
  const decodedDeltas: CloudSyncDeltaPacket[] = [];
  try {
    const ntfyRes = await fetchWithTimeout(
      `https://ntfy.sh/${CLOUD_SYNC_CHANNEL}/json?poll=1&since=72h`,
      {
        method: 'GET',
        cache: 'no-store'
      },
      2500
    );
    if (ntfyRes.ok) {
      anyReachable = true;
      const text = await ntfyRes.text();
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const batches = new Map<
        string,
        {
          updatedAt: number;
          totalChunks: number;
          chunks: Map<number, string>;
        }
      >();

      for (const line of lines) {
        try {
          const eventObj = JSON.parse(line);
          if (eventObj.event !== 'message' || typeof eventObj.message !== 'string') {
            continue;
          }
          const env = JSON.parse(eventObj.message) as NtfyChunkEnvelope;
          if (!env || !env._dgSyncChunk || env.channel !== CLOUD_SYNC_CHANNEL) {
            continue;
          }
          if (!batches.has(env.batchId)) {
            batches.set(env.batchId, {
              updatedAt: env.updatedAt || 0,
              totalChunks: env.totalChunks || 1,
              chunks: new Map()
            });
          }
          batches.get(env.batchId)!.chunks.set(env.chunkIndex, env.data);
        } catch {
          // Skip non-JSON messages
        }
      }

      const completeBatches = Array.from(batches.values())
        .filter((b) => b.chunks.size === b.totalChunks)
        .sort((a, b) => a.updatedAt - b.updatedAt);

      for (const batch of completeBatches) {
        try {
          let fullJson = '';
          for (let i = 0; i < batch.totalChunks; i++) {
            fullJson += batch.chunks.get(i) || '';
          }
          let delta = JSON.parse(fullJson) as CloudSyncDeltaPacket;

          // Only fetch blobUrl if customRounds is not an array (an empty [] is valid!)
          if (delta.blobUrl && !Array.isArray(delta.customRounds)) {
            try {
              const bRes = await fetchWithTimeout(delta.blobUrl, {}, 2500);
              if (bRes.ok) {
                delta = (await bRes.json()) as CloudSyncDeltaPacket;
              }
            } catch {
              // Use inline delta
            } finally {
              // Completed blobUrl fetch
            }
          }
          decodedDeltas.push(delta);
        } catch {
          // Ignore malformed batch
        }
      }
    }
  } catch {
    // Ignore if offline
  } finally {
    // Completed ntfy pull attempt
  }

  // 3. Pre-pass: Union ALL deletedIds across local, serverState, and all ntfy batches FIRST!
  // Also find the newest forceOverwrite checkpoint so any batch older than a Force Overwrite
  // cannot resurrect wiped test rounds.
  let maxForceOverwriteAt = workingState.forceOverwriteAt || 0;
  let winningForceRoundIds: Set<number> | null = null;

  if (
    serverState?.forceOverwrite &&
    (serverState.forceOverwriteAt || 0) > maxForceOverwriteAt
  ) {
    maxForceOverwriteAt = serverState.forceOverwriteAt || 0;
    winningForceRoundIds = new Set(
      (serverState.history || []).map((r) => r.id)
    );
  }

  for (const d of decodedDeltas) {
    if (d.deletedIds && d.deletedIds.length > 0) {
      workingState.deletedIds = mergeDeletedIds(
        workingState.deletedIds,
        d.deletedIds
      );
    }
    if (d.forceOverwrite && (d.forceOverwriteAt || d.updatedAt || 0) >= maxForceOverwriteAt) {
      maxForceOverwriteAt = d.forceOverwriteAt || d.updatedAt || 0;
      if (Array.isArray(d.allRoundIds)) {
        winningForceRoundIds = new Set(d.allRoundIds);
      } else {
        const ids = new Set<number>(
          INITIAL_USER_EXPORT.history.map((r) => r.id)
        );
        for (const cr of d.customRounds || []) ids.add(cr.id);
        winningForceRoundIds = ids;
      }
    }
  }

  // If a Force Overwrite occurred in the cloud, tombstone any round from older batches or server state
  // that was not part of the Force Overwrite snapshot!
  if (winningForceRoundIds) {
    const extraTombstones: string[] = [];
    for (const d of decodedDeltas) {
      if ((d.updatedAt || 0) < maxForceOverwriteAt) {
        for (const oldRound of d.customRounds || []) {
          if (!winningForceRoundIds.has(oldRound.id)) {
            extraTombstones.push(...getRoundTombstoneKeys(oldRound));
          }
        }
      }
    }
    if (serverState && (serverState.updatedAt || 0) < maxForceOverwriteAt) {
      for (const oldRound of serverState.history || []) {
        if (!winningForceRoundIds.has(oldRound.id)) {
          extraTombstones.push(...getRoundTombstoneKeys(oldRound));
        }
      }
    }
    for (const localRound of workingState.history || []) {
      if (
        (workingState.forceOverwriteAt || 0) < maxForceOverwriteAt &&
        !winningForceRoundIds.has(localRound.id) &&
        (localRound.updatedAt || 0) < maxForceOverwriteAt
      ) {
        extraTombstones.push(...getRoundTombstoneKeys(localRound));
      }
    }
    if (extraTombstones.length > 0) {
      workingState.deletedIds = mergeDeletedIds(
        workingState.deletedIds,
        extraTombstones
      );
    }
  }

  // 4. Merge serverState (if not superseded by a newer forceOverwrite)
  if (serverState) {
    const merged = mergeCloudPayloads(workingState, serverState);
    workingState = merged.payload;
  }

  // 5. Merge ntfy batches that are at or after maxForceOverwriteAt
  for (const delta of decodedDeltas) {
    if (maxForceOverwriteAt > 0 && (delta.updatedAt || 0) < maxForceOverwriteAt) {
      continue;
    }
    const remotePartial = expandDeltaPacketToPayload(delta);
    latestRemoteFp = computeDataFingerprint(remotePartial);
    const merged = mergeCloudPayloads(workingState, remotePartial);
    workingState = merged.payload;
  }

  // Final tombstone sweep on workingState (even if resulting history is [])
  const finalDeletedSet = new Set<string>(
    mergeDeletedIds(workingState.deletedIds)
  );
  workingState = {
    ...workingState,
    history: (workingState.history || []).filter(
      (r) => !isRoundDeleted(r, finalDeletedSet)
    ),
    bag: (workingState.bag || []).filter(
      (d) => !isDiscDeleted(d, finalDeletedSet)
    ),
    deletedIds: Array.from(finalDeletedSet)
  };

  if (anyReachable) {
    try {
      localStorage.setItem(CLOUD_LAST_SYNC_KEY, new Date().toISOString());
    } catch {
      // Ignore
    }
  }

  const finalMergedFp = computeDataFingerprint(workingState);

  return {
    ok: anyReachable,
    mergedState: workingState,
    hasRemoteUpdates: finalMergedFp !== initialLocalFp,
    needsCloudPush: finalMergedFp !== latestRemoteFp
  };
}

/**
 * Overwrites cloud state with this device's exact current rounds, bags, and deletions.
 * Inspects any rounds currently sitting in `/api/sync` or `ntfy.sh` that are NOT on this device,
 * adds their IDs and deterministic fallback signatures to `deletedIds`, and pushes a
 * `forceOverwrite: true` checkpoint so any stuck test round on another device is wiped on its next load.
 */
export async function forceOverwriteCloudWithLocalState(
  exactLocalState: AppExportPayload
): Promise<{ ok: boolean; overwrittenState: AppExportPayload }> {
  const localRoundIds = new Set((exactLocalState.history || []).map((r) => r.id));
  const newTombstones: string[] = [];

  // Tombstone any built-in round that was deleted locally
  for (const bRound of INITIAL_USER_EXPORT.history) {
    if (!localRoundIds.has(bRound.id)) {
      newTombstones.push(...getRoundTombstoneKeys(bRound));
    }
  }

  // Inspect current cloud state to tombstone any stuck remote test rounds not on this device
  try {
    const pullRes = await pullAndMergeFromCloud(exactLocalState);
    for (const remoteRound of pullRes.mergedState.history || []) {
      if (!localRoundIds.has(remoteRound.id)) {
        newTombstones.push(...getRoundTombstoneKeys(remoteRound));
      }
    }
  } catch {
    // Ignore pull error
  } finally {
    // Completed pre-overwrite inspection
  }

  const combinedDeletedIds = mergeDeletedIds(
    exactLocalState.deletedIds,
    newTombstones
  );
  const deletedSet = new Set<string>(combinedDeletedIds);
  const now = Date.now();

  const overwrittenState: AppExportPayload = {
    ...exactLocalState,
    history: (exactLocalState.history || []).filter(
      (r) => !isRoundDeleted(r, deletedSet)
    ),
    bag: (exactLocalState.bag || []).filter(
      (d) => !isDiscDeleted(d, deletedSet)
    ),
    deletedIds: combinedDeletedIds,
    updatedAt: now,
    forceOverwrite: true,
    forceOverwriteAt: now
  };

  writeMergedStateToLocalStorageAndDashboard(overwrittenState);
  const pushRes = await pushStateToCloud(overwrittenState);
  return {
    ok: pushRes.ok,
    overwrittenState
  };
}

