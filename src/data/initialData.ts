import v65Backup from '../../public/assets/aistudio/DG_Full_Backup_2026-10-21_8f3e6693.json';
import { EMBEDDED_CARD_IMAGES } from './cardImageAssets';

export interface PlayerRosterItem {
  id: string;
  name: string;
  tag?: string;
  color?: string;
  pdgaNumber?: string;
}

export type CaddieScenario =
  | 'calm'
  | 'headwind'
  | 'tailwind'
  | 'cross_lr'
  | 'cross_rl';

export interface HoleShotMeta {
  puttDistance?: 'C1' | 'C2' | 'Throw-in';
  puttDistanceFeet?: number;
  fairwayHit?: boolean;
  obStrokes?: number;
  discUsed?: string;
  thrownDiscId?: string;
  scenarioUsed?: CaddieScenario;
  voiceNote?: string;
  notes?: string;
  throws?: Array<{ shotType: string; discId: string }>;
}

export interface HoleData {
  number: number;
  par: number;
  distance: number;
  scores: Record<string, number>;
  meta?: Record<string, HoleShotMeta>;
  notes?: string;
  voiceTranscript?: string;
}

export interface RoundPlayerSummary {
  id: string;
  name: string;
  tag?: string;
  total: number;
}

export interface HistoricalRound {
  id: number;
  courseName: string;
  totalHoles: number;
  date: string;
  duration: string;
  par: number;
  players: RoundPlayerSummary[];
  holes: HoleData[];
  notes?: string;
  weather?: string;
  windCondition?: CaddieScenario;
  roundTranscript?: string;
  gameMode?: 'stroke' | 'skins' | 'match';
  updatedAt?: number;
}

export interface ActiveRoundState {
  courseKey: string;
  courseName: string;
  totalHoles: number;
  date: string;
  currentHoleIndex: number;
  activePlayerIds?: string[];
  gameMode?: 'stroke' | 'skins' | 'match';
  windCondition?: CaddieScenario;
  roundTranscript?: string;
  voiceRecordingConfirmed?: boolean;
  holes: HoleData[];
  updatedAt?: number;
}

export interface TimerState {
  running: boolean;
  startTime: number | null;
  accumulatedMs: number;
}

export interface CourseTemplate {
  key: string;
  name: string;
  location: string;
  totalHoles: number;
  holes: Array<{ number: number; par: number; distance: number; hint?: string }>;
  updatedAt?: number;
}

export type SpeedTier = 'SPD 2-4' | 'SPD 5' | 'SPD 7-11';
export type StabilitySlot = 'Overstable' | 'Neutral' | 'Understable';

export interface DiscItem {
  id: string;
  ownerId: string; // 'jeffery' | 'jack' | 'shared'
  cardNumber?: string;
  cardImage?: string;
  name: string;
  brand: string;
  slotCategory: string;
  plastic: string;
  weightGrams: number | null;
  colorStamp: string;
  orderNumber?: string;
  sku?: string;
  price?: string;
  type: 'Putter' | 'Midrange' | 'Fairway Driver' | 'Distance Driver';
  speedTier: SpeedTier;
  stabilitySlot: StabilitySlot;
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  colorHex: string;
  stampHex?: string;
  idealMinFeet: number;
  idealMaxFeet: number;
  moldAndFlight: string;
  courseStrategy: string;
  transcriptStats?: string;
  personalFlightNotes?: string;
  fieldTestRank?: string;
  backComments?: string;
  caddieScenarios: CaddieScenario[];
  caddieRoleNote?: string;
  spotterWarning?: string;
  isSynergyAddon?: boolean;
  archived?: boolean;
  updatedAt?: number;
}

export interface PackGearItem {
  id: string;
  name: string;
  category: string;
  orderRef: string;
  packed: boolean;
}

export type BgThemeMode =
  | 'adventure'
  | 'midnight'
  | 'sugar'
  | 'glow'
  | 'turf'
  | 'sunset'
  | 'synthwave'
  | 'championship';

export interface AppExportPayload {
  app: string;
  version: string;
  exportDate: string;
  updatedAt?: number;
  deviceId?: string;
  history: HistoricalRound[];
  roster: PlayerRosterItem[];
  roundState: ActiveRoundState;
  webhookUrl?: string;
  timerState: TimerState;
  courses?: CourseTemplate[];
  bag?: DiscItem[];
  isRoundInProgress?: boolean;
  verifiedHolePicks?: Record<string, string>;
  bgTheme?: BgThemeMode;
  deletedIds?: string[];
  forceOverwrite?: boolean;
  forceOverwriteAt?: number;
}

export const INITIAL_PACK_GEAR: PackGearItem[] = [
  {
    id: 'gear-pack',
    name: 'Innova Adventure Pack Backpack (Pink/Blue · 4-Putter Top + 14-Disc Main)',
    category: 'Primary 18-Disc Bag',
    orderRef: '1010 Discs',
    packed: true
  },
  {
    id: 'gear-retriever',
    name: 'Telescoping Dynamic Discs Retriever (PDGA Rule QA-EQU-1)',
    category: 'Disc Recovery',
    orderRef: '1010 Order #279091 ($34.99)',
    packed: true
  },
  {
    id: 'gear-towel',
    name: 'Dual-Material 1010 Microfiber Towel',
    category: 'Grip & Dry',
    orderRef: '1010 Order #279091 ($6.74)',
    packed: true
  },
  {
    id: 'gear-gripbag',
    name: 'AceBag / Dirt Bag Grip Enhancer (PDGA Rule 813.02.C)',
    category: 'Hand Dry',
    orderRef: '1010 Order #277696',
    packed: true
  },
  {
    id: 'gear-mini',
    name: 'Mini Marker Disc',
    category: 'PDGA Lie Marker',
    orderRef: 'Adventure Pack Kit',
    packed: true
  }
];

export const ARCHIVED_DISC_IDS = new Set([
  'innova-aviar',
  'innova-sync',
  'innova-pig',
  'innova-toro',
  'innova-toro-alt',
  'innova-rollo',
  'innova-mako3',
  'innova-jay',
  'innova-roc3',
  'innova-classic-glow-roc',
  'innova-it',
  'innova-leopard3',
  'innova-archangel',
  'innova-roadrunner',
  'innova-firebird',
  'innova-classic-glow-beast',
  'innova-mamba',
  'innova-classic-glow-wraith'
]);

const ROUND_2026_10_29_CAL_TRAIL: HistoricalRound = {
  id: 1761775200002,
  courseName: 'California Trail MS',
  totalHoles: 9,
  date: '2026-10-29',
  duration: '00:54:15',
  par: 29,
  windCondition: 'calm',
  gameMode: 'stroke',
  roundTranscript: `California Trail MS Evening Round (2026-10-29, Calm Wind) — Jeffery 34 (+5, 4 Pars) & Jack 45 (+16, 47-Ft Putt on H9!).
First officially recorded round on California Trail MS (Par 29 — Holes 1–7 Par 3, Holes 8–9 Par 4) featuring stretches, Higher/Lower yardage guessing games, Jack's 5-yard stride distance measurements, and a mysterious single-light helicopter/UFO at dusk:
- Hole 1 (227ft, Par 3): Jeffery 3 (Par) | Jack 4 (Bogey). Basket had fallen from the chains on the ground. Jeffery threw 166g GStar Leopard3 too high off the tee (curved down and dove right into the sand volleyball court!), then fired a great 50+ ft 175g Star Sync approach right to the downed basket for Par 3. Jack's Roach rolled; took 4.
- Hole 2 (280ft, Par 3): Jeffery 4 (Bogey) | Jack 5. Threw 169g GStar Roadrunner off the tee and hit the tree by the "No Parking Fire Lane" sign (also threw 152g Star Mamba for fun—landed in the exact same spot by the same tree as Roadrunner!). Threw 180g Star Jay 2nd shot ("leveled it out, got close enough"), missed a tough par putt, tapped in for 4. Jack threw Buzzz for 5.
- Hole 3 (291ft, Par 3): Jeffery 3 (Par) | Jack 5. Bombed 169g GStar Roadrunner off the hill toward the soccer park ("Good, good Roadrunner! Not as far left as the Mamba, a little heavier than the Mamba"), then parked 175g Star Sync 8–10 ft from the pin for Par 3! Jack threw Cicada up the hill for 5.
- Hole 4 (291ft, Par 3): Jeffery 4 (Bogey) | Jack 5. Threw 169g GStar Roadrunner down the middle (too high), followed by 180g Star Jay 2nd shot (a bit low/cautious), missed the par bid, tapped in for 4.
- Hole 5 (336ft, Par 3): Jeffery 3 (Par) | Jack 5. Watched birds migrating south for winter toward Oklahoma/Texas/Florida. Threw 152g Star Mamba off the tee (not high, good distance at least halfway down the 336ft fairway), then ripped a full-strength 180g Star Jay 2nd shot right to the pin—4 feet shy of the basket ("Good one, full strength on that, and it went right there to the pin! 4 feet shy of pin. Excellent!")—for Par 3!
- Hole 6 (352ft, Par 3): Jeffery 4 (Bogey) | Jack 5. Tested 166g DX Archangel off the tee (yanked way right onto the other hole), threw 176g Glow Mako3 2nd shot (went left instead of straight), then parked 175g Star Sync 3rd shot around a tree right under the pin (nearly went in!) for 4. Chatted with Jack about sleep, Elon Musk, and hyper-focus.
- Hole 7 (267ft, Par 3): Jeffery 3 (Par) | Jack 4 (Bogey). Hit an early tree off the tee with 166g DX Archangel (Jack's drive went twice as far!), threw DX Archangel again from the tree ("definitely does go left, but good chance for par"), and drained a clutch ~30–40 ft 175g Star Sync putt (measured with Jack's 5-yard stride count!) to save Par 3 ("I can't believe I par'd it, especially after hitting a tree at the beginning!").
- Hole 8 (467ft, Par 4): Jeffery 5 (Bogey) | Jack 6. Played the Higher/Lower yardage game (467 ft). Threw 152g Star Mamba 1st shot onto the hill (also tested Roadrunner & 166g GStar Leopard3—"I like that Leopard actually, that was nice!"), threw 2nd shot over, 180g Star Jay 3rd shot slightly past the pin, missed the 4th-shot par putt, and tapped in for 5.
- Hole 9 (532ft, Par 4): Jeffery 5 (Bogey) | Jack 6. Played Higher/Lower for the 532 ft monster Par 4! Threw 166g GStar Leopard3 off the tee (angled nicely without going too far left; Jack's floater went even farther!), launched GStar Leopard3 again on the 2nd shot onto the road near the school, parked 175g Star Toro 3rd-shot approach uphill around a tree right up to the pin ("Nice! Good job on the Toro, got up to the pin!"), and tapped in for 5 (+5 total 34). Jack drained a measured 47-foot putt to finish Hole #9 while spotting a mysterious single-light helicopter/UFO in the evening sky!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 34 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 45 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 227,
      scores: { jeffery: 3, jack: 4 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-leopard3' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 5,
          notes:
            'Basket had fallen from the chains onto the ground! Threw 166g GStar Leopard3 too high off the tee (curved down and dove right into the sand volleyball pit), then threw a great 50+ ft 175g Star Sync approach right to the downed basket for Par 3. Jack threw Roach for 4.'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-roach' }],
          notes: 'Roach rolled on approach; finished with Bogey 4.'
        }
      },
      voiceTranscript: `California Trail MS — Hole 1 (227ft, Par 3):
Basket had fallen from the chains onto the ground, though the pole was still standing. First recorded scores at California Trail MS after doing pre-round arm stretches!
- Jeffery (3, Par): Followed the caddie recommendation and threw 166g GStar Leopard3 off the tee—released way too high, curved down, and dove straight into the sand volleyball pit ("Did you see it just dive right into that sand?"). Threw a great 175g Star Sync approach from halfway (50+ ft) right up to the downed basket and tapped in for Par 3!
- Jack (4, Bogey): Threw Roach; it rolled on the approach and finished with a 4.`
    },
    {
      number: 2,
      par: 3,
      distance: 280,
      scores: { jeffery: 4, jack: 5 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-jay' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 4,
          notes:
            'Threw 169g GStar Roadrunner off the tee and hit the tree by the No Parking Fire Lane sign (also threw 152g Star Mamba for fun—landed in the exact same spot by the same tree!). Threw 180g Star Jay 2nd shot ("leveled it out, got close enough"), missed a tough par putt, tapped in for 4.'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-buzzz' }],
          notes: 'Threw Buzzz; finished with 5.'
        }
      },
      voiceTranscript: `California Trail MS — Hole 2 (280ft, Par 3):
- Jeffery (4, Bogey): Caddie suggested 169g GStar Roadrunner (280ft). Threw Roadrunner off the tee and hit the tree right by the "No Parking Fire Lane" sign. Threw 152g Star Mamba for a fun comparison—launched high and landed in the exact same spot by the exact same tree as the Roadrunner! Threw 180g Star Jay on the 2nd shot ("That went good, leveled it out, got close enough"), missed a tricky par putt, and tapped in for 4.
- Jack (5, Double Bogey): Threw Buzzz and carded a 5.`
    },
    {
      number: 3,
      par: 3,
      distance: 291,
      scores: { jeffery: 3, jack: 5 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 9,
          notes:
            'Bombed 169g GStar Roadrunner off the hill toward the soccer park ("Good, good Roadrunner! Not as far left as the Mamba, a little heavier than the Mamba"), then parked 175g Star Sync 8–10 ft from the pin and made Par 3!'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-cicada' }],
          notes: 'Threw Cicada up the hill; finished with 5.'
        }
      },
      voiceTranscript: `California Trail MS — Hole 3 (291ft, Par 3):
Downhill-to-uphill tee shot overlooking the soccer park.
- Jeffery (3, Par): Threw 169g GStar Roadrunner off the tee ("Good, good Roadrunner! Not as far left as the Mamba... a little heavier than the Mamba"). Threw 175g Star Sync 2nd shot right by the pin (8–10 feet away) and drained the Par 3 putt!
- Jack (5, Double Bogey): Threw Cicada up the hill and finished with a 5.`
    },
    {
      number: 4,
      par: 3,
      distance: 291,
      scores: { jeffery: 4, jack: 5 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-jay' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 5,
          notes:
            'Threw 169g GStar Roadrunner down the middle (too high), then 180g Star Jay 2nd shot (a little too low/weak, worried about overthrowing the basket), missed the par putt, tapped in for 4.'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-cicada' }],
          notes: 'Threw right down the middle off the tee; finished with 5.'
        }
      },
      voiceTranscript: `California Trail MS — Hole 4 (291ft, Par 3):
- Jeffery (4, Bogey): Threw 169g GStar Roadrunner down the middle (a bit too high). Threw 180g Star Jay on the 2nd shot—came out a little too low and cautious ("I was scared I was going to throw it too far"). Missed the par bid on the 3rd shot and tapped in for 4.
- Jack (5, Double Bogey): Piped his tee shot right down the middle and finished with a 5.`
    },
    {
      number: 5,
      par: 3,
      distance: 336,
      scores: { jeffery: 3, jack: 5 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-jay' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 4,
          notes:
            'Threw 152g Star Mamba off the tee (good low line at least halfway down the 336ft fairway), then ripped a full-strength 180g Star Jay 2nd shot right to the pin—4 feet shy of the basket ("Good one, full strength on that, and it went right there to the pin! 4 feet shy of pin. Excellent!")—and tapped in Par 3!'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-cicada' }],
          notes: 'Finished with 5 on the 336ft Par 3.'
        }
      },
      voiceTranscript: `California Trail MS — Hole 5 (336ft, Par 3):
Watched a flock of birds flying south for the winter toward Oklahoma, Texas, and Florida before teeing off.
- Jeffery (3, Par): Switched to 152g Star Mamba off the tee—kept it down and got solid distance at least halfway down the 336-foot fairway. Fired a full-strength 180g Star Jay on the 2nd shot that flew laser-straight and parked 4 feet shy of the pin ("Good one, full strength on that, and it went right there to the pin! Yep, 4 feet shy of pin. Excellent!"). Tossed it in for an awesome Par 3!
- Jack (5, Double Bogey): Finished Hole 5 with a 5.`
    },
    {
      number: 6,
      par: 3,
      distance: 352,
      scores: { jeffery: 4, jack: 5 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 3,
          notes:
            'Tested 166g DX Archangel off the tee (yanked way out right onto the adjacent hole), threw 176g Glow Mako3 2nd shot (pulled left), then threw a clutch 175g Star Sync 3rd shot around a tree right under the pin (nearly went in!) for 4.'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-cicada' }],
          notes: 'Chatted about sleep & Elon Musk; finished with 5.'
        }
      },
      voiceTranscript: `California Trail MS — Hole 6 (352ft, Par 3):
Chatted with Jack about sleep schedules, dreams, and Elon Musk's hyper-focus between throws.
- Jeffery (4, Bogey): Tested 166g DX Archangel off the tee—yanked it way out to the right onto the other hole, leaving a dead-on straight look. Threw 176g Glow Mako3 on the 2nd shot ("Needs to be straight, and it didn't go straight, it went left"). Threw 175g Star Sync on the 3rd shot around a guardian tree right under the pin—nearly aced the throw-in!—and tapped in for 4.
- Jack (5, Double Bogey): Finished Hole 6 with a 5.`
    },
    {
      number: 7,
      par: 3,
      distance: 267,
      scores: { jeffery: 3, jack: 4 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 35,
          notes:
            'Hit an early tree off the tee with 166g DX Archangel (Jack\'s drive went twice as far!), threw DX Archangel again from the tree into C2 range, and drained a clutch ~30–40 ft 175g Star Sync putt (measured with Jack\'s 5-yard stride count!) to save Par 3 ("I can\'t believe I par\'d it, especially after hitting a tree at the beginning!").'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-cicada' }],
          notes: 'Crushed tee shot twice as far as Jeffery\'s tree hit; finished with Bogey 4.'
        }
      },
      voiceTranscript: `California Trail MS — Hole 7 (267ft, Par 3):
- Jeffery (3, Par): Tried 166g DX Archangel again off the tee and smacked an early tree (Jack's drive went twice as far!). Threw DX Archangel again on the 2nd shot from the tree ("That was good, definitely does go left, but good chance for par"). Stepped up from ~30–40 feet out and drained a clutch 175g Star Sync par-save putt! Jack measured the putt distance using his 5-yard stride-counting trick from school ("I can't believe I par'd it, especially after hitting a tree at the beginning!").
- Jack (4, Bogey): Crushed his drive off the tee and finished with a Bogey 4.`
    },
    {
      number: 8,
      par: 4,
      distance: 467,
      scores: { jeffery: 5, jack: 6 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'fairway', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-jay' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 5,
          notes:
            '467ft Par 4! Played Higher/Lower yardage guessing game. Threw 152g Star Mamba onto the hill (also tested Roadrunner & 166g GStar Leopard3—"I like that Leopard actually, that was nice!"), threw 2nd shot over, 180g Star Jay 3rd shot slightly past the pin, missed the 4th-shot par putt, and tapped in for 5.'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-cicada' }],
          notes: 'Guessed the 467ft distance in Higher/Lower; finished with 6.'
        }
      },
      voiceTranscript: `California Trail MS — Hole 8 (467ft, Par 4):
Played the Higher/Lower distance guessing game with Jack (` +
        '`467 ft`' +
        `, Par 4).
- Jeffery (5, Bogey): Threw 152g Star Mamba on the 1st shot onto the hill (flipped left). Also threw test drives with Roadrunner, Mamba, and 166g GStar Leopard3 ("I like that Leopard actually, that was nice!"). Threw 2nd shot up the fairway, fired 180g Star Jay on the 3rd shot a little too far past the pin, missed the 4th-shot par putt, and tapped in for Bogey 5.
- Jack (6, Double Bogey): Battled down the 467-foot Par 4 and carded a 6.`
    },
    {
      number: 9,
      par: 4,
      distance: 532,
      scores: { jeffery: 5, jack: 6 },
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-leopard3' },
            { shotType: 'fairway', discId: 'innova-leopard3' },
            { shotType: 'approach', discId: 'innova-toro' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          puttDistanceFeet: 4,
          notes:
            '532ft Monster Par 4! Threw 166g GStar Leopard3 off the tee (good angle, didn\'t go too far left), launched GStar Leopard3 again on the 2nd shot onto the road near the school, parked 175g Star Toro 3rd-shot approach uphill around a tree right up to the pin ("Nice! Good job on the Toro, got up to the pin!"), and tapped in for 5 (+5 total 34). Jack drained a measured 47-ft putt!'
        },
        jack: {
          throws: [{ shotType: 'tee', discId: 'discraft-cicada' }],
          puttDistanceFeet: 47,
          notes:
            'Out-drove Jeffery off the tee with a massive floater and drained a measured 47-foot putt on Hole #9 to finish with a 6!'
        }
      },
      voiceTranscript: `California Trail MS — Hole 9 (532ft, Par 4):
Played Higher/Lower for the massive 532-foot Par 4 finale (` +
        '`532 ft`' +
        `).
- Jeffery (5, Bogey): Threw 166g GStar Leopard3 off the tee—released high and right, held a great angle without going too far left. Launched 166g GStar Leopard3 again on the 2nd shot onto the road near the school (practice Roadrunner went around the school). Threw 175g Star Toro on the 3rd-shot approach uphill around a guardian tree right up to the pin ("Nice! Good job on the Toro, got up to the pin!") and tapped in for 5 to finish at 34 (+5)!
- Jack (6, Double Bogey): Crushed a huge floater off the tee past Jeffery's drive and drained a measured 47-foot putt (counted out with his stride trick!) to cap off Hole 9, right before spotting a mysterious single-light helicopter/UFO hovering in the night sky!`
    }
  ]
};

const ROUND_2026_10_29_SARKO: HistoricalRound = {
  id: 1761757200001,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-10-29',
  duration: '00:26:40',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  roundTranscript: `Sar-Ko-Par Trails Solo Lunch Round (2026-10-29, Calm Wind, Cloudy) — Jeffery 21 (-6, 🏆 NEW ALL-TIME PERSONAL BEST! 6 Birdies, 0 Bogeys!).
Beat previous Personal Best of 22 (-5) by a full stroke with a bogey-free 6-birdie clinic while testing the new Innova discs alongside trusted staples:
- Hole 1 (138ft, Par 3): Jeffery 2 (Birdie ★). Threw Star Aviar straight off the tee; curved gently left right behind the guardian tree to 6–7 feet and drained the opening Birdie 2 ("Aviar is still the way to go!").
- Hole 2 (192ft, Par 3): Jeffery 3 (Par). Threw Glow Mako3 off the tee (stayed straighter, played out right under the pin for Par 3). Also threw a comparison test with bright yellow 180g Star Jay (faded further left like a Roc3 into the autumn yellow leaves & brush—found it under a bush while playing Hole 3!).
- Hole 3 (162ft, Par 3): Jeffery 2 (Birdie ★). Let a group play through while spotting the Jay; threw 152g Star Mamba right to the pin ("Right there, Mamba is certainly the one on Hole #3!"), recovered the Star Jay under the bush, and popped in the Birdie 2 on the low basket with Star Sync.
- Hole 4 (162ft, Par 3): Jeffery 2 (Birdie ★). Caddie suggested Roc3 or 166g GStar Leopard3; went with the new GStar Leopard3 ("Yep, yep, yep, that was right! Right as in correct, on the dial! The Roc3 could have came up a little bit short, but on that same path as the Leopard"). Parked ~10ft out and drained the Birdie 2 putt with Star Sync!
- Hole 5 (144ft, Par 3): Jeffery 3 (Par). Tested 166g DX Archangel instead of Mako3—went way too far left and bounced off the trail ("Nope, Archangel's not the one there"). Fired 2nd shot past the pin, then drained a clutch comeback putt to save Par 3 ("Par'd it, thank God!").
- Hole 6 (165ft, Par 3): Jeffery 2 (Birdie ★). Gave 166g DX Archangel another test off the tee—flew exact pin-high distance of the basket, 15 feet to the left ("Exact distance of the pin, man! Just 15 feet to the left of it. So Archangel does kind of work there!"). Buried the 15ft putt for Birdie 2!
- Hole 7 (139ft, Par 3): Jeffery 2 (Birdie ★). Considered Star Jay vs. verified 152g Star Mamba; stuck with Mamba ("Little high, but still faded right over there to the pin, about 6–7 feet away!"). Left Sync in Hole 6 basket, tapped in Birdie 2 with Star Aviar, and retrieved the Sync.
- Hole 8 (171ft, Par 3): Jeffery 3 (Par). Played it safe with 152g Star Mamba protecting the -5 score; clipped an early tree, pitched up, and drained a clutch long par-save putt with Star Sync ("Good practice on these long putts... Par'd it!").
- Hole 9 (141ft, Par 3): Jeffery 2 (Birdie ★). Caddie suggested Roadrunner, stuck with the trusted 172g Star Rollo ("We'll do the Rollo like we have"). Landed mid-top of the hill in a tricky spot and floated a clutch long birdie putt from the left right into the chains for Birdie 2—sealing a New Personal Best 21 (-6)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 21 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Threw Star Aviar straight off the tee; curved left right behind the tree to 6–7 feet and drained the Birdie 2 ("I think Aviar is still the way to go!").',
      meta: {
        jeffery: {
          discUsed: 'Aviar',
          thrownDiscId: 'innova-aviar',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Star Aviar straight off tee + gentle left curve to 6–7ft for Birdie 2!'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw Glow Mako3 off the tee for a clean Par 3. Comparison test with bright yellow Star Jay went further left like a Roc3 into the yellow autumn leaves (found under bush on H3!).',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Mako3 stayed straighter for Par 3 (Star Jay test faded more left into yellow leaves)'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Threw 152g Star Mamba right to the pin ("Right there, Mamba is certainly the one on Hole #3!"), found the Star Jay under a bush, and sank the Birdie 2 putt on the low basket with Star Sync!',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: '152g Star Mamba parked right at the pin + Star Sync putt for Birdie 2!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Chose new 166g GStar Leopard3 over Roc3 ("Yep, yep, yep, that was right! Right on the dial! Same path as Roc3 without coming up short"). Parked ~10ft out and buried the Birdie 2 putt with Star Sync!',
      meta: {
        jeffery: {
          discUsed: 'Leopard3',
          thrownDiscId: 'innova-leopard3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: '166g GStar Leopard3 parked 10ft on the dial + Star Sync putt for Birdie 2!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Tested 166g DX Archangel instead of Mako3 (flew way too far left and bounced off the trail—"Nope, Archangel\'s not the one there"). Fired 2nd shot past basket and clutched the comeback putt for Par 3!',
      meta: {
        jeffery: {
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'DX Archangel test went too far left (stick w/ Mako3 on H5); clutch comeback Par 3!'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Tested 166g DX Archangel again off the tee—pin-high exact distance of the basket, 15 feet left ("Exact distance of the pin, man! Just 15 feet to the left of it"). Drained the 15ft Birdie 2 putt!',
      meta: {
        jeffery: {
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: '166g DX Archangel pin-high 15ft left + drained Birdie 2 putt!'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Stuck with verified 152g Star Mamba ("Little high, but still faded right over there to the pin, about 6–7 feet away!"). Tapped in Birdie 2 with Star Aviar and retrieved Sync from Hole 6.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: '152g Star Mamba faded right to the pin (6–7ft) + Star Aviar Birdie 2!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 152g Star Mamba to protect the -5 round; clipped a tree early, pitched up, and drained a clutch long par-save putt with Star Sync ("Good practice on these long putts... Par\'d it!").',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Mamba clipped tree + clutch long Star Sync putt to save Par 3!'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Stuck with trusted 172g Star Rollo off the tee ("We\'ll do the Rollo like we have"); landed mid-top of the hill and floated a clutch long putt from the left into the chains for Birdie 2 and a New Personal Best 21 (-6)!',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: '172g Star Rollo to hill crest + clutch long Birdie 2 putt for NEW PB 21 (-6)!'
        }
      }
    }
  ]
};

const ROUND_2026_10_28_MIZE: HistoricalRound = {
  id: 1761692400002,
  courseName: 'Mize Elementary',
  totalHoles: 9,
  date: '2026-10-28',
  duration: '00:46:10',
  par: 27,
  windCondition: 'cross_rl',
  gameMode: 'stroke',
  roundTranscript: `Mize Elementary Twilight Duo Round + New Disc Field Test (2026-10-28, R→L Breeze, Pre-Daylight Savings) — Jeffery 35 (+8), Jack 42 (+15).
First live round testing the 5 new Innova collector discs (169g GStar Roadrunner, 166g GStar Leopard3, 166g DX Archangel, 180g Star Jay, 175g Star Toro) alongside Mamba, Mako3, Rollo, Sync & Aviar:
- Hole 1 (218ft, Par 3): Jeffery 4, Jack 4. Tested new 169g GStar Roadrunner off the tee ("flew far, I'll take my first throw"), plus practice throws with 166g DX Archangel (high & loose) and 166g GStar Leopard3 ("kind of neat, went left"). Approached with 175g Star Toro (faded left while naming South American countries with Jack) and hit top of basket for 4.
- Hole 2 (264ft, Par 3): Jeffery 3 (Par!), Jack 4. Bomb tee shot with 169g GStar Roadrunner ("straight here at the end, 30 feet out!"), also tested 180g Star Jay ("pretty nice, reliable left finish"), and locked in a clean Par 3!
- Hole 3 (294ft, Par 3): Jeffery 4, Jack 4. Threw 152g Star Mamba off the tee ("flipover, nice floater, nice glider, good side to be on"). Tried 175g Star Toro in the wind (hit soccer goal, heavy brick), finished with 175g Star Sync ("Sync is the one to do in the wind for sure!") for 4.
- Hole 4 (296ft, Par 3): Jeffery 4, Jack 5. Crushed 152g Star Mamba ("going farther and farther, doing good with this Mamba!"), heard mysterious fox/creature scream in the woods, approached with 175g Star Sync (stopped left), skimmed top of basket for 4.
- Hole 5 (296ft, Par 3): Jeffery 4, Jack 5. Threw 169g GStar Roadrunner in the wind, 180g Star Jay 2nd shot ("skip up, battled wind"), then fired a 20ft 180g Star Jay pitch-in that rounded its way right through the chains and bounced out ("It rounded its way through the basket! That would have been a par!"), tapped in for 4.
- Hole 6 (310ft, Par 3): Jeffery 4, Jack 6. Heard the wildlife scream again, threw 152g Star Mamba off the tee, then stuck a Star Aviar approach in the wind right on target ("Yes, I wanted to land it right there!"), counted 8–9 airplanes overhead, tapped in for 4.
- Hole 7 (324ft, Par 3): Jeffery 4, Jack 4. Aimed toward Jack's disc (high & left toward the pink basket), threw 172g Star Rollo approach ("Rollo, and true, I got that out three"), finished with 4 alongside Jack's 4.
- Hole 8 (235ft, Par 3): Jeffery 4, Jack 5. Gorgeous 152g Star Mamba tee flight ("That was gorgeous! Leveled out and floated up and slowly glided to the left—I thought it was going to go in the pan!"). Jack threw Buzzz SS; Jeffery's Star Sync birdie bid bounced out for 4.
- Hole 9 (389ft, Par 3): Jeffery 4, Jack 5. Heard 10th airplane! Tested 166g DX Archangel off the tee (2nd practice Archangel flew straight: "Not too sharp left"), Jack launched his yellow disc ("Jack o' lantern!"), Jeffery parked 176g Glow Mako3 right by the pin ("That Mako3 is awesome! Right by the basket!") for 4.
- Post-Round 4-Disc Field Test (Middle of Hole #3 to Hole #5 Basket):
  * Flight 1: Archangel landed first; Leopard3 landed 5–10ft right of Archangel; Roadrunner landed between them and 20ft farther ahead! Star Jay went far for a midrange.
  * Flight 2: Archangel stayed straight ("doesn't go too far left, I like that!"); Leopard3 stayed low ("lift off, lift down and lift up") and finished 15ft ahead and 10ft left of Archangel.
  * Flight 3 (To Hole #5 Basket): Roadrunner and Leopard3 hit the road with slow controlled left fade; Archangel finished close to the basket; Roadrunner skipped off the road to 2 feet from the pin ("Roadrunner was like 2 feet away! That was awesome!").`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 35 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 42 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 218,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Tested new 169g GStar Roadrunner off the tee (flew far, took 1st throw), plus practice throws with Archangel & Leopard3. Approached with 175g Star Toro and hit top of basket for 4.',
      meta: {
        jeffery: {
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          fairwayHit: true,
          scenarioUsed: 'cross_rl',
          voiceNote: 'New 169g GStar Roadrunner tee drive (flew far!) + 175g Star Toro approach'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 264,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Threw 169g GStar Roadrunner off the tee ("straight here at the end, 30 feet out!"), also tested 180g Star Jay ("pretty nice, left finish"), and locked in a clean Par 3!',
      meta: {
        jeffery: {
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'cross_rl',
          voiceNote: '169g GStar Roadrunner parked 30ft out for a clean Par 3!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 294,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        '152g Star Mamba tee shot ("flipover, nice floater, nice glider, good side to be on"). Tested 175g Star Toro in wind (too heavy, hit soccer goal), finished with 175g Star Sync ("Sync is the one to do in the wind for sure!") for 4.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          scenarioUsed: 'cross_rl',
          voiceNote: 'Mamba floater glide off tee + Star Sync wind finisher for 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 296,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Crushed 152g Star Mamba ("going farther and farther, doing good with this Mamba!"), heard fox scream in the woods, Star Sync approach stopped left, skimmed top of basket for 4.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          scenarioUsed: 'cross_rl',
          voiceNote: 'Big Mamba drive ("going farther and farther!") + Sync approach for 4'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 296,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Threw Roadrunner off tee in wind; 180g Star Jay approach battled the wind, then 20ft Star Jay pitch-in rounded its way right through the basket chains and popped out for 4!',
      meta: {
        jeffery: {
          discUsed: 'Jay',
          thrownDiscId: 'innova-jay',
          scenarioUsed: 'cross_rl',
          voiceNote: 'Roadrunner tee + 180g Star Jay approach & 20ft chain-through heartbreaker!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 310,
      scores: { jeffery: 4, jack: 6 },
      voiceTranscript:
        'Threw 152g Star Mamba off the tee, then stuck Star Aviar approach in the wind right on the spot ("Yes, I wanted to land it right there!") for 4.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'cross_rl',
          voiceNote: 'Mamba tee shot + pinpoint Star Aviar wind approach for 4'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 324,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Aimed toward Jack\'s disc (high & left toward pink basket), threw 172g Star Rollo approach ("Rollo, and true, I got that out three"), finished with 4 alongside Jack\'s 4.',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          scenarioUsed: 'cross_rl',
          voiceNote: 'True Star Rollo approach to the pink basket for 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 235,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Gorgeous 152g Star Mamba tee flight ("Leveled out and floated up and slowly glided to the left—I thought it was going to go in the pan!"). Star Sync birdie bid bounced out for 4.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          scenarioUsed: 'cross_rl',
          voiceNote: 'Gorgeous leveling Star Mamba glide right at the pin + Sync bounce-out for 4'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 389,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Tested 166g DX Archangel off the tee ("Not too sharp left"), then parked 176g Glow Mako3 right by the basket ("That Mako3 is awesome! Right by the basket!") for 4.',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'cross_rl',
          voiceNote: 'DX Archangel tee test + parked 176g Glow Mako3 right by the basket for 4!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    }
  ]
};

const ROUND_2026_10_28_SARKO: HistoricalRound = {
  id: 1761676000001,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-10-28',
  duration: '00:24:15',
  par: 27,
  windCondition: 'headwind',
  gameMode: 'stroke',
  roundTranscript: `Sar-Ko-Par Trails Solo Lunch Round (2026-10-28, Heavy Gusty Wind) — Jeffery 25 (-2, 4 Birdies!).
Played on one of the windiest days yet, adjusting disc selection and aim points to fight the gusts:
- Hole 1 (138ft, Par 3): Jeffery 2 (Birdie ★). Fired Star Sync ("the Sync") off the tee in the wind and buried the Birdie 2!
- Hole 2 (192ft, Par 3): Jeffery 2 (Birdie ★). Too windy for the Mamba; clubbed down to Glow Mako3 aimed toward the light pole—parked right at the pin at the edge of the left woods for back-to-back Birdie 2s!
- Hole 3 (162ft, Par 3): Jeffery 3 (Par). Threw Glow Mako3 in the heavy wind (went further left into guardian trees for a tough putt, saved Par 3); threw a fun 2nd practice shot with Star Mamba that parked 4 feet from the basket!
- Hole 4 (162ft, Par 3): Jeffery 2 (Birdie ★). Fired DX Roc3 off the tee to ~15ft and drained the Birdie 2 putt (dodging the walnuts on the green!).
- Hole 5 (144ft, Par 3): Jeffery 3 (Par). Threw DX Roc3 (stayed right of aim point); long Star Sync birdie bid from way downtown clipped the top of the basket for a tap-in Par 3.
- Hole 6 (165ft, Par 3): Jeffery 4 (Bogey). Threw DX Roc3 off the tee; tried a jump putt into the wind that sailed way past the basket for Bogey 4.
- Hole 7 (139ft, Par 3): Jeffery 2 (Birdie ★). Kept Star Mamba low under the hanging branches—parked 3 feet from the pin for a tap-in Birdie 2!
- Hole 8 (171ft, Par 3): Jeffery 3 (Par). Threw Star Mamba low under the branches again; approached and locked in Par 3.
- Hole 9 (141ft, Par 3): Jeffery 4 (Bogey). "Rollo time" with a tailwind; scary uphill/downhill birdie putt rolled back around the basket for Bogey 4 to finish at 25 (-2)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 25 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Fired off Hole 1 with the Star Sync on one of the windiest days yet and birdied it for 2!',
      meta: {
        jeffery: {
          discUsed: 'Sync',
          thrownDiscId: 'innova-sync',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'Fired Star Sync in heavy wind for an opening Birdie 2!'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Too windy for the Mamba; threw Glow Mako3 toward the light pole—landed right at the pin at the edge of the woods for Birdie 2!',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'Too windy for Mamba; aimed Mako3 at light pole and parked the pin for Birdie 2!'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Went with Glow Mako3 in the wind (flew left by the trees for a tough putt, saved Par 3). Threw a fun 2nd practice shot with Mamba that parked 4ft from the pin!',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'Mako3 tee shot in wind for Par 3 (practice Mamba parked to 4ft!)'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Went with DX Roc3 off the tee to ~15ft and buried the Birdie 2 putt (watch out for the walnuts on the ground!).',
      meta: {
        jeffery: {
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'DX Roc3 tee shot to 15ft + C1 Birdie 2 putt!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw DX Roc3 (stayed right of aim); long C2 birdie run with Star Sync from downtown hit the top of the basket for Par 3.',
      meta: {
        jeffery: {
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'Roc3 tee shot + long Star Sync bid hit top of basket for Par 3'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Threw DX Roc3 off the tee; tried a jump putt that sailed way too far in the wind, came back for Bogey 4.',
      meta: {
        jeffery: {
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          scenarioUsed: 'headwind',
          voiceNote: 'Roc3 tee shot; jump putt sailed long in wind for 4'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Kept Star Mamba low under the hanging branches—parked 3 feet from the pin for a tap-in Birdie 2!',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'Low Star Mamba under the branches parked to 3ft for Birdie 2!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Kept Star Mamba low under the branches again; pitched up and locked in Par 3.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'Low Star Mamba under branches + clean Par 3'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Rollo time with a tailwind; scary birdie putt on the slope rolled back around the basket for Bogey 4 to finish 25 (-2)!',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          scenarioUsed: 'tailwind',
          voiceNote: 'Rollo tailwind drive; sloped putt rolled back for 4 (25, -2 total!)'
        }
      }
    }
  ]
};

const ROUND_2026_10_26_MIZE: HistoricalRound = {
  id: 1761522000001,
  courseName: 'Mize Elementary',
  totalHoles: 9,
  date: '2026-10-26',
  duration: '00:38:36',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  roundTranscript: `Mize Elementary Duo Personal Best Round (2026-10-26, Calm Wind, 00:38:36) — Jeffery 31 (+4, ties Mize PB & sets new Duo PB with 5 Pars!), Jack 37 (+10, new Mize Personal Best by 3 strokes with 3 Pars!).
- Hole 1 (218ft, Par 3): Jeffery 3 (Par), Jack 5. Mamba tee shot flew straight and lower ("not as high, getting that figured out!"); Aviar approach + 7ft putt using the J.Milly tip ("just get up and don't even think about the putt!"). Jack hit a 15ft putt for 5.
- Hole 2 (264ft, Par 3): Jeffery 3 (Par), Jack 3 (Par). Lower Mamba drive ("I like understable because I can control it; getting a few understable discs coming"); both Jeffery & Jack locked in clean Par 3s!
- Hole 3 (294ft, Par 3): Jeffery 4, Jack 4. Good distance on Mamba drive + Aviar approach; both bogeyed for 4. Ranked Mize holes shortest to longest with Jack (H1, H8, H2, H3, H4/H5 tie, H6, H7, H9).
- Hole 4 (296ft, Par 3): Jeffery 3 (Par), Jack 4. Tee shot to the 150ft spot; Glow Mako3 2nd shot nearly went in the basket AGAIN ("Oh, I thought it was going to go in! Mako just feels good—I like the glow discs!") for Par 3!
- Hole 5 (296ft, Par 3): Jeffery 4, Jack 5. Reached baseball field off tee; threw Star Sync (Xero) with good arm power around the fence for 4.
- Hole 6 (310ft, Par 3): Jeffery 4, Jack 5. Star Rollo tee shot flew straight and low; parked approach right outside the basket for 4.
- Hole 7 (324ft, Par 3): Jeffery 3 (Par), Jack 3 (Par). Mamba tee shot to the open area left of the trees for a straight look; Jack drained a 30–40ft shot for Par 3 as both parred!
- Hole 8 (235ft, Par 3): Jeffery 3 (Par), Jack 3 (Par). Threw Glow Mako3 off tee (then bombed a practice Mamba way farther than the Mako3: "Whoa, I should have went with the Mamba!"); threw a dead-straight flat Star Sync approach for Par 3. Jack also Par 3!
- Hole 9 (389ft, Par 3): Jeffery 4, Jack 5. Bombed Mamba off the tee (noted Roadrunner / Archangel on the way!) as Jack skipped off the street; tested Roc3 on 2nd shot (faded left—need to aim farther right) and closed out Bogey 4 for a 31 (+4) Personal Best alongside Jack's 37 (+10) PB!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 31 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 37 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 218,
      scores: { jeffery: 3, jack: 5 },
      voiceTranscript:
        'Mamba tee shot went straight and lower ("not as high, getting that figured out!"); Aviar approach + 7ft Par 3 putt using J.Milly routine ("get up and don\'t even think about the putt"). Jack drained a 15-footer for 5.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Lower straight Mamba tee + Aviar approach & no-hesitation J.Milly C1 Par putt!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          puttDistance: 'C1',
          voiceNote: 'Drained 15-footer for 5'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 264,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Lower Mamba tee shot ("figured the not-as-high part out; I can control understable discs"). Both Jeffery & Jack locked in back-to-back Par 3s!',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Controlled low Mamba tee shot + Par 3!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Parked approach right by the pin for Par 3!'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 294,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Good distance with Mamba off the tee; Aviar approach overshot slightly for Bogey 4. Jack bombed his drive and nearly made Par, finishing with 4.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          scenarioUsed: 'calm',
          voiceNote: 'Mamba distance drive + Aviar approach for 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 296,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Landed in the same 150ft spot and fired Glow Mako3 — nearly went in the basket AGAIN ("Oh, I thought it was going to go in! Mako just feels good, I like the glow discs!") for Par 3!',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Glow Mako3 2nd shot nearly aced the 150ft throw-in again for Par 3!'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 296,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Made it to the baseball field off the tee; threw Star Sync (Xero) on the approach with good arm power to avoid the fence for Bogey 4.',
      meta: {
        jeffery: {
          discUsed: 'Sync',
          thrownDiscId: 'innova-sync',
          scenarioUsed: 'calm',
          voiceNote: 'Reached baseball field + strong Star Sync approach for 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 310,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Star Rollo tee shot flew low, straight, and perfect! Approach landed right outside the basket for Bogey 4.',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Low, dead-straight Star Rollo tee drive + parked approach for 4'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 324,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Mamba tee shot to the open area left of the guardian trees for a clean straight approach; both Jeffery & Jack parred (Jack drained a 30–40 footer for Par 3!).',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Mamba tee shot left of trees + clean Par 3!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true,
          puttDistance: 'C2',
          voiceNote: 'Drained a 30–40ft bomb for Par 3!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 235,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Threw Glow Mako3 off the tee (then bombed a fun practice Mamba way farther than the Mako3: "Whoa, I should have went with the Mamba!"). Threw a flat, dead-straight Star Sync approach for Par 3 alongside Jack\'s Par 3!',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Mako3 tee (practice Mamba went way farther!) + flat dead-straight Sync approach for Par 3!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Back-to-back Par 3s on H7 & H8!'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 389,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Crushed Mamba off the tee (Roadrunner & Archangel on the way!); Jack got a big skip off the street. Tested Roc3 on 2nd shot (faded left—aim farther right) and locked in 4 to seal a 31 (+4) Personal Best with Jack\'s 37 (+10) PB!',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Bombed Mamba tee drive + Roc3 2nd shot + Bogey 4 to seal 31 (+4) PB!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true,
          voiceNote: 'Big skip off the street to finish a 37 (+10) Mize Personal Best!'
        }
      }
    }
  ]
};

const ROUND_2026_10_25_MIZE: HistoricalRound = {
  id: 1761435000001,
  courseName: 'Mize Elementary',
  totalHoles: 9,
  date: '2026-10-25',
  duration: '00:41:29',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  roundTranscript: `Mize Elementary Duo Round (2026-10-25, Calm Wind with slight right-to-left breeze on back holes, 00:41:29) — Jeffery 37 (+10), Jack 40 (+13).
Archived Firebird, IT, and Pig from the active bag (moving to 6 active Innova molds: Mamba, Rollo, Mako3, Roc3, Xero, Aviar).
- Hole 1 (218ft, Par 3): Jeffery 4, Jack 4. Mamba tee shot went high and left; 100ft Xero approach to 13ft; putt chained out for 4.
- Hole 2 (264ft, Par 3): Jeffery 3, Jack 3. Mako3 S-curve drive + Xero approach for clean Par 3s for both Jeffery & Jack!
- Hole 3 (294ft, Par 3): Jeffery 4, Jack 5. Straighter Mamba tee shot; level Mako3 2nd shot; Xero wobbled back to pin for 4. UI Note: Show Last Time & Best Score directly inside the Score Entry box!
- Hole 4 (296ft, Par 3): Jeffery 5, Jack 4. High Mamba tee shot, 2nd Mamba pulled left, Xero approach to 20ft, missed par save for 5. Jack threw dead-straight Buzzz shots for 4!
- Hole 5 (296ft, Par 3): Jeffery 4, Jack 4. Flatter Mamba drive; Rollo 2nd shot went right into baseball fence, pitched over to 8ft, Aviar tap-in for 4.
- Hole 6 (310ft, Par 3): Jeffery 4, Jack 6. Best Rollo tee shot ever on Hole 6 right in the middle of the fairway! Spotted a tiny fox by the school. Aviar approach, putt rimmed out for 4.
- Hole 7 (324ft, Par 3): Jeffery 4, Jack 5. Heard an owl in the woods; Mako3 flew cleanly left of trees; Xero approach through branches; putt bounced out of basket in wind for 4.
- Hole 8 (235ft, Par 3): Jeffery 4, Jack 4. Downhill Roc3 hyzer into the breeze; overthrew approach, Aviar comeback for 4. Nice long drive by Jack for 4.
- Hole 9 (389ft, Par 3): Jeffery 5, Jack 5. Rollo clipped trees; fired Mako3 2nd shot; Xero 3rd shot close; hit basket on 4th for 5.`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 37 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 40 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 218,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Threw Mamba off the tee (went high and left); 100ft Xero approach to 13ft; putt chained out for Bogey 4. Jack also 4.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          scenarioUsed: 'calm',
          voiceNote: 'Mamba tee shot + 100ft Xero approach to 13ft'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 264,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Mako3 tee shot with nice S-curve + Xero approach for clean Par 3s for both Jeffery & Jack! Officially archived Firebird, IT, and Pig.',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Mako3 S-curve drive + Xero approach for Par 3'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true,
          puttDistance: 'C1'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 294,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Straighter Mamba tee shot; level Mako3 2nd shot a little light; Xero wobbled back to the pin for 4. Requested Last Score display inside Score Entry card.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          scenarioUsed: 'calm',
          voiceNote: 'Straighter Mamba drive + level Mako3 + Xero approach'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 296,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        'High Mamba tee shot, 2nd Mamba pulled left, Xero approach to 20ft, missed par save for 5. Jack threw dead-straight Buzzz shots for 4!',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          scenarioUsed: 'calm',
          voiceNote: 'Mamba tee + Xero approach to 20ft'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss',
          fairwayHit: true
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 296,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Flatter Mamba drive; Rollo 2nd shot drifted right into the baseball fence; pitched over to 8ft and tapped in Aviar for 4. Jack also 4.',
      meta: {
        jeffery: {
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Flatter Mamba drive + Rollo 2nd + Aviar tap-in'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 310,
      scores: { jeffery: 4, jack: 6 },
      voiceTranscript:
        'Best Rollo tee shot ever on Hole 6 right in the middle of the fairway! Spotted a tiny fox by the school. Aviar approach, putt rimmed out for 4.',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          scenarioUsed: 'calm',
          voiceNote: 'Best Rollo tee shot ever on H6 right down the middle!'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 324,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Heard an owl in the trees; Mako3 tee shot stayed left of trees; Xero approach through branches; putt bounced out of basket in wind for 4.',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          scenarioUsed: 'calm',
          voiceNote: 'Mako3 tee shot left of trees + Xero approach'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 235,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Downhill Roc3 hyzer into the wind; overthrew approach, Aviar comeback for 4. Great long tee shot by Jack for 4.',
      meta: {
        jeffery: {
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          scenarioUsed: 'headwind',
          voiceNote: 'Roc3 downhill drive + Aviar putt'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 389,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        'Rollo clipped trees off the tee; fired Mako3 2nd shot; Xero 3rd shot close; hit basket on 4th for 5. Both finished 37 (+10) & 40 (+13).',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          scenarioUsed: 'calm',
          voiceNote: 'Rollo tee + Mako3 2nd + Xero 3rd uphill'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    }
  ]
};

const ROUND_2026_10_25_ART_NINE: HistoricalRound = {
  id: 1761439000002,
  courseName: 'The Art Nine @ SMP',
  totalHoles: 9,
  date: '2026-10-25',
  duration: '00:22:48',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  roundTranscript: `The Art Nine @ SMP Duo Round (2026-10-25, Calm Wind, 00:22:48) — Jeffery 24 (-3, 4 Birdies!), Jack 27 (E, Personal Best Even Par with 2 Birdies!).
- Hole 1 (132ft, Par 3): Jeffery 2 (Birdie ★), Jack 3 (Par). Parked Roc3 tee shot and drained the birdie putt with Xero! Jack parred with Roach.
- Hole 2 (103ft, Par 3): Jeffery 3 (Par), Jack 2 (Birdie ★). Mako3 clipped tree short, Par 3. Jack nearly aced the tee shot for a tap-in Birdie 2!
- Hole 3 (100ft, Par 3): Jeffery 2 (Birdie ★), Jack 2 (Birdie ★). First time throwing Rollo on Hole 3 — dead straight! Jeffery and Jack landed in the exact same spot for Double Birdie 2s!
- Hole 4 (146ft, Par 3): Jeffery 3, Jack 3. Rollo clipped tree; smooth Xero upshot right under the pin; both parred for 3.
- Hole 5 (111ft, Par 3): Jeffery 3, Jack 3. Downhill Rollo threaded right between the two trees; 22ft birdie bid hit chains, Par 3. Jack got two friendly tree kicks for Par 3.
- Hole 6 (116ft, Par 3): Jeffery 2 (Birdie ★), Jack 4. Uphill Mako3 parked 5 feet left of the pin for Birdie 2 (moving to -2)!
- Hole 7 (84ft, Par 3): Jeffery 3, Jack 3. 84ft short hole; Xero tee shot went slightly long left; blue Aviar comeback for Par 3. Jack also Par 3.
- Hole 8 (102ft, Par 3): Jeffery 4, Jack 3. 102ft downhill; Rollo popped out to center; bad roll on approach and basket bounce-out for 4. Jack steady Par 3.
- Hole 9 (137ft, Par 3): Jeffery 2 (Birdie ★), Jack 4. Downhill Mako3 straight down the gap with a friendly branch kiss; sunk Xero for Birdie 2 to finish -3 (24)!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 24 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 27 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 132,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        'Parked 174g DX Roc3 off the tee and buried the Birdie 2 putt with Xero! Jack threw Roach approach for Par 3.',
      meta: {
        jeffery: {
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Parked Roc3 tee shot + Xero putt for Birdie 2!'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 103,
      scores: { jeffery: 3, jack: 2 },
      voiceTranscript:
        'Mako3 clipped tree short, nearly made long birdie, Par 3. Jack nearly aced the tee shot right to the pin for a tap-in Birdie 2!',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Mako3 tee shot + clean Par 3'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Nearly aced Hole 2 for Birdie 2!'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 100,
      scores: { jeffery: 2, jack: 2 },
      voiceTranscript:
        'First time throwing Rollo on Hole 3 — flew dead straight! Jeffery and Jack landed in the exact same spot and both drained Birdie 2s!',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Dead-straight Rollo tee shot + Xero putt for Double Birdie 2!'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Landed in the exact same spot as Jeffery for Birdie 2!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 146,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Rollo clipped tree; smooth Xero upshot parked right under the basket; both parred for 3.',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Rollo tee + Xero approach parked under the basket for Par 3'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss',
          puttDistance: 'C1'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 111,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Downhill Rollo threaded right between the two trees; 22ft birdie bid hit chains, Par 3. Jack got two friendly tree kicks into the fairway for Par 3.',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Downhill Rollo threaded the gap to 22ft for Par 3'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 116,
      scores: { jeffery: 2, jack: 4 },
      voiceTranscript:
        'Uphill Mako3 parked 5 feet left of the pin for a tap-in Birdie 2 (moving to -2)!',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Uphill Mako3 parked 5ft from the basket for Birdie 2!'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 84,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '84ft short hole; Xero tee shot went slightly long left; blue Aviar comeback for Par 3. Jack also Par 3.',
      meta: {
        jeffery: {
          discUsed: 'Sync',
          thrownDiscId: 'innova-sync',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Xero tee shot + blue Aviar comeback for Par 3'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          puttDistance: 'C1'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 102,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        '102ft downhill; Rollo popped out to center; tough roll on approach and basket bounce-out for 4. Jack steady Par 3.',
      meta: {
        jeffery: {
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          scenarioUsed: 'calm',
          voiceNote: 'Rollo downhill tee shot + Xero approach'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          puttDistance: 'C1'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 137,
      scores: { jeffery: 2, jack: 4 },
      voiceTranscript:
        'Downhill Mako3 straight down the gap with a friendly branch kiss; sunk Xero for Birdie 2 to finish -3 (24)!',
      meta: {
        jeffery: {
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Downhill Mako3 gap shot + Xero putt for Birdie 2 (-3 total)!'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    }
  ]
};

const typedV65 = v65Backup as unknown as AppExportPayload;

const NEW_INNOVA_DISCS: DiscItem[] = [
  {
    id: 'innova-xt-glow-nova',
    ownerId: 'jeffery',
    cardNumber: '#01 OF 14',
    cardImage: './assets/aistudio/card_xt_glow_nova_sugar_high_4204e372.jpg',
    name: 'XT Glow Nova',
    brand: 'Innova',
    slotCategory: 'Putter 1 (Sugar High Main Bag) · Dead-Straight Touch Approach (<150 ft)',
    plastic: 'XT Glow',
    weightGrams: 175,
    colorStamp: 'XT Glow (Cotton Candy) · Pale Glow / Red & Blue Holo Shatter Sugar High 2-Foil',
    orderNumber: 'Cotton Candy Order #2093 (Oct 26, 2026)',
    price: '$14.99',
    type: 'Putter',
    speedTier: 'SPD 2-4',
    stabilitySlot: 'Neutral',
    speed: 2,
    glide: 2,
    turn: 0,
    fade: 0,
    colorHex: '#38BDF8',
    idealMinFeet: 60,
    idealMaxFeet: 185,
    moldAndFlight:
      'Dead-straight, zero-fade approach putter [2 | 2 | 0 | 0] in max-weight 175g XT Glow Dual-Polymer plastic. Dual-mold rim for total energy absorption and zero fade on precise 100–150 ft landing zones.',
    courseStrategy:
      'The ultimate "point-and-shoot" approach disc in the 4-Putter Top Pocket. Features Innova’s two-piece overmold technology—a firm flight plate fused with a grippy, impact-absorbing XT outer rim that stops dead on greens without sliding or rolling.',
    personalFlightNotes:
      '11/05 & 11/04 Sar-Ko-Par H3 Tree-Scramble Pin Stopper (Order #2093): True [2 | 2 | 0 | 0] point-and-shoot overmold putter! Used on 11/04 & 11/05 Round 2 Hole #3 after early tree kicks to pitch straight to 2ft from the basket for tap-in Par 3s. Its grippy XT outer rim absorbs impact and stops dead on greens with zero turn or fade.',
    fieldTestRank: '11/05 & 11/04 Sar-Ko-Par H3 Scramble Parker · Zero-Fade Overmold [2|2|0|0]',
    transcriptStats:
      '11/05 R2 & 11/04 Sar-Ko-Par H3: Pitched straight to 2ft for Par 3 · Two-piece XT Glow overmold stops dead on greens.',
    caddieScenarios: ['calm', 'tailwind', 'cross_lr'],
    caddieRoleNote:
      '175g XT Glow Nova — Dead-Straight [2|2|0|0] Overmold Approach Putter (11/04 & 11/05 H3 Scramble Parker)'
  },
  {
    id: 'innova-kc-pro-aviar',
    ownerId: 'jeffery',
    cardNumber: '#04 OF 14',
    cardImage: './assets/aistudio/card_kc_pro_aviar_sugar_high_06f196b2.jpg',
    name: 'KC Pro Aviar',
    brand: 'Innova',
    slotCategory: 'Putter 4 (Sugar High Main Bag) · Main C1/C2 Chain Putter & Firm Breeze Putter',
    plastic: 'KC Pro',
    weightGrams: 175,
    colorStamp: 'KC Pro (Cotton Candy Sugar High 2-Foil & Galactic F2) · 173–175g',
    orderNumber: 'Cotton Candy #2093 ($12.99) & Innova Factory #100838958 ($10.00)',
    price: '$12.99 / $10.00',
    type: 'Putter',
    speedTier: 'SPD 2-4',
    stabilitySlot: 'Overstable',
    speed: 2,
    glide: 3,
    turn: 0,
    fade: 2,
    colorHex: '#F472B6',
    idealMinFeet: 90,
    idealMaxFeet: 195,
    moldAndFlight:
      'Overstable beaded putter [2 | 3 | 0 | 2] in firm 173g–175g KC Pro plastic (Cotton Candy Sugar High 2-Foil + KC Pro Galactic Aviar F2). Rigid, beaded driver mold in firm KC Pro plastic.',
    courseStrategy:
      'Putter 1 in the 4-Putter Top Pocket: Primary C1/C2 chain hunter and firm breeze putter. Molded in Ken Climo’s signature stiff KC Pro blend, it gives a rigid feel in the hand, smooth release off the thumb, and a predictable 2-fade into the chains or on 150-foot driving putter lines.',
    personalFlightNotes:
      '11/05 Sar-Ko-Par 21 (-6 PB) & 11/04 24 (-3) Main C1/C2 Putting Workhorse: Drained 6 straight birdie putts on Holes #4–#9 in 11/05 Round 2 (including 15–20ft C1 birdie putts on H5, H8 & H9!) plus clean C1 par putts on H2–H5 on 11/04 & 11/05. Rigid KC Pro bead gives a crisp, repeatable release under pressure.',
    fieldTestRank: '🏆 11/05 21 (-6 PB) 6-Straight Birdie Putter · Main C1/C2 Chain Hunter',
    transcriptStats:
      '11/05 Sar-Ko-Par (21 / -6 PB): Drained 6 straight Birdie putts (H4–H9) + 11/04 24 (-3) C1 putter!',
    caddieScenarios: ['calm', 'headwind', 'cross_rl'],
    caddieRoleNote:
      '175g KC Pro Aviar — Main C1/C2 Chain Putter (11/05 21 / -6 PB Closer) & Firm Beaded Breeze Putter [2|3|0|2]'
  },
  {
    id: 'innova-toro',
    ownerId: 'jeffery',
    cardNumber: '#05 OF 18',
    cardImage: EMBEDDED_CARD_IMAGES['innova-toro'],
    name: 'Toro',
    brand: 'Innova',
    slotCategory: 'Approach 1 (Main Compartment) · Overstable Brick & Forehand Flick Upshots',
    plastic: 'Star',
    weightGrams: 175,
    colorStamp: 'Bright Orange / Royal Blue Charging Bull Stamp',
    orderNumber: '1010 Discs Order #281088 (Oct 26, 2026)',
    price: '$15.99',
    type: 'Putter',
    speedTier: 'SPD 2-4',
    stabilitySlot: 'Overstable',
    speed: 4,
    glide: 2,
    turn: 0,
    fade: 3,
    colorHex: '#FF7A00',
    idealMinFeet: 90,
    idealMaxFeet: 200,
    moldAndFlight:
      'Overstable approach brick [4 | 2 | 0 | 3] in max-weight 175g Star plastic. Bright Orange plastic with Royal Blue Charging Bull character stamp.',
    courseStrategy:
      'Approach 1 in the Main Compartment: Overstable approach brick with excellent forehand flick and wind-fighting utility. Handles heavy headwind gusts, forehand flicks inside 200 feet, and guaranteed left-fade skips around trees without sailing long.',
    personalFlightNotes:
      '11/04 Sar-Ko-Par H5 (144ft) Par Save, 10/30 H9 Test & 10/29 Cal Trail H9 Parked Approach: On 11/04 Sar-Ko-Par H5, threw the 175g Star Toro up the wooded corridor to set up a clean Par 3 ("Toro was good, got me up there!"). On Cal Trail H9 (532ft Par 4), parked the uphill 3rd-shot approach around a guardian tree right up to the pin!',
    fieldTestRank: '11/04 Sar-Ko-Par H5 Par Save & Cal Trail H9 Uphill Tree-Hook Parker [4|2|0|3]',
    transcriptStats:
      '11/04 Sar-Ko-Par H5 Par 3 ("Toro was good, got me up there!") + 10/29 Cal Trail H9 parked uphill 3rd shot!',
    caddieScenarios: ['headwind', 'cross_rl', 'cross_lr'],
    caddieRoleNote:
      '175g Star Toro — Primary Overstable Approach Brick (11/04 Sar-Ko-Par H5 & Cal Trail H9 Parker)'
  },
  {
    id: 'innova-dx-alien',
    ownerId: 'jeffery',
    cardNumber: '#06 OF 17',
    cardImage: './assets/aistudio/card_pink_dx_alien_invoice_4fe78f83.jpg',
    name: 'DX Alien',
    brand: 'Innova',
    slotCategory: 'Approach 2 (Main Bag · Core 3) · Ridged-Top Point-and-Shoot & Low-Skip Birdies',
    plastic: 'DX',
    weightGrams: 178,
    colorStamp: 'DX / Nexus (Hot Pink · Alien Saucer Top)',
    orderNumber: 'Innova Factory Store Order #100838958 (Arrived Nov 5, 2026)',
    price: '$11.99',
    type: 'Putter',
    speedTier: 'SPD 2-4',
    stabilitySlot: 'Neutral',
    speed: 4,
    glide: 2,
    turn: 0,
    fade: 1,
    colorHex: '#FF2E93',
    idealMinFeet: 85,
    idealMaxFeet: 215,
    moldAndFlight:
      'Neutral-touch approach & midrange hybrid [4 | 2 | 0 | 1] in 176g–179g Pink DX plastic. Combines a grooved Sonic-style ridged saucer top with a torque-resistant midrange rim.',
    courseStrategy:
      'Approach 2 in the Main Compartment: Point-and-shoot touch mid that drops dead on greens. Low 2-glide prevents overshooting guarded pins while the grooved thumb-ridge top gives locked-in grip for dead-straight 100–210 ft approaches.',
    personalFlightNotes:
      'Arrived In-Hand 11/05 (Innova Factory Store Order #100838958): Compared on Sar-Ko-Par H4 (162ft, [4|2|0|1] vs. Roc3 [5|4|0|3]) & H9 (141ft uphill). Bridges your zero-fade XT Glow Nova [2|2|0|0] and overstable Star Toro [4|2|0|3] with a low 2-glide point-and-shoot touch flight.',
    fieldTestRank: 'Arrived 11/05 · Point-and-Shoot Touch Stopper [4|2|0|1]',
    transcriptStats:
      'Arrived 11/05 (Innova Factory Store Order #100838958): 178g Pink DX Alien [4|2|0|1] — active in 18-disc bag.',
    caddieScenarios: ['calm', 'tailwind', 'cross_lr'],
    caddieRoleNote:
      '178g DX Alien — Ridged-Top Point-and-Shoot Touch Mid [4|2|0|1] (Low 2-Glide Stopper)'
  },
  {
    id: 'innova-jay',
    ownerId: 'jeffery',
    cardNumber: '#08 OF 18',
    cardImage: EMBEDDED_CARD_IMAGES['innova-jay'],
    name: 'Jay',
    brand: 'Innova',
    slotCategory: 'Midrange 2 (Main Compartment) · Stable-Neutral Workhorse Midrange',
    plastic: 'Star',
    weightGrams: 175,
    colorStamp: 'Sunburst Yellow / Dark Blue Jay Bird Stamp',
    orderNumber: '1010 Discs Order #281088 (Oct 26, 2026)',
    price: '$15.99',
    type: 'Midrange',
    speedTier: 'SPD 5',
    stabilitySlot: 'Neutral',
    speed: 5,
    glide: 4,
    turn: 0,
    fade: 1,
    colorHex: '#FACC15',
    idealMinFeet: 180,
    idealMaxFeet: 255,
    moldAndFlight:
      'Stable-neutral workhorse midrange [5 | 4 | 0 | 1] in 175g–180g Star plastic with micro-bead feel and gentle forward finish. Sunburst Yellow plastic with Dark Blue Jay Bird character stamp.',
    courseStrategy:
      'Midrange 2 in the Main Compartment: Bridges the gap directly between your DX Glow Mako3 (5 | 5 | 0 | 0) and DX Roc3 (5 | 4 | 0 | 3). Holds a laser-straight line under power and finishes with a gentle 10-foot forward check to the left.',
    personalFlightNotes:
      '10/30 Sar-Ko-Par H5 (144ft) Skip Birdie ★ & 10/29 Cal Trail H5 (336ft) 4-Ft Parker! On Sar-Ko-Par H5 (10/30), chose Star Jay [5|4|0|1] over Mako3 [5|5|0|0] and skipped right into C1 (10–12ft) to start a 4-birdie heater ("Nice skip over there! Good... right there in distance for birdie")! On Cal Trail H5 (336ft), ripped a full-strength 2nd shot 4ft from the pin for Par 3!',
    fieldTestRank: 'Sar-Ko-Par H5 Skip Birdie (10–12ft) · Cal Trail H5 4-Ft Pin Parker',
    transcriptStats:
      '10/30 Sar-Ko-Par H5 (144ft): Skipped to 10–12ft for Birdie 2! + 10/29 Cal Trail H5 (336ft): Full-strength 2nd shot parked 4ft from pin!',
    caddieScenarios: ['calm', 'headwind', 'cross_lr', 'cross_rl'],
    caddieRoleNote:
      '175g Star Jay — Sar-Ko-Par H5 Skip Birdie (10–12ft) & Cal Trail H5 4-Ft Pin Parker'
  },
  {
    id: 'innova-classic-glow-roc',
    ownerId: 'jeffery',
    cardNumber: '#10 OF 18',
    cardImage: './assets/aistudio/card_classic_glow_roc_invoice_c493a3ba.jpg',
    name: 'Classic Glow Roc',
    brand: 'Innova',
    slotCategory: 'Midrange 4 (Main Compartment) · Max-Weight Overstable Wind Anchor',
    plastic: 'DX Glow',
    weightGrams: 180,
    colorStamp: 'DX Glow (Rancho Mold · Classic Glow White/Green)',
    orderNumber: 'Innova Factory Store Order #100838958 (Oct 31, 2026)',
    price: '$7.95',
    type: 'Midrange',
    speedTier: 'SPD 5',
    stabilitySlot: 'Overstable',
    speed: 4,
    glide: 4,
    turn: 0,
    fade: 3,
    colorHex: '#34D399',
    idealMinFeet: 150,
    idealMaxFeet: 240,
    moldAndFlight:
      'Max-weight overstable midrange anchor [4 | 4 | 0 | 3] in 178g–180g Classic Glow DX plastic (Rancho Mold). Features a tacky, high-grip glow blend with a dependable late 3-fade.',
    courseStrategy:
      'Midrange 4 in the Main Compartment: Max-weight overstable anchor in the classic Rancho mold for evening rounds & heavy Kansas breeze. Pairs with your Speed 5 DX Roc3 [5|4|0|3] to give you a slightly slower, higher- lofted Speed 4 hyzer placement shot that settles softly without skipping past guarded greens.',
    personalFlightNotes:
      '11/05 Arrived In-Hand & Debuted on Sar-Ko-Par H4 (162ft Par 3): Threw the brand-new 180g Classic Glow DX Roc on H4 Round 1—clipped a tiny hanging tree limb and still carried straight 20ft past the pin for Par 3 ("Wait, I got the new Roc—I\'m throwing the new Roc! Even with hitting the tree, it went straight past the pin about 20 feet!"). Ideal when a Speed 5 Roc3 might skip too far or in heavy breeze.',
    fieldTestRank: '11/05 Debut on Sar-Ko-Par H4 (Par 3) · Max-Weight 180g Rancho Mold [4|4|0|3]',
    transcriptStats:
      '11/05 Sar-Ko-Par H4 Debut (Par 3 — carried straight 20ft past pin!) · 180g Classic Glow DX Roc (Rancho Mold).',
    caddieScenarios: ['headwind', 'cross_rl', 'calm'],
    caddieRoleNote:
      '180g Classic Glow Roc — 11/05 Sar-Ko-Par H4 Debut & Max-Weight Overstable Rancho Wind Anchor [4|4|0|3]'
  },
  {
    id: 'innova-leopard3',
    ownerId: 'jeffery',
    cardNumber: 'ARCHIVED VAULT',
    cardImage: EMBEDDED_CARD_IMAGES['innova-leopard3'],
    name: 'Leopard3',
    brand: 'Innova',
    slotCategory: 'Archived Vault (Lost at Sar-Ko-Par 11/02) · Replaced by 170g Halo Star IT',
    plastic: 'GStar',
    weightGrams: 168,
    colorStamp: 'Vibrant Red / Metallic Black Crouching Leopard Stamp',
    orderNumber: '1010 Discs Order #281088 (Oct 26, 2026)',
    price: '$15.99',
    type: 'Fairway Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Understable',
    speed: 7,
    glide: 5,
    turn: -2,
    fade: 1,
    colorHex: '#EF4444',
    idealMinFeet: 155,
    idealMaxFeet: 315,
    moldAndFlight:
      'Understable fairway driver [7 | 5 | -2 | 1] in 168g GStar plastic. Vibrant Red plastic with Metallic Black Crouching Leopard character stamp.',
    courseStrategy:
      'Archived Vault (Lost at Sar-Ko-Par on 11/02 · Replaced in Active 18-Disc Bag by 170g Halo Star IT [7|6|-2|1]): Easy turning fairway driver for hyzer-flips and smooth S-curves.',
    personalFlightNotes:
      'ARCHIVED VAULT (Lost at Sar-Ko-Par on 11/02; searched Hole 1 & Hole 8/9 on 11/03 — replaced in active bag by 170g Halo Star IT): 10/30 Sar-Ko-Par H8 #1 Test Drive Winner, 10/29 Sar-Ko-Par H4 Birdie ★ (21 PB Round!) & 10/29 Cal Trail H8/H9 Workhorse!',
    fieldTestRank: 'Archived (Lost 11/02 at Sar-Ko-Par) · Replaced by 170g Halo Star IT',
    transcriptStats:
      'Archived 11/03 (Lost at Sar-Ko-Par) · 10/30 Sar-Ko-Par H8 #1 Tee Line + 10/29 Sar-Ko-Par H4 Birdie (10ft)!',
    caddieScenarios: ['calm', 'tailwind', 'cross_lr'],
    caddieRoleNote:
      '168g GStar Leopard3 (Archived — Lost at Sar-Ko-Par 11/02, Replaced by 170g Halo Star IT)',
    archived: true
  },
  {
    id: 'innova-champion-eagle',
    ownerId: 'jeffery',
    cardNumber: '#10 OF 14',
    cardImage: './assets/aistudio/card_champion_eagle_sugar_high_a806d919.jpg',
    name: 'Champion Eagle',
    brand: 'Innova',
    slotCategory: 'Fairway 3 (Sugar High Main Bag) · Overstable Control Fairway & Headwinds',
    plastic: 'Champion',
    weightGrams: 175,
    colorStamp: 'Royal Blue / Metallic Blue & Pink Shatter Sugar High 2-Foil Stamp',
    orderNumber: 'Cotton Candy Order #2093 (Oct 26, 2026)',
    price: '$16.99',
    type: 'Fairway Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Overstable',
    speed: 7,
    glide: 4,
    turn: -1,
    fade: 3,
    colorHex: '#60A5FA',
    idealMinFeet: 215,
    idealMaxFeet: 310,
    moldAndFlight:
      'Overstable control fairway driver [7 | 4 | -1 | 3] in 173g–175g translucent Champion plastic (Eagle-X rim). Royal Blue Champion plastic with metallic Blue & Pink Shatter Sugar High 2-Foil stamp.',
    courseStrategy:
      'Fairway 2 in the Main Compartment: Overstable fairway workhorse (Eagle-X rim) that fights headwinds and hooks left. Bites hard at the end of its flight for dependable hyzer finishes and precise forehand flex lines.',
    personalFlightNotes:
      '11/05 Sar-Ko-Par R2 H6 30ft Left Hyzer Test · Sugar High 2-Foil Collector Series (Order #2093): Threw a side-by-side comparison on 11/05 Round 2 Hole #6 (165ft) after parking the Mako3—confirmed its strong +3 left hyzer finish ("Eagle goes left—went 30 feet left of the pin"). Your premier Overstable Fairway Driver [7|4|-1|3] for Kansas headwinds and dogleg-left fairways.',
    fieldTestRank: '11/05 Sar-Ko-Par H6 Tested · Premier Overstable Fairway Driver [7|4|-1|3]',
    transcriptStats:
      '11/05 Sar-Ko-Par R2 H6: Confirmed 30ft left hyzer finish · 175g Champion Eagle [7|4|-1|3] headwind & flex control.',
    caddieScenarios: ['headwind', 'cross_rl', 'calm'],
    caddieRoleNote:
      '175g Champion Eagle — Overstable Control Fairway Driver [7|4|-1|3] for Headwinds, Hyzers & Forehand Flexes'
  },
  {
    id: 'innova-halloween-sync',
    ownerId: 'jeffery',
    cardNumber: '#05 OF 17',
    cardImage: './assets/aistudio/card_star_sync_halloween_pink.jpg',
    name: 'Halloween Star Sync',
    brand: 'Innova',
    slotCategory: 'Putter 5 (Main Bag · Halloween Edition) · Precision Throwing Putter [3|3|0|1]',
    plastic: 'Star (Halloween Edition)',
    weightGrams: 174,
    colorStamp: 'Hot Pink Sparkle Star · Halloween Edition (Bride of Frankenstein Archway Foil · 173–175g)',
    orderNumber: 'Halloween Edition Hot Pink Star Sync Replacement (Debuted Nov 23, 2026)',
    price: '$17.99',
    type: 'Putter',
    speedTier: 'SPD 2-4',
    stabilitySlot: 'Neutral',
    speed: 3,
    glide: 3,
    turn: 0,
    fade: 1,
    colorHex: '#FF1493',
    idealMinFeet: 60,
    idealMaxFeet: 195,
    moldAndFlight:
      'Precision throwing putter [3 | 3 | 0 | 1] in 173–175g Hot Pink Sparkle Star plastic — Halloween Edition (Bride of Frankenstein stone archway stamp). Dead-straight flight with reliable neutral glide and gentle 1-fade finish.',
    courseStrategy:
      'Putter 5 in your 100% Complete 17-Disc Main Bag: Brand-new Halloween Edition Hot Pink Star Sync replacing your original Vault Sync! Laser-straight 100–195ft wooded tee drives, tunnel chutes, and clutch Par approaches.',
    personalFlightNotes:
      '11/27 Mize H6 Pin-Hit & 11/23 Black Hoof Debut (2/2 Pars · 0.00 avg!): Hit the pin from long range on Mize H6 ("Proud of that one!"), right after threading EVERY tree on 105ft Black Hoof H13 (grazing basket top!) & draining 10ft H10 Par!',
    fieldTestRank: '🎃 11/23–11/27 Precision Sniper (H6 Pin-Hit + 2/2 Black Hoof Pars) [3|3|0|1]',
    backComments:
      'Halloween Edition Hot Pink Sparkle Star Sync [3 | 3 | 0 | 1] (173–175g · Precision Throwing Putter). Bride of Frankenstein limited archway stamp in neon pink matching the Cotton Candy bag!',
    transcriptStats:
      '11/27 Mize H6 pin-hit + 11/23 Black Hoof Debut: 2/2 Pars (0.00 avg — H13 basket graze + H10 Par)!',
    caddieScenarios: ['calm', 'headwind', 'cross_lr', 'cross_rl'],
    caddieRoleNote:
      '174g Halloween Edition Hot Pink Star Sync — Precision Throwing Putter [3|3|0|1] (11/23 Debut: 2/2 Pars, H13 Tree-Threader!)'
  },
  {
    id: 'innova-hot-pink-archangel',
    ownerId: 'jeffery',
    cardNumber: '#13 OF 17',
    cardImage: './assets/aistudio/card_dx_archangel_hot_pink.jpg',
    name: 'Hot Pink Archangel',
    brand: 'Innova',
    slotCategory: 'Fairway 4 (Main Bag · Hot Pink DX) · High-Glide Understable Fairway [8|6|-4|1]',
    plastic: 'DX',
    weightGrams: 171,
    colorStamp: 'Hot Pink DX · Black Winged Sword Archangel Stamp (170–172g · SkyBox Foil Card)',
    orderNumber: 'Hot Pink DX Archangel Replacement (Debuted Nov 23, 2026)',
    price: '$8.99',
    type: 'Fairway Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Understable',
    speed: 8,
    glide: 6,
    turn: -4,
    fade: 1,
    colorHex: '#FF1493',
    idealMinFeet: 160,
    idealMaxFeet: 335,
    moldAndFlight:
      'High-glide understable fairway driver [8 | 6 | -4 | 1] in 170–172g Hot Pink DX plastic with Black Winged Archangel stamp. Effortless 6-glide carry and smooth understable turn down tight wooded corridors.',
    courseStrategy:
      'Fairway 4 in your 100% Complete 17-Disc Main Bag: Brand-new Hot Pink DX replacement matching your Cotton Candy bag! Massive 6-glide floaty fairway driver for tailwinds, wooded hallways, and easy-turn distance with a smooth upright 90° chest-high release.',
    personalFlightNotes:
      '11/27 Mize Elementary H1 (218ft) Pin-High Straight Bomb: Flew dead-straight pin-high (~218ft) cleanly inside the new field fence ("That did go pretty far... same distance as the pin!"), following its 11/23 Black Hoof H2 debut!',
    fieldTestRank: '🪽 11/27 Mize H1 218ft Pin-High · Hot Pink DX Fairway [8|6|-4|1]',
    backComments:
      'Hot Pink DX Archangel [8 | 6 | -4 | 1] (170–172g · High-Glide Understable Fairway). Fresh neon-pink replacement matching the Cotton Candy lineup — effortless 6-glide carry!',
    transcriptStats:
      '11/27 Mize H1 ~218ft pin-high straight drive + 11/23 Black Hoof H2 debut!',
    caddieScenarios: ['calm', 'tailwind'],
    caddieRoleNote:
      '171g Hot Pink DX Archangel — High-Glide Understable Fairway [8|6|-4|1] (11/23 Bag Return!)'
  },
  {
    id: 'innova-archangel',
    ownerId: 'jeffery',
    cardNumber: 'BACKUP VAULT',
    cardImage: './assets/aistudio/card_dx_archangel_order_front_79dc09a3.jpg',
    name: 'Archangel',
    brand: 'Innova',
    slotCategory: 'Backup Vault · Original 170g Royal Blue DX Archangel (Replaced 11/23 by Hot Pink Archangel)',
    plastic: 'DX',
    weightGrams: 170,
    colorStamp: 'Royal Blue / Bright Red Winged Archangel Stamp',
    orderNumber: '1010 Discs Order #281088 (Oct 26, 2026)',
    price: '$8.99',
    type: 'Fairway Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Understable',
    speed: 8,
    glide: 6,
    turn: -3,
    fade: 1,
    colorHex: '#3B82F6',
    idealMinFeet: 160,
    idealMaxFeet: 335,
    moldAndFlight:
      'Original high-glide understable control driver [8 | 6 | -3 | 1] in 170g Royal Blue DX plastic with Bright Red Winged Archangel stamp — now retired to the Vault after the Hot Pink DX Archangel arrived on 11/23!',
    courseStrategy:
      'Backup Vault Legend (Replaced 11/23 by Hot Pink DX Archangel): Floaty 6-glide wooded fairway driver that powered Prairie Pass H8 & Sar-Ko-Par H7/H8 Birdies.',
    personalFlightNotes:
      'Archived Vault Legend (39 pre-11/23 holes, 8 Birdies, 77% Par+!): Parked 202ft Prairie Pass H8 pin-high 10ft left ("Like an angel! Permanent, keep this one!") + 11/05 Sar-Ko-Par H7 (3ft Park!) & H8 (20ft) BACK-TO-BACK BIRDIES ★ in your 21 (-6 PB) round! Replaced 11/23 by your new Hot Pink DX Archangel.',
    fieldTestRank: '📦 Backup Vault Legend (8 Birdies) · Replaced 11/23 by Hot Pink Archangel',
    backComments:
      'Original 170g Royal Blue DX Archangel [8 | 6 | -3 | 1] — retired to the Backup Vault on 11/23 after your new Hot Pink DX Archangel joined the Cotton Candy bag!',
    transcriptStats:
      'Prairie Pass H8 10ft park ("Permanent, keep this one!") + 11/05 Sar-Ko H7 (3ft) & H8 (20ft) Back-to-Back Birdies + 11/16 H3 top-band run!',
    caddieScenarios: ['calm', 'tailwind'],
    caddieRoleNote:
      'Backup Vault · Original 170g Royal Blue DX Archangel (Replaced 11/23 by Hot Pink Archangel)'
  },
  {
    id: 'innova-roadrunner',
    ownerId: 'jeffery',
    cardNumber: '#15 OF 18',
    cardImage: EMBEDDED_CARD_IMAGES['innova-roadrunner'],
    name: 'Roadrunner',
    brand: 'Innova',
    slotCategory: 'Driver 1 (Main Compartment) · Long Distance Roller & S-Curves',
    plastic: 'GStar',
    weightGrams: 168,
    colorStamp: 'Deep Purple / Neon Green Running Roadrunner Stamp',
    orderNumber: '1010 Discs Order #281088 (Oct 26, 2026)',
    price: '$15.99',
    type: 'Distance Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Understable',
    speed: 9,
    glide: 5,
    turn: -4,
    fade: 1,
    colorHex: '#A855F7',
    idealMinFeet: 250,
    idealMaxFeet: 350,
    moldAndFlight:
      'Understable distance driver [9 | 5 | -4 | 1] in 168g GStar plastic. Deep Purple plastic with Neon Green Running Roadrunner character stamp.',
    courseStrategy:
      'Driver 1 in the Main Compartment: Soft GStar grip understable driver for long-distance rollers and panning turnovers. Shares the exact -4 Turn and 1 Fade of your Star Rollo in a Speed 9 distance rim.',
    personalFlightNotes:
      '11/04 & 11/05 Sar-Ko-Par H7 (139ft) Back-to-Back Pin Parks ★ & 11/02 H3 Birdie 2 ★: On 11/05 Round 1, parked H7 right under the pin ("Went with the Roadrunner, just parked it right under the pin, baby!"). On 11/04, parked H7 10ft right ("I left you one!") for Birdie 2! Plus 10/28 Mize #1 Distance Winner (+20ft farthest & skipped 2ft from H5 pin!).',
    fieldTestRank: '🏆 Sar-Ko-Par H7 & H3 Pin Parker · #1 New Driver Distance (+20ft)',
    transcriptStats:
      '11/05 & 11/04 Sar-Ko-Par H7 Parked Under Pin + 11/02 H3 Birdie 2 + 10/28 Mize Field Test Winner (+20ft)!',
    caddieScenarios: ['calm', 'tailwind', 'cross_rl'],
    caddieRoleNote:
      '168g GStar Roadrunner — Sar-Ko-Par H7 & H3 Pin Parker, #1 Distance Winner (+20ft) & Mize H5 2ft Parker!'
  },
  {
    id: 'innova-classic-glow-beast',
    ownerId: 'jeffery',
    cardNumber: '#16 OF 18',
    cardImage: './assets/aistudio/card_classic_glow_beast_invoice_92808f96.jpg',
    name: 'Classic Glow Beast',
    brand: 'Innova',
    slotCategory: 'Driver 2 (Main Compartment) · Smooth S-Curve Control Distance Driver',
    plastic: 'DX Glow',
    weightGrams: 168,
    colorStamp: 'DX Glow (White/Glow · Nighttime S-Curve Control Edition)',
    orderNumber: 'Innova Factory Store Order #100838958 (Arrived Nov 5, 2026)',
    price: '$7.95',
    type: 'Distance Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Neutral',
    speed: 10,
    glide: 5,
    turn: -2,
    fade: 2,
    colorHex: '#4ADE80',
    idealMinFeet: 255,
    idealMaxFeet: 365,
    moldAndFlight:
      'Balanced S-curve control distance driver [10 | 5 | -2 | 2] in 165g–169g Classic Glow DX plastic. Easy to get up to cruising speed with a symmetrical -2 high-speed turn and +2 low-speed fade.',
    courseStrategy:
      'Driver 2 in the Main Compartment: Smooth S-curve control distance driver that bridges your understable GStar Roadrunner [9|5|-4|1] / Star Mamba [11|6|-5|1] and overstable Classic Glow Wraith [11|5|-1|3].',
    personalFlightNotes:
      '11/05 Arrived In-Hand & Tested on Sar-Ko-Par H8 (171ft): Debuted the newly delivered 168g Classic Glow DX Beast on 11/05 Round 1 Hole #8 alongside the Halo Star IT ("I haven\'t tried out the Beast—let\'s try out the Beast, I just got that!"). True net-zero [-2|2] Speed 10 control distance driver for 255–365 ft fairways!',
    fieldTestRank: '11/05 Debut on Sar-Ko-Par H8 · Net-Zero [-2|2] S-Curve Distance Driver',
    backComments:
      'The Innova Classic Glow DX Beast is a versatile distance driver, perfect for low-light play. Its understable-to-neutral flight allows for long, straight shots and controlled turnovers. Glows in the dark for nighttime rounds!',
    transcriptStats:
      '11/05 Sar-Ko-Par H8 Debut (Arrived Nov 5, 2026 · Order #100838958): 168g Classic Glow DX Beast [10|5|-2|2].',
    caddieScenarios: ['calm', 'tailwind', 'cross_lr'],
    caddieRoleNote:
      '168g Classic Glow Beast — Smooth S-Curve Control Distance Driver [10|5|-2|2] (11/05 H8 Debut)'
  },
  {
    id: 'innova-classic-glow-wraith',
    ownerId: 'jeffery',
    cardNumber: '#18 OF 18',
    cardImage: './assets/aistudio/card_classic_glow_wraith_invoice_935bbe7c.jpg',
    name: 'Classic Glow Wraith',
    brand: 'Innova',
    slotCategory: 'Driver 4 (Main Compartment) · Headwind Power Distance Driver',
    plastic: 'DX Glow',
    weightGrams: 168,
    colorStamp: 'DX Glow (White/Glow · Headwind Power Distance Bomber)',
    orderNumber: 'Innova Factory Store Order #100838958 (Arrived Nov 5, 2026)',
    price: '$7.95',
    type: 'Distance Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Overstable',
    speed: 11,
    glide: 5,
    turn: -1,
    fade: 3,
    colorHex: '#2DD4BF',
    idealMinFeet: 265,
    idealMaxFeet: 380,
    moldAndFlight:
      'Overstable power distance driver [11 | 5 | -1 | 3] in 165g–169g Classic Glow DX plastic. Delivers high-speed wind resistance with a penetrating 5-glide carry and strong 3-fade finish.',
    courseStrategy:
      'Driver 4 in the Main Compartment: Headwind power distance driver with strong low-speed fade for wind resistance. Pairs directly with your 152g Star Mamba [11|6|-5|1] at Speed 11—throw Mamba in calm/tailwinds and pull Classic Glow Wraith when facing stiff Kansas headwinds or wide-open dogleg-left fairways.',
    personalFlightNotes:
      'Arrived In-Hand 11/05 (Innova Factory Store Order #100838958): Gives you an overstable Speed 11 big brother to your Champion Eagle [7|4|-1|3] and 168g Classic Glow Beast [10|5|-2|2] in lighter 168g grippy Classic Glow DX plastic so you can generate full flight speed and reliable +3 left finishes in the wind.',
    fieldTestRank: 'Arrived 11/05 · Speed 11 Headwind Power Distance Anchor [11|5|-1|3]',
    transcriptStats:
      'Arrived 11/05 (Innova Factory Store Order #100838958): 168g Classic Glow DX Wraith [11|5|-1|3] — headwind power distance driver.',
    caddieScenarios: ['headwind', 'cross_rl', 'calm'],
    caddieRoleNote:
      '168g Classic Glow Wraith — Headwind Power Distance Driver [11|5|-1|3] with Strong Low-Speed 3-Fade'
  },
  {
    id: 'innova-proto-glow-aviar',
    ownerId: 'jeffery',
    cardNumber: '#02 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_proto_glow_aviar.jpg',
    name: 'Proto Glow Aviar',
    brand: 'Innova',
    slotCategory: 'Putter 2 (Sugar High Main Bag) · Beadless Driving & Touch Putter',
    plastic: 'Proto Glow',
    weightGrams: null,
    colorStamp: 'Peach/Orange Proto Glow · Cotton Candy "Sugar High" Mint Collector Foil',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Putter',
    speedTier: 'SPD 2-4',
    stabilitySlot: 'Neutral',
    speed: 2,
    glide: 3,
    turn: 0,
    fade: 1,
    colorHex: '#F59E0B',
    idealMinFeet: 80,
    idealMaxFeet: 190,
    moldAndFlight:
      'Beadless touch & driving putter [2 | 3 | 0 | 1] in high-grip Proto Glow plastic with Cotton Candy "Sugar High" Mint Collector stamp. Holds straight lines off the tee with a soft +1 finish.',
    courseStrategy:
      'Putter 2 in the Cotton Candy Sugar High Main Bag: Replaces Star Sync / Star Aviar for beadless 130–185ft tee shots (like Sar-Ko-Par H1 & Art Nine H7) and floaty Circle 2 touch putts.',
    personalFlightNotes:
      '11/23 Black Hoof Championship Debut (4H): First logged throws in your 65 (+11) All-Time 18-Hole PB tie ("Color Aviar" on H2, H6, H11 around the tree & H14)—commit smoothly without holding back for straight beadless float!',
    fieldTestRank: '🍬 11/23 Black Hoof 18 Debut · Beadless Driving & Touch Putter [2|3|0|1]',
    backComments:
      'Mint Collector Edition Innova Proto Glow Aviar [2 | 3 | 0 | 1]. Beadless putter feel with grippy Proto Glow polymer for straight short-hole tee drives and confident touch approaches.',
    transcriptStats:
      '11/23 Debut: Black Hoof Championship H2, H6, H11 & H14 in 65 (+11) 18-Hole PB tie!',
    caddieScenarios: ['calm', 'tailwind', 'cross_lr'],
    caddieRoleNote:
      'Proto Glow Aviar — Sugar High Main Bag Beadless Driving & Touch Putter [2|3|0|1]'
  },
  {
    id: 'innova-yeti-pro-aviar',
    ownerId: 'jeffery',
    cardNumber: '#03 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_yeti_pro_aviar.jpg',
    name: 'Yeti Pro Aviar',
    brand: 'Innova',
    slotCategory: 'Putter 3 (Sugar High Main Bag) · Concave-Top Grippy Beaded Putter',
    plastic: 'Yeti Pro',
    weightGrams: null,
    colorStamp: 'Hot Pink Yeti Pro · Cotton Candy "Sugar High" Yeti Monster Foil',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Putter',
    speedTier: 'SPD 2-4',
    stabilitySlot: 'Neutral',
    speed: 2,
    glide: 3,
    turn: 0,
    fade: 1,
    colorHex: '#FB7185',
    idealMinFeet: 70,
    idealMaxFeet: 185,
    moldAndFlight:
      'Big-bead, slightly concave-top putter [2 | 3 | 0 | 1] in tacky Yeti Pro blend with Cotton Candy Yeti stamp. Combines the KC Pro Aviar bead with a puddle-top thumb grip and straighter +1 fade.',
    courseStrategy:
      'Putter 3 in the Cotton Candy Sugar High Main Bag:Tacky cold-weather brother to your stiff KC Pro Aviar [2|3|0|2]. The concave flight plate locks your thumb in place for chilly rounds and uphill approaches that sit soft.',
    personalFlightNotes:
      '11/22 Cotton Candy Debut Breakout (27H · 3 Birdies ★ · 12 Pars): Anchored your BOGEY-FREE 24 (-3) Art Nine PB tie—wove crazily around every tree on H5 for Birdie 2 ("Went around all those trees!") and hit metal from 45–50ft on SMP Wooded H9! Tacky puddle-top grip shone in chilly wind.',
    fieldTestRank: '🏆 11/22 Art Nine 24 (-3) PB-Tie Putter · H5 Tree-Bender Birdie [2|3|0|1]',
    backComments:
      'Gold Foil Pixel Edition Innova Yeti Pro Aviar [2 | 3 | 0 | 1]. Features Jay "Yeti" Reading’s signature grippy Pro blend and slight puddle top for clean thumb placement and straight chain-hunting flights.',
    transcriptStats:
      '11/22 Debut: Powered Bogey-Free 24 (-3) Art Nine PB Tie (H5 Birdie 2!) + SMP Wooded H9 45–50ft metal hit!',
    caddieScenarios: ['calm', 'headwind', 'tailwind'],
    caddieRoleNote:
      'Yeti Pro Aviar — Sugar High Main Bag Concave-Top Grippy Beaded Putter [2|3|0|1]'
  },
  {
    id: 'innova-sugar-glow-roc',
    ownerId: 'jeffery',
    cardNumber: '#05 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_dx_glow_roc.jpg',
    name: 'DX Glow Roc',
    brand: 'Innova',
    slotCategory: 'Midrange 1 (Sugar High Main Bag) · Overstable Rancho Glow Hyzer Mid',
    plastic: 'DX Glow',
    weightGrams: null,
    colorStamp: 'Vintage Off-White DX Glow · Red/Blue "Sugar High" Cracked-Ice Foil',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Midrange',
    speedTier: 'SPD 2-4',
    stabilitySlot: 'Overstable',
    speed: 4,
    glide: 4,
    turn: 0,
    fade: 3,
    colorHex: '#38BDF8',
    idealMinFeet: 140,
    idealMaxFeet: 225,
    moldAndFlight:
      'Classic beaded Rancho Roc midrange [4 | 4 | 0 | 3] in grippy DX Glow plastic with Cotton Candy "Sugar High" 2-foil stamp. Zero high-speed turn with a commanding +3 hyzer finish.',
    courseStrategy:
      'Midrange 1 in the Cotton Candy Sugar High Main Bag: Takes over your money overstable midrange slot (Sar-Ko-Par H4 & H5 right-to-left hyzers and gusty headwind mid shots) with grippy glow feel.',
    personalFlightNotes:
      '11/22 Cotton Candy Debut MVP (7H · 5 Pars ★): Anchored 4 Pars at Shawnee Mission Wooded—H6 straight past trees, H10 downhill laser to 15ft right (grazing top bar on birdie bid!), H14 dead-straight ("Lovely, lovely—Par baby!"), and H17, plus Art Nine H1 Par!',
    fieldTestRank: '🏆 11/22 SMP Wooded 4-Par Midrange MVP · H10 15ft Laser [4|4|0|3]',
    backComments:
      '1990s Collector’s Edition Innova DX Glow Roc [4 | 4 | 0 | 3]. Legendary beaded Rancho midrange built for headwinds, sweeping RHBH right-to-left hyzers, and pinpoint placement.',
    transcriptStats:
      '11/22 Debut: 5 Pars across SMP Wooded (H6, H10 15ft, H14, H17) & Art Nine H1!',
    caddieScenarios: ['headwind', 'cross_rl', 'calm'],
    caddieRoleNote:
      'DX Glow Roc — Sugar High Main Bag Overstable Rancho Glow Midrange [4|4|0|3]'
  },
  {
    id: 'innova-proto-glow-mako3',
    ownerId: 'jeffery',
    cardNumber: '#06 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_proto_glow_mako3.jpg',
    name: 'Proto Glow Mako3',
    brand: 'Innova',
    slotCategory: 'Midrange 2 (Sugar High Main Bag) · Point-and-Shoot Straight Woods Mid',
    plastic: 'Proto Glow',
    weightGrams: null,
    colorStamp: 'Glowing Lime-White Proto Glow · Blue/Magenta Cotton Candy Monster Stamp',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Midrange',
    speedTier: 'SPD 5',
    stabilitySlot: 'Neutral',
    speed: 5,
    glide: 5,
    turn: 0,
    fade: 0,
    colorHex: '#84CC16',
    idealMinFeet: 145,
    idealMaxFeet: 245,
    moldAndFlight:
      'True neutral point-and-shoot midrange [5 | 5 | 0 | 0] upgraded to premium torque-resistant Proto Glow plastic with Cotton Candy "Sugar High" stamp. Holds whatever flat, hyzer, or anhyzer line you set.',
    courseStrategy:
      'Midrange 2 in the Cotton Candy Sugar High Main Bag: Direct premium upgrade to your 12-Birdie DX Glow Mako3 workhorse for Sar-Ko-Par H2/H6, Art Nine tunnels, and Shawnee Mission Wooded hallways.',
    personalFlightNotes:
      '11/22 Cotton Candy Debut Breakout (7H · 1 Birdie ★ · 3 Pars): Sparked your BOGEY-FREE 24 (-3) Art Nine PB tie with a clean H3 skip Birdie 2, glided glowing downhill on H9 for a CHAIN-OUT birdie bid for 23, and threaded SMP Wooded H15 ("Missed the trees!") for Par 3!',
    fieldTestRank: '🏆 11/22 Art Nine H3 Birdie & H9 Chain-Out Laser · SMP H15 Par [5|5|0|0]',
    backComments:
      'Rainbow Holo Collector Card — Innova Proto Glow Mako3 [5 | 5 | 0 | 0]. Zero turn, zero fade, high 5-glide midrange that mirrors your exact release angle from tee to chains.',
    transcriptStats:
      '11/22 Debut: Art Nine H3 Skip Birdie + H9 Chain-Out for 23 (Bogey-Free 24 PB Tie!) + SMP Wooded H15 Par!',
    caddieScenarios: ['calm', 'tailwind', 'cross_lr'],
    caddieRoleNote:
      'Proto Glow Mako3 — Sugar High Main Bag Dead-Straight [5|5|0|0] Woods & Fairway Laser'
  },
  {
    id: 'innova-sugar-star-rollo',
    ownerId: 'jeffery',
    cardNumber: '#07 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_star_rollo.jpg',
    name: 'Star Rollo',
    brand: 'Innova',
    slotCategory: 'Midrange 3 (Sugar High Main Bag) · Understable Right-Turn & Roller Mid',
    plastic: 'Star',
    weightGrams: null,
    colorStamp: 'Bright White Star · Neon Lime-Yellow "Sugar High" Stamp',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Midrange',
    speedTier: 'SPD 5',
    stabilitySlot: 'Understable',
    speed: 5,
    glide: 6,
    turn: -4,
    fade: 1,
    colorHex: '#FB923C',
    idealMinFeet: 140,
    idealMaxFeet: 250,
    moldAndFlight:
      'High-glide understable midrange [5 | 6 | -4 | 1] in premium Star plastic with Cotton Candy "Sugar High" stamp. Effortless RHBH right-drifting turnovers, uphill hyzer-flips, and easy fairway rollers.',
    courseStrategy:
      'Midrange 3 in the Cotton Candy Sugar High Main Bag: Stamped Sugar High twin to your 5× Sar-Ko-Par H9 Birdie closer and SMP Wooded H5/H12/H18 Par shaper. Throw smooth at 75% for sweeping right pans or uphill glide.',
    personalFlightNotes:
      '🏆 11/23 BLACK HOOF CHAMPIONSHIP MVP (65 / +11 18-HOLE PB TIE!!): Flipped up on 201ft H17 for your 1st Cotton Candy Star Rollo BIRDIE 2 ★ ("Flip up, flip up—IT DID IT!! Rollo is my disc, man! Birdie, dude!"), crushed 237+ ft downhill past the blue pin on H15 Par, & locked in Pars on H1, 294ft H10 & uphill H18!',
    fieldTestRank: '🏆 11/23 Black Hoof H17 Birdie MVP · 5 Pars + 1 Birdie in 65 PB Tie [5|6|-4|1]',
    backComments:
      'Limited Edition Pixel Fairway — Innova Star Rollo [5 | 6 | -4 | 1]. Massive 6-glide and -4 turn make right-finishing RHBH lines, standstill woods scrambles, and touch rollers effortless.',
    transcriptStats:
      '11/23 Black Hoof 65 PB Tie: H17 Flip-Up Birdie 2 ("Rollo is my disc, man!") + 4 Pars (H1, H10, H15 237ft+ bomb, H18)!',
    caddieScenarios: ['tailwind', 'calm', 'cross_lr'],
    caddieRoleNote:
      'Star Rollo — Sugar High Main Bag Effortless Right-Turn, Uphill Glide & Roller Mid [5|6|-4|1]'
  },
  {
    id: 'innova-glow-leopard3',
    ownerId: 'jeffery',
    cardNumber: '#08 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_glow_leopard3.jpg',
    name: 'Glow Leopard3',
    brand: 'Innova',
    slotCategory: 'Fairway 1 (Sugar High Main Bag) · Color Glow Hyzer-Flip & S-Curve Fairway',
    plastic: 'Glow',
    weightGrams: null,
    colorStamp: 'Aqua/Teal Color Glow Champion · Rainbow Holo "Sugar High" Stamp',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Fairway Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Understable',
    speed: 7,
    glide: 5,
    turn: -2,
    fade: 1,
    colorHex: '#22D3EE',
    idealMinFeet: 185,
    idealMaxFeet: 295,
    moldAndFlight:
      'Controllable hyzer-flip & S-curve fairway driver [7 | 5 | -2 | 1] in gummy Aqua Color Glow Champion plastic with Cotton Candy "Sugar High" foil. Flips to flat smoothly with gentle forward push and minimal +1 fade.',
    courseStrategy:
      'Fairway 1 in the Cotton Candy Sugar High Main Bag: Brings back the Leopard3 mold (+15ft "double-lift glide" winner from your 10/28 field test!) in premium Color Glow Champion plastic, filling the Halo Star IT [7|6|-2|1] slot on Sar-Ko-Par H2/H3 & wooded tunnels.',
    personalFlightNotes:
      '11/23 Black Hoof Championship H3 & H6: Unlocked your new hip-rotation swing cue ("Swing your hips—belly button at the target!") with clean skip-skip-skip carries on H3 (206ft) in your 65 (+11) PB tie!',
    fieldTestRank: '🍬 11/23 Black Hoof H3 Hip-Rotation Breakthrough · Hyzer-Flip Fairway [7|5|-2|1]',
    backComments:
      'Prism Holo Collector Card — Innova Color Glow Champion Leopard3 [7 | 5 | -2 | 1]. Flat-topped 7-speed control fairway built for dead-straight wooded hyzer-flips and smooth turnover lines.',
    transcriptStats:
      '11/23 Black Hoof 65 PB Tie: H3 hip-rotation skip drive & H6 + 11/22 SMP Wooded debut!',
    caddieScenarios: ['calm', 'tailwind', 'cross_lr'],
    caddieRoleNote:
      'Glow Leopard3 — Sugar High Main Bag Color Glow Hyzer-Flip & Tunnel Fairway [7|5|-2|1]'
  },
  {
    id: 'innova-glow-teebird',
    ownerId: 'jeffery',
    cardNumber: '#09 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_glow_teebird.jpg',
    name: 'Glow Teebird',
    brand: 'Innova',
    slotCategory: 'Fairway 2 (Sugar High Main Bag) · Pinpoint Straight-to-Fade Fairway',
    plastic: 'Glow',
    weightGrams: null,
    colorStamp: 'Mint-White Glow · Pink/Blue "Sugar High" Collector Foil',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Fairway Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Neutral',
    speed: 7,
    glide: 5,
    turn: 0,
    fade: 2,
    colorHex: '#6EE7B7',
    idealMinFeet: 200,
    idealMaxFeet: 305,
    moldAndFlight:
      'Legendary straight-to-fade fairway driver [7 | 5 | 0 | 2] in grippy Glow plastic with Cotton Candy "Sugar High" stamp. Zero high-speed turn holds dead straight for 80% of its flight before a clean +2 left finish.',
    courseStrategy:
      'Fairway 2 in the Cotton Candy Sugar High Main Bag: Bridges your understable Glow Leopard3 [7|5|-2|1] and overstable Champion Eagle [7|4|-1|3], giving you a complete 3-disc 7-speed fairway triad!',
    personalFlightNotes:
      '🏆 11/23 Black Hoof Championship H5 (315ft) MONSTER PAR 3 ★: Striped a gorgeous S-glide ("Like a little snake—goes right then flows back left!") + XT Glow Nova parked 5ft under pin! Plus 11/22 SMP Wooded H1 gusty-wind debut opener!',
    fieldTestRank: '🏆 11/23 Black Hoof 315ft H5 S-Glide Par · Straight-to-Fade 7-Speed [7|5|0|2]',
    backComments:
      'Collector’s Edition Holo — Innova Glow Teebird [7 | 5 | 0 | 2]. Innova’s gold-standard pinpoint fairway driver combining high 5-glide carry, zero turn, and predictable placement fade.',
    transcriptStats:
      '11/23 Black Hoof 65 PB Tie: 315ft H5 snake-glide Par 3 ★ + 11/22 SMP Wooded H1 wind opener!',
    caddieScenarios: ['calm', 'headwind', 'cross_rl'],
    caddieRoleNote:
      'Glow Teebird — Sugar High Main Bag Straight-to-Fade Fairway Workhorse [7|5|0|2]'
  },
  {
    id: 'innova-sugar-star-roadrunner',
    ownerId: 'jeffery',
    cardNumber: '#11 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_star_roadrunner.jpg',
    name: 'Star Roadrunner',
    brand: 'Innova',
    slotCategory: 'Driver 1 (Sugar High Main Bag) · Understable Distance Turnover & Roller',
    plastic: 'Star',
    weightGrams: null,
    colorStamp: 'Hot Pink Star · Cotton Candy "Sugar High" Cracked-Ice Foil',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Distance Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Understable',
    speed: 9,
    glide: 5,
    turn: -4,
    fade: 1,
    colorHex: '#EC4899',
    idealMinFeet: 220,
    idealMaxFeet: 350,
    moldAndFlight:
      'High-glide understable 9-speed control distance driver [9 | 5 | -4 | 1] in high-visibility Hot Pink Star plastic with Cotton Candy "Sugar High" stamp. Effortless hyzer-flip distance, long right-turning pans, and power rollers.',
    courseStrategy:
      'Driver 1 in the Cotton Candy Sugar High Main Bag: Upgrades your #1 long-course distance workhorse (Mize +20ft field-test winner, Prairie Center H9 gap laser & Sar-Ko-Par 11/09 H3/H8 Birdies) into bright Hot Pink Star plastic that’s impossible to lose in leaves!',
    personalFlightNotes:
      '11/23 Black Hoof Championship H7 (382ft Longest Hole!) & H12: Twisted the hips for a clean roller carry down Black Hoof\'s 382ft monster ("Went the distance! I was proud of that 4!") in your 65 (+11) PB tie, plus 11/22 SMP Wooded H13 debut!',
    fieldTestRank: '⭐ 11/23 Black Hoof 382ft H7 Proud 4 · Hot Pink Star Distance [9|5|-4|1]',
    backComments:
      'Cracked-Ice Holo Collector Card — Innova Star Roadrunner [9 | 5 | -4 | 1]. Versatile long-range turnover driver, tailwind bomber, and out-of-the-box distance roller.',
    transcriptStats:
      '11/23 Black Hoof 65 PB Tie: 382ft H7 hip-twist distance 4 & H12 + 11/22 SMP Wooded H13!',
    caddieScenarios: ['calm', 'tailwind', 'cross_lr'],
    caddieRoleNote:
      'Star Roadrunner — Sugar High Main Bag High-Glide Turnover & S-Curve Distance Driver [9|5|-4|1]'
  },
  {
    id: 'innova-luster-firebird',
    ownerId: 'jeffery',
    cardNumber: '#12 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_luster_firebird.jpg',
    name: 'Luster Firebird',
    brand: 'Innova',
    slotCategory: 'Driver 2 (Sugar High Main Bag) · Overstable Headwind, Skip & Flex Utility',
    plastic: 'Luster',
    weightGrams: null,
    colorStamp: 'Royal Blue Luster Champion · Magenta "Sugar High" Storm Foil',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Distance Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Overstable',
    speed: 9,
    glide: 3,
    turn: 0,
    fade: 4,
    colorHex: '#3B82F6',
    idealMinFeet: 195,
    idealMaxFeet: 300,
    moldAndFlight:
      'Ultra-reliable overstable 9-speed utility driver [9 | 3 | 0 | 4] in pearlescent Luster Champion plastic with Cotton Candy "Sugar High" stamp. Refuses to turn over in fierce Kansas gusts and finishes with a sharp +4 hook and ground flare-skip.',
    courseStrategy:
      'Driver 2 in the Cotton Candy Sugar High Main Bag: Replaces the Champion Firebird lost on Mize H1! Pull this for brutal headwinds, low skip shots under tree canopies, dogleg-left corners, and forehand get-out-of-trouble flexes.',
    personalFlightNotes:
      '🏆 BREAKOUT PAR MACHINE (3/4 PARS · 75% PAR+!!): On 11/27 Black Friday at Mize H7 (324ft!), threaded trees and landed cleanly for a clutch Par 3 ("Great job, Firebird! I was proud of that one!"), right after powering your 1st-ever Heritage Park Par on 304ft H2 (11/25) AND SMP Wooded H8 Par (11/22)!',
    fieldTestRank: '🏆 75% Par+ Breakout (3/4 Pars: Mize H7, Heritage H2 & SMP H8!) [9|3|0|4]',
    backComments:
      'Gold & Lightning Collector Card — Innova Luster Champion Firebird [9 | 3 | 0 | 4]. Tour-proven wind fighter & Par-making fairway utility across Mize, Heritage Park & SMP Wooded!',
    transcriptStats:
      '3/4 Career Pars (75% Par+): 11/27 Mize H7 (324ft) + 11/25 Heritage H2 (304ft) + 11/22 SMP H8 (302ft)!',
    caddieScenarios: ['headwind', 'cross_rl'],
    caddieRoleNote:
      'Luster Firebird — Sugar High Main Bag Headwind Fighter, Flare-Skip & Spike-Hyzer Utility [9|3|0|4]'
  },
  {
    id: 'innova-halo-wraith',
    ownerId: 'jeffery',
    cardNumber: '#13 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_halo_wraith.jpg',
    name: 'Halo Wraith',
    brand: 'Innova',
    slotCategory: 'Driver 3 (Sugar High Main Bag) · Halo Star Controlled Power Distance Driver',
    plastic: 'Halo',
    weightGrams: null,
    colorStamp: 'Magenta/Purple Plate w/ White Halo Rim · "Sugar High" Collector Foil',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Distance Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Overstable',
    speed: 11,
    glide: 5,
    turn: -1,
    fade: 3,
    colorHex: '#D946EF',
    idealMinFeet: 255,
    idealMaxFeet: 375,
    moldAndFlight:
      'Tour-caliber Speed 11 distance driver [11 | 5 | -1 | 3] in two-tone Halo Star plastic with Cotton Candy "Sugar High" stamp. High-glide forward push with Halo rim torque stability and a dependable +3 finish.',
    courseStrategy:
      'Driver 3 in the Cotton Candy Sugar High Main Bag: Premium Halo Star upgrade to the Classic Glow Wraith you striped low and flat on Shawnee Mission Wooded H7 & H9 ("Excellent job Wraith—kept it down, great flight!").',
    personalFlightNotes:
      '🚀 11/27 BLACK FRIDAY MIZE BREAKOUT (2 PARS + "BEST EVER THROWN!" BONUS H1!): Piped chest-level ~220ft on Mize H2 (264ft Double Par!) & curved back safely inside the baseball fence on H5 (296ft Par!), then parked Bonus H1 18ft left ("That was the best ever thrown! Learning the Wraith!")!',
    fieldTestRank: '🚀 11/27 Mize Breakout (H2 & H5 Pars + 18ft Bonus Park!) · Speed 11 [11|5|-1|3]',
    backComments:
      'Rainbow Holo Collector Card — Innova Halo Star Wraith [11 | 5 | -1 | 3]. Breakout Mize Elementary distance driver — chest-level flat laser & reliable +3 comeback!',
    transcriptStats:
      '11/27 Mize: H2 & H5 Pars + Bonus H1 18ft park ("Best ever thrown!") + 11/25 Heritage H7/H9!',
    caddieScenarios: ['headwind', 'cross_rl', 'calm'],
    caddieRoleNote:
      'Halo Wraith — Sugar High Main Bag Controlled Power & Wind Distance Driver [11|5|-1|3]'
  },
  {
    id: 'innova-halo-destroyer',
    ownerId: 'jeffery',
    cardNumber: '#14 OF 14',
    cardImage: './assets/aistudio/card_sugar_high_halo_destroyer.jpg',
    name: 'Halo Destroyer',
    brand: 'Innova',
    slotCategory: 'Driver 4 (Sugar High Main Bag) · Flagship Speed 12 Max-Distance Bomber',
    plastic: 'Halo',
    weightGrams: null,
    colorStamp: 'Neon Chartreuse/Lime Halo Star · Blue "Sugar High" Collector Foil',
    orderNumber: 'Cotton Candy "Sugar High" Main Bag Collection (Nov 2026)',
    type: 'Distance Driver',
    speedTier: 'SPD 7-11',
    stabilitySlot: 'Overstable',
    speed: 12,
    glide: 5,
    turn: -1,
    fade: 3,
    colorHex: '#A3E635',
    idealMinFeet: 270,
    idealMaxFeet: 400,
    moldAndFlight:
      'Innova’s flagship Speed 12 distance driver [12 | 5 | -1 | 3] in high-visibility Neon Chartreuse Halo Star plastic with Cotton Candy "Sugar High" stamp. Fast aerodynamic rim slices wind with big forward carry and a strong +3 finish.',
    courseStrategy:
      'Driver 4 in the Cotton Candy Sugar High Main Bag: Your fastest disc in the bag (Speed 12!) for wide-open 300–600ft Championship fairways (Cedar Ridge Par 4/5s, Heritage Park, Mize H9, and strong headwind drives).',
    personalFlightNotes:
      '🏆 11/25 HERITAGE PARK DGC OFFICIAL DEBUT (17 OF 17 ACTIVE DISCS NOW LOGGED!!): Pulled out the flagship Speed 12 Neon Chartreuse Halo Destroyer on 323ft H7 ("Give it a try... Beauty! Out in the open, dude—Wraith and the Destroyer were totally right angle!") — completing 100% of your 17-disc Cotton Candy + Hot Pink bag!',
    fieldTestRank: '🚀 11/25 Official Debut (Heritage H7 · 17/17 Bag Logged!) · Speed 12 Flagship [12|5|-1|3]',
    backComments:
      'Gear-Crest Holo Collector Card — Innova Halo Star Destroyer [12 | 5 | -1 | 3]. Official debut 11/25 at Heritage Park DGC H7 (323ft) — completing all 17 of 17 active discs logged!',
    transcriptStats:
      '11/25 Heritage Park H7 (323ft) Official Debut ("Beauty! Totally right angle!") — 17/17 Active Bag Logged!',
    caddieScenarios: ['headwind', 'cross_rl', 'calm'],
    caddieRoleNote:
      'Halo Destroyer — Sugar High Main Bag Speed 12 Flagship Max-Distance & Headwind Bomber [12|5|-1|3]'
  }
];

const ROUND_2026_10_30_SARKO: HistoricalRound = {
  id: 1761854400001,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-10-30',
  duration: '00:25:15',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  roundTranscript: `Sar-Ko-Par Trails "Hollow's Eve" Afternoon Solo Round (2026-10-30, ~2:00 PM after Zachary's Halloween Parade, Warm & Calm Wind) — Jeffery 25 (-2, 4 Straight Birdies on Holes #4–#7!).
Strong -2 round highlighted by a 4-hole birdie heater (Holes #4–#7), a metal pin-hit on Hole #4 with the DX Roc3, and a dialed level-swing Glow Mako3 birdie on Hole #6:
- Hole 1 (138ft, Par 3): Jeffery 3 (Par). Threw 175g Star Sync off the tee—flew dead straight about 25–30 feet right of the pin ("Went too straight... maybe should have went with the Aviar"). Birdie putt rolled hard, leaving a comebacker; buried the 3rd shot for Par 3.
- Hole 2 (192ft, Par 3): Jeffery 3 (Par). Threw 176g Glow Mako3 off the tee ("Nice, perfect, straight, faded left a little bit, little nose up still"). Birdie putt with Star Sync bounced out of the basket ("Oh, it bounced out! Would have been a bird!"), tapped in for Par 3.
- Hole 3 (162ft, Par 3): Jeffery 3 (Par). Overpowered 152g Star Mamba off the tee into the woods ("I'm throwing farther on things, so I might have to do a touch down, go to the midrange... left that Mamba over there until Hole 7!"). Pitched out of the woods with 175g Star Aviar right under the basket ("Right under the basket, good toss, good measurement from the woods—Aviar on Hole 3 to get out of the woods is the way to go!") for Par 3.
- Hole 4 (162ft, Par 3): Jeffery 2 (Birdie ★). Rolled with 180g DX Roc3 off the tee—kept it flat and hit the metal pin! Parked 2 feet away ("Right there, it hit the pin! Not the basket, but went to the pin... 2 feet away! Roc3 is the way to go on this one now") for a tap-in Birdie 2!
- Hole 5 (144ft, Par 3): Jeffery 2 (Birdie ★). Chose 180g Star Jay [5|4|0|1] over Mako3 [5|5|0|0] off the tee—got a clean skip to 10–12 feet ("Nice skip over there! Good... right there in distance for birdie") and drained the 10–12ft putt with 175g Star Sync ("Bird, bird, bird!").
- Hole 6 (165ft, Par 3): Jeffery 2 (Birdie ★). Threw 176g Glow Mako3 with a smooth weight-transfer level swing ("Right there at the pin, baby! Awesome! Getting my level swing out, pushing the weight to the front right foot as I throw, start with my weight on the back left, not bending that helps, walk through that straight line"). Answered his question on the tee: this is back-to-back Birdies on Hole #6 (birdied 10/29 with DX Archangel to 15ft, and now parked it right at the pin with Glow Mako3 for his 3rd straight birdie!).
- Hole 7 (139ft, Par 3): Jeffery 2 (Birdie ★). Retrieved the 152g Star Mamba left near Hole 3's green ("Can you believe I left that over there? Luckily Hole 7 starts right back here at Hole 3 where I left that Mamba!"), threw Mamba off the tee to 10–15 feet ("Perfect! Mamba's perfect on this one, 10–15 feet away"), and drained the putt for Birdie 2 (4th straight birdie, reaching -4 through 7!).
- Hole 8 (171ft, Par 3): Jeffery 4 (Bogey). Clipped the guardian tree off the tee with 152g Star Mamba ("Don't hit the tree... I hit the tree!"). Threw fun comparison test drives with 166g GStar Leopard3 and 169g GStar Roadrunner ("Leopard would have been the way... Leopard did the best!"). Played his real Mamba lie with Star Sync (needed more curve like the Aviar) and carded a Bogey 4.
- Hole 9 (141ft, Par 3): Jeffery 4 (Bogey). Threw 178g Star Rollo off the tee with a low lucky skip and right turn to ~30 feet (also tested 175g Star Toro, which hooked sharply left). The 30ft downhill birdie bid rolled 20 feet past the basket, the 20ft par comebacker grazed right over the top of the chains, and tapped in for 4 to finish at 25 (-2)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 25 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 175g Star Sync off the tee—went straight about 25–30ft right of the pin ("Maybe I should have went with the Aviar"). Birdie bid rolled hard; made the comebacker for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Sync',
          thrownDiscId: 'innova-sync',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 28,
          scenarioUsed: 'calm',
          notes:
            'Star Sync flew straight 25–30ft right of pin (noted Aviar gentle left fade works better on H1); birdie bid rolled hard, made comebacker for Par 3.',
          voiceNote: 'Star Sync straight 25–30ft right of pin (use Aviar on H1); comeback Par 3'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 176g Glow Mako3 straight with a gentle left finish ("Nice, perfect, straight, faded left a little bit"). Birdie putt with Star Sync bounced out of the chains ("Oh, it bounced out! Would have been a bird!"), tapped in for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 22,
          scenarioUsed: 'calm',
          notes:
            'Glow Mako3 flew straight with slight left finish; Star Sync birdie putt bounced out of the basket, tapped in for Par 3.',
          voiceNote: 'Glow Mako3 straight tee + Star Sync birdie bid bounced out of basket for Par 3'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Overpowered 152g Star Mamba into the woods ("I\'m throwing farther on things, might have to club down to a midrange"). Pitched out of the woods with 175g Star Aviar right under the basket ("Aviar on Hole 3 to get out of the woods is the way to go!") and tapped in for Par 3 (left Mamba by H3 green until H7!).',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-aviar' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          scenarioUsed: 'calm',
          notes:
            'Overpowered 152g Star Mamba into the woods (growing arm speed—touch down or midrange); pitched 175g Star Aviar out of the woods right under the basket for Par 3!',
          voiceNote: 'Mamba overpowered into woods + clutch Star Aviar scramble parked under basket for Par 3!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Chose 180g DX Roc3 off the tee—kept it flat and hit the metal pin! Parked 2 feet away ("Right there, it hit the pin! Not the basket, but went to the pin... 2 feet away! Roc3 is the way to go on this one now") for Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          scenarioUsed: 'calm',
          notes:
            '180g DX Roc3 kept flat, hit the metal pole/pin and parked 2 feet away ("Hit the pin! 2 feet away! Roc3 is the way to go on this one now") for tap-in Birdie 2!',
          voiceNote: '🎯 180g DX Roc3 HIT THE PIN! Parked 2ft away for tap-in Birdie 2!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Chose 180g Star Jay [5|4|0|1] over Mako3 off the tee—nice skip right up to 10–12 feet ("Nice skip over there! Good... right there in distance for birdie") and buried the 10–12ft putt with 175g Star Sync ("Bird, bird, bird!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-jay' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Jay',
          thrownDiscId: 'innova-jay',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 11,
          scenarioUsed: 'calm',
          notes:
            '180g Star Jay skipped nicely to 10–12ft + drained 175g Star Sync putt ("Bird, bird, bird!") for 2nd straight Birdie!',
          voiceNote: '180g Star Jay skip to 10–12ft + lovely Star Sync putt for Birdie 2!'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Threw 176g Glow Mako3 with a smooth weight-transfer level swing right to the pin ("Right there at the pin, baby! Awesome! Getting my level swing out, pushing the weight to the front right foot as I throw, start with my weight on the back left, not bending that helps, walk through that straight line"). Back-to-back H6 birdies (birdied 10/29 w/ Archangel & now parked w/ Mako3)!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          scenarioUsed: 'calm',
          notes:
            'Parked 176g Glow Mako3 right at the pin with dialed level swing (back-left to front-right weight shift, straight walk-through)! Historical Answer: You birdied H6 yesterday (10/29 w/ DX Archangel to 15ft) and now parked it with Glow Mako3 for back-to-back H6 birdies!',
          voiceNote: '176g Glow Mako3 level-swing parked right at the pin for 3rd straight Birdie 2!'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Picked up the 152g Star Mamba left near Hole 3\'s green ("Luckily Hole 7 starts right back here at Hole 3 where I left that Mamba!"), threw Mamba off the tee to 10–15 feet ("Perfect! Mamba\'s perfect on this one, 10–15 feet away"), and drained the putt for a 4th consecutive Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          scenarioUsed: 'calm',
          notes:
            'Retrieved 152g Star Mamba from Hole 3 green, parked tee shot 10–15ft from the pin ("Mamba\'s perfect on this one!"), and drained the putt for a 4th straight Birdie 2 (-4 thru 7)!',
          voiceNote: 'Retrieved 152g Star Mamba + parked 10–15ft for 4th straight Birdie 2!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Hit the tree off the tee with 152g Star Mamba ("Don\'t hit the tree... I hit the tree!"). Threw comparison test shots with 166g GStar Leopard3 and 169g GStar Roadrunner ("Leopard would have been the way... Leopard did the best!"). Played real Mamba lie with Star Sync (needed more curve like the Aviar) and took Bogey 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          scenarioUsed: 'calm',
          notes:
            '152g Star Mamba clipped guardian tree (166g GStar Leopard3 test throw was #1 best line!); Star Sync 2nd shot needed more curve (use Aviar on tree-trouble approaches), Bogey 4.',
          voiceNote: 'Mamba hit tree (GStar Leopard3 test throw did the best!) + Sync approach for Bogey 4'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Threw 178g Star Rollo off the tee—low lucky skip turned right to ~30ft (175g Star Toro test hooked sharply left). 30ft downhill birdie putt rolled 20ft past the pin, 20ft comebacker went right over the top of the basket, and tapped in for Bogey 4 to finish at 25 (-2)!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          scenarioUsed: 'calm',
          notes:
            '178g Star Rollo low skip turned right to 30ft; downhill birdie bid rolled 20ft past pin, 20ft par comebacker skimmed right over top of basket for 4 (25 total, -2!).',
          voiceNote: 'Star Rollo skip to 30ft + downhill rollaway & basket-topper for 4 (Finished 25, -2!)'
        }
      }
    }
  ]
};

const CORE_DISC_UPDATES_V86: Record<string, Partial<DiscItem>> = {
  'innova-it': {
    slotCategory: 'Fairway 1 (Main Compartment) · Easy Turnover & Hyzer-Flip Fairway',
    personalFlightNotes:
      '11/05 Sar-Ko-Par H2 (1ft deep / 5ft right Par) & H3 (1ft Tap-In Birdie ★) + 11/04 H8 Birdie ★: On 11/05 Round 1, flew true to its collector card flight path on Hole #2 (192ft) to 1ft deep/5ft right ("Went exactly as the flight path shows on the card!"), then parked Hole #3 (162ft) 1 foot from the pin ("IT is working for me, man! Within 1 foot of the pin!") for a tap-in Birdie 2!',
    fieldTestRank: '🎯 Sar-Ko-Par H3 (1ft Birdie), H2 (5ft Park) & H8 (11/04 Birdie) Workhorse [7|6|-2|1]',
    transcriptStats:
      '11/05 Sar-Ko-Par: H3 parked 1ft for Birdie 2 & H2 parked 1ft deep/5ft right + 11/04 H8 Birdie 2!',
    caddieRoleNote:
      '170g Halo Star IT — Active Fairway 1 [7|6|-2|1] · Sar-Ko-Par H2/H3/H8 Pin Parker & Smooth Hyzer-Flip Fairway'
  },
  'innova-roc3': {
    slotCategory: 'Midrange 3 (Main Compartment) · Seasoned Overstable Fairway Mid',
    orderNumber: '1010 Discs Order #279091 (Oct 10, 2026)',
    price: '$8.99',
    personalFlightNotes:
      '11/05 Sar-Ko-Par H4 & H5 Back-to-Back Birdies ★ (21 / -6 PB Round!) + 11/03 H4 & H6 Double Birdies ★: In Round 2 on 11/05, chose 174g DX Roc3 over Alien on H4 (162ft) and drained the Birdie 2 putt to spark a 6-hole birdie streak, then curved Roc3 wide right around the guardian tree on H5 (144ft) to 15ft behind the pin for another Birdie 2!',
    fieldTestRank: '🎯 Sar-Ko-Par H4, H5, H6 & H8 Birdie Machine · "Heavy Tea Kettle" Grip',
    transcriptStats:
      '11/05 Sar-Ko-Par (21 PB): H4 & H5 Back-to-Back Birdie 2s + 11/04 H8 Birdie 2 + 11/03 H4 (5ft) & H6 (9ft) Birdies!'
  },
  'innova-mako3': {
    slotCategory: 'Midrange 1 (Main Compartment) · Angle Integrity Workhorse & 150ft Throw-Ins',
    orderNumber: '1010 Discs Order #277696 (Sep 30, 2026)',
    price: '$15.99',
    personalFlightNotes:
      '11/05 Sar-Ko-Par H6 (165ft) 2-FT PARKED BIRDIE 2 ★ (21 / -6 PB Round!) + 11/03 H2 (192ft) Birdie 2 ★: In Round 2 on 11/05, stepped up on Hole #6 (165ft) and parked the 176g Glow Mako3 2 feet from the pin ("Mako3 is awesome! It did turn left at the last minute and went right under the pin—2 feet away!") for a tap-in Birdie 2 (3rd straight birdie in the 6-hole heater)!',
    fieldTestRank: '🎯 Sar-Ko-Par H6 (2ft Park!) & H2 (192ft) Pin Parker · Point-and-Shoot Midrange',
    transcriptStats:
      '11/05 Sar-Ko-Par H6 (21 PB): Parked 2ft from the pin for Birdie 2 + 11/03 H2 & 10/30 H6 Parked Birdie 2s!'
  },
  'innova-archangel': {
    cardImage: './assets/aistudio/card_dx_archangel_order_front_79dc09a3.jpg',
    slotCategory: 'Backup Vault · Original 170g Royal Blue DX Archangel (Replaced 11/23 by Hot Pink Archangel)',
    orderNumber: '1010 Discs Order #281088 (Oct 26, 2026)',
    price: '$8.99',
    colorHex: '#3B82F6',
    personalFlightNotes:
      'Archived Vault Legend (39 pre-11/23 holes, 8 Birdies!): Parked Prairie Pass H8 pin-high 10ft left ("Like an angel! Permanent, keep this one!") + 11/05 Sar-Ko-Par H7 (3ft Park!) & H8 (20ft) BACK-TO-BACK BIRDIES ★ in your 21 (-6 PB) round! Replaced 11/23 by your new Hot Pink DX Archangel.',
    fieldTestRank: '📦 Backup Vault Legend (8 Birdies) · Replaced 11/23 by Hot Pink Archangel',
    transcriptStats:
      '11/05 Sar-Ko-Par (21 PB): H7 (parked 3ft) & H8 (20ft C1 putt) Back-to-Back Birdies + Prairie Pass H8 10ft park!'
  },
  'innova-rollo': {
    slotCategory: 'Midrange 5 (Main Compartment) · Understable Turnovers, Mini-S & Rollers',
    orderNumber: '1010 Discs Order #279091 (Oct 10, 2026)',
    price: '$15.99',
    personalFlightNotes:
      '11/05 Sar-Ko-Par H9 (141ft) CLUTCH BIRDIE 2 CLOSER ★ (Sealed 21 / -6 PB & 6-Hole Birdie Streak!): After throwing slightly soft in Round 1 for Par 3, stepped up on Hole #9 in Round 2 with the gallery watching, put a touch more zip on the 172g Star Rollo up the hill, and drained the Birdie 2 putt ("Birdied the last 6 holes! Minus 6!") to tie your all-time 21 (-6) course record!',
    fieldTestRank: '🏆 Sar-Ko-Par H9 5× Birdie Closer (Sealed 11/05 & 10/29 21 / -6 Course PBs!)',
    transcriptStats:
      '11/05 Sar-Ko-Par H9: Drained Birdie 2 closer to seal 21 (-6 PB) & 6-hole birdie streak + 4 straight H9 Birdies (10/20–10/23)!'
  },
  'innova-mamba': {
    slotCategory: 'Driver 3 (Main Compartment) · #1 Distance Bomber (Featherlight Tailwind)',
    orderNumber: '1010 Discs Order #279091 (Oct 10, 2026)',
    price: '$15.99',
    personalFlightNotes:
      '10/30 Sar-Ko-Par H7 (139ft) 10–15ft Birdie ★ & Growing Arm Speed Note: Parked Sar-Ko-Par H7 to 10–15ft on 10/30 (and 6–7ft on 10/29!) after retrieving it from Hole 3\'s green ("Mamba\'s perfect on this one!"). Note: Your arm speed is getting faster—on H3 (162ft) on 10/30, Mamba flew too far into the woods, so throw Halo Star IT on H3 and DX Archangel on H7/H8!',
    fieldTestRank: '🏆 Sar-Ko-Par H7 Automatic Birdie Parker · Featherlight Tailwind Bomber',
    transcriptStats:
      '10/30 Sar-Ko-Par H7: Parked 10–15ft for 4th straight Birdie 2 (after retrieving from H3 green!) + 10/29 H3 & H7 Birdies!'
  },
  'innova-aviar': {
    slotCategory: 'Putter 2 (Top Pocket) · Beadless Driving Putter & Touch Upshots',
    orderNumber: '1010 Discs Order #277696 (Sep 30, 2026)',
    price: '$15.99',
    personalFlightNotes:
      '10/30 Sar-Ko-Par H3 Woods Scramble Under Basket & 10/29 H1 Birdie ★ (6–7ft): On 10/30 Sar-Ko-Par H3, pitched out of the woods right under the basket for a tap-in Par 3 ("Right under the basket, good toss, good measurement from the woods—Aviar on Hole 3 to get out of the woods is the way to go!"). Smooth, beadless driving putter that holds dead-straight lines off the tee & soft upshots.',
    fieldTestRank: 'Sar-Ko-Par H1 #1 Tee Putter & H3 Woods Scramble Savior',
    transcriptStats:
      '10/30 Sar-Ko-Par H3: Parked woods scramble right under the pin for Par 3 + 10/29 H1 Birdie (6–7ft)!'
  },
  'innova-sync': {
    cardImage: './assets/aistudio/card_star_sync_8e893621.jpg',
    slotCategory: 'Backup Vault · Original Star Sync (Replaced 11/23 by Halloween Star Sync)',
    weightGrams: 175,
    colorHex: '#00F0FF',
    colorStamp: 'Original Star Sync · Classic Throwing Putter [3|3|0|1]',
    orderNumber: 'Original Star Sync (Retired to Vault Nov 23, 2026)',
    price: '$15.99',
    moldAndFlight:
      'Original precision throwing putter [3 | 3 | 0 | 1] in 175g Star plastic — retired to the Backup Vault on 11/23 when your brand-new Halloween Edition Hot Pink Star Sync took over the #05 Main Bag slot!',
    courseStrategy:
      'Backup Vault Legend (131 pre-11/23 holes, 27 Birdies!): Retired cleanly to the Vault on 11/23 and succeeded by your Hot Pink Halloween Star Sync.',
    personalFlightNotes:
      'Archived Vault All-Star (131 pre-11/23 holes, 27 Birdies!): SMACKED THE BASKET on Sar-Ko-Par H1 (11/16 near-Ace Birdie 2!), parked H1 in both 11/05 rounds + 11/04, and piped SMP Wooded H2, H5 (3ft park!) & H15 Pars (11/17)! Replaced 11/23 by your new Halloween Edition Hot Pink Star Sync.',
    fieldTestRank: '📦 Backup Vault All-Star (27 Birdies) · Replaced 11/23 by Halloween Star Sync',
    backComments:
      'Original 175g Star Sync [3 | 3 | 0 | 1] — 131 career holes & 27 Birdies before retiring to the Backup Vault on 11/23 for your Halloween Edition Hot Pink Star Sync!',
    transcriptStats:
      '11/16 Sar-Ko H1 Basket Hit Birdie 2 + 11/17 SMP Wooded H2/H5/H15 Pars + 11/05 21 PB H1 Birdie!',
    caddieRoleNote:
      'Backup Vault · Original 175g Star Sync (Replaced 11/23 by Halloween Star Sync)'
  }
};

export const ACTIVE_CARD_NUMBERS: Record<string, string> = {
  'innova-xt-glow-nova': '#01 OF 17',
  'innova-proto-glow-aviar': '#02 OF 17',
  'innova-yeti-pro-aviar': '#03 OF 17',
  'innova-kc-pro-aviar': '#04 OF 17',
  'innova-halloween-sync': '#05 OF 17',
  'innova-dx-alien': '#06 OF 17',
  'innova-sugar-glow-roc': '#07 OF 17',
  'innova-proto-glow-mako3': '#08 OF 17',
  'innova-sugar-star-rollo': '#09 OF 17',
  'innova-glow-leopard3': '#10 OF 17',
  'innova-glow-teebird': '#11 OF 17',
  'innova-champion-eagle': '#12 OF 17',
  'innova-hot-pink-archangel': '#13 OF 17',
  'innova-sugar-star-roadrunner': '#14 OF 17',
  'innova-luster-firebird': '#15 OF 17',
  'innova-halo-wraith': '#16 OF 17',
  'innova-halo-destroyer': '#17 OF 17'
};

export const ACTIVE_JEFFERY_ORDER = [
  'innova-xt-glow-nova',
  'innova-proto-glow-aviar',
  'innova-yeti-pro-aviar',
  'innova-kc-pro-aviar',
  'innova-halloween-sync',
  'innova-dx-alien',
  'innova-sugar-glow-roc',
  'innova-proto-glow-mako3',
  'innova-sugar-star-rollo',
  'innova-glow-leopard3',
  'innova-glow-teebird',
  'innova-champion-eagle',
  'innova-hot-pink-archangel',
  'innova-sugar-star-roadrunner',
  'innova-luster-firebird',
  'innova-halo-wraith',
  'innova-halo-destroyer'
];

export const INITIAL_DISC_BAG: DiscItem[] = [
  ...(typedV65.bag || []),
  ...NEW_INNOVA_DISCS
]
  .map((d) => ({
    ...d,
    ...(CORE_DISC_UPDATES_V86[d.id] || {}),
    archived: ARCHIVED_DISC_IDS.has(d.id),
    cardNumber: ARCHIVED_DISC_IDS.has(d.id)
      ? 'BACKUP VAULT'
      : ACTIVE_CARD_NUMBERS[d.id] || d.cardNumber
  }))
  .sort((a, b) => {
  const aGroup = a.archived ? 2 : a.ownerId === 'jack' ? 1 : 0;
  const bGroup = b.archived ? 2 : b.ownerId === 'jack' ? 1 : 0;
  if (aGroup !== bGroup) return aGroup - bGroup;
  if (aGroup === 0) {
    return ACTIVE_JEFFERY_ORDER.indexOf(a.id) - ACTIVE_JEFFERY_ORDER.indexOf(b.id);
  }
  return a.speed - b.speed;
});

const BLACK_HOOF_18_COURSE: CourseTemplate = {
  key: 'blackhoof_18',
  name: 'Black Hoof Championship (White to White)',
  location: 'Lenexa, KS (#2 Best Course in KS · White to White · Par 54 · 4,218 ft)',
  totalHoles: 18,
  updatedAt: 1795468664071,
  holes: [
    { number: 1, par: 3, distance: 183, hint: '183 ft Par 3 (#2 Course in KS Opener) · ★ 11/23 PAR: Cotton Candy Star Rollo + XT Glow Nova couple feet from pin!' },
    { number: 2, par: 3, distance: 250, hint: '250 ft Par 3 · Hot Pink DX Archangel / Star Roadrunner off tee; commit firmly on 2nd-shot approach!' },
    { number: 3, par: 3, distance: 206, hint: '206 ft Par 3 · Glow Leopard3 skip line (swing hips—belly button at target!) + XT Glow Nova.' },
    { number: 4, par: 3, distance: 197, hint: '197 ft Par 3 · DX Glow Roc skip line around trees + Yeti Pro Aviar.' },
    { number: 5, par: 3, distance: 315, hint: '315 ft Par 3 (Curves LEFT — map is flipped!) · ★ 11/23 MONSTER PAR: Glow Teebird snake S-glide + XT Glow Nova 5ft under pin!' },
    { number: 6, par: 3, distance: 310, hint: '310 ft Par 3 · Watch left tree early; keep Glow Leopard3 / Glow Teebird straight down middle fairway.' },
    { number: 7, par: 3, distance: 382, hint: '382 ft Par 3 (Longest Hole on White!) · Hot Pink Star Roadrunner hip-twist drive + blind tree upshot (11/23 proud 4!).' },
    { number: 8, par: 3, distance: 236, hint: '236 ft Par 3 (Sheltered Sunny Corridor) · ★ 11/23 DOUBLE PAR: Proto Glow Mako3 + XT Glow Nova!' },
    { number: 9, par: 3, distance: 206, hint: '206 ft Par 3 · ★ 11/23 DOUBLE PAR: Cotton Candy DX Glow Roc + XT Glow Nova!' },
    { number: 10, par: 3, distance: 294, hint: '294 ft Par 3 · ★ 11/23 3RD STRAIGHT PAR: Cotton Candy Star Rollo + Halloween Star Sync 10ft closer!' },
    { number: 11, par: 3, distance: 221, hint: '221 ft Downhill Par 3 · Proto Glow Mako3 straight past early tree + Proto Glow Aviar around obstacle.' },
    { number: 12, par: 3, distance: 252, hint: '252 ft Wooded Par 3 · Star Roadrunner / Glow Teebird center gap (11/23 Pink DX Alien UFO tree-dodge scramble!).' },
    { number: 13, par: 3, distance: 105, hint: '105 ft Tight Trees (Shortest Ace Run!) · ★ 11/23 NEAR-BIRDIE PAR: Halloween Star Sync threaded every tree & grazed basket top!' },
    { number: 14, par: 3, distance: 185, hint: '185 ft Par 3 · Proto Glow Mako3 straight (watch late release right) + Proto Glow Aviar.' },
    { number: 15, par: 3, distance: 237, hint: '237 ft Downhill Par 3 · ★ 11/23 DOUBLE PAR: Cotton Candy Star Rollo flipped & bombed 237+ ft to blue pin + XT Glow Nova!' },
    { number: 16, par: 3, distance: 260, hint: '260 ft Par 3 · Proto Glow Mako3 / Star Rollo + XT Glow Nova (watch high nose-up pulls left).' },
    { number: 17, par: 3, distance: 201, hint: '201 ft Dogleg Right (2nd Shortest!) · ★ 11/23 BIRDIE 2: Cotton Candy Star Rollo flip-up ("IT DID IT! Rollo is my disc!")!' },
    { number: 18, par: 3, distance: 178, hint: '178 ft Uphill Closer · ★ 11/23 CLUTCH PAR (65 PB TIE!): Cotton Candy Star Rollo uphill + XT Glow Nova!' }
  ]
};

const HERITAGE_PARK_COURSE: CourseTemplate = {
  key: 'heritage_park',
  name: 'Heritage Park DGC',
  location: 'Olathe, KS (All Silver / A Baskets · Flat Wooded Park · Par 54 · 4,915 ft)',
  totalHoles: 18,
  updatedAt: 1795638381854,
  holes: [
    { number: 1, par: 3, distance: 330, hint: 'Pin 1A · 330 ft Straight Tree Gap · Thread Star Roadrunner straight through opener trees (warm-up basket near tee; no next-tee arrows on course—use map!).' },
    { number: 2, par: 3, distance: 304, hint: 'Pin 2A · 304 ft Slight Left · ★ 11/25 1ST HERITAGE PAR: Luster Firebird hyzer into fairway avoiding deep grass + Proto Glow Mako3 10ft left!' },
    { number: 3, par: 3, distance: 316, hint: 'Pin 3A · 316 ft Flat Tree Fairway (Bench & Trash Can) · Glow Leopard3 straight tee + low XT Glow Nova approach (bring retriever tool for trees!).' },
    { number: 4, par: 3, distance: 240, hint: 'Pin 4A · 240 ft Open-to-Woods Pin · Keep Glow Leopard3 flat and straight so it doesn\'t fade left early; ignore yellow pin ahead.' },
    { number: 5, par: 3, distance: 219, hint: 'Pin 5A · 219 ft Wooded Left Turn · Clear front trees off tee (watch pulling Glow Teebird too far left) + Proto Glow Mako3 straight drop.' },
    { number: 6, par: 3, distance: 264, hint: 'Pin 6A · 264 ft Guarded Tree Fairway · Hot Pink Archangel off tee + DX Glow Roc around tree + Pink DX Alien pin pitch.' },
    { number: 7, par: 3, distance: 323, hint: 'Pin 7A · 323 ft Open Power Runway · 🚀 11/25 HALO DESTROYER DEBUT ("Beauty! Right angle!") & Halo Wraith out into the open; keep hip turning on Mako3!' },
    { number: 8, par: 3, distance: 328, hint: 'Pin 8A · 328 ft Wooded Dogleg Right · Pin sits right — Star Rollo flip-up to bend right past guardian trunks!' },
    { number: 9, par: 3, distance: 210, hint: 'Pin 9A · 210 ft Shorter Fairway · Halo Wraith ("Way better—that\'s what I wanted!") + firm XT Glow Nova upshot (don\'t leave approach short!).' },
    { number: 10, par: 3, distance: 243, hint: 'Pin 10A · 243 ft Single-Tree Corridor · Clean gap past the main guardian trunk; starts your 33 (+6) Back-9 surge!' },
    { number: 11, par: 3, distance: 278, hint: 'Pin 11A · 278 ft Wide-Space Tree Gap · ★ 11/25 PAR 3: Star Rollo threaded the tiniest gap of trees for clutch Back-9 Par!' },
    { number: 12, par: 3, distance: 296, hint: 'Pin 12A · 296 ft Flip-Skip Fairway · ★ 11/25 BACK-TO-BACK PAR 3: Forward tree-skip flip + Pink DX Alien (commit firmly—you won\'t overshoot!).' },
    { number: 13, par: 3, distance: 229, hint: 'Pin 13B · 229 ft Blind Tree Pin · Watch tee sign angle (basket hides further than sign looks!) — DX Glow Roc + Pink DX Alien + XT Glow Nova.' },
    { number: 14, par: 3, distance: 299, hint: 'Pin 14A · 299 ft Straight Runway · ★ 11/25 3RD BACK-9 PAR & FORM BREAKTHROUGH: Release at 90° (not late 110°!) → parked 10ft left!' },
    { number: 15, par: 3, distance: 262, hint: 'Pin 15A · 262 ft Right-Turning Pin · Star Roadrunner off tee + forehand upshot turning cleanly right (check "any discs left?" after green!).' },
    { number: 16, par: 3, distance: 301, hint: 'Pin 16A · 301 ft Pretty Open-to-Bushes Green · Clear the bushes around green — Pink DX Alien + Yeti Pro Aviar bush scramble.' },
    { number: 17, par: 3, distance: 228, hint: 'Pin 17A · 228 ft High-Branch Chute · Watch branches 20ft overhead on Star Rollo flip line; ★ 11/25 Jack beauty Par 3!' },
    { number: 18, par: 3, distance: 245, hint: 'Pin 18A · 245 ft Tree-Lined Closer · Keep Glow Leopard3 under tee branches for exact pin-high distance (0 five-scores on entire Back 9!).' }
  ]
};

const SHAWNEE_MISSION_WOODED_COURSE: CourseTemplate = {
  key: 'smp_wooded',
  name: 'Shawnee Mission Wooded',
  location: 'Shawnee, KS (18 Holes · Par 54 · 4,881 ft)',
  totalHoles: 18,
  holes: [
    { number: 1, par: 3, distance: 260, hint: '260 ft Slight Left · Water right near tee — keep Roadrunner / Halo IT level off the tee + Roc3/Nova approach.' },
    { number: 2, par: 3, distance: 177, hint: '177 ft Tight Wooded Tunnel (Mando Logs) · ★ 11/17 PAR: Star Sync skip past Mando logs or Glow Mako3 dead-level.' },
    { number: 3, par: 3, distance: 187, hint: '187 ft Wooded Gap · ★ PAR LOCK: 168g Roadrunner (<5ft kick 11/17!) or DX Archangel (11/10) through trees.' },
    { number: 4, par: 3, distance: 305, hint: '305 ft Wooded Corridor (Renner Rd) · Roadrunner/Mako3 straight off tee + XT Glow Nova approach.' },
    { number: 5, par: 3, distance: 208, hint: '208 ft Dogleg Right · ★ 11/17 BIRDIE 2: 172g Star Rollo glided right under the basket for tap-in Birdie!' },
    { number: 6, par: 3, distance: 187, hint: '187 ft Wooded Pocket · ★ 11/10 PAR LOCK: 170g Halo Star IT placement + Star Sync clutch putt!' },
    { number: 7, par: 3, distance: 355, hint: '355 ft Low-Ceiling Fairway (White Basket) · Classic Glow Wraith flat low drive + committed Mako3/Alien approach.' },
    { number: 8, par: 3, distance: 302, hint: '302 ft Open-to-Left Finish · Classic Glow Wraith straight 150+ ft drive + commit firmly on 2nd shot!' },
    { number: 9, par: 3, distance: 375, hint: '375 ft Wooded S-Curve (Short Tee Pad Available · Blue Pin Only!) · Wraith 180+ ft drive + XT Glow Nova.' },
    { number: 10, par: 3, distance: 248, hint: '248 ft Downhill Dogleg Left (Blue Basket Only — No White Pin!) · Beat early guardian tree w/ Roc3 + Nova.' },
    { number: 11, par: 3, distance: 444, hint: '444 ft Monster Par 3 · Keep nose down out of tree chute in wind, then rip Mako3 + Star Jay into Circle 1.' },
    { number: 12, par: 3, distance: 223, hint: '223 ft Uphill Slight Right (Street OB Left!) · ★ 2× PAR LOCK (11/10 & 11/17): Star Rollo uphill + XT Glow Nova!' },
    { number: 13, par: 3, distance: 277, hint: '277 ft Scenic Downhill Straight · Glow Mako3 dead-flat laser; commit chest-high so throws don\'t worm-burn low.' },
    { number: 14, par: 3, distance: 243, hint: '243 ft Dogleg Left Woods · Champion Eagle / Archangel left lane + XT Glow Nova approach.' },
    { number: 15, par: 3, distance: 189, hint: '189 ft Straight Corridor · ★ 2× PAR LOCK: Star Sync dead-straight to 20ft (11/17) or Star Jay glide loop (11/10)!' },
    { number: 16, par: 3, distance: 338, hint: '338 ft Steep Uphill Woods · 172g Star Rollo aimed at center tree + uphill Rollo climb right to 5ft!' },
    { number: 17, par: 3, distance: 214, hint: '214 ft Wind-Exposed Slight Left · Keep tee low in headwind + low-glide Alien/Nova approach (Sync can roll in wind).' },
    { number: 18, par: 3, distance: 347, hint: '347 ft Dogleg Right Closer · Classic Glow Wraith dead-straight bomb (or Star Rollo right) + Pink DX Alien!' }
  ]
};

const BLUE_VALLEY_PRAIRIE_PASS_COURSE: CourseTemplate = {
  key: 'prairie_pass',
  name: 'Blue Valley "Prairie Pass" DG Course',
  location: 'Overland Park, KS (Pleasant Ridge MS · Standard 18 · Par 54 · 4,209 ft)',
  totalHoles: 18,
  updatedAt: 1763242800000,
  holes: [
    { number: 1, par: 3, distance: 216, hint: '216 ft Standard Opener · Hill slope left & OB line — aim straight down center, avoid uphill comebackers.' },
    { number: 2, par: 3, distance: 218, hint: '218 ft Short Pin (Standard Tee vs 282ft Adv) · ★ 11/15 PAR LOCK: Star Rollo tee + parked approach right under pin!' },
    { number: 3, par: 3, distance: 232, hint: '232 ft Straight Downhill Green · ★ 11/15 DOUBLE PAR: ~192ft Mako3 drive (watch downhill roll-aways!) & Jack 15ft Par!' },
    { number: 4, par: 3, distance: 236, hint: '236 ft Straight Tree-Framed Lane · ★ 11/15 DOUBLE PAR: 200ft "box-cutter" Roadrunner drive & Jack beauty shot!' },
    { number: 5, par: 3, distance: 270, hint: '270 ft Tree-Gap Fairway · Keep nose down off tee so you clear the right-side tree line.' },
    { number: 6, par: 3, distance: 215, hint: '215 ft Park Fairway (Storm Drain Hazard) · Keep tee shot up & centered away from the left storm gutter.' },
    { number: 7, par: 3, distance: 195, hint: '195 ft Dense Woods (Hanging Tire #1) · Tight scary wooded corridor — commit to a flat straight Mako3/Sync line.' },
    { number: 8, par: 3, distance: 202, hint: '202 ft Tree-Bend to Low-Canopy Pin · ★ 11/15 ARCHANGEL GEM: Parked pin-high 10ft left ("Like an angel! Permanent keep!")!' },
    { number: 9, par: 3, distance: 195, hint: '195 ft Straight Woods Chute (By Night Lights) · Must hit the straight center gap past the 50ft guardian trunks.' },
    { number: 10, par: 3, distance: 235, hint: '235 ft Slight Downhill Glide · ★ 11/15 PAR LOCK: "10 out of 10" Star Rollo tee; careful of 15ft downhill green roll-aways!' },
    { number: 11, par: 3, distance: 252, hint: '252 ft Woods-to-Elevated Mound Pin (Thorns) · Star Rollo wrap + XT Glow Nova stop-and-drop right on top of the mound!' },
    { number: 12, par: 3, distance: 193, hint: '193 ft Shortest Straight Woods Tunnel · ★ 11/15 PAR LOCK: DX Archangel / Mako3 straight through the branches!' },
    { number: 13, par: 3, distance: 298, hint: '298 ft Longest Hole on Standard Layout · Roadrunner/Wraith flat chest-pull + DX Alien straight approach (bushes behind).' },
    { number: 14, par: 3, distance: 197, hint: '197 ft Woods Pocket (Hanging Tire #2 & Thorns) · ★ 11/15 DOUBLE PAR: Clear early trees, watch tire & thorns near green!' },
    { number: 15, par: 3, distance: 242, hint: '242 ft Open Slight-Left Pin · Watch low afternoon sun in eyes; hyzer finish prevents green roll-away.' },
    { number: 16, par: 3, distance: 270, hint: '270 ft Steep Downhill Danger Pin · ★ 11/15 PAR LOCK: Wraith straight bomb + XT Glow Nova stop-and-drop on scary slope!' },
    { number: 17, par: 3, distance: 282, hint: '282 ft Long Straight Prairie Lane · 2nd longest hole — commit to Roadrunner/Wraith flat drive + level approach.' },
    { number: 18, par: 3, distance: 260, hint: '260 ft Guardian-Tree Closer (Near H1) · Shape around guardian tree; use XT Glow Nova on approach so it doesn\'t roll long.' }
  ]
};

const JACKS_BACKYARD_COURSE: CourseTemplate = {
  key: 'backyard_bray',
  name: "Jack's Backyard Course",
  location: "Grandma & Grandpa's · Bray 9-Hole Course (Laundry Baskets on Tomato Cages · Par 27 · 1,224 ft)",
  totalHoles: 9,
  updatedAt: 1795727400002,
  holes: [
    { number: 1, par: 3, distance: 128, hint: '128 ft Yard Opener · Watch the house (and Cheech/GG sneaking outside!) — smooth Proto Glow Mako3 or Star Rollo.' },
    { number: 2, par: 3, distance: 160, hint: '160 ft Up by Grandpa\'s Shed (Pond Hazard!) · Avoid the mosquito pond left — towel in Grandpa\'s shed if wet!' },
    { number: 3, par: 3, distance: 135, hint: '135 ft Back Yard by Chicken Coop & Pool Cover · Watch rooster, pool cover & duck pan; tiny no-chain basket!' },
    { number: 4, par: 3, distance: 130, hint: '130 ft Little Island After the Deck (Roof Hazard!) · Keep Proto Glow Mako3 low & straight off the deck to avoid the roof!' },
    { number: 5, par: 3, distance: 135, hint: '135 ft Upper Yard Laundry Basket · Smooth touch putt onto tomato-cage laundry basket (no chains — sit soft!).' },
    { number: 6, par: 3, distance: 140, hint: '140 ft Down-Yard Approach · Watch lone guardian tree & pool edge; ★ 11/26 Jack Birdie 2 hole!' },
    { number: 7, par: 3, distance: 130, hint: '130 ft Fire Pit to Treehouse · ★ 11/26 Mako3 Birdie 2! Slice-the-box chest-high hip swing straight between fire pit & treehouse.' },
    { number: 8, par: 3, distance: 135, hint: '135 ft Past House & Left Water Pool · Keep disc right of the left water pool and clear of windows.' },
    { number: 9, par: 3, distance: 131, hint: '131 ft Backyard Closer · ★ 11/26 Star Rollo Birdie 2! Controlled touch carry to close under par.' }
  ]
};

export const INITIAL_COURSE_TEMPLATES: CourseTemplate[] = [
  ...(typedV65.courses || [])
    .map((c) => {
      if (c.key === 'blackhoof_18') return BLACK_HOOF_18_COURSE;
      if (c.key === 'smp_wooded') return SHAWNEE_MISSION_WOODED_COURSE;
      if (c.key === 'mize') {
        return {
          ...c,
          updatedAt: 1795809970733,
          holes: c.holes.map((h) => {
            const mizeIntel: Record<number, string> = {
              1: '218 ft (NEW FIELD FENCE ADDED 11/27!) · Hot Pink Archangel / Halo Wraith straight inside fence (watch Rollo flipping right over fence!) + XT Glow Nova.',
              2: '264 ft Straight Park Lane · ★ 11/27 DOUBLE PAR: Halo Wraith chest-level ~220ft + XT Glow Nova!',
              3: '294 ft Open-to-Green · Drive ~250ft + Pink DX Alien Circle-1 approach!',
              4: '296 ft Long Field Lane · Halo Wraith + DX Glow Roc / Pink DX Alien (almost birdied Bonus H4!).',
              5: '296 ft Baseball Backstop Corner · ★ 11/27 PAR: Halo Wraith fades back inside fence + DX Glow Roc hyzer over backstop!',
              6: '310 ft Right-Curve Tree Gap · Star Rollo turnover + Halloween Star Sync pin-run (hit pin 11/27!).',
              7: '324 ft Guarded Tree Fairway · ★ 11/27 CLUTCH PAR: Luster Firebird threaded trees + XT Glow Nova 40ft save!',
              8: '235 ft Post-Side Tee · Watch tee post on follow-through; Halo Wraith smooth straight-left fade.',
              9: '389 ft Longest Mize Closer · Glow Leopard3 flat-to-left or Halo Wraith open power drive.'
            };
            return mizeIntel[h.number] ? { ...h, hint: mizeIntel[h.number] } : h;
          })
        };
      }
      return c;
    })
    .filter((c) => c.key !== 'heritage_park' && c.key !== 'prairie_pass' && c.key !== 'backyard_bray'),
  HERITAGE_PARK_COURSE,
  BLUE_VALLEY_PRAIRIE_PASS_COURSE,
  JACKS_BACKYARD_COURSE
];

const ROUND_2026_11_01_BLACK_HOOF: HistoricalRound = {
  id: 1762030800002,
  courseName: 'Black Hoof Flying Disc',
  totalHoles: 9,
  date: '2026-11-01',
  duration: '00:34:20',
  par: 27,
  windCondition: 'cross_rl',
  gameMode: 'stroke',
  notes:
    'Sunday 27-Hole Adventure (Part 2 after 18 at Cedar Ridge) — DOUBLE PERSONAL BESTS! Jeffery 30 (+3, 6 Pars including 5 straight to open H1–H5!) & Jack 37 (+10, 2 Pars on H3 & H7!).',
  roundTranscript: `Black Hoof Flying Disc 9-Hole Sunday Afternoon Round (2026-11-01, Part 2 of 27-Hole Sunday Adventure after Cedar Ridge 18) — Jeffery 30 (+3, 🏆 NEW COURSE PERSONAL BEST by 3 strokes! 6 Pars!) & Jack 37 (+10, 🏆 NEW COURSE PERSONAL BEST! 2 Pars!).
Stopped at Black Hoof 9 right after battling the heavy woods at Cedar Ridge and caught fire on the open meadow & wooded creek holes (Note: Beast & Alien trading cards are ready in the Bag Lab while the physical discs are still in transit in the mail; all 11/01 shots were thrown with in-hand bag discs):
- Hole 1 (199ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Chatted with Jack about life goals ("Playing disc golf and working!") and Halloween haunted houses while the app was stuck on Cedar Ridge Hole 18. Threw 170g DX Archangel off the tee and parked 175g KC Pro Aviar right under the basket for an opening Par 3!
- Hole 2 (209ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Open uphill fairway ("So much nicer playing here in the open, no trees!"). Threw 170g DX Archangel & 168g GStar Leopard3 off the tee, then fired a laser 175g KC Pro Aviar uphill approach that nearly went in for birdie ("I threw a KC Aviar out here, that was insane... Whoa, I thought that was gonna birdie it!") for back-to-back Par 3s!
- Hole 3 (201ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). Jack carved a gorgeous S-curve with his 170g Discraft Cicada ("Jack's is this beautiful S-curve that he gets on his Cicada!"). Jeffery fired a 40-foot jump putt with 175g Star Aviar in a slight right-to-left breeze that smacked the metal pan ("I hit the pan, dude, 40 feet out!")—both Jeffery & Jack locked in clean Par 3s!
- Hole 4 (225ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Threw a nice turnover drive with 170g DX Archangel ("Not bad, turnover, right?"), shaped 175g Star Aviar around a guardian tree, and drained a clutch ~25-foot Par 3 putt (measured out with Jack's 5-yard stride count: "5, 10, 15, 20, 25—about 25 feet!") for 4 straight Pars!
- Hole 5 (184ft, Par 3): Jeffery 3 (Par ★) | Jack 5. Right-turning dogleg into the woods ("It's the one that goes to the right, I might need to Rollo it"). Threw 172g Star Rollo off the tee ("In a tree, but it was going right like it should! We've got our straight shots down"), approached with 175g XT Glow Nova ("I feel like I want to throw the Nova... Good!"), and dropped the Nova in for a 5th consecutive Par 3 (Even Par through 5 holes!)!
- Hole 6 (180ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Pulled 172g Star Rollo again off the tee—both Jeffery and Jack hit the exact same guardian tree! Scrambled with 175g XT Glow Nova and both carded Bogey 4s.
- Hole 7 (169ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). Fired 176g Glow Mako3 off the tee (got a friendly kick off a right-side tree back into the lane) and both Jeffery & Jack converted clean Par 3s ("Hole number 7: we both got 3s!").
- Hole 8 (197ft, Par 3): Jeffery 4 (Bogey) | Jack 6. Played Rock-Paper-Scissors on the tee (Jack's paper covered rock). Tested 175g Champion Eagle off the tee (tree stopped its left fade near the lake view) and approached/putted with 175g XT Glow Nova in rising wind for Bogey 4.
- Hole 9 (206ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Launched 152g Star Mamba (and tested 168g GStar Leopard3) off the tee into the guardian trees, then threw an awesome overhand tomahawk over the tree with 175g XT Glow Nova ("I'm launching this Nova over it, tomahawking it... Oh, good!") for Bogey 4 alongside Jack's 4—capping off a 27-hole Sunday adventure with a new Black Hoof PB 30 (+3) and Jack's 37 (+10)!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 30 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 37 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 199,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Threw 170g DX Archangel off the tee and parked 175g KC Pro Aviar right under the pin for an opening Par 3! Jack took a 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          scenarioUsed: 'calm',
          voiceNote: 'DX Archangel tee shot + KC Pro Aviar parked under basket for Par 3!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          voiceNote: 'Opened with Bogey 4'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 209,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Open uphill meadow ("So much nicer playing here in the open!"). Threw DX Archangel / Leopard3 off the tee, then fired a laser 175g KC Pro Aviar uphill drive/approach that nearly went in for birdie ("Whoa, I thought that was gonna birdie it!") for Par 3! Jack carded a 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'KC Pro Aviar',
          thrownDiscId: 'innova-kc-pro-aviar',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          scenarioUsed: 'calm',
          voiceNote: 'Archangel tee + insane KC Pro Aviar uphill approach that nearly birdied for Par 3!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          voiceNote: 'Uphill Bogey 4'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 201,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Jack threw a gorgeous S-curve with his Discraft Cicada ("Jack\'s is this beautiful S-curve that he gets on his Cicada!"). Jeffery fired a 40-foot Star Aviar jump putt in a left breeze that smacked the metal pan ("I hit the pan, dude, 40 feet out!")—both Jeffery & Jack got Par 3s!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-aviar' },
            { shotType: 'putt', discId: 'innova-aviar' }
          ],
          discUsed: 'Aviar',
          thrownDiscId: 'innova-aviar',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          scenarioUsed: 'cross_rl',
          voiceNote: '40ft Star Aviar jump putt hit the metal pan for a tap-in Par 3 (3 straight Pars)!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Beautiful S-curve with Discraft Cicada + clean Par 3!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 225,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Nice turnover drive with 170g DX Archangel, curved 175g Star Aviar around a guardian tree, and drained a ~25-foot Par 3 putt (measured with Jack\'s 5-yard stride count: "5, 10, 15, 20, 25!")! Jack got a 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-aviar' },
            { shotType: 'putt', discId: 'innova-aviar' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 25,
          scenarioUsed: 'calm',
          voiceNote: 'DX Archangel turnover + Star Aviar tree bend + drained 25ft Par 3 putt (4 straight Pars)!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          voiceNote: 'Measured 25ft putt with 5-yard stride count; Bogey 4'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 184,
      scores: { jeffery: 3, jack: 5 },
      voiceTranscript:
        'Right-turning hole ("It\'s the one that goes to the right, I might need to Rollo it"). Threw 172g Star Rollo turning right as designed, stuck 175g XT Glow Nova on approach, and dropped the Nova in for a 5th consecutive Par 3! Jack got a 5.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          scenarioUsed: 'calm',
          voiceNote: 'Star Rollo right-turning tee shot + XT Glow Nova approach & putt for 5th straight Par 3!'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 180,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Threw 172g Star Rollo off the tee—both Jeffery and Jack hit the exact same guardian tree! Scrambled with 175g XT Glow Nova and both carded Bogey 4s.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Both hit the same guardian tree off the tee; XT Glow Nova scramble for Bogey 4'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss',
          voiceNote: 'Hit same tree off tee; tied hole with Bogey 4'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 169,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Threw 176g Glow Mako3 off the tee (got a friendly kick off a tree on the right back into the fairway) and both Jeffery & Jack converted clean Par 3s ("Hole number 7: we both got 3s!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          scenarioUsed: 'calm',
          voiceNote: '176g Glow Mako3 tee shot + clean Par 3 (6th Par of the round!)'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Crushed tee shot + clean Par 3!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 197,
      scores: { jeffery: 4, jack: 6 },
      voiceTranscript:
        'Played Rock-Paper-Scissors on the tee. Tested 175g Champion Eagle off the tee (tree stopped its left fade near the lake view) and approached/putted with 175g XT Glow Nova in rising wind for Bogey 4. Jack got a 6.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-champion-eagle' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'Champion Eagle',
          thrownDiscId: 'innova-champion-eagle',
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'Tested 175g Champion Eagle off tee + XT Glow Nova approach in rising breeze for 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 206,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Launched 152g Star Mamba (and tested 168g GStar Leopard3) off the tee into the trees, then threw a clutch overhand tomahawk over the tree with 175g XT Glow Nova ("I\'m launching this Nova over it, tomahawking it... Oh, good!") for Bogey 4 alongside Jack\'s 4—finishing with a NEW BLACK HOOF PB 30 (+3) and Jack\'s 37 (+10)!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'XT Glow Nova',
          thrownDiscId: 'innova-xt-glow-nova',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Mamba tee + clutch XT Glow Nova tomahawk over the guardian tree for 4 (New Course PB 30, +3!)'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true,
          voiceNote: 'Curved around the tree + Bogey 4 for a New Course PB 37 (+10)!'
        }
      }
    }
  ]
};

const ROUND_2026_11_01_CEDAR_RIDGE: HistoricalRound = {
  id: 1762016400001,
  courseName: 'Cedar Ridge',
  totalHoles: 18,
  date: '2026-11-01',
  duration: '01:48:00',
  par: 58,
  windCondition: 'calm',
  gameMode: 'stroke',
  notes:
    'First Recorded 18-Hole Round at Cedar Ridge (5,344 ft, Par 58) — Jeffery 86 (+28, 3 Pars on H12, H14 & 613ft Par-4 H16 + 5-Driver Field Test!) & Jack 92 (+34, Par 3 on H13 & 5 Skins Won!).',
  roundTranscript: `Cedar Ridge 18-Hole Sunday Adventure Round (2026-11-01, Part 1 of 27-Hole Day, Bonner Springs, KS — 5,344 ft, Par 58) — Jeffery 86 (+28, First Round Course Benchmark · 3 Pars including 613ft Hole #16!) & Jack 92 (+34, First Round Course Benchmark · Par 3 on Hole #13 & won skins on H2, H10, H11, H13 & H15!).
Heavily wooded, hilly 18-hole championship battle ("Why aren't the trees the baskets?!") featuring the Telescoping Dynamic Discs Retriever saving discs from thorns, a Glow Mako3 flashlight demo, and a 5-Driver Field Test after Hole 16 (Note: Beast & Alien trading cards are ready in the Bag Lab while the physical discs are still in transit in the mail; any voice-to-text words resembling Beast/Alien were misheard from Roadrunner/Archangel/Aviar):
- Hole 1 (261ft, Par 3): Jeffery 5 | Jack 6. Opened the 18-hole trek at Cedar Ridge (Roadrunner caddie callout).
- Hole 2 (289ft, Par 3): Jeffery 7 | Jack 6. Jack took an early skin on the 289ft wooded second hole!
- Hole 3 (283ft, Par 3): Jeffery 5 | Jack 7. Voice log started here ("Uphill baby, I need to go straight"). Threw 168g GStar Leopard3 off the tee (pulled into left woods), pitched out to safety with 174g DX Roc3, and threw a point-and-shoot 175g XT Glow Nova right under the basket ("Point and shoot with the Nova... Right there under the basket!") for 5.
- Hole 4 (392ft, Par 4): Jeffery 6 | Jack 6. 392ft Par 4 wrapping around the swampy water ("It's a swamp down there dude... I don't even want to risk it with that dirty water"). Both played smart through the trees across the bridge to the white pin with 176g Glow Mako3, 174g DX Roc3, and 175g Star Aviar for matching 6s.
- Hole 5 (243ft, Par 3): Jeffery 5 | Jack 5. Scary tight wooded gap ("This is a scary one, dude"). Threw 176g Glow Mako3 (high right into a tree), scrambled with 175g Champion Eagle, and parked 175g XT Glow Nova ("My Nova, why not? Good!") for 5 alongside Jack's 5.
- Hole 6 (456ft, Par 4): Jeffery 5 | Jack 5. 456ft wooded tunnel Par 4 ("One of those tunnel shots"). Fired 168g GStar Roadrunner off the tee, followed with 176g Glow Mako3 down the lane, and finished with 175g KC Pro Aviar at the white basket for Bogey 5 (tied with Jack's 5!).
- Hole 7 (270ft, Par 3): Jeffery 4 | Jack 5. Piped 168g GStar Roadrunner straight off the tee ("At least it's there, straight, didn't go too far left!"), walked through the fence opening, and curved 175g Star Aviar / Star Toro / XT Glow Nova down to the left pin for Bogey 4.
- Hole 8 (301ft, Par 3): Jeffery 4 | Jack 5. Steep hilly hole curving left ("Goodness, hilly... Right down to the left"). Launched 152g Star Mamba off the tee (caught briefly in a tree before rolling down the hill), pitched through the guardian trees, and hit the top of the basket on the par try for Bogey 4.
- Hole 9 (207ft, Par 3): Jeffery 5 | Jack 6. Uphill tree gauntlet ("They hit a tiny, tiny, tiny tree, not even an inch wide... the trees should just be the baskets!"). Threw a nice straight 168g GStar Roadrunner off the tee and 180g Star Jay on the 2nd shot, finishing the Front 9 at 46 (Jack 51).
- Hole 10 (147ft, Par 3): Jeffery 5 | Jack 4. Pretty 147ft downhill "ace hole". Jack parked his tee shot 10 feet off the line and beat Jeffery 4 to 5 ("I got a 5, you beat me!") as Jeffery threw 180g Star Jay and 175g KC Pro Aviar / Star Aviar through the trees.
- Hole 11 (228ft, Par 3): Jeffery 5 | Jack 4. "100,000 trees on this hole" requiring a right turn. Threw 172g Star Rollo off the tee ("Felt good going out straight, didn't go too far left, went a hint to the right"), followed with 175g Star Toro and 175g XT Glow Nova (rolled back down the hill off the same tree) for 5 while Jack carded another 4 ("You're gonna beat me, dude!").
- Hole 12 (138ft, Par 3): Jeffery 3 (Par ★) | Jack 4. 138ft short technical hole. Threw 175g Star Sync off the tee (clipped a tree 2ft ahead), then fired a clutch 175g Star Aviar recovery and locked in his first Par 3 of the round!
- Hole 13 (234ft, Par 3): Jeffery 4 | Jack 3 (Par ★). 234ft split lane ("I can either go right or left, 234"). Jeffery threw 152g Star Mamba off the tee and 175g XT Glow Nova onto the Circle 1 hill for 4, while Jack drained a clean Par 3 ("You parred it? Good job, dude!").
- Hole 14 (258ft, Par 3): Jeffery 3 (Par ★) | Jack 5. 258ft wooded corridor. Jeffery laced 168g GStar Roadrunner cleanly without touching a single tree ("Hey, I didn't hit one tree! Not a bad throw though") and converted his 2nd Par 3 of the Back 9!
- Hole 15 (189ft, Par 3): Jeffery 5 | Jack 4. Showed Jack how the 176g Glow Mako3 glows with a flashlight! Tested 168g GStar Roadrunner, 175g Champion Eagle, and 176g Glow Mako3 ("Roadrunner was the best out of those three"), tried a tomahawk, and finished with 175g KC Pro Aviar for 5 while Jack won the hole with a 4.
- Hole 16 (613ft, Par 4): Jeffery 4 (Par ★) | Jack 5. Monster 613-foot Par 4 to the blue basket! Used the Telescoping Dynamic Discs Retriever ("My little grabber's come in handy on this!") to rescue discs from the thorny barbed-wire brush, approached with 175g XT Glow Nova, and carded a massive Par 4!
  * Post-Hole 16 5-Driver Field Test (150–200 ft Open Fairway): Threw Champion Eagle, GStar Roadrunner, Star Mamba, GStar Leopard3, and DX Archangel side-by-side:
    - Left-to-Right & Distance Spread: 1st on left = Champion Eagle; 5ft right = GStar Roadrunner; 1ft up & left = Star Mamba; 5ft farther ahead & barely right = GStar Leopard3; Farthest distance & 20ft right = 170g DX Archangel ("Archangel is the furthest over to the right, and slightly farther than the Leopard!").
- Hole 17 (503ft, Par 4): Jeffery 6 | Jack 7. Narrow 20-foot-wide 503ft wooded tunnel. Threw 170g DX Archangel off the tee (clipped a tree but dropped straight in the center), followed with 176g Glow Mako3 down the gap for 6 (Jack 7).
- Hole 18 (332ft, Par 3): Jeffery 5 | Jack 5. 332ft closing hole with the basket tucked right. Threw 170g DX Archangel off the tee, scrambled with 175g Star Toro and 172g Star Rollo under the trees, pitched over the canopy with 175g KC Pro Aviar to 10–15ft, and had the putt bounce out for 5 alongside Jack's 5 to finish at 86 (+28) and 92 (+34)!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 86 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 92 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 261,
      scores: { jeffery: 5, jack: 6 },
      voiceTranscript:
        'Hole 1 (261ft, Par 3): Caddie recommended Roadrunner off the tee; Jeffery opened with 5 and Jack carded 6.',
      meta: {
        jeffery: {
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          scenarioUsed: 'calm',
          voiceNote: '261ft Cedar Ridge opener — Roadrunner caddie callout (5)'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 289,
      scores: { jeffery: 7, jack: 6 },
      voiceTranscript:
        'Hole 2 (289ft, Par 3): Tight wooded fairway where Jack took the early hole skin 6 to 7.',
      meta: {
        jeffery: {
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          scenarioUsed: 'calm'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          voiceNote: 'Won Hole #2 skin (6 vs. 7)!'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 283,
      scores: { jeffery: 5, jack: 7 },
      voiceTranscript:
        'Uphill 283ft fairway ("Uphill baby, I need to go straight"). Threw 168g GStar Leopard3 off the tee into the left woods, pitched out with 174g DX Roc3, and threw a point-and-shoot 175g XT Glow Nova right under the basket ("Point and shoot with the Nova... Right there under the basket!") for 5.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-leopard3' },
            { shotType: 'fairway', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'XT Glow Nova',
          thrownDiscId: 'innova-xt-glow-nova',
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          scenarioUsed: 'calm',
          voiceNote: 'Leopard3 tee + Roc3 pitch-out + point-and-shoot XT Glow Nova right under the basket!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 4,
      par: 4,
      distance: 392,
      scores: { jeffery: 6, jack: 6 },
      voiceTranscript:
        '392ft Par 4 around the swampy water ("It\'s a swamp down there dude... I don\'t even want to risk it with that dirty water"). Played safely through the trees across the bridge to the white pin with 176g Glow Mako3, 174g DX Roc3, and 175g Star Aviar for matching 6s.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'fairway', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-aviar' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          scenarioUsed: 'calm',
          voiceNote: 'Played safe around the swamp water with Glow Mako3, DX Roc3 & Star Aviar (6)'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss',
          voiceNote: 'Avoided swamp water; tied Hole #4 with 6'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 243,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        'Scary tight wooded shot ("This is a scary one, dude"). Threw 176g Glow Mako3 (high right into a tree), scrambled with 175g Champion Eagle, and parked 175g XT Glow Nova ("My Nova, why not? Good!") for 5 alongside Jack\'s 5.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'fairway', discId: 'innova-champion-eagle' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'Champion Eagle',
          thrownDiscId: 'innova-champion-eagle',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Mako3 tee + Champion Eagle scramble + XT Glow Nova approach for 5'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 6,
      par: 4,
      distance: 456,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        '456ft wooded tunnel Par 4 ("One of those tunnel shots"). Threw 168g GStar Roadrunner off the tee, followed with 176g Glow Mako3 down the fairway, and finished with 175g KC Pro Aviar at the white basket for Bogey 5 (tied with Jack\'s 5!).',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'fairway', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Roadrunner tunnel tee + Glow Mako3 fairway + KC Pro Aviar finish for Bogey 5 on 456ft Par 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          voiceNote: 'Strong Bogey 5 on 456ft wooded Par 4'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 270,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Piped 168g GStar Roadrunner straight off the tee ("At least it\'s there, straight, didn\'t go too far left!"), walked through the fence opening, and curved 175g Star Aviar / Star Toro / XT Glow Nova down to the left pin for Bogey 4 (Jack 5).',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-aviar' },
            { shotType: 'putt', discId: 'innova-aviar' }
          ],
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Straight 168g GStar Roadrunner tee drive + left-curving Aviar approach for 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 301,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Hilly 301ft hole curving down to the left ("Goodness, hilly... Right down to the left"). Launched 152g Star Mamba off the tee (dropped out of a tree and rolled down the hill), pitched through the guardian trees, and hit the top of the basket on the par try for Bogey 4 (Jack 5).',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-aviar' },
            { shotType: 'putt', discId: 'innova-aviar' }
          ],
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: '152g Star Mamba tee drive + pitch through trees & basket-top par bid for 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 207,
      scores: { jeffery: 5, jack: 6 },
      voiceTranscript:
        'Uphill tree gauntlet ("They hit a tiny, tiny, tiny tree, not even an inch wide... why aren\'t the trees the baskets?"). Threw a nice straight 168g GStar Roadrunner and 180g Star Jay through the trees for 5 (Jack 6).',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-jay' }
          ],
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          scenarioUsed: 'calm',
          voiceNote: 'Straight GStar Roadrunner + Star Jay through dense uphill guardian trees (5)'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 10,
      par: 3,
      distance: 147,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        'Pretty 147ft downhill "ace hole". Jack parked his drive 10ft off the line and won the hole 4 to 5 ("I got a 5, you beat me!") as Jeffery threw 180g Star Jay and 175g KC Pro Aviar / Star Aviar through the trees.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-jay' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Jay',
          thrownDiscId: 'innova-jay',
          scenarioUsed: 'calm',
          voiceNote: '147ft downhill ace-run hole — Star Jay & KC Pro Aviar through trees (5)'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          voiceNote: 'Crushed tee shot 10ft off the line to win Hole #10 skin with a 4!'
        }
      }
    },
    {
      number: 11,
      par: 3,
      distance: 228,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        '"100,000 trees on this hole" requiring a right turn. Threw 172g Star Rollo off the tee ("Felt good going out straight, didn\'t go too far left, went a hint to the right"), then 175g Star Toro and 175g XT Glow Nova (rolled back down the hill off the same tree) for 5 while Jack carded another 4 ("You\'re gonna beat me, dude!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-toro' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          scenarioUsed: 'calm',
          voiceNote: 'Good straight-to-right Star Rollo tee shot; uphill tree rollback for 5'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss',
          voiceNote: 'Back-to-back skins on Holes #10 & #11 with a 4!'
        }
      }
    },
    {
      number: 12,
      par: 3,
      distance: 138,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '138ft short technical hole. Threw 175g Star Sync off the tee (clipped a tree 2ft ahead), then fired a clutch 175g Star Aviar recovery right to the pin and locked in Par 3! Jack got a 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'approach', discId: 'innova-aviar' },
            { shotType: 'putt', discId: 'innova-aviar' }
          ],
          discUsed: 'Aviar',
          thrownDiscId: 'innova-aviar',
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          scenarioUsed: 'calm',
          voiceNote: 'Star Sync tee + clutch Star Aviar recovery to lock in Par 3!'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          voiceNote: 'Pipe-down-the-middle tee shot for Bogey 4'
        }
      }
    },
    {
      number: 13,
      par: 3,
      distance: 234,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        '234ft split lane ("I can either go right or left, 234"). Jeffery fired 152g Star Mamba off the tee into the left opening and approached with 175g XT Glow Nova onto the C1 hill for 4, while Jack drained a clean Par 3 ("You parred it? Good job, dude!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'XT Glow Nova',
          thrownDiscId: 'innova-xt-glow-nova',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Star Mamba tee + XT Glow Nova approach onto the C1 hill for 4'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Jack Par 3 on 234ft Hole #13 ("You parred it? Good job, dude!")!'
        }
      }
    },
    {
      number: 14,
      par: 3,
      distance: 258,
      scores: { jeffery: 3, jack: 5 },
      voiceTranscript:
        '258ft wooded corridor. Jeffery laced 168g GStar Roadrunner cleanly through the gap without hitting a single tree ("Hey, I didn\'t hit one tree! Not a bad throw though") and converted a clean Par 3! Jack took 5.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: '★ Clean tree-free 168g GStar Roadrunner drive + Par 3 on 258ft Hole #14!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 15,
      par: 3,
      distance: 189,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        '189ft straight hole (showed Jack how the 176g Glow Mako3 glows with a flashlight!). Tested 168g GStar Roadrunner, 175g Champion Eagle, and 176g Glow Mako3 ("Roadrunner was the best out of those three"), tried a tomahawk, and finished with 175g KC Pro Aviar for 5 while Jack won the hole with a 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          scenarioUsed: 'calm',
          voiceNote: 'Tested Roadrunner, Eagle & Glow Mako3 ("Roadrunner was the best out of those three") + KC Pro Aviar (5)'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss',
          voiceNote: 'Dodged the guardian trees to win Hole #15 skin with a 4!'
        }
      }
    },
    {
      number: 16,
      par: 4,
      distance: 613,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Massive 613ft Par 4 to the blue basket! Used the Telescoping Dynamic Discs Retriever ("My little grabber\'s come in handy on this!") around the thorny barbed-wire brush, approached with 175g XT Glow Nova, and locked in a huge Par 4! Followed by a 5-Driver Field Test (Eagle, Roadrunner, Mamba, Leopard3, Archangel) where DX Archangel flew the farthest and 20ft right!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'fairway', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'XT Glow Nova',
          thrownDiscId: 'innova-xt-glow-nova',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: '★ HUGE PAR 4 on 613ft Hole #16 + 5-Driver Field Test (Archangel farthest & +20ft right, Leopard3 #2)!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          voiceNote: 'Strong Bogey 5 on the 613-foot monster Par 4!'
        }
      }
    },
    {
      number: 17,
      par: 4,
      distance: 503,
      scores: { jeffery: 6, jack: 7 },
      voiceTranscript:
        '503ft Par 4 down a scary 20-foot-wide wooded corridor ("20 foot across the whole way down and on the right and left is trees"). Threw 170g DX Archangel off the tee (clipped a tree but stayed straight in the lane), followed with 176g Glow Mako3 for 6 (Jack 7).',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'fairway', discId: 'innova-mako3' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          scenarioUsed: 'calm',
          voiceNote: 'DX Archangel tee shot dropped straight in the 20ft tunnel + Glow Mako3 fairway (6)'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 18,
      par: 3,
      distance: 332,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        '332ft closing hole with the basket tucked to the right. Threw 170g DX Archangel off the tee, scrambled with 175g Star Toro and 172g Star Rollo under the low trees, pitched over the canopy with 175g KC Pro Aviar to 10–15ft, and had the putt bounce out for 5 alongside Jack\'s 5 to finish at 86 (+28) and 92 (+34)!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'fairway', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'KC Pro Aviar',
          thrownDiscId: 'innova-kc-pro-aviar',
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          scenarioUsed: 'calm',
          voiceNote: 'Archangel tee + Toro/Rollo scramble + KC Pro Aviar over the tree to 10–15ft (5)'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          voiceNote: 'Got under all the trees + tied Hole #18 with a 5!'
        }
      }
    }
  ]
};

const ROUND_2026_11_02_SARKO: HistoricalRound = {
  id: 1762110000001,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-02',
  duration: '00:27:38',
  par: 27,
  windCondition: 'headwind',
  gameMode: 'stroke',
  notes:
    'Lunch Duo Round in Sprinkling Rain, Gusty Headwind & Thunder — Jeffery 27 (E, Even Par · Birdie 2 on H3 with Roadrunner & 7 Pars!) & Jack 30 (+3, 🏆 NEW SAR-KO-PAR PERSONAL BEST · 6 Pars including H9 Closer!).',
  roundTranscript: `Sar-Ko-Par Trails Lunch Duo Round in Rain, Gusty Wind & Thunder (2026-11-02, 00:27:38) — Jeffery 27 (E, Even Par · Birdie 2 on Hole #3 with 168g GStar Roadrunner + 7 Pars!) & Jack 30 (+3, 🏆 NEW SAR-KO-PAR PERSONAL BEST · 6 Pars & Hole #9 Skin!).
Played 9 quick lunch holes through sprinkling rain, gusty headwinds, and late-round thunder & lightning warnings:
- Hole 1 (138ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Heavy headwind right at the tee ("Awfully windy, and it's a headwind right at us"). Tested 175g XT Glow Nova off the tee instead of Star Sync ("That was a good straight one, but I wasn't aimed that way... should have tried at 10 o'clock, I was way far right on mine"). Both recovered in the picking-up gusts for opening Par 3s ("Bars!").
- Hole 2 (192ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Considered Jay, Eagle, or Archangel before sticking with trusted 176g Glow Mako3 off the tee ("Mako3 is what I've gone with... Good!"). Approached with 175g KC Pro Aviar (clipped a branch) and locked in back-to-back Par 3s with Jack ("Par, par again!"). Talked about how fun and quick Sar-Ko-Par is with the fall leaves (and spotting a snake a couple weeks ago).
- Hole 3 (162ft, Par 3): Jeffery 2 (Birdie ★) | Jack 4 (Bogey). Caddie suggested Mamba, but since Mamba flew too far into the woods last time, switched to 168g GStar Roadrunner as raindrops picked up ("Says to throw the Mamba, I don't want to throw the Mamba, I went too far last time. A Roadrunner... Good one! Roadrunner was good, yeah!"). Converted Birdie 2 while Jack played safe in the rain for 4!
- Hole 4 (162ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Threw 174g DX Roc3 off the tee ("Could have thrown it further, so yeah, I think it was maybe the Leopard3 is the one I'm supposed to use on this one"). Wind caught the 2nd shot, hit the top of the basket and rolled, saved Par 3. Jack found the path and almost birdied for a clean Par 3!
- Hole 5 (144ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Went with 170g DX Archangel off the tee ("Going with the Archangel... Long birdie... I hit the top again!"). Hit the top of the basket on the long birdie run and tapped in for Par 3 alongside Jack's 4th Par 3 in 5 holes!
- Hole 6 (165ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Threw 175g Champion Eagle off the tee ("Good shot with the Eagle up here, about 10 feet away and to the left"). Tossed 175g KC Pro Aviar as thunder rumbled—bounced out of the basket for Par 3! Jack parked his approach 2 feet from the pin ("Beauty, beauty, Jack, 2 feet away from the pin!") for Par 3.
- Hole 7 (139ft, Par 3): Jeffery 3 (Par) | Jack 4 (Bogey). Stayed under the trees with thunder rolling; tee shot clipped a guardian tree ("Thank God for that tree, Jack!"). Approached with 175g XT Glow Nova right to the edge of Circle 1 ("We can go with our Nova... Good, right there, edge of Circle 1") and drained the putt for Par 3! Jack carded 4.
- Hole 8 (171ft, Par 3): Jeffery 3 (Par) | Jack 4 (Bogey). Threw 152g Star Mamba off the tee ("Hit a slight little branch up there and that threw it all off"). Recovered with a clean approach (noted aiming more left at 10 o'clock next time) for his 7th Par 3 of the round! Jack took 4.
- Hole 9 (141ft, Par 3): Jeffery 4 (Bogey) | Jack 3 (Par ★). Threw 172g Star Rollo off the tee into the wind ("Wind, that was weak"), then threw a downhill test drive with 168g GStar Leopard3 that finished pin-high to the left ("Better Leopard! Leopard was about out there distance to the pin downhill"). Played the real Rollo lie, approach sailed 15–20ft beyond the basket, and finished with Bogey 4 for an Even Par 27 (E) while Jack closed with a clutch Par 3 to set a New Sar-Ko-Par Personal Best of 30 (+3)!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 27 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 30 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Heavy headwind & sprinkling rain. Tested 175g XT Glow Nova off the tee instead of Sync ("That was a good straight one, but I wasn\'t aimed that way... should have tried at 10 o\'clock"). Both recovered in the wind for opening Par 3s ("Bars!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-xt-glow-nova' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'XT Glow Nova',
          thrownDiscId: 'innova-xt-glow-nova',
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'Tested 175g XT Glow Nova in heavy headwind (flew straight right; aim 10 o\'clock) + Par 3'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Clean opening Par 3 in heavy wind!'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Stuck with 176g Glow Mako3 off the tee ("Mako3 is what I\'ve gone with... Good!"). Approached with 175g KC Pro Aviar (clipped a tree branch, got up closer) and saved Par 3 alongside Jack\'s Par 3 ("Par, par again!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: '176g Glow Mako3 tee + 175g KC Pro Aviar approach & Par 3 save'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Back-to-back Par 3s on H1 & H2!'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 2, jack: 4 },
      voiceTranscript:
        'Switched from Mamba (went too far last time) to 168g GStar Roadrunner off the tee as rain picked up ("Roadrunner was good, yeah!") and drained the Birdie 2! Jack played safe for 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: '★ Switched from Mamba to 168g GStar Roadrunner off the tee ("Roadrunner was good!") for Birdie 2!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada',
          voiceNote: 'Played safe in the rain for Bogey 4'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Threw 174g DX Roc3 off the tee ("Could have thrown it further, so yeah, I think it was maybe the Leopard3 I\'m supposed to use on this one"). Wind hit the 2nd shot, hit the top of the basket and rolled, saved Par 3. Jack found the path and almost birdied for Par 3!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: 'DX Roc3 tee (noted Leopard3 for extra carry on H4) + hit basket top & saved Par 3'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Found the path off the tee & nearly birdied for Par 3!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Threw 170g DX Archangel off the tee ("Going with the Archangel... Long birdie... I hit the top again!"). Hit top of basket on the long birdie bid and tapped in for Par 3 alongside Jack\'s Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: '170g DX Archangel tee + long birdie bid hit top of basket for Par 3'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '4th Par 3 in the first 5 holes!'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Parked 175g Champion Eagle 10ft left of the pin ("Good shot with the Eagle up here, about 10 feet away and to the left"). 175g KC Pro Aviar birdie putt bounced out of the basket as thunder rumbled for Par 3. Jack parked his approach 2ft from the pin ("Beauty, beauty, Jack, 2 feet away from the pin!") for Par 3!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-champion-eagle' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Champion Eagle',
          thrownDiscId: 'innova-champion-eagle',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          scenarioUsed: 'headwind',
          voiceNote: 'Parked 175g Champion Eagle 10ft left of pin; KC Pro Aviar birdie putt bounced out for Par 3'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          voiceNote: 'Beauty approach parked 2ft from the pin for Par 3!'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Thunder rumbling; tee shot hit a tree ("Thank God for that tree, Jack!"). Approached with 175g XT Glow Nova right to the edge of Circle 1 ("We can go with our Nova... Good, right there, edge of Circle 1") and drained the C1 putt for Par 3! Jack got 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'XT Glow Nova',
          thrownDiscId: 'innova-xt-glow-nova',
          puttDistance: 'C1',
          puttDistanceFeet: 30,
          scenarioUsed: 'headwind',
          voiceNote: 'Tree kick off tee + clutch 175g XT Glow Nova approach to C1 edge & Par 3 save!'
        },
        jack: {
          discUsed: 'Buzzz SS',
          thrownDiscId: 'discraft-buzzz-ss'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Threw 152g Star Mamba off the tee ("Hit a slight little branch up there and that threw it all off"). Recovered with a good approach (noted aiming more left at 10 o\'clock) to lock in Par 3! Jack took 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          puttDistance: 'C1',
          scenarioUsed: 'headwind',
          voiceNote: '152g Star Mamba clipped tiny high branch + strong scramble for 7th Par 3!'
        },
        jack: {
          discUsed: 'Cicada',
          thrownDiscId: 'discraft-cicada'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        'Threw 172g Star Rollo off the tee into the wind ("Wind, that was weak"), then threw a test drive with 168g GStar Leopard3 that went pin-high downhill to the left ("Better Leopard! Leopard was about out there distance to the pin downhill"). Played real Rollo lie, approach went 15–20ft past the pin for Bogey 4 (Even Par 27 total!) while Jack closed with a clutch Par 3 for a New Course PB 30 (+3)!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          puttDistance: 'C1',
          puttDistanceFeet: 18,
          scenarioUsed: 'headwind',
          voiceNote: 'Star Rollo in wind (test 168g GStar Leopard3 went pin-high downhill!) + Bogey 4 for Even Par 27 (E)'
        },
        jack: {
          discUsed: 'Roach',
          thrownDiscId: 'discraft-roach',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Clutch Par 3 on Hole #9 to seal a NEW SAR-KO-PAR PERSONAL BEST 30 (+3)!'
        }
      }
    }
  ]
};

const ROUND_2026_11_03_SARKO: HistoricalRound = {
  id: 1762196400001,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-03',
  duration: '00:23:20',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  notes:
    'Tuesday Lunch Solo Under-Par Round at Sar-Ko-Par Trails (Corrected from accidental Harmon Park course flip on finalize) — Jeffery 26 (-1, 3 Birdies on H2 w/ Glow Mako3, H4 w/ DX Roc3 & H6 w/ DX Roc3 + Near-Ace Star Sync Approach on H9! Archived lost GStar Leopard3 & brought 170g Halo Star IT back into active bag).',
  roundTranscript: `Sar-Ko-Par Trails Tuesday Lunch Solo Round (2026-11-03, Chilly Calm/Light Breeze, 00:23:20) — Jeffery 26 (-1, 3 Birdies ★ on H2, H4 & H6 + 4 Pars! Reached -3 through 6 holes!).
Corrected course from Harmon & Santa Fe Parks back to Sar-Ko-Par Trails (1,414 ft, Par 27), archived the lost 168g GStar Leopard3, and brought the 170g Halo Star IT back into the active 18-disc Innova Adventure Pack:
- Hole 1 (138ft, Par 3): Jeffery 3 (Par). Chilly Tuesday lunch round; checked the left side for the lost Leopard3. Threw 175g Star Sync off the tee bringing the arm back and straight across the chest ("Bring it across the chest, that's how I'm supposed to do... The Sync. I am 10 feet right of it, and almost 10 feet behind it"). Missed a tough birdie putt, tapped in for Par 3, and started the round timer.
- Hole 2 (192ft, Par 3): Jeffery 2 (Birdie ★). Decided against the drivers and threw 176g Glow Mako3 aimed slightly left ("Let's just throw the Mako3, and let's throw it to the left... That was awesome. That was the exact distance I needed. That was fucking awesome... right down the pin!"). Buried the putt for Birdie 2 (-1)!
- Hole 3 (162ft, Par 3): Jeffery 3 (Par). Pulled the newly un-archived 170g Halo Star IT ("Too much right. Let's throw that IT. Hey, it would have done it, a little too far... We got it there for par, at least"). Scrambled cleanly out of the trees to save Par 3 (-1).
- Hole 4 (162ft, Par 3): Jeffery 2 (Birdie ★). Stepped up with 174g DX Roc3 and locked in his signature form cue ("Bringing it back, straight across, through. Lining up my disc in the center of my forearm and away, holding it over like a heavy tea kettle... This is dead on! Even with the pin, about 1 foot behind, 5 foot to the right!"). Tapped in the 5-footer for Birdie 2 (-2)!
- Hole 5 (144ft, Par 3): Jeffery 3 (Par). Launched 170g Halo Star IT off the tee ("Let's launch the IT. I brought the IT back 'cause I lost my Leopard here yesterday. It's very similar to IT, I think"). Clipped a guardian tree in the fairway, threw a money 175g Star Sync approach to 3–5 feet left of the pin, and tapped in for Par 3 (-2).
- Hole 6 (165ft, Par 3): Jeffery 2 (Birdie ★). Wanted the exact same right-to-left fade as Hole 4 and pulled 174g DX Roc3 ("Roc3, like we did that Hole 4. Missed the trees, perfect, perfect! Rolled over there... 8, 9, 10 feet"). Drained the ~9-foot birdie putt to reach -3 through 6 holes!
- Hole 7 (139ft, Par 3): Jeffery 4 (Bogey). Debated IT, Eagle, Roadrunner, and Mamba; threw 152g Star Mamba getting the speed up into a tough lie, and the par putt skipped/bounced out of the basket ("That's a bogey. Skipped out of the basket") for Bogey 4 (-2).
- Hole 8 (171ft, Par 3): Jeffery 4 (Bogey). Threw 170g Halo Star IT off the tee ("Go with the IT. Straight, huh? I'm throwing straight and far... Roc3 would have been better, it's okay, I'm working on my line"). Tree helped slow it down, but the par putt came up weak/short for Bogey 4 (-1). Searched for the lost Leopard3 walking to Hole 9 ("All right, no, I don't see my Leopard. No one snagged it").
- Hole 9 (141ft, Par 3): Jeffery 3 (Par). Threw 172g Star Rollo off the tee to the exact same spot as yesterday, then fired a 175g Star Sync approach that nearly chained in for an eagle/birdie throw-in ("Throw that Sync. That Sync almost aced it! We'll par. One under!"). Tapped in for Par 3 to finish under par at 26 (-1)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 26 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Chilly Tuesday lunch break; looked for lost Leopard3 on the left. Threw 175g Star Sync bringing arm back and across the chest—landed 10ft right and 10ft behind the pin ("The Sync. I am 10 feet right of it, and almost 10 feet behind it"). Tough birdie putt missed; tapped in for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Sync',
          thrownDiscId: 'innova-sync',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 14,
          scenarioUsed: 'calm',
          notes:
            '175g Star Sync across-the-chest tee drive parked 10ft right & 10ft behind the pin; missed tough birdie bid, tapped in for Par 3.',
          voiceNote: '175g Star Sync across-chest tee drive to ~14ft (10ft right, 10ft behind) + Par 3'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Chose 176g Glow Mako3 aimed slightly left ("Let\'s just throw the Mako3, and let\'s throw it to the left... That was awesome. That was the exact distance I needed. That was fucking awesome... right down the pin!"). Drained the putt for Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          scenarioUsed: 'calm',
          notes:
            '176g Glow Mako3 thrown slightly left—exact distance needed right down the pin ("That was the exact distance I needed... right down the pin!") for Birdie 2!',
          voiceNote: '★ 176g Glow Mako3 piped exact distance right down the pin for Birdie 2!'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw newly un-archived 170g Halo Star IT ("Too much right. Let\'s throw that IT. Hey, it would have done it, a little too far... We got it there for par, at least"). Scrambled cleanly for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'IT',
          thrownDiscId: 'innova-it',
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          scenarioUsed: 'calm',
          notes:
            'Returned 170g Halo Star IT to active bag on H3 (went slightly right/long into trees) + clean scramble for Par 3.',
          voiceNote: '170g Halo Star IT tee shot (slightly right/long) + clean Par 3 save'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Threw 174g DX Roc3 with dialed form ("Bringing it back, straight across, through. Lining up my disc in the center of my forearm and away, holding it over like a heavy tea kettle... This is dead on! Even with the pin, about 1 foot behind, 5 foot to the right!"). Tapped in the 5-footer for Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          scenarioUsed: 'calm',
          notes:
            '174g DX Roc3 lined up in center of forearm like a "heavy tea kettle"—dead-on line parked even with the pin, 1ft behind & 5ft right for tap-in Birdie 2!',
          voiceNote: '★ 174g DX Roc3 ("heavy tea kettle" forearm alignment) parked 5ft right of pin for Birdie 2!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Launched 170g Halo Star IT off the tee ("Let\'s launch the IT. I brought the IT back \'cause I lost my Leopard here yesterday. It\'s very similar to IT, I think"). Hit a guardian tree, threw 175g Star Sync approach to 3–5ft left of the pin, and made Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'IT',
          thrownDiscId: 'innova-it',
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          scenarioUsed: 'calm',
          notes:
            '170g Halo Star IT tee shot clipped guardian tree + 175g Star Sync approach parked 3–5ft left of pin for Par 3.',
          voiceNote: '170g Halo Star IT tee (brought back for lost Leopard3) + Star Sync approach to 4ft for Par 3'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Went back to 174g DX Roc3 for the right-to-left fade like Hole 4 ("Roc3, like we did that Hole 4. Missed the trees, perfect, perfect! Rolled over there... 8, 9, 10 feet"). Buried the ~9ft putt for Birdie 2 (moving to -3 through 6 holes)!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 9,
          scenarioUsed: 'calm',
          notes:
            '174g DX Roc3 repeated Hole 4\'s right-to-left fade, missed all guardian trees, rolled to 8–10ft, and drained the Birdie 2 putt (-3 thru 6)!',
          voiceNote: '★ 174g DX Roc3 missed the trees & parked 9ft from pin for Birdie 2 (-3 thru 6)!'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Threw 152g Star Mamba getting speed up off the tee into a tough spot; par putt skipped/bounced out of the basket ("That\'s a bogey. Skipped out of the basket") for Bogey 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Mamba',
          thrownDiscId: 'innova-mamba',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes:
            '152g Star Mamba off the tee; par putt skipped out of the basket for Bogey 4.',
          voiceNote: '152g Star Mamba tee + par putt skipped out of basket for Bogey 4'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Threw 170g Halo Star IT off the tee ("Go with the IT. Straight, huh? I\'m throwing straight and far... Roc3 would have been better, it\'s okay, I\'m working on my line"). Tree helped slow it down; par try came up weak/short for Bogey 4. Looked for lost Leopard3 heading to H9.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'IT',
          thrownDiscId: 'innova-it',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes:
            '170g Halo Star IT flew straight and far (noted DX Roc3 would be even better for the left fade on H8); par putt came up short for Bogey 4.',
          voiceNote: '170g Halo Star IT straight tee (noted Roc3 for H8 fade next time) + Bogey 4'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 172g Star Rollo off the tee to the exact same spot as yesterday, then fired a 175g Star Sync approach that nearly chained in ("Throw that Sync. That Sync almost aced it! We\'ll par. One under!"). Tapped in for Par 3 to seal an under-par 26 (-1)!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          scenarioUsed: 'calm',
          notes:
            '172g Star Rollo tee shot + 175g Star Sync approach that almost chained in ("That Sync almost aced it! We\'ll par. One under!") for Par 3 and a 26 (-1) finish!',
          voiceNote: '172g Star Rollo tee + 175g Star Sync approach ("Almost aced it!") for Par 3 & 26 (-1) finish!'
        }
      }
    }
  ]
};

const ROUND_2026_11_04_SARKO: HistoricalRound = {
  id: 1762282800001,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-04',
  duration: '00:25:10',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  updatedAt: 1762282800001,
  roundTranscript: `Sar-Ko-Par Trails Solo Late-Lunch Round (2026-11-04, Calm Autumn Afternoon) — Jeffery 24 (-3, 4 Birdies, 4 Pars, 1 Bogey · "Better than yesterday!").
Improved 2 strokes over yesterday's 26 (-1) with an opening Birdie on Hole 1 and a scorching 3-birdie streak on Holes 6, 7 & 8 to reach -4 through 8 holes:
- Hole 1 (138ft, Par 3): Jeffery 2 (Birdie ★). Fired 175g Star Sync straight off the tee—went slightly past the basket and checked up clean; buried the C1 putt with 175g KC Pro Aviar ("Started off with a bird... this was Sync, and then my KC Pro!").
- Hole 2 (192ft, Par 3): Jeffery 3 (Par). Weighed Mako3 [5|5|0|0] vs. Roc3 vs. Star Jay [5|4|0|1] so as not to go too far; played it safe with 176g Glow Mako3 aimed along the right outside edge of the woods, then finished with 175g KC Pro Aviar for a clean Par 3 ("Par'd it, Mako3 and the Aviar, KC Pro").
- Hole 3 (162ft, Par 3): Jeffery 3 (Par). Pulled 170g Halo Star IT [7|5|-2|1] off the tee—aimed slightly left, wrapped cleanly around the tennis courts without hitting the fence, and parked 20 feet left of the pin ("They wrapped around it, dead on... right there, this is perfect, just about 20 feet to the left of the pin"). Pitched in with 175g XT Glow Nova for Par 3.
- Hole 4 (162ft, Par 3): Jeffery 3 (Par). Got slightly off-balance on the step-out and threw 174g DX Roc3 low into a tree, kicking out into the open; parked the recovery approach and drained a challenging par-save putt ("Parked it, nice. Got it. Par'd again!").
- Hole 5 (144ft, Par 3): Jeffery 3 (Par). Threw 166g DX Archangel off the tee, then stuck a crisp 175g Star Toro approach right up to the basket ("The Toro was good, it got me up there!") for a fifth straight par-or-better hole.
- Hole 6 (165ft, Par 3): Jeffery 2 (Birdie ★). Threw 166g DX Archangel off the tee—missed the guardian tree and parked 14–15 feet from the pin ("We're working! Yeah, 10, 15, 14 feet away. Birdied it!") to move to -2!
- Hole 7 (139ft, Par 3): Jeffery 2 (Birdie ★). Joked with a fellow golfer on the course ("Well, I'm good if you left some birdies over here for me!" — "I left you one!"). Audibled from Mamba to 169g GStar Roadrunner off the tee—flew a beautiful line right to 10 feet right of the basket ("Beautiful! Perfect right over there... 10 feet to the right") and floated in the Birdie 2 putt to reach -3!
- Hole 8 (171ft, Par 3): Jeffery 2 (Birdie ★). Took the high line over the trees (174g DX Roc3 / 170g Halo Star IT)—sailed over the canopy and glided left spot-on under the pin ("Over the trees, nice, right there! That was perfect, dude. That was absolutely perfect... flying to the left. Spot on. Bird? Yeah!") for a 3-in-a-row Birdie streak (-4 through 8)!
- Hole 9 (141ft, Par 3): Jeffery 4 (Bogey). Threw 172g Star Rollo off the tee (landed slightly short on the hillside); the uphill bid caught an unlucky rollaway down the sloped green ("Just don't roll anymore... Stop. It rolled"), finishing with a 4 for a stellar 24 (-3) round ("Better than yesterday!").`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 24 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Fired 175g Star Sync straight off the tee (stopped just past the pin) and buried the C1 Birdie 2 putt with 175g KC Pro Aviar ("Started off with a bird... Sync, and then my KC Pro!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Sync',
          thrownDiscId: 'innova-sync',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          scenarioUsed: 'calm',
          notes:
            '175g Star Sync straight off the tee + 175g KC Pro Aviar putt for an opening Birdie 2!',
          voiceNote: '175g Star Sync tee laser + 175g KC Pro Aviar Birdie 2 putt!'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Played it safe with 176g Glow Mako3 [5|5|0|0] aimed right along the outside edge of the woods and finished with 175g KC Pro Aviar for Par 3 ("Par\'d it, Mako3 and the Aviar, KC Pro").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes:
            '176g Glow Mako3 safe along the right outside edge of the woods + 175g KC Pro Aviar for Par 3.',
          voiceNote: '176g Glow Mako3 safe right of woods + 175g KC Pro Aviar Par 3'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 170g Halo Star IT [7|5|-2|1] off the tee—wrapped cleanly around the tennis courts to 20 feet left of the pin ("This is perfect, just about 20 feet to the left of the pin") and finished with 175g XT Glow Nova for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'IT',
          thrownDiscId: 'innova-it',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          scenarioUsed: 'calm',
          notes:
            '170g Halo Star IT wrapped around the tennis courts to 20ft left of the pin + 175g XT Glow Nova for Par 3.',
          voiceNote: '170g Halo Star IT wrapped around tennis courts to 20ft left + XT Glow Nova Par 3'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Got slightly off-balance on the step-out and threw low into a tree (bounced nicely out into the open); parked the recovery upshot and drained a challenging par-save putt for Par 3 ("Parked it, nice. Got it. Par\'d again!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes:
            'Low tee shot clipped tree and bounced into the open; parked the approach and drained the Par 3 save!',
          voiceNote: 'Tree kick into the open + parked upshot for a clutch Par 3 save!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 166g DX Archangel off the tee, then parked a crisp 175g Star Toro approach right by the pin ("The Toro was good, it got me up there!") for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-toro' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes:
            '166g DX Archangel tee shot + crisp 175g Star Toro approach ("The Toro was good, it got me up there!") for Par 3.',
          voiceNote: '166g DX Archangel tee + 175g Star Toro approach ("got me right up there!") for Par 3'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Threw 166g DX Archangel off the tee—missed the guardian tree and parked 14–15 feet from the basket ("Yeah, 10, 15, 14 feet away. Birdied it!") for Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 14,
          scenarioUsed: 'calm',
          notes:
            '166g DX Archangel missed the guardian tree and parked 14ft out; drained the C1 putt for Birdie 2!',
          voiceNote: '166g DX Archangel parked 14ft from the pin + C1 Birdie 2!'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Joked with a fellow player ("Well, I\'m good if you left some birdies over here for me!" — "I left you one!"), switched from Mamba to 169g GStar Roadrunner off the tee—parked 10 feet right of the pin ("Beautiful! Perfect right over there... 10 feet to the right") and floated in the Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          scenarioUsed: 'calm',
          notes:
            'Audibled to 169g GStar Roadrunner off the tee—beautiful flight parked 10ft right of the pin + float-toss Birdie 2!',
          voiceNote: '169g GStar Roadrunner parked 10ft right ("Beautiful! Perfect right over there!") + float-toss Birdie 2!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Took the high route over the trees—flew left and landed spot-on under the basket ("Over the trees, nice, right there! That was perfect, dude. That was absolutely perfect... flying to the left. Spot on. Bird? Yeah!") for a 3rd straight Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          scenarioUsed: 'calm',
          notes:
            'High line over the trees flying left spot-on to the basket ("Over the trees, nice, right there! That was absolutely perfect!") for Birdie 2!',
          voiceNote: 'High line over the trees flying left spot-on to the pin for Birdie 2!'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Threw 172g Star Rollo off the tee (good line, slightly short on the hill); approach/putt caught a tough rollaway down the sloped green ("Just don\'t roll anymore... Stop. It rolled"), finishing with 4 for a 24 (-3) round ("Better than yesterday!").',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes:
            '172g Star Rollo tee shot (a little short); uphill putt caught a tough rollaway on the sloped green for Bogey 4 to finish at 24 (-3, "Better than yesterday!").',
          voiceNote: '172g Star Rollo tee + tough green rollaway for 4 to seal a 24 (-3) round!'
        }
      }
    }
  ]
};

const ROUND_2026_11_05_SARKO_1: HistoricalRound = {
  id: 1762369200001,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-05',
  duration: '00:24:30',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  notes:
    'Back-to-Back Thursday Solo Session (Round 1 of 2 · New Mail Call Arrived: DX Alien, Classic Glow Roc, Classic Glow Beast & Classic Glow Wraith!) — Jeffery 25 (-2, Bogey-Free! 2 Birdies on H1 w/ Star Sync & H3 w/ Halo Star IT parked 1ft from pin + 7 Pars including Classic Glow Roc debut on H4 & Classic Glow Beast test on H8!).',
  roundTranscript: `Sar-Ko-Par Trails Thursday Afternoon Solo Round 1 of 2 (2026-11-05, ~2:15 PM, Calm/Light Breeze, 00:24:30) — Jeffery 25 (-2, Bogey-Free! 2 Birdies ★ on H1 & H3 + 7 Pars!).
First round after receiving the new Innova Factory Store mail call (178g Pink DX Alien, 180g Classic Glow Roc, 168g Classic Glow Beast & 168g Classic Glow Wraith) and logging live app UX notes:
- Hole 1 (138ft, Par 3): Jeffery 2 (Birdie ★). Stepped up with 175g Star Sync off the tee and parked it dead under the basket ("Sync went right there, right under the pin, baby! Birdied that one with the Sync all the way!"). Tapped in for an opening Birdie 2 (-1)!
- Hole 2 (192ft, Par 3): Jeffery 3 (Par). Followed the caddie's 170g Halo Star IT call ("Halo IT, let's go with what it says... Yes, baby, yes! That was a beautiful flight. I think it went exactly as the flight path shows on the card!"). Landed 1 foot past the pin and 5 feet right; missed the short birdie bid and tapped in for Par 3 (-1).
- Hole 3 (162ft, Par 3): Jeffery 2 (Birdie ★). Pulled 170g Halo Star IT again off the tee and parked it within 12 inches of the pole ("Oh, right there by the pin! IT is working for me, man. Right there by the pin, within 1 foot of the pin!"). Tapped in for Birdie 2 (-2)!
- Hole 4 (162ft, Par 3): Jeffery 3 (Par). Debuted the brand-new 180g DX Classic Glow Roc from the mail call ("Wait, I got the new Roc! I'm throwing the new Roc... Hit a little tree limb that was hanging down. Even with hitting the tree, it went straight past the pin about 20 feet!"). Missed the 20ft comeback birdie try with 175g KC Pro Aviar and tapped in for Par 3 (-2).
- Hole 5 (144ft, Par 3): Jeffery 3 (Par). Threw 170g DX Archangel off the tee—pulled left onto the walking trail ~20ft left of the pin ("Went way left onto the trail, at least 20 feet to the left of the pin"). Pitched up and locked in Par 3 (-2).
- Hole 6 (165ft, Par 3): Jeffery 3 (Par). Played a clean fairway drive and two-putted for a steady Par 3 (-2).
- Hole 7 (139ft, Par 3): Jeffery 3 (Par). Threw 168g GStar Roadrunner off the tee and parked it right under the basket ("Went with the Roadrunner, just parked it right under the pin, baby!"), but missed the short birdie putt ("How did I miss that? Way too confident on that short shot!") and tapped in for Par 3 (-2).
- Hole 8 (171ft, Par 3): Jeffery 3 (Par). Tested the newly arrived 168g DX Classic Glow Beast ("I haven't tried out the Beast—let's try out the Beast, I just got that! Hit a tree right at the end") and threw 170g Halo Star IT (skipped and rolled to 15ft: "Did a skip and a roll, not a bad spot, 15 feet!"). Two-putted from 15ft for Par 3 (-2).
- Hole 9 (141ft, Par 3): Jeffery 3 (Par). Weighed 178g DX Alien vs. 172g Star Rollo into the breeze; threw Star Rollo slightly soft up the hill ("A little weak on my throw"), approached, and tapped in for Par 3 to finish a bogey-free 25 (-2) before immediately teeing off for Round 2!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 25 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Parked 175g Star Sync right under the pin off the tee ("Sync went right there, right under the pin, baby! Birdied that one with the Sync all the way!") for an opening Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Sync',
          thrownDiscId: 'innova-sync',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          scenarioUsed: 'calm',
          notes:
            '175g Star Sync parked right under the pin off the tee for a tap-in Birdie 2!',
          voiceNote: '★ 175g Star Sync parked right under the pin for Birdie 2!'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 170g Halo Star IT ("Beautiful flight! Went exactly as the flight path shows on the card!"). Finished 1ft past and 5ft right of the pin; missed the birdie putt and tapped in for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'IT',
          thrownDiscId: 'innova-it',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          scenarioUsed: 'calm',
          notes:
            '170g Halo Star IT flew true to its collector card flight path—parked 1ft past & 5ft right of the pin, tapped in for Par 3.',
          voiceNote: '170g Halo Star IT flew exact card flight path to 5ft right of pin (Par 3)'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Parked 170g Halo Star IT within 1 foot of the pin ("Oh, right there by the pin! IT is working for me, man. Right there by the pin, within 1 foot of the pin!") for a tap-in Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'IT',
          thrownDiscId: 'innova-it',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 1,
          scenarioUsed: 'calm',
          notes:
            '170g Halo Star IT parked within 1 foot of the basket ("IT is working for me, man!") for a tap-in Birdie 2!',
          voiceNote: '★ 170g Halo Star IT parked 1ft from the pin for tap-in Birdie 2!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Debuted the newly arrived 180g Classic Glow Roc ("Wait, I got the new Roc! I\'m throwing the new Roc... Even with hitting the tree limb, it went straight past the pin about 20 feet!"). Two-putted with 175g KC Pro Aviar for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-roc' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Classic Glow Roc',
          thrownDiscId: 'innova-classic-glow-roc',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          scenarioUsed: 'calm',
          notes:
            'Debuted newly arrived 180g Classic Glow DX Roc—clipped a small hanging branch and still carried straight 20ft past the pin for Par 3.',
          voiceNote: 'Debuted new 180g Classic Glow Roc (carried straight 20ft past pin) + KC Pro Aviar Par 3'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 170g DX Archangel off the tee—drifted left onto the trail ~20ft left of the pin ("Went way left onto the trail, at least 20 feet to the left of the pin") and saved Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          scenarioUsed: 'calm',
          notes: '170g DX Archangel pulled left onto the trail (~20ft left of pin) + clean Par 3.',
          voiceNote: '170g DX Archangel to 20ft left on trail + clean Par 3'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 3 },
      voiceTranscript: 'Clean tee shot and two-putt for Par 3 on Hole #6.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          voiceNote: 'Steady fairway drive + Par 3'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Parked 168g GStar Roadrunner right under the pin ("Went with the Roadrunner, just parked it right under the pin, baby!"), but rushed the short birdie putt ("Way too confident on that short shot!") and tapped in for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roadrunner',
          thrownDiscId: 'innova-roadrunner',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          scenarioUsed: 'calm',
          notes:
            '168g GStar Roadrunner parked right under the pin; rushed the short birdie putt and tapped in for Par 3.',
          voiceNote: '168g GStar Roadrunner parked right under pin + Par 3'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Tested the newly arrived 168g Classic Glow Beast ("Let\'s try out the Beast, I just got that! Hit a tree right at the end") and threw 170g Halo Star IT (skipped and rolled to 15ft: "Not a bad spot, 15 feet!"). Two-putted for Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'IT',
          thrownDiscId: 'innova-it',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 15,
          scenarioUsed: 'calm',
          notes:
            '170g Halo Star IT skipped and rolled to 15ft (also debuted newly arrived 168g Classic Glow Beast!) + Par 3.',
          voiceNote: '170g Halo Star IT skip-and-roll to 15ft (plus Classic Glow Beast debut test!) for Par 3'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Weighed new 178g DX Alien vs. 172g Star Rollo; threw Star Rollo slightly soft up the hill ("A little weak on my throw") and locked in Par 3 to finish a bogey-free 25 (-2)!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes:
            '172g Star Rollo uphill tee shot + clean Par 3 to seal a bogey-free 25 (-2) in Round 1!',
          voiceNote: '172g Star Rollo uphill tee + Par 3 to finish bogey-free 25 (-2)!'
        }
      }
    }
  ]
};

const ROUND_2026_11_05_SARKO_2: HistoricalRound = {
  id: 1762371000002,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-05',
  duration: '00:23:57',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  notes:
    '🏆 TIED ALL-TIME SAR-KO-PAR PERSONAL BEST 21 (-6) & 6-HOLE BIRDIE STREAK (Holes #4–#9)! Back-to-Back Thursday Solo Round 2 of 2 — Jeffery 21 (-6, 7 Birdies ★ on H1 w/ Star Sync, H4 w/ DX Roc3, H5 w/ DX Roc3, H6 w/ Glow Mako3 parked 2ft, H7 w/ DX Archangel parked 3ft, H8 w/ DX Archangel & H9 w/ Star Rollo!).',
  roundTranscript: `Sar-Ko-Par Trails Thursday Afternoon Solo Round 2 of 2 (2026-11-05, Calm Wind, 00:23:57) — Jeffery 21 (-6, 🏆 TIED ALL-TIME PERSONAL BEST & 6 CONSECUTIVE BIRDIES ON HOLES #4–#9! 7 Birdies ★, 1 Par, 1 Bogey!).
Teed off immediately after finishing Round 1's bogey-free 25 (-2) and caught absolute fire—Closing Holes #4 through #9 with 6 straight Birdie 2s to shoot 21 (-6) in 23 minutes 57 seconds:
- Hole 1 (138ft, Par 3): Jeffery 2 (Birdie ★). Pulled 175g Star Sync again off the tee and parked it a couple feet shy of the basket ("Yes, baby! Just a couple feet shy of the pin—Sync again, birdie!"). Tapped in for Birdie 2 (-1)!
- Hole 2 (192ft, Par 3): Jeffery 3 (Par). Threw 170g Halo Star IT off the tee—clipped the trees on the left but rolled down toward the pin ("Hit the trees, rolled down close to the pin, though") and converted a clean Par 3 (-1).
- Hole 3 (162ft, Par 3): Jeffery 4 (Bogey). Tee shot went dead straight down the hill flirting with the creek/pond edge ("Went straight, I hope it didn't go in the water... didn't go in the water!"). Pitched out through the trees with 175g XT Glow Nova ("Let's try the Nova, see if we can get out of these trees... alright, got me up to the pin") and tapped in for Bogey 4 (E).
- Hole 4 (162ft, Par 3): Jeffery 2 (Birdie ★). Compared the newly arrived 178g DX Alien [4|2|0|1] vs. 174g DX Roc3 [5|4|0|3] ("Roc3 is 5, 4, 0, 3... Roc3 should take me further than the Alien"). Threw 174g DX Roc3 over the walnuts and buried a challenging birdie putt ("Challenging birdie... I made the birdie! Wiped out the bogey!") for Birdie 2 (-1) — starting a 6-hole birdie streak!
- Hole 5 (144ft, Par 3): Jeffery 2 (Birdie ★). Noticed he left his main putter in Hole 4's basket, trusted his backup putters in the bag, and threw 174g DX Roc3 wide right around the guardian tree ("Let's do the Roc3 again! Went wide right of that tree and curved left, about 15 feet behind the pin!"). Drained the 15ft putt for Birdie 2 (-2) and retrieved his putter from Hole 4!
- Hole 6 (165ft, Par 3): Jeffery 2 (Birdie ★). Tested 175g Champion Eagle ("That Eagle goes strong left!"), then threw 176g Glow Mako3 off the tee—turned gently left at the end and parked 2 feet from the pin ("Mako3 is awesome! It did turn left at the last minute and went right under the pin—2 feet away!"). Tapped in for a 3rd straight Birdie 2 (-3)!
- Hole 7 (139ft, Par 3): Jeffery 2 (Birdie ★). Switched to 170g DX Archangel [8|6|-3|1] and dialed in his 90-degree chest-high elbow + "tea-kettle" wrist cue ("Just go with the Archangel! Keep the elbow at 90° and chest high, hold like a tea kettle... Oh my God, right under the pin! 3 feet away! Archangel, baby!"). Tapped in for a 4th consecutive Birdie 2 (-4)!
- Hole 8 (171ft, Par 3): Jeffery 2 (Birdie ★). Stuck with the hot 170g DX Archangel using the exact same upright 90-degree chest-high release ("Keep that 90-degree, keep it chest high, don't bend down—stay straight up when I release it... Nice! Went over the path, got a 20-foot putt for birdie!"). Drained the 20-foot putt ("Yes! Birdie! Five birdies in a row!") to reach -5!
- Hole 9 (141ft, Par 3): Jeffery 2 (Birdie ★). With park bystanders watching on the hill, stepped up with 172g Star Rollo and gave it a touch more zip than Round 1 ("Give it a little bit more on the Rollo than I did last time... Alright, got a chance for birdie!"). Buried the uphill/sidehill putt for a 6th consecutive Birdie 2 ("Birdied it! Six! Birdied the last six holes! Minus six! Twenty-one!")—tying his all-time Sar-Ko-Par Personal Best of 21 (-6) in 23:57!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 21 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Parked 175g Star Sync a couple feet shy of the pin ("Yes, baby! Just a couple feet shy of the pin—Sync again, birdie!") for back-to-back Hole #1 Birdie 2s today!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ],
          discUsed: 'Sync',
          thrownDiscId: 'innova-sync',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          scenarioUsed: 'calm',
          notes:
            '175g Star Sync parked 2–3ft shy of the basket off the tee for a tap-in Birdie 2!',
          voiceNote: '★ 175g Star Sync parked 2–3ft shy of pin for Birdie 2!'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 170g Halo Star IT—clipped the trees and rolled down close to the pin ("Hit the trees, rolled down close to the pin, though") for a clean Par 3.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'IT',
          thrownDiscId: 'innova-it',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes: '170g Halo Star IT clipped trees and rolled down near the pin for Par 3.',
          voiceNote: '170g Halo Star IT rolled down near pin for Par 3'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Tee shot went straight down the hill dry of the water; pitched out of the trees with 175g XT Glow Nova ("Let\'s try the Nova, see if we can get out of these trees... got me up to the pin") for Bogey 4.',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ],
          discUsed: 'XT Glow Nova',
          thrownDiscId: 'innova-xt-glow-nova',
          puttDistance: 'C1',
          scenarioUsed: 'calm',
          notes:
            'Straight tee shot stayed dry of the creek; pitched out of the trees with 175g XT Glow Nova right to the pin for Bogey 4.',
          voiceNote: '175g XT Glow Nova tree-trouble scramble up to the pin for Bogey 4'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Compared DX Alien [4|2|0|1] vs. 174g DX Roc3 [5|4|0|3]; threw DX Roc3 off the tee and drained a challenging putt ("I made the birdie! Wiped out the bogey!") to start a 6-hole birdie streak!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 18,
          scenarioUsed: 'calm',
          notes:
            'Chose 174g DX Roc3 [5|4|0|3] for extra carry over DX Alien [4|2|0|1] and drained the challenging Birdie 2 putt (Birdie #1 of 6 straight!).',
          voiceNote: '★ 174g DX Roc3 tee + clutch C1 putt for Birdie 2 (1st of 6 straight birdies!)'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Threw 174g DX Roc3 wide right around the guardian tree ("Went wide right of that tree and curved left, about 15 feet behind the pin!"), drained the 15ft Birdie 2 putt with backup putters, and retrieved his putter from H4!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-aviar' }
          ],
          discUsed: 'Roc3',
          thrownDiscId: 'innova-roc3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 15,
          scenarioUsed: 'calm',
          notes:
            '174g DX Roc3 swung wide right of the guardian tree and curved back left to 15ft behind the pin; drained the Birdie 2 putt (Birdie #2 of 6 straight!).',
          voiceNote: '★ 174g DX Roc3 wide-right hyzer to 15ft + drained Birdie 2 putt!'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Tested Champion Eagle (strong left fade), then threw 176g Glow Mako3—turned left at the last moment and parked 2 feet under the pin ("Mako3 is awesome! Right under the pin—2 feet away!") for a 3rd straight Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Mako3',
          thrownDiscId: 'innova-mako3',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          scenarioUsed: 'calm',
          notes:
            '176g Glow Mako3 turned gently left at the end and parked 2 feet under the basket ("Mako3 is awesome! 2 feet away!") for tap-in Birdie 2 (Birdie #3 of 6 straight!).',
          voiceNote: '★ 176g Glow Mako3 parked 2ft under the pin for 3rd straight Birdie 2!'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Pulled 170g DX Archangel with the 90-degree chest-high elbow + "tea-kettle" wrist cue and parked 3 feet under the pin ("Oh my God, right under the pin! 3 feet away! Archangel, baby!") for a 4th consecutive Birdie 2!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          scenarioUsed: 'calm',
          notes:
            '170g DX Archangel thrown with 90° chest-high elbow and "tea-kettle" wrist position—parked 3 feet under the pin for tap-in Birdie 2 (Birdie #4 of 6 straight!).',
          voiceNote: '★ 170g DX Archangel (90° chest-high "tea-kettle" release) parked 3ft under pin for Birdie 2!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Repeated the upright 90-degree chest-high release with 170g DX Archangel ("Don\'t bend down—stay straight up when I release it... Went over the path, got a 20-foot putt for birdie!") and drained the 20-footer for 5 birdies in a row!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Archangel',
          thrownDiscId: 'innova-archangel',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          scenarioUsed: 'calm',
          notes:
            '170g DX Archangel thrown upright with 90° chest-high release over the path to 20ft; buried the C1 putt for a 5th consecutive Birdie 2!',
          voiceNote: '★ 170g DX Archangel upright 90° release to 20ft + drained C1 putt for 5th straight Birdie 2!'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Gave 172g Star Rollo a touch more zip up the hill past the gallery and buried the Birdie 2 putt ("Birdied it! Six! Birdied the last six holes! Minus six! Twenty-one!") to tie his all-time 21 (-6) course record!',
      meta: {
        jeffery: {
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ],
          discUsed: 'Rollo',
          thrownDiscId: 'innova-rollo',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 14,
          scenarioUsed: 'calm',
          notes:
            '172g Star Rollo thrown with extra zip up the hill + drained Birdie 2 putt to cap a 6-hole birdie streak and tie the 21 (-6) Course Personal Best!',
          voiceNote: '🏆 172g Star Rollo uphill drive + Birdie 2 putt to seal 6 straight birdies & 21 (-6) Course PB!'
        }
      }
    }
  ]
};

const ROUND_2026_11_08_PRAIRIE_CENTER: HistoricalRound = {
  id: 1794175918143,
  courseName: 'Prairie Center Park',
  totalHoles: 18,
  date: '2026-11-08',
  duration: '01:46:56',
  par: 55,
  windCondition: 'calm',
  gameMode: 'stroke',
  updatedAt: 1794190000001,
  notes:
    'Sunday 27-Hole Father-Son Adventure (Part 1 of 2 · 18 Holes at Prairie Center Park, 5,808 ft): Jeffery 77 (+22, 4 Pars ★ on H1, H5, H8 & H16; course debuts for Classic Glow Wraith & Classic Glow Beast!) & Jack 86 (+31, Par 3 ★ on H11 & won 4 holes outright: H3, H11, H14 & H17!).',
  roundTranscript: `Prairie Center Park 18-Hole Sunday Round (2026-11-08, Part 1 of 27-Hole Sunday Adventure before The Art Nine · 01:46:56 · Par 55 · 5,808 ft) — Jeffery 77 (+22, 4 Pars ★ on H1, H5, H8 & H16) & Jack 86 (+31, Par 3 ★ on H11 & won 4 holes outright: H3, H11, H14 & H17!).
Reconstructed from fragmented iPhone Notes audio recordings + live phone scorecard:
- Hole 1 (273ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Opened the 18-hole trek with 169g GStar Roadrunner off the tee and 175g KC Pro Aviar for a clean opening Par 3 ("What'd you get on the last? Three!"). Jack carded 4 with 170g Discraft Cicada.
- Hole 2 (269ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Tested 168g Classic Glow Beast off the tee ("Threw the Beast that went into a tree"), recovered with 180g Classic Glow Roc ("Threw the Roc that was just safe from out of bounds!"), missed the first Aviar putt and tapped in for 4 alongside Jack's 4.
- Hole 3 (265ft, Par 3): Jeffery 5 (+2) | Jack 4 (Bogey). Threw 176g Glow Mako3 off the tee ("Went up and to the left, hit a tree—doing something with my wrist"), pitched up tentatively worrying about overthrowing the pin ("I get scared I'm going to throw it too hard"), missed the 4th shot putt to the right, and took 5 while Jack won Hole 3 with a 4!
- Hole 4 (314ft, Par 3): Jeffery 4 (Bogey) | Jack 5 (+2). Basket tucked up and to the right. Threw 170g Halo Star IT off the tee ("I threw it high, but that's fine—good out there!"), approached with 175g Star Sync on an upward angle ("That angle turned out just right! That's great!"), and carded 4 while Jack took 5.
- Hole 5 (254ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Launched 169g GStar Roadrunner 150–160+ ft off the tee ("Beauty!"), fired a low 175g Star Sync approach that skipped up to 10ft right of the basket ("A straight Sync—thankfully it skipped and got closer!"), and buried the 10ft putt ("Got it! 10 feet to the right, two feet up—Par!") for Par 3! Jack carded 4.
- Hole 6 (353ft, Par 3): Jeffery 4 (Bogey) | Jack 5 (+2). Waited for park walkers and waved a solo player through ("It's a peace sign, like, cool, man, you're doing nice!"). Threw 169g GStar Roadrunner off the tee and yellow 180g Star Jay approach (aiming further right to account for left fade, landing right next to Jack's yellow 170g Discraft Cicada: "Oh, they are yellow, both of them!"). Bid for 3 ("Close!") and tapped in for 4 on the 353ft hole; Jack 5.
- Hole 7 (365ft, Par 3): Jeffery 4 (Bogey) | Jack 5 (+2). Tested 168g Classic Glow Beast [10|5|-2|2] off the tee (clipped a tree, appreciating how Prairie Center leaves an open recovery shot unlike Cedar Ridge's dense timber), laced a level, dead-straight 176g Glow Mako3 through the trees ("Straight, good! Level is what I'm looking at"), and parked 178g DX Alien ("Alien's great!") for 4; Jack 5.
- Hole 8 (301ft, Par 3): Jeffery 3 (Par ★) | Jack 5 (+2). Crushed 169g GStar Roadrunner off the 301ft tee ("Hitting the limbs, but that was a good one—definitely a good throw!"), parked the approach with 178g DX Alien / 175g Star Sync, and drained a clutch C1 putt—crediting backyard putting practice ("We've been practicing those putts at home, you get up there and you're like, 'Yes, I can make that!' Parred it!") for a 301ft Par 3! Coached Jack on following through without hesitating.
- Hole 9 (332ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Threaded 169g GStar Roadrunner right through the only tiny window in the guardian tree ("Did you see it miss that tree though? Right through the only little space in that tree!"), followed with a great 180g Classic Glow Roc 2nd shot ("Yeah, it was a good throw with the Roc Glow! At least it bounced great"), bid from 30+ ft, and both carded 4s (praising Jack's mastery of his 3-disc Discraft lineup: "Jack knows his discs—he's got his 3 that he just knows!").
- Hole 10 (226ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Pulled 172g Star Rollo off the tee (turned hard right into a tree), scrambled low under the branches with 178g DX Alien ("An Alien one—hit a branch, but it got me close!"), and both carded 4s.
- Hole 11 (213ft, Par 3): Jeffery 4 (Bogey) | Jack 3 (Par ★). Downhill hole (~213–225ft). Used the chest-high / "tea-kettle" cue to pipe 170g Halo Star IT straight to the top of the hill, threw 175g XT Glow Nova nose-up on the downhill approach (stalled short), and missed the par putt for 4—while Jack drove down the hill with 175g Discraft Buzzz SS and drained his Par 3 ★ to win Hole 11 outright ("You parred it, huh? Good job!")!
- Hole 12 (517ft, Par 3): Jeffery 6 (+3) | Jack 7 (+4). 517ft left-curving monster! Made first-ever throw with 171g Classic Glow Wraith [11|5|-1|3] ("This is that Wraith, I've never thrown it—hit a tree"), threw 170g DX Archangel 2nd shot (saved from OB by left trees), threaded a clutch low 176g Glow Mako3 through the tree gaps ("Mako3 down in there, dude! It went through gaps of the trees!"), and battled through the trees for 6; Jack 7.
- Hole 13 (604ft, Par 4): Jeffery 5 (Bogey) | Jack 7 (+3). Longest hole on the course (604ft Par 4 with water in play: "This 604 feet, Hole 13... Water? This is the scary hole!"). Navigated the fairway with 169g GStar Roadrunner and 170g Halo Star IT for a 5 (+1); Jack 7.
- Hole 14 (355ft, Par 3): Jeffery 6 (+3) | Jack 5 (+2). Jack won Hole 14 outright with a 5 using 170g Discraft Cicada while Jeffery took 6 (152g Star Mamba).
- Hole 15 (319ft, Par 3): Jeffery 5 (+2) | Jack 7 (+4). Jeffery carded 5 (152g Star Mamba) on the 319ft 15th hole; Jack 7.
- Hole 16 (235ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Dialed in 170g Halo Star IT off the 235ft tee and 175g KC Pro Aviar for a 4th Par 3 ★ of the round! Jack 4 (175g Discraft Buzzz SS).
- Hole 17 (321ft, Par 3): Jeffery 5 (+2) | Jack 4 (Bogey). Jack won his 4th hole of the round with a 4 (170g Discraft Cicada) while Jeffery took 5 (152g Star Mamba).
- Hole 18 (292ft, Par 3): Jeffery 5 (+2) | Jack 5 (+2). Fired 169g GStar Roadrunner off the tee, hit a tree with 174g DX Roc3, approached with 175g Star Sync, and made the 175g KC Pro Aviar putt on 5 alongside Jack's 5 ("Not bad, Jack! All right!").`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 77 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 86 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 273,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Opened with 169g GStar Roadrunner off the 273ft tee and 175g KC Pro Aviar for a clean opening Par 3 ("What\'d you get on the last? Three!"). Jack carded 4 with 170g Discraft Cicada.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ 169g GStar Roadrunner tee drive + KC Pro Aviar for opening Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 269,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Tested 168g Classic Glow Beast off the tee ("Threw the Beast that went into a tree"), recovered with 180g Classic Glow Roc ("just safe from out of bounds!"), missed the first Aviar putt and tapped in for 4 alongside Jack\'s 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-beast',
          discUsed: 'Classic Glow Beast',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Classic Glow Beast tee (hit tree) + Classic Glow Roc safe of OB + KC Pro Aviar for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-beast' },
            { shotType: 'approach', discId: 'innova-classic-glow-roc' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 265,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        'Threw 176g Glow Mako3 off the tee ("Went up and to the left, hit a tree—doing something with my wrist"), pitched up tentatively, and missed 4th shot putt to the right for 5. Jack won Hole 3 with a 4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '176g Glow Mako3 angled up/left into tree + tentative pitch-up for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          voiceNote: '★ Won Hole 3 outright with Bogey 4!',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 314,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Basket up and to the right (314ft). Threw 170g Halo Star IT high off the tee ("Good out there!"), then dialed in an upward-angled 175g Star Sync approach ("That angle turned out just right! That\'s great!") for 4; Jack 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '170g Halo Star IT high drive + great upward-angled 175g Star Sync approach for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 254,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Bombed 169g GStar Roadrunner 150–160+ ft off the tee ("Beauty!"), fired a low 175g Star Sync approach that skipped to 10ft right of the pin ("A straight Sync—thankfully it skipped and got closer!"), and drained the 10ft putt ("Got it! 10 feet to the right, two feet up—Par!") for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '★ 169g GStar Roadrunner ("Beauty!") + 175g Star Sync skip to 10ft + drained Par 3 putt!',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 353,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        '353ft stretch—waved a solo player through ("Peace sign, cool man!"), threw 169g GStar Roadrunner off the tee and yellow 180g Star Jay approach (landed right next to Jack\'s yellow Cicada: "Oh, they are yellow, both of them!"). Bid for 3 ("Close!") and tapped in for 4; Jack 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '169g GStar Roadrunner tee + 180g Star Jay approach (aimed right for fade) for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-jay' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 365,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Tested 168g Classic Glow Beast [10|5|-2|2] off the 365ft tee (clipped a tree, still had an open recovery look), laced a level, dead-straight 176g Glow Mako3 through the trees ("Straight, good! Level is what I\'m looking at"), and parked 178g DX Alien ("Alien\'s great!") for 4; Jack 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-beast',
          discUsed: 'Classic Glow Beast',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '168g Classic Glow Beast tee + level 176g Glow Mako3 through trees + 178g DX Alien ("Alien\'s great!") for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-beast' },
            { shotType: 'approach', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 301,
      scores: { jeffery: 3, jack: 5 },
      voiceTranscript:
        'Crushed 169g GStar Roadrunner off the 301ft tee ("That was definitely a good throw!"), parked the approach with 178g DX Alien / 175g Star Sync, and drained a clutch C1 putt ("We\'ve been practicing those putts at home, you get up there and you\'re like, \'Yes, I can make that!\' Parred it!") for a 301ft Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 18,
          voiceNote: '★ 169g GStar Roadrunner drive + DX Alien / Star Sync approach + clutch C1 putt for 301ft Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-sync' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 332,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Threaded 169g GStar Roadrunner right through the only tiny window in the guardian tree ("Right through the only little space in that tree!"), followed with a great 180g Classic Glow Roc 2nd shot ("Yeah, it was a good throw with the Roc Glow!"), and both carded 4s.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '169g GStar Roadrunner through tiny tree gap + 180g Classic Glow Roc 2nd shot for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-classic-glow-roc' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          voiceNote: 'Solid 4 ("Jack knows his discs—he\'s got his 3 that he just knows!")',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 10,
      par: 3,
      distance: 226,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Tried 172g Star Rollo off the tee (turned hard right into a tree), scrambled low under the branches with 178g DX Alien ("An Alien one—hit a branch, but it got me close!"), and both carded 4s.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '172g Star Rollo turned right into tree + 178g DX Alien low scramble close to pin for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 11,
      par: 3,
      distance: 213,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        'Downhill 213ft hole: Piped 170g Halo Star IT dead-straight to the top of the hill with the chest-high "tea-kettle" cue, threw 175g XT Glow Nova nose-up on the downhill approach, and took 4—while Jack drove down the hill with Buzzz SS and drained Par 3 ★ to win Hole 11!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '170g Halo Star IT straight to top of hill (chest-high tea-kettle cue) + XT Glow Nova approach for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Drained downhill Par 3 with Buzzz SS & Roach to win Hole 11 outright!',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 12,
      par: 3,
      distance: 517,
      scores: { jeffery: 6, jack: 7 },
      voiceTranscript:
        '517ft left-curving monster: Debuted 171g Classic Glow Wraith [11|5|-1|3] off the tee ("This is that Wraith, I\'ve never thrown it—hit a tree"), threw 170g DX Archangel 2nd shot (saved from OB by left trees), and threaded a clutch low 176g Glow Mako3 through the tree gaps ("Mako3 down in there, dude! It went through gaps of the trees!") for 6; Jack 7.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '171g Classic Glow Wraith debut tee + DX Archangel 2nd shot + low 176g Glow Mako3 through tree gaps for 6',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'approach', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 13,
      par: 4,
      distance: 604,
      scores: { jeffery: 5, jack: 7 },
      voiceTranscript:
        '604ft Par 4 with water hazard ("This 604 feet, Hole 13... Water? This is the scary hole!"): Navigated the fairway with 169g GStar Roadrunner and 170g Halo Star IT for a Bogey 5 (+1); Jack 7.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '169g GStar Roadrunner + 170g Halo Star IT on 604ft Par 4 water hole for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 14,
      par: 3,
      distance: 355,
      scores: { jeffery: 6, jack: 5 },
      voiceTranscript:
        '355ft 14th hole: Jack won Hole 14 outright with a 5 using his 170g Discraft Cicada while Jeffery carded 6 with 152g Star Mamba.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mamba',
          discUsed: 'Mamba',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          voiceNote: '★ Won Hole 14 outright with a 5!',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 15,
      par: 3,
      distance: 319,
      scores: { jeffery: 5, jack: 7 },
      voiceTranscript: '319ft 15th hole: Jeffery carded 5 with 152g Star Mamba; Jack 7.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mamba',
          discUsed: 'Mamba',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 16,
      par: 3,
      distance: 235,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '235ft scoring hole: Jeffery dialed in 170g Halo Star IT off the tee and 175g KC Pro Aviar for his 4th Par 3 ★ of the round! Jack carded 4 with 175g Discraft Buzzz SS.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ 170g Halo Star IT tee shot + KC Pro Aviar for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 17,
      par: 3,
      distance: 321,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        '321ft 17th hole: Jack won his 4th hole of the round with a 4 using 170g Discraft Cicada while Jeffery carded 5 with 152g Star Mamba.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mamba',
          discUsed: 'Mamba',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          throws: [
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          voiceNote: '★ Won Hole 17 outright with Bogey 4 (4th hole win of the round)!',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 18,
      par: 3,
      distance: 292,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        'Closing 292ft 18th hole: Fired 169g GStar Roadrunner down the fairway, 174g DX Roc3 hit a tree, approached with 175g Star Sync, missed first 175g KC Pro Aviar putt and made it on 5 alongside Jack\'s 5 ("Not bad, Jack! All right!").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '169g GStar Roadrunner drive + DX Roc3 (hit tree) + Star Sync approach + KC Pro Aviar for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_08_ART_NINE: HistoricalRound = {
  id: 1794178980671,
  courseName: 'The Art Nine @ SMP',
  totalHoles: 9,
  date: '2026-11-08',
  duration: '00:21:16',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  updatedAt: 1794190000002,
  notes:
    '🏆 HISTORIC FATHER-SON UNDER-PAR TIE AT THE ART NINE! Jeffery 24 (-3, 🏆 Ties Course Personal Best! 4 Birdies ★ on H2, H5, H6 & H7!) & Jack 24 (-3, 🏆 NEW ALL-TIME PERSONAL BEST BY 3 STROKES & FIRST-EVER UNDER-PAR ROUND! Bogey-Free 3 Birdies ★ on H2, H3 & H8 + 6 Pars!).',
  roundTranscript: `The Art Nine @ SMP Sunday Afternoon Redemption Round (2026-11-08, Part 2 of 27-Hole Sunday Adventure right after Prairie Center Park 18 · 00:21:16 · Par 27 · 1,031 ft · Note: Corrected from phone's default Sar-Ko-Par course label per Jeffery's note "THIS WAS NOT SAR KO PAR. JACK AND I PLAYED THE ART 9") — Jeffery 24 (-3, 🏆 TIED COURSE PERSONAL BEST! 4 Birdies ★) & Jack 24 (-3, 🏆 NEW ALL-TIME PERSONAL BEST BY 3 STROKES & FIRST-EVER UNDER-PAR ROUND! Bogey-Free 3 Birdies ★ & 6 Pars!):
- Hole 1 (132ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Both opened the wooded Shawnee Mission Park loop with clean Par 3s (Jeffery w/ 175g Star Sync, Jack w/ 174g Discraft Roach).
- Hole 2 (103ft, Par 3): Jeffery 2 (Birdie ★) | Jack 2 (Birdie ★). DOUBLE BIRDIES! Jeffery dialed in 170g Halo Star IT and Jack parked 175g Discraft Buzzz SS for matching Birdie 2s (-1 to -1)!
- Hole 3 (100ft, Par 3): Jeffery 3 (Par) | Jack 2 (Birdie ★). Jack buried back-to-back Birdie 2s with his 174g Discraft Roach to move to -2 and take the outright lead! Jeffery carded a steady Par 3 with 170g Halo Star IT.
- Hole 4 (146ft, Par 3): Jeffery 4 (Bogey) | Jack 3 (Par). Jack stayed bogey-free with a clean Par 3 (174g Discraft Roach) while Jeffery took a 4 (174g DX Roc3).
- Hole 5 (111ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). Jeffery bounced right back with 174g DX Roc3 and 175g KC Pro Aviar for Birdie 2 (starting a 3-hole birdie streak!); Jack parred (3).
- Hole 6 (116ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). Jeffery laced 176g Glow Mako3 up the 116ft gap for his 2nd straight Birdie 2 (-2); Jack locked in another Par 3.
- Hole 7 (84ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). Jeffery parked 170g DX Archangel on the 84ft pocket green for a 3rd consecutive Birdie 2 to pull even with Jack at -3! Jack parred (3).
- Hole 8 (102ft, Par 3): Jeffery 3 (Par) | Jack 2 (Birdie ★). Clutch answer from Jack! Jack parked his 174g Discraft Roach for his 3rd Birdie 2 of the round (-3) while Jeffery parred (3) with 170g DX Archangel.
- Hole 9 (137ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Both piped the 137ft closing tunnel (Jeffery w/ 172g Star Rollo, Jack w/ 174g Discraft Roach) for matching Par 3s to finish dead-even at 24 (-3) — tying Jeffery's Art Nine course record and giving Jack his first-ever under-par round (-3, bogey-free)!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 24 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 24 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 132,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Both opened The Art Nine with clean Par 3s down the 132ft wooded chute (Jeffery w/ 175g Star Sync, Jack w/ 174g Discraft Roach).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '175g Star Sync straight down 132ft chute for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '174g Discraft Roach clean opening Par 3',
          throws: [
            { shotType: 'tee', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 103,
      scores: { jeffery: 2, jack: 2 },
      voiceTranscript:
        'DOUBLE BIRDIE 2s on the 103ft wooded ace run! Jeffery parked 170g Halo Star IT and Jack parked 175g Discraft Buzzz SS for matching Birdie 2s!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ 170g Halo Star IT parked for Double Birdie 2 with Jack!',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ 175g Discraft Buzzz SS parked for Double Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 100,
      scores: { jeffery: 3, jack: 2 },
      voiceTranscript:
        'Jack buried back-to-back Birdie 2s on the 100ft 3rd hole with his 174g Discraft Roach to move to -2! Jeffery carded Par 3 with 170g Halo Star IT.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '170g Halo Star IT touch tee shot + Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Back-to-back Birdie 2s with 174g Discraft Roach!',
          throws: [
            { shotType: 'tee', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 146,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        '146ft wooded tunnel: Jack stayed bogey-free with a clean Par 3 (174g Discraft Roach) while Jeffery took 4 (174g DX Roc3).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roc3',
          discUsed: 'Roc3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Steady Par 3 down the 146ft tunnel',
          throws: [
            { shotType: 'tee', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 111,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        '111ft 5th hole: Jeffery parked 174g DX Roc3 and drained the Birdie 2 putt (1st of 3 straight birdies!); Jack carded Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roc3',
          discUsed: 'Roc3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ 174g DX Roc3 parked for Birdie 2 (1st of 3 straight birdies)!',
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          throws: [
            { shotType: 'tee', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 116,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        '116ft uphill 6th hole: Jeffery laced 176g Glow Mako3 for his 2nd straight Birdie 2 (and back-to-back Art Nine H6 birdies with Mako3!); Jack parred (3).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ 176g Glow Mako3 uphill laser for 2nd straight Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          throws: [
            { shotType: 'tee', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 84,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        '84ft shortest hole on course: Jeffery finessed 170g DX Archangel to the pocket green for a 3rd consecutive Birdie 2 (-3)! Jack carded Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ 170g DX Archangel touch shot for 3rd straight Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          throws: [
            { shotType: 'tee', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 102,
      scores: { jeffery: 3, jack: 2 },
      voiceTranscript:
        '102ft 8th hole: Jack parked his 174g Discraft Roach for his 3rd Birdie 2 of the round to reach -3! Jeffery carded Par 3 with 170g DX Archangel.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Clutch 3rd Birdie 2 of the round with 174g Discraft Roach (-3)!',
          throws: [
            { shotType: 'tee', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 137,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '137ft closer: Both piped the closing corridor (Jeffery w/ 172g Star Rollo, Jack w/ 174g Discraft Roach) for matching Par 3s to finish tied at 24 (-3) — tying Jeffery\'s course record and giving Jack a bogey-free 24 (-3) Personal Best!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '🏆 172g Star Rollo closer for Par 3 to tie 24 (-3) Course Personal Best!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '🏆 Par 3 closer to seal a BOGEY-FREE 24 (-3) All-Time Personal Best!',
          throws: [
            { shotType: 'tee', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_09_SARKO: HistoricalRound = {
  id: 1762730000001,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-09',
  duration: '00:28:00',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  updatedAt: 1794300000000,
  notes:
    '🔥 ANOTHER 6-HOLE BIRDIE STREAK (Holes #3–#8) FOR JEFFERY 22 (-5) & JACK EVEN-PAR 27 (E) w/ H1 NEAR-ACE BIRDIE! Monday 4:30 PM Dusk Round (71°F, zero wind) — Jeffery shook off a Hole 1 gallery bogey and a scary 15ft H2 par save to rattle off 6 consecutive Birdie 2s on H3 (GStar Roadrunner), H4 (Classic Glow Roc), H5 (DX Archangel parked 5–7ft!), H6 (DX Roc3 C1), H7 (Halo Star IT parked 5ft past!), and H8 (GStar Roadrunner to 15ft + KC Pro Aviar rim-bounce-in!), finishing at 22 (-5). Jack nearly aced Hole 1 for Birdie 2, parked a 50ft Roach approach to 2ft on H7, and shot an Even-Par 27 (E)!',
  roundTranscript: `Sar-Ko-Par Trails Monday 4:30 PM Dusk Round (2026-11-09, 71°F, Calm / Zero Wind, 9 Holes · Par 27 · 1,414 ft) — Jeffery 22 (-5, 🔥 6 CONSECUTIVE BIRDIES ON HOLES #3–#8! 6 Birdies ★, 2 Pars, 1 Bogey) vs. Jack 27 (E, Tied Sar-Ko-Par Personal Best! 1 Birdie ★ on H1 near-ace, 7 Pars, 1 Bogey).
Played at 4:30 PM in gorgeous 71°F calm dusk weather ("Today has, like, 71. Feels nice, doesn't it? There's no wind") while chatting about Blue Springs, tomorrow's Skate City Glow Night for St. Mary's, and sunrise vs. dusk:
- Hole 1 (138ft, Par 3): Jeffery 4 (Bogey) | Jack 2 (Birdie ★). Jack stepped up first and nearly aced Hole 1 ("Right in there! Oh my gosh, I thought that was gonna be a hole-in-one! Jack birdie, good job, dude!"). With a gallery watching on the path, Jeffery pulled 175g Star Sync way left into a tree ("I had people watching me—I threw it way off to the left, my Sync... hit a tree, I got a four, I'm thinking too much").
- Hole 2 (192ft, Par 3): Jeffery 3 (Par) | Jack 4 (Bogey). Jack kicked into the left-side trees off the tee; Jeffery laced a beautiful 176g Glow Mako3 down the fairway ("There, that felt nice—Mako3, beautiful shot down there!") and buried a nervy 15-foot C1 putt with 175g KC Pro Aviar ("It was a tough, scary par, man, about at least 15 feet—I made it, though! I got a three").
- Hole 3 (162ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). Jeffery pulled 168g GStar Roadrunner off the tee ("Threw the Roadrunner off—that was a perfect shot, I think!") and drained a long putt with 175g KC Pro Aviar ("Puttered it with the Aviar, as usual, the KC Pro—I got a two!") to get back to Even Par and ignite a 6-hole birdie run! Jack carded Par 3.
- Hole 4 (163ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). While talking about tomorrow's glow-themed Skate City night, Jeffery threw 180g Classic Glow Roc [4|4|0|3] ("I'm going with a Roc... curve left, right there where Daddy is—Circle 1!") and locked in to drain a tricky C1 birdie putt ("Tricky birdie—lock in! Did it! I locked in! Two, birdie!"). Jack drained his Par 3 putt ("Heck yeah, buddy!").
- Hole 5 (144ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). Breakthrough tee shot with 170g DX Archangel [8|6|-3|1]—instead of fading far left like usual, it threaded right through the trees and parked 5–7 feet from the basket ("Archangel—get through there! Wow, that's probably the best! Usually I'm far left, went through a lot of trees, kind of right by the basket—five to seven feet away! A bird!"). Jack rolled an approach up and carded Par 3.
- Hole 6 (165ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). In dead-calm air, Jeffery switched from the Roc to 174g DX Roc3 [5|4|0|3] ("Actually, no, we'll throw the Roc3, there's no wind... Fantastic, Roc3! Went right up there to Circle 1, didn't hit a tree at all!"). After making sure Jack stayed safe retrieving the discs near the bank, Jeffery buried the C1 putt for his 4th straight Birdie 2 ("La, da, da, birdie again!") and Jack carded Par 3 ("That was perfect distance—three!").
- Hole 7 (139ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). Debated Roadrunner vs. 170g Halo Star IT [7|6|-2|1] ("Actually, I'll do the IT... Look at it, very cool, you're so locked in! IT was perfect—five feet beyond the basket, couple feet to the left of it! Birdie again, dude!"). Jack threw his Discraft Buzzz SS to 50 feet and parked his Discraft Roach approach to 2 feet ("Jack with your Buzzz, 50 feet away, threw that putter right where it was about two feet—this Roach!") for Par 3.
- Hole 8 (171ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). Pulled 168g GStar Roadrunner around the outside gap to 15 feet right of the pin ("That was cool, Roadrunner—wound up about 15 feet to the right") where he remembered leaving his old Leopard3. His 15-foot KC Pro Aviar birdie putt bounced on the rim and dropped in ("Oh, thank you! It bounced on the rim, and in!") for his 6th consecutive Birdie 2 to reach -5! Jack piped the center gap ("Jack always goes right through there—perfect!") for Par 3.
- Hole 9 (141ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Walking up the steep hill at dusk, Jeffery threw 172g Star Rollo, which flew dead straight without turning ("Thing went as straight as could be and didn't turn"), while Jack carved a sweet S-curve up the hill ("Yeah, buddy! Your S-curves!"). Jeffery's angled hillside birdie bid for 21 (-6) just missed ("Challenging putt, I'm on a hill angled a little bit down to the basket... almost, but oh, par! We did it—I parred it!") to finish a stellar 22 (-5) alongside Jack's Even-Par 27 (E)!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 22 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 27 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 4, jack: 2 },
      voiceTranscript:
        'Jack nearly aced Hole 1 off the tee ("Right in there! Oh my gosh, I thought that was gonna be a hole-in-one! Jack birdie, good job, dude!") for Birdie 2! With bystanders watching, Jeffery pulled 175g Star Sync way left into a tree ("I had people watching me—I threw it way off to the left, my Sync... hit a tree, I got a four").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '175g Star Sync pulled left into tree with gallery watching ("Thinking too much") for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: '★ Near Hole-in-One off the tee ("I thought that was gonna be a hole-in-one!") for tap-in Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Jeffery striped 176g Glow Mako3 down the fairway ("There, that felt nice—Mako3, beautiful shot down there!") and drained a tough 15ft putt with 175g KC Pro Aviar ("It was a tough, scary par, man, about at least 15 feet—I made it, though! I got a three"). Jack kicked into the left trees and scrambled for 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 15,
          voiceNote: '176g Glow Mako3 ("Beautiful shot down there!") + clutch 15ft KC Pro Aviar par save for 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Went into the left-side trees off the tee and scrambled for 4',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'approach', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        'Jeffery laced 168g GStar Roadrunner off the tee ("Beauty! Threw the Roadrunner off—that was a perfect shot, I think!") and drained a long Birdie 2 putt with 175g KC Pro Aviar ("This is kind of a long putt... Puttered it with the Aviar, as usual, the KC Pro—I got a two!") to start a 6-hole birdie streak! Jack carded Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 22,
          voiceNote: '★ 168g GStar Roadrunner ("Perfect shot!") + long KC Pro Aviar putt for Birdie 2 (#1 of 6 straight)!',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Good tee shot + clean Par 3 ("Out of three")',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        'Jeffery pulled 180g Classic Glow Roc [4|4|0|3] ("I\'m going with a Roc... curve left, right there where Daddy is—Circle 1!") and locked in on a tricky C1 putt with 175g KC Pro Aviar ("Tricky birdie—lock in! Did it! I locked in! Two, birdie!"). Jack drained his Par 3 putt ("Heck yeah, buddy!").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-roc',
          discUsed: 'Classic Glow Roc',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 18,
          voiceNote: '★ 180g Classic Glow Roc gentle left curve into C1 + locked-in KC Pro Aviar putt for Birdie 2 (#2 of 6 straight)!',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-roc' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Drained Par 3 putt ("Get it, Jack? Heck yeah, buddy!")',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        'Jeffery threw 170g DX Archangel [8|6|-3|1] straight through the wooded corridor instead of fading far left ("Archangel—get through there! Wow, that\'s probably the best! Usually I\'m far left, went through a lot of trees, kind of right by the basket—five to seven feet away! A bird!") for his 3rd straight Birdie 2! Jack carded Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          voiceNote: '★ 170g DX Archangel threaded the trees (instead of going far left) & parked 5–7ft from pin for Birdie 2 (#3 of 6 straight)!',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Creative roller scramble + Par 3',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        'Switched to 174g DX Roc3 in zero wind ("Actually, no, we\'ll throw the Roc3, there\'s no wind... Fantastic, Roc3! Went right up there to Circle 1, didn\'t hit a tree at all!") and buried the C1 putt for a 4th consecutive Birdie 2 ("La, da, da, birdie again!"). Jack threw perfect distance for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roc3',
          discUsed: 'Roc3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 14,
          voiceNote: '★ 174g DX Roc3 ("Fantastic, Roc3! Right up there to C1, didn\'t hit a tree at all!") for Birdie 2 (#4 of 6 straight)!',
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Perfect distance tee shot + Par 3',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        'Chose 170g Halo Star IT over Roadrunner ("Actually, I\'ll do the IT... Look at it, very cool, you\'re so locked in! IT was perfect—five feet beyond the basket, couple feet to the left of it! Birdie again, dude!") for a 5th straight Birdie 2! Jack threw Buzzz SS to 50ft and parked his Discraft Roach approach to 2ft for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: '★ 170g Halo Star IT ("IT was perfect—5ft beyond the basket, couple feet left!") for Birdie 2 (#5 of 6 straight)!',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          voiceNote: '★ Buzzz SS tee to 50ft + 50ft Discraft Roach approach parked to 2ft for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'approach', discId: 'discraft-roach' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        'Jeffery threw 168g GStar Roadrunner around the outside gap to 15ft right of the pin ("That was cool, Roadrunner—wound up about 15 feet to the right") and his 175g KC Pro Aviar putt bounced on the rim and dropped in ("Oh, thank you! It bounced on the rim, and in!") for a 6th consecutive Birdie 2! Jack piped the direct center gap for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 15,
          voiceNote: '★ 168g GStar Roadrunner to 15ft right + KC Pro Aviar bounced on rim & IN for 6th straight Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Piped the direct center gap ("Jack always goes right through there—perfect!") for Par 3',
          throws: [
            { shotType: 'tee', discId: 'discraft-cicada' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Jeffery threw 172g Star Rollo up the steep dusk hill ("Thing went as straight as could be and didn\'t turn"), while Jack carved a sweet S-curve ("Yeah, buddy! Your S-curves!"). Jeffery\'s angled hillside birdie bid for 21 (-6) just missed ("Almost, but oh, par! We did it—I parred it!") to seal a 22 (-5) alongside Jack\'s Even-Par 27 (E)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '172g Star Rollo flew dead straight up the hill + angled hillside bid for Par 3 to finish 22 (-5)!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Sweet uphill S-curve tee shot ("Yeah! Your S-curves!") + Par 3 closer for an Even-Par 27 (E)!',
          throws: [
            { shotType: 'tee', discId: 'discraft-buzzz-ss' },
            { shotType: 'putt', discId: 'discraft-roach' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_10_SHAWNEE_WOODED: HistoricalRound = {
  id: 1794340210228,
  courseName: 'Shawnee Mission Wooded',
  totalHoles: 18,
  date: '2026-11-10',
  duration: '01:39:43',
  par: 54,
  windCondition: 'calm',
  gameMode: 'stroke',
  updatedAt: 1794365000001,
  notes:
    '🏆 FIRST RECORDED 18-HOLE ROUND AT SHAWNEE MISSION WOODED (4,881 ft · Par 54) — Jeffery 69 (+15 · Front 36 / Back 33 · 8 Pars ★ on H3, H5, H6, H12, H14, H15, H17 & 347ft H18 closer!). Highlighted by Pink DX Alien parking 347ft H18 ("Right there by the pin! Love the Alien!"), Classic Glow Wraith flat low drives on H7 & H9, Glow Mako3 277ft downhill laser on H13, DX Archangel threading trees on H3 & H14, Star Sync "All-Star" approaches, and closing 5 of the final 7 holes with Pars!',
  roundTranscript: `Shawnee Mission Wooded Tuesday Lunchtime 18-Hole Solo Round (2026-11-10 · 12:06 PM Start · Duration 01:39:43 · Par 54 · 4,881 ft · Calm / Slight Late Breeze) — Jeffery 69 (+15 · Front 9: 36 [+9] · Back 9: 33 [+6] · 8 Pars ★ on H3, H5, H6, H12, H14, H15, H17 & H18!).
Played a gorgeous midday sweatpants lunch round at Shawnee Mission Wooded, closing with 5 Pars on the final 7 holes:
- Hole 1 (260ft, Par 3): Jeffery 4 (Bogey). Spotted a female deer (doe) near the water! Threw 168g GStar Roadrunner off the tee (nose-up on the first throw of the day), approached with 174g DX Roc3 and 175g XT Glow Nova, and tapped in for Bogey 4.
- Hole 2 (177ft, Par 3): Jeffery 4 (Bogey). Chose comfort pick 176g Glow Mako3 over Halo IT on the straight wooded chute—clipped an early tree 10–15ft out, scrambled forward with 174g DX Roc3, and got up and down for Bogey 4.
- Hole 3 (187ft, Par 3): Jeffery 3 (Par ★). Switched to 170g DX Archangel through the dense trees ("Missed almost every tree—beautiful, fantastic! Good job, Jeffery, good throw!") before clipping one ~30ft out, approached with 175g KC Pro Aviar, and drained a 5ft putt for his 1st Par 3!
- Hole 4 (305ft, Par 3): Jeffery 4 (Bogey). Straight wooded lane near Renner Rd—fired 176g Glow Mako3 through the initial gap, shaped 172g Star Rollo to ~30ft left of the basket, missed the 30-footer and tapped in for Bogey 4.
- Hole 5 (208ft, Par 3): Jeffery 3 (Par ★). Chose 172g Star Rollo off the tee (clipped a tree pin-high ~40–45ft left), then zipped a laser 175g Star Sync approach to 3 feet behind the pin ("Perfect, beautiful!") for Par 3!
- Hole 6 (187ft, Par 3): Jeffery 3 (Par ★). Threw 170g Halo Star IT off the tee (~40ft out in the clear on the left), pitched 175g Star Sync short after getting distracted by another golfer, and drained a clutch challenging Par 3 putt!
- Hole 7 (355ft, Par 3): Jeffery 5 (+2). Tested 171g Classic Glow Wraith flat off the tee ("Excellent, flat, good! Good job Wraith!"), punched out to the fairway with 174g DX Roc3 (phone call paused recording), approached with 175g Star Sync, and carded 5.
- Hole 8 (302ft, Par 3): Jeffery 4 (Bogey). Wide-open tee finishing left—aimed 168g Classic Glow Beast wide right ("Great shot, Beast!"), stuck a crisp 175g Star Sync approach ("That Sync's an All-Star!"), missed the par try left and tapped in for 4.
- Hole 9 (375ft, Par 3): Jeffery 6 (+3). Long wooded trek down to a distant blue basket—threw 152g Star Mamba & 171g Classic Glow Wraith ("Excellent job Wraith—kept it down like I was supposed to, great flight, I liked that Wraith!") and worked through the trees with Star Sync, Halo IT, Star Rollo, and Glow Mako3 to card 6 (Front 9: 36, +9).
- Hole 10 (248ft, Par 3): Jeffery 4 (Bogey). Downhill left-turning hole—174g DX Roc3 clipped an early guardian tree ("Would have been good, but it hit the tree"), then floated 175g XT Glow Nova down the hill to 10ft past the pin and two-putted for Bogey 4.
- Hole 11 (444ft, Par 3): Jeffery 5 (+2). Massive 444ft Par 3—threw 168g Classic Glow Beast off the tee and again in the open (pulled left: "Not sure I like the Beast all that much"), followed with a great 176g Glow Mako3 and 180g Star Jay approach, and finished with KC Pro Aviar for 5.
- Hole 12 (223ft, Par 3): Jeffery 3 (Par ★). Uphill 223ft hole—dialed the tea-kettle wrist cue with 172g Star Rollo, parked the approach right up by the pin, and tapped in for Par 3!
- Hole 13 (277ft, Par 3): Jeffery 4 (Bogey). Scenic 277ft downhill straight hole—striped 176g Glow Mako3 dead-flat the entire flight ("Straight, beauty, perfect! Flat as can be the whole way!"), wind lifted the par putt, tapped in for Bogey 4.
- Hole 14 (243ft, Par 3): Jeffery 3 (Par ★). Left-finishing wooded hole (requested a basic hole layout outline in the app!)—laced 170g DX Archangel into the left fairway ("Great shot!"), parked the approach right at the pin, and tapped in for Par 3!
- Hole 15 (189ft, Par 3): Jeffery 3 (Par ★). Neat straight wooded corridor (snapped a photo)—threw 176g Glow Mako3 and 180g Star Jay (cool glide loop to 10ft right / 1ft past on the uphill green) and drained the scary uphill putt for back-to-back Par 3s!
- Hole 16 (338ft, Par 3): Jeffery 5 (+2). Chatted with a fellow player about an unmarked disc left in a basket; on the long 338ft uphill hole, threw 168g GStar Roadrunner nose-up into rough, executed a nice uphill skip shot with 172g Star Rollo, sailed the long bid past, and carded 5.
- Hole 17 (214ft, Par 3): Jeffery 3 (Par ★). Into a headwind, 170g Halo Star IT lifted nose-up off the tee, then stuck a pinpoint 180g Star Jay approach ("Almost said I did that one too high, but it was perfect!") for Par 3!
- Hole 18 (347ft, Par 3): Jeffery 3 (Par ★). Huge 347ft closing Par 3! Kept the tea-kettle wrist level to curve 172g Star Rollo right around the guardian tree, then parked 178g Pink DX Alien over the rough right under the basket ("Right there by the pin! I almost thought it was going in—beauty! Love the Alien!") for a closing Par 3 to shoot 69 (+15)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 69 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 260,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Spotted a female deer near the water on Hole 1! Threw 168g GStar Roadrunner off the 260ft tee (came out nose-up / angled on the first throw of the day), approached with 174g DX Roc3 and 175g XT Glow Nova, and tapped in for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Spotted a doe by the water! 168g GStar Roadrunner tee (nose-up 1st throw) + Roc3/Nova for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 177,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Went with comfort pick 176g Glow Mako3 over Halo IT on the straight 177ft wooded chute ("Mako3, I just feel comfortable"), clipped an early tree 10–15ft out, scrambled forward with 174g DX Roc3, and got up and down for Bogey 4 ("Four—not bad!").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '176g Glow Mako3 off tee (clipped early tree) + DX Roc3 scramble for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 187,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Chose 170g DX Archangel through the wooded tunnel ("Missed almost every tree—beautiful, fantastic! Good job, Jeffery, good throw!") before clipping one ~30ft out, pitched 175g KC Pro Aviar, and drained a 5ft putt for his 1st Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: '★ 170g DX Archangel ("Missed almost every tree—beautiful, fantastic!") + 5ft KC Pro Aviar Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 305,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Straight 305ft wooded chute near Renner Rd—fired 176g Glow Mako3 through the initial trees, threw 172g Star Rollo needing a gentle right turn (finished ~30ft left of the basket), missed the 30-footer and tapped in for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '176g Glow Mako3 tee through gap + 172g Star Rollo 2nd shot to 30ft left for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'fairway', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 208,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Switched from caddie\'s IT to 172g Star Rollo off the 208ft tee (clipped a tree pin-high ~40–45ft left), then fired a laser 175g Star Sync approach to 3 feet behind the pin ("Sync—perfect, beautiful!") for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: '★ 172g Star Rollo tee + 45ft 175g Star Sync laser parked 3ft behind pin ("Perfect, beautiful!") for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 187,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 170g Halo Star IT off the 187ft tee (~40ft out in the clear on the left), pitched 175g Star Sync slightly short after getting distracted by another golfer, and drained a clutch challenging Par 3 putt!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 18,
          voiceNote: '★ 170g Halo Star IT tee to clear left pocket + clutch Star Sync putt for back-to-back Par 3s!',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 355,
      scores: { jeffery: 5 },
      voiceTranscript:
        'Long 355ft wooded Par 3—skipped Mamba and tested 171g Classic Glow Wraith flat off the tee ("Excellent, flat, good! Good job Wraith!"), punched out to the fairway with 174g DX Roc3 (phone call interrupted recording), approached with 175g Star Sync, and carded 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '171g Classic Glow Wraith flat tee drive ("Excellent, flat, good job Wraith!") + Roc3 & Star Sync for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'fairway', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 302,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Wide-open tee finishing left (302ft)—aimed 168g Classic Glow Beast wide right ("Great shot, Beast!"), stuck a crisp 175g Star Sync approach ("That Sync\'s an All-Star!"), missed the par putt left and tapped in for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-beast',
          discUsed: 'Classic Glow Beast',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '168g Classic Glow Beast wide-right drive ("Great shot, Beast!") + Star Sync ("All-Star!") for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-beast' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 375,
      scores: { jeffery: 6 },
      voiceTranscript:
        'Long 375ft wooded trek down to a distant blue basket (no white pin in sight)—threw 152g Star Mamba & 171g Classic Glow Wraith ("Excellent job Wraith—kept it down like I was supposed to, great flight, I liked that Wraith!"), then worked through the trees with Star Sync, Halo Star IT, Star Rollo, and Glow Mako3 to card 6.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '171g Classic Glow Wraith low flat drive ("Kept it down like I was supposed to, great flight!") to deep blue pin (6)',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'tee', discId: 'innova-mamba' },
            { shotType: 'fairway', discId: 'innova-sync' },
            { shotType: 'fairway', discId: 'innova-it' },
            { shotType: 'fairway', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-mako3' }
          ]
        }
      }
    },
    {
      number: 10,
      par: 3,
      distance: 248,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Downhill left-turning 248ft hole—threw 174g DX Roc3 off the tee ("Would have been good, but it hit the tree"), floated 175g XT Glow Nova beautifully down the hill to 10ft past the pin, and two-putted for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roc3',
          discUsed: 'Roc3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '174g DX Roc3 tee + 175g XT Glow Nova downhill float to 10ft past pin for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 11,
      par: 3,
      distance: 444,
      scores: { jeffery: 5 },
      voiceTranscript:
        'Massive 444ft Par 3—threw 168g Classic Glow Beast off the tee through the trees and again in the open (pulled way left: "Not sure I like the Beast all that much"), followed with a crisp 176g Glow Mako3 and 180g Star Jay approach, and finished with KC Pro Aviar for 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-beast',
          discUsed: 'Classic Glow Beast',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '444ft monster hole — Beast tee ("Not sure I like the Beast all that much") + Mako3 & Star Jay rescue for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-beast' },
            { shotType: 'fairway', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-jay' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 12,
      par: 3,
      distance: 223,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Uphill 223ft fairway—locked in the tea-kettle wrist cue with 172g Star Rollo off the tee, parked the approach right up by the pin, and tapped in for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: '★ 172g Star Rollo uphill drive (tea-kettle wrist cue) + parked approach right by the pin for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 13,
      par: 3,
      distance: 277,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Scenic 277ft downhill straight white tee—striped 176g Glow Mako3 dead-flat the entire flight ("Straight, beauty, perfect! Flat as can be the whole way!"), wind lifted the par putt, tapped in for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '176g Glow Mako3 277ft downhill laser ("Straight, beauty, perfect! Flat as can be the whole way!") + wind-lifted putt for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 14,
      par: 3,
      distance: 243,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Left-finishing 243ft wooded hole (requested a basic hole layout outline in the app!)—laced 170g DX Archangel into the left fairway ("Great shot!"), parked the approach right at the pin, and tapped in for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: '★ 170g DX Archangel down the left-finishing lane ("Great shot!") + parked approach for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 15,
      par: 3,
      distance: 189,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Picturesque 189ft straight wooded corridor (snapped a photo!)—threw 176g Glow Mako3 and 180g Star Jay (cool glide loop to 10ft right / 1ft past on the uphill green) and drained the scary uphill putt for back-to-back Par 3s!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-jay',
          discUsed: 'Jay',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '★ 180g Star Jay glide loop to 10ft right on the uphill green + drained scary uphill putt for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-jay' },
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 16,
      par: 3,
      distance: 338,
      scores: { jeffery: 5 },
      voiceTranscript:
        'Chatted with a fellow golfer about an unmarked disc left in a basket; on the 338ft uphill hole, 168g GStar Roadrunner clipped a branch nose-up into the rough, threw a sweet uphill skip shot with 172g Star Rollo, sailed the long bid past and carded 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '168g GStar Roadrunner uphill tee + nice 172g Star Rollo skip shot toward pin for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'fairway', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 17,
      par: 3,
      distance: 214,
      scores: { jeffery: 3 },
      voiceTranscript:
        '214ft into a headwind—170g Halo Star IT lifted nose-up into the breeze off the tee, then stuck a clutch 180g Star Jay approach ("Almost said I did that one too high, but it was perfect!") and tapped in for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: '★ Halo Star IT headwind tee + pinpoint 180g Star Jay approach ("It was perfect!") for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-jay' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 18,
      par: 3,
      distance: 347,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Huge 347ft closing Par 3! Kept the tea-kettle wrist flat to curve 172g Star Rollo right around the guardian tree, then parked 178g Pink DX Alien over the rough right under the basket ("Right there by the pin! I almost thought it was going in—beauty! Love the Alien!") for a closing Par 3 to shoot 69 (+15)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          voiceNote: '🏆 172g Star Rollo right around tree + 178g Pink DX Alien parked under 347ft pin ("Love the Alien!") for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-dx-alien' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_11_SARKO: HistoricalRound = {
  id: 1794431460810,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-11',
  duration: '00:26:28',
  par: 27,
  windCondition: 'headwind',
  weather: 'Very Windy Afternoon',
  gameMode: 'stroke',
  updatedAt: 1794456000001,
  notes:
    '💨 HEAVY-WIND AFTERNOON BATTLE AT SAR-KO-PAR (2026-11-11 · 2:40 PM · 00:26:28) — Jeffery 28 (+1 · 2 Birdies ★ on H3 & H5, 4 Pars on H1/H6/H7/H8, 3 Bogeys on H2/H4/H9). Laced Halo Star IT right behind H3 pin + drained 30ft Birdie 2, skipped Classic Glow Roc flat & low on H5 for Birdie 2 ("Oh, baby!"), floated a 20+ ft wind putt in on H7 ("Just floated in the wind—it was beautiful!"), and clipped the top band twice in the gusts (H1 & H4).',
  roundTranscript: `Sar-Ko-Par Trails Very Windy Afternoon Solo Round (2026-11-11 · 2:40 PM Start · Duration 00:26:28 · Par 27 · 1,414 ft · Very Windy) — Jeffery 28 (+1 · 2 Birdies ★, 4 Pars, 3 Bogeys).
Battled stiff afternoon gusts on a quick 26-minute lunch/afternoon loop ("Windy today—very windy... Blame it on the wind"):
- Hole 1 (138ft, Par 3): Jeffery 3 (Par). Threw usual 175g Star Sync off the tee—landed pin-high 10 feet right of the basket ("Exact right distance"), birdie putt caught the top band in the wind ("Oh, the top—three"), tapped in for Par 3.
- Hole 2 (192ft, Par 3): Jeffery 4 (Bogey). Debated Mako3, Archangel, Wraith, and 170g Halo Star IT in the heavy wind (questioned Hole 2's fairway map outline and suggested checking UDisc)—Halo IT caught the left trees, pitched through tough branches on shot 2, par putt nearly dropped ("Oh, that was going in"), tapped in for Bogey 4.
- Hole 3 (162ft, Par 3): Jeffery 2 (Birdie ★). Laced 170g Halo Star IT on a dead-straight flat ace-run that skipped right behind the basket ("Perfect straight, flat shot—thought it was going to hit the basket or go in it!"), leaving a ~30-footer around a tree—stepped up and drained it ("Right there! I hit the pin!") for Birdie 2!
- Hole 4 (162ft, Par 3): Jeffery 4 (Bogey). Noted Hole 4's layout map looked accurate; threw 170g DX Archangel off the tee but lifted the tea-kettle wrist up into a tree, pitched 175g Star Sync safe, clipped the top band on the par putt ("Hit the top, darn it—bogey 4, hit the band on the basket, so aim lower"), tapped in for 4.
- Hole 5 (144ft, Par 3): Jeffery 2 (Birdie ★). Debated IT, Roadrunner, and Roc—picked 180g Classic Glow Roc ("Roc, Roc, Roc, Roc!"), skipped it flat and low down the corridor ("Flat, perfect, flat, little low—I like it!"), nicked a late tree, and buried the birdie putt ("Give it a... Oh, baby!") for Birdie 2!
- Hole 6 (165ft, Par 3): Jeffery 3 (Par). Checked the app for last hole's thrown disc (requested showing the actual collector card of the disc thrown last time on the hole!), piped 170g DX Archangel cleanly ("No way. Nice, dude!"), and carded Par 3.
- Hole 7 (139ft, Par 3): Jeffery 3 (Par ★). Tee shot with 170g Halo Star IT went dead straight right up to the base of the mound ("Went super straight right up to the hill"), 175g Star Sync approach got lifted nose-up by the wind ("The wind took it, super nose up"), then drained a 20+ ft wind-floater putt ("Parred it! That was a long one, about 20 feet at least—just floated in the wind, it was beautiful!") for Par 3!
- Hole 8 (171ft, Par 3): Jeffery 3 (Par). Debated Roc3 vs. 170g DX Archangel through the trees—wind lifted DX Archangel into a branch, scrambled close on shot 2 ("Getting as close in 2 as I can—got it"), and tapped in for Par 3.
- Hole 9 (141ft, Par 3): Jeffery 4 (Bogey). Threw 172g Star Rollo up the steep hill in heavy wind (aimed further right than usual and drifted too far right), par putt rolled down the H9 slope ("Oh, no, it rolled—I'm gonna get a bogey... Blame it on the wind"), finishing at 28 (+1).`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 28 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Stuck with usual 175g Star Sync off the tee in stiff wind—landed pin-high 10ft right ("Puts me at 10 feet to the right, but exact right distance"), birdie putt hit the top band of the basket, tapped in for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '175g Star Sync pin-high 10ft right + birdie putt clipped top band in wind for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Very windy—chose 170g Halo Star IT over Mako3/Archangel/Wraith (also noted Hole 2 map outline needed checking against UDisc). Kicked into the left trees, pitched through tough branches on shot 2, par bid lipped out ("Oh, that was going in—got a four") for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: '170g Halo Star IT into left trees in heavy wind + tough branch pitch-out for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Laced 170g Halo Star IT on a dead-straight flat ace-run right past the chains ("Oh, I thought that was going to skip up into the pin! Threw the IT—perfect straight, flat shot, went right behind it") and drained a ~30ft comeback putt around a tree ("Right there! I hit the pin!") for Birdie 2!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 30,
          voiceNote: '★ 170g Halo Star IT flat straight ace-run behind pin + drained 30ft putt ("Right there, I hit the pin!") for Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Noted Hole 4 layout outline looked accurate! Threw 170g DX Archangel off the tee but lifted the tea-kettle wrist up into a tree, pitched 175g Star Sync up safe, clipped the top band of the basket on the par try ("Hit the top, darn it—bogey 4, hit the band on the basket, so aim lower"), and tapped in for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: '170g DX Archangel (lifted tea-kettle wrist into tree) + Star Sync pitch + top-band hit in wind for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Debated IT, Roadrunner, and Roc—went with 180g Classic Glow Roc ("Roc, Roc, Roc, Roc!"), skipped it flat and low down the corridor ("Some skips—flat, perfect, flat, little low, I like it!"), nicked a tree near the green, and buried the putt ("Give it a... Oh, baby!") for Birdie 2!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-roc',
          discUsed: 'Classic Glow Roc',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 18,
          voiceNote: '★ 180g Classic Glow Roc low flat skip shot ("Flat, perfect, little low—I like it!") + drained Birdie 2 ("Oh, baby!")!',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-roc' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Checked the app to see what disc he threw last time on this hole (requested showing the actual collector card of the last-thrown disc!), piped 170g DX Archangel cleanly ("No way. Nice, dude!"), and tapped in for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: '170g DX Archangel clean drive ("No way. Nice, dude!") + steady Par 3 in the wind',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 170g Halo Star IT super straight right up to the mound ("Went super straight right up to the hill"), 175g Star Sync approach got lifted nose-up by a gust ("The wind took it, super nose up"), then floated in a 20+ ft wind putt ("Parred it! About 20 feet at least—just floated in the wind, it was beautiful!") for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 22,
          voiceNote: '★ Halo Star IT straight to hill + drained 20+ ft wind-floater putt ("Just floated in the wind—it was beautiful!") for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Debated Roc3 vs. 170g DX Archangel through the trees—wind lifted DX Archangel into a branch, scrambled right up to the pin on shot 2 ("Getting as close in 2 as I can—got it, should get a par"), and tapped in for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: '170g DX Archangel (wind lifted into branch) + clutch scramble close to pin for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Threw 172g Star Rollo up the steep hill in stiff wind—aimed further right than usual and turned slightly too far right, par putt rolled down the H9 slope ("Oh, no! It rolled! I\'m gonna get a bogey... Blame it on the wind") for Bogey 4 to finish at 28 (+1).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: '172g Star Rollo uphill right turn in heavy wind + sloped green roll-away for Bogey 4 (28 / +1)',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_13_SARKO: HistoricalRound = {
  id: 1794604626353,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-13',
  duration: '00:21:40',
  par: 27,
  windCondition: 'calm',
  weather: 'Chilly Short-Sleeve Friday · Slight Breeze (2:53 PM)',
  gameMode: 'stroke',
  updatedAt: 1794616245304,
  notes:
    '🔥 BOGEY-FREE 25 (-2) IN CHILLY SHORT-SLEEVE FRIDAY AIR AT SAR-KO-PAR (2026-11-13 · 2:53 PM · 00:21:40) — Jeffery 25 (-2 · 2 Birdies ★ on H1 & H4, 7 Pars, ZERO Bogeys!). Opened with a parked Star Sync Birdie 2 ("3–4 ft behind the pole, 1 ft left"), rescued Par 3 out of H2 deep left woods with an XT Glow Nova ("Couldn\'t have done better getting out of that"), bounced DX Roc3 off a H4 branch for Birdie 2, discovered dynamic straight-across 90° pocket timing on H5 ("Tea-kettle down low"), and smartly laid up Star Sync on H9 to protect the bogey-free 25 (-2)!',
  roundTranscript: `Sar-Ko-Par Trails Chilly Short-Sleeve Friday Solo Round (2026-11-13 · 2:53 PM · Duration 00:21:40 · Par 27 · 1,414 ft · Slight Breeze) — Jeffery 25 (-2 · 2 Birdies ★, 7 Pars, ZERO Bogeys!).
Brisk 21-minute bogey-free Friday afternoon loop testing the new "Thrown Last Time" cards live on the course:
- Hole 1 (138ft, Par 3): Jeffery 2 (Birdie ★). Went with usual 175g Star Sync in slight wind—aimed right and let it fade smoothly 3–4 ft behind & 1 ft left of the pole ("Right there! 3–4 feet behind the pole, 1 foot left—easy bird!") for Birdie 2!
- Hole 2 (192ft, Par 3): Jeffery 3 (Par ★). Chose 168g GStar Roadrunner over Glow Mako3—released nose-up high left deep into the woods ("Too high to the left, nose up! Way up here in the woods"). Executed a surgical scramble out with 175g XT Glow Nova ("Throw that Nova... Couldn't have done better getting out of that!") to save Par 3!
- Hole 3 (162ft, Par 3): Jeffery 3 (Par). Spotted Halo Star IT in "Thrown Last Time" ("Last time I did the IT here, huh?") and ran 170g Halo Star IT again—stayed right without fading left quite enough, pitched close, and saved Par 3.
- Hole 4 (162ft, Par 3): Jeffery 2 (Birdie ★). Checked "Thrown Last Time" ("Says I threw the Archangel last time? Crazy—I'm going with the Roc3 this time!"). 174g DX Roc3 clipped a branch onto the exact pin line 7–8 ft left ("Hit a branch, kicked it right where it needed to be!") and drained the Birdie 2 putt!
- Hole 5 (144ft, Par 3): Jeffery 3 (Par). Threw 174g DX Roc3 again while locking in a big form key ("Not so worried about doing that 90-degree angle at start-up—getting the hang of doing that as I pull through straight across, tea-kettle down low!"). Clipped a branch ~25 ft long and tapped in Par 3 ("No bogeys so far!").
- Hole 6 (165ft, Par 3): Jeffery 3 (Par). Chose 170g Halo Star IT in a slight breeze—tiny nose-up kicked a left tree down into the ravine, scrambled cleanly ("Stop. Right there.") for Par 3.
- Hole 7 (139ft, Par 3): Jeffery 3 (Par). High 174g DX Roc3 line hooked slightly less left than wanted, pitched close ("Very close, getting it up in 2"), tapped in Par 3.
- Hole 8 (171ft, Par 3): Jeffery 3 (Par). Tee drive sailed 20–25 ft past the pin onto the paved walking path as a runner went by ("That hit the path... 20 feet behind the pin"), drained the 20 ft comebacker for Par 3!
- Hole 9 (141ft, Par 3): Jeffery 3 (Par). Considered uphill Star Rollo, then smartly pivoted to 175g Star Sync to avoid any roll-away risk ("Maybe I should just throw the Sync, because I really don't want it to roll down... Ending the day with a 25! Stop. It's alright—parred it, done!") to lock in a bogey-free 25 (-2)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 25 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Usual 175g Star Sync in a light breeze—aimed right, faded gently to 3–4 ft behind the pole & 1 ft left ("Right there! Easy bird!") for opening Birdie 2.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: '★ 175g Star Sync parked 3–4ft behind pin (1ft left) + easy Birdie 2 tap-in!',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Picked 168g GStar Roadrunner over Mako3—released nose-up high into the deep left woods ("Way up here in the woods... Throw that Nova! Couldn\'t have done better getting out of that!"), scrambled out cleanly with 175g XT Glow Nova to save Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: 'GStar Roadrunner nose-up into left woods + clutch XT Glow Nova scramble ("Couldn\'t have done better!") for Par 3 ★',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Spotted Halo Star IT in "Thrown Last Time" ("Last time I did the IT here, huh?") and ran 170g Halo Star IT back—drifted slightly right without full left fade, pitched close for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '170g Halo Star IT re-throw ("Last time I did the IT here, huh?") right of pin + Par 3 save',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Read "Thrown Last Time" ("Says I threw the Archangel last time? Crazy—I\'m going with the Roc3 this time!"). Stroked 174g DX Roc3, clipped a branch onto the pin line 7–8 ft left ("Exact distance it needed to be!") and buried Birdie 2!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roc3',
          discUsed: 'Roc3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: '★ 174g DX Roc3 clipped branch to 7–8ft pin-high left + drained Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 174g DX Roc3 again while dialing straight pull-through timing ("Not worried about 90° at start-up—getting the hang of it as I pull through straight across, tea-kettle down low!"). Clipped a branch ~25 ft long, good birdie bid & Par 3 ("No bogeys so far!").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roc3',
          discUsed: 'Roc3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 25,
          voiceNote: '174g DX Roc3 ~25ft past ("pull straight across into 90° pocket, tea-kettle low") + Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Chose 170g Halo Star IT in slight wind—tiny nose-up caught a left tree down into the ravine, pitched up cleanly ("Stop. Right there.") for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: '170g Halo Star IT left into ravine + clutch pitch-out up-and-down Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Thrown high with 174g DX Roc3—hooked left ("did a good left hook, not as much as I wanted"), pitched very close ("getting it up in 2") and tapped in Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roc3',
          discUsed: 'Roc3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          voiceNote: '174g DX Roc3 high left hook + close upshot for steady Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Tee shot carried 20–25 ft past the pin onto the paved walking path as a runner passed ("That went far... hit the path, 20 feet behind the pin"), then converted the 20 ft comebacker for Par 3 to keep 25 (-2) alive.',
      meta: {
        jeffery: {
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          voiceNote: 'Tee drive carried 20–25ft onto walking path behind H8 pin + 20ft Par 3 save',
          throws: [{ shotType: 'putt', discId: 'innova-kc-pro-aviar' }]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Debated uphill Star Rollo, then smartly pivoted to 175g Star Sync to prevent a roll-away bogey ("Maybe I should just throw the Sync, because I really don\'t want it to roll down... Ending the day with a 25!"), parked safe and tapped in Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: '★ Smart 175g Star Sync safety tee up H9 hill (zero roll-away!) to clinch bogey-free 25 (-2)!',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_15_PRAIRIE_PASS: HistoricalRound = {
  id: 1763239440000,
  courseName: 'Blue Valley "Prairie Pass" DG Course',
  totalHoles: 18,
  date: '2026-11-15',
  duration: '01:28:00',
  par: 54,
  windCondition: 'cross_lr',
  gameMode: 'stroke',
  notes:
    'Sunday Afternoon 18-Hole Debut at Blue Valley "Prairie Pass" (Standard Layout · Par 54 · 4,209 ft) — 🏆 DOUBLE ALL-TIME 18-HOLE PERSONAL BESTS! Jeffery 65 (+11 · Front 33 / Back 32 · 8 Par 3s ★ on H2, H3, H4, H8, H10, H12, H14 & H16 — beating his 69 SMP Wooded PB by 4 strokes!) & Jack 71 (+17 · Front 36 / Back 35 · 3 Par 3s ★ on H3, H4 & H14, zero 6s/7s — crushing his 86 Prairie Center PB by 15 strokes!). Played with in-hand bag (Toro & Beast removed while Cotton Candy discs are in transit).',
  roundTranscript: `Blue Valley "Prairie Pass" DG Course 18-Hole Father-Son Debut (2026-11-15 · 2:44 PM · Standard Short Tees · Par 54 · 4,209 ft · Chilly crosswind & low winter sun) — 🏆 DOUBLE ALL-TIME 18-HOLE PERSONAL BESTS: Jeffery 65 (+11, Front 33 / Back 32, 8 Pars ★) & Jack 71 (+17, Front 36 / Back 35, 3 Pars ★)!
Bag Note: Cotton Candy "Sugar High" discs are not in hand yet, so Jeffery played with his existing bag minus Star Toro & Classic Glow Beast ("Almost like an 18-hole Sar-Ko-Par!"):
- Hole 1 (216ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Chose Standard short tees for debut ("Let's do the shorter, go for a good score!"). Crosswind from left with steep hill left & OB; Jeffery hit a tree with 172g Star Rollo and approached uphill with 175g Star Sync; Jack threw a beauty off the tee and both opened with Bogey 4s ("We both got boogies").
- Hole 2 (218ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Confirmed 218ft Standard tee vs 282ft Advanced tee. Jeffery threw 172g Star Rollo right of left-side trouble and parked his 2nd shot right under the basket ("Right under the basket—this is perfect!") for Par 3; Jack reached Circle's edge in 2 and carded 4.
- Hole 3 (232ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). Jeffery bombed 176g Glow Mako3 ~192ft to 40ft out, survived a downhill roll-away left to save Par 3 with 175g KC Pro Aviar; Jack drained a 15-footer to par it ("Jack, 15 feet out—parred it!") while learning pro foot-fault rules ("This is our 1st season—it's the off-season now!").
- Hole 4 (236ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). Jeffery striped 169g GStar Roadrunner ~200ft on a "straight box-cutter line" with tiny left finish to 30–35ft for Par 3 ("3 straight Pars!"); Jack ripped a "beautiful shot" with textbook form for back-to-back Par 3s!
- Hole 5 (270ft, Par 3): Jeffery 5 (+2) | Jack 5 (+2). Both pulled nose-up tee drives right into the trees; Jeffery battled through a Halo Star IT tomahawk into another tree, Pink DX Alien pitch-out, and 175g Star Sync up-and-in for 5 (his ONLY 5 of the entire 18 holes!).
- Hole 6 (215ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Jeffery threw Roc low left into a tree, stopping literally 1 foot from dropping down a storm drain gutter ("This close to going down in a gutter!"), tossed KC Pro Aviar 20ft past, and both carded 4s.
- Hole 7 (195ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Scary dense woods featuring a hanging tire; Jack piped the gap straight and Jeffery approached with 175g Star Sync as both took Bogey 4s ("Boogie, boogie").
- Hole 8 (202ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Shot of the Front 9! Jeffery parked 170g DX Archangel exact pin-high, 10 feet left ("Perfectly straight, flat, slight left—mine went the exact distance as the pin, 10 feet to the left! Like an angel! You have to keep that one in the bag—permanent, keep this one!"), narrowly missed the birdie putt under low branches for tap-in Par 3; Jack took 4.
- Hole 9 (195ft, Par 3): Jeffery 4 (Bogey) | Jack 5 (+2). Straight wooded gap near night-game field lights—both hit trees ~50ft off the tee; Jeffery scrambled with 176g Glow Mako3 for Bogey 4 ("Oh, you got a five—I got a four, that's right") to turn in 33 (+6) to Jack's 36 (+9).
- Hole 10 (235ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). After chatting about Jack's 5-foot near-ace on Hole 4 at Grandma's the day before, Jeffery laced a "10 out of 10" straight-gliding 172g Star Rollo tee shot, survived a 15ft downhill roll-away hitting metal, and saved Par 3; blinding low winter sun caught Jack's eyes for Bogey 4.
- Hole 11 (252ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Wrapped 172g Star Rollo right into the woods, then executed a textbook 175g XT Glow Nova stop-and-drop right on top of the scary elevated mound basket surrounded by thorns ("Stop at the top—perfect!") for 4; Jack clanked the top band on the mound and tapped in 4.
- Hole 12 (193ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Shortest hole straight through the woods—Jeffery threaded 170g DX Archangel through the branches ("Three, I parred it!") while Jack fired his Discraft Roach down the chute ("I thought that was gonna fly right into it!") for 4.
- Hole 13 (298ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Longest hole on Standard Layout—Jeffery coached Jack's straight chest-high pull-through ("Keep wrist down—above the shoulder is nose up"), drove GStar Roadrunner to 150ft, and fired a dead-straight 178g Pink DX Alien laser ("Straight as an Alien would—I thought that was going in!") into the bushes behind the pin for matching 4s ("We're tied!").
- Hole 14 (197ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). Wooded hole #2 with hanging tire & thorns—Jack carded a clean Par 3 ("You're getting regular 4s and 3s—zero 7s or 8s!") and Jeffery snuck a touch comeback putt over the cage for Par 3 before checking Jack's tonsils and catching gum on two fingers!
- Hole 15 (242ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Open left-tucked basket into bright winter sun while planning a Thanksgiving round at Grandma's course; hyzer curve avoided rolling away as both carded 4s.
- Hole 16 (270ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Steep downhill roll-away basket—Jeffery bombed 171g Classic Glow Wraith dead straight ("That Wraith was good, I liked it!") and smartly switched from Sync to 175g XT Glow Nova so it wouldn't slide down the cliff ("Stop! Good job, Nova! Good, stay!") for Par 3 #8; Jack took 4.
- Hole 17 (282ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). 2nd longest hole—drove 169g GStar Roadrunner in fading breeze and punched Pink DX Alien low into blinding sun to 30–40ft for matching Bogey 4s ("What'd you get? Me too!").
- Hole 18 (260ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Shaped around the guardian tree, threw 175g KC Pro Aviar with torque up-and-left slightly long toward Hole 1, and saved Bogey 4 alongside Jack's 4 after a Nova roll—playing Higher/Lower post-round to reveal Jack's 71 (+17 PB!) and Jeffery's 65 (+11 PB: "65—11 over, 54 is the par!")!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 65 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 71 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 216,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Crosswind from left with hill left & OB. Jeffery hit early tree with 172g Star Rollo and approached uphill with 175g Star Sync; Jack threw a beauty off the tee and both opened with Bogey 4s ("We both got boogies").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: '172g Star Rollo into tree + 175g Star Sync uphill approach for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Beautiful opening drive + Bogey 4'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 218,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '218ft Standard tee vs 282ft long tee. Jeffery threw 172g Star Rollo right ("definitely did not go left") and parked his 2nd shot ("Right under the basket—this is perfect!") for Par 3! Jack hit Circle\'s edge in 2 for 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          voiceNote: '★ 172g Star Rollo right + parked approach right under basket for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Reached Circle\'s edge in 2; Bogey 4'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 232,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Jeffery launched 176g Glow Mako3 ~192ft to 40ft out, watched 2nd shot roll left on downhill green, and converted Par 3 with 175g KC Pro Aviar! Jack drained a 15-footer ("Jack, 15 feet out—parred it!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 15,
          voiceNote: '★ ~192ft 176g Glow Mako3 drive to 40ft + 175g KC Pro Aviar downhill Par 3 save!',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 15,
          voiceNote: '★ Drained 15ft putt for Par 3!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 236,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Jeffery ripped 169g GStar Roadrunner ~200ft on a "straight box-cutter line" with tiny left fade to 30–35ft for a 3rd straight Par 3! Jack striped a "beautiful shot" with textbook form for back-to-back Par 3s!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          voiceNote: '★ 200ft "straight box-cutter line" 169g GStar Roadrunner drive to 30–35ft + Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ "That was a beauty, Jack!" — back-to-back Par 3s!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 270,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        'Both threw nose-up into right-side trees. Jeffery scrambled with Halo Star IT tomahawk into a tree, Pink DX Alien pitch-out, and 175g Star Sync up-and-in for 5 (only 5 of the round!).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: 'Halo Star IT into trees + IT tomahawk + DX Alien + Star Sync up-and-in for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'fairway', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Tee shot into right trees; scrambled for 5'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 215,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Jeffery threw DX Roc3 low left into a tree, stopping 1 foot from falling down a storm drain gutter ("A foot away from going down in a gutter!"), pitched KC Pro Aviar 20ft past, and both carded Bogey 4s.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roc3',
          discUsed: 'Roc3',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          voiceNote: 'DX Roc3 stopped 1ft from storm drain gutter + KC Pro Aviar approach & Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roc3' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Nice tee drive + Bogey 4'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 195,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Scary dense wooded corridor with a hanging tire. Jack piped the center lane straight; Jeffery pitched up with 175g Star Sync and both took Bogey 4s ("Boogie, boogie").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: 'Wooded hanging-tire hole + 175g Star Sync approach for Bogey 4',
          throws: [
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: 'Piped wooded gap straight + Bogey 4'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 202,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Shot of the Front 9! Jeffery parked 170g DX Archangel exact pin-high 10ft left ("Perfectly straight, flat, slight left—exact distance as the pin, 10ft left! Like an angel! Permanent keep in the bag!"), just missed birdie under low branches for Par 3; Jack got 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: '★ 170g DX Archangel parked pin-high 10ft left ("Like an angel! Permanent keep!") + Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Pretty drive + overhanging branches putt for Bogey 4'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 195,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Straight wooded tunnel near night-game lights—both hit guardian trees ~50ft off the tee. Jeffery scrambled with 176g Glow Mako3 for Bogey 4 ("Oh, you got a five—I got a four") to finish Front 9 at 33 (+6) vs Jack\'s 36 (+9).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: '176g Glow Mako3 off 50ft tree + scramble Bogey 4 (Front 9: 33 / +6)',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'fairway', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Early tree kick at 50ft; 5 to close Front 9 at 36'
        }
      }
    },
    {
      number: 10,
      par: 3,
      distance: 235,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Slight downhill 235ft Back-9 opener. Jeffery piped a "10 out of 10" straight-gliding 172g Star Rollo tee shot, survived a 15ft downhill roll-away off the basket, and drained the comebacker for Par 3! Blinding winter sun gave Jack a Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 15,
          voiceNote: '★ "10 out of 10" 172g Star Rollo glide drive + clutch 15ft downhill Par 3 save!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: 'Parked approach by pin, winter sun glare led to Bogey 4'
        }
      }
    },
    {
      number: 11,
      par: 3,
      distance: 252,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        '172g Star Rollo wrapped right into woods, then Jeffery stuck 175g XT Glow Nova dead on top of the elevated mound basket surrounded by thorns ("Stop at the top—perfect!") for Bogey 4; Jack hit the top band and tapped in 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: 'Star Rollo right turn + 175g XT Glow Nova parked dead on top of mound pin for 4!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Hit top band on elevated mound basket; Bogey 4'
        }
      }
    },
    {
      number: 12,
      par: 3,
      distance: 193,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Shortest hole straight through woods! Jeffery threaded 170g DX Archangel through the branches ("Three, I parred it!"); Jack fired Discraft Roach straight down the gap ("I thought that was gonna fly right into it!") for 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: '★ 170g DX Archangel straight through wooded corridor for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: 'Fired Roach straight through woods gap; Bogey 4'
        }
      }
    },
    {
      number: 13,
      par: 3,
      distance: 298,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        '298ft longest hole—coached Jack\'s flat chest-high pull-through, drove 169g GStar Roadrunner halfway (150ft), and fired a dead-straight 178g Pink DX Alien approach ("Straight as an Alien would—I thought that was going in!") into the bushes for matching 4s.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: '169g GStar Roadrunner + 150ft laser Pink DX Alien approach for Bogey 4 ("We\'re tied!")',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: 'Good drive on 298ft longest hole + matching Bogey 4'
        }
      }
    },
    {
      number: 14,
      par: 3,
      distance: 197,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Back in the woods with hanging tire #2 & thorns. Jack carded a steady Par 3 ("You\'re getting regular 4s and 3s—zero 7s or 8s!") and Jeffery snuck a clutch putt out of the woods for matching Par 3s!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 14,
          voiceNote: '★ Halo Star IT out of trees + clutch Par 3 putt ("almost a little weak, went in!")',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Clean wooded Par 3 (#3 of round!)'
        }
      }
    },
    {
      number: 15,
      par: 3,
      distance: 242,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Open fairway with basket tucked left in blinding winter sun while talking about playing Grandma\'s course on Thanksgiving; hyzer curve avoided rolling away as both carded Bogey 4s.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: 'Good skip-hop tee drive in bright sun + curve-back approach for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-roc3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: 'Beautiful drive into low sun + Bogey 4'
        }
      }
    },
    {
      number: 16,
      par: 3,
      distance: 270,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Dangerous steep downhill basket! Jeffery crushed 171g Classic Glow Wraith dead straight ("That Wraith was good, I liked it!") and switched from Sync to 175g XT Glow Nova so it stopped on the slope ("Stop! Good job, Nova! Good, stay!") for Par 3 #8! Jack took 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          voiceNote: '★ 171g Classic Glow Wraith straight bomb + 175g XT Glow Nova downhill stop-and-drop Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Good roller carry off tee + tricky downhill green Bogey 4'
        }
      }
    },
    {
      number: 17,
      par: 3,
      distance: 282,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        '282ft straight 2nd-longest hole. Jeffery drove 169g GStar Roadrunner as the breeze died, then punched 178g Pink DX Alien low into blinding sun to 30–40ft for matching Bogey 4s ("What\'d you get? Me too!").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: '169g GStar Roadrunner tee + Pink DX Alien into sun for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: 'Landed right alongside Jeffery\'s drive + matching Bogey 4'
        }
      }
    },
    {
      number: 18,
      par: 3,
      distance: 260,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        '260ft closer curving around guardian tree back toward Hole 1. Jeffery threw Halo Star IT off tee, torqued 175g KC Pro Aviar up-and-left past the pin, and saved Bogey 4 after a Nova roll alongside Jack\'s 4—sealing 65 (+11 PB!) & Jack\'s 71 (+17 PB!)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-it',
          discUsed: 'Halo IT',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: 'Halo Star IT + KC Pro Aviar torque shot + Bogey 4 to clinch All-Time 18-Hole PB 65 (+11)!',
          throws: [
            { shotType: 'tee', discId: 'innova-it' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Closing Bogey 4 to seal All-Time 18-Hole PB 71 (+17 — 15 strokes better than Prairie Center)!'
        }
      }
    }
  ]
};

const ROUND_2026_11_16_SARKO_1: HistoricalRound = {
  id: 1763324400000,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-16',
  duration: '00:26:00',
  par: 27,
  windCondition: 'calm',
  weather: '55–57°F · Nice Day, Slight Wind (2:20 PM · Round 1 of 2)',
  gameMode: 'stroke',
  updatedAt: 1763326200000,
  notes:
    'Solo Afternoon Round 1 of 2 (55–57°F, Slight Wind) — Jeffery 26 (-1, 2 Birdies ★, 6 Pars, 1 Bogey)! 175g Star Sync SMACKED THE BASKET on Hole #1 (nearly an Ace!), confirmed never to tee with Nova on H1, tested trimmed Cotton Candy-focused lineup (Classic Glow Roc & Champion Eagle skips), and birdied out on Hole #9 with Star Rollo + ~18ft downhill XT Glow Nova putt!',
  roundTranscript: `Sar-Ko-Par Trails Solo Afternoon Session — Round 1 of 2 (2026-11-16 · 2:20 PM · 55–57°F, Slight Wind) — Jeffery 26 (-1, 2 Birdies ★, 6 Pars, 1 Bogey).
Trimmed bag session testing Cotton Candy staples (Champion Eagle, XT Glow Nova, KC Pro Aviar) alongside Classic Glow Roc, Star Sync, DX Archangel, GStar Roadrunner & Star Rollo:
- Hole 1 (138ft, Par 3): Jeffery 2 (Birdie ★). Practice test with XT Glow Nova drifted right ("Never do the Nova on this one again"); stepped up with 175g Star Sync and HIT THE BASKET—inches from a 138ft Ace ("Oh shit, that was almost an ace! That hit the basket!") for a tap-in Birdie 2!
- Hole 2 (192ft, Par 3): Jeffery 3 (Par). Tested 170g DX Archangel off tee into left trees (comparison Classic Glow Roc was cleaner, slightly nose-up); played original Archangel lie and threaded 175g XT Glow Nova through branches to save Par 3!
- Hole 3 (162ft, Par 3): Jeffery 3 (Par). Overpowered 168g GStar Roadrunner long and left near the trail; pitched high and drained a clutch Par 3 save with 175g KC Pro Aviar ("KC Pro Aviar, save par, please—Parred!").
- Hole 4 (162ft, Par 3): Jeffery 3 (Par). Threw 180g Classic Glow Roc while culling the bag toward Cotton Candy—flew dead-straight down the right line without hooking left like Roc3; parked 175g XT Glow Nova right at the pin for Par 3!
- Hole 5 (144ft, Par 3): Jeffery 3 (Par). Threw 180g Classic Glow Roc off the tee to ~10ft right and 7ft deep (~12ft C1 birdie look); missed the birdie bid and tapped in Par 3 (-1 through 5).
- Hole 6 (165ft, Par 3): Jeffery 4 (Bogey). Tested 175g Champion Eagle off the tee—got a nice intended left skip, missed the Par putt for lone Bogey 4 (bringing score to Even Par stepping onto Tee 7).
- Hole 7 (139ft, Par 3): Jeffery 3 (Par). Threw a flat, nose-down 170g DX Archangel left of the pin ("That was a perfect shot, felt great flat"); left long C2 birdie bid low, then stepped up and fired in a clutch comebacker for Par 3!
- Hole 8 (171ft, Par 3): Jeffery 3 (Par). Threw 175g Champion Eagle skip tee shot and laid a safe half-power 175g XT Glow Nova right behind the pole for Par 3!
- Hole 9 (141ft, Par 3): Jeffery 2 (Birdie ★). Piped 172g Star Rollo uphill (~15ft left and ~10ft behind basket) and drained the ~18ft downhill 175g XT Glow Nova putt ("Drop the Nova in there—Birdie, birdie, birdie! Birdied out, dude!") for 26 (-1)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 26 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Practice Nova tee drifted right ("Never do the Nova on this one again"); threw 175g Star Sync and SMACKED THE BASKET—almost an Ace ("Oh shit, that was almost an ace! That hit the basket!") for tap-in Birdie 2!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          voiceNote: '★ 175g Star Sync HIT THE BASKET off the tee (almost an Ace!) for Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Tried 170g DX Archangel off tee into trees (comparison Classic Glow Roc was better); played first lie and threaded 175g XT Glow Nova through branches for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 8,
          voiceNote: 'DX Archangel into trees + XT Glow Nova threaded through branches for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Overpowered 168g GStar Roadrunner way left & long near trail; pitched high and saved Par 3 with 175g KC Pro Aviar ("KC Pro Aviar, save par, please!").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 14,
          voiceNote: 'Overpowered Roadrunner left + clutch KC Pro Aviar Par 3 save!',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 180g Classic Glow Roc—went dead-straight down the right line without hooking left like Roc3; parked 175g XT Glow Nova right at the pin for Par 3 ("Right to the pin, perfect, parred it!").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-roc',
          discUsed: 'Classic Glow Roc',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: 'Classic Glow Roc straight right + XT Glow Nova parked at pin for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-roc' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 180g Classic Glow Roc off tee—landed 10ft right and 7ft behind the basket (~12ft C1 look); missed birdie putt and tapped in Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-roc',
          discUsed: 'Classic Glow Roc',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: 'Classic Glow Roc to 10ft right / 7ft deep; missed birdie bid, tap-in Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-roc' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Tested 175g Champion Eagle off tee—got a nice intended left skip, missed the Par putt for lone Bogey 4 (moved to Even Par entering Hole 7).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-champion-eagle',
          discUsed: 'Champion Eagle',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '175g Champion Eagle nice left skip; missed par bid for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-champion-eagle' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Flat, nose-down 170g DX Archangel tee shot left of pin ("Perfect shot, felt great flat"); left long C2 bid low, then fired in a clutch comebacker ("Fire it in there—like that!") for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: 'Flat DX Archangel tee + fired in clutch Par 3 comebacker!',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 175g Champion Eagle skip shot off tee and floated a safe half-power 175g XT Glow Nova right behind the pole for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-champion-eagle',
          discUsed: 'Champion Eagle',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          voiceNote: '175g Champion Eagle skip + half-power XT Glow Nova behind pole for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-champion-eagle' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 2 },
      voiceTranscript:
        '172g Star Rollo uphill to ~15ft left & ~10ft behind pin; drained the ~18ft downhill 175g XT Glow Nova putt ("Drop the Nova in there—Birdie, birdie, birdie! Birdied out, dude!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 18,
          voiceNote: '★ Star Rollo uphill + drained ~18ft downhill XT Glow Nova putt to birdie out!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_16_SARKO_2: HistoricalRound = {
  id: 1763326080000,
  courseName: 'Sar-Ko-Par Trails',
  totalHoles: 9,
  date: '2026-11-16',
  duration: '00:24:00',
  par: 27,
  windCondition: 'calm',
  weather: '55–57°F · Nice Day, Slight Wind (~2:48 PM · Round 2 of 2)',
  gameMode: 'stroke',
  updatedAt: 1763326260000,
  notes:
    'BOGEY-FREE 24 (-3)! Solo Afternoon Round 2 of 2 (Course all to himself!) — 3 Birdies ★ & 6 Pars! Parked Purple 168g GStar Roadrunner 3ft left on H2 ★, unlocked a low-skip 178g Pink DX Alien Birdie on H5 ★, and parked 175g Champion Eagle 5–7ft under the pin on H8 ★!',
  roundTranscript: `Sar-Ko-Par Trails Solo Afternoon Session — Round 2 of 2 (2026-11-16 · ~2:48 PM · 55–57°F, Slight Wind) — Jeffery 24 (-3, 🏆 BOGEY-FREE! 3 Birdies ★, 6 Pars, 0 Bogeys!).
Kept the voice log rolling with the whole course to himself and dialed in three awesome Birdie lines:
- Hole 1 (138ft, Par 3): Jeffery 3 (Par). Committed to 175g Star Sync off the tee—flew perfectly flat the entire way with a tiny left check and stayed on the ledge; left the birdie putt weak and tapped in Par 3.
- Hole 2 (192ft, Par 3): Jeffery 2 (Birdie ★). Chose Purple 168g GStar Roadrunner over Roc and parked it exact pin-high 3 FEET left ("Purple, there he is—exact distance of the pin, 3 feet away to the left! Roadrunner, you'll get the honor—Birdie!")!
- Hole 3 (162ft, Par 3): Jeffery 3 (Par). Clubbed down from Roadrunner to a flat 170g DX Archangel—dropped right near the basket; birdie bid clipped the top band, tapped in Par 3.
- Hole 4 (162ft, Par 3): Jeffery 3 (Par). Threw 175g Champion Eagle low off the tee (stopped in rough before skipping); threw 175g XT Glow Nova right in/under for a clean Par 3 save!
- Hole 5 (144ft, Par 3): Jeffery 2 (Birdie ★). Switched to Speed 4 178g Pink DX Alien off the tee—kept it low and flat for a clean skip to exact pin distance 10–15ft right and drained the Birdie 2 ("Two, bird! Birdie!")!
- Hole 6 (165ft, Par 3): Jeffery 3 (Par). 176g Glow Mako3 hit a tree; pitched 175g XT Glow Nova right under the basket (tiny roll) and converted Par 3.
- Hole 7 (139ft, Par 3): Jeffery 3 (Par). 170g DX Archangel flew dead-straight the entire way instead of fading left (noted Champion Eagle is the move here next time!); glided 175g XT Glow Nova down for Par 3.
- Hole 8 (171ft, Par 3): Jeffery 2 (Birdie ★). Pulled 175g Champion Eagle off the tee and PARKED IT 5–7 FEET UNDER THE PIN ("That's under the pin, dude! About 5, 6, 7 feet away—Birdied!")!
- Hole 9 (141ft, Par 3): Jeffery 3 (Par). Overshot uphill H9 with 172g Star Rollo ~15ft past toward Hole 1 and floated 175g XT Glow Nova back onto the hill ("Nova, don't roll") to seal a bogey-free 24 (-3)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 24 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 138,
      scores: { jeffery: 3 },
      voiceTranscript:
        '175g Star Sync flew perfectly flat the whole way with a slight left fade and stayed on the ledge; left birdie putt weak ("First one missed so far") for tap-in Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: 'Perfectly flat 175g Star Sync tee shot; weak birdie bid, tap-in Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 192,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Chose Purple 168g GStar Roadrunner off tee—parked exact pin-high 3 FEET left ("Purple, there he is! Exact distance of the pin, 3 feet away to the left!") and tapped in with Roadrunner for Birdie 2!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: '★ Purple 168g GStar Roadrunner parked pin-high 3ft left + tap-in Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'putt', discId: 'innova-roadrunner' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Kept 170g DX Archangel flat off tee—good flight dropping near the basket; birdie putt clipped the top of the basket, tapped in Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: 'Flat DX Archangel near basket; birdie putt hit top band, tap-in Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 162,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threw 175g Champion Eagle very low off tee (stopped in rough without skipping); pitched 175g XT Glow Nova right in/under to save Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-champion-eagle',
          discUsed: 'Champion Eagle',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: 'Low Champion Eagle tee + clutch XT Glow Nova scramble for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-champion-eagle' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 144,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Debuted 178g Pink DX Alien [4|2|0|1] off H5 tee—kept it low and flat for a clean skip to exact pin distance 10–15ft right and drained the Birdie 2 ("Two, bird! Birdie!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-dx-alien',
          discUsed: 'DX Alien',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: '★ 178g Pink DX Alien low flat skip pin-high 10–15ft right + drained Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 165,
      scores: { jeffery: 3 },
      voiceTranscript:
        '176g Glow Mako3 hit a tree; threw 175g XT Glow Nova right under the basket (tiny roll) and made Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          voiceNote: 'Glow Mako3 tree kick + XT Glow Nova approach under basket for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 139,
      scores: { jeffery: 3 },
      voiceTranscript:
        '170g DX Archangel flew super straight the whole way instead of fading left (noted Champion Eagle would be ideal here); glided 175g XT Glow Nova down to pin for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-archangel',
          discUsed: 'Archangel',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: 'Straight DX Archangel + XT Glow Nova glide approach for Par 3 (try Eagle next time!)',
          throws: [
            { shotType: 'tee', discId: 'innova-archangel' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 171,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Pulled 175g Champion Eagle off the tee and PARKED IT 5–7 FEET UNDER THE PIN ("That\'s under the pin, dude! About 5, 6, 7 feet away—Birdied!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-champion-eagle',
          discUsed: 'Champion Eagle',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          voiceNote: '★ 175g Champion Eagle parked 5–7ft under the basket for Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-champion-eagle' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 141,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Overshot uphill H9 with 172g Star Rollo ~15ft past toward Hole 1 and floated 175g XT Glow Nova back onto the hill ("Nova, don\'t roll") for a bogey-free 24 (-3)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: 'Overshot Star Rollo uphill + XT Glow Nova hill layup for bogey-free Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_17_SMP_WOODED: HistoricalRound = {
  id: 1763405160000,
  courseName: 'Shawnee Mission Wooded',
  totalHoles: 18,
  date: '2026-11-17',
  duration: '01:32:00',
  par: 54,
  windCondition: 'headwind',
  weather: '~55°F · Sunny Fall Day, Gusty Woods Wind (12:46 PM · Round 1 of 2)',
  gameMode: 'stroke',
  updatedAt: 1763413000000,
  notes:
    'Windy 18-Hole Woods Battle at Shawnee Mission Wooded — Jeffery 78 (+24, Front 34 / Back 44)! Parked Orange 172g Star Rollo right under the basket on Hole #5 for Birdie 2 ★, threaded Roadrunner <5ft on H3, piped Star Sync on H2 & H15 for Pars, bombed Classic Glow Wraith on H7/H8/H9, and MIRACULOUSLY FOUND his lost Classic Glow Wraith on Hole #18 to rip a dead-straight closing drive! (Noted DX Archangel went left into street on H12; Cotton Candy shipment arriving tomorrow 11/18!)',
  roundTranscript: `Shawnee Mission Wooded Solo Afternoon Round (2026-11-17 · 12:46 PM · ~55°F, Gusty Wind) — Jeffery 78 (+24, Front 34 / Back 44 · 1 Birdie ★ on H5, 4 Pars on H2, H3, H12 & H15).
Battled tricky woods gusts and missing white pin placements while uncovering huge takeaways (and finding his Classic Glow Wraith on Hole 18!):
- Hole 1 (260ft, Par 3): Jeffery 4 (Bogey). First cold swing pulled way left; played 175g Champion Eagle far right ("went far, fantastic") + 176g Glow Mako3 through trees + 178g Pink DX Alien ×2 for 4 (+1).
- Hole 2 (177ft, Par 3): Jeffery 3 (Par ★). Kept 175g Star Sync low off tee—skipped past the Mando logs against the trees, threaded trees right to the basket, and tapped in a 3-shot Sync Par (+1)!
- Hole 3 (187ft, Par 3): Jeffery 3 (Par ★). Threaded 168g GStar Roadrunner through all the trees—late tree kick dropped <5ft under the basket ("Thought I was gonna ace it!"), missed the short birdie putt, tapped in Par 3 (+1).
- Hole 4 (305ft, Par 3): Jeffery 4 (Bogey). Roadrunner missed trees into center fairway; 2nd-shot DX Alien pulled way left; 175g XT Glow Nova parked right on the basket to save 4 (+2).
- Hole 5 (208ft, Par 3): Jeffery 2 (Birdie ★). Orange 172g Star Rollo glided right under the basket ("No, don't ace it! Perfect—Rollo gets the honor, Birdie! Cotton Candy order's supposed to be coming tomorrow!") (+1).
- Hole 6 (187ft, Par 3): Jeffery 4 (Bogey). Roadrunner clipped a tree; wind caught the tricky par bid for 4 (+2).
- Hole 7 (355ft, Par 3): Jeffery 5 (+2). Beautiful 168g Classic Glow Wraith drive to white basket lane; Mako3 came up short and Star Sync rolled 10ft behind a tree for 5 (+4).
- Hole 8 (302ft, Par 3): Jeffery 5 (+2). Straight 150+ ft Classic Glow Wraith drive over halfway; babied 2nd shot into ground ("Who cares if you overshoot it!") for 5 (+6).
- Hole 9 (375ft, Par 3): Jeffery 4 (Bogey). Played from the shorter tee pad—bombed Wraith 180+ ft over halfway, Classic Glow Roc hit a tree, and XT Glow Nova 3rd shot SMACKED THE BASKET for tap-in 4 (Front 9 = 34 / +7).
- Hole 10 (248ft, Par 3): Jeffery 5 (+2). Late-release Wraith went deep into right trees (no white basket on H10, Blue pin only); pitched out and battled to save 5 (+9).
- Hole 11 (444ft, Par 3): Jeffery 7 (+4). Heavy wind pushed Roadrunner & KC Pro Aviar approaches off line on the 444ft monster (+13).
- Hole 12 (223ft, Par 3): Jeffery 3 (Par ★). Lost 170g DX Archangel way left out in the street; regrouped with 172g Star Rollo + 175g XT Glow Nova stop right at the pin for Par 3 (+13).
- Hole 13 (277ft, Par 3): Jeffery 6 (+3). Threw Star Sync 2–3ft off the ground twice downhill before dialing height; took 6 (+16).
- Hole 14 (243ft, Par 3): Jeffery 5 (+2). 175g Champion Eagle stayed out of prairie grass + XT Glow Nova right up to the green, but gusty wind blew two par putts off line ("I'm at +18 right now").
- Hole 15 (189ft, Par 3): Jeffery 3 (Par ★). Piped 175g Star Sync dead-straight through the trees to 20ft and lagged to 3ft for Par 3 (+18)!
- Hole 16 (338ft, Par 3): Jeffery 4 (Bogey). Three awesome uphill 172g Star Rollo shots (hit target tree → uphill roll/hyzer → parked 5ft!) on the steep 338ft climb (+19).
- Hole 17 (214ft, Par 3): Jeffery 5 (+2). Roadrunner tree kick + rolling Star Sync in wind (+21).
- Hole 18 (347ft, Par 3): Jeffery 6 (+3). MIRACULOUSLY FOUND HIS LOST CLASSIC GLOW WRAITH ("I found it! I found the Wraith!") and striped it dead-straight off Tee 18; Sync hit a high tree ("Only disc that ever goes right from now on is the Rollo!") and Alien went long for 6 (Total 78 / +24) — before heading straight to The Art Nine for an Even-Par redemption!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 78 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 260,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Played 175g Champion Eagle far right ("Eagle went far, fantastic"), threaded 176g Glow Mako3 back through trees, and finished with 178g Pink DX Alien ×2 for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-champion-eagle',
          discUsed: 'Champion Eagle',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Champion Eagle long right + Glow Mako3 through tree + Pink DX Alien ×2 for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-champion-eagle' },
            { shotType: 'fairway', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-dx-alien' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 177,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Kept 175g Star Sync low off tee—skipped right up by the Mando logs against the trees, threaded trees to the pin, and tapped in a 3-shot Sync Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: '★ 3-shot 175g Star Sync Par 3 past the Mando logs!',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-sync' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 187,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Threaded 168g GStar Roadrunner through all the trees—late tree kick dropped <5ft under the basket ("Thought I was gonna ace it!"), missed the 5ft birdie putt, tapped in Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: '★ GStar Roadrunner threaded trees to <5ft under pin; missed birdie bid, Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 305,
      scores: { jeffery: 4 },
      voiceTranscript:
        '168g GStar Roadrunner missed trees into center fairway; 2nd-shot Pink DX Alien pulled way left; 175g XT Glow Nova parked right on the basket to save Bogey 4 (+2).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          voiceNote: 'Roadrunner center drive + Alien left + XT Glow Nova parked at basket for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'fairway', discId: 'innova-dx-alien' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 208,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Orange 172g Star Rollo glided right under the 208ft dogleg-right basket ("Right under the basket! No, don\'t ace it! Rollo gets the honor—Birdie! Cotton Candy order coming tomorrow!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 2,
          voiceNote: '★ Orange 172g Star Rollo parked right under 208ft dogleg-right pin for Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-rollo' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 187,
      scores: { jeffery: 4 },
      voiceTranscript:
        '168g GStar Roadrunner clipped a tree saving it from going far left; pitched up, and gusty wind caught the tricky par putt for Bogey 4 ("Back to +2").',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Roadrunner tree check + wind caught tricky par putt for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 355,
      scores: { jeffery: 5 },
      voiceTranscript:
        'Beautiful 168g Classic Glow Wraith tee shot ("Good job, Wraith!"); cautious Glow Mako3 2nd shot + Star Sync 3rd shot rolled 10ft behind a tree for 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Beautiful Classic Glow Wraith drive; cautious Mako3 + Sync 10ft roll for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'fairway', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 302,
      scores: { jeffery: 5 },
      voiceTranscript:
        'Crushed 168g Classic Glow Wraith straight 150+ ft over halfway ("Great, excellent!"); babied 2nd shot into turf ("Who cares if you overshoot it!") and finished with 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '150+ ft straight Classic Glow Wraith drive; low 2nd shot for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'fairway', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 375,
      scores: { jeffery: 4 },
      voiceTranscript:
        'Played shorter tee pad—bombed 168g Classic Glow Wraith well over halfway, 180g Classic Glow Roc hit a tree, and 175g XT Glow Nova 3rd shot HIT THE BASKET for tap-in 4 (Front 9: 34)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: 'Big Wraith drive + Classic Glow Roc + XT Glow Nova hit basket for Bogey 4!',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'fairway', discId: 'innova-classic-glow-roc' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 10,
      par: 3,
      distance: 248,
      scores: { jeffery: 5 },
      voiceTranscript:
        'Late-release Classic Glow Wraith went into right trees (thought lost until finding it on H18! Blue basket only, no White pin); pitched out and drained putt for 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Late-release Wraith into right trees (recovered on H18!) + scramble for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'fairway', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 11,
      par: 3,
      distance: 444,
      scores: { jeffery: 7 },
      voiceTranscript:
        '444ft monster Par 3 in heavy wind: GStar Roadrunner pulled left, nose-up 2nd shot, and wind pushed KC Pro Aviar right before finishing with 7.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Heavy wind battle on 444ft Hole 11 w/ Roadrunner & KC Pro Aviar',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'fairway', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 12,
      par: 3,
      distance: 223,
      scores: { jeffery: 3 },
      voiceTranscript:
        '170g DX Archangel went way left into street (lost); regrouped with 172g Star Rollo uphill + 175g XT Glow Nova stop right at the pin ("Finally get a par!") for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: '★ Regrouped after lost Archangel w/ Star Rollo uphill + XT Glow Nova for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 13,
      par: 3,
      distance: 277,
      scores: { jeffery: 6 },
      voiceTranscript:
        '277ft downhill into wind: threw 175g Star Sync 2–3ft low twice trying to beat the breeze before reaching green for 6.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Over-adjusted low with Star Sync downhill into wind; finished with 6',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'fairway', discId: 'innova-sync' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 14,
      par: 3,
      distance: 243,
      scores: { jeffery: 5 },
      voiceTranscript:
        '175g Champion Eagle stayed safely out of prairie grass + 175g XT Glow Nova right up to green, but gusty wind blew two par putts off line for 5 (+18 through 14).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-champion-eagle',
          discUsed: 'Champion Eagle',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Champion Eagle + XT Glow Nova reached C1; wind pushed two putts off for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-champion-eagle' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 15,
      par: 3,
      distance: 189,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Piped 175g Star Sync dead-straight through the wooded hallway exact pin distance ~20ft out, lagged to 3ft, and tapped in Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: '★ 175g Star Sync straight down 189ft hallway to 20ft + tap-in Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 16,
      par: 3,
      distance: 338,
      scores: { jeffery: 4 },
      voiceTranscript:
        '338ft uphill in wind: three committed 172g Star Rollo throws (hit target tree → uphill hyzer/roll → parked 5ft from basket!) for a strong uphill Bogey 4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: '3× committed uphill 172g Star Rollo throws right to 5ft on 338ft climb for 4!',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'fairway', discId: 'innova-rollo' },
            { shotType: 'approach', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 17,
      par: 3,
      distance: 214,
      scores: { jeffery: 5 },
      voiceTranscript:
        'GStar Roadrunner hit early tree + pulled left; Star Sync rolled on windy green before finishing with 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-roadrunner',
          discUsed: 'Roadrunner',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Roadrunner tree hit + Star Sync wind roll for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-roadrunner' },
            { shotType: 'fairway', discId: 'innova-roadrunner' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 18,
      par: 3,
      distance: 347,
      scores: { jeffery: 6 },
      voiceTranscript:
        'FOUND THE LOST CLASSIC GLOW WRAITH ON HOLE 18 ("I found the Wraith!") and bombed it dead-straight down the fairway! High Sync clipped a tree ("Only disc that ever goes right is the Rollo!") and Pink DX Alien went past pin for 6.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-wraith',
          discUsed: 'Classic Glow Wraith',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Found Classic Glow Wraith & striped it dead-straight off Tee 18; finished w/ 6',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-wraith' },
            { shotType: 'fairway', discId: 'innova-sync' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_17_ART_NINE: HistoricalRound = {
  id: 1763411220000,
  courseName: 'The Art Nine @ SMP',
  totalHoles: 9,
  date: '2026-11-17',
  duration: '00:16:00',
  par: 27,
  windCondition: 'cross_rl',
  weather: '~55°F · Breezy Fall Afternoon (2:27 PM · 16-Min Redemption Round!)',
  gameMode: 'stroke',
  updatedAt: 1763413100000,
  notes:
    '⚡ 16-MINUTE EVEN-PAR REDEMPTION AT THE ART NINE! Jeffery 27 (E, 2 Birdies ★, 5 Pars, 2 Bogeys)! Bounced right back from windy SMP Wooded by draining a long ~20ft Birdie putt on Hole #6 after Pink DX Alien ★ and sticking a dead-straight downhill 180g Classic Glow Roc on Hole #9 for a walk-off Birdie 2 ★ ("Birdie! Even, huh? That was a 16-minute game!")!',
  roundTranscript: `The Art Nine @ SMP Solo 16-Minute Redemption Round (2026-11-17 · 2:27 PM · Breezy ~55°F · Par 27 · 1,031 ft) — Jeffery 27 (E, ⚡ EVEN-PAR REDEMPTION! 2 Birdies ★, 5 Pars, 2 Bogeys):
Stepped onto Hole #1 saying "I don't know if I'm gonna redeem myself on this one" and clawed back from +2 after Hole 5 to finish EVEN PAR in 16 minutes flat:
- Hole 1 (132ft, Par 3): Jeffery 3 (Par). 180g Classic Glow Roc flew dead-straight without hooking left; got up and down cleanly in 3 (E).
- Hole 2 (103ft, Par 3): Jeffery 3 (Par). 178g Pink DX Alien clipped a tree and kicked ~30ft left; scrambled cleanly for Par 3 (E).
- Hole 3 (100ft, Par 3): Jeffery 3 (Par). 172g Star Rollo dead-on line ~20ft behind basket for a 3rd straight Par 3 (E).
- Hole 4 (146ft, Par 3): Jeffery 4 (Bogey). 176g Glow Mako3 hit a tree; breezy putt missed for Bogey 4 (+1).
- Hole 5 (111ft, Par 3): Jeffery 4 (Bogey). 175g Star Sync clipped an early tree ("Two fours in a row") (+2).
- Hole 6 (116ft, Par 3): Jeffery 2 (Birdie ★). Threw 178g Pink DX Alien ~20ft past the pin and DRAINED THE LONG 20-FOOT COMEBACK BIRDIE PUTT ("Hey, that was a birdie! I got a birdie, and that was a long putt!") (+1)!
- Hole 7 (84ft, Par 3): Jeffery 3 (Par). Windy 175g XT Glow Nova hit a tree; counted Par 3 ("I count that as three, since I made the two") (+1).
- Hole 8 (102ft, Par 3): Jeffery 3 (Par). Smooth 175g KC Pro Aviar off the tee right in Circle 1 for Par 3 (+1).
- Hole 9 (137ft, Par 3): Jeffery 2 (Birdie ★). Chose 180g Classic Glow Roc over Mako3—striped it dead-straight downhill right to the pin and drained the walk-off Birdie 2 ("Roc, that looks straight, man, downhill—Good! Birdie! Even, huh? That was a 16-minute game!") to finish at 27 (E)!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 27 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 132,
      scores: { jeffery: 3 },
      voiceTranscript:
        '180g Classic Glow Roc flew straight down the tunnel without going left; got up in two and tapped in Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-roc',
          discUsed: 'Classic Glow Roc',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 4,
          voiceNote: 'Classic Glow Roc straight tee + clean up-and-down Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-roc' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 103,
      scores: { jeffery: 3 },
      voiceTranscript:
        '178g Pink DX Alien ("play catch with the basket") hit a tree and kicked ~30ft left; saved Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-dx-alien',
          discUsed: 'DX Alien',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 30,
          voiceNote: 'Pink DX Alien tree kick 30ft left + clutch Par 3 save',
          throws: [
            { shotType: 'tee', discId: 'innova-dx-alien' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 100,
      scores: { jeffery: 3 },
      voiceTranscript:
        '172g Star Rollo dead-on line ~20ft behind basket ("Right at it!") for a clean Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-rollo',
          discUsed: 'Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          voiceNote: '172g Star Rollo dead-on line 20ft behind pin for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 146,
      scores: { jeffery: 4 },
      voiceTranscript:
        '176g Glow Mako3 hit a tree; pitched up, missed windy par putt for Bogey 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-mako3',
          discUsed: 'Mako3',
          scenarioUsed: 'cross_rl',
          puttDistance: 'C1',
          voiceNote: 'Glow Mako3 tree hit + breezy putt miss for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-mako3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 111,
      scores: { jeffery: 4 },
      voiceTranscript:
        '175g Star Sync clipped an early tree ("Two fours in a row") for Bogey 4 (+2).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'cross_rl',
          puttDistance: 'C1',
          voiceNote: 'Star Sync tree kick ("two fours in a row") for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 116,
      scores: { jeffery: 2 },
      voiceTranscript:
        '178g Pink DX Alien flew ~20ft past the uphill pin and Jeffery DRAINED THE LONG 20-FT BIRDIE PUTT ("Hey, that was a birdie! I got a birdie, and that was a long putt!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-dx-alien',
          discUsed: 'DX Alien',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          voiceNote: '★ Pink DX Alien tee + drained long 20ft comeback putt for Birdie 2!',
          throws: [
            { shotType: 'tee', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 84,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Windy 175g XT Glow Nova tee clipped a tree; finished with KC Pro Aviar ("I count that as three") for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-xt-glow-nova',
          discUsed: 'XT Glow Nova',
          scenarioUsed: 'cross_rl',
          puttDistance: 'C1',
          voiceNote: 'Windy XT Glow Nova + KC Pro Aviar for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-xt-glow-nova' },
            { shotType: 'approach', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 102,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Pure tee shot with 175g KC Pro Aviar ("Off the tee with the KC Pro Aviar—yep, should be good!") for Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-kc-pro-aviar',
          discUsed: 'KC Pro Aviar',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 6,
          voiceNote: '★ Pure 175g KC Pro Aviar tee shot into C1 for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 137,
      scores: { jeffery: 2 },
      voiceTranscript:
        'Chose 180g Classic Glow Roc over Mako3—laced it dead-straight downhill right to the basket for a walk-off Birdie 2 to seal EVEN PAR ("Roc, that looks straight, man, downhill—Good! Birdie! Even, huh? That was a 16-minute game!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-classic-glow-roc',
          discUsed: 'Classic Glow Roc',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: '★ 180g Classic Glow Roc dead-straight downhill tee + walk-off Birdie 2 for Even Par 27!',
          throws: [
            { shotType: 'tee', discId: 'innova-classic-glow-roc' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    }
  ]
};

const ROUND_2026_11_22_SMP_WOODED: HistoricalRound = {
  id: 1795386555963,
  courseName: 'Shawnee Mission Wooded',
  totalHoles: 18,
  date: '2026-11-22',
  duration: '01:33:48',
  par: 54,
  windCondition: 'headwind',
  gameMode: 'stroke',
  notes:
    '🍬 COTTON CANDY 17-DISC DEBUT AT SHAWNEE MISSION WOODED (Short to White · Par 54 · 4,879 ft)! Jeffery 71 (+17, Front 36 / Back 35 · 6 Pars ★ on H6, H8, H10, H14, H15 & H17 — crushing 11/17’s 78 by 7 strokes and only 2 off his 69 PB, even after accidentally playing H13 from the long tee!) vs. Jack 80 (+26, Front 38 / Back 42 · Debut 18-Hole SMP Course PB! 3 Pars ★ on H3, H10 & H15, taking H3 & H9!). Debuted Glow Teebird, Proto Glow Mako3, Yeti Pro Aviar, DX Glow Roc, Star Rollo, Luster Firebird, Halo Wraith & Glow Leopard3!',
  roundTranscript: `Shawnee Mission Wooded — Cotton Candy Main Bag Debut Duo Round (2026-11-22 · 2:20 PM · 01:33:48 · Gusty Wind Early → Calm Dusk · Short to White · Par 54 · 4,879 ft) — Jeffery 71 (+17, Front 36 / Back 35 · 6 Pars ★) vs. Jack 80 (+26, Front 38 / Back 42 · 3 Pars ★, First-Ever SMP Wooded 18-Hole PB!):
- Hole 1 (260ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Jack won Rock-Paper-Scissors to tee first into crazy gusty wind! Jeffery debuted Cotton Candy Glow Teebird ("Pretty straight, slightly left — did exactly what it needed to!") + Pink DX Alien approach + debuted Cotton Candy Yeti Pro Aviar putt for 4-4 tie!
- Hole 2 (177ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Debuted Cotton Candy Proto Glow Mako3 ("These are new discs") and also test-threw new Aqua Color Glow Leopard3 ("little nose up and to the left"); finished with Yeti Pro Aviar for 4-4 tie!
- Hole 3 (187ft, Par 3): Jeffery 4 (Bogey) | Jack 3 (Par ★). Jack piped his Buzzz SS straight through the trees ("Straight through trees! Good job Jack!") for Par 3 to take a 1-stroke lead! Jeffery debuted Yeti Pro Aviar off the tee and nearly holed a long bid ("Whoa! I thought that was gonna go in!").
- Hole 4 (305ft, Par 3): Jeffery 4 (Bogey) | Jack 5 (Double). Debuted Cotton Candy Star Rollo ("Hey, that's something! Rollo—that was good!") + XT Glow Nova low under the branch + Yeti Pro Aviar for Bogey 4 to pull back even!
- Hole 5 (208ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Star Rollo clipped an early tree; scrambled cleanly with XT Glow Nova + Yeti Pro Aviar for a 4-4 tie!
- Hole 6 (187ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). ★ JEFFERY'S 1ST PAR! Debuted Cotton Candy DX Glow Roc straight past the guardian trees ("There's a Roc! Roc went straight, didn't get too bad of a bounce!") + Yeti Pro Aviar for Par 3! (Also tested Glow Leopard3 / Roadrunner.)
- Hole 7 (355ft, Par 3): Jeffery 5 (Double) | Jack 6 (+3). Debuted Cotton Candy Halo Wraith off the tee (found safe out of long grass) + Hot Pink Star Sync 2nd shot ("Great 2nd shot!") + Yeti Pro Aviar for 5; Jack 6.
- Hole 8 (302ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). ★ 2ND PAR! Debuted Cotton Candy Luster Firebird ("Slightly left—found in the grass!") + clutch Pink DX Alien approach ("Stop—hey, not bad!") + Yeti Pro Aviar for Par 3! Jack curved a clean Cicada into the open fairway for 4.
- Hole 9 (375ft, Par 3): Jeffery 5 (Double) | Jack 4 (Bogey). Luster Firebird flipped into a roll + Proto Glow Mako3 escape + nearly buried a 45–50 ft Yeti Pro Aviar putt ("Oh, I hit it! I thought it was going in! That was 45–50 feet!") for 5; Jack took the hole with 4! (Breakthrough discovery: realized the old tee after H9 isn't a real hole!)
- Hole 10 (248ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). ★ DOUBLE PAR! Piped Cotton Candy DX Glow Roc low downhill to 15 ft right ("Good, good, good! Low because we're downhill—about 15 feet to the right!"), grazed top bar on birdie bid, tapped in Par 3 alongside Jack's clutch Par 3!
- Hole 11 (444ft, Par 3): Jeffery 5 (Double) | Jack 6 (+3). Star Rollo clipped early tree + Glow Teebird threaded cleanly through the branches + lovely Star Sync approach ("Good on the Sync! Lovely shot!") for 5; Jack 6. (Stopped for water right after H11!)
- Hole 12 (223ft, Par 3): Jeffery 4 (Bogey) | Jack 5 (Double). Uphill Star Rollo pulled out right into tall grass + clutch Pink DX Alien upshot ("Alien up there—very good!") + Yeti Pro Aviar for Bogey 4!
- Hole 13 (277ft / Played Long Tee 375ft, Par 3): Jeffery 5 (Double) | Jack 6 (+3). Wind died completely calm! Accidentally teed off from the long pad ("We accidentally played from the long tee—we'll know next time and beat our score!"); threw Proto Glow Mako3 + debuted Hot Pink Star Roadrunner + XT Glow Nova for 5.
- Hole 14 (243ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). ★ BACK-TO-BACK PAR STREAK BEGINS! Piped Cotton Candy DX Glow Roc dead straight ("Look, that's good Jeffery! Lovely, just straight—Par baby!") under the nearly full moon (handed Jack a pocket hand warmer!).
- Hole 15 (189ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). ★ DOUBLE PAR & 2 STRAIGHT PARS! Both Jeffery (Proto Glow Mako3 dead-straight through the trees: "Good, good, good, baby! Both missed the trees!") and Jack (Buzzz SS) nailed clean Par 3s!
- Hole 16 (338ft, Par 3): Jeffery 5 (Double) | Jack 5 (Double). Steep uphill woods battle with DX Glow Roc + XT Glow Nova for a 5-5 tie.
- Hole 17 (214ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). ★ 6TH PAR OF THE ROUND! DX Glow Roc out in the open + XT Glow Nova + Yeti Pro Aviar ("Nice, Par!") vs. Jack 4!
- Hole 18 (347ft, Par 3): Jeffery 4 (Bogey) | Jack 6 (+3). Halo Wraith + DX Glow Roc + XT Glow Nova ("Stop! Get it babe!") for closing Bogey 4 → 71 (+17, 7 strokes better than 11/17's 78 and only 2 off Jeffery's 69 PB!), while Jack finished his debut 18 at 80 (+26)!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 71 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 80 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 260,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Debuted Cotton Candy Glow Teebird into crazy gusty wind ("Pretty straight, slightly left — did exactly what it needed to!") + Pink DX Alien + debuted Yeti Pro Aviar for 4-4 tie!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-teebird',
          discUsed: 'Glow Teebird',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Cotton Candy Glow Teebird debut ("straight, slightly left") + Alien + Yeti Pro Aviar for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-glow-teebird' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Won RPS to tee first; Cicada + Roach for Bogey 4 (tied H1)'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 177,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Debuted Cotton Candy Proto Glow Mako3 ("These are new discs") + test-threw Glow Leopard3 ("little nose up and to the left"); finished with Yeti Pro Aviar for 4-4 tie.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Debuted Proto Glow Mako3 (+ tested Glow Leopard3 nose-up left) for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'approach', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Buzzz SS + Roach for Bogey 4'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 187,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        'Jack piped Buzzz SS straight through the trees ("Straight through trees! Good job Jack!") for Par 3 ★ to take the lead! Jeffery threw Yeti Pro Aviar & nearly holed a long bid ("Whoa! Thought that was gonna go in!") for 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-yeti-pro-aviar',
          discUsed: 'Yeti Pro Aviar',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Yeti Pro Aviar tee + near-make long bid for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'approach', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: '★ Straight through the trees w/ Buzzz SS for Par 3 & early 1-stroke lead!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 305,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Debuted Cotton Candy Star Rollo ("Hey, that\'s something! Rollo—that was good!") + XT Glow Nova low under the branch + Yeti Pro Aviar for Bogey 4 (Jack 5).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Debuted Cotton Candy Star Rollo ("that was good!") + XT Glow Nova under branch for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Cicada + Buzzz SS + Roach for 5'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 208,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Star Rollo clipped early tree on the dogleg-right woods shot; scrambled with XT Glow Nova + Yeti Pro Aviar for 4-4 tie.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Star Rollo tree kick + XT Glow Nova scramble for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Buzzz SS + Roach for 4'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 187,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ 1ST PAR OF THE DAY! Debuted Cotton Candy DX Glow Roc straight past the guardian trees ("Roc went straight, didn\'t get too bad of a bounce!") + Yeti Pro Aviar for Par 3 (Jack 4)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Cotton Candy DX Glow Roc debut laser straight past trees for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Buzzz SS + Roach for Bogey 4'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 355,
      scores: { jeffery: 5, jack: 6 },
      voiceTranscript:
        'Debuted Cotton Candy Halo Wraith off tee (pulled left but stayed out of long grass) + Hot Pink Star Sync great 2nd shot ("Great 2nd shot!") + Yeti Pro Aviar for 5 (Jack 6).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halo-wraith',
          discUsed: 'Halo Wraith',
          scenarioUsed: 'headwind',
          puttDistance: 'C1',
          voiceNote: 'Debuted Cotton Candy Halo Wraith + great Star Sync 2nd shot + Yeti Pro Aviar for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-halo-wraith' },
            { shotType: 'fairway', discId: 'innova-sync' },
            { shotType: 'approach', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Cicada + Buzzz SS + Roach for 6'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 302,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ 2ND PAR! Debuted Cotton Candy Luster Firebird ("Slightly left—found in the grass") + clutch Pink DX Alien upshot ("Stop—hey, not bad!") + Yeti Pro Aviar for Par 3! Jack curved Cicada nicely into fairway for 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-luster-firebird',
          discUsed: 'Luster Firebird',
          scenarioUsed: 'headwind',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Debuted Cotton Candy Luster Firebird + clutch Pink DX Alien upshot for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-luster-firebird' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Curved Cicada cleanly into open fairway + Roach for Bogey 4'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 375,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        'Luster Firebird flipped into a roll + Proto Glow Mako3 escape + hit metal on a 45–50 ft Yeti Pro Aviar bid ("Oh, I hit it! 45–50 feet!") for 5; Jack won the hole with 4! (Discovered the old pad after H9 is not a real tee!)',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-luster-firebird',
          discUsed: 'Luster Firebird',
          scenarioUsed: 'headwind',
          puttDistance: 'C2',
          voiceNote: 'Luster Firebird roll + Proto Glow Mako3 + hit metal from 45–50ft w/ Yeti Pro Aviar for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-luster-firebird' },
            { shotType: 'fairway', discId: 'innova-proto-glow-mako3' },
            { shotType: 'approach', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: '★ Strong H9 Bogey 4 to beat Jeffery on the closing Front 9 hole!'
        }
      }
    },
    {
      number: 10,
      par: 3,
      distance: 248,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '★ DOUBLE PAR! Piped Cotton Candy DX Glow Roc low downhill to 15ft right ("Good, good, good! Low because we\'re downhill—about 15 feet to the right!"), grazed top bar on birdie bid, tapped in Par 3 with Jack!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 15,
          voiceNote: '★ Cotton Candy DX Glow Roc low downhill to 15ft right (grazed top bar on birdie bid!) for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ Clutch downhill Cicada + Roach for Double Par 3!'
        }
      }
    },
    {
      number: 11,
      par: 3,
      distance: 444,
      scores: { jeffery: 5, jack: 6 },
      voiceTranscript:
        'Star Rollo clipped early tree + Glow Teebird punched cleanly through branches + lovely Hot Pink Star Sync approach ("Good on the Sync! Lovely shot!") for 5 (Jack 6). Water break right after H11!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Star Rollo tree kick + Glow Teebird branch punch + lovely Star Sync approach for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'fairway', discId: 'innova-glow-teebird' },
            { shotType: 'approach', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Cicada + Buzzz SS + Roach on 444ft monster for 6'
        }
      }
    },
    {
      number: 12,
      par: 3,
      distance: 223,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Uphill Star Rollo held late into right tall grass + clutch Pink DX Alien upshot ("Alien up there—very good!") + Yeti Pro Aviar for Bogey 4 (Jack 5).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Uphill Star Rollo right rough + very good Pink DX Alien upshot for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Uphill Cicada + Roach for 5'
        }
      }
    },
    {
      number: 13,
      par: 3,
      distance: 277,
      scores: { jeffery: 5, jack: 6 },
      voiceTranscript:
        'Wind died to dead calm! Accidentally teed from the 375ft long tee ("We accidentally played from the long tee—next time we\'ll beat our score!"); threw Proto Glow Mako3 + debuted Hot Pink Star Roadrunner + XT Glow Nova for 5 (Jack 6).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Played accidentally from 375ft long tee: Proto Glow Mako3 + debuted Star Roadrunner for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'fairway', discId: 'innova-sugar-star-roadrunner' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Long-tee Cicada + Buzzz SS + Roach for 6'
        }
      }
    },
    {
      number: 14,
      par: 3,
      distance: 243,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ 4TH PAR (BACK-TO-BACK STREAK STARTS)! Piped Cotton Candy DX Glow Roc dead straight ("Look, that\'s good Jeffery! Lovely, lovely! Just straight—Par baby!") under the nearly full moon (Jack 4).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Cotton Candy DX Glow Roc dead-straight laser ("Lovely, lovely—Par baby!") for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Buzzz SS + Roach for Bogey 4 (pocket hand warmer activated!)'
        }
      }
    },
    {
      number: 15,
      par: 3,
      distance: 189,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '★ DOUBLE PAR & 2 STRAIGHT PARS! Both Jeffery (Proto Glow Mako3 straight down the trees: "Good, good, good, baby—both missed the trees!") and Jack (Buzzz SS) nailed clean Par 3s!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Cotton Candy Proto Glow Mako3 pure straight corridor ("missed the trees!") for 2nd straight Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: '★ Buzzz SS missed all the trees for Double Par 3!'
        }
      }
    },
    {
      number: 16,
      par: 3,
      distance: 338,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        'Steep uphill woods climb with Cotton Candy DX Glow Roc + XT Glow Nova for a 5-5 tie.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Steep uphill woods climb w/ DX Glow Roc + XT Glow Nova for 5-5 tie',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'fairway', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Steep uphill Cicada + Buzzz SS + Roach for 5-5 tie'
        }
      }
    },
    {
      number: 17,
      par: 3,
      distance: 214,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ 6TH PAR OF THE ROUND! Cotton Candy DX Glow Roc safely out in the open + XT Glow Nova + Yeti Pro Aviar ("Nice, Par!") vs. Jack 4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Cotton Candy DX Glow Roc into open + XT Glow Nova for 6th Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Buzzz SS + Roach for Bogey 4'
        }
      }
    },
    {
      number: 18,
      par: 3,
      distance: 347,
      scores: { jeffery: 4, jack: 6 },
      voiceTranscript:
        'Halo Wraith off tee + DX Glow Roc + XT Glow Nova ("Stop! Get it babe!") for Bogey 4 → 71 (+17, 7 strokes better than 11/17\'s 78 and only 2 off PB!) vs. Jack 80 (+26 debut PB)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halo-wraith',
          discUsed: 'Halo Wraith',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Halo Wraith + DX Glow Roc + XT Glow Nova for 4 → 71 (+17, 7 strokes better than 11/17!)',
          throws: [
            { shotType: 'tee', discId: 'innova-halo-wraith' },
            { shotType: 'fairway', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Finished first-ever 18-hole SMP Wooded round at 80 (+26)!'
        }
      }
    }
  ]
};

const ROUND_2026_11_22_ART_NINE: HistoricalRound = {
  id: 1795388409563,
  courseName: 'The Art Nine @ SMP',
  totalHoles: 9,
  date: '2026-11-22',
  duration: '00:27:23',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  notes:
    '🏆 BOGEY-FREE 24 (-3) ALL-TIME COURSE PB TIE IN COTTON CANDY ART NINE DEBUT! Jeffery 24 (-3 · 3 Birdies ★ on H3 w/ Proto Glow Mako3, H5 w/ Yeti Pro Aviar tree-bender & H7 w/ Hot Pink Halloween Star Sync · 6 Pars · ZERO Bogeys — AND HIT CHAINS ON H9 FOR 23!!) vs. Jack 29 (+2 · 7 Pars incl. 5 straight closing Pars on H5–H9)!',
  roundTranscript: `The Art Nine @ SMP — Dusk Cotton Candy Debut Duo Round (2026-11-22 · 4:32 PM · 00:27:23 · Calm Dusk · Par 27 · 1,031 ft) — 🏆 JEFFERY 24 (-3, BOGEY-FREE · TIED ALL-TIME PB! 3 Birdies ★, 6 Pars, 0 Bogeys) vs. JACK 29 (+2 · 7 Pars, 5-Par Closing Streak!):
- Hole 1 (132ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Cotton Candy DX Glow Roc ("Nice bounce, nice kick"), birdie putt came up just low on basket for tap-in Par 3; Jack Par 3.
- Hole 2 (103ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Hot Pink Halloween Star Sync slightly nose-up with a nice roll ("Keeping the pars, dude!") for Par 3; Jack Par 3.
- Hole 3 (100ft, Par 3): Jeffery 2 (Birdie ★) | Jack 4 (Bogey). ★ 1ST BIRDIE WITH COTTON CANDY PROTO GLOW MAKO3! Clean skip right up to the basket ("Good skip! Hey, you're right here! Made that 2nd one!") for Birdie 2 (-1)! Jack 4.
- Hole 4 (146ft, Par 3): Jeffery 3 (Par) | Jack 4 (Bogey). Proto Glow Mako3 through the trees ("Excellent!") + XT Glow Nova run that nearly dropped in ("I thought that was gonna be your birdie! Going right in it!") for Par 3; Jack clipped back tree for 4.
- Hole 5 (111ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). ★ 1ST BIRDIE WITH COTTON CANDY YETI PRO AVIAR! Crazy S-flight weaving around EVERY tree to the left of the basket ("Well, that was crazy! Went around all those trees and left of the basket!") + drained Birdie 2 (-2)! Jack Par 3.
- Hole 6 (116ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Yeti Pro Aviar skipped up right beside Jack ("Hey, we landed in the same place!") for a 3-3 Double Par!
- Hole 7 (84ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par). ★ 1ST BIRDIE WITH HOT PINK HALLOWEEN STAR SYNC! Skipped it cleanly through the lane ("Try to skip it through there—stop, stop!") and buried Birdie 2 to reach -3!! Jack Par 3.
- Hole 8 (102ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). Needed a right bend with Star Rollo—clipped a helpful tree ("Good thing it hit it, otherwise it would've went too left!"), then HIT THE PIN on the approach ("I hit the pin! True par!") for Par 3; Jack Par 3!
- Hole 9 (137ft, Par 3): Jeffery 3 (Par) | Jack 3 (Par). ★ CHAIN-OUT BID FOR 23 (-4)!! Threw glowing Cotton Candy Proto Glow Mako3 downhill with gorgeous glide ("Glowing? Kind of! Mako3 went down with a good glide!") and HIT THE CHAINS on the birdie putt ("I hit the chains! Oh, it spit out!") — tapped in Par 3 to lock in a BOGEY-FREE 24 (-3) ALL-TIME PB TIE!! Jack crossed the creek rocks cleanly for Par 3 (29 / +2, 5 straight closing Pars!).`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 24 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 29 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 132,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Cotton Candy DX Glow Roc ("Nice bounce, nice kick"); birdie putt just low on basket for Par 3; Jack Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Cotton Candy DX Glow Roc bounce + birdie bid just low for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Clean Roach opener for Par 3'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 103,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Hot Pink Halloween Star Sync slightly nose-up with a nice roll ("Keeping the pars, dude!") for Par 3; Jack Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Hot Pink Halloween Star Sync nose-up roll + clean Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Roach Par 3'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 100,
      scores: { jeffery: 2, jack: 4 },
      voiceTranscript:
        '★ 1ST BIRDIE WITH COTTON CANDY PROTO GLOW MAKO3! Skipped right up to the basket ("Good skip! Made that 2nd one!") for Birdie 2 (-1)! Jack 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '★ Cotton Candy Proto Glow Mako3 clean skip + drained Birdie 2 (-1)!',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Roach Bogey 4'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 146,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        'Proto Glow Mako3 through trees ("Excellent!") + XT Glow Nova approach that nearly dropped in ("Going right in it!") for Par 3; Jack clipped back tree for 4.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 + XT Glow Nova near-make through trees for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Buzzz SS clipped hidden back tree for 4'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 111,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        '★ 1ST BIRDIE WITH COTTON CANDY YETI PRO AVIAR! Wove crazily around ALL the trees to the left of the basket ("That was really crazy—went around all those trees!") + drained Birdie 2 (-2)! Jack Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-yeti-pro-aviar',
          discUsed: 'Yeti Pro Aviar',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: '★ Cotton Candy Yeti Pro Aviar magic tree-bender left of basket + Birdie 2 (-2)!',
          throws: [
            { shotType: 'tee', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Roach Par 3 (starts 5-Par closing streak!)'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 116,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Yeti Pro Aviar skipped right up next to Jack ("Hey, we landed in the same place!") for a 3-3 Double Par!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-yeti-pro-aviar',
          discUsed: 'Yeti Pro Aviar',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Yeti Pro Aviar skip landed right beside Jack for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Roach landed side-by-side with Jeffery for Par 3'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 84,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        '★ 1ST BIRDIE WITH HOT PINK HALLOWEEN STAR SYNC! Clean skip through the lane ("Try to skip it through there—stop, stop!") + drained Birdie 2 to hit -3!! Jack Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sync',
          discUsed: 'Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: '★ Hot Pink Halloween Star Sync skip through lane + Birdie 2 (-3)!',
          throws: [
            { shotType: 'tee', discId: 'innova-sync' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Roach Par 3'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 102,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Star Rollo got a clutch tree bounce ("Good thing it hit it, otherwise it would\'ve went too left!"), then HIT THE PIN on the upshot ("I hit the pin! True par!") for Par 3; Jack Par 3.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Star Rollo helpful tree kick + XT Glow Nova HIT THE PIN for true Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Roach Par 3'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 137,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '★ CHAIN-OUT BID FOR 23 (-4)!! Glowing Cotton Candy Proto Glow Mako3 downhill glide + HIT THE CHAINS on the birdie putt ("I hit the chains! Oh, it out!") — tapped in Par 3 for BOGEY-FREE 24 (-3) ALL-TIME PB TIE!! Jack crossed the creek rocks cleanly for Par 3 (29 / +2).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 18,
          voiceNote: '★ Glowing Proto Glow Mako3 downhill glide + CHAIN-OUT bid for 23! Seals BOGEY-FREE 24 (-3) PB tie!',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          voiceNote: 'Crossed creek rocks safely for 5th straight closing Par 3 (29 / +2)!'
        }
      }
    }
  ]
};

const ROUND_2026_11_23_BLACK_HOOF_18: HistoricalRound = {
  id: 1795468664071,
  courseName: 'Black Hoof Championship (White to White)',
  totalHoles: 18,
  date: '2026-11-23',
  duration: '01:42:00',
  par: 54,
  windCondition: 'cross_rl',
  gameMode: 'stroke',
  notes:
    '🏆 DOUBLE ALL-TIME 18-HOLE PERSONAL BEST TIE — JEFFERY 65 (+11, Front 34 / Back 31!) TIED JACK 65 (+11, Front 34 / Back 31!) AT BLACK HOOF CHAMPIONSHIP (#2 Course in KS · 42°F Sunny · Eve of Jeffery’s Birthday!)! 100% Complete Cotton Candy + Halloween Hot Pink Star Sync + Hot Pink DX Archangel + Pink DX Alien Bag! Jeffery nailed 1 Birdie ★ (H17 Cotton Candy Star Rollo flip-up: "IT DID IT!! Rollo is my disc, man! Birdie, dude!") + 8 Pars (incl. 315ft H5 Glow Teebird snake-glide Par, H8–H10 3-Par streak, H13 Halloween Sync near-birdie & H15 237+ ft Rollo bomb!) and debuted Proto Glow Aviar (16/17 active discs logged!). Jack CRUSHED his 18-hole PB by 6 full strokes (71 → 65) with 9 Pars & ZERO 6s, tying Jeffery on H18!',
  roundTranscript: `Black Hoof Championship (White to White · #2 Course in Kansas · 18 Holes · Par 54 · 4,218 ft · 2026-11-23 · 1:33 PM · 01:42:00 · 42°F Crisp & Sunny · Birthday Eve!) — 🏆 JEFFERY 65 (+11, Front 34 / Back 31 · TIED ALL-TIME 18-HOLE PB! 1 Birdie ★, 8 Pars) TIED JACK 65 (+11, Front 34 / Back 31 · NEW ALL-TIME 18-HOLE PB BY 6 STROKES! 9 Pars, ZERO 6s!):
Bag Milestone: 100% Complete Cotton Candy + Hot Pink Halloween Star Sync + Hot Pink DX Archangel + Pink DX Alien Main Bag (plus Proto Glow Aviar debut!).
- Hole 1 (183ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). Crisp 42°F opener at Kansas's #2 course! Cotton Candy Star Rollo caught a helpful tree stop ("Very nice throw, Jeffery!") + XT Glow Nova couple feet away for opening Par 3!
- Hole 2 (250ft, Par 3): Jeffery 5 (Double) | Jack 4 (Bogey). ★ HOT PINK DX ARCHANGEL & PROTO GLOW AVIAR DEBUT! Teed off with brand-new Hot Pink DX Archangel ("I did get my Archangel back—got a new one!") + debuted Cotton Candy Proto Glow Aviar ("Color Aviar—scared to throw it, only threw half distance") for 5; Jack 4!
- Hole 3 (206ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). ★ SWING BREAKTHROUGH: Glow Leopard3 skip-skip-skip ("Focusing on swinging my hips—belly button at the target!") + XT Glow Nova tree tap for 4-4 tie!
- Hole 4 (197ft, Par 3): Jeffery 4 (Bogey) | Jack 3 (Par ★). Cotton Candy DX Glow Roc skip-skip-skip + Yeti Pro Aviar tree clip for 4; Jack parked Roach for Par 3 ★!
- Hole 5 (315ft, Par 3): Jeffery 3 (Par ★) | Jack 5 (Double). ★ MONSTER 315-FT PAR 3! Noted course map is flipped (goes LEFT!), then striped Cotton Candy Glow Teebird with a gorgeous S-glide ("Like a little snake—goes right then flows back left!") + XT Glow Nova parked 5ft under the pin ("That stops well!") for Par 3!
- Hole 6 (310ft, Par 3): Jeffery 5 (Double) | Jack 3 (Par ★). Jack striped straight down the middle of the 310ft fairway for Par 3 ★! Jeffery threw Glow Leopard3 (clipped left tree) + Proto Glow Aviar + XT Glow Nova for 5.
- Hole 7 (382ft, Par 3 — Longest Hole!): Jeffery 4 (Bogey) | Jack 5 (Double). Birthday-eve announcement ("It's my birthday tomorrow!"). Hot Pink Star Roadrunner hip-twist roller carry ("Went the distance!") + blind woods upshot for a proud Bogey 4 ("I was proud of that one!").
- Hole 8 (236ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). ★ DOUBLE PAR & 3-PAR STREAK BEGINS! Cotton Candy Proto Glow Mako3 + XT Glow Nova for clean Par 3 alongside Jack's Par 3!
- Hole 9 (206ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). ★ 2ND STRAIGHT DOUBLE PAR! Cotton Candy DX Glow Roc + XT Glow Nova for Par 3 to close the Front 9 dead even at 34–34!
- Hole 10 (294ft, Par 3): Jeffery 3 (Par ★) | Jack 4 (Bogey). ★ 3RD STRAIGHT PAR! Cotton Candy Star Rollo ("Got to do your hips!") + Hot Pink Halloween Star Sync 10-footer ("Dude, I got a par! I'm doing good these last few holes!")!
- Hole 11 (221ft, Par 3): Jeffery 4 (Bogey) | Jack 3 (Par ★). Downhill Proto Glow Mako3 clipped tree + Proto Glow Aviar bend around obstacle for 4; Jack striped a beauty for Par 3 ★!
- Hole 12 (252ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Hot Pink Star Roadrunner buried right under leaves + LEGENDARY PINK DX ALIEN UFO SCRAMBLE ("Wow, that was good—missed the trees like an alien UFO would!") for 4! Jack's Cicada hit the top of the basket!
- Hole 13 (105ft, Par 3 — Shortest Ace Run!): Jeffery 3 (Par ★) | Jack 3 (Par ★). ★ HALLOWEEN STAR SYNC NEAR-BIRDIE! Threaded EVERY tree ("No idea how I missed all those trees—that Sync went right where I was aiming!") and grazed the basket top ("If the top wasn't on it, you would have birdied!") for Double Par 3!
- Hole 14 (185ft, Par 3): Jeffery 5 (Double) | Jack 3 (Par ★). Proto Glow Mako3 released late right + Proto Glow Aviar ("Color Aviar") for 5; Jack nailed back-to-back Pars (H13–H14) to grab a 2-stroke lead!
- Hole 15 (237ft, Par 3): Jeffery 3 (Par ★) | Jack 3 (Par ★). ★ DOUBLE PAR & HUGE ROLLO BOMB! Cotton Candy Star Rollo flipped over downhill and carried 237+ ft ALL THE WAY PAST TO THE BLUE PIN ("It did its flip! Good to know I threw that far!") + XT Glow Nova for Par 3 (Jack's 3rd straight Par H13–H15)!
- Hole 16 (260ft, Par 3): Jeffery 4 (Bogey) | Jack 4 (Bogey). Proto Glow Mako3 + XT Glow Nova for a 4-4 tie!
- Hole 17 (201ft, Par 3): Jeffery 2 (Birdie ★) | Jack 3 (Par ★). ★ SHOT OF THE DAY — 1ST COTTON CANDY STAR ROLLO BIRDIE!! "Quit being afraid to throw it too far—just throw it far, Jeffery! Flip up, flip up, flip up! IT DID IT!! Rollo is my disc, man! Birdie, dude!!" (Spotted a fox-shaped tree stump!). Jack carded his 9th Par!
- Hole 18 (178ft, Par 3 — Uphill Closer): Jeffery 3 (Par ★) | Jack 4 (Bogey). ★ CLUTCH UPHILL PAR TO TIE 65–65!! Cotton Candy Star Rollo uphill + XT Glow Nova for closing Par 3 (Back 9 = 31 / +4!) while Jack parked yellow Cicada in Circle 1 for 4 ("Do you know what giving yourself a 4 did? It tied me and you! 65 (+11) — tied my best 18-hole score!")!!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 65 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 65 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 183,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ OPENING PAR 3! Cotton Candy Star Rollo caught a helpful tree stop ("Very nice throw, Jeffery!") + XT Glow Nova couple feet away for tap-in Par 3 (Jack 4)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'cross_rl',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 3,
          voiceNote: '★ Cotton Candy Star Rollo + XT Glow Nova parked 2ft for opening Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Buzzz SS + Roach opener for Bogey 4'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 250,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        '★ HOT PINK DX ARCHANGEL & PROTO GLOW AVIAR DEBUT! Teed off with brand-new Hot Pink DX Archangel ("Got a new one!") + debuted Cotton Candy Proto Glow Aviar ("Color Aviar—only threw half distance") for 5; Jack 4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-hot-pink-archangel',
          discUsed: 'Hot Pink Archangel',
          scenarioUsed: 'cross_rl',
          puttDistance: 'C1',
          voiceNote: 'Debuted Hot Pink DX Archangel + debuted Cotton Candy Proto Glow Aviar ("Color Aviar") for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-hot-pink-archangel' },
            { shotType: 'approach', discId: 'innova-proto-glow-aviar' },
            { shotType: 'approach', discId: 'innova-proto-glow-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Missed all trees cleanly + Roach for Bogey 4'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 206,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        '★ HIP-ROTATION BREAKTHROUGH! Glow Leopard3 skip-skip-skip ("Focusing on swinging my hips—belly button at the target!") + XT Glow Nova tree clip for 4-4 tie!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-leopard3',
          discUsed: 'Glow Leopard3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Glow Leopard3 hip-rotation skip drive ("belly button at target!") + XT Glow Nova for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-glow-leopard3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Great roll right beside Jeffery + Roach for Bogey 4'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 197,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        'Cotton Candy DX Glow Roc skip-skip-skip + Yeti Pro Aviar tree tap for Bogey 4; Jack parked Roach ("Your purple one is good!") for Par 3 ★!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Cotton Candy DX Glow Roc skip + Yeti Pro Aviar tree tap for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ Cicada + clutch purple Roach approach for Par 3!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 315,
      scores: { jeffery: 3, jack: 5 },
      voiceTranscript:
        '★ MONSTER 315-FT PAR 3! Striped Cotton Candy Glow Teebird with a snake S-glide ("Like a little snake—goes right then flows back left!") + XT Glow Nova parked 5ft under pin ("That stops well!") for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-teebird',
          discUsed: 'Glow Teebird',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 5,
          voiceNote: '★ 315ft Par 3! Glow Teebird snake S-glide + XT Glow Nova parked 5ft under pin!',
          throws: [
            { shotType: 'tee', discId: 'innova-glow-teebird' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Cicada + Roach on 315ft dogleg-left for 5'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 310,
      scores: { jeffery: 5, jack: 3 },
      voiceTranscript:
        'Jack striped straight down the middle of the 310ft fairway for Par 3 ★! Jeffery clipped left tree with Glow Leopard3 + Proto Glow Aviar + XT Glow Nova for 5.',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-leopard3',
          discUsed: 'Glow Leopard3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Glow Leopard3 left tree + Proto Glow Aviar ("my Aviar") for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-glow-leopard3' },
            { shotType: 'fairway', discId: 'innova-proto-glow-aviar' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ Striped straight down the middle of 310ft fairway for clutch Par 3!'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 382,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        '382ft longest hole (Birthday Eve!): Hot Pink Star Roadrunner hip-twist roller carry ("Went the distance!") + blind woods upshot for a proud Bogey 4 ("I was proud of that one!") vs. Jack 5!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-roadrunner',
          discUsed: 'Star Roadrunner',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Hot Pink Star Roadrunner hip-twist distance + blind woods upshot ("Proud of that 4!")',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-roadrunner' },
            { shotType: 'fairway', discId: 'innova-sugar-star-roadrunner' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Cicada + Buzzz SS + Roach on 382ft longest hole for 5'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 236,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '★ DOUBLE PAR & 3-PAR STREAK BEGINS! Cotton Candy Proto Glow Mako3 + XT Glow Nova ("I might do me a par—yep, I did! Both parred!") for Par 3 with Jack!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Cotton Candy Proto Glow Mako3 + XT Glow Nova for Double Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ Straight fairway Cicada + Roach for Double Par 3!'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 206,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '★ 2ND STRAIGHT DOUBLE PAR! Cotton Candy DX Glow Roc + XT Glow Nova for Par 3 to close the Front 9 tied 34–34!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Cotton Candy DX Glow Roc + XT Glow Nova for 2nd straight Double Par (Front 34–34)!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: '★ Roach clutch Par 3 to finish Front 9 tied 34–34!'
        }
      }
    },
    {
      number: 10,
      par: 3,
      distance: 294,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ 3RD STRAIGHT PAR (294 FT)! Cotton Candy Star Rollo ("Got to do your hips!") + Hot Pink Halloween Star Sync 10-footer ("Dude, I got a par! Doing good these last few holes!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '★ 3rd straight Par! Cotton Candy Star Rollo + Halloween Star Sync 10ft putt on 294ft H10!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-halloween-sync' },
            { shotType: 'putt', discId: 'innova-halloween-sync' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Cicada tree tap + Roach for Bogey 4'
        }
      }
    },
    {
      number: 11,
      par: 3,
      distance: 221,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        'Downhill Proto Glow Mako3 clipped tree + Proto Glow Aviar bend around tree for Bogey 4; Jack striped a beauty ("Beautiful dude, great shot!") for Par 3 ★!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 tree kick + Proto Glow Aviar bend-around for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'approach', discId: 'innova-proto-glow-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: '★ Downhill beauty ("Beautiful dude, great shot!") for 5th Par 3!'
        }
      }
    },
    {
      number: 12,
      par: 3,
      distance: 252,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Hot Pink Star Roadrunner went right under leaves + LEGENDARY PINK DX ALIEN UFO SCRAMBLE ("Wow, that was good—missed the trees like an alien UFO would!") for Bogey 4! Jack hit top of basket for 4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-roadrunner',
          discUsed: 'Star Roadrunner',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Hot Pink Star Roadrunner + Pink DX Alien UFO tree-dodge ("missed the trees like an alien UFO!") for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-roadrunner' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Cicada hit top of basket ("Hit the top! Hang!") for Bogey 4!'
        }
      }
    },
    {
      number: 13,
      par: 3,
      distance: 105,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '★ HALLOWEEN STAR SYNC NEAR-BIRDIE! Threaded EVERY tree ("No idea how I missed all those trees—that Sync went right where I was aiming!") and grazed basket top for Double Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halloween-sync',
          discUsed: 'Halloween Star Sync',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Hot Pink Halloween Star Sync missed every tree & grazed basket top (near-Birdie!) for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-halloween-sync' },
            { shotType: 'putt', discId: 'innova-halloween-sync' },
            { shotType: 'putt', discId: 'innova-halloween-sync' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: '★ Buzzz SS + Roach for Double Par 3 (starts 3-Par streak H13–H15!)'
        }
      }
    },
    {
      number: 14,
      par: 3,
      distance: 185,
      scores: { jeffery: 5, jack: 3 },
      voiceTranscript:
        'Proto Glow Mako3 released late right + Proto Glow Aviar ("Color Aviar") for 5; Jack nailed back-to-back Pars (H13–H14) for a 2-stroke lead!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 late release right + Proto Glow Aviar ("Color Aviar") for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'approach', discId: 'innova-proto-glow-aviar' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: '★ Back-to-back Par 3 to take a 2-stroke lead!'
        }
      }
    },
    {
      number: 15,
      par: 3,
      distance: 237,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '★ DOUBLE PAR & 237+ FT ROLLO BOMB! Cotton Candy Star Rollo flipped downhill and flew ALL THE WAY TO THE BLUE PIN ("It did its flip! Good to know I threw that far!") + XT Glow Nova for Par 3 (Jack\'s 3rd straight Par)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Cotton Candy Star Rollo flipped downhill 237+ ft to blue pin + XT Glow Nova for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ 3rd straight Par 3 (H13–H15)!'
        }
      }
    },
    {
      number: 16,
      par: 3,
      distance: 260,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Proto Glow Mako3 pulled slightly right + XT Glow Nova approach for Bogey 4 (tied 4-4 with Jack).',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 + XT Glow Nova for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Buzzz SS + Roach for Bogey 4'
        }
      }
    },
    {
      number: 17,
      par: 3,
      distance: 201,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        '★ SHOT OF THE DAY — 1ST COTTON CANDY STAR ROLLO BIRDIE!! "Flip up, flip up, flip up! IT DID IT!! Rollo is my disc, man! Birdie, dude!!" Jack nailed his 9th Par 3 ★!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 12,
          voiceNote: '★ 1ST COTTON CANDY STAR ROLLO BIRDIE 2!! Flipped right around dogleg ("IT DID IT!! Rollo is my disc, man!")!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: '★ Beauty drive ("Beauty, beauty Jack!") for 9th Par 3 of the round!'
        }
      }
    },
    {
      number: 18,
      par: 3,
      distance: 178,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ CLUTCH UPHILL CLOSING PAR FOR 65–65 DOUBLE 18-HOLE PB TIE!! Cotton Candy Star Rollo uphill + XT Glow Nova for Par 3 (Back 9 = 31 / +4!); Jack parked yellow Cicada in Circle 1 for 4 to shatter his 18-hole PB by 6 strokes (71 → 65)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Closing uphill Star Rollo + XT Glow Nova Par 3 → 65 (+11, Back 31!) TIED ALL-TIME 18-HOLE PB!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ Yellow Cicada into Circle 1 + Bogey 4 → NEW ALL-TIME 18-HOLE PB 65 (+11, crushing 71 by 6 strokes & tying Jeffery 65–65)!'
        }
      }
    }
  ]
};

const ROUND_2026_11_25_HERITAGE_PARK_18: HistoricalRound = {
  id: 1795638381854,
  courseName: 'Heritage Park DGC',
  totalHoles: 18,
  date: '2026-11-25',
  duration: '01:47:57',
  par: 54,
  windCondition: 'cross_lr',
  gameMode: 'stroke',
  notes:
    '🦃 THANKSGIVING EVE HERITAGE PARK DGC DEBUT & 17/17 COMPLETE BAG MILESTONE!! Jeffery 72 (+18 · Front 39 / Back 33 — 6-stroke Back-9 surge with ZERO 5s on the Back 9 & 4 Pars: H2, H11, H12, H14!) vs Jack 77 (+23 · Front 39 tie / Back 38 · beauty Par 3 on H17)! Flagship Cotton Candy Halo Destroyer officially debuted on 323ft H7 ("Beauty! Totally right angle!") — ALL 17 OF 17 ACTIVE DISCS NOW LOGGED! Plus 90° vs 110° release-point breakthrough on 299ft H14 Par!',
  roundTranscript: `Heritage Park DGC — Thanksgiving Eve Course Debut (2026-11-25 · 12:37 PM · 01:47:57 · Left-to-Right Breeze · 18 Holes · Par 54 · 4,915 ft · All Silver / A Baskets) — Jeffery 72 (+18 · F39/B33 · 4 Pars) vs Jack 77 (+23 · F39/B38 · 1 Par)!
🚀 17 OF 17 ACTIVE BAG COMPLETE MILESTONE: Flagship Cotton Candy Halo Destroyer debuted on 323ft H7 ("Beauty! Wraith and the Destroyer were totally right angle!") — every single disc in Jeffery's 17-disc Cotton Candy + Hot Pink bag is now officially logged!
🔥 MASSIVE 6-STROKE BACK-9 SURGE (39 → 33, +6 on Back 9 with ZERO 5s!): After tying Jack 39–39 on the unfamiliar Front 9 (flat park course with tree-lined tee boxes and no next-tee arrows), Jeffery dialed in the 90° release point ("release at 90 degrees instead of 110!") to fire 33 (+6) on the Back 9 with Pars on H11, H12 & H14 and zero scores worse than 4!
Hole-by-Hole Recap:
- H1 (330ft, Par 3): Jeffery 5 | Jack 5. Threaded Hot Pink Star Roadrunner cleanly through opener trees ("Got it through, baby!"), rescued Jack's purple disc with the retriever tool, drained clutch putt to tie 5–5.
- H2 (304ft, Par 3): Jeffery 3 (★ 1ST HERITAGE PARK PAR!) | Jack 4. Cotton Candy Luster Firebird hyzered into the fairway avoiding deep grass + Proto Glow Mako3 parked 10ft left + drained 10ft Par 3 ("Three! Wow!")!
- H3 (316ft, Par 3): Jeffery 4 | Jack 5. Glow Leopard3 straight tee ("That was a good one!") + low XT Glow Nova approach nearly dropped for a long Par; retriever tool rescued Jack's disc from trees again!
- H4 (240ft, Par 3): Jeffery 5 | Jack 4. Glow Leopard3 faded left slightly; Jack striped a gorgeous Cicada flight ("I love that flight, dude, of your Cicada!") to win the hole 4–5.
- H5 (219ft, Par 3): Jeffery 4 | Jack 4. Glow Teebird cleared trees left + Proto Glow Mako3 perfect drop for tied 4–4.
- H6 (264ft, Par 3): Jeffery 5 | Jack 5. Hot Pink Archangel tee + DX Glow Roc curved around tree + Pink DX Alien pin pitch ("Oh my little Alien friend!") for tied 5–5.
- H7 (323ft, Par 3): Jeffery 5 | Jack 4. 🚀 FLAGSHIP HALO DESTROYER OFFICIAL DEBUT ("Give it a try... Beauty! Wraith and the Destroyer were totally right angle!") — completing 17/17 active discs logged! Proto Glow Mako3 pulled left ("stopped my hip") + Yeti Pro Aviar nicked chains for 5.
- H8 (328ft, Par 3): Jeffery 4 | Jack 4. Dogleg-right basket — Cotton Candy Star Rollo ("one I can get to flip up a little right") for Bogey 4.
- H9 (210ft, Par 3): Jeffery 4 | Jack 4. Halo Wraith ("Nice! Way better—that's what I wanted!") + XT Glow Nova + 1-inch rim-out Par bid ("One inch lower and it would have hit chains!") — Front 9 tied 39–39!
- H10 (243ft, Par 3): Jeffery 4 | Jack 5. Friendly 3-some let Jeffery & Jack play through ("This is our 1st year playing — pretty cool how many courses are around here!"); Bogey 4 takes the Back-9 lead.
- H11 (278ft, Par 3): Jeffery 3 (★ PAR!) | Jack 5. Cotton Candy Star Rollo threaded the tiniest gap of trees ("Wow, how did that do that?! Rollo went through the tiniest gap of trees!") for clutch Par 3!
- H12 (296ft, Par 3): Jeffery 3 (★ BACK-TO-BACK PAR!) | Jack 4. Lucky forward tree-skip flip + Pink DX Alien upshot ("I don't have enough power to overshoot it — commit firmly!") for back-to-back Par 3!
- H13 (229ft, Par 3): Jeffery 4 | Jack 4. Blind basket fooled the tee sign — DX Glow Roc + Pink DX Alien + clutch XT Glow Nova ("Nova — doing good though!") for tied 4–4.
- H14 (299ft, Par 3): Jeffery 3 (★ 3RD BACK-9 PAR & FORM BREAKTHROUGH!) | Jack 5. Discovered the 90° vs 110° release-point cue ("I'm releasing late — should release at 90 degrees instead of 110!") and immediately parked 10ft left, 3ft behind for Par 3!
- H15 (262ft, Par 3): Jeffery 4 | Jack 4. Star Roadrunner tee + forehand upshot turning right ("Those forehands will turn it right") for tied 4–4; started the "any discs left?" green habit!
- H16 (301ft, Par 3): Jeffery 4 | Jack 4. Pretty open fairway into guarded bushes — Pink DX Alien + nice Yeti Pro Aviar bush scramble for tied 4–4.
- H17 (228ft, Par 3): Jeffery 4 | Jack 3 (★ JACK'S HERITAGE PARK PAR!). Star Rollo clipped 20ft overhead branches for 4 while Jack piped a beauty ("Yeah, it's beauty, Jack — you deserved it!") for Par 3!
- H18 (245ft, Par 3): Jeffery 4 | Jack 4. Glow Leopard3 exact pin-high distance for closing Bogey 4 — sealing a 33 (+6) Back 9 (ZERO 5s!) and a 72 (+18) debut course record!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 72 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 77 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 330,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        'Thanksgiving Eve debut! Threaded Hot Pink Star Roadrunner cleanly through opener trees ("Got it through, baby!") + 2nd Roadrunner down fairway & clutch putt to tie Jack 5–5!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-roadrunner',
          discUsed: 'Star Roadrunner',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Star Roadrunner cleanly through opener trees ("Got it through, baby!") + 2nd shot & clutch putt for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-roadrunner' },
            { shotType: 'fairway', discId: 'innova-sugar-star-roadrunner' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Retriever tool saved purple disc from trees; played yellow lie to tie 5–5'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 304,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ 1ST HERITAGE PARK PAR (304 FT)! Cotton Candy Luster Firebird hyzered into the fairway avoiding deep grass + Proto Glow Mako3 parked 10ft left + drained 10ft Par 3 ("Three! Wow!")!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-luster-firebird',
          discUsed: 'Luster Firebird',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '★ 1st Heritage Park Par! Luster Firebird fairway hyzer + Proto Glow Mako3 parked 10ft left & drained 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-luster-firebird' },
            { shotType: 'approach', discId: 'innova-proto-glow-mako3' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Solid Bogey 4 on 304ft Pin 2A'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 316,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Cotton Candy Glow Leopard3 straight tee ("That was a good one!") + low XT Glow Nova approach that nearly dropped for a long Par ("Oh my God, thought that was gonna make it!") for Bogey 4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-leopard3',
          discUsed: 'Glow Leopard3',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Glow Leopard3 straight drive + low XT Glow Nova nearly-made long Par bid for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-glow-leopard3' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Tree spit-out ("spit it out nice!") + retriever tool save for 5'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 240,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        'Glow Leopard3 faded slightly left + came up 10ft short for 5; Jack striped a gorgeous Cicada flight ("I love that flight, dude, of your Cicada!") to win the hole 4–5!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-leopard3',
          discUsed: 'Glow Leopard3',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Glow Leopard3 drifted slightly left + 10ft short approach for 5',
          throws: [{ shotType: 'tee', discId: 'innova-glow-leopard3' }]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ Beauty Cicada flight ("I love that flight, dude!") to win hole 4–5!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 219,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Cotton Candy Glow Teebird got through the front trees left + Proto Glow Mako3 perfect drop ("Perfect drop!") for tied Bogey 4s!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-teebird',
          discUsed: 'Glow Teebird',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Glow Teebird cleared trees left + Proto Glow Mako3 perfect drop for tied 4',
          throws: [
            { shotType: 'tee', discId: 'innova-glow-teebird' },
            { shotType: 'approach', discId: 'innova-proto-glow-mako3' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Clean bounce + tap-in to tie 4–4'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 264,
      scores: { jeffery: 5, jack: 5 },
      voiceTranscript:
        'Hot Pink Archangel tee + Cotton Candy DX Glow Roc curved around tree + Pink DX Alien pin pitch ("Oh my little Alien friend—good!") before rushing the 4 putt to tie 5–5!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-hot-pink-archangel',
          discUsed: 'Hot Pink Archangel',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Hot Pink Archangel + DX Glow Roc around tree + Pink DX Alien pin pitch for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-hot-pink-archangel' },
            { shotType: 'approach', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-dx-alien' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Matched Jeffery at 5–5 on 264ft Pin 6A'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 323,
      scores: { jeffery: 5, jack: 4 },
      voiceTranscript:
        '🚀 FLAGSHIP HALO DESTROYER OFFICIAL DEBUT (17/17 ACTIVE DISCS LOGGED!!): Pulled Neon Chartreuse Halo Destroyer & Halo Wraith ("Beauty! Wraith and the Destroyer were totally right angle!") + Proto Glow Mako3 ("stopped my hip") + Yeti Pro Aviar nicked chains for 5; Jack 4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halo-destroyer',
          discUsed: 'Halo Destroyer',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: '🚀 OFFICIAL HALO DESTROYER DEBUT (17/17 bag logged!) & Halo Wraith ("Totally right angle!") + Proto Glow Mako3 + Yeti Pro Aviar chain nick for 5',
          throws: [
            { shotType: 'tee', discId: 'innova-halo-destroyer' },
            { shotType: 'tee', discId: 'innova-halo-wraith' },
            { shotType: 'approach', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ Out in the open for clean Bogey 4 to beat Jeffery on 323ft H7!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 328,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        '328ft wooded dogleg right — pulled Cotton Candy Star Rollo ("that one I can get to flip up a little bit to the right") to settle for tied Bogey 4–4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Cotton Candy Star Rollo flip-right line on 328ft dogleg right for tied 4',
          throws: [{ shotType: 'tee', discId: 'innova-sugar-star-rollo' }]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: '"Good one dude!" — tied 4–4 on long H8'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 210,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Cotton Candy Halo Wraith striped cleanly ("Nice! Way better—that\'s what I wanted!") + XT Glow Nova + 1-inch rim-out Par bid ("One inch lower and it would have hit chains!") — Front 9 tied 39–39!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halo-wraith',
          discUsed: 'Halo Wraith',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Halo Wraith ("Way better—that\'s what I wanted!") + XT Glow Nova + 1-inch rim-out Par bid for 4 (Front 9 tied 39–39!)',
          throws: [
            { shotType: 'tee', discId: 'innova-halo-wraith' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Bogey 4 seals a 39–39 Front-9 deadlock with Jeffery!'
        }
      }
    },
    {
      number: 10,
      par: 3,
      distance: 243,
      scores: { jeffery: 4, jack: 5 },
      voiceTranscript:
        'Friendly threesome let Jeffery & Jack play through ("This is our 1st year playing—pretty cool how many courses are around here!"); steady Bogey 4 kicks off a 33 (+6) Back 9!',
      meta: {
        jeffery: {
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Played through friendly group cleanly for Bogey 4 (takes Back-9 lead, 0 fives on entire Back 9!)'
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Quick single-shot play-through for 5'
        }
      }
    },
    {
      number: 11,
      par: 3,
      distance: 278,
      scores: { jeffery: 3, jack: 5 },
      voiceTranscript:
        '★ CLUTCH BACK-9 PAR (278 FT)! Cotton Candy Star Rollo threaded the tiniest gap of trees ("Wow, how did that do that?! Rollo went through the tiniest gap of trees!") for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Star Rollo threaded the tiniest gap of trees on 278ft H11 for clutch Par 3!',
          throws: [{ shotType: 'tee', discId: 'innova-sugar-star-rollo' }]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: '5 on 278ft Pin 11A'
        }
      }
    },
    {
      number: 12,
      par: 3,
      distance: 296,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ BACK-TO-BACK PAR (296 FT)! Lucky forward skip-flip off a tree ("flipped, went forward at the exact angle it needed!") + Pink DX Alien upshot ("commit firmly—not enough power to overshoot!") for Par 3!',
      meta: {
        jeffery: {
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Back-to-back Par 3! Forward tree-skip flip + Pink DX Alien upshot on 296ft H12!',
          throws: [{ shotType: 'approach', discId: 'innova-dx-alien' }]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: '"Nice Jack, good one again dude!" — clean Bogey 4'
        }
      }
    },
    {
      number: 13,
      par: 3,
      distance: 229,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Blind Pin 13B fooled the tee sign! DX Glow Roc tee + Pink DX Alien search shot + clutch XT Glow Nova upshot ("Nova—doing good though!") to tie Jack 4–4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-glow-roc',
          discUsed: 'DX Glow Roc',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'DX Glow Roc + Pink DX Alien + clutch XT Glow Nova ("doing good though!") on blind Pin 13B for tied 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-glow-roc' },
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Clean trees scramble to tie 4–4'
        }
      }
    },
    {
      number: 14,
      par: 3,
      distance: 299,
      scores: { jeffery: 3, jack: 5 },
      voiceTranscript:
        '★ 3RD BACK-9 PAR & FORM BREAKTHROUGH (299 FT)! Diagnosed late release ("I should release at 90 degrees instead of 110!") and immediately parked 10ft left, 3ft behind for Par 3!',
      meta: {
        jeffery: {
          scenarioUsed: 'cross_lr',
          fairwayHit: true,
          puttDistance: 'C1',
          puttDistanceFeet: 10,
          voiceNote: '★ 90° vs 110° release-point breakthrough! Parked 10ft left, 3ft behind on 299ft H14 for 3rd Back-9 Par!'
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: '5 on 299ft Pin 14A'
        }
      }
    },
    {
      number: 15,
      par: 3,
      distance: 262,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Hot Pink Star Roadrunner tee + forehand upshot that turned cleanly right ("Those forehands will turn it right!") for tied Bogey 4–4! Started the "any discs left?" green checklist!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-roadrunner',
          discUsed: 'Star Roadrunner',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Star Roadrunner tee + right-turning forehand upshot for tied 4–4',
          throws: [{ shotType: 'tee', discId: 'innova-sugar-star-roadrunner' }]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Matched Jeffery at 4–4 on 262ft H15'
        }
      }
    },
    {
      number: 16,
      par: 3,
      distance: 301,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Pretty open 301ft fairway into guarded bushes — Pink DX Alien + nice Yeti Pro Aviar bush scramble ("That was a nice one!") for tied 4–4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-dx-alien',
          discUsed: 'DX Alien',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Pink DX Alien + clutch Yeti Pro Aviar scramble out of the bushes for tied 4',
          throws: [
            { shotType: 'approach', discId: 'innova-dx-alien' },
            { shotType: 'putt', discId: 'innova-yeti-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Matched Jeffery at 4–4 on 301ft Pin 16A'
        }
      }
    },
    {
      number: 17,
      par: 3,
      distance: 228,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        'Cotton Candy Star Rollo clipped high 20ft branches for Bogey 4 while Jack piped a beauty ("Yeah, it\'s beauty, Jack—you deserved it!") for his 1st Heritage Park Par 3 ★!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Star Rollo clipped 20ft overhead branches for Bogey 4',
          throws: [{ shotType: 'tee', discId: 'innova-sugar-star-rollo' }]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: '★ JACK\'S 1ST HERITAGE PARK PAR 3 ("Yeah, it\'s beauty, Jack — you deserved it!")!'
        }
      }
    },
    {
      number: 18,
      par: 3,
      distance: 245,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Cotton Candy Glow Leopard3 exact pin-high distance ("Right distance, exactly!") for closing Bogey 4 — sealing a 33 (+6) Back 9 (ZERO 5s, 6 strokes better than Front 9!) & 72 (+18) debut PB!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-leopard3',
          discUsed: 'Glow Leopard3',
          scenarioUsed: 'cross_lr',
          puttDistance: 'C1',
          voiceNote: 'Glow Leopard3 exact pin-high distance + closing 4 → 33 (+6) Back 9 (ZERO 5s!) & 72 (+18) Heritage Park Debut PB!',
          throws: [{ shotType: 'tee', discId: 'innova-glow-leopard3' }]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Closing Bogey 4 seals Jack\'s 77 (+23 · F39/B38) Heritage Park Debut PB!'
        }
      }
    }
  ]
};

const ROUND_2026_11_27_MIZE: HistoricalRound = {
  id: 1795809970733,
  courseName: 'Mize Elementary',
  totalHoles: 9,
  date: '2026-11-27',
  duration: '00:48:49',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  notes:
    '🦃 BLACK FRIDAY RETURN TO MIZE ELEMENTARY (1st Cotton Candy Bag Round at Mize!) — Jeffery 34 (+7 · 3 Pars: H2, H5, H7!) vs Jack 37 (+10 · TIES ALL-TIME MIZE PB, beating 10/28 by 5 strokes!). Breakthrough Halo Wraith day (H2 & H5 Pars + Bonus H1 18ft "best ever thrown!" & Nova fell through chains!), Luster Firebird clutched 324ft H7 Par (now 3/4 career Pars = 75% Par+!), and new fence added around H1 field. Bonus Solo H1–H5 practice logged in recap.',
  roundTranscript: `Mize Elementary — Black Friday Return (2026-11-27 · 1:14 PM · 00:48:49 · 48°F Sunshine, Touch of Breeze · 9 Holes · Par 27 · 2,626 ft) — Jeffery 34 (+7 · 3 Pars) vs Jack 37 (+10 · TIES ALL-TIME MIZE PB!!).
First time back at Mize Elementary in a month (since 10/28) and first round here with the Cotton Candy + Hot Pink bag! Notice: New fence installed around the entire Hole #1 field.
🚀 BREAKOUT DISCS OF THE DAY:
- Halo Wraith: Powered H2 (264ft chest-level ~220ft Double Par!) & H5 (296ft Par curling back inside the baseball fence!), THEN during unscored solo Bonus Holes 1–5 while Jack played on the playground, striped Bonus H1 18ft left of the pin ("That was the best ever thrown! Learning the Wraith!")!
- Luster Firebird: Threaded trees on 324ft H7 for a clutch Par 3 ("Great job, Firebird! I was proud of that one!") — now 3 Pars in 4 career holes (75% Par+)!
Hole-by-Hole Recap:
- H1 (218ft, Par 3): Jeffery 4 | Jack 4. Brand-new fence around field! Tested Star Rollo (flipped right OVER the new fence — walked around opening to retrieve!) and played Hot Pink Archangel dead-straight pin-high (~218ft) + XT Glow Nova for tied Bogey 4–4.
- H2 (264ft, Par 3): Jeffery 3 (★ DOUBLE PAR!) | Jack 3 (★ DOUBLE PAR!). Halo Wraith chest-level ~220ft laser + XT Glow Nova for Par 3 alongside Jack's beauty Par 3!
- H3 (294ft, Par 3): Jeffery 4 | Jack 4. ~250ft tee drive + Pink DX Alien Circle-1 park ("Perfect! That's Circle 1!") before hitting top of basket for tied 4–4.
- H4 (296ft, Par 3): Jeffery 4 | Jack 4. Halo Wraith tee + Proto Glow Mako3 + DX Glow Roc 20ft out — hit basket and flopped out for tied 4–4.
- H5 (296ft, Par 3): Jeffery 3 (★ PAR!) | Jack 4. Halo Wraith faded safely back inside the baseball fence + DX Glow Roc hyzer right over the baseball backstop for Par 3! Jack hit basket and bounced out for 4.
- H6 (310ft, Par 3): Jeffery 4 | Jack 4. Star Rollo clean turnover ("flew how it's supposed to!") + Halloween Star Sync long run HIT THE PIN ("I hit the pin! Proud of that one!") for tied 4–4.
- H7 (324ft, Par 3): Jeffery 3 (★ CLUTCH LUSTER FIREBIRD PAR!) | Jack 4. Luster Firebird threaded right through the trees ("Great job, Firebird!") + XT Glow Nova 40ft save for proud Par 3!
- H8 (235ft, Par 3): Jeffery 4 | Jack 4. Halo Wraith tee (dodging tee post!) + softer upshot for tied 4–4.
- H9 (389ft, Par 3): Jeffery 5 | Jack 6. Glow Leopard3 flat-to-left (x2) + pin-hit approach for 5; Jack's 6 seals a 37 (+10) ALL-TIME MIZE PB TIE (5 strokes better than 10/28)!
- Unscored Solo Bonus Practice (H1–H5 while Jack hit the playground):
  * Bonus H1: Halo Wraith 18ft left ("Best ever thrown! Learning the Wraith!") + XT Glow Nova birdie putt went IN and fell straight through the basket!
  * Bonus H2–H3: Halo Wraith dialed straight without turning over too far left.
  * Bonus H4: Halo Wraith + Pink DX Alien HIT THE PAN ("Almost had my second birdie on Hole 4!").
  * Bonus H5: Halo Wraith clean right of the baseball backstop.`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 34 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 37 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 218,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'New fence around entire H1 field! Star Rollo test flipped right over the fence (retrieved!), played Hot Pink Archangel straight pin-high (~218ft) + XT Glow Nova for tied Bogey 4–4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-hot-pink-archangel',
          discUsed: 'Hot Pink Archangel',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Hot Pink Archangel dead-straight ~218ft pin-high (Star Rollo test went over new fence & retrieved!) + XT Glow Nova for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-hot-pink-archangel' },
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Solid opener Bogey 4 to tie Jeffery on fenced H1'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 264,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        '★ DOUBLE PAR (264 FT)! Cotton Candy Halo Wraith chest-level ~220ft laser ("Nice, nice, nice! Chest level the whole way!") + XT Glow Nova Par 3 alongside Jack\'s beauty Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halo-wraith',
          discUsed: 'Halo Wraith',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ 1st Cotton Candy Halo Wraith Par! Chest-level ~220ft drive + XT Glow Nova for Double Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-halo-wraith' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          fairwayHit: true,
          voiceNote: '★ "Right in there, Jack! That was a beauty!" — clutch Double Par 3!'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 294,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        '~250ft drive ("I am getting some distance—at least 250!") + Pink DX Alien parked inside Circle 1 ("Perfect! That\'s Circle 1!") before hitting top of basket for tied 4–4!',
      meta: {
        jeffery: {
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: '~250ft tee drive + Pink DX Alien parked Circle 1 + hit top of basket for Bogey 4',
          throws: [{ shotType: 'approach', discId: 'innova-dx-alien' }]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Clean Bogey 4 to stay deadlocked with Jeffery!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 296,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Halo Wraith tee + Proto Glow Mako3 + DX Glow Roc 20ft out — hit basket and flopped out ("I just hit these baskets and they flop out!") for tied Bogey 4–4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halo-wraith',
          discUsed: 'Halo Wraith',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          puttDistanceFeet: 20,
          voiceNote: 'Halo Wraith + Proto Glow Mako3 + DX Glow Roc to 20ft (basket flop-out!) for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-halo-wraith' },
            { shotType: 'fairway', discId: 'innova-proto-glow-mako3' },
            { shotType: 'approach', discId: 'innova-sugar-glow-roc' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Matched Jeffery at 4–4 on 296ft H4'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 296,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ 2ND HALO WRAITH PAR (296 FT)! Halo Wraith curved back safely inside the baseball fence ("Good one!") + DX Glow Roc hyzer right over the baseball backstop for Par 3! Jack hit basket for 4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halo-wraith',
          discUsed: 'Halo Wraith',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Halo Wraith faded safely inside fence + DX Glow Roc hyzer over baseball backstop for Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-halo-wraith' },
            { shotType: 'approach', discId: 'innova-sugar-glow-roc' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Hit the basket & bounced out for 4 ("That happened to me twice!")'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 310,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Cotton Candy Star Rollo clean turnover ("Flew how it\'s supposed to!") + Halloween Star Sync long run HIT THE PIN ("I hit the pin! Proud of that one!") for tied Bogey 4–4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Star Rollo clean turnover + Halloween Star Sync HIT THE PIN ("Proud of that one!") for 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'approach', discId: 'innova-halloween-sync' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Solid Bogey 4 on 310ft H6'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 324,
      scores: { jeffery: 3, jack: 4 },
      voiceTranscript:
        '★ CLUTCH LUSTER FIREBIRD PAR (324 FT)! Luster Firebird threaded right through the trees ("Great job, Firebird!") + XT Glow Nova 40ft save for proud Par 3 (Firebird now 3/4 career Pars!)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-luster-firebird',
          discUsed: 'Luster Firebird',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C2',
          puttDistanceFeet: 40,
          voiceNote: '★ Luster Firebird threaded trees cleanly ("Great job, Firebird!") + XT Glow Nova 40ft save for proud Par 3!',
          throws: [
            { shotType: 'tee', discId: 'innova-luster-firebird' },
            { shotType: 'approach', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: 'Clean Bogey 4 on long 324ft H7'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 235,
      scores: { jeffery: 4, jack: 4 },
      voiceTranscript:
        'Cotton Candy Halo Wraith good drive (careful of tee post on follow-through!) + softer upshot for tied Bogey 4–4!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-halo-wraith',
          discUsed: 'Halo Wraith',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Halo Wraith tee (dodging tee post!) + softer approach for tied 4',
          throws: [{ shotType: 'tee', discId: 'innova-halo-wraith' }]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          voiceNote: 'Bogey 4 keeps Jack on PB-tying pace heading into H9!'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 389,
      scores: { jeffery: 5, jack: 6 },
      voiceTranscript:
        'Cotton Candy Glow Leopard3 flat-to-left (x2) + pin-hit approach for 5 (34 / +7 total — 1 stroke better than 10/28!); Jack\'s 6 seals a 37 (+10) ALL-TIME MIZE PB TIE!! (Followed by 5 unscored solo bonus practice holes!)',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-glow-leopard3',
          discUsed: 'Glow Leopard3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Glow Leopard3 (x2) + pin-hit approach for 5 → 34 (+7) Cotton Candy Mize debut!',
          throws: [
            { shotType: 'tee', discId: 'innova-glow-leopard3' },
            { shotType: 'fairway', discId: 'innova-glow-leopard3' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-cicada',
          discUsed: 'Cicada',
          voiceNote: '★ Gorgeous S-curve + closing 6 → TIES ALL-TIME MIZE PB 37 (+10, 5 strokes better than 10/28)!'
        }
      }
    }
  ]
};

const ROUND_2026_11_26_BACKYARD_1: HistoricalRound = {
  id: 1795725600001,
  courseName: "Jack's Backyard Course",
  totalHoles: 9,
  date: '2026-11-26',
  duration: '00:26:00',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  notes:
    '🦃 THANKSGIVING DAY ROUND 1 AT GRANDMA & GRANDPA\'S — JACK\'S BACKYARD COURSE (Laundry Baskets on Tomato Cages · 3-Disc Challenge: Cotton Candy Star Rollo + XT Glow Nova + KC Pro Aviar)! JACK WINS UNDER PAR 26 (-1) vs Jeffery 28 (+1)! Jack birdied H6 (wearing gloves!) while Jeffery survived the pond (H2), roof (H4), & tiny chainless laundry baskets to close with a clutch Star Rollo Birdie 2 on H9!',
  roundTranscript: `Jack's Backyard Course (Grandma & Grandpa's · Bray 9-Hole Course · Thanksgiving Day Round 1 · 2026-11-26 · Laundry Baskets on Tomato Cages · Par 27 · 1,224 ft) — Jack 26 (-1 ★ WINNER!) vs Jeffery 28 (+1 · H9 Birdie Closer!).
Jeffery played a strict 3-Disc Challenge (Cotton Candy Star Rollo off the tee + XT Glow Nova & KC Pro Aviar putting — zero Yeti Pro Aviar used!) while Jack threw wearing winter gloves and defended his home-built course under par!
- H1 (128ft, Par 3 — Yard Opener by House): Jeffery 3 | Jack 3. Careful not to hit the house while Cheech/GG snuck out into the yard! Clean Double Par 3–3.
- H2 (160ft, Par 3 — Up by Grandpa's Shed & Pond): Jeffery 3 | Jack 3. Jeffery landed in the mosquito pond ("I'm in the pond! Grandpa got a towel here in the shed"), dried the disc off, and salvaged Par 3!
- H3 (135ft, Par 3 — Chicken Coop & Pool Cover): Jeffery 4 | Jack 3. Wet disc near pool cover & rooster ("Tiny baskets and no chains! That'll be four") while Jack carded Par 3.
- H4 (130ft, Par 3 — Little Island After Deck / Roof): Jeffery 4 | Jack 3. Jeffery bounced onto the roof ("I went on the roof too, so I might as well give myself a four"); Jack steady Par 3.
- H5 (135ft, Par 3 — Upper Yard Laundry Basket): Jeffery 3 | Jack 3. Confirmed strict 3-disc kit ("Using a Rollo, Nova, and KC Pro Aviar — that's the only thing I've been using! Laundry baskets on tomato cages!"). Double Par 3–3.
- H6 (140ft, Par 3 — Down-Yard): Jeffery 3 | Jack 2 (★ JACK BIRDIE!). Jack threw clean ~5ft away ("Got a birdie, Jack did!") to go -1 under par!
- H7 (130ft, Par 3 — Fire Pit & Treehouse): Jeffery 3 | Jack 3. Demoed Cotton Candy Star Rollo, XT Glow Nova, KC Pro Aviar, and the hip-rotation "slicing a box straight across your chest" cue to Grandpa & family! Double Par 3–3.
- H8 (135ft, Par 3 — House & Left Water Pool): Jeffery 3 | Jack 3. Showed off the custom Jeffery & Jack scoring app ("Yes, I got my own scoring app for me and Jack!"), avoided water pool left for Double Par 3–3.
- H9 (131ft, Par 3 — Backyard Closer): Jeffery 2 (★ BIRDIE!) | Jack 3. Jeffery closed with a clutch Star Rollo Birdie 2 ("There's my birdie!"), while Jack's Par 3 locked in a 26 (-1) Thanksgiving Championship victory over Jeffery's 28 (+1)!`,
  players: [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 28 },
    { id: 'jack', name: 'Jack', tag: 'J2', total: 26 }
  ],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 128,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Thanksgiving Day opener on Jack\'s home-built Bray 9-Hole Course! Star Rollo + KC Pro Aviar Par 3 while keeping Cheech/GG inside; Jack threw with gloves for Double Par 3–3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '3-Disc Challenge opener: Star Rollo + KC Pro Aviar for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: 'Throwing with gloves cleanly for Double Par 3–3!'
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 160,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Up by Grandpa\'s shed — Star Rollo splashed into the mosquito pond ("I\'m in the pond! Grandpa got a towel in the shed!"), dried off & saved Double Par 3–3 with XT Glow Nova!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Star Rollo pond splash + shed towel dry-off + XT Glow Nova Par save!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-buzzz-ss',
          discUsed: 'Buzzz SS',
          fairwayHit: true,
          voiceNote: 'Avoided pond cleanly for Par 3!'
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 135,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        'Back yard by chicken coop & pool cover (rooster crowing!) — wet Star Rollo + tiny chainless laundry basket for Bogey 4; Jack Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Wet Star Rollo + chainless laundry basket for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: 'Clean home-course Par 3 to take the lead!'
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 130,
      scores: { jeffery: 4, jack: 3 },
      voiceTranscript:
        'Little island after the deck — Star Rollo landed on the roof ("I went on the roof too, so I might as well give myself a four!"); Jack steady Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Star Rollo roof bounce + XT Glow Nova for Bogey 4',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: '"Good job, dude!" — 4th straight Par 3!'
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 135,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Upper yard laundry baskets on tomato cages! Confirmed strict 3-disc kit (Star Rollo, XT Glow Nova & KC Pro Aviar) for Double Par 3–3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Star Rollo + KC Pro Aviar Par 3 on tomato-cage laundry basket!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: '5th straight Par 3!'
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 140,
      scores: { jeffery: 3, jack: 2 },
      voiceTranscript:
        '★ JACK BIRDIE 2! Jack parked ~5ft away ("Got a birdie, Jack did!") to drop under par (-1); Jeffery steady Star Rollo + XT Glow Nova Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Star Rollo + XT Glow Nova Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: '★ CLUTCH HOME-COURSE BIRDIE 2 (~5ft park) to jump to -1 under par!'
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 130,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Fire pit & treehouse hole — demoed Cotton Candy Star Rollo, XT Glow Nova, KC Pro Aviar & the "slicing a box straight across your chest" hip swing to Grandpa & family for Double Par 3–3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Star Rollo + KC Pro Aviar Par 3 while coaching hip-swing "slice a box across chest"!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: 'Steady Par 3 keeping -1 lead!'
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 135,
      scores: { jeffery: 3, jack: 3 },
      voiceTranscript:
        'Showed off the custom Jeffery & Jack scoring app! Star Rollo + XT Glow Nova Par 3 avoiding the left water pool; Jack Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Star Rollo + XT Glow Nova Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: '8th straight Par-or-better!'
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 131,
      scores: { jeffery: 2, jack: 3 },
      voiceTranscript:
        '★ STAR ROLLO BIRDIE 2 CLOSER! Jeffery birdied 131ft H9 ("There\'s my birdie!") for 28 (+1) while Jack\'s Par 3 sealed a BOGEY-FREE 26 (-1) THANKSGIVING VICTORY on the course he built!!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-sugar-star-rollo',
          discUsed: 'Star Rollo',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Walk-off Cotton Candy Star Rollo Birdie 2 on 131ft H9 → 28 (+1)!',
          throws: [
            { shotType: 'tee', discId: 'innova-sugar-star-rollo' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        },
        jack: {
          thrownDiscId: 'discraft-roach',
          discUsed: 'Roach',
          fairwayHit: true,
          voiceNote: '🏆 BOGEY-FREE 26 (-1) VICTORY ON JACK\'S BACKYARD COURSE!!'
        }
      }
    }
  ]
};

const ROUND_2026_11_26_BACKYARD_2: HistoricalRound = {
  id: 1795727400002,
  courseName: "Jack's Backyard Course",
  totalHoles: 9,
  date: '2026-11-26',
  duration: '00:22:00',
  par: 27,
  windCondition: 'calm',
  gameMode: 'stroke',
  notes:
    '🔥 THANKSGIVING DAY ROUND 2 (SOLO — BOGEY-FREE 25 / -2 COURSE RECORD!!): Jeffery swapped Star Rollo for Cotton Candy Proto Glow Mako3 ("That went straight, Jeffery — that\'s what I\'ve been working towards!") + XT Glow Nova & KC Pro Aviar! Jack warmed up inside after H3 when discs got wet/cold, and Jeffery went BOGEY-FREE 25 (-2) with 2 Mako3 Birdies (H4 & H7) & 7 Pars!',
  roundTranscript: `Jack's Backyard Course (Grandma & Grandpa's · Thanksgiving Day Round 2 · 2026-11-26 · Jeffery Solo · Par 27 · 1,224 ft) — Jeffery 25 (-2 ★ BOGEY-FREE COURSE RECORD!!).
Switched tee disc from Star Rollo to Cotton Candy Proto Glow Mako3 ("Put back my Rollo, we're using the Mako 3!") paired with XT Glow Nova & KC Pro Aviar. Jack played H1–H3 before heading inside from cold wet discs, so Jeffery switched the live app cleanly to Solo and fired a bogey-free 25 (-2)!
- H1 (128ft, Par 3): Jeffery 3. Proto Glow Mako3 dead straight ("That went straight, Jeffery! That's what I've been working towards on that one — didn't throw it powerful!") for Par 3.
- H2 (160ft, Par 3 — Pond by Shed): Jeffery 3. Stopped right on the edge of the pond ("Right on the edge!") for Par 3.
- H3 (135ft, Par 3 — Duck Pan / Wet Discs): Jeffery 3. Jack headed inside to warm up ("We'll just make this a Jeffery round"); clean Par 3.
- H4 (130ft, Par 3 — Roof Island): Jeffery 2 (★ BIRDIE!). Dialed Proto Glow Mako3 on target ("Give myself a two!") for Birdie 2!
- H5 (135ft, Par 3): Jeffery 3. Clean Mako3 + putt for Par 3.
- H6 (140ft, Par 3): Jeffery 3. Clipped the lone tree & almost slipped near the pool ("Almost fell in this pool!"), saved Par 3!
- H7 (130ft, Par 3 — Fire Pit & Treehouse): Jeffery 2 (★ 2ND BIRDIE!). "That was beautiful, that felt good! If that was a normal basket with chains, I would have made it — counting that as a two!"
- H8 (135ft, Par 3): Jeffery 3. Steady Par 3.
- H9 (131ft, Par 3): Jeffery 3. Closing Par 3 seals a BOGEY-FREE 25 (-2) Backyard Course Record (7 Pars, 2 Birdies, 0 Bogeys) powered 100% by Cotton Candy Proto Glow Mako3!`,
  players: [{ id: 'jeffery', name: 'Jeffery', tag: 'J1', total: 25 }],
  holes: [
    {
      number: 1,
      par: 3,
      distance: 128,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Swapped to Cotton Candy Proto Glow Mako3 — striped dead-straight ("That went straight, Jeffery! That\'s what I\'ve been working towards!") for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 dead-straight opener ("what I\'ve been working towards!") for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 2,
      par: 3,
      distance: 160,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Proto Glow Mako3 stayed right on the dry edge of the pond ("Oh good, right on the edge!") for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 safe on pond edge for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 3,
      par: 3,
      distance: 135,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Duck pan wet discs — Jack headed inside to warm up ("We\'ll just make this a Jeffery round"); Proto Glow Mako3 + putt for Par 3!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Switched to Solo after Jack went in cold; Proto Glow Mako3 Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 4,
      par: 3,
      distance: 130,
      scores: { jeffery: 2 },
      voiceTranscript:
        '★ BIRDIE 2! Cotton Candy Proto Glow Mako3 nailed the island green for a real-basket Birdie 2!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Proto Glow Mako3 Birdie 2 on H4!',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 5,
      par: 3,
      distance: 135,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Cotton Candy Proto Glow Mako3 + XT Glow Nova tap-in for 5th straight Par-or-better!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 + XT Glow Nova Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 6,
      par: 3,
      distance: 140,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Clipped the lone tree & nearly slipped by the pool ("Almost fell in this pool!"), salvaged Par 3 with Proto Glow Mako3 + XT Glow Nova!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 tree clip + pool-edge save for Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 7,
      par: 3,
      distance: 130,
      scores: { jeffery: 2 },
      voiceTranscript:
        '★ 2ND MAKO3 BIRDIE 2! "That was beautiful, that felt good! If that was a normal basket with chains, I would have made it!"',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Proto Glow Mako3 pure beauty ("That felt good!") Birdie 2 on H7!',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    },
    {
      number: 8,
      par: 3,
      distance: 135,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Cotton Candy Proto Glow Mako3 + XT Glow Nova clean Par 3 keeping the bogey-free round alive!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: 'Proto Glow Mako3 + XT Glow Nova Par 3',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-xt-glow-nova' }
          ]
        }
      }
    },
    {
      number: 9,
      par: 3,
      distance: 131,
      scores: { jeffery: 3 },
      voiceTranscript:
        'Closing Proto Glow Mako3 Par 3 seals a BOGEY-FREE 25 (-2) Backyard Course Record (7 Pars, 2 Birdies, 0 Bogeys)!',
      meta: {
        jeffery: {
          thrownDiscId: 'innova-proto-glow-mako3',
          discUsed: 'Proto Glow Mako3',
          scenarioUsed: 'calm',
          fairwayHit: true,
          puttDistance: 'C1',
          voiceNote: '★ Closing Par 3 seals BOGEY-FREE 25 (-2) Course Record with Proto Glow Mako3!',
          throws: [
            { shotType: 'tee', discId: 'innova-proto-glow-mako3' },
            { shotType: 'putt', discId: 'innova-kc-pro-aviar' }
          ]
        }
      }
    }
  ]
};

export const INITIAL_USER_EXPORT: AppExportPayload = {
  app: typedV65.app || 'Jeffery & Jack Disc Golf Scorecard',
  version: 'v117',
  exportDate: '2026-11-27T22:50:00.000Z',
  history: [
    ROUND_2026_11_27_MIZE,
    ROUND_2026_11_26_BACKYARD_2,
    ROUND_2026_11_26_BACKYARD_1,
    ROUND_2026_11_25_HERITAGE_PARK_18,
    ROUND_2026_11_23_BLACK_HOOF_18,
    ROUND_2026_11_22_ART_NINE,
    ROUND_2026_11_22_SMP_WOODED,
    ROUND_2026_11_17_ART_NINE,
    ROUND_2026_11_17_SMP_WOODED,
    ROUND_2026_11_16_SARKO_2,
    ROUND_2026_11_16_SARKO_1,
    ROUND_2026_11_15_PRAIRIE_PASS,
    ROUND_2026_11_13_SARKO,
    ROUND_2026_11_11_SARKO,
    ROUND_2026_11_10_SHAWNEE_WOODED,
    ROUND_2026_11_09_SARKO,
    ROUND_2026_11_08_ART_NINE,
    ROUND_2026_11_08_PRAIRIE_CENTER,
    ROUND_2026_11_05_SARKO_2,
    ROUND_2026_11_05_SARKO_1,
    ROUND_2026_11_04_SARKO,
    ROUND_2026_11_03_SARKO,
    ROUND_2026_11_02_SARKO,
    ROUND_2026_11_01_BLACK_HOOF,
    ROUND_2026_11_01_CEDAR_RIDGE,
    ROUND_2026_10_30_SARKO,
    ROUND_2026_10_29_CAL_TRAIL,
    ROUND_2026_10_29_SARKO,
    ROUND_2026_10_28_MIZE,
    ROUND_2026_10_28_SARKO,
    ROUND_2026_10_26_MIZE,
    ROUND_2026_10_25_ART_NINE,
    ROUND_2026_10_25_MIZE,
    ...(typedV65.history || []).filter(
      (r) =>
        r.id !== ROUND_2026_11_27_MIZE.id &&
        r.id !== ROUND_2026_11_26_BACKYARD_2.id &&
        r.id !== ROUND_2026_11_26_BACKYARD_1.id &&
        r.id !== ROUND_2026_11_25_HERITAGE_PARK_18.id &&
        r.id !== ROUND_2026_11_23_BLACK_HOOF_18.id &&
        r.id !== ROUND_2026_11_22_ART_NINE.id &&
        r.id !== ROUND_2026_11_22_SMP_WOODED.id &&
        r.id !== ROUND_2026_11_17_ART_NINE.id &&
        r.id !== ROUND_2026_11_17_SMP_WOODED.id &&
        r.id !== ROUND_2026_11_16_SARKO_2.id &&
        r.id !== ROUND_2026_11_16_SARKO_1.id &&
        r.id !== ROUND_2026_11_15_PRAIRIE_PASS.id &&
        r.id !== ROUND_2026_11_13_SARKO.id &&
        r.id !== ROUND_2026_11_11_SARKO.id &&
        r.id !== ROUND_2026_11_10_SHAWNEE_WOODED.id &&
        r.id !== ROUND_2026_11_09_SARKO.id &&
        r.id !== ROUND_2026_11_08_ART_NINE.id &&
        r.id !== ROUND_2026_11_08_PRAIRIE_CENTER.id &&
        r.id !== ROUND_2026_11_05_SARKO_2.id &&
        r.id !== ROUND_2026_11_05_SARKO_1.id &&
        r.id !== ROUND_2026_11_04_SARKO.id &&
        r.id !== ROUND_2026_11_03_SARKO.id &&
        r.id !== ROUND_2026_11_02_SARKO.id &&
        r.id !== ROUND_2026_11_01_BLACK_HOOF.id &&
        r.id !== ROUND_2026_11_01_CEDAR_RIDGE.id &&
        r.id !== ROUND_2026_10_30_SARKO.id &&
        r.id !== ROUND_2026_10_29_CAL_TRAIL.id &&
        r.id !== ROUND_2026_10_29_SARKO.id &&
        r.id !== ROUND_2026_10_28_MIZE.id &&
        r.id !== ROUND_2026_10_28_SARKO.id &&
        r.id !== ROUND_2026_10_26_MIZE.id &&
        r.id !== ROUND_2026_10_25_ART_NINE.id &&
        r.id !== ROUND_2026_10_25_MIZE.id
    )
  ],
  roster: typedV65.roster || [
    { id: 'jeffery', name: 'Jeffery', tag: 'J1', color: 'blue-600' },
    { id: 'jack', name: 'Jack', tag: 'J2', color: 'blue-800' }
  ],
  roundState: typedV65.roundState,
  webhookUrl:
    typedV65.webhookUrl ||
    'https://script.google.com/macros/s/AKfycbz_placeholder_webhook/exec',
  timerState: typedV65.timerState || {
    running: false,
    startTime: null,
    accumulatedMs: 0
  },
  courses: INITIAL_COURSE_TEMPLATES,
  bag: INITIAL_DISC_BAG
};

export const PUBLIC_HD_CARD_MAP: Record<string, string> = {
  'innova-xt-glow-nova': './assets/aistudio/card_xt_glow_nova_sugar_high_4204e372.jpg',
  'innova-proto-glow-aviar': './assets/aistudio/card_sugar_high_proto_glow_aviar.jpg',
  'innova-yeti-pro-aviar': './assets/aistudio/card_sugar_high_yeti_pro_aviar.jpg',
  'innova-kc-pro-aviar': './assets/aistudio/card_kc_pro_aviar_sugar_high_06f196b2.jpg',
  'innova-sugar-glow-roc': './assets/aistudio/card_sugar_high_dx_glow_roc.jpg',
  'innova-proto-glow-mako3': './assets/aistudio/card_sugar_high_proto_glow_mako3.jpg',
  'innova-sugar-star-rollo': './assets/aistudio/card_sugar_high_star_rollo.jpg',
  'innova-glow-leopard3': './assets/aistudio/card_sugar_high_glow_leopard3.jpg',
  'innova-glow-teebird': './assets/aistudio/card_sugar_high_glow_teebird.jpg',
  'innova-champion-eagle': './assets/aistudio/card_champion_eagle_sugar_high_a806d919.jpg',
  'innova-sugar-star-roadrunner': './assets/aistudio/card_sugar_high_star_roadrunner.jpg',
  'innova-luster-firebird': './assets/aistudio/card_sugar_high_luster_firebird.jpg',
  'innova-halo-wraith': './assets/aistudio/card_sugar_high_halo_wraith.jpg',
  'innova-halo-destroyer': './assets/aistudio/card_sugar_high_halo_destroyer.jpg',
  'innova-aviar': './assets/aistudio/card_star_aviar_ef73dd08.jpg',
  'innova-sync': './assets/aistudio/card_star_sync_8e893621.jpg',
  'innova-halloween-sync': './assets/aistudio/card_star_sync_halloween_pink.jpg',
  'innova-toro': './assets/aistudio/card_star_toro_order_front_b7d093dc.jpg',
  'innova-toro-alt': './assets/aistudio/card_star_toro_order_front_b7d093dc.jpg',
  'innova-dx-alien': './assets/aistudio/card_pink_dx_alien_invoice_4fe78f83.jpg',
  'innova-rollo': './assets/aistudio/card_star_rollo_7d7f53c4.jpg',
  'innova-mako3': './assets/aistudio/card_glow_mako3_db46e7f1.jpg',
  'innova-jay': './assets/aistudio/card_star_jay_order_front_c57ddddd.jpg',
  'innova-roc3': './assets/aistudio/card_dx_roc3_f562e170.jpg',
  'innova-classic-glow-roc': './assets/aistudio/card_classic_glow_roc_invoice_c493a3ba.jpg',
  'innova-leopard3': './assets/aistudio/card_gstar_leopard3_order_front_11425ae3.jpg',
  'innova-archangel': './assets/aistudio/card_dx_archangel_order_front_79dc09a3.jpg',
  'innova-hot-pink-archangel': './assets/aistudio/card_dx_archangel_hot_pink.jpg',
  'innova-roadrunner': './assets/aistudio/card_gstar_roadrunner_order_front_832980e5.jpg',
  'innova-classic-glow-beast': './assets/aistudio/card_classic_glow_beast_invoice_92808f96.jpg',
  'innova-mamba': './assets/aistudio/card_star_mamba_c3695bde.jpg',
  'innova-classic-glow-wraith': './assets/aistudio/card_classic_glow_wraith_invoice_935bbe7c.jpg',
  'discraft-roach': './assets/aistudio/card_discraft_roach_764e9135.jpg',
  'discraft-buzzz-ss': './assets/aistudio/card_discraft_buzzz_ss_28fc5e66.jpg',
  'discraft-cicada': './assets/aistudio/card_discraft_cicada_0d39ceab.jpg',
  'innova-pig': './assets/aistudio/card_xt_pig_d9431323.jpg',
  'innova-it': './assets/aistudio/card_purple_halo_it_abfe9cf2.jpg',
  'innova-firebird': './assets/aistudio/card_champion_firebird_09e3e5d9.jpg'
};

export const BUILT_IN_CARD_IMAGES: Record<string, string> = {
  ...PUBLIC_HD_CARD_MAP,
  'card_sugar_high_proto_glow_aviar.jpg': PUBLIC_HD_CARD_MAP['innova-proto-glow-aviar'],
  'card_sugar_high_yeti_pro_aviar.jpg': PUBLIC_HD_CARD_MAP['innova-yeti-pro-aviar'],
  'card_sugar_high_dx_glow_roc.jpg': PUBLIC_HD_CARD_MAP['innova-sugar-glow-roc'],
  'card_sugar_high_proto_glow_mako3.jpg': PUBLIC_HD_CARD_MAP['innova-proto-glow-mako3'],
  'card_sugar_high_star_rollo.jpg': PUBLIC_HD_CARD_MAP['innova-sugar-star-rollo'],
  'card_sugar_high_glow_leopard3.jpg': PUBLIC_HD_CARD_MAP['innova-glow-leopard3'],
  'card_sugar_high_glow_teebird.jpg': PUBLIC_HD_CARD_MAP['innova-glow-teebird'],
  'card_sugar_high_star_roadrunner.jpg': PUBLIC_HD_CARD_MAP['innova-sugar-star-roadrunner'],
  'card_sugar_high_luster_firebird.jpg': PUBLIC_HD_CARD_MAP['innova-luster-firebird'],
  'card_sugar_high_halo_wraith.jpg': PUBLIC_HD_CARD_MAP['innova-halo-wraith'],
  'card_sugar_high_halo_destroyer.jpg': PUBLIC_HD_CARD_MAP['innova-halo-destroyer'],
  'card_star_aviar.jpg': PUBLIC_HD_CARD_MAP['innova-aviar'],
  'card_kc_pro_aviar_sugar_high_06f196b2.jpg': PUBLIC_HD_CARD_MAP['innova-kc-pro-aviar'],
  'card_kc_pro_aviar_cotton_candy_v2_f322901a.jpg': PUBLIC_HD_CARD_MAP['innova-kc-pro-aviar'],
  'card_kc_pro_aviar_cotton_candy_78dd0f75.jpg': PUBLIC_HD_CARD_MAP['innova-kc-pro-aviar'],
  'card_xt_glow_nova_sugar_high_4204e372.jpg': PUBLIC_HD_CARD_MAP['innova-xt-glow-nova'],
  'card_xt_glow_nova_cotton_candy_v2_90361134.jpg': PUBLIC_HD_CARD_MAP['innova-xt-glow-nova'],
  'card_xt_glow_nova_cotton_candy_97868c2e.jpg': PUBLIC_HD_CARD_MAP['innova-xt-glow-nova'],
  'card_star_sync.jpg': PUBLIC_HD_CARD_MAP['innova-sync'],
  'card_star_sync_8e893621.jpg': PUBLIC_HD_CARD_MAP['innova-sync'],
  'card_star_sync_halloween_pink.jpg': PUBLIC_HD_CARD_MAP['innova-halloween-sync'],
  'card_xt_pig.jpg': PUBLIC_HD_CARD_MAP['innova-pig'],
  'card_star_rollo.jpg': PUBLIC_HD_CARD_MAP['innova-rollo'],
  'card_glow_mako3.jpg': PUBLIC_HD_CARD_MAP['innova-mako3'],
  'card_dx_roc3.jpg': PUBLIC_HD_CARD_MAP['innova-roc3'],
  'card_purple_halo_it.jpg': PUBLIC_HD_CARD_MAP['innova-it'],
  'card_champion_firebird.jpg': PUBLIC_HD_CARD_MAP['innova-firebird'],
  'card_champion_eagle_sugar_high_a806d919.jpg': PUBLIC_HD_CARD_MAP['innova-champion-eagle'],
  'card_champion_eagle_cotton_candy_v2_0f5474a8.jpg': PUBLIC_HD_CARD_MAP['innova-champion-eagle'],
  'card_champion_eagle_cotton_candy_3445057c.jpg': PUBLIC_HD_CARD_MAP['innova-champion-eagle'],
  'card_star_mamba.jpg': PUBLIC_HD_CARD_MAP['innova-mamba'],
  'card_star_toro_order_front_b7d093dc.jpg': PUBLIC_HD_CARD_MAP['innova-toro'],
  'card_star_jay_order_front_c57ddddd.jpg': PUBLIC_HD_CARD_MAP['innova-jay'],
  'card_gstar_leopard3_order_front_11425ae3.jpg': PUBLIC_HD_CARD_MAP['innova-leopard3'],
  'card_dx_archangel_order_front_79dc09a3.jpg': PUBLIC_HD_CARD_MAP['innova-archangel'],
  'card_dx_archangel_hot_pink.jpg': PUBLIC_HD_CARD_MAP['innova-hot-pink-archangel'],
  'card_gstar_roadrunner_order_front_832980e5.jpg': PUBLIC_HD_CARD_MAP['innova-roadrunner'],
  'card_pink_dx_alien_invoice_4fe78f83.jpg': PUBLIC_HD_CARD_MAP['innova-dx-alien'],
  'card_pink_dx_alien_892926e3.jpg': PUBLIC_HD_CARD_MAP['innova-dx-alien'],
  'card_classic_glow_roc_invoice_c493a3ba.jpg': PUBLIC_HD_CARD_MAP['innova-classic-glow-roc'],
  'card_classic_glow_roc_c310839c.jpg': PUBLIC_HD_CARD_MAP['innova-classic-glow-roc'],
  'card_classic_glow_beast_invoice_92808f96.jpg': PUBLIC_HD_CARD_MAP['innova-classic-glow-beast'],
  'card_classic_glow_beast_31c40cd0.jpg': PUBLIC_HD_CARD_MAP['innova-classic-glow-beast'],
  'card_classic_glow_wraith_invoice_935bbe7c.jpg': PUBLIC_HD_CARD_MAP['innova-classic-glow-wraith'],
  'card_classic_glow_wraith_3e42b21e.jpg': PUBLIC_HD_CARD_MAP['innova-classic-glow-wraith'],
  'card_discraft_roach.jpg': PUBLIC_HD_CARD_MAP['discraft-roach'],
  'card_discraft_buzzz_ss.jpg': PUBLIC_HD_CARD_MAP['discraft-buzzz-ss'],
  'card_discraft_cicada.jpg': PUBLIC_HD_CARD_MAP['discraft-cicada']
};

export const DASHBOARD_HD_CARD_MAP: Record<string, string> = {
  ...PUBLIC_HD_CARD_MAP
};

export function getDiscCardImageUrl(disc?: DiscItem | null): string | null {
  if (!disc) return null;
  if (PUBLIC_HD_CARD_MAP[disc.id]) return PUBLIC_HD_CARD_MAP[disc.id];
  if (BUILT_IN_CARD_IMAGES[disc.id]) return BUILT_IN_CARD_IMAGES[disc.id];
  if (disc.cardImage && BUILT_IN_CARD_IMAGES[disc.cardImage]) {
    return BUILT_IN_CARD_IMAGES[disc.cardImage];
  }
  if (disc.cardImage) {
    if (disc.cardImage.startsWith('/assets/')) {
      return `.${disc.cardImage}`;
    }
    if (
      disc.cardImage.startsWith('http') ||
      disc.cardImage.startsWith('data:') ||
      disc.cardImage.startsWith('./') ||
      disc.cardImage.startsWith('/')
    ) {
      return disc.cardImage;
    }
    return `./${disc.cardImage.replace(/^\/+/, '')}`;
  }
  return null;
}


