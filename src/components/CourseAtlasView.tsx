import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Compass,
  Disc,
  History,
  Map as MapIcon,
  Maximize2,
  Play,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
  Wind
} from 'lucide-react';
import {
  CourseTemplate,
  DiscItem,
  HistoricalRound,
  PlayerRosterItem,
  getDiscCardImageUrl
} from '../data/initialData';
import {
  DEFAULT_VERIFIED_HOLE_PICKS,
  HoleVisualOutlineSpec,
  buildCourseSummary,
  formatRelativePar,
  getCourseHoleLayoutIntel,
  getCoursePersonalBest,
  getHoleVisualOutlineSpec,
  getVerifiedHoleKey,
  normalizeCourseKeyForPicks
} from '../utils/analytics';
import { playChainRattleSfx } from '../utils/soundFx';

interface CourseAtlasViewProps {
  courses: CourseTemplate[];
  history: HistoricalRound[];
  bag: DiscItem[];
  roster: PlayerRosterItem[];
  initialCourseKeyOrName?: string | null;
  onStartRoundAtCourse: (courseKey: string) => void;
  onOpenDiscCard?: (discId: string, ownerFilter?: 'jeffery' | 'jack' | 'all') => void;
  onOpenRoundHistory?: (courseName?: string) => void;
}

type CourseFilterMode = 'played' | 'all' | 'nine' | 'eighteen';
type HoleFilterMode = 'all' | 'front9' | 'back9' | 'best' | 'leaks';

function renderMiniTeeSignSvg(
  spec: HoleVisualOutlineSpec,
  uid: string
): React.ReactNode {
  const geometry = (() => {
    switch (spec.shape) {
      case 'tunnel':
        return {
          tx: 90,
          ty: 176,
          px: 90,
          py: 36,
          fairwayPath: 'M 90 176 L 90 36',
          flightPath: 'M 90 176 C 92 128, 92 80, 90 36',
          guardianPos: { x: 80, y: 88 }
        };
      case 'slight_left':
        return {
          tx: 100,
          ty: 176,
          px: 68,
          py: 36,
          fairwayPath: 'M 100 176 C 104 122, 90 74, 68 36',
          flightPath: 'M 100 176 C 110 118, 94 68, 68 36',
          guardianPos: { x: 80, y: 76 }
        };
      case 'dogleg_left':
        return {
          tx: 112,
          ty: 176,
          px: 48,
          py: 40,
          fairwayPath: 'M 112 176 C 116 108, 94 64, 48 40',
          flightPath: 'M 112 176 C 120 104, 96 58, 48 40',
          guardianPos: { x: 76, y: 68 }
        };
      case 'slight_right':
        return {
          tx: 80,
          ty: 176,
          px: 112,
          py: 36,
          fairwayPath: 'M 80 176 C 76 122, 90 74, 112 36',
          flightPath: 'M 80 176 C 74 124, 96 72, 112 36',
          guardianPos: { x: 98, y: 76 }
        };
      case 'dogleg_right':
        return {
          tx: 68,
          ty: 176,
          px: 132,
          py: 40,
          fairwayPath: 'M 68 176 C 64 108, 86 64, 132 40',
          flightPath: 'M 68 176 C 62 110, 84 58, 132 40',
          guardianPos: { x: 104, y: 68 }
        };
      case 's_curve':
        return {
          tx: 86,
          ty: 176,
          px: 86,
          py: 36,
          fairwayPath: 'M 86 176 C 124 126, 56 80, 86 36',
          flightPath: 'M 86 176 C 128 126, 54 78, 86 36',
          guardianPos: { x: 74, y: 92 }
        };
      case 'straight':
      default:
        return {
          tx: 90,
          ty: 176,
          px: 90,
          py: 36,
          fairwayPath: 'M 90 176 C 90 130, 90 82, 90 36',
          flightPath: 'M 90 176 C 98 126, 96 76, 90 36',
          guardianPos: { x: 78, y: 80 }
        };
    }
  })();

  const outerFairwayWidth =
    spec.shape === 'tunnel'
      ? 26
      : spec.corridor === 'open'
      ? 50
      : spec.corridor === 'tight_woods'
      ? 32
      : 40;
  const innerFairwayWidth = Math.max(14, Math.round(outerFairwayWidth * 0.6));

  const treeCanopies: Array<{ x: number; y: number; r: number }> = (() => {
    if (spec.treesSide === 'none') {
      return [
        { x: 18, y: 46, r: 9 },
        { x: 162, y: 156, r: 9 }
      ];
    }
    if (spec.treesSide === 'left') {
      return [
        { x: 20, y: 30, r: 13 },
        { x: 36, y: 46, r: 11 },
        { x: 18, y: 68, r: 14 },
        { x: 38, y: 88, r: 11 },
        { x: 20, y: 112, r: 14 },
        { x: 38, y: 134, r: 11 },
        { x: 22, y: 156, r: 13 }
      ];
    }
    if (spec.treesSide === 'right') {
      return [
        { x: 160, y: 30, r: 13 },
        { x: 144, y: 46, r: 11 },
        { x: 162, y: 68, r: 14 },
        { x: 142, y: 88, r: 11 },
        { x: 160, y: 112, r: 14 },
        { x: 142, y: 134, r: 11 },
        { x: 158, y: 156, r: 13 }
      ];
    }
    if (spec.corridor === 'tight_woods') {
      return [
        { x: 20, y: 34, r: 12 },
        { x: 18, y: 64, r: 13 },
        { x: 24, y: 94, r: 12 },
        { x: 18, y: 124, r: 14 },
        { x: 24, y: 154, r: 12 },
        { x: 40, y: 112, r: 10 },
        { x: 160, y: 34, r: 12 },
        { x: 162, y: 64, r: 13 },
        { x: 156, y: 94, r: 12 },
        { x: 162, y: 124, r: 14 },
        { x: 156, y: 154, r: 12 },
        { x: 140, y: 112, r: 10 }
      ];
    }
    if (spec.corridor === 'park') {
      return [
        { x: 22, y: 48, r: 12 },
        { x: 20, y: 104, r: 13 },
        { x: 26, y: 154, r: 11 },
        { x: 158, y: 52, r: 12 },
        { x: 160, y: 110, r: 13 },
        { x: 154, y: 156, r: 11 }
      ];
    }
    return [
      { x: 18, y: 46, r: 10 },
      { x: 162, y: 152, r: 10 }
    ];
  })();

  const elevBadge =
    spec.elevation === 'uphill'
      ? { text: 'UP ↑', color: '#FACC15' }
      : spec.elevation === 'downhill'
      ? { text: 'DN ↓', color: '#38BDF8' }
      : { text: 'FLAT', color: '#94A3B8' };

  return (
    <svg
      viewBox="0 0 180 200"
      className="w-full h-[142px] sm:h-[154px] block select-none"
      role="img"
      aria-label={`${spec.shapeLabel}, ${spec.elevationLabel}, ${spec.corridorLabel}`}
    >
      <defs>
        <linearGradient id={`atlasTurf-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#06150E" />
          <stop offset="100%" stopColor="#0A2217" />
        </linearGradient>
        <linearGradient id={`atlasCut-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#14532D" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="180" height="200" rx="10" fill={`url(#atlasTurf-${uid})`} />

      <line
        x1="14"
        y1="130"
        x2="166"
        y2="130"
        stroke="rgba(255,255,255,0.07)"
        strokeDasharray="3 4"
      />
      <line
        x1="14"
        y1="82"
        x2="166"
        y2="82"
        stroke="rgba(255,255,255,0.07)"
        strokeDasharray="3 4"
      />

      {spec.waterHazard === 'left' && (
        <g>
          <ellipse
            cx="18"
            cy="102"
            rx="14"
            ry="34"
            fill="#0284C7"
            fillOpacity="0.48"
            stroke="#38BDF8"
            strokeWidth="1"
          />
          <text
            x="18"
            y="105"
            textAnchor="middle"
            fill="#BAE6FD"
            fontSize="7"
            fontWeight="800"
            fontFamily="monospace"
          >
            H2O
          </text>
        </g>
      )}
      {spec.waterHazard === 'right' && (
        <g>
          <ellipse
            cx="162"
            cy="108"
            rx="14"
            ry="34"
            fill="#0284C7"
            fillOpacity="0.48"
            stroke="#38BDF8"
            strokeWidth="1"
          />
          <text
            x="162"
            y="111"
            textAnchor="middle"
            fill="#BAE6FD"
            fontSize="7"
            fontWeight="800"
            fontFamily="monospace"
          >
            H2O
          </text>
        </g>
      )}
      {spec.waterHazard === 'short' && (
        <g>
          <rect
            x="24"
            y="124"
            width="132"
            height="12"
            rx="6"
            fill="#0284C7"
            fillOpacity="0.48"
            stroke="#38BDF8"
            strokeWidth="1"
          />
          <text
            x="90"
            y="133"
            textAnchor="middle"
            fill="#E0F2FE"
            fontSize="7"
            fontWeight="800"
            fontFamily="monospace"
          >
            CREEK
          </text>
        </g>
      )}

      {spec.obHazard === 'left' && (
        <g>
          <line
            x1="10"
            y1="20"
            x2="10"
            y2="186"
            stroke="#F87171"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x="15"
            y="182"
            fill="#FCA5A5"
            fontSize="7"
            fontWeight="800"
            fontFamily="monospace"
          >
            OB
          </text>
        </g>
      )}
      {spec.obHazard === 'right' && (
        <g>
          <line
            x1="170"
            y1="20"
            x2="170"
            y2="186"
            stroke="#F87171"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x="154"
            y="182"
            fill="#FCA5A5"
            fontSize="7"
            fontWeight="800"
            fontFamily="monospace"
          >
            OB
          </text>
        </g>
      )}

      {/* Fairway Cut */}
      <path
        d={geometry.fairwayPath}
        fill="none"
        stroke={`url(#atlasCut-${uid})`}
        strokeWidth={outerFairwayWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.94"
      />
      <path
        d={geometry.fairwayPath}
        fill="none"
        stroke="#22C55E"
        strokeWidth={innerFairwayWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
      />

      {/* Walking Path */}
      {spec.walkingPath === 'cross' && (
        <path
          d="M 8 106 Q 90 94 172 108"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="3"
          strokeDasharray="5 3"
          opacity="0.45"
        />
      )}
      {spec.walkingPath === 'left' && (
        <path
          d="M 32 188 Q 28 104 34 22"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="2.5"
          strokeDasharray="5 3"
          opacity="0.4"
        />
      )}
      {spec.walkingPath === 'right' && (
        <path
          d="M 148 188 Q 152 104 146 22"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="2.5"
          strokeDasharray="5 3"
          opacity="0.4"
        />
      )}

      {/* Tree Canopies */}
      {treeCanopies.map((t, idx) => (
        <circle
          key={idx}
          cx={t.x}
          cy={t.y}
          r={t.r}
          fill="#064E3B"
          fillOpacity="0.88"
          stroke="#10B981"
          strokeOpacity="0.38"
          strokeWidth="1"
        />
      ))}

      {/* Guardian Tree */}
      {spec.hasGuardianTree && (
        <g>
          <circle
            cx={geometry.guardianPos.x}
            cy={geometry.guardianPos.y}
            r="8.5"
            fill="#065F46"
            stroke="#FACC15"
            strokeWidth="1.4"
          />
          <text
            x={geometry.guardianPos.x}
            y={geometry.guardianPos.y + 2.5}
            textAnchor="middle"
            fill="#FEF08A"
            fontSize="5.5"
            fontWeight="900"
            fontFamily="monospace"
          >
            TREE
          </text>
        </g>
      )}

      {/* Circle 1 Green */}
      <circle
        cx={geometry.px}
        cy={geometry.py}
        r="16"
        fill="#22C55E"
        fillOpacity="0.16"
        stroke="#39FF14"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="2.5 2.5"
      />

      {/* Recommended Flight Path */}
      <path
        d={geometry.flightPath}
        fill="none"
        stroke="#00F0FF"
        strokeWidth="2.4"
        strokeDasharray="5 3"
        strokeLinecap="round"
      />

      {/* Tee Pad */}
      <rect
        x={geometry.tx - 10}
        y={geometry.ty - 4}
        width="20"
        height="8"
        rx="2"
        fill="#E2E8F0"
        stroke="#0F172A"
        strokeWidth="1.2"
      />
      <text
        x={geometry.tx}
        y={geometry.ty + 14}
        textAnchor="middle"
        fill="#CBD5E1"
        fontSize="7"
        fontWeight="800"
        fontFamily="monospace"
      >
        TEE
      </text>

      {/* Basket Pin */}
      <circle
        cx={geometry.px}
        cy={geometry.py}
        r="6.5"
        fill="#FACC15"
        stroke="#0F172A"
        strokeWidth="1.5"
      />
      <circle cx={geometry.px} cy={geometry.py} r="2.2" fill="#0F172A" />

      {/* Elevation Corner Pill */}
      <rect
        x="130"
        y="8"
        width="42"
        height="15"
        rx="4"
        fill="rgba(9,13,11,0.88)"
        stroke={elevBadge.color}
        strokeWidth="1"
      />
      <text
        x="151"
        y="18"
        textAnchor="middle"
        fill={elevBadge.color}
        fontSize="7.5"
        fontWeight="800"
        fontFamily="monospace"
      >
        {elevBadge.text}
      </text>
    </svg>
  );
}

function resolveDiscByIdOrName(
  bag: DiscItem[],
  discId?: string,
  discName?: string
): DiscItem | undefined {
  if (discId) {
    const exact = bag.find((d) => d.id === discId);
    if (exact) return exact;
  }
  if (discName) {
    const lower = discName.toLowerCase();
    // Prefer active (non-archived) Cotton Candy / Main Bag discs first on name matches
    const ordered = [...bag.filter((d) => !d.archived), ...bag.filter((d) => d.archived)];
    return ordered.find(
      (d) =>
        d.name.toLowerCase() === lower ||
        lower.includes(d.name.toLowerCase()) ||
        (lower === 'sync' && d.id === 'innova-halloween-sync') ||
        (lower === 'archangel' && d.id === 'innova-hot-pink-archangel') ||
        (lower === 'xero' && d.id === 'innova-sync') ||
        (lower === 'halo it' && d.id === 'innova-it')
    );
  }
  return undefined;
}

export const CourseAtlasView: React.FC<CourseAtlasViewProps> = ({
  courses,
  history,
  bag,
  roster,
  initialCourseKeyOrName,
  onStartRoundAtCourse,
  onOpenDiscCard,
  onOpenRoundHistory
}) => {
  const p1 = roster[0] || { id: 'jeffery', name: 'Jeffery', tag: 'J1' };
  const p2 = roster[1] || { id: 'jack', name: 'Jack', tag: 'J2' };

  // Build unified Course Directory pairing every CourseTemplate + any orphan HistoricalRound courses
  const courseDirectory = useMemo(() => {
    const byNormKey = new Map<
      string,
      {
        normKey: string;
        courseKey: string;
        name: string;
        location: string;
        totalHoles: number;
        par: number;
        totalFeet: number;
        holes: Array<{ number: number; par: number; distance: number; hint?: string }>;
        rounds: HistoricalRound[];
      }
    >();

    for (const c of courses) {
      const nKey = normalizeCourseKeyForPicks(c.key || c.name);
      const cPar = c.holes.reduce((s, h) => s + (h.par || 3), 0);
      const cFeet = c.holes.reduce((s, h) => s + (h.distance || 0), 0);
      byNormKey.set(nKey, {
        normKey: nKey,
        courseKey: c.key,
        name: c.name,
        location: c.location || 'Kansas City Metro',
        totalHoles: c.totalHoles || c.holes.length || 9,
        par: cPar,
        totalFeet: cFeet,
        holes: c.holes,
        rounds: []
      });
    }

    for (const r of history) {
      const nKey = normalizeCourseKeyForPicks(r.courseName);
      const existing = byNormKey.get(nKey);
      if (existing) {
        existing.rounds.push(r);
      } else {
        const rPar = r.par || r.holes.reduce((s, h) => s + (h.par || 3), 0);
        const rFeet = r.holes.reduce((s, h) => s + (h.distance || 0), 0);
        byNormKey.set(nKey, {
          normKey: nKey,
          courseKey: nKey,
          name: r.courseName,
          location: 'Kansas City Metro',
          totalHoles: r.totalHoles || r.holes.length || 9,
          par: rPar,
          totalFeet: rFeet,
          holes: r.holes.map((h) => ({
            number: h.number,
            par: h.par || 3,
            distance: h.distance || 200
          })),
          rounds: [r]
        });
      }
    }

    const list = Array.from(byNormKey.values());
    // Sort rounds newest -> oldest inside each course
    for (const item of list) {
      item.rounds.sort(
        (a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id
      );
    }

    // Sort courses: Played courses first (most-recent / Sar-Ko-Par / round count), then unplayed alphabetically
    return list.sort((a, b) => {
      const aPlayed = a.rounds.length > 0 ? 1 : 0;
      const bPlayed = b.rounds.length > 0 ? 1 : 0;
      if (aPlayed !== bPlayed) return bPlayed - aPlayed;
      if (a.normKey === 'sarko') return -1;
      if (b.normKey === 'sarko') return 1;
      if (b.rounds.length !== a.rounds.length) return b.rounds.length - a.rounds.length;
      const aLatest = a.rounds[0]?.date || '';
      const bLatest = b.rounds[0]?.date || '';
      if (aLatest !== bLatest) return bLatest.localeCompare(aLatest);
      return a.name.localeCompare(b.name);
    });
  }, [courses, history]);

  const defaultNormKey = useMemo(() => {
    if (initialCourseKeyOrName) {
      const target = normalizeCourseKeyForPicks(initialCourseKeyOrName);
      if (courseDirectory.some((c) => c.normKey === target)) return target;
    }
    const latestRound = history[0];
    if (latestRound) {
      const latestKey = normalizeCourseKeyForPicks(latestRound.courseName);
      if (courseDirectory.some((c) => c.normKey === latestKey)) return latestKey;
    }
    return courseDirectory[0]?.normKey || 'sarko';
  }, [initialCourseKeyOrName, history, courseDirectory]);

  const [selectedNormKey, setSelectedNormKey] = useState<string>(defaultNormKey);
  const [courseFilter, setCourseFilter] = useState<CourseFilterMode>('played');
  const [holeFilter, setHoleFilter] = useState<HoleFilterMode>('all');
  const [mapMode, setMapMode] = useState<'loop' | 'satellite'>('loop');
  const [zoomSatelliteModal, setZoomSatelliteModal] = useState<boolean>(false);
  const [focusedHoleNumber, setFocusedHoleNumber] = useState<number | null>(null);
  const [expandedHoleHistory, setExpandedHoleHistory] = useState<Record<number, boolean>>({});
  const [expandedRoundId, setExpandedRoundId] = useState<number | null>(null);
  const [customCourseMap, setCustomCourseMap] = useState<string | null>(null);
  const courseMapInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialCourseKeyOrName) {
      const target = normalizeCourseKeyForPicks(initialCourseKeyOrName);
      const found = courseDirectory.find((c) => c.normKey === target);
      if (found) {
        setSelectedNormKey(found.normKey);
        if (found.rounds.length === 0 && courseFilter === 'played') {
          setCourseFilter('all');
        }
      }
    }
  }, [initialCourseKeyOrName, courseDirectory]);

  const activeCourse = useMemo(
    () =>
      courseDirectory.find((c) => c.normKey === selectedNormKey) || courseDirectory[0],
    [courseDirectory, selectedNormKey]
  );

  const customCourseMapKey = `jj_dg_course_map_v1_${activeCourse?.normKey || 'sarko'}`;
  const { layout: satelliteLayout } = useMemo(
    () => getCourseHoleLayoutIntel(activeCourse?.courseKey || activeCourse?.name || 'sarko'),
    [activeCourse]
  );

  useEffect(() => {
    let loadedCustom: string | null = null;
    try {
      loadedCustom = localStorage.getItem(customCourseMapKey);
    } catch {
      loadedCustom = null;
    }
    setCustomCourseMap(loadedCustom);
    const hasMap = Boolean(
      loadedCustom || (satelliteLayout?.imageUrl && satelliteLayout.imageUrl.trim())
    );
    setMapMode(hasMap ? 'satellite' : 'loop');
    setHoleFilter('all');
    setFocusedHoleNumber(null);
    setExpandedHoleHistory({});
    setExpandedRoundId(activeCourse?.rounds[0]?.id ?? null);
  }, [customCourseMapKey, satelliteLayout?.imageUrl, activeCourse?.normKey]);

  const activeSatelliteMapUrl =
    customCourseMap ||
    (satelliteLayout?.imageUrl && satelliteLayout.imageUrl.trim()
      ? satelliteLayout.imageUrl
      : null);

  const handleUploadCustomCourseMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!rawDataUrl) return;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1400;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.84);
          try {
            localStorage.setItem(customCourseMapKey, compressed);
          } catch {
            // Ignore quota warning
          }
          setCustomCourseMap(compressed);
          setMapMode('satellite');
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveCustomCourseMap = () => {
    try {
      localStorage.removeItem(customCourseMapKey);
    } catch {
      // Ignore
    }
    setCustomCourseMap(null);
    if (!satelliteLayout?.imageUrl) {
      setMapMode('loop');
    }
  };

  const filteredCourseShelf = useMemo(() => {
    return courseDirectory.filter((c) => {
      if (courseFilter === 'played') return c.rounds.length > 0;
      if (courseFilter === 'nine') return c.totalHoles <= 9;
      if (courseFilter === 'eighteen') return c.totalHoles >= 18;
      return true;
    });
  }, [courseDirectory, courseFilter]);

  const playedCoursesCount = useMemo(
    () => courseDirectory.filter((c) => c.rounds.length > 0).length,
    [courseDirectory]
  );

  // Compute rich Hole-by-Hole Layout + Forensic Historical Logs for Active Course
  const holeAtlasEntries = useMemo(() => {
    if (!activeCourse) return [];
    const maxHoles = Math.max(
      activeCourse.totalHoles,
      activeCourse.holes.length,
      ...activeCourse.rounds.map((r) => r.holes.length)
    );

    const entries = [];
    for (let hNum = 1; hNum <= maxHoles; hNum++) {
      const tplHole = activeCourse.holes.find((h) => h.number === hNum);
      let par = tplHole?.par || 3;
      let distance = tplHole?.distance || 200;
      const hint = tplHole?.hint || '';

      const p1Scores: number[] = [];
      const p2Scores: number[] = [];
      const discCounts = new Map<string, { count: number; discId?: string; name: string }>();

      const historicalPlays: Array<{
        roundId: number;
        date: string;
        windCondition: string;
        p1Score: number | null;
        p2Score: number | null;
        par: number;
        thrownSequence: string[];
        primaryDisc?: DiscItem;
        puttFeet?: number;
        commentary: string;
      }> = [];

      for (const r of activeCourse.rounds) {
        const h = r.holes.find((item) => item.number === hNum);
        if (!h) continue;
        if (h.par) par = h.par;
        if (h.distance) distance = h.distance;

        const s1 = h.scores?.[p1.id] || 0;
        const s2 = h.scores?.[p2.id] || 0;
        if (s1 > 0) p1Scores.push(s1);
        if (s2 > 0) p2Scores.push(s2);

        const jMeta = h.meta?.jeffery;
        const kMeta = h.meta?.jack;

        const seqLabels: string[] = [];
        let primaryDisc: DiscItem | undefined;
        if (jMeta?.throws && jMeta.throws.length > 0) {
          for (const t of jMeta.throws) {
            const matched = resolveDiscByIdOrName(bag, t.discId);
            if (!primaryDisc && matched) primaryDisc = matched;
            const shotPrefix =
              t.shotType === 'tee'
                ? 'Tee'
                : t.shotType === 'approach'
                ? 'App'
                : t.shotType === 'putt'
                ? 'Putt'
                : 'Fairway';
            seqLabels.push(`${shotPrefix}: ${matched ? matched.name : t.discId}`);
          }
        } else if (jMeta?.thrownDiscId || jMeta?.discUsed) {
          primaryDisc = resolveDiscByIdOrName(bag, jMeta.thrownDiscId, jMeta.discUsed);
          seqLabels.push(primaryDisc ? primaryDisc.name : jMeta.discUsed || '');
        }

        if (primaryDisc) {
          const prev = discCounts.get(primaryDisc.id);
          discCounts.set(primaryDisc.id, {
            count: (prev?.count || 0) + 1,
            discId: primaryDisc.id,
            name: primaryDisc.name
          });
        } else if (jMeta?.discUsed) {
          const key = jMeta.discUsed.toLowerCase();
          const prev = discCounts.get(key);
          discCounts.set(key, {
            count: (prev?.count || 0) + 1,
            name: jMeta.discUsed
          });
        }

        const commentary =
          (
            h.voiceTranscript ||
            jMeta?.voiceNote ||
            jMeta?.notes ||
            h.notes ||
            kMeta?.voiceNote ||
            kMeta?.notes ||
            ''
          ).trim();

        if (s1 > 0 || s2 > 0 || commentary) {
          historicalPlays.push({
            roundId: r.id,
            date: r.date,
            windCondition: r.windCondition || 'calm',
            p1Score: s1 > 0 ? s1 : null,
            p2Score: s2 > 0 ? s2 : null,
            par: h.par || par,
            thrownSequence: seqLabels.filter(Boolean),
            primaryDisc,
            puttFeet: jMeta?.puttDistanceFeet,
            commentary
          });
        }
      }

      const spec = getHoleVisualOutlineSpec(
        activeCourse.courseKey || activeCourse.name,
        hNum,
        distance,
        par,
        hint
      );

      const p1Best = p1Scores.length > 0 ? Math.min(...p1Scores) : null;
      const p1Avg =
        p1Scores.length > 0
          ? Number((p1Scores.reduce((a, b) => a + b, 0) / p1Scores.length).toFixed(2))
          : null;
      const p1AvgRel = p1Avg !== null ? Number((p1Avg - par).toFixed(2)) : null;
      const p1Birdies = p1Scores.filter((s) => s < par).length;
      const p1Pars = p1Scores.filter((s) => s === par).length;
      const p1BogeysPlus = p1Scores.filter((s) => s > par).length;

      const p2Best = p2Scores.length > 0 ? Math.min(...p2Scores) : null;
      const p2Avg =
        p2Scores.length > 0
          ? Number((p2Scores.reduce((a, b) => a + b, 0) / p2Scores.length).toFixed(2))
          : null;

      const verifiedKey = getVerifiedHoleKey(
        activeCourse.courseKey || activeCourse.name,
        hNum
      );
      const verifiedId = DEFAULT_VERIFIED_HOLE_PICKS[verifiedKey];
      const topLogged = Array.from(discCounts.values()).sort((a, b) => b.count - a.count)[0];
      const topLoggedDiscObj = resolveDiscByIdOrName(bag, topLogged?.discId, topLogged?.name);
      const activeVerifiedDisc = resolveDiscByIdOrName(bag, verifiedId);

      // Prefer the active 17-disc Main Bag pick (Cotton Candy + Sync/Archangel/Alien) when
      // the historically most-thrown disc has been moved to Backup / Vault.
      const isTopLoggedActive = Boolean(topLoggedDiscObj && !topLoggedDiscObj.archived);
      const goToDisc =
        (isTopLoggedActive ? topLoggedDiscObj : activeVerifiedDisc) ||
        topLoggedDiscObj ||
        activeVerifiedDisc;

      // Check if user saved a custom hole photo on Live Scorecard
      let customHolePhoto: string | null = null;
      try {
        customHolePhoto = localStorage.getItem(
          `jj_dg_hole_img_v1_${activeCourse.normKey}_${hNum}`
        );
      } catch {
        customHolePhoto = null;
      }

      entries.push({
        holeNumber: hNum,
        par,
        distance,
        hint,
        spec,
        p1Plays: p1Scores.length,
        p1Best,
        p1Avg,
        p1AvgRel,
        p1Birdies,
        p1Pars,
        p1BogeysPlus,
        p2Plays: p2Scores.length,
        p2Best,
        p2Avg,
        goToDisc,
        topLoggedCount: isTopLoggedActive ? topLogged?.count || 0 : 0,
        prevLoggedName: !isTopLoggedActive && topLogged ? topLogged.name : null,
        customHolePhoto,
        historicalPlays
      });
    }

    return entries;
  }, [activeCourse, bag, p1.id, p2.id]);

  const visibleHoleEntries = useMemo(() => {
    if (holeFilter === 'front9') {
      return holeAtlasEntries.filter((h) => h.holeNumber <= 9);
    }
    if (holeFilter === 'back9') {
      return holeAtlasEntries.filter((h) => h.holeNumber >= 10);
    }
    if (holeFilter === 'best') {
      const withScores = holeAtlasEntries.filter((h) => h.p1AvgRel !== null);
      return [...withScores]
        .sort((a, b) => (a.p1AvgRel ?? 99) - (b.p1AvgRel ?? 99))
        .slice(0, Math.min(6, withScores.length));
    }
    if (holeFilter === 'leaks') {
      const leaks = holeAtlasEntries.filter(
        (h) => h.p1AvgRel !== null && h.p1AvgRel > 0
      );
      return [...leaks]
        .sort((a, b) => (b.p1AvgRel ?? -99) - (a.p1AvgRel ?? -99))
        .slice(0, Math.min(6, leaks.length));
    }
    return holeAtlasEntries;
  }, [holeAtlasEntries, holeFilter]);

  // Course-level Historical Stats
  const courseStats = useMemo(() => {
    if (!activeCourse) return null;
    const sampleName = activeCourse.rounds[0]?.courseName || activeCourse.name;
    const jPB = getCoursePersonalBest(sampleName, p1.id, activeCourse.rounds);
    const kPB = getCoursePersonalBest(sampleName, p2.id, activeCourse.rounds);
    const summary = buildCourseSummary(sampleName, activeCourse.rounds, bag);

    let jTotalBirdies = 0;
    let jTotalPars = 0;
    let kTotalBirdies = 0;
    let kTotalPars = 0;
    let jWins = 0;
    let kWins = 0;
    let ties = 0;

    for (const r of activeCourse.rounds) {
      const p1Summary = r.players.find((p) => p.id === p1.id);
      const p2Summary = r.players.find((p) => p.id === p2.id);
      if (p1Summary && p2Summary && p1Summary.total > 0 && p2Summary.total > 0) {
        if (p1Summary.total < p2Summary.total) jWins++;
        else if (p2Summary.total < p1Summary.total) kWins++;
        else ties++;
      }
      for (const h of r.holes) {
        const hp = h.par || 3;
        const s1 = h.scores?.[p1.id] || 0;
        const s2 = h.scores?.[p2.id] || 0;
        if (s1 > 0) {
          if (s1 < hp) jTotalBirdies++;
          else if (s1 === hp) jTotalPars++;
        }
        if (s2 > 0) {
          if (s2 < hp) kTotalBirdies++;
          else if (s2 === hp) kTotalPars++;
        }
      }
    }

    const chronologicalRounds = [...activeCourse.rounds].reverse();
    const firstDate = chronologicalRounds[0]?.date || null;
    const latestDate = activeCourse.rounds[0]?.date || null;

    return {
      jPB,
      kPB,
      summary,
      jTotalBirdies,
      jTotalPars,
      kTotalBirdies,
      kTotalPars,
      jWins,
      kWins,
      ties,
      chronologicalRounds,
      firstDate,
      latestDate
    };
  }, [activeCourse, bag, p1.id, p2.id]);

  const jumpToHoleCard = (holeNum: number) => {
    playChainRattleSfx('tap');
    setHoleFilter('all');
    setFocusedHoleNumber(holeNum);
    setExpandedHoleHistory((prev) => ({ ...prev, [holeNum]: true }));
    setTimeout(() => {
      const el = document.getElementById(`atlas-hole-card-${holeNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  if (!activeCourse || !courseStats) return null;

  const avgHoleDist = Math.round(
    activeCourse.totalFeet / Math.max(1, activeCourse.totalHoles)
  );

  return (
    <div className="space-y-5">
      {/* 1. COURSE ATLAS MASTHEAD & FILTER SHELF */}
      <div className="neon-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-2 border-slate-900/15 pb-3.5">
          <div className="min-w-0">
            <div className="font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#FF5722]">
              CADDIE BOOK &amp; SATELLITE ATLAS // {courseDirectory.length} KC COURSES
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight break-words">
              🗺️ Course Layouts &amp; Historical Details
            </h2>
          </div>

          {/* Course Shelf Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                {
                  id: 'played',
                  label: `🏆 Played (${playedCoursesCount})`,
                  activeCls: 'bg-[#39FF14] text-slate-950'
                },
                {
                  id: 'all',
                  label: `🗺️ All KC (${courseDirectory.length})`,
                  activeCls: 'bg-[#FACC15] text-slate-950'
                },
                {
                  id: 'nine',
                  label: '🌲 9-Hole',
                  activeCls: 'bg-[#00F0FF] text-slate-950'
                },
                {
                  id: 'eighteen',
                  label: '⛳ 18+ Hole',
                  activeCls: 'bg-[#FF2E93] text-white'
                }
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setCourseFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold zine-pill-btn transition-all whitespace-nowrap ${
                  courseFilter === f.id
                    ? f.activeCls
                    : 'bg-white text-slate-900 hover:bg-amber-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Course Picker Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
          {filteredCourseShelf.map((c) => {
            const isSelected = c.normKey === activeCourse.normKey;
            const cSampleName = c.rounds[0]?.courseName || c.name;
            const cPB =
              c.rounds.length > 0
                ? getCoursePersonalBest(cSampleName, p1.id, c.rounds)
                : null;
            const { layout: cLayout } = getCourseHoleLayoutIntel(c.courseKey || c.name);
            const hasSatMap = Boolean(cLayout?.imageUrl && cLayout.imageUrl.trim());

            return (
              <button
                key={c.normKey}
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setSelectedNormKey(c.normKey);
                }}
                className={`text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between gap-2 min-w-0 ${
                  isSelected
                    ? 'bg-[#FACC15] text-slate-950 border-[#0F172A] shadow-[3px_3px_0_#0F172A]'
                    : 'bg-[#080B14] border-slate-700 hover:border-[#00F0FF]'
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-[10px] font-mono-tabular font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-slate-950 text-[#39FF14] border-slate-950'
                          : c.rounds.length > 0
                          ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/50'
                          : 'bg-slate-800 text-slate-300 border-slate-600'
                      }`}
                    >
                      {c.rounds.length > 0
                        ? `${c.rounds.length} ${c.rounds.length === 1 ? 'Round' : 'Rounds'}`
                        : 'Bucket List'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {hasSatMap && (
                        <span
                          className={`text-[9.5px] font-mono-tabular font-extrabold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-white text-slate-950 border border-slate-900'
                              : 'bg-[#00F0FF]/15 text-[#00F0FF]'
                          }`}
                        >
                          🛰️ Map
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono-tabular font-bold ${
                          isSelected ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {c.totalHoles}H
                      </span>
                    </div>
                  </div>
                  <div
                    className={`font-extrabold text-xs sm:text-sm leading-snug truncate ${
                      isSelected ? 'text-slate-950' : ''
                    }`}
                  >
                    {c.name}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[10.5px] font-mono-tabular pt-1 border-t border-current/15">
                  <span className="truncate opacity-80">
                    Par {c.par} · {c.totalFeet.toLocaleString()} ft
                  </span>
                  {cPB && cPB.bestTotal !== null ? (
                    <span
                      className={`font-extrabold shrink-0 ${
                        isSelected ? 'text-pink-700' : 'text-[#FF2E93]'
                      }`}
                    >
                      PB {cPB.bestTotal} ({formatRelativePar(cPB.bestRelPar || 0)})
                    </span>
                  ) : (
                    <span className="opacity-70 shrink-0">Preview →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SELECTED COURSE ZINE COVER BANNER + HISTORICAL SNAPSHOT */}
      <div className="zine-hero-card rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="zine-hero-orb" aria-hidden="true" />

        <div className="relative z-10 flex flex-wrap items-center gap-1.5 pr-12 sm:pr-24">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FF2E93] text-white font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider zine-sticker">
            ⛳ {activeCourse.totalHoles} HOLES · PAR {activeCourse.par} ·{' '}
            {activeCourse.totalFeet.toLocaleString()} FT
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-950 font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider zine-sticker max-w-full truncate">
            📍 {activeCourse.location}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF] text-slate-950 font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider zine-sticker">
            {activeCourse.rounds.length > 0
              ? `★ ${activeCourse.rounds.length} LOGGED ROUND${
                  activeCourse.rounds.length === 1 ? '' : 'S'
                }`
              : '🧭 UNPLAYED KC COURSE'}
          </span>
          {satelliteLayout?.udiscParRating ? (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-[#FFE600] font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider zine-sticker">
              ✦ UDISC RATING {satelliteLayout.udiscParRating} · AVG {avgHoleDist} FT/HOLE
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-[#FFE600] font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider zine-sticker">
              AVG {avgHoleDist} FT / HOLE
            </span>
          )}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl min-w-0">
            <h1 className="font-display text-xl sm:text-3xl font-extrabold uppercase leading-tight tracking-tight break-words zine-keep-color">
              {activeCourse.name}
            </h1>
            {satelliteLayout?.difficultyLabel && (
              <div className="font-mono-tabular text-xs font-extrabold uppercase opacity-90 zine-keep-color">
                {satelliteLayout.difficultyLabel}
              </div>
            )}
            <p className="text-xs sm:text-sm font-semibold leading-relaxed opacity-95 zine-keep-color">
              {satelliteLayout?.overviewNote || courseStats.summary.courseVibe}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <input
              ref={courseMapInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadCustomCourseMap}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => courseMapInputRef.current?.click()}
              className="px-3.5 py-2 rounded-full bg-white text-slate-950 text-xs font-extrabold flex items-center gap-1.5 zine-pill-btn"
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>{customCourseMap ? 'Update UDisc Map' : 'Add UDisc Map Pic'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('birdie');
                onStartRoundAtCourse(activeCourse.courseKey);
              }}
              className="px-4 py-2 rounded-full bg-[#39FF14] text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 zine-pill-btn"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Tee Off Here</span>
            </button>
          </div>
        </div>

        {/* 4-Card Historical Career Snapshot on This Course */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-white/95 text-slate-950 zine-sticker space-y-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-mono-tabular font-extrabold uppercase text-pink-700">
              <span>🏆 {p1.name} Course Record</span>
              {courseStats.latestDate && <span>Last: {courseStats.latestDate}</span>}
            </div>
            <div className="font-mono-tabular text-base sm:text-lg font-extrabold text-slate-950 truncate">
              {courseStats.jPB.bestTotal !== null
                ? `${courseStats.jPB.bestTotal} (${formatRelativePar(
                    courseStats.jPB.bestRelPar || 0
                  )}) · Avg ${courseStats.jPB.avgTotal}`
                : 'No Logged Rounds Yet'}
            </div>
            <div className="text-[11px] font-bold text-slate-700 truncate">
              {activeCourse.rounds.length > 0
                ? `${courseStats.jTotalBirdies} Birdies ★ · ${courseStats.jTotalPars} Pars`
                : `Ready for your debut on ${activeCourse.totalHoles} holes!`}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/95 text-slate-950 zine-sticker space-y-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-mono-tabular font-extrabold uppercase text-sky-700">
              <span>⚡ {p2.name} Course Record</span>
              {courseStats.jWins + courseStats.kWins + courseStats.ties > 0 && (
                <span>
                  H2H: {courseStats.jWins}-{courseStats.kWins}
                  {courseStats.ties > 0 ? `-${courseStats.ties}` : ''}
                </span>
              )}
            </div>
            <div className="font-mono-tabular text-base sm:text-lg font-extrabold text-slate-950 truncate">
              {courseStats.kPB.bestTotal !== null
                ? `${courseStats.kPB.bestTotal} (${formatRelativePar(
                    courseStats.kPB.bestRelPar || 0
                  )}) · Avg ${courseStats.kPB.avgTotal}`
                : activeCourse.rounds.length > 0
                ? 'Solo Rounds Only So Far'
                : 'No Duo Rounds Yet'}
            </div>
            <div className="text-[11px] font-bold text-slate-700 truncate">
              {courseStats.kPB.bestTotal !== null
                ? `${courseStats.kTotalBirdies} Birdies ★ · ${courseStats.kTotalPars} Pars`
                : 'Bring Jack’s 3-disc Discraft kit!'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/95 text-slate-950 zine-sticker space-y-1 min-w-0">
            <div className="text-[11px] font-mono-tabular font-extrabold uppercase text-emerald-700">
              ★ Best Scoring Holes Here
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-950 truncate">
              {courseStats.summary.bestScoringHoles.length > 0
                ? courseStats.summary.bestScoringHoles
                    .slice(0, 3)
                    .map((h) => `H#${h.holeNumber} (${h.avgScore})`)
                    .join(' · ')
                : `Shortest: H#${
                    [...holeAtlasEntries].sort((a, b) => a.distance - b.distance)[0]
                      ?.holeNumber || 1
                  } (${
                    [...holeAtlasEntries].sort((a, b) => a.distance - b.distance)[0]
                      ?.distance || 180
                  }ft)`}
            </div>
            <div className="text-[11px] font-bold text-slate-700 truncate">
              {courseStats.summary.toughestHoles.length > 0
                ? `Toughest: H#${courseStats.summary.toughestHoles[0].holeNumber} (Avg ${courseStats.summary.toughestHoles[0].avgScore})`
                : `Longest: H#${
                    [...holeAtlasEntries].sort((a, b) => b.distance - a.distance)[0]
                      ?.holeNumber || 1
                  } (${
                    [...holeAtlasEntries].sort((a, b) => b.distance - a.distance)[0]
                      ?.distance || 300
                  }ft)`}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/95 text-slate-950 zine-sticker space-y-1 min-w-0">
            <div className="text-[11px] font-mono-tabular font-extrabold uppercase text-amber-700">
              🥏 Top Course Workhorses
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-950 truncate">
              {courseStats.summary.topGoToDiscs.length > 0
                ? courseStats.summary.topGoToDiscs
                    .slice(0, 3)
                    .map((d) => `${d.name} (${d.count}×)`)
                    .join(' · ')
                : 'Proto Glow Mako3 · Star Rollo · Star Roadrunner'}
            </div>
            <div className="text-[11px] font-bold text-slate-700 truncate">
              {courseStats.firstDate
                ? `Played ${courseStats.firstDate} → ${courseStats.latestDate}`
                : 'Tap any hole below for caddie disc line'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FULL-COURSE VISUAL LAYOUT BOARD (SATELLITE MAP + INTERACTIVE ROUTING LOOP) */}
      <div className="rangefinder-keep-dark rounded-2xl bg-[#07110D] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/25 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tabular font-extrabold uppercase tracking-wider text-[#39FF14]">
              <Compass className="w-4 h-4 text-[#00F0FF]" />
              <span>Full Course Layout &amp; Routing Map</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Tap any hole node on the course loop to jump straight to its Tee-Sign diagram &amp; historical shot log!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeSatelliteMapUrl && (
              <button
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setMapMode('satellite');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono-tabular font-extrabold border transition-all flex items-center gap-1.5 ${
                  mapMode === 'satellite'
                    ? 'bg-[#00F0FF] text-slate-950 border-[#00F0FF]'
                    : 'bg-[#0D1B14] text-[#00F0FF] border-[#00F0FF]/40 hover:bg-emerald-950'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>🛰️ UDisc Satellite Map</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playChainRattleSfx('tap');
                setMapMode('loop');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-tabular font-extrabold border transition-all flex items-center gap-1.5 ${
                mapMode === 'loop' || !activeSatelliteMapUrl
                  ? 'bg-[#39FF14] text-slate-950 border-[#39FF14]'
                  : 'bg-[#0D1B14] text-[#39FF14] border-[#39FF14]/40 hover:bg-emerald-950'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>🧭 Interactive {activeCourse.totalHoles}-Hole Loop</span>
            </button>

            {customCourseMap && (
              <button
                type="button"
                onClick={handleRemoveCustomCourseMap}
                title="Remove custom uploaded course map"
                className="p-1.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 hover:bg-rose-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* SATELLITE MAP VIEW + MINI INTERACTIVE HOLE JUMP RIBBON */}
        {mapMode === 'satellite' && activeSatelliteMapUrl && (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#00F0FF]/50 bg-black">
              <img
                src={activeSatelliteMapUrl}
                alt={`${activeCourse.name} UDisc Satellite Course Layout`}
                onClick={() => setZoomSatelliteModal(true)}
                className="w-full max-h-[460px] object-contain mx-auto cursor-zoom-in"
              />
              <button
                type="button"
                onClick={() => setZoomSatelliteModal(true)}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-[#00F0FF] text-xs font-mono-tabular font-extrabold text-[#00F0FF] flex items-center gap-1.5 shadow-lg"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full-Screen Zoom</span>
              </button>
            </div>

            {/* Quick Hole Jump Pills Underneath Satellite Image */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono-tabular font-extrabold text-emerald-300 uppercase mr-1">
                Jump to Hole:
              </span>
              {holeAtlasEntries.map((h) => {
                const badgeCls =
                  h.p1AvgRel === null
                    ? 'bg-[#0D1B14] text-slate-200 border-emerald-500/30'
                    : h.p1AvgRel < 0
                    ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]'
                    : h.p1AvgRel <= 0.25
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]'
                    : h.p1AvgRel <= 0.75
                    ? 'bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]'
                    : 'bg-[#FF2E93]/20 text-[#FF2E93] border-[#FF2E93]';
                return (
                  <button
                    key={h.holeNumber}
                    type="button"
                    onClick={() => jumpToHoleCard(h.holeNumber)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono-tabular font-extrabold transition-transform hover:-translate-y-0.5 ${badgeCls}`}
                  >
                    #{h.holeNumber} · {h.distance}&apos;
                    {h.p1Best !== null && h.p1Best < h.par ? ' ★' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* INTERACTIVE PARK ROUTING LOOP BOARD (WORKS FOR EVERY COURSE!) */}
        {(mapMode === 'loop' || !activeSatelliteMapUrl) && (
          <div className="space-y-3">
            {/* Color Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular text-slate-300 bg-[#0B1B14] px-3 py-2 rounded-xl border border-emerald-500/20">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14]" />
                  <span>Under Par Avg</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                  <span>Par Zone (≤+0.3)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]" />
                  <span>Bogey Battle</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E93]" />
                  <span>Stroke Leak (&gt;+0.8)</span>
                </span>
              </div>
              <span className="text-emerald-300 font-bold">
                Start Tee #1 → Finish Basket #{activeCourse.totalHoles}
              </span>
            </div>

            {/* Serpentine Front 9 / Back 9 Park Routing Tiles */}
            {[
              {
                label:
                  holeAtlasEntries.length > 9
                    ? '⛳ Front 9 Loop (Holes #1 → #9)'
                    : `⛳ Full ${holeAtlasEntries.length}-Hole Course Loop`,
                holes: holeAtlasEntries.filter((h) => h.holeNumber <= 9)
              },
              ...(holeAtlasEntries.length > 9
                ? [
                    {
                      label: `🌲 Back 9 Loop (Holes #10 → #${holeAtlasEntries.length})`,
                      holes: holeAtlasEntries.filter((h) => h.holeNumber >= 10)
                    }
                  ]
                : [])
            ].map((nineGroup) => (
              <div
                key={nineGroup.label}
                className="p-3 sm:p-4 rounded-2xl bg-[#040C09] border border-emerald-500/30 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-mono-tabular font-extrabold text-emerald-300 uppercase">
                  <span>{nineGroup.label}</span>
                  <span>
                    Par {nineGroup.holes.reduce((s, h) => s + h.par, 0)} ·{' '}
                    {nineGroup.holes
                      .reduce((s, h) => s + h.distance, 0)
                      .toLocaleString()}{' '}
                    ft
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-2">
                  {nineGroup.holes.map((h, idx) => {
                    const shapeArrow =
                      h.spec.shape === 'dogleg_left'
                        ? '↰'
                        : h.spec.shape === 'slight_left'
                        ? '↖'
                        : h.spec.shape === 'dogleg_right'
                        ? '↱'
                        : h.spec.shape === 'slight_right'
                        ? '↗'
                        : h.spec.shape === 's_curve'
                        ? '∿'
                        : h.spec.shape === 'tunnel'
                        ? '║'
                        : '↑';

                    const borderAccent =
                      h.p1AvgRel === null
                        ? 'border-emerald-500/35 hover:border-[#00F0FF]'
                        : h.p1AvgRel < 0
                        ? 'border-[#39FF14] bg-[#39FF14]/10'
                        : h.p1AvgRel <= 0.3
                        ? 'border-[#00F0FF] bg-[#00F0FF]/10'
                        : h.p1AvgRel <= 0.8
                        ? 'border-[#FACC15]/80 bg-[#FACC15]/10'
                        : 'border-[#FF2E93]/85 bg-[#FF2E93]/10';

                    const scoreColor =
                      h.p1AvgRel === null
                        ? 'text-slate-400'
                        : h.p1AvgRel < 0
                        ? 'text-[#39FF14]'
                        : h.p1AvgRel <= 0.3
                        ? 'text-[#00F0FF]'
                        : h.p1AvgRel <= 0.8
                        ? 'text-[#FACC15]'
                        : 'text-[#FF2E93]';

                    return (
                      <button
                        key={h.holeNumber}
                        type="button"
                        onClick={() => jumpToHoleCard(h.holeNumber)}
                        className={`relative p-2.5 rounded-xl bg-[#091812] border-2 text-left transition-all hover:-translate-y-0.5 flex flex-col justify-between gap-1.5 min-w-0 ${borderAccent}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono-tabular text-xs font-extrabold text-white">
                            #{h.holeNumber}
                          </span>
                          <span className="font-mono-tabular text-sm font-black text-[#00F0FF]">
                            {shapeArrow}
                          </span>
                        </div>

                        <div className="font-mono-tabular text-[11px] font-bold text-emerald-200 truncate">
                          P{h.par} · {h.distance}&apos;
                        </div>

                        <div className="flex items-center justify-between gap-1 text-[9.5px] font-mono-tabular">
                          <span className="text-slate-300 truncate">
                            {h.spec.corridor === 'tight_woods'
                              ? '🌲 Woods'
                              : h.spec.corridor === 'open'
                              ? '☀️ Open'
                              : '🌳 Park'}
                          </span>
                          {h.spec.elevation !== 'flat' && (
                            <span className="text-[#FACC15] font-extrabold shrink-0">
                              {h.spec.elevation === 'uphill' ? '↑UP' : '↓DN'}
                            </span>
                          )}
                        </div>

                        <div
                          className={`pt-1 border-t border-white/10 text-[10px] font-mono-tabular font-extrabold truncate ${scoreColor}`}
                        >
                          {h.p1Avg !== null
                            ? `Avg ${h.p1Avg} · B:${h.p1Best}${
                                h.p1Best !== null && h.p1Best <= h.par ? '★' : ''
                              }`
                            : 'Tap Layout →'}
                        </div>

                        {idx < nineGroup.holes.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400/70 font-bold pointer-events-none"
                          >
                            →
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. HOLE-BY-HOLE TEE-SIGN DIAGRAMS & FORENSIC HISTORICAL LOGS */}
      <div className="neon-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-slate-900/15 pb-3.5">
          <div>
            <div className="font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#FF5722]">
              HOLE-BY-HOLE TEE SIGNS &amp; ON-COURSE VOICE LOGS
            </div>
            <h3 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight">
              ⛳ Visual Hole Layouts &amp; Historical Shot Archive ({visibleHoleEntries.length}{' '}
              {visibleHoleEntries.length === 1 ? 'Hole' : 'Holes'})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: `All (${holeAtlasEntries.length})` },
                ...(holeAtlasEntries.length > 9
                  ? ([
                      { id: 'front9', label: 'Front 9' },
                      { id: 'back9', label: 'Back 9' }
                    ] as const)
                  : []),
                ...(activeCourse.rounds.length > 0
                  ? ([
                      { id: 'best', label: '★ Best Holes' },
                      { id: 'leaks', label: '⚠️ Leak Holes' }
                    ] as const)
                  : [])
              ] as ReadonlyArray<{ id: HoleFilterMode; label: string }>
            ).map((hf) => (
              <button
                key={hf.id}
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  setHoleFilter(hf.id);
                }}
                className={`px-3 py-1 rounded-full text-xs font-extrabold zine-pill-btn transition-all ${
                  holeFilter === hf.id
                    ? 'bg-[#00F0FF] text-slate-950'
                    : 'bg-white text-slate-900 hover:bg-sky-50'
                }`}
              >
                {hf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Visual Tee-Sign + Historical Hole Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleHoleEntries.map((h) => {
            const isFocused = focusedHoleNumber === h.holeNumber;
            const isHistoryOpen = Boolean(expandedHoleHistory[h.holeNumber]);
            const latestPlay = h.historicalPlays[0] || null;
            const goToCardImg = h.goToDisc ? getDiscCardImageUrl(h.goToDisc) : null;

            return (
              <div
                key={h.holeNumber}
                id={`atlas-hole-card-${h.holeNumber}`}
                className={`rangefinder-keep-dark rounded-2xl bg-[#08120E] p-3.5 sm:p-4 space-y-3 transition-all ${
                  isFocused ? 'ring-4 ring-[#FACC15]' : ''
                }`}
              >
                {/* Hole Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#39FF14] text-slate-950 font-mono-tabular text-xs sm:text-sm font-black shrink-0">
                      HOLE #{h.holeNumber}
                    </span>
                    <span className="font-mono-tabular text-xs sm:text-sm font-extrabold text-white">
                      Par {h.par} · <span className="text-[#00F0FF]">{h.distance} ft</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-[10.5px] font-mono-tabular font-bold text-emerald-200">
                      {h.spec.shapeLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10.5px] font-mono-tabular font-bold text-slate-200">
                      {h.spec.corridorLabel}
                    </span>
                  </div>
                </div>

                {/* Top-Down SVG Tee-Sign + Landmarks / Stats Split */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                  <div className="sm:col-span-5">
                    <div className="rounded-xl border border-emerald-500/35 bg-[#040B08] p-1.5 overflow-hidden">
                      {h.customHolePhoto ? (
                        <img
                          src={h.customHolePhoto}
                          alt={`Hole ${h.holeNumber} custom tee photo`}
                          className="w-full h-[148px] object-cover rounded-lg"
                        />
                      ) : (
                        renderMiniTeeSignSvg(
                          h.spec,
                          `${activeCourse.normKey}-h${h.holeNumber}`
                        )
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-7 space-y-2 min-w-0">
                    <div className="p-2.5 rounded-xl bg-[#0C1B15] border border-emerald-500/25 space-y-1">
                      <div className="text-xs font-extrabold text-white leading-snug">
                        📍 {h.spec.pinNote}
                      </div>
                      <div className="text-[11.5px] text-emerald-300 leading-snug">
                        <span className="font-mono-tabular font-extrabold text-[#00F0FF] uppercase mr-1">
                          Caddie Line:
                        </span>
                        {h.spec.flightLineTip}
                      </div>
                    </div>

                    {/* Go-To Disc Card Pill */}
                    {h.goToDisc && (
                      <button
                        type="button"
                        onClick={() => {
                          playChainRattleSfx('tap');
                          onOpenDiscCard?.(
                            h.goToDisc!.id,
                            h.goToDisc!.ownerId === 'jack' ? 'jack' : undefined
                          );
                        }}
                        className="w-full p-2 rounded-xl bg-[#0E1628] border border-[#00F0FF]/45 hover:border-[#00F0FF] flex items-center justify-between gap-2 text-left transition-colors min-w-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {goToCardImg ? (
                            <img
                              src={goToCardImg}
                              alt={h.goToDisc.name}
                              className="w-7 h-9 rounded object-cover border border-white/20 shrink-0"
                            />
                          ) : (
                            <Disc className="w-4 h-4 text-[#00F0FF] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono-tabular font-bold uppercase text-[#00F0FF]">
                              {h.topLoggedCount > 0
                                ? `★ Most Thrown Here (${h.topLoggedCount}×)`
                                : h.prevLoggedName
                                ? `🍬 Active Bag Pick (Prev: ${h.prevLoggedName})`
                                : '🍬 Active Main Bag Pick'}
                            </div>
                            <div className="text-xs font-extrabold text-white truncate">
                              {h.goToDisc.weightGrams ? `${h.goToDisc.weightGrams}g ` : ''}
                              {h.goToDisc.name} [{h.goToDisc.speed}|{h.goToDisc.glide}|
                              {h.goToDisc.turn}|{h.goToDisc.fade}]
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono-tabular font-bold text-[#39FF14] shrink-0">
                          Card →
                        </span>
                      </button>
                    )}

                    {/* Career Hole Scoring Strip (Jeffery & Jack) */}
                    <div className="grid grid-cols-2 gap-2 font-mono-tabular text-[11px]">
                      <div className="p-2 rounded-xl bg-[#0B1422] border border-[#FF2E93]/40">
                        <div className="text-[10px] font-sans font-extrabold text-[#FF2E93]">
                          {p1.name} ({h.p1Plays}×)
                        </div>
                        {h.p1Avg !== null ? (
                          <>
                            <div className="font-extrabold text-white mt-0.5">
                              Best{' '}
                              <span
                                className={
                                  (h.p1Best || 9) < h.par
                                    ? 'text-[#39FF14]'
                                    : (h.p1Best || 9) === h.par
                                    ? 'text-[#00F0FF]'
                                    : 'text-[#FACC15]'
                                }
                              >
                                {h.p1Best}
                                {(h.p1Best || 9) <= h.par ? '★' : ''}
                              </span>{' '}
                              · Avg {h.p1Avg}
                            </div>
                            <div className="text-[10px] text-slate-300">
                              {h.p1Birdies}B · {h.p1Pars}P · {h.p1BogeysPlus}Bog+
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400 mt-0.5">Unplayed</div>
                        )}
                      </div>

                      <div className="p-2 rounded-xl bg-[#0B1422] border border-[#00F0FF]/40">
                        <div className="text-[10px] font-sans font-extrabold text-[#00F0FF]">
                          {p2.name} ({h.p2Plays}×)
                        </div>
                        {h.p2Avg !== null ? (
                          <>
                            <div className="font-extrabold text-white mt-0.5">
                              Best{' '}
                              <span
                                className={
                                  (h.p2Best || 9) <= h.par
                                    ? 'text-[#39FF14]'
                                    : 'text-[#00F0FF]'
                                }
                              >
                                {h.p2Best}
                                {(h.p2Best || 9) <= h.par ? '★' : ''}
                              </span>{' '}
                              · Avg {h.p2Avg}
                            </div>
                            <div className="text-[10px] text-slate-300">
                              {h.p2Plays} {h.p2Plays === 1 ? 'Round' : 'Rounds'}
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400 mt-0.5">No Duo Logs</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historical Plays Preview + Expandable Full Hole Log */}
                {h.historicalPlays.length > 0 && (
                  <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                    {!isHistoryOpen && latestPlay && (
                      <div className="p-2.5 rounded-xl bg-[#060F0B] border border-slate-800 text-xs space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono-tabular text-[11px]">
                          <span className="font-extrabold text-[#FACC15]">
                            Latest ({latestPlay.date}):
                          </span>
                          <div className="flex items-center gap-2">
                            {latestPlay.p1Score !== null && (
                              <span
                                className={`font-extrabold ${
                                  latestPlay.p1Score < latestPlay.par
                                    ? 'text-[#39FF14]'
                                    : latestPlay.p1Score === latestPlay.par
                                    ? 'text-[#00F0FF]'
                                    : 'text-slate-200'
                                }`}
                              >
                                {p1.name}: {latestPlay.p1Score}
                                {latestPlay.p1Score <= latestPlay.par ? ' ★' : ''}
                              </span>
                            )}
                            {latestPlay.p2Score !== null && (
                              <span className="font-extrabold text-[#00F0FF]">
                                {p2.name}: {latestPlay.p2Score}
                                {latestPlay.p2Score <= latestPlay.par ? ' ★' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        {latestPlay.commentary && (
                          <p className="text-[11.5px] text-slate-300 leading-snug line-clamp-2">
                            &ldquo;{latestPlay.commentary}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        playChainRattleSfx('tap');
                        setExpandedHoleHistory((prev) => ({
                          ...prev,
                          [h.holeNumber]: !prev[h.holeNumber]
                        }));
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#0D1B14] hover:bg-emerald-950 border border-emerald-500/35 text-xs font-mono-tabular font-extrabold text-[#39FF14] flex items-center justify-between"
                    >
                      <span>
                        📜 {isHistoryOpen ? 'Hide' : 'View All'} {h.historicalPlays.length}{' '}
                        Historical {h.historicalPlays.length === 1 ? 'Play' : 'Plays'} on Hole #
                        {h.holeNumber}
                      </span>
                      {isHistoryOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {isHistoryOpen && (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {h.historicalPlays.map((pl) => (
                          <div
                            key={`${pl.roundId}-${h.holeNumber}`}
                            className="p-2.5 rounded-xl bg-[#050C09] border border-emerald-500/25 space-y-1.5 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular">
                              <span className="font-extrabold text-[#FACC15]">
                                📅 {pl.date} · {pl.windCondition}
                              </span>
                              <div className="flex items-center gap-2">
                                {pl.p1Score !== null && (
                                  <span
                                    className={`px-2 py-0.5 rounded font-extrabold ${
                                      pl.p1Score < pl.par
                                        ? 'bg-[#39FF14] text-slate-950'
                                        : pl.p1Score === pl.par
                                        ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50'
                                        : 'bg-slate-800 text-slate-200'
                                    }`}
                                  >
                                    {p1.name}: {pl.p1Score}
                                  </span>
                                )}
                                {pl.p2Score !== null && (
                                  <span
                                    className={`px-2 py-0.5 rounded font-extrabold ${
                                      pl.p2Score <= pl.par
                                        ? 'bg-[#39FF14]/25 text-[#39FF14] border border-[#39FF14]/60'
                                        : 'bg-slate-800 text-[#00F0FF]'
                                    }`}
                                  >
                                    {p2.name}: {pl.p2Score}
                                  </span>
                                )}
                              </div>
                            </div>

                            {(pl.thrownSequence.length > 0 || pl.puttFeet) && (
                              <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-mono-tabular text-emerald-300">
                                {pl.thrownSequence.length > 0 && (
                                  <span>🥏 {pl.thrownSequence.join(' → ')}</span>
                                )}
                                {pl.puttFeet && (
                                  <span className="text-[#00F0FF]">
                                    · 🎯 {pl.puttFeet}ft putt
                                  </span>
                                )}
                              </div>
                            )}

                            {pl.commentary && (
                              <p className="text-[11.5px] text-slate-200 leading-relaxed">
                                {pl.commentary}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. COURSE HISTORICAL PROGRESSION, STORY TAKEAWAYS & COMPLETED SCORECARDS */}
      {activeCourse.rounds.length > 0 && (
        <div className="neon-card rounded-2xl p-4 sm:p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900/15 pb-3">
            <div>
              <div className="font-mono-tabular text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#FF2E93]">
                COURSE CHRONICLES // {activeCourse.rounds.length} VISITS LOGGED
              </div>
              <h3 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight">
                📈 Score Progression, Highlights &amp; Past Scorecards
              </h3>
            </div>

            {onOpenRoundHistory && (
              <button
                type="button"
                onClick={() => {
                  playChainRattleSfx('tap');
                  onOpenRoundHistory(activeCourse.rounds[0]?.courseName || activeCourse.name);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#FACC15] text-slate-950 text-xs font-extrabold flex items-center gap-1.5 zine-pill-btn self-start sm:self-auto"
              >
                <History className="w-3.5 h-3.5" />
                <span>Open in Round History →</span>
              </button>
            )}
          </div>

          {/* Chronological Score Progression Visual Timeline */}
          <div className="rangefinder-keep-dark rounded-2xl bg-[#080D18] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular">
              <span className="font-extrabold text-[#39FF14] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
                <span>Chronological Score Progression at {activeCourse.name}</span>
              </span>
              <span className="text-slate-400">
                Par {activeCourse.par} · Tap any round bar to inspect scorecard
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-1">
              {courseStats.chronologicalRounds.map((r, idx) => {
                const rPar = r.par || activeCourse.par;
                const jEntry = r.players.find((p) => p.id === p1.id);
                const kEntry = r.players.find((p) => p.id === p2.id);
                const jRel = jEntry ? jEntry.total - rPar : null;
                const isPB =
                  jEntry &&
                  courseStats.jPB.bestTotal !== null &&
                  jEntry.total === courseStats.jPB.bestTotal;
                const isSelectedRound = expandedRoundId === r.id;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      playChainRattleSfx('tap');
                      setExpandedRoundId(r.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left font-mono-tabular transition-all ${
                      isSelectedRound
                        ? 'bg-[#132038] border-[#00F0FF] ring-2 ring-[#00F0FF]/50'
                        : isPB
                        ? 'bg-[#0F2419] border-[#39FF14]'
                        : 'bg-[#0D1424] border-slate-700 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>#{idx + 1}</span>
                      <span>{r.date.slice(5)}</span>
                    </div>
                    <div className="text-sm font-black text-white mt-1 flex items-center gap-1">
                      <span>
                        {jEntry
                          ? `${jEntry.total} (${formatRelativePar(jRel || 0)})`
                          : '—'}
                      </span>
                      {isPB && <Trophy className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />}
                    </div>
                    {kEntry && kEntry.total > 0 && (
                      <div className="text-[10px] font-bold text-[#00F0FF] mt-0.5 truncate">
                        Jack: {kEntry.total} ({formatRelativePar(kEntry.total - rPar)})
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commentary Highlights & Weather/Wind Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#080B14] border-2 space-y-2">
              <div className="font-extrabold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF2E93]" />
                <span>Memorable On-Course Moments &amp; Takeaways</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside leading-snug">
                {courseStats.summary.commentaryHighlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080B14] border-2 space-y-2">
              <div className="font-extrabold text-sm flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-600" />
                <span>Weather, Wind &amp; Scoring Keys</span>
              </div>
              <p className="leading-relaxed">
                {courseStats.summary.conditionsAndWindRecap}
              </p>
              {courseStats.summary.toughestHoles.length > 0 && (
                <div className="pt-2 border-t border-slate-900/15 space-y-1 font-mono-tabular text-[11px]">
                  <div className="font-extrabold uppercase text-[#FF2E93]">
                    ⚠️ Highest-ROI Stroke Savers:
                  </div>
                  {courseStats.summary.toughestHoles.slice(0, 3).map((th) => (
                    <div key={th.holeNumber} className="truncate">
                      <strong>Hole #{th.holeNumber}</strong> (Avg {th.avgScore}):{' '}
                      {th.verifiedDisc}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expandable Historical Round Scorecards at This Course */}
          <div className="space-y-3">
            {activeCourse.rounds.map((r) => {
              const rPar = r.par || activeCourse.par;
              const jEntry = r.players.find((p) => p.id === p1.id);
              const kEntry = r.players.find((p) => p.id === p2.id);
              const isOpen = expandedRoundId === r.id;

              return (
                <div
                  key={r.id}
                  className="rangefinder-keep-dark rounded-2xl bg-[#09111E] p-3.5 sm:p-4 space-y-3"
                >
                  <div
                    onClick={() =>
                      setExpandedRoundId((prev) => (prev === r.id ? null : r.id))
                    }
                    className="flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="font-mono-tabular text-xs font-extrabold text-[#FACC15]">
                        📅 {r.date} · {r.duration || 'Round'} · Wind: {r.windCondition || 'calm'}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 font-mono-tabular text-sm font-extrabold text-white">
                        {jEntry && (
                          <span className="text-[#39FF14]">
                            {p1.name}: {jEntry.total} ({formatRelativePar(jEntry.total - rPar)})
                          </span>
                        )}
                        {kEntry && kEntry.total > 0 && (
                          <span className="text-[#00F0FF]">
                            {p2.name}: {kEntry.total} ({formatRelativePar(kEntry.total - rPar)})
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-600 text-xs font-mono-tabular font-bold text-slate-200 flex items-center gap-1">
                      <span>{isOpen ? 'Hide Card' : 'Scorecard'}</span>
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>

                  {isOpen && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-800">
                      {r.notes && (
                        <p className="text-xs text-emerald-200 leading-relaxed bg-[#050A12] p-2.5 rounded-xl border border-emerald-500/25">
                          {r.notes}
                        </p>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse font-mono-tabular text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-700 text-slate-400">
                              <th className="py-1.5 px-2 text-left">Hole</th>
                              {r.holes.map((h) => (
                                <th key={h.number} className="py-1.5 px-1.5">
                                  {h.number}
                                </th>
                              ))}
                              <th className="py-1.5 px-2 text-right text-[#FACC15]">Tot</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-800/80 text-slate-400 text-[10px]">
                              <td className="py-1 px-2 text-left font-bold">Par</td>
                              {r.holes.map((h) => (
                                <td key={h.number} className="py-1 px-1.5">
                                  {h.par || 3}
                                </td>
                              ))}
                              <td className="py-1 px-2 text-right font-bold">{rPar}</td>
                            </tr>
                            {jEntry && (
                              <tr className="border-b border-slate-800">
                                <td className="py-1.5 px-2 text-left font-sans font-extrabold text-[#FF2E93]">
                                  {p1.name}
                                </td>
                                {r.holes.map((h) => {
                                  const sc = h.scores?.[p1.id] || 0;
                                  const hp = h.par || 3;
                                  return (
                                    <td key={h.number} className="py-1.5 px-1">
                                      <span
                                        className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-extrabold ${
                                          sc > 0 && sc < hp
                                            ? 'bg-[#39FF14] text-slate-950'
                                            : sc === hp
                                            ? 'bg-[#00F0FF]/20 text-[#00F0FF]'
                                            : 'text-slate-200'
                                        }`}
                                      >
                                        {sc || '—'}
                                      </span>
                                    </td>
                                  );
                                })}
                                <td className="py-1.5 px-2 text-right font-extrabold text-[#39FF14]">
                                  {jEntry.total}
                                </td>
                              </tr>
                            )}
                            {kEntry && kEntry.total > 0 && (
                              <tr>
                                <td className="py-1.5 px-2 text-left font-sans font-extrabold text-[#00F0FF]">
                                  {p2.name}
                                </td>
                                {r.holes.map((h) => {
                                  const sc = h.scores?.[p2.id] || 0;
                                  const hp = h.par || 3;
                                  return (
                                    <td key={h.number} className="py-1.5 px-1">
                                      <span
                                        className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-extrabold ${
                                          sc > 0 && sc < hp
                                            ? 'bg-[#39FF14] text-slate-950'
                                            : sc === hp
                                            ? 'bg-[#39FF14]/25 text-[#39FF14]'
                                            : 'text-slate-300'
                                        }`}
                                      >
                                        {sc || '—'}
                                      </span>
                                    </td>
                                  );
                                })}
                                <td className="py-1.5 px-2 text-right font-extrabold text-[#00F0FF]">
                                  {kEntry.total}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL-SCREEN SATELLITE MAP LIGHTBOX */}
      {zoomSatelliteModal && activeSatelliteMapUrl && (
        <div
          onClick={() => setZoomSatelliteModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-6xl w-full max-h-[92vh] rounded-2xl bg-[#050B08] border-2 border-[#00F0FF] p-3 sm:p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-display text-sm sm:text-lg font-extrabold text-white truncate">
                🛰️ {activeCourse.name} — Course Layout Map
              </div>
              <button
                type="button"
                onClick={() => setZoomSatelliteModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF2E93] text-white text-xs font-extrabold shrink-0"
              >
                Close ✕
              </button>
            </div>
            <div className="overflow-auto flex-1 flex items-center justify-center bg-black rounded-xl">
              <img
                src={activeSatelliteMapUrl}
                alt={`${activeCourse.name} Full Course Map`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
