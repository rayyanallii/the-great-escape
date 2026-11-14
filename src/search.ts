import { edgeId, neighbors, type Board } from './graph.ts';

export type Algorithm = 'bfs' | 'bidirectional' | 'astar' | 'dijkstra' | 'greedy';
export type Frame = {
  cell: number;
  side: 'start' | 'exit';
  cost: number;
  estimate?: number;
  frontier: number[];
};

export type SearchResult = {
  algorithm: Algorithm;
  path: number[];
  edges: string[];
  breaks: string[];
  cost: number | null;
  trace: Frame[];
  meeting?: number;
};

export const BAR_COST = 5;

function pathToRoot(parents: Map<number, number>, cell: number) {
  const path = [cell];
  while (parents.has(cell)) {
    cell = parents.get(cell)!;
    path.push(cell);
  }
  return path;
}

function result(board: Board, algorithm: Algorithm, path: number[], trace: Frame[]): SearchResult {
  const edges = path.slice(1).map((cell, i) => edgeId(path[i], cell));
  const breaks = edges.filter(edge => board.passages[edge] && board.passages[edge] !== 'wall');
  return {
    algorithm, path, edges, breaks, trace,
    cost: path.length ? edges.length : null,
  };
}

export function search(board: Board, algorithm: Algorithm, allowBreaks: boolean | ((passage: Board['passages'][string]) => number) = false): SearchResult {
  if (algorithm === 'bidirectional') return searchBothWays(board);
  const weighted = algorithm === 'dijkstra' && Boolean(allowBreaks);
  const { cols, start, exit } = board;
  const trace: Frame[] = [];
  const parents = new Map<number, number>();
  const costs = new Map([[start, 0]]);
  const frontier = new Set([start]);
  const expanded = new Set<number>();
  const usesEstimate = algorithm === 'astar' || algorithm === 'greedy';
  const estimate = (cell: number) =>
    Math.abs(cell % cols - exit % cols) + Math.abs(Math.floor(cell / cols) - Math.floor(exit / cols));
  const priority = (cell: number) => {
    if (algorithm === 'greedy') return estimate(cell);
    return costs.get(cell)! + (algorithm === 'astar' ? estimate(cell) : 0);
  };

  while (frontier.size) {
    let cell = frontier.values().next().value!;
    if (algorithm !== 'bfs') {
      for (const candidate of frontier) {
        if (priority(candidate) < priority(cell)) cell = candidate;
      }
    }
    frontier.delete(cell);
    expanded.add(cell);
    const cost = costs.get(cell)!;

    if (cell !== exit) {
      for (const next of neighbors(board, cell)) {
        const passage = board.passages[edgeId(cell, next)];
        if (expanded.has(next) || passage === 'wall' || (passage && !weighted)) continue;
        if ((algorithm === 'bfs' || algorithm === 'greedy') && costs.has(next)) continue;
        const edgeCost = weighted && typeof allowBreaks === 'function' ? allowBreaks(passage)
          : passage === 'reinforced' ? 9 : passage === 'bar' ? BAR_COST : 1;
        const nextCost = cost + edgeCost;
        if (nextCost >= (costs.get(next) ?? Infinity)) continue;
        costs.set(next, nextCost);
        parents.set(next, cell);
        frontier.add(next);
      }
    }

    trace.push({ cell, side: 'start', cost, estimate: usesEstimate ? estimate(cell) : undefined, frontier: [...frontier] });
    if (cell === exit) return { ...result(board, algorithm, pathToRoot(parents, cell).reverse(), trace), cost };
  }
  return result(board, algorithm, [], trace);
}

function searchBothWays(board: Board): SearchResult {
  const trace: Frame[] = [];
  const { start, exit } = board;
  if (start === exit) {
    trace.push({ cell: start, side: 'start', cost: 0, frontier: [] });
    return { ...result(board, 'bidirectional', [start], trace), meeting: start };
  }
  const wave = (root: number, side: Frame['side']) => ({
    side, frontier: [root], depth: 0,
    costs: new Map([[root, 0]]),
    parents: new Map<number, number>(),
  });
  const forward = wave(start, 'start');
  const backward = wave(exit, 'exit');
  let active = forward;
  let other = backward;
  let shortest = Infinity;
  let meeting: number | undefined;

  while (active.frontier.length && other.frontier.length && active.depth + other.depth < shortest) {
    const layer = active.frontier;
    const nextLayer: number[] = [];
    for (const [index, cell] of layer.entries()) {
      for (const next of neighbors(board, cell)) {
        if (active.costs.has(next) || board.passages[edgeId(cell, next)]) continue;
        const cost = active.depth + 1;
        active.costs.set(next, cost);
        active.parents.set(next, cell);
        nextLayer.push(next);
        const total = cost + (other.costs.get(next) ?? Infinity);
        if (total < shortest) {
          shortest = total;
          meeting = next;
        }
      }
      trace.push({
        cell, side: active.side, cost: active.depth,
        frontier: [...layer.slice(index + 1), ...nextLayer],
      });
    }
    active.frontier = nextLayer;
    active.depth++;
    [active, other] = [other, active];
  }

  const path = meeting === undefined ? [] : [
    ...pathToRoot(forward.parents, meeting).reverse(),
    ...pathToRoot(backward.parents, meeting).slice(1),
  ];
  return { ...result(board, 'bidirectional', path, trace), meeting };
}
