import { useMemo, useState } from 'react';
import { BoardView } from './BoardView.tsx';
import type { Round } from './round.ts';
import { search, type Algorithm } from './search.ts';

const berkeley = 'https://inst.eecs.berkeley.edu/~cs188/textbook/search/';
const lessons: Record<Algorithm, { name: string; text: string; source: string }> = {
  bfs: { name: 'BFS', text: 'Searches in layers. With equal costs, it finds the fewest moves, like finding the fewest links between people in a network.', source: berkeley + 'uninformed.html' },
  bidirectional: { name: 'Bidirectional BFS', text: 'Searches from both ends. On an undirected network, meeting in the middle can reduce the work of finding a connection.', source: 'https://inst.eecs.berkeley.edu/~cs188/textbook/textbook_full.pdf' },
  astar: { name: 'A*', text: 'Combines the cost so far with a distance estimate. A grid-based robot can use it to route around obstacles.', source: berkeley + 'informed.html' },
  dijkstra: { name: 'Dijkstra', text: 'Expands the cheapest route so far. OSPF routers use Dijkstra to compute paths from link costs.', source: 'https://www.rfc-editor.org/rfc/rfc2328.html#section-16.1' },
  greedy: { name: 'Greedy Best-First', text: 'Follows the distance estimate alone. It can find a route quickly when speed matters, but may return a longer route.', source: berkeley + 'informed.html' },
};
const algorithms = Object.keys(lessons) as Algorithm[];

export function Comparison({ scene }: { scene: Round }) {
  const [algorithm, setAlgorithm] = useState<Algorithm>('bfs');
  const [step, setStep] = useState(0);
  const results = useMemo(() => algorithms.map(id => search({ ...scene.board, start: scene.cell }, id)), [scene]);
  const result = results.find(item => item.algorithm === algorithm)!;
  const lesson = lessons[algorithm];
  return (
    <section className="comparison" aria-label="Post-round comparison">
      <h3>Compare five searches</h3>
      <p>Post-round analysis on the selected maze and prisoner position. Every search uses open passages with equal costs.</p>
      <table>
        <thead><tr><th scope="col">Algorithm</th><th scope="col">Moves</th><th scope="col">Expansions</th></tr></thead>
        <tbody>{results.map(item => <tr key={item.algorithm}>
          <th scope="row">{lessons[item.algorithm].name}</th><td>{item.cost ?? 'No route'}</td><td>{item.trace.length}</td>
        </tr>)}</tbody>
      </table>
      <label className="replay-control">Inspect algorithm <select value={algorithm} onChange={event => {
        setAlgorithm(event.target.value as Algorithm);
        setStep(0);
      }}>{algorithms.map(id => <option key={id} value={id}>{lessons[id].name}</option>)}</select></label>
      <p>{lesson.text} <a href={lesson.source} target="_blank" rel="noreferrer">Reference</a></p>
      <BoardView board={scene.board} round={{ ...scene, to: null, moveMs: 0 }} analysis={{ search: result, steps: step }} />
      {algorithm === 'bidirectional' && <p>Green circles expand from the prisoner. Amber circles expand from the exit.</p>}
      <label className="replay-control">Compare expansions
        <input type="range" min="0" max={result.trace.length} value={step} aria-valuetext={`${step} of ${result.trace.length}`}
          onChange={event => setStep(Number(event.target.value))} />
      </label>
    </section>
  );
}
