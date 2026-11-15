import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const SYNC_FILE_PATH = path.resolve(__dirname, 'cloud_sync_state.json');

function normalizeServerCourseSig(courseName?: string): string {
  const raw = (courseName || '').toLowerCase();
  if (
    raw === 'prairie_pass' ||
    raw.includes('prairie pass') ||
    raw.includes('blue valley') ||
    raw.includes('pleasant ridge')
  ) {
    return 'prairie_pass';
  }
  if (raw === 'prairie_center' || raw.includes('prairie center')) return 'prairie_center';
  if (raw.includes('shawnee mission wooded') || raw.includes('smp_wooded')) return 'smp_wooded';
  if (raw.includes('sar-ko-par') || raw.includes('sarko')) return 'sarko';
  if (raw.includes('mize')) return 'mize';
  if (raw.includes('art nine')) return 'artnine';
  if (raw.includes('harmon')) return 'harmon';
  if (raw.includes('california trail') || raw.includes('cal trail')) return 'caltrail';
  if (raw.includes('black hoof') && !raw.includes('championship')) return 'blackhoof';
  if (raw.includes('wyandotte')) return 'wyandotte';
  if (raw.includes('wolf den') || raw.includes('mission trail')) return 'wolfden';
  return raw.replace(/[^a-z0-9]/g, '');
}

function mergeServerStates(
  existing: Record<string, any> | null,
  incoming: Record<string, any>
): Record<string, any> {
  // 0. Always union existing.deletedIds and incoming.deletedIds first
  const deletedSet = new Set<string>(
    [
      ...(Array.isArray(existing?.deletedIds) ? existing.deletedIds : []),
      ...(Array.isArray(incoming?.deletedIds) ? incoming.deletedIds : []),
    ]
      .filter((x) => x !== null && x !== undefined && String(x).trim() !== '')
      .map((x) => String(x).trim())
  );

  const getSig = (r: any) => {
    const pKey = Array.isArray(r?.players)
      ? r.players
          .map((p: any) => `${String(p.id || '').toLowerCase()}:${p.total}`)
          .sort()
          .join('|')
      : '';
    return `${r?.date || ''}::${normalizeServerCourseSig(r?.courseName)}::${pKey}`;
  };

  const getFallbackSig = (r: any) => {
    const jeffTotal = Array.isArray(r?.players)
      ? r.players.find((p: any) => String(p.id || '').toLowerCase() === 'jeffery')?.total ?? ''
      : '';
    return `${r?.date || ''}::${normalizeServerCourseSig(r?.courseName)}::j:${jeffTotal}`;
  };

  const getDeterministicSig = (r: any) => {
    const datePart = String(r?.date || '').trim();
    const coursePart = String(r?.course || r?.courseName || '').trim();
    const scorePart =
      r?.totalScore !== undefined && r?.totalScore !== null
        ? String(r.totalScore)
        : String(
            r?.players?.find((p: any) => String(p?.id || '').toLowerCase() === 'jeffery')
              ?.total ??
              r?.players?.[0]?.total ??
              ''
          );
    return `${datePart}_${coursePart}_${scorePart}`;
  };

  const getNormalizedDeterministicSig = (r: any) => {
    const datePart = String(r?.date || '').trim();
    const coursePart = normalizeServerCourseSig(r?.course || r?.courseName);
    const scorePart =
      r?.totalScore !== undefined && r?.totalScore !== null
        ? String(r.totalScore)
        : String(
            r?.players?.find((p: any) => String(p?.id || '').toLowerCase() === 'jeffery')
              ?.total ??
              r?.players?.[0]?.total ??
              ''
          );
    return `${datePart}_${coursePart}_${scorePart}`;
  };

  const isRoundDeleted = (r: any) => {
    if (!r || typeof r.id !== 'number') return true;
    if (deletedSet.size === 0) return false;
    return (
      deletedSet.has(String(r.id)) ||
      deletedSet.has(`round:${r.id}`) ||
      deletedSet.has(getSig(r)) ||
      deletedSet.has(getFallbackSig(r)) ||
      deletedSet.has(getDeterministicSig(r)) ||
      deletedSet.has(getNormalizedDeterministicSig(r))
    );
  };

  const isDiscDeleted = (d: any) => {
    if (!d || !d.id) return true;
    if (deletedSet.size === 0) return false;
    return deletedSet.has(String(d.id)) || deletedSet.has(`disc:${d.id}`);
  };

  if (!existing || typeof existing !== 'object') {
    return {
      ...incoming,
      history: Array.isArray(incoming.history)
        ? incoming.history.filter((r: any) => !isRoundDeleted(r))
        : [],
      bag: Array.isArray(incoming.bag)
        ? incoming.bag.filter((d: any) => !isDiscDeleted(d))
        : incoming.bag,
      deletedIds: Array.from(deletedSet),
      forceOverwrite: false,
      updatedAt: incoming.updatedAt || Date.now(),
    };
  }

  // 1. Union merge rounds by ID and (date + course + totals) signature, filtering out deleted rounds first
  const roundsById = new Map<number, any>();
  const sigToId = new Map<string, number>();

  const upsertRound = (r: any) => {
    if (!r || typeof r.id !== 'number') return;
    if (isRoundDeleted(r)) return;
    const sig = getSig(r);
    const matchedId = roundsById.has(r.id) ? r.id : sigToId.get(sig);
    if (matchedId !== undefined && roundsById.has(matchedId)) {
      const prev = roundsById.get(matchedId);
      const prevTime = prev.updatedAt || 0;
      const nextTime = r.updatedAt || 0;
      const winner =
        nextTime >= prevTime
          ? {...prev, ...r, id: matchedId}
          : {...r, ...prev, id: matchedId};
      if (!isRoundDeleted(winner)) {
        roundsById.set(matchedId, winner);
        sigToId.set(getSig(winner), matchedId);
      } else {
        roundsById.delete(matchedId);
      }
    } else {
      roundsById.set(r.id, r);
      sigToId.set(sig, r.id);
    }
  };

  if (Array.isArray(existing.history)) existing.history.forEach(upsertRound);
  if (Array.isArray(incoming.history)) incoming.history.forEach(upsertRound);

  const mergedHistory = Array.from(roundsById.values())
    .filter((r) => !isRoundDeleted(r))
    .sort(
      (a, b) =>
        String(b.date || '').localeCompare(String(a.date || '')) || b.id - a.id
    );

  // 2. Union merge bag by disc ID and latest updatedAt, filtering out deleted discs first
  const bagById = new Map<string, any>();
  if (Array.isArray(existing.bag)) {
    for (const d of existing.bag) {
      if (d?.id && !isDiscDeleted(d)) bagById.set(d.id, d);
    }
  }
  if (Array.isArray(incoming.bag)) {
    for (const d of incoming.bag) {
      if (!d?.id) continue;
      if (isDiscDeleted(d)) {
        bagById.delete(d.id);
        continue;
      }
      const prev = bagById.get(d.id);
      if (!prev || (d.updatedAt || 0) >= (prev.updatedAt || 0)) {
        bagById.set(d.id, {...prev, ...d});
      }
    }
  }

  const existingTime = existing.updatedAt || 0;
  const incomingTime = incoming.updatedAt || 0;
  const newer = incomingTime >= existingTime ? incoming : existing;
  const older = newer === incoming ? existing : incoming;

  const existingRsTime = existing.roundState?.updatedAt || 0;
  const incomingRsTime = incoming.roundState?.updatedAt || 0;

  return {
    ...older,
    ...newer,
    updatedAt: Math.max(existingTime, incomingTime),
    history: mergedHistory,
    bag: bagById.size > 0 ? Array.from(bagById.values()) : newer.bag || older.bag,
    roundState:
      incomingRsTime >= existingRsTime
        ? incoming.roundState || existing.roundState
        : existing.roundState || incoming.roundState,
    verifiedHolePicks: {
      ...(older.verifiedHolePicks || {}),
      ...(newer.verifiedHolePicks || {}),
    },
    deletedIds: Array.from(deletedSet),
    forceOverwrite: false,
  };
}

function createCloudSyncHandler() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';
    if (!url.startsWith('/api/sync')) {
      next();
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    if (req.method === 'GET') {
      try {
        if (fs.existsSync(SYNC_FILE_PATH)) {
          const raw = fs.readFileSync(SYNC_FILE_PATH, 'utf-8');
          const parsed = JSON.parse(raw);
          res.statusCode = 200;
          res.end(JSON.stringify({ok: true, state: parsed}));
          return;
        }
      } catch {
        // Ignore read error
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ok: true, state: null}));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body || '{}');
          let existing: Record<string, any> | null = null;
          if (fs.existsSync(SYNC_FILE_PATH)) {
            try {
              existing = JSON.parse(fs.readFileSync(SYNC_FILE_PATH, 'utf-8'));
            } catch {
              existing = null;
            }
          }
          const merged = mergeServerStates(existing, incoming);
          fs.writeFileSync(SYNC_FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              ok: true,
              state: merged,
              updatedAt: merged.updatedAt,
            })
          );
        } catch (err: any) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              ok: false,
              error: err?.message || 'Invalid JSON payload',
            })
          );
        }
      });
      return;
    }

    next();
  };
}

function cloudSyncServerPlugin(): Plugin {
  const handler = createCloudSyncHandler();
  return {
    name: 'jj-disc-golf-cloud-sync-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), cloudSyncServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              ignored: ['**/cloud_sync_state.json'],
            },
    },
  };
});

