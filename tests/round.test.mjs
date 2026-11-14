import assert from 'node:assert/strict';
import test from 'node:test';
import { createRound, tick, placeBar, generateBoard, boardSizes, roundAt } from '../src/round.ts';
import { search } from '../src/search.ts';

function random(seed) {
  return () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}

test('generated layouts vary and always begin with an open route', () => {
  const layouts = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const board = generateBoard(random(seed));
    const walls = Object.values(board.passages);
    assert.equal(walls.length, 14);
    assert.ok(walls.every(wall => wall === 'wall'));
    assert.notEqual(search(board, 'astar').cost, null);
    assert.deepEqual(board.pickups.map(item => item.kind).sort(), ['breaker', 'surge']);
    assert.equal(new Set(board.pickups.map(item => item.cell)).size, 2);
    for (const item of board.pickups) {
      assert.ok(item.cell !== board.start && item.cell !== board.exit);
      assert.notEqual(search({ ...board, exit: item.cell }, 'astar').cost, null);
    }
    layouts.add(JSON.stringify(Object.keys(board.passages).sort()));
  }
  assert.ok(layouts.size > 1);
});

const board = { cols: 4, rows: 2, start: 0, exit: 3, passages: { '2:6': 'wall' } };

test('the prisoner escapes on an unattended board', () => {
  const run = tick(createRound(board), 5_000);
  assert.equal(run.outcome, 'escaped');
  assert.equal(run.cell, 3);
});

test('placing a bar forces a detour and consumes ink once', () => {
  const run = placeBar(createRound(board), 0, 1);
  assert.equal(run.board.passages['0:1'], 'bar');
  assert.equal(run.ink, 1);
  assert.equal(placeBar(run, 1, 0), run);
  assert.equal(placeBar(run, 2, 6), run);
  assert.equal(tick(run, 900).cell, 4);
});

test('a prisoner in transit can finish that move but never crosses a newly barred edge', () => {
  const moving = tick(createRound(board), 200);
  assert.equal(moving.to, 1);
  assert.equal(placeBar(moving, 0, 1), moving);
  const blockedAhead = placeBar(moving, 1, 2);
  assert.equal(tick(blockedAhead, 900).to, 5);
});

test('sealing every route contains the prisoner until the clock expires', () => {
  const run = placeBar(placeBar(createRound(board, 1_000), 0, 1), 0, 4);
  assert.equal(run.ink, 0);
  assert.equal(placeBar(run, 1, 2), run);
  const waiting = tick(run, 500);
  assert.equal(waiting.cell, 0);
  assert.equal(waiting.ink, 0);
  assert.equal(waiting.outcome, 'running');
  const finished = tick(waiting, 500);
  assert.equal(finished.cell, 0);
  assert.equal(finished.outcome, 'contained');
  assert.equal(tick(finished, 1000), finished);
});

test('each board preset starts with a route and uses the selected clock', () => {
  for (const [cols, rows] of Object.values(boardSizes)) {
    const maze = generateBoard(random(427), cols, rows);
    assert.deepEqual([maze.cols, maze.rows], [cols, rows]);
    assert.notEqual(search(maze, 'astar').cost, null);
  }
  const isolated = { ...board, passages: { '0:1': 'wall', '0:4': 'wall' } };
  const round = createRound(isolated, 120_000);
  assert.equal(tick(round, 119_999).outcome, 'running');
  const result = tick(round, 120_001);
  assert.equal(result.elapsed, 120_000);
  assert.equal(result.outcome, 'contained');
});

test('reinforcement spends ink and erasing a bar can reopen the route', () => {
  const fortified = placeBar(createRound(board), 0, 1, 'reinforce');
  assert.equal(fortified.board.passages['0:1'], 'reinforced');
  assert.equal(fortified.ink, 0);
  const erased = placeBar(fortified, 0, 1, 'erase');
  assert.equal(erased.board.passages['0:1'], undefined);
  assert.equal(erased.ink, 0);
  assert.equal(placeBar(erased, 2, 6, 'erase'), erased);
  const trapped = tick(placeBar(placeBar(createRound(board), 0, 1), 0, 4), 100);
  assert.equal(trapped.cell, 0);
  assert.equal(tick(placeBar(trapped, 0, 1, 'erase'), 800).cell, 1);
});

test('breaker takes time, removes only the targeted bar, and records the weighted decision', () => {
  const maze = { cols: 5, rows: 2, start: 0, exit: 4, passages: { '1:2': 'bar', '8:9': 'bar', '2:7': 'wall', '1:6': 'wall', '0:5': 'wall' },
    pickups: [{ kind: 'breaker', cell: 1 }] };
  const initial = createRound(maze);
  const before = tick(initial, 799);
  assert.equal(before.breakerCharges, 0);
  assert.equal(before.board.pickups.length, 1);
  const collected = tick(before, 1);
  assert.equal(collected.breakerCharges, 1);
  assert.equal(collected.board.pickups.length, 0);
  assert.equal(before.board.pickups.length, 1);
  const charging = tick(collected, 1599);
  assert.equal(charging.breaking.edge, '1:2');
  assert.equal(charging.decision.action, 'break');
  assert.equal(charging.decision.search.algorithm, 'dijkstra');
  assert.equal(charging.cell, 1);
  const broken = tick(charging, 1);
  assert.equal(broken.breakerCharges, 0);
  assert.equal(broken.board.passages['1:2'], undefined);
  assert.equal(broken.board.passages['8:9'], 'bar');
  assert.equal(charging.decision.board.passages['1:2'], 'bar');
  const waiting = tick(placeBar(broken, 2, 3), 1000);
  assert.equal(waiting.cell, 1);
  assert.equal(waiting.decision.action, 'wait');
  assert.equal(waiting.board.passages['2:3'], 'bar');
  assert.equal(tick(waiting, 8000).cell, 1);
});

test('reinforced bars take 3.5 seconds and structural walls cannot break', () => {
  const maze = { cols: 3, rows: 1, start: 0, exit: 2, passages: { '0:1': 'reinforced' } };
  const charging = tick({ ...createRound(maze), breakerCharges: 1 }, 3499);
  assert.equal(charging.board.passages['0:1'], 'reinforced');
  assert.equal(tick(charging, 1).board.passages['0:1'], undefined);
  const blocked = tick({ ...createRound({ ...maze, passages: { '0:1': 'wall' } }), breakerCharges: 1 }, 5000);
  assert.equal(blocked.breaking, null);
  assert.equal(blocked.board.passages['0:1'], 'wall');
  assert.equal(blocked.cell, 0);
});

test('speed surge speeds up actual movement and expires in simulation time', () => {
  const maze = { cols: 15, rows: 1, start: 0, exit: 14, passages: {}, pickups: [{ kind: 'surge', cell: 3 }] };
  const started = tick(createRound(maze), 2500);
  assert.equal(started.pickupLog.at(-1).kind, 'surge');
  assert.equal(started.board.pickups.length, 0);
  const active = tick(started, 600);
  assert.equal(active.cell, 4);
  assert.ok(active.moveMs > 100);
  assert.equal(active.surgeUntil, 4400);
  const expired = tick(active, 1500);
  assert.equal(expired.elapsed, 4600);
  assert.ok(expired.surgeUntil < expired.elapsed);
});

test('an unreachable breaker stays in the maze and cannot break a bar remotely', () => {
  const maze = { cols: 4, rows: 1, start: 0, exit: 3,
    passages: { '0:1': 'bar' }, pickups: [{ kind: 'breaker', cell: 2 }] };
  const run = tick(createRound(maze), 8_000);
  assert.equal(run.cell, 0);
  assert.equal(run.breaking, null);
  assert.equal(run.board.pickups.length, 1);
  assert.equal(run.pickupLog.length, 0);
});

test('recorded decision and maze edits replay from their original snapshots', () => {
  const started = createRound(board);
  const moving = tick(started, 200);
  const edited = placeBar(moving, 1, 2);
  const detour = tick(edited, 900);
  assert.deepEqual(moving.decision.search.path, [0, 1, 2, 3]);
  assert.equal(edited.decision, moving.decision);
  assert.equal(moving.decision.board.passages['1:2'], undefined);
  assert.equal(detour.decision.board.passages['1:2'], 'bar');
  assert.equal(detour.decision.search.path[1], 5);
  assert.equal(roundAt([started, moving, edited, detour], 199), started);
  assert.equal(roundAt([started, moving, edited, detour], 200), edited);
});
