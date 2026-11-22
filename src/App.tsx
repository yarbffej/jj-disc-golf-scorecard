/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Home,
  ClipboardList,
  BarChart3,
  History,
  Compass,
  Map as MapIcon,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  isSoundFxEnabled,
  playChainRattleSfx,
  setSoundFxEnabled as persistSoundFxEnabled
} from './utils/soundFx';
import {
  ActiveRoundState,
  AppExportPayload,
  BgThemeMode,
  CaddieScenario,
  CourseTemplate,
  DASHBOARD_HD_CARD_MAP,
  DiscItem,
  HistoricalRound,
  INITIAL_COURSE_TEMPLATES,
  INITIAL_DISC_BAG,
  INITIAL_USER_EXPORT,
  PUBLIC_HD_CARD_MAP,
  PlayerRosterItem,
  TimerState,
  getDiscCardImageUrl
} from './data/initialData';
import { HomeHubView } from './components/HomeHubView';
import { LiveScorecardView } from './components/LiveScorecardView';
import { RivalryAnalyticsView } from './components/RivalryAnalyticsView';
import { RoundHistoryView } from './components/RoundHistoryView';
import { CoursesAndBagView } from './components/CoursesAndBagView';
import { CourseAtlasView } from './components/CourseAtlasView';
import { SyncAndRosterView } from './components/SyncAndRosterView';
import { VoiceLogImporterModal } from './components/VoiceLogImporterModal';
import { RhbhShotFinder } from './components/RhbhShotFinder';
import { ParsedVoiceRoundResult } from './utils/voiceLogParser';
import {
  generateFullChatGptReport,
  syncDossierToDashboard
} from './utils/reportGenerator';
import {
  CloudSyncStatus,
  DELETED_IDS_STORAGE_KEY,
  DOSSIER_STORAGE_KEY,
  computeDataFingerprint,
  forceOverwriteCloudWithLocalState,
  isDiscDeleted,
  isRoundDeleted,
  isValidBgTheme,
  mergeDeletedIds,
  mergeDiscBags,
  mergeRoundHistories,
  parseDossierTextIntoRounds,
  pullAndMergeFromCloud,
  pushStateToCloud,
  readDeletedIdsFromStorage,
  recordDeletedItem,
  recordDeletedRound,
  writeDeletedIdsToStorage,
  writeMergedStateToLocalStorageAndDashboard
} from './utils/cloudSync';

const STORAGE_KEY = 'jj_disc_golf_v108_master_state';
const LEGACY_STORAGE_KEYS = [
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
const THEME_STORAGE_KEY = 'jj_disc_golf_bg_theme_v4';

function normalizeCourseSignature(courseName?: string): string {
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
  if (raw.includes('black hoof') && !raw.includes('championship')) return 'blackhoof';
  if (raw.includes('cedar ridge') || raw.includes('cedarridge')) return 'cedarridge';
  if (raw.includes('wyandotte')) return 'wyandotte';
  if (raw.includes('heritage')) return 'heritage_park';
  return raw.replace(/[^a-z0-9]/g, '');
}

function sortRoundsChronologically(rounds: HistoricalRound[]): HistoricalRound[] {
  return [...rounds].sort(
    (a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id
  );
}

const DASHBOARD_CARD_DISC_IDS = [
  'innova-xt-glow-nova',
  'innova-proto-glow-aviar',
  'innova-yeti-pro-aviar',
  'innova-kc-pro-aviar',
  'innova-sugar-glow-roc',
  'innova-proto-glow-mako3',
  'innova-sugar-star-rollo',
  'innova-glow-leopard3',
  'innova-glow-teebird',
  'innova-champion-eagle',
  'innova-sugar-star-roadrunner',
  'innova-luster-firebird',
  'innova-halo-wraith',
  'innova-halo-destroyer',
  'innova-aviar',
  'innova-sync',
  'innova-toro',
  'innova-toro-alt',
  'innova-dx-alien',
  'innova-rollo',
  'innova-mako3',
  'innova-jay',
  'innova-roc3',
  'innova-classic-glow-roc',
  'innova-it',
  'innova-leopard3',
  'innova-archangel',
  'innova-roadrunner',
  'innova-classic-glow-beast',
  'innova-mamba',
  'innova-classic-glow-wraith'
] as const;

function buildAndSaveHdCardMap(currentBag: DiscItem[]): Record<string, string> {
  const cardMap: Record<string, string> = { ...DASHBOARD_HD_CARD_MAP };
  const fallbackPublicMap: Record<string, string> = { ...PUBLIC_HD_CARD_MAP };

  for (const disc of currentBag) {
    const resolved = getDiscCardImageUrl(disc);
    if (resolved) {
      cardMap[disc.id] = resolved;
    }
    if (PUBLIC_HD_CARD_MAP[disc.id]) {
      fallbackPublicMap[disc.id] = PUBLIC_HD_CARD_MAP[disc.id];
    } else if (resolved && !resolved.startsWith('data:')) {
      fallbackPublicMap[disc.id] = resolved;
    }
  }

  // Ensure all 15 required Innova trading card IDs (including innova-toro-alt) are mapped
  for (const id of DASHBOARD_CARD_DISC_IDS) {
    if (!cardMap[id]) {
      cardMap[id] =
        DASHBOARD_HD_CARD_MAP[id] ||
        PUBLIC_HD_CARD_MAP[id] ||
        cardMap['innova-toro'];
    }
    if (!fallbackPublicMap[id]) {
      fallbackPublicMap[id] =
        PUBLIC_HD_CARD_MAP[id] || fallbackPublicMap['innova-toro'];
    }
  }

  try {
    localStorage.setItem('jj_disc_golf_hd_cards_v1', JSON.stringify(cardMap));
  } catch {
    try {
      // If base64 data URIs exceed browser localStorage quota, save the public asset URL map
      localStorage.setItem(
        'jj_disc_golf_hd_cards_v1',
        JSON.stringify(fallbackPublicMap)
      );
    } catch {
      // Ignore storage errors
    }
  }

  return cardMap;
}

type NavTab =
  | 'home'
  | 'live'
  | 'atlas'
  | 'rivalry'
  | 'history'
  | 'courses'
  | 'sync'
  | 'dashboard';
export type TileStyleMode = 'auto' | 'acrylic' | 'holo' | 'hud' | 'white' | 'frosted' | 'paper';

const TILE_STYLE_STORAGE_KEY = 'jj_disc_golf_tile_style_v4';

export const BG_THEME_OPTIONS: ReadonlyArray<{
  id: BgThemeMode;
  label: string;
  surface: 'light' | 'dark';
  swatch: string;
}> = [
  {
    id: 'sugar',
    label: '🍬 Cotton Candy Neon',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #FF2E93 0%, #9333EA 50%, #00F0FF 100%)'
  },
  {
    id: 'midnight',
    label: '🌙 Glow-Disc Night',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #1E1B4B 0%, #39FF14 100%)'
  },
  {
    id: 'sunset',
    label: '🕹️ Outrun Arcade 80s',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #FF2E93 0%, #FF6B2C 55%, #FFE600 100%)'
  },
  {
    id: 'glow',
    label: '☢️ Cyber Rangefinder',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #041E2B 0%, #00F0FF 55%, #CCFF00 100%)'
  },
  {
    id: 'championship',
    label: '💎 Cobalt Pro Tour',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #1E3A8A 0%, #38BDF8 60%, #FACC15 100%)'
  },
  {
    id: 'turf',
    label: '☀️ Sunburst Comic',
    surface: 'light',
    swatch: 'linear-gradient(135deg, #FFE600 0%, #FF4D94 100%)'
  },
  {
    id: 'adventure',
    label: '🌲 Emerald Fairway',
    surface: 'light',
    swatch: 'linear-gradient(135deg, #064E3B 0%, #10B981 60%, #FACC15 100%)'
  }
];

export const TILE_STYLE_OPTIONS: ReadonlyArray<{
  id: TileStyleMode;
  label: string;
  surface: 'auto' | 'light' | 'dark';
  swatch: string;
}> = [
  {
    id: 'auto',
    label: 'Tactical Glass',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #111915 0%, #CCFF00 100%)'
  },
  {
    id: 'acrylic',
    label: 'Obsidian Matte',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #111915 0%, #090D0B 100%)'
  },
  {
    id: 'holo',
    label: 'Rangefinder Foil',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #FF5722 0%, #CCFF00 100%)'
  },
  {
    id: 'hud',
    label: 'Telemetry Wire',
    surface: 'dark',
    swatch: 'linear-gradient(135deg, #090D0B 0%, #CCFF00 100%)'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [focusedDiscId, setFocusedDiscId] = useState<string | null>(null);
  const [focusedAtlasCourse, setFocusedAtlasCourse] = useState<string | null>(null);
  const [focusedHistoryCourse, setFocusedHistoryCourse] = useState<string | null>(null);
  const [bagOwnerFilter, setBagOwnerFilter] = useState<'jeffery' | 'jack' | 'all'>('jeffery');
  const [soundFxEnabled, setSoundFxEnabled] = useState<boolean>(() => isSoundFxEnabled());

  const handleToggleSoundFx = () => {
    const next = !soundFxEnabled;
    setSoundFxEnabled(next);
    persistSoundFxEnabled(next);
    if (next) {
      playChainRattleSfx('birdie', true);
    }
  };

  const [bgTheme, setBgTheme] = useState<BgThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (isValidBgTheme(savedTheme)) {
        return savedTheme;
      }
    } catch {
      // Fallback
    }
    return 'sugar';
  });

  const [tileStyle, setTileStyle] = useState<TileStyleMode>(() => {
    try {
      const savedTile = localStorage.getItem(TILE_STYLE_STORAGE_KEY) as TileStyleMode | null;
      if (savedTile && TILE_STYLE_OPTIONS.some((opt) => opt.id === savedTile)) {
        return savedTile;
      }
    } catch {
      // Fallback
    }
    return 'auto';
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, bgTheme);
    } catch {
      // Ignore
    }
    const paperColorByTheme: Record<string, string> = {
      sugar: '#0F051D',
      midnight: '#060A14',
      sunset: '#13061D',
      glow: '#020A0E',
      championship: '#050C22',
      turf: '#FFFBE6',
      adventure: '#D8F3E2'
    };
    const nextColor = paperColorByTheme[bgTheme] || '#0F051D';
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = nextColor;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', nextColor);
      }
    }
  }, [bgTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(TILE_STYLE_STORAGE_KEY, tileStyle);
    } catch {
      // Ignore
    }
  }, [tileStyle]);

  // Always start at the top of the page when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [deletedIds, setDeletedIds] = useState<string[]>(() =>
    readDeletedIdsFromStorage()
  );

  const [history, setHistory] = useState<HistoricalRound[]>(() => {
    const initialDeletedSet = new Set<string>(readDeletedIdsFromStorage());
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          const candidate = localStorage.getItem(legacyKey);
          if (candidate) {
            saved = candidate;
            break;
          }
        }
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.deletedIds)) {
          for (const dId of mergeDeletedIds(parsed.deletedIds)) {
            initialDeletedSet.add(dId);
          }
        }
        if (Array.isArray(parsed.history)) {
          const builtInIds = new Set(INITIAL_USER_EXPORT.history.map((r) => r.id));
          const builtInCourseDateScoreKeys = new Set(
            INITIAL_USER_EXPORT.history.map(
              (r) =>
                `${r.date}::${normalizeCourseSignature(r.courseName)}::${
                  r.players?.[0]?.total ?? ''
                }`
            )
          );
          const canonicalDateCourseCounts = new Map<string, number>();
          for (const r of INITIAL_USER_EXPORT.history) {
            const dcKey = `${r.date}::${normalizeCourseSignature(r.courseName)}`;
            canonicalDateCourseCounts.set(dcKey, (canonicalDateCourseCounts.get(dcKey) || 0) + 1);
          }
          const builtInSingleRoundDateCourseKeys = new Set<string>();
          for (const r of INITIAL_USER_EXPORT.history) {
            const dcKey = `${r.date}::${normalizeCourseSignature(r.courseName)}`;
            if (
              (canonicalDateCourseCounts.get(dcKey) || 0) === 1 &&
              ((r.totalHoles || r.holes.length) >= 18 ||
                r.date === '2026-11-17' ||
                r.date === '2026-11-15')
            ) {
              builtInSingleRoundDateCourseKeys.add(dcKey);
            }
          }
          const byId = new Map<number, HistoricalRound>();

          // 1. Canonical built-in rounds always keep their true historical dates & transcripts (unless deleted)
          for (const r of INITIAL_USER_EXPORT.history) {
            if (
              r &&
              typeof r.id === 'number' &&
              !isRoundDeleted(r, initialDeletedSet)
            ) {
              byId.set(r.id, r);
            }
          }

          // 2. Merge any custom rounds saved on device, skipping deleted rounds and duplicates of canonical rounds
          for (const r of parsed.history as HistoricalRound[]) {
            if (!r || typeof r.id !== 'number') continue;
            if (isRoundDeleted(r, initialDeletedSet)) continue;
            if (builtInIds.has(r.id)) continue;

            const courseNorm = normalizeCourseSignature(r.courseName);
            // Filter out accidental 2026-11-03 Harmon Park flip (replaced by canonical 2026-11-03 Sar-Ko-Par round)
            if (r.date === '2026-11-03' && courseNorm === 'harmon') {
              continue;
            }
            const sigKey = `${r.date}::${courseNorm}::${r.players?.[0]?.total ?? ''}`;
            if (builtInCourseDateScoreKeys.has(sigKey)) {
              continue;
            }
            if (builtInSingleRoundDateCourseKeys.has(`${r.date}::${courseNorm}`)) {
              continue;
            }

            byId.set(r.id, r);
          }

          return sortRoundsChronologically(
            Array.from(byId.values()).filter(
              (r) => !isRoundDeleted(r, initialDeletedSet)
            )
          );
        }
      }
    } catch {
      // Fallback to initial export
    }
    return sortRoundsChronologically(
      INITIAL_USER_EXPORT.history.filter(
        (r) => !isRoundDeleted(r, initialDeletedSet)
      )
    );
  });

  const [roster, setRoster] = useState<PlayerRosterItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.roster) && parsed.roster.length > 0) {
          return parsed.roster;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_USER_EXPORT.roster;
  });

  const [courses, setCourses] = useState<CourseTemplate[]>(() => {
    return INITIAL_COURSE_TEMPLATES;
  });

  const [bag, setBag] = useState<DiscItem[]>(() => {
    const initialDeletedSet = new Set<string>(readDeletedIdsFromStorage());
    let savedBag: DiscItem[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.bag)) {
          savedBag = parsed.bag;
        }
      }
    } catch {
      // Fallback
    }
    const filteredBag = mergeDiscBags(
      savedBag,
      INITIAL_DISC_BAG,
      initialDeletedSet
    );
    buildAndSaveHdCardMap(filteredBag);
    return filteredBag;
  });

  useEffect(() => {
    buildAndSaveHdCardMap(bag);
  }, [bag]);

  const [roundState, setRoundState] = useState<ActiveRoundState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.roundState && Array.isArray(parsed.roundState.holes)) {
          const rs = parsed.roundState as ActiveRoundState;
          const allHolesScored =
            rs.holes.length > 0 &&
            rs.holes.every((h) =>
              Object.values(h.scores || {}).some((s) => typeof s === 'number' && s > 0)
            );
          const isStuckCedarRidge =
            (rs.courseKey === 'cedar_ridge' ||
              (rs.courseName || '').toLowerCase().includes('cedar ridge')) &&
            rs.holes.some((h) => (h.scores?.jeffery || 0) > 0);
          if (!allHolesScored && !isStuckCedarRidge) {
            const canonicalCourse = INITIAL_COURSE_TEMPLATES.find(
              (c) => c.key === rs.courseKey
            );
            const syncedHoles = canonicalCourse
              ? rs.holes.map((h) => {
                  const ch = canonicalCourse.holes.find((th) => th.number === h.number);
                  return ch ? { ...h, distance: ch.distance, par: ch.par } : h;
                })
              : rs.holes;
            return {
              ...rs,
              courseName: canonicalCourse ? canonicalCourse.name : rs.courseName,
              holes: syncedHoles,
              activePlayerIds: rs.activePlayerIds || ['jeffery', 'jack'],
              gameMode: rs.gameMode || 'stroke',
              windCondition: rs.windCondition || 'calm',
              updatedAt: rs.updatedAt || Date.now()
            };
          }
        }
      }
    } catch {
      // Fallback
    }
    return {
      ...INITIAL_USER_EXPORT.roundState,
      date: new Date().toISOString().slice(0, 10),
      windCondition: 'calm',
      updatedAt: Date.now()
    };
  });

  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.webhookUrl === 'string') return parsed.webhookUrl;
      }
    } catch {
      // Fallback
    }
    return INITIAL_USER_EXPORT.webhookUrl;
  });

  const [timerState, setTimerState] = useState<TimerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timerState) return parsed.timerState;
      }
    } catch {
      // Fallback
    }
    return INITIAL_USER_EXPORT.timerState;
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showVoiceLogImporter, setShowVoiceLogImporter] = useState<boolean>(false);
  const [showShotFinderModal, setShowShotFinderModal] = useState<boolean>(false);
  const [isRoundInProgress, setIsRoundInProgress] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.roundState && Array.isArray(parsed.roundState.holes)) {
          const rs = parsed.roundState as ActiveRoundState;
          const allHolesScored =
            rs.holes.length > 0 &&
            rs.holes.every((h) =>
              Object.values(h.scores || {}).some((s) => typeof s === 'number' && s > 0)
            );
          const isStuckCedarRidge =
            (rs.courseKey === 'cedar_ridge' ||
              (rs.courseName || '').toLowerCase().includes('cedar ridge')) &&
            rs.holes.some((h) => (h.scores?.jeffery || 0) > 0);
          if (allHolesScored || isStuckCedarRidge) {
            return false;
          }
        }
        if (typeof parsed.isRoundInProgress === 'boolean') {
          return parsed.isRoundInProgress;
        }
      }
    } catch {
      // Fallback
    }
    return false;
  });
  const [webhookSyncStatus, setWebhookSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('synced');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string>('');
  const [showSyncMenu, setShowSyncMenu] = useState<boolean>(false);
  const [syncMenuNotice, setSyncMenuNotice] = useState<string>('');
  const isApplyingRemoteRef = useRef<boolean>(false);
  const syncInFlightRef = useRef<boolean>(false);
  const initialPullDoneRef = useRef<boolean>(false);
  const lastSyncedFingerprintRef = useRef<string>('');

  const handleSetRoundState: React.Dispatch<React.SetStateAction<ActiveRoundState>> =
    useCallback((updater) => {
      setRoundState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return {
          ...next,
          updatedAt: Date.now()
        };
      });
    }, []);

  const handleSetBag: React.Dispatch<React.SetStateAction<DiscItem[]>> =
    useCallback((updater) => {
      setBag((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const nextIds = new Set(next.map((d) => d.id));
        for (const oldDisc of prev) {
          if (!nextIds.has(oldDisc.id)) {
            const updatedDel = recordDeletedItem(oldDisc.id);
            setDeletedIds(updatedDel);
          }
        }
        const now = Date.now();
        return next.map((d) => ({
          ...d,
          updatedAt: d.updatedAt || now
        }));
      });
    }, []);

  const anyHoleScored = roundState.holes.some((h) =>
    Object.values(h.scores || {}).some((s) => typeof s === 'number' && s > 0)
  );
  const hasActiveRound =
    isRoundInProgress || anyHoleScored || timerState.running || elapsedSeconds > 0;

  useEffect(() => {
    try {
      const currentDeletedSet = new Set<string>(
        mergeDeletedIds(deletedIds)
      );
      // Strip multi-megabyte inline base64 cardImage strings from STORAGE_KEY so localStorage
      // has ample room for 'jj_disc_golf_hd_cards_v1' and 'jj_disc_golf_latest_dossier_v1'
      const compactBag = bag
        .filter((d) => !isDiscDeleted(d, currentDeletedSet))
        .map((d) => ({
          ...d,
          cardImage:
            d.cardImage && d.cardImage.startsWith('data:')
              ? PUBLIC_HD_CARD_MAP[d.id] || undefined
              : d.cardImage
        }));
      const cleanHistory = history.filter(
        (r) => !isRoundDeleted(r, currentDeletedSet)
      );
      const payload = {
        app: 'Jeffery & Jack Disc Golf Scorecard',
        version: 'v46',
        exportDate: new Date().toISOString(),
        history: cleanHistory,
        roster,
        roundState,
        webhookUrl,
        timerState,
        courses,
        bag: compactBag,
        isRoundInProgress,
        deletedIds: Array.from(currentDeletedSet)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    history,
    roster,
    roundState,
    webhookUrl,
    timerState,
    courses,
    bag,
    isRoundInProgress,
    deletedIds
  ]);

  const latestDossierText = useMemo(
    () =>
      generateFullChatGptReport({
        history,
        bag,
        courses,
        roster,
        roundState
      }),
    [history, bag, courses, roster, roundState]
  );

  const pushDossierToDashboard = useCallback(
    (customDossier?: string) => {
      const dossierText = customDossier ?? latestDossierText;
      if (!dossierText) return;
      try {
        localStorage.setItem('jj_disc_golf_latest_dossier_v1', dossierText);
        localStorage.setItem(
          'jj_disc_golf_last_sync_time',
          new Date().toLocaleString()
        );
      } catch {
        // Ignore storage errors
      }
      try {
        (
          window.frames as unknown as Record<string, Window | undefined>
        )['analytics-dashboard']?.postMessage(
          { type: 'DISC_GOLF_DOSSIER_SYNC', dossierText },
          '*'
        );
      } catch {
        // Ignore cross-frame postMessage errors
      }
      syncDossierToDashboard(dossierText);
    },
    [latestDossierText]
  );

  // Automatically save latest dossier and postMessage to the dashboard iframe whenever
  // rounds/scores/bag update or when the Master Dashboard tab is opened
  useEffect(() => {
    pushDossierToDashboard(latestDossierText);
  }, [latestDossierText, activeTab, pushDossierToDashboard]);

  const buildCurrentExportPayload = useCallback(
    (
      overrideHistory?: HistoricalRound[],
      overrideDeletedIds?: string[]
    ): AppExportPayload & {
      isRoundInProgress?: boolean;
      bgTheme?: BgThemeMode;
    } => {
      const mergedDel = mergeDeletedIds(overrideDeletedIds || deletedIds);
      const delSet = new Set<string>(mergedDel);
      const effectiveHistory =
        overrideHistory !== undefined ? overrideHistory : history;
      return {
        app: 'Jeffery & Jack Disc Golf Scorecard',
        version: 'v46',
        exportDate: new Date().toISOString(),
        updatedAt: Date.now(),
        history: effectiveHistory.filter((r) => !isRoundDeleted(r, delSet)),
        roster,
        roundState,
        webhookUrl,
        timerState,
        courses,
        bag: bag.filter((d) => !isDiscDeleted(d, delSet)),
        isRoundInProgress,
        bgTheme,
        deletedIds: mergedDel
      };
    },
    [
      history,
      roster,
      roundState,
      webhookUrl,
      timerState,
      courses,
      bag,
      isRoundInProgress,
      bgTheme,
      deletedIds
    ]
  );

  // Keep a ref to the latest export payload so background polling never recreates callbacks or loops
  const latestPayloadRef = useRef<AppExportPayload>(buildCurrentExportPayload());
  useEffect(() => {
    latestPayloadRef.current = buildCurrentExportPayload();
  }, [buildCurrentExportPayload]);

  // Core Two-Way Cloud Sync Runner (Stable reference -> zero infinite loops, guaranteed <= 2500ms completion)
  const handleCloudSyncNow = useCallback(
    async (options?: { forcePush?: boolean; customPayload?: AppExportPayload }) => {
      if (syncInFlightRef.current) {
        if (options?.forcePush && options.customPayload) {
          void pushStateToCloud(options.customPayload);
        }
        return;
      }
      syncInFlightRef.current = true;
      setCloudSyncStatus('syncing');

      // Hard 2500ms safety watchdog so `Syncing...` ALWAYS finishes within 2.5 seconds
      const watchdogTimer = setTimeout(() => {
        syncInFlightRef.current = false;
        setCloudSyncStatus('synced');
      }, 2500);

      try {
        await Promise.race([
          (async () => {
            const basePayload = options?.customPayload || latestPayloadRef.current;
            const localFp = computeDataFingerprint(basePayload);
            const pullResult = await pullAndMergeFromCloud(basePayload);

            // Union local and remote deletedIds first and strip any deleted rounds/items (even if result is [])
            const latestDeletedIds = mergeDeletedIds(
              basePayload.deletedIds,
              pullResult.mergedState.deletedIds
            );
            const latestDeletedSet = new Set<string>(latestDeletedIds);
            const merged: AppExportPayload = {
              ...pullResult.mergedState,
              history: (pullResult.mergedState.history || []).filter(
                (r) => !isRoundDeleted(r, latestDeletedSet)
              ),
              bag: (pullResult.mergedState.bag || []).filter(
                (d) => !isDiscDeleted(d, latestDeletedSet)
              ),
              deletedIds: latestDeletedIds
            };

            const mergedFp = computeDataFingerprint(merged);
            const dataChangedFromLocal = mergedFp !== localFp;

            // Only update React state and localStorage if actual data fingerprint changed
            if (dataChangedFromLocal) {
              isApplyingRemoteRef.current = true;
              lastSyncedFingerprintRef.current = mergedFp;

              setDeletedIds(latestDeletedIds);
              // Always set history even if merged.history is empty ([])
              setHistory(sortRoundsChronologically(merged.history));
              if (Array.isArray(merged.bag)) {
                setBag(merged.bag);
              }
              if (Array.isArray(merged.courses) && merged.courses.length > 0) {
                setCourses(merged.courses);
              }
              if (Array.isArray(merged.roster) && merged.roster.length > 0) {
                setRoster(merged.roster);
              }
              // Never overwrite local roundState, isRoundInProgress, or bgTheme during Cloud Sync
              // so an active scorecard or visual theme preference never flips back to an old state.
              writeMergedStateToLocalStorageAndDashboard({
                ...merged,
                bgTheme: latestPayloadRef.current.bgTheme,
                roundState: latestPayloadRef.current.roundState,
                isRoundInProgress: latestPayloadRef.current.isRoundInProgress
              });
              setTimeout(() => {
                isApplyingRemoteRef.current = false;
              }, 300);
            }

            // Only push to cloud if explicitly requested OR if merged data fingerprint is strictly different from cloud
            if (options?.forcePush || pullResult.needsCloudPush) {
              await pushStateToCloud(merged);
            }

            lastSyncedFingerprintRef.current = mergedFp;
            initialPullDoneRef.current = true;
            setLastCloudSyncTime(
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );
          })(),
          new Promise<void>((resolve) => setTimeout(resolve, 2500))
        ]);
      } catch {
        // Ignore network errors and settle cleanly to synced
      } finally {
        clearTimeout(watchdogTimer);
        syncInFlightRef.current = false;
        setCloudSyncStatus('synced');
      }
    },
    []
  );

  // Force Push This Device to Cloud (wipes any stuck remote test round on other devices, guaranteed <= 2500ms)
  const handleForcePushThisDeviceToCloud = useCallback(async () => {
    setShowSyncMenu(false);
    setCloudSyncStatus('syncing');
    syncInFlightRef.current = true;
    const watchdogTimer = setTimeout(() => {
      syncInFlightRef.current = false;
      setCloudSyncStatus('synced');
    }, 2500);
    try {
      const currentPayload = buildCurrentExportPayload();
      const res = await Promise.race([
        forceOverwriteCloudWithLocalState(currentPayload),
        new Promise<{ ok: boolean; overwrittenState: AppExportPayload }>((resolve) =>
          setTimeout(
            () => resolve({ ok: true, overwrittenState: currentPayload }),
            2500
          )
        )
      ]);
      const updatedFp = computeDataFingerprint(res.overwrittenState);
      lastSyncedFingerprintRef.current = updatedFp;
      if (res.overwrittenState.deletedIds) {
        setDeletedIds(res.overwrittenState.deletedIds);
      }
      setHistory(sortRoundsChronologically(res.overwrittenState.history));
      setLastCloudSyncTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setSyncMenuNotice('Overwritten!');
      setTimeout(() => setSyncMenuNotice(''), 3000);
    } catch {
      // Ignore error
    } finally {
      clearTimeout(watchdogTimer);
      syncInFlightRef.current = false;
      setCloudSyncStatus('synced');
    }
  }, [buildCurrentExportPayload]);

  // One-Shot Safe Union Sync on Wi-Fi Reconnect / Window Focus (no constant timer polling, and never runs during an active round!)
  const lastAutoSyncAtRef = useRef<number>(0);
  useEffect(() => {
    lastSyncedFingerprintRef.current = computeDataFingerprint(latestPayloadRef.current);
    initialPullDoneRef.current = true;

    const triggerSafeUnionSync = () => {
      // Never touch state while a live round is actively being scored
      if (latestPayloadRef.current.isRoundInProgress) return;
      const now = Date.now();
      if (now - lastAutoSyncAtRef.current < 10_000) return;
      lastAutoSyncAtRef.current = now;
      const hasPendingWifiPush =
        localStorage.getItem('jj_disc_golf_pending_wifi_sync') === 'true';
      void handleCloudSyncNow({ forcePush: hasPendingWifiPush }).then(() => {
        try {
          localStorage.removeItem('jj_disc_golf_pending_wifi_sync');
        } catch {
          // Ignore storage errors
        }
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerSafeUnionSync();
      }
    };

    // Initial one-shot union sync on load if not mid-round
    triggerSafeUnionSync();

    window.addEventListener('online', triggerSafeUnionSync);
    window.addEventListener('focus', triggerSafeUnionSync);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('online', triggerSafeUnionSync);
      window.removeEventListener('focus', triggerSafeUnionSync);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [handleCloudSyncNow]);

  // Permanent Tombstone Round Deletion Handler (works even when deleting the very last round -> [])
  const handleDeleteRound = useCallback(
    (roundId: number) => {
      const targetRound = history.find((r) => r.id === roundId);
      const updatedDeletedIds = recordDeletedRound(
        targetRound || roundId,
        history
      );
      const deletedSet = new Set<string>(updatedDeletedIds);
      const nextHistory = sortRoundsChronologically(
        history.filter(
          (r) => r.id !== roundId && !isRoundDeleted(r, deletedSet)
        )
      );

      setDeletedIds(updatedDeletedIds);
      setHistory(nextHistory);

      const nextPayload: AppExportPayload = {
        ...buildCurrentExportPayload(nextHistory, updatedDeletedIds),
        history: nextHistory,
        deletedIds: updatedDeletedIds,
        forceOverwrite: false
      };
      lastSyncedFingerprintRef.current = computeDataFingerprint(nextPayload);
      latestPayloadRef.current = nextPayload;

      writeMergedStateToLocalStorageAndDashboard(nextPayload);
      void pushStateToCloud(nextPayload);
      void handleCloudSyncNow({ forcePush: true, customPayload: nextPayload });
    },
    [history, buildCurrentExportPayload, handleCloudSyncNow]
  );

  // Two-Way Dashboard <-> Scorecard Sync: ingest rounds or bags synced from inside the Master Dashboard iframe
  const ingestDossierFromDashboard = useCallback(
    (dossierText: string) => {
      if (!dossierText || dossierText === latestDossierText) return;
      const parsedRounds = parseDossierTextIntoRounds(
        dossierText,
        history,
        courses
      );
      if (parsedRounds.length === 0) return;

      const merged = mergeRoundHistories(history, parsedRounds, deletedIds);
      const prevSig = history
        .map((r) => `${r.id}:${r.players.map((p) => p.total).join(',')}`)
        .join('|');
      const nextSig = merged
        .map((r) => `${r.id}:${r.players.map((p) => p.total).join(',')}`)
        .join('|');

      if (prevSig !== nextSig) {
        const nextHistory = sortRoundsChronologically(merged);
        setHistory(nextHistory);
        const nextPayload = buildCurrentExportPayload(nextHistory);
        writeMergedStateToLocalStorageAndDashboard(nextPayload);
        void handleCloudSyncNow({ forcePush: true, customPayload: nextPayload });
      }
    },
    [
      latestDossierText,
      courses,
      history,
      deletedIds,
      buildCurrentExportPayload,
      handleCloudSyncNow
    ]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (
        (data.type === 'DISC_GOLF_DOSSIER_SYNC' ||
          data.type === 'DASHBOARD_DOSSIER_UPDATED') &&
        typeof data.dossierText === 'string'
      ) {
        ingestDossierFromDashboard(data.dossierText);
      } else if (
        data.type === 'DELETE_ROUND' ||
        data.type === 'DISC_GOLF_DELETE_ITEM'
      ) {
        if (typeof data.roundId === 'number') {
          handleDeleteRound(data.roundId);
        } else if (data.itemId) {
          const updatedDel = recordDeletedItem(data.itemId);
          setDeletedIds(updatedDel);
        }
      } else if (data.type === 'SYNC_DASHBOARD_STATE' && data.payload) {
        const incoming = (data.payload.state || data.payload) as Partial<AppExportPayload>;
        const combinedDel = mergeDeletedIds(deletedIds, incoming.deletedIds);
        if (combinedDel.length !== deletedIds.length) {
          setDeletedIds(combinedDel);
        }
        if (Array.isArray(incoming.history)) {
          const merged = mergeRoundHistories(
            history,
            incoming.history,
            combinedDel
          );
          if (merged.length !== history.length) {
            setHistory(sortRoundsChronologically(merged));
          }
        }
        if (Array.isArray(incoming.bag)) {
          const mergedBag = mergeDiscBags(bag, incoming.bag, combinedDel);
          setBag(mergedBag);
        }
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === DOSSIER_STORAGE_KEY && event.newValue) {
        ingestDossierFromDashboard(event.newValue);
      } else if (event.key === DELETED_IDS_STORAGE_KEY && event.newValue) {
        const updatedDel = readDeletedIdsFromStorage();
        const delSet = new Set<string>(updatedDel);
        setDeletedIds(updatedDel);
        setHistory((prev) => prev.filter((r) => !isRoundDeleted(r, delSet)));
        setBag((prev) => prev.filter((d) => !isDiscDeleted(d, delSet)));
      }
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
    };
  }, [ingestDossierFromDashboard, handleDeleteRound, history, bag, deletedIds]);

  useEffect(() => {
    const computeSeconds = () => {
      const extra =
        timerState.running && timerState.startTime
          ? Date.now() - timerState.startTime
          : 0;
      return Math.floor((timerState.accumulatedMs + extra) / 1000);
    };
    setElapsedSeconds(computeSeconds());

    if (!timerState.running) return;
    const interval = setInterval(() => {
      setElapsedSeconds(computeSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [timerState]);

  const handleToggleTimer = () => {
    setIsRoundInProgress(true);
    setTimerState((prev) => {
      if (prev.running) {
        const now = Date.now();
        const delta = prev.startTime ? now - prev.startTime : 0;
        return {
          running: false,
          startTime: null,
          accumulatedMs: prev.accumulatedMs + delta
        };
      } else {
        return {
          running: true,
          startTime: Date.now(),
          accumulatedMs: prev.accumulatedMs
        };
      }
    });
  };

  const handleResetTimer = () => {
    setTimerState({
      running: false,
      startTime: null,
      accumulatedMs: 0
    });
    setElapsedSeconds(0);
    setIsRoundInProgress(false);
  };

  const handleSwitchCourse = (courseKey: string) => {
    const template = courses.find((c) => c.key === courseKey);
    if (!template) return;
    const activeIds = roundState.activePlayerIds || roster.map((r) => r.id);

    const nextRoundState: ActiveRoundState = {
      courseKey: template.key,
      courseName: template.name,
      totalHoles: template.totalHoles,
      date: new Date().toISOString().slice(0, 10),
      currentHoleIndex: 0,
      activePlayerIds: activeIds,
      gameMode: roundState.gameMode || 'stroke',
      windCondition: roundState.windCondition || 'calm',
      roundTranscript: '',
      updatedAt: Date.now(),
      holes: template.holes.map((h) => ({
        number: h.number,
        par: h.par,
        distance: h.distance,
        scores: Object.fromEntries(activeIds.map((id) => [id, 0]))
      }))
    };
    setRoundState(nextRoundState);
    handleResetTimer();
  };

  const handleStartConfiguredRound = (params: {
    courseKey: string;
    windCondition: CaddieScenario;
    voiceRecordingConfirmed: boolean;
    activePlayerIds?: string[];
  }) => {
    const template =
      courses.find((c) => c.key === params.courseKey) || courses[0];
    const activeIds =
      params.activePlayerIds && params.activePlayerIds.length > 0
        ? params.activePlayerIds
        : roundState.activePlayerIds || roster.map((r) => r.id);

    const nextRoundState: ActiveRoundState = {
      courseKey: template.key,
      courseName: template.name,
      totalHoles: template.totalHoles,
      date: new Date().toISOString().slice(0, 10),
      currentHoleIndex: 0,
      activePlayerIds: activeIds,
      gameMode: 'stroke',
      windCondition: params.windCondition,
      voiceRecordingConfirmed: params.voiceRecordingConfirmed,
      roundTranscript: '',
      updatedAt: Date.now(),
      holes: template.holes.map((h) => ({
        number: h.number,
        par: h.par,
        distance: h.distance,
        scores: Object.fromEntries(activeIds.map((id) => [id, 0]))
      }))
    };
    setRoundState(nextRoundState);
    setTimerState({
      running: true,
      startTime: Date.now(),
      accumulatedMs: 0
    });
    setElapsedSeconds(0);
    setIsRoundInProgress(true);
    setActiveTab('live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplayHistoricalCourse = (round: HistoricalRound) => {
    const activeIds = roundState.activePlayerIds || roster.map((r) => r.id);
    const matchedTemplate = courses.find(
      (c) => c.name.toLowerCase() === round.courseName.toLowerCase()
    );

    setRoundState({
      courseKey: matchedTemplate?.key || 'custom',
      courseName: round.courseName,
      totalHoles: round.totalHoles,
      date: new Date().toISOString().slice(0, 10),
      currentHoleIndex: 0,
      activePlayerIds: activeIds,
      gameMode: 'stroke',
      windCondition: round.windCondition || 'calm',
      roundTranscript: '',
      updatedAt: Date.now(),
      holes: round.holes.map((h) => ({
        number: h.number,
        par: h.par,
        distance: h.distance,
        scores: Object.fromEntries(activeIds.map((id) => [id, 0]))
      }))
    });
    handleResetTimer();
    setIsRoundInProgress(true);
    setActiveTab('live');
  };

  const syncRoundToWebhook = async (round: HistoricalRound) => {
    if (!webhookUrl) return;
    setWebhookSyncStatus('syncing');
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(round)
      });
      setWebhookSyncStatus('success');
      setTimeout(() => setWebhookSyncStatus('idle'), 3000);
    } catch {
      setWebhookSyncStatus('error');
      setTimeout(() => setWebhookSyncStatus('idle'), 4000);
    }
  };

  const handleSaveFinishedRound = async (syncToWebhook: boolean) => {
    const activeIds = roundState.activePlayerIds || roster.map((r) => r.id);
    const activeRoster = roster.filter((r) => activeIds.includes(r.id));

    // Guard against accidental double-tapping Save on an empty reset card
    const hasAnyEnteredScoreOrNote = roundState.holes.some(
      (h) =>
        Object.values(h.scores || {}).some((s) => typeof s === 'number' && s > 0) ||
        Boolean(h.voiceTranscript && h.voiceTranscript.trim())
    );
    if (!hasAnyEnteredScoreOrNote) {
      return;
    }

    const hrs = Math.floor(elapsedSeconds / 3600);
    const mins = Math.floor((elapsedSeconds % 3600) / 60);
    const secs = elapsedSeconds % 60;
    const durationFormatted =
      elapsedSeconds > 0
        ? [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':')
        : '00:28:00';

    const coursePar = roundState.holes.reduce((acc, h) => acc + h.par, 0);

    const finalizedHoles = roundState.holes.map((h) => {
      const nextScores: Record<string, number> = {};
      for (const p of activeRoster) {
        nextScores[p.id] =
          h.scores[p.id] && h.scores[p.id] > 0 ? h.scores[p.id] : h.par;
      }
      return {
        ...h,
        scores: nextScores
      };
    });

    const playersSummary = activeRoster.map((p) => {
      const total = finalizedHoles.reduce(
        (sum, h) => sum + (h.scores[p.id] || h.par),
        0
      );
      return {
        id: p.id,
        name: p.name,
        tag: p.tag,
        total
      };
    });

    const highestExistingId = history.reduce((max, r) => Math.max(max, r.id || 0), 0);
    const nextRoundId = Math.max(Date.now(), highestExistingId + 1);

    const newHistoricalRound: HistoricalRound = {
      id: nextRoundId,
      courseName: roundState.courseName,
      totalHoles: roundState.totalHoles,
      date: roundState.date || new Date().toISOString().slice(0, 10),
      duration: durationFormatted,
      par: coursePar,
      players: playersSummary,
      holes: finalizedHoles,
      gameMode: roundState.gameMode,
      windCondition: roundState.windCondition || 'calm',
      roundTranscript: roundState.roundTranscript || '',
      updatedAt: Date.now()
    };

    const updatedHistory = sortRoundsChronologically([
      newHistoricalRound,
      ...history
    ]);
    setHistory(updatedHistory);

    const updatedDossierText = generateFullChatGptReport({
      history: updatedHistory,
      bag,
      courses,
      roster,
      roundState
    });
    pushDossierToDashboard(updatedDossierText);

    const resetRoundState: ActiveRoundState = {
      ...roundState,
      currentHoleIndex: 0,
      date: new Date().toISOString().slice(0, 10),
      roundTranscript: '',
      updatedAt: Date.now(),
      holes: roundState.holes.map((h) => ({
        ...h,
        scores: Object.fromEntries(activeIds.map((id) => [id, 0])),
        meta: {},
        voiceTranscript: ''
      }))
    };

    const immediatePayload = {
      ...buildCurrentExportPayload(updatedHistory),
      roundState: resetRoundState,
      isRoundInProgress: false
    };
    setRoundState(resetRoundState);
    handleResetTimer();
    setIsRoundInProgress(false);
    writeMergedStateToLocalStorageAndDashboard(immediatePayload);
    try {
      localStorage.setItem('jj_disc_golf_pending_wifi_sync', 'true');
    } catch {
      // Ignore storage errors
    }
    void pushStateToCloud(immediatePayload).then((res) => {
      if (res.ok) {
        try {
          localStorage.removeItem('jj_disc_golf_pending_wifi_sync');
        } catch {
          // Ignore
        }
      }
    });
    setActiveTab('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (syncToWebhook) {
      await syncRoundToWebhook(newHistoricalRound);
    }
  };

  const handleSaveVoiceParsedRound = (newRound: HistoricalRound) => {
    const updatedHistory = sortRoundsChronologically([newRound, ...history]);
    setHistory(updatedHistory);
    const updatedDossierText = generateFullChatGptReport({
      history: updatedHistory,
      bag,
      courses,
      roster,
      roundState
    });
    pushDossierToDashboard(updatedDossierText);
    const nextPayload = {
      ...buildCurrentExportPayload(updatedHistory),
      isRoundInProgress: false
    };
    setIsRoundInProgress(false);
    writeMergedStateToLocalStorageAndDashboard(nextPayload);
    try {
      localStorage.setItem('jj_disc_golf_pending_wifi_sync', 'true');
    } catch {
      // Ignore
    }
    void pushStateToCloud(nextPayload).then((res) => {
      if (res.ok) {
        try {
          localStorage.removeItem('jj_disc_golf_pending_wifi_sync');
        } catch {
          // Ignore
        }
      }
    });
    setActiveTab('live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadVoiceParsedIntoScorecard = (parsed: ParsedVoiceRoundResult) => {
    const activeIds = parsed.soloMode ? ['jeffery'] : ['jeffery', 'jack'];
    setRoundState({
      courseKey: parsed.courseKey,
      courseName: parsed.courseName,
      totalHoles: parsed.holes.length,
      date: parsed.date,
      currentHoleIndex: 0,
      activePlayerIds: activeIds,
      gameMode: 'stroke',
      windCondition: parsed.windCondition,
      roundTranscript: parsed.fullTranscript,
      updatedAt: Date.now(),
      holes: parsed.holes.map((ph) => ({
        number: ph.holeNumber,
        par: ph.par,
        distance: ph.distance,
        scores: {
          jeffery: ph.jefferyScore,
          ...(ph.jackScore ? { jack: ph.jackScore } : {})
        },
        voiceTranscript: ph.summaryNote,
        meta: {
          jeffery: {
            thrownDiscId: ph.thrownDiscId,
            discUsed: ph.discUsed,
            scenarioUsed: parsed.windCondition,
            puttDistance: 'C1',
            puttDistanceFeet: ph.puttDistanceFeet,
            notes: ph.summaryNote,
            voiceNote: ph.summaryNote,
            throws: [
              { shotType: 'tee', discId: ph.thrownDiscId },
              {
                shotType: 'putt',
                discId:
                  ph.thrownDiscId === 'innova-sync'
                    ? 'innova-sync'
                    : 'innova-kc-pro-aviar'
              }
            ]
          }
        }
      }))
    });
    setIsRoundInProgress(true);
    setActiveTab('live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActivePlayer = (playerId: string) => {
    setRoundState((prev) => {
      const currentIds = prev.activePlayerIds || roster.map((r) => r.id);
      const exists = currentIds.includes(playerId);
      if (exists && currentIds.length <= 1) return prev;
      const nextIds = exists
        ? currentIds.filter((id) => id !== playerId)
        : [...currentIds, playerId];
      return {
        ...prev,
        activePlayerIds: nextIds
      };
    });
  };

  const handleExportJsonPayload = (): AppExportPayload => {
    return {
      app: 'Jeffery & Jack Disc Golf Scorecard',
      version: 'v46',
      exportDate: new Date().toISOString(),
      history,
      roster,
      roundState,
      webhookUrl,
      timerState,
      courses,
      bag,
      deletedIds
    };
  };

  const handleImportJsonPayload = (rawJson: string): { ok: boolean; message: string } => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || !Array.isArray(parsed.history)) {
        return { ok: false, message: 'Invalid JSON: missing "history" array.' };
      }
      const combinedDel = mergeDeletedIds(deletedIds, parsed.deletedIds);
      setDeletedIds(combinedDel);
      const mergedRounds = mergeRoundHistories(
        history,
        parsed.history,
        combinedDel
      );
      const nextHistory = sortRoundsChronologically(mergedRounds);
      setHistory(nextHistory);
      if (Array.isArray(parsed.roster)) setRoster(parsed.roster);
      if (parsed.roundState && Array.isArray(parsed.roundState.holes)) {
        setRoundState({
          ...parsed.roundState,
          activePlayerIds: parsed.roundState.activePlayerIds || ['jeffery', 'jack'],
          gameMode: parsed.roundState.gameMode || 'stroke',
          updatedAt: Date.now()
        });
      }
      if (typeof parsed.webhookUrl === 'string') setWebhookUrl(parsed.webhookUrl);
      if (Array.isArray(parsed.courses)) setCourses(parsed.courses);
      if (Array.isArray(parsed.bag) && parsed.bag[0]?.speedTier) {
        const mergedBag = mergeDiscBags(bag, parsed.bag, combinedDel);
        setBag(mergedBag);
      }
      void handleCloudSyncNow({
        forcePush: true,
        customPayload: buildCurrentExportPayload(nextHistory, combinedDel)
      });
      return {
        ok: true,
        message: `Successfully merged ${parsed.history.length} rounds into your scorecard & Cloud Sync!`
      };
    } catch {
      return { ok: false, message: 'Could not parse JSON string. Please check syntax.' };
    }
  };

  const handleResetToFactoryData = () => {
    writeDeletedIdsToStorage([]);
    setDeletedIds([]);
    setHistory(sortRoundsChronologically(INITIAL_USER_EXPORT.history));
    setRoster(INITIAL_USER_EXPORT.roster);
    setRoundState(INITIAL_USER_EXPORT.roundState);
    setWebhookUrl(INITIAL_USER_EXPORT.webhookUrl || '');
    setCourses(INITIAL_COURSE_TEMPLATES);
    setBag(INITIAL_DISC_BAG);
    handleResetTimer();
    setIsRoundInProgress(false);
  };

  const selectedThemeMeta =
    BG_THEME_OPTIONS.find((t) => t.id === bgTheme) || BG_THEME_OPTIONS[0];
  const selectedTileMeta =
    TILE_STYLE_OPTIONS.find((t) => t.id === tileStyle) || TILE_STYLE_OPTIONS[0];
  const isDarkVibe = selectedThemeMeta.surface === 'dark';
  const themeClass = `theme-${selectedThemeMeta.id} tile-${selectedTileMeta.id} ${
    isDarkVibe ? 'vibe-dark theme-dark-tiles' : 'vibe-light theme-light-tiles'
  }`;

  return (
    <div className={`min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col pb-10 transition-colors ${themeClass}`}>
      {/* Neo-Zine Comic Disc Golf Masthead & Mobile 5-Pill Nav */}
      <header className="sticky top-0 z-30 w-full max-w-[100vw] zine-masthead px-2.5 sm:px-6 py-2 sm:py-3">
        <div className="max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Zone 1: Comic Disc-Basket Emblem + Bold Masthead Title */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              playChainRattleSfx('tap');
              setActiveTab('home');
            }}
            className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap shrink min-w-0 group"
          >
            <span
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-display text-xs sm:text-[13px] font-black shrink-0 border-2 border-[#0F172A] shadow-[2.5px_2.5px_0_#0F172A] group-hover:-translate-y-0.5 transition-transform"
              style={{
                backgroundColor: 'var(--dg-pink, #E8357D)',
                color: '#FFFFFF'
              }}
              aria-hidden="true"
            >
              J&amp;J!
            </span>
            <div className="min-w-0">
              <div
                className="font-display text-xs sm:text-[15px] font-extrabold uppercase tracking-tight leading-none truncate"
                style={{ color: 'var(--dg-ink, #0F172A)' }}
              >
                JEFFERY &amp; JACK DISC GOLF
              </div>
              <div
                className="hidden sm:block font-mono-tabular text-[9.5px] font-bold tracking-wider uppercase mt-0.5 truncate"
                style={{ color: 'var(--dg-muted, #475569)' }}
              >
                FIELD CADDIE &amp; COLLECTOR ZINE // {history.length} ROUNDS
              </div>
            </div>
          </a>

          {/* Zone 2: Chunky Comic Pill Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-[11px] font-extrabold">
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setActiveTab('home');
              }}
              className={`px-3 py-1.5 rounded-full zine-pill-btn transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'home'
                  ? 'bg-[#FACC15] text-slate-950'
                  : 'vibe-nav-idle'
              }`}
            >
              🏠 1. Home Hub
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setActiveTab('live');
              }}
              className={`px-3 py-1.5 rounded-full zine-pill-btn transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'live'
                  ? 'bg-[#39FF14] text-slate-950'
                  : hasActiveRound
                  ? 'bg-[#39FF14] text-slate-950'
                  : 'vibe-nav-idle'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span>
                {hasActiveRound
                  ? `⛳ Live (H#${roundState.currentHoleIndex + 1})`
                  : '⛳ Last Card'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setActiveTab('atlas');
              }}
              className={`px-3 py-1.5 rounded-full zine-pill-btn transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'atlas'
                  ? 'bg-[#39FF14] text-slate-950'
                  : 'vibe-nav-idle'
              }`}
            >
              🗺️ Courses
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setActiveTab('courses');
              }}
              className={`px-3 py-1.5 rounded-full zine-pill-btn transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'courses'
                  ? 'bg-[#00F0FF] text-slate-950'
                  : 'vibe-nav-idle'
              }`}
            >
              🃏 Disc Cards
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setActiveTab('history');
              }}
              className={`px-3 py-1.5 rounded-full zine-pill-btn transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'history'
                  ? 'bg-[#FACC15] text-slate-950'
                  : 'vibe-nav-idle'
              }`}
            >
              📜 History
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setActiveTab('rivalry');
              }}
              className={`px-3 py-1.5 rounded-full zine-pill-btn transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'rivalry'
                  ? 'bg-[#FF2E93] text-white'
                  : 'vibe-nav-idle'
              }`}
            >
              📊 Stats
            </button>
          </nav>

          {/* Zone 3: Quick RHBH Shot Finder + Chains SFX + Sync Now + Data */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink min-w-0">
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setShowShotFinderModal(true);
              }}
              title="Open RHBH Shot Finder — tell me distance + left/right for instant disc recommendation"
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full zine-pill-btn text-[10px] sm:text-xs font-extrabold whitespace-nowrap flex items-center gap-1 transition-all bg-[#00F0FF] text-slate-950"
            >
              <span>🎯</span>
              <span>Shot</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSoundFx}
              title={
                soundFxEnabled
                  ? 'Basket Chain SFX Enabled (Tap to mute)'
                  : 'Enable playful basket-chain chimes on Birdies & card flips'
              }
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full zine-pill-btn text-[10px] sm:text-xs font-extrabold whitespace-nowrap flex items-center gap-1 transition-all ${
                soundFxEnabled
                  ? 'bg-[#FACC15] text-slate-950'
                  : 'vibe-nav-idle'
              }`}
            >
              {soundFxEnabled ? (
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="hidden sm:inline">CHAINS SFX</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                void handleCloudSyncNow({ forcePush: true });
              }}
              title={
                lastCloudSyncTime
                  ? `Last synced ${lastCloudSyncTime}. Click to Sync Now.`
                  : 'Click to Sync Now'
              }
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-extrabold rounded-full zine-pill-btn transition-all whitespace-nowrap shrink min-w-0 flex items-center gap-1 ${
                cloudSyncStatus === 'syncing'
                  ? 'bg-[#00F0FF] text-slate-950'
                  : 'bg-[#39FF14] text-slate-950'
              }`}
            >
              <RefreshCw
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                  cloudSyncStatus === 'syncing' ? 'animate-spin' : ''
                }`}
              />
              <span>
                {cloudSyncStatus === 'syncing' ? 'Syncing' : 'Synced'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setActiveTab('sync');
              }}
              className={`px-2 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-extrabold rounded-full zine-pill-btn transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'sync'
                  ? 'bg-[#FACC15] text-slate-950'
                  : 'bg-[#FF2E93] text-white'
              }`}
            >
              Data
            </button>
          </div>
        </div>

        {/* Tablet/Mobile Compact Comic 6-Pill Nav Bar */}
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden mt-2 pt-2 border-t-2 border-slate-900/15 grid grid-cols-6 items-center gap-1 w-full min-w-0"
        >
          {[
            { id: 'home', label: 'Home', icon: Home, activeBg: 'bg-[#FACC15] text-slate-950' },
            {
              id: 'live',
              label: hasActiveRound
                ? `H#${roundState.currentHoleIndex + 1}`
                : 'Card',
              icon: ClipboardList,
              activeBg: 'bg-[#39FF14] text-slate-950'
            },
            { id: 'atlas', label: 'Courses', icon: MapIcon, activeBg: 'bg-[#39FF14] text-slate-950' },
            { id: 'courses', label: 'Discs', icon: Compass, activeBg: 'bg-[#00F0FF] text-slate-950' },
            { id: 'history', label: 'History', icon: History, activeBg: 'bg-[#FACC15] text-slate-950' },
            { id: 'rivalry', label: 'Stats', icon: BarChart3, activeBg: 'bg-[#FF2E93] text-white' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHighlightedLive = item.id === 'live' && hasActiveRound && !isActive;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setActiveTab(item.id as NavTab);
                }}
                className={`py-1.5 px-0.5 min-w-0 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? `${item.activeBg} zine-pill-btn font-extrabold`
                    : isHighlightedLive
                    ? 'bg-[#39FF14]/30 border-[#39FF14] text-white font-extrabold'
                    : isDarkVibe
                    ? 'vibe-nav-idle font-bold'
                    : 'vibe-nav-idle font-bold shadow-[1.5px_1.5px_0_#0F172A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[9.5px] sm:text-[10.5px] mt-0.5 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 py-5 space-y-5 overflow-x-hidden">
        {/* Quick Return to Current Round / Last Scorecard Button when on other tabs */}
        {activeTab !== 'live' && (
          <div className="flex items-center justify-between gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-2xl neon-card">
            <span className="text-xs font-extrabold tracking-tight">
              {hasActiveRound
                ? `⚡ Live Round · ${roundState.courseName} (Hole #${roundState.currentHoleIndex + 1})`
                : `⛳ Latest Logged · ${(history[0]?.courseName || 'Sar-Ko-Par Trails').replace(' Flying Disc', '')} (${history[0]?.date || ''})`}
            </span>
            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setActiveTab('live');
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap bg-[#39FF14] text-slate-950 zine-pill-btn"
            >
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span>
                {hasActiveRound
                  ? `← Back to Scorecard (H#${roundState.currentHoleIndex + 1})`
                  : '← Back to Scorecard'}
              </span>
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <HomeHubView
            courses={courses}
            bag={bag}
            history={history}
            roundState={roundState}
            hasActiveRound={hasActiveRound}
            bgTheme={bgTheme}
            bgThemeOptions={BG_THEME_OPTIONS}
            onChangeBgTheme={(nextTheme) => {
              playChainRattleSfx('vibe');
              setBgTheme(nextTheme);
            }}
            onStartConfiguredRound={handleStartConfiguredRound}
            onResumeLiveRound={() => setActiveTab('live')}
            onOpenVoiceLogImporter={() => setShowVoiceLogImporter(true)}
            onOpenShotFinder={() => setShowShotFinderModal(true)}
            onNavigateTab={(tab, ownerFilter, courseKeyOrName) => {
              if (ownerFilter) setBagOwnerFilter(ownerFilter);
              if (courseKeyOrName) setFocusedAtlasCourse(courseKeyOrName);
              setActiveTab(tab === 'dashboard' ? 'rivalry' : tab);
            }}
          />
        )}

        {activeTab === 'atlas' && (
          <CourseAtlasView
            courses={courses}
            history={history}
            bag={bag}
            roster={roster}
            initialCourseKeyOrName={focusedAtlasCourse}
            onStartRoundAtCourse={(courseKey) => {
              handleSwitchCourse(courseKey);
              setIsRoundInProgress(true);
              setActiveTab('live');
            }}
            onOpenDiscCard={(discId, ownerFilter) => {
              setFocusedDiscId(discId);
              if (ownerFilter) setBagOwnerFilter(ownerFilter);
              setActiveTab('courses');
            }}
            onOpenRoundHistory={(courseName) => {
              if (courseName) setFocusedHistoryCourse(courseName);
              setActiveTab('history');
            }}
          />
        )}

        {activeTab === 'live' && (
          <LiveScorecardView
            roundState={roundState}
            setRoundState={handleSetRoundState}
            roster={roster}
            history={history}
            courses={courses}
            bag={bag}
            timerState={timerState}
            elapsedSeconds={elapsedSeconds}
            hasActiveRound={hasActiveRound}
            onStartActiveRound={() => setIsRoundInProgress(true)}
            onStartNewRoundSetup={() => setActiveTab('home')}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onSwitchCourse={handleSwitchCourse}
            onSaveFinishedRound={handleSaveFinishedRound}
            webhookSyncStatus={webhookSyncStatus}
            onOpenVoiceLogImporter={() => setShowVoiceLogImporter(true)}
            onOpenBagGuide={(discId, ownerFilter) => {
              if (discId) setFocusedDiscId(discId);
              if (ownerFilter) setBagOwnerFilter(ownerFilter);
              setActiveTab('courses');
            }}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesAndBagView
            courses={courses}
            setCourses={setCourses}
            bag={bag}
            setBag={handleSetBag}
            history={history}
            roster={roster}
            initialSelectedDiscId={focusedDiscId}
            initialBagOwnerFilter={bagOwnerFilter}
            onStartRoundAtCourse={(courseKey) => {
              handleSwitchCourse(courseKey);
              setIsRoundInProgress(true);
              setActiveTab('live');
            }}
          />
        )}

        {activeTab === 'rivalry' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 rounded-xl bg-[#080B14] border border-slate-700 text-xs sm:text-sm font-bold text-white hover:border-[#00F0FF]"
              >
                Switch to Completed Round Scorecards →
              </button>
            </div>
            <RivalryAnalyticsView
              history={history}
              roster={roster}
              bag={bag}
              courses={courses}
              onOpenBagGuide={(discId, ownerFilter) => {
                if (discId) setFocusedDiscId(discId);
                if (ownerFilter) setBagOwnerFilter(ownerFilter);
                setActiveTab('courses');
              }}
              onOpenCourseAtlas={(courseName) => {
                setFocusedAtlasCourse(courseName);
                setActiveTab('atlas');
              }}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('atlas')}
                className="px-4 py-2 rounded-full bg-[#39FF14] text-slate-950 text-xs sm:text-sm font-extrabold zine-pill-btn"
              >
                🗺️ Explore Course Layouts &amp; Hole Tee-Signs →
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rivalry')}
                className="px-4 py-2 rounded-full bg-[#00F0FF] text-slate-950 text-xs sm:text-sm font-extrabold zine-pill-btn"
              >
                📊 Personal &amp; Course Stats →
              </button>
            </div>
            <RoundHistoryView
              history={history}
              roster={roster}
              bag={bag}
              initialCourseName={focusedHistoryCourse}
              onOpenCourseAtlas={(courseName) => {
                setFocusedAtlasCourse(courseName);
                setActiveTab('atlas');
              }}
              onDeleteRound={handleDeleteRound}
              onReplayCourse={handleReplayHistoricalCourse}
              onSyncSingleRoundToWebhook={syncRoundToWebhook}
            />
          </div>
        )}

        {activeTab === 'sync' && (
          <SyncAndRosterView
            roster={roster}
            setRoster={setRoster}
            activePlayerIds={roundState.activePlayerIds || ['jeffery', 'jack']}
            onToggleActivePlayer={handleToggleActivePlayer}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            onExportJsonPayload={handleExportJsonPayload}
            onImportJsonPayload={handleImportJsonPayload}
            onResetToFactoryData={handleResetToFactoryData}
          />
        )}

        <VoiceLogImporterModal
          isOpen={showVoiceLogImporter}
          onClose={() => setShowVoiceLogImporter(false)}
          courses={courses}
          bag={bag}
          history={history}
          defaultCourseKey={isRoundInProgress ? roundState.courseKey || 'sarko' : 'sarko'}
          activeRoundState={roundState}
          isRoundInProgress={isRoundInProgress}
          onSaveParsedRoundToHistory={handleSaveVoiceParsedRound}
          onLoadParsedIntoActiveScorecard={handleLoadVoiceParsedIntoScorecard}
        />

        {showShotFinderModal && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
            onClick={() => setShowShotFinderModal(false)}
          >
            <div
              className="w-full max-w-4xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <RhbhShotFinder
                bag={bag}
                initialDistanceFeet={
                  hasActiveRound
                    ? roundState.holes[roundState.currentHoleIndex]?.distance || 175
                    : 175
                }
                initialWind={roundState.windCondition || 'calm'}
                holeNumber={
                  hasActiveRound
                    ? roundState.holes[roundState.currentHoleIndex]?.number
                    : undefined
                }
                holeDistanceFeet={
                  hasActiveRound
                    ? roundState.holes[roundState.currentHoleIndex]?.distance
                    : undefined
                }
                onOpenDiscCard={(discId) => {
                  setShowShotFinderModal(false);
                  setFocusedDiscId(discId);
                  setBagOwnerFilter('jeffery');
                  setActiveTab('courses');
                }}
                onClose={() => setShowShotFinderModal(false)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
