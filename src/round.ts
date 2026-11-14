import { edgeId, neighbors, togglePassage, type Board, type Passage, type Pickup } from './graph.ts';
import { search, type SearchResult } from './search.ts';

export const ROUND_MS = 30_000;
export const MOVE_MS = 800;
export const MAX_INK = 4;
const REFILL_MS = 4_000;
const SURGE_DURATION = 2_000;
const SURGE_SPEED = 1.7;
const breakTime = (passage: Passage | undefined) => passage === 'reinforced' ? 3500 : passage === 'bar' ? 1600 : 0;
export const boardSizes = { compact: [12, 10], standard: [16, 12], large: [20, 14] } as const;
export const roundDurations = [30, 60, 90, 120, 180];
export type Tool = 'bar' | 'reinforce' | 'erase';

export function generateBoard(random = Math.random, cols = 10, rows = 7): Board {
  const passages: Record<string, Passage> = {};
  const centerRow = Math.floor(rows / 2) * cols;
  const board = { cols, rows, start: centerRow + 1, exit: centerRow + cols - 2, passages };
  const wallCount = Math.round(cols * rows / 5);
  const edges = Array.from({ length: cols * rows }, (_, cell) =>
    neighbors(board, cell).filter(next => next > cell && cell !== board.start && next !== board.start
      && cell !== board.exit && next !== board.exit).map(next => edgeId(cell, next)),
  ).flat();

  let placed = 0;
  while (placed < wallCount && edges.length) {
    const [edge] = edges.splice(Math.floor(random() * edges.length), 1);
    passages[edge] = 'wall';
    if (search(board, 'astar').cost === null) delete passages[edge];
    else placed++;
  }
  const route = search(board, 'astar').path.slice(1, -1);
  const selections = [route.slice(0, Math.ceil(route.length / 2)), route.slice(Math.ceil(route.length / 2))];
  const kinds = ['breaker', 'surge'] as const;
  const pickups = kinds.flatMap((kind, index) => {
    const cells = selections[index];
    return cells.length ? [{ kind, cell: cells[Math.floor(random() * cells.length)] }] : [];
  });
  return { ...board, pickups };
}

export type Round = {
  board: Board;
  cell: number;
  to: number | null;
  facing: 'down' | 'up' | 'right' | 'left';
  moveMs: number;
  elapsed: number;
  duration: number;
  ink: number;
  blocked: boolean;
  outcome: 'running' | 'contained' | 'escaped';
  decision: Decision | null;
  breaking: { edge: string; completesAt: number; duration: number } | null;
  breakerCharges: number;
  surgeUntil: number;
  pickupLog: readonly (Pickup & { at: number })[];
};

export type Decision = {
  board: Board; at: number; search: SearchResult; cell: number;
  action: 'move' | 'break' | 'seek' | 'wait';
  openMoves: number | null;
  weightedMs: number | null;
};

export const decisionActions: Record<Decision['action'], string> = {
  move: 'Move', break: 'Break bars', seek: 'Seek Wall Breaker', wait: 'Wait',
};
export const pickupNames = { breaker: 'Wall Breaker', surge: 'Speed Surge' };

export function createRound(board: Board, duration = ROUND_MS): Round {
  return {
    board, cell: board.start, to: null, facing: 'down', moveMs: 0, elapsed: 0, duration,
    ink: 2, blocked: false, outcome: 'running', decision: null,
    breaking: null, breakerCharges: 0, surgeUntil: 0, pickupLog: [],
  };
}

export function toolCost(passage: Passage | undefined, tool: Tool): number | null {
  if (passage === 'wall') return null;
  if (tool === 'erase') return passage ? 0 : null;
  if (tool === 'reinforce') return passage === 'reinforced' ? null : passage === 'bar' ? 1 : 2;
  return passage ? null : 1;
}

export function placeBar(round: Round, a: number, b: number, tool: Tool = 'bar'): Round {
  const edge = edgeId(a, b);
  const cost = toolCost(round.board.passages[edge], tool);
  if (round.outcome !== 'running' || cost === null || cost > round.ink
      || (round.to !== null && edge === edgeId(round.cell, round.to))) return round;
  let board = togglePassage(round.board, a, b);
  if (board === round.board) return round;
  if (tool === 'reinforce') board = { ...board, passages: { ...board.passages, [edge]: 'reinforced' } };
  const breaking = round.breaking?.edge === edge ? null : round.breaking;
  return { ...round, board, ink: round.ink - cost, blocked: false, breaking };
}

export function roundAt(frames: readonly Round[], elapsed: number) {
  let left = 0;
  let right = frames.length - 1;
  while (left < right) {
    const middle = Math.ceil((left + right) / 2);
    if (frames[middle].elapsed <= elapsed) left = middle;
    else right = middle - 1;
  }
  return frames[left];
}

function plan(next: Round) {
  const map = { ...next.board, start: next.cell };
  const open = search(map, 'astar');
  const weighted = next.breakerCharges > 0 && Object.values(map.passages).some(breakTime)
    ? search(map, 'dijkstra', passage => MOVE_MS + breakTime(passage))
    : null;
  const weightedMs = weighted?.cost ?? null;
  const useBreakRoute = weighted?.breaks.length === 1 && weightedMs !== null && (open.cost === null
    || weightedMs < open.cost * MOVE_MS);
  const pickup = !useBreakRoute && open.cost === null && !next.breakerCharges
    ? map.pickups?.find(item => item.kind === 'breaker') : undefined;
  const pickupRoute = pickup ? search({ ...map, exit: pickup.cell }, 'astar') : null;
  const chosen = useBreakRoute ? weighted! : pickupRoute?.cost != null ? pickupRoute : open;
  const target = chosen.path[1];
  const edge = chosen.edges[0];
  const duration = breakTime(map.passages[edge]);
  let action: Decision['action'] = 'wait';

  if (duration) {
    next.breaking = { edge, completesAt: next.elapsed + duration, duration };
    action = 'break';
  } else if (target !== undefined && !duration) {
    next.to = target;
    const offset = target - next.cell;
    next.facing = offset === 1 ? 'right' : offset === -1 ? 'left' : offset > 0 ? 'down' : 'up';
    action = chosen === pickupRoute ? 'seek' : 'move';
  }
  next.blocked = target === undefined;
  next.decision = { board: next.board, at: next.elapsed, search: chosen, cell: next.cell, action, openMoves: open.cost, weightedMs };
}

export function tick(round: Round, dt: number): Round {
  if (round.outcome !== 'running' || dt <= 0) return round;
  const next = { ...round };
  let remaining = Math.min(dt, round.duration - round.elapsed);

  while (remaining > 0) {
    if (next.to === null && !next.breaking && !next.blocked) {
      plan(next);
    }
    const boostLeft = next.surgeUntil - next.elapsed;
    const speed = boostLeft > 0 ? SURGE_SPEED : 1;
    let slice = remaining;
    if (next.breaking) slice = Math.min(slice, next.breaking.completesAt - next.elapsed);
    else if (next.to !== null) slice = Math.min(slice, (MOVE_MS - next.moveMs) / speed, boostLeft > 0 ? boostLeft : Infinity);
    next.elapsed += slice;
    remaining -= slice;
    if (next.breaking && next.elapsed >= next.breaking.completesAt) {
      const [a, b] = next.breaking.edge.split(':').map(Number);
      next.board = togglePassage(next.board, a, b);
      next.breaking = null;
      next.breakerCharges--;
    }
    if (next.to !== null) {
      next.moveMs += slice * speed;
      if (next.moveMs >= MOVE_MS - 1e-8) {
        next.cell = next.to;
        next.to = null;
        next.moveMs = 0;
        const pickup = next.board.pickups?.find(item => item.cell === next.cell);
        if (pickup) {
          next.board = { ...next.board, pickups: next.board.pickups!.filter(item => item !== pickup) };
          next.pickupLog = [...next.pickupLog, { ...pickup, at: next.elapsed }];
          if (pickup.kind === 'breaker') next.breakerCharges++;
          else next.surgeUntil = next.elapsed + SURGE_DURATION;
        }
      }
    }
    if (next.elapsed >= next.duration) {
      next.outcome = 'contained';
      break;
    }
    if (next.cell === next.board.exit) {
      next.outcome = 'escaped';
      break;
    }
  }

  const refills = Math.floor(next.elapsed / REFILL_MS) - Math.floor(round.elapsed / REFILL_MS);
  next.ink = Math.min(MAX_INK, next.ink + refills);
  return next;
}
