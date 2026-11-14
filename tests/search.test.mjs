import assert from 'node:assert/strict';
import test from 'node:test';
import { edgeId, neighbors, togglePassage } from '../src/graph.ts';
import { search } from '../src/search.ts';

const board = (cols, rows, start, exit, passages = {}) => ({
  cols, rows, start, exit, passages,
});
const algorithms = ['bfs', 'bidirectional', 'astar', 'dijkstra', 'greedy'];

test('editing a passage is symmetric and cannot erase structural walls', () => {
  const original = board(3, 2, 0, 5, { '0:3': 'wall' });
  const edited = togglePassage(original, 1, 0);
  assert.equal(edgeId(1, 0), '0:1');
  assert.equal(edited.passages['0:1'], 'bar');
  assert.equal(original.passages['0:1'], undefined);
  assert.equal(togglePassage(edited, 0, 1).passages['0:1'], undefined);
  assert.equal(togglePassage(edited, 0, 3), edited);
  assert.equal(togglePassage(edited, 2, 3), edited);
});

test('each strict search avoids blocked passages and records real expansions', () => {
  const maze = board(4, 2, 0, 3, { '1:2': 'bar' });
  for (const algorithm of algorithms) {
    const result = search(maze, algorithm);
    assert.equal(result.algorithm, algorithm);
    assert.equal(result.path[0], 0);
    assert.equal(result.path.at(-1), 3);
    assert.equal(result.path.length, 6);
    assert.equal(result.cost, 5);
    assert.equal(result.edges.length, 5);
    assert.ok(!result.edges.includes('1:2'));
    assert.ok(result.trace.some(frame => frame.cell === 0));
    assert.ok(result.trace.every(frame => neighbors(maze, frame.cell).length > 0));
  }
});

test('bidirectional BFS records independent frontiers and agrees with BFS', () => {
  const maze = board(4, 3, 0, 11, { '1:2': 'bar' });
  const result = search(maze, 'bidirectional');
  assert.equal(result.cost, search(maze, 'bfs').cost);
  assert.ok(result.trace.some(frame => frame.side === 'exit'));
  assert.ok(result.trace.some(frame => frame.side === 'start'));
  assert.ok(result.path.includes(result.meeting));
});

test('weighted Dijkstra can cross a bar at its stated cost but never a wall', () => {
  const maze = board(3, 1, 0, 2, { '0:1': 'bar' });
  assert.equal(search(maze, 'dijkstra').cost, null);
  const result = search(maze, 'dijkstra', true);
  assert.equal(result.cost, 6);
  assert.deepEqual(result.breaks, ['0:1']);
  assert.equal(search(board(3, 1, 0, 2, { '0:1': 'wall' }), 'dijkstra', true).cost, null);
});

test('every algorithm handles a disconnected exit and an already reached exit', () => {
  for (const algorithm of algorithms) {
    assert.deepEqual(search(board(2, 1, 0, 1, { '0:1': 'wall' }), algorithm).path, []);
    assert.deepEqual(search(board(2, 1, 0, 0), algorithm).path, [0]);
  }
});

test('shortest-path searches agree across deterministic rectangular mazes', () => {
  let seed = 427;
  for (let trial = 0; trial < 150; trial++) {
    const maze = board(3 + trial % 7, 3 + trial % 4, 0, 1);
    maze.start = trial % (maze.cols * maze.rows);
    maze.exit = maze.cols * maze.rows - 1;
    for (let cell = 0; cell <= maze.exit; cell++) {
      for (const next of neighbors(maze, cell).filter(next => next > cell)) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        if (seed % 7 < 2) maze.passages[edgeId(cell, next)] = 'wall';
      }
    }
    const expected = search(maze, 'bfs').cost;
    for (const algorithm of ['astar', 'bidirectional', 'dijkstra']) {
      const result = search(maze, algorithm);
      assert.equal(result.cost, expected, `${algorithm}, maze ${trial}`);
      assert.ok(result.edges.every(edge => maze.passages[edge] === undefined));
    }
  }
});
