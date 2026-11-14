import { useEffect, useMemo, useState } from 'react';
import { BoardView } from './BoardView.tsx';
import { Comparison } from './Comparison.tsx';
import { decisionActions, pickupNames, roundAt, type Decision, type Round } from './round.ts';

export function formatClock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function Replay({ frames }: { frames: readonly Round[] }) {
  const last = frames[frames.length - 1];
  const [elapsed, setElapsed] = useState(last.elapsed);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [comparing, setComparing] = useState(false);
  const [analysis, setAnalysis] = useState<{ decision: Decision; steps: number } | null>(null);
  const scene = roundAt(frames, elapsed);
  const decisions = useMemo(() => {
    const entries: Decision[] = [];
    for (const frame of frames) {
      if (frame.decision && frame.decision !== entries.at(-1)) entries.push(frame.decision);
    }
    return entries;
  }, [frames]);
  const displayed = analysis && {
    ...scene, board: analysis.decision.board, cell: analysis.decision.cell, to: null, moveMs: 0,
  };

  useEffect(() => {
    if (!playing || elapsed >= last.elapsed) return;
    const timer = window.setTimeout(() => setElapsed(Math.min(last.elapsed, elapsed + 50 * speed)), 50);
    return () => window.clearTimeout(timer);
  }, [elapsed, last.elapsed, playing, speed]);

  function seek(time: number) {
    setElapsed(Math.max(0, Math.min(last.elapsed, time)));
    setAnalysis(null);
    setPlaying(false);
    setComparing(false);
  }

  return (
    <section className="replay" aria-label="Decision replay">
      <h2>Study the round</h2>
      <BoardView board={displayed?.board ?? scene.board} round={displayed || scene}
        analysis={analysis ? { search: analysis.decision.search, steps: analysis.steps } : undefined} />
      <div className="controls">
      <button className="study" type="button" onClick={() => {
        setAnalysis(null);
        setComparing(false);
        if (elapsed >= last.elapsed) setElapsed(0);
        setPlaying(elapsed >= last.elapsed || !playing);
      }}>{playing && elapsed < last.elapsed ? 'Pause replay' : 'Play replay'}</button>
      <button className="study" type="button" onClick={() => seek(0)}>Start</button>
      <button className="study" type="button" onClick={() => seek(last.elapsed)}>End</button>
      <label className="study">Speed <select value={speed} onChange={event => setSpeed(Number(event.target.value))}>
        {[0.25, 0.5, 1, 2, 4].map(value => <option key={value} value={value}>{value}×</option>)}
      </select></label>
      </div>
      <label className="replay-control">
        Round time <span aria-hidden="true">{formatClock(Math.floor(elapsed / 1000))}</span>
        <input type="range" min="0" max={Math.ceil(last.elapsed)} step="1" value={Math.ceil(elapsed)}
          onChange={event => seek(Number(event.target.value))} />
      </label>
      {last.pickupLog.length > 0 && <div className="controls replay-control" aria-label="Pickup moments">
        {last.pickupLog.map(pickup => <button key={pickup.cell} type="button" onClick={() => seek(pickup.at)}>
          {formatClock(Math.floor(pickup.at / 1000))} · Collected {pickupNames[pickup.kind]}
        </button>)}
      </div>}
      {decisions.length > 0 && (
        <label className="replay-control">
          Recorded search
          <select value={analysis ? decisions.indexOf(analysis.decision) : ''} onChange={event => {
            if (!event.target.value) {
              setAnalysis(null);
              return;
            }
            const decision = decisions[Number(event.target.value)];
            setPlaying(false);
            setComparing(false);
            setElapsed(decision.at);
            setAnalysis({ decision, steps: 0 });
          }}>
            <option value="">Choose a search</option>
            {decisions.map((decision, index) => (
              <option key={index} value={index}>
                {formatClock(Math.floor(decision.at / 1000))} · {decisionActions[decision.action]} · {decision.search.algorithm === 'astar' ? 'A*' : 'Dijkstra'}
              </option>
            ))}
          </select>
        </label>
      )}
      <button className="study" type="button" aria-expanded={comparing} onClick={() => {
        setPlaying(false);
        setComparing(!comparing);
      }}>{comparing ? 'Hide comparison' : 'Compare this position'}</button>
      {comparing && <Comparison scene={displayed || scene} />}
      {analysis && (
        <label className="replay-control">
          Expanded cells <span aria-hidden="true">{analysis.steps} / {analysis.decision.search.trace.length}</span>
          <input type="range" min="0" max={analysis.decision.search.trace.length} value={analysis.steps}
            onChange={event => setAnalysis({ ...analysis, steps: Number(event.target.value) })} />
        </label>
      )}
    </section>
  );
}
