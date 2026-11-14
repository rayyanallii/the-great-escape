import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import bars from '../assets/sprites/bars.png';
import wall from '../assets/sprites/wall.png';
import reinforced from '../assets/sprites/reinforced-bars.png';
import breaker from '../assets/sprites/wall-breaker.png';
import surge from '../assets/sprites/speed-surge.png';
import { BoardView } from './BoardView.tsx';
import { boardSizes, createRound, decisionActions, generateBoard, MAX_INK, pickupNames, placeBar, roundDurations, tick, type Round, type Tool } from './round.ts';
import { Replay, formatClock } from './Replay.tsx';
import { loadReplay, loadSettings, saveReplay } from './storage.ts';
import './style.css';

function newLayout(preset: string) {
  const dimensions = preset === 'mini' ? [10, 7] as const : boardSizes[preset as keyof typeof boardSizes];
  return generateBoard(Math.random, ...dimensions);
}

function App() {
  const [settings] = useState(loadSettings);
  const [board, setBoard] = useState(() => newLayout(settings.size));
  const [round, setRound] = useState<Round | null>(null);
  const current = useRef<Round | null>(null);
  const frames = useRef<Round[]>([]);
  const [duration, setDuration] = useState(settings.duration);
  const [size, setSize] = useState(settings.size);
  const [zoom, setZoom] = useState(settings.zoom);
  const [largeTimer, setLargeTimer] = useState(settings.largeTimer);
  const [paused, setPaused] = useState(false);
  const [tool, setTool] = useState<Tool>('bar');
  const [replaying, setReplaying] = useState(false);
  const [savedReplay, setSavedReplay] = useState<Round[] | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const running = round?.outcome === 'running';
  const finished = round !== null && !running;
  const seconds = Math.ceil(((round?.duration ?? duration * 1000) - (round?.elapsed ?? 0)) / 1000);
  const visibleBoard = round?.board ?? board;
  const lastPickup = round?.pickupLog.at(-1);
  const replayFrames = finished ? frames.current : savedReplay;

  useEffect(() => {
    let active = true;
    loadReplay().then(saved => {
      if (active) setSavedReplay(previous => previous ?? saved);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('escape-settings', JSON.stringify({ size, duration, zoom, largeTimer }));
    } catch {
      // Settings still apply for the current visit.
    }
  }, [size, duration, zoom, largeTimer]);

  useEffect(() => {
    if (!running) return;
    function shortcut(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey
          || (event.target instanceof HTMLElement && event.target.closest('input, select, textarea, [contenteditable]'))) return;
      const selected = { '1': 'bar', '2': 'reinforce', '3': 'erase' }[event.key] as Tool | undefined;
      if (selected) setTool(selected);
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [running]);

  function capture(next: Round) {
    if (next === current.current) return;
    current.current = next;
    frames.current.push(next);
    setRound(next);
    if (next.outcome !== 'running') {
      const recorded = frames.current;
      setSavedReplay(recorded);
      setSaveFailed(false);
      saveReplay(recorded).catch(() => setSaveFailed(true));
    }
  }

  useEffect(() => {
    if (!running || paused) return;
    let frame: number;
    let previous = performance.now();
    let accumulated = 0;
    const step = 1000 / 60;
    function resetTime() {
      previous = performance.now();
      accumulated = 0;
    }
    function advance(now: number) {
      const dt = Math.max(0, Math.min(100, now - previous));
      previous = now;
      if (!document.hidden && current.current) {
        accumulated += dt;
        while (accumulated >= step && current.current.outcome === 'running') {
          capture(tick(current.current, step));
          accumulated -= step;
        }
      }
      frame = requestAnimationFrame(advance);
    }
    function pauseWhenHidden() {
      resetTime();
      if (document.hidden) setPaused(true);
    }
    document.addEventListener('visibilitychange', pauseWhenHidden);
    frame = requestAnimationFrame(advance);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, [running, paused]);

  function start() {
    const layout = finished ? newLayout(size) : board;
    setBoard(layout);
    setReplaying(false);
    setPaused(false);
    setTool('bar');
    frames.current = [];
    capture(createRound(layout, duration * 1000));
  }

  function reset() {
    current.current = null;
    frames.current = [];
    setRound(null);
    setReplaying(false);
    setBoard(newLayout(size));
  }

  return (
    <>
      <header className="masthead">
        <div className="page header-inner">
          <span>IdeaLab Hacks</span>
        </div>
      </header>
      <main className="page">
        <h1>The Great Escape</h1>
        <p className="intro">You’re the warden. Place bars between cells to keep prisoner 0427 away from the exit.</p>
        <section aria-label="Lockdown">
          <div className="hud">
            <div className="stats">
              <div className={`stat${largeTimer ? ' large-timer' : ''}`}><span>Lockdown</span><strong>{formatClock(seconds)}</strong></div>
              <div className="stat"><span>Ink</span><strong>{round?.ink ?? 2} / {MAX_INK}</strong></div>
            </div>
            {running ? <div className="controls">
              <button type="button" className="quiet" onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</button>
              <button type="button" className="quiet" onClick={reset}>New maze</button>
            </div> : (
              <button type="button" className="primary" onClick={start}>{finished ? 'Play again' : 'Start lockdown'}</button>
            )}
          </div>
          <p className="abilities">
            <span>Wall Breaker <strong>{round?.breaking ? 'Breaking' : round?.breakerCharges ? 'Carried' : visibleBoard.pickups?.some(item => item.kind === 'breaker') ? 'In maze' : 'Used'}</strong></span>
            <span>Speed Surge <strong>{round && round.surgeUntil > round.elapsed ? 'Active' : visibleBoard.pickups?.some(item => item.kind === 'surge') ? 'In maze' : 'Used'}</strong></span>
          </p>
          <div className="controls settings">
            <label>Maze size <select value={size} disabled={running} onChange={event => {
              const preset = event.target.value;
              setSize(preset);
              setBoard(newLayout(preset));
              setRound(null);
              current.current = null;
              frames.current = [];
              setReplaying(false);
            }}>
              <option value="mini">Mini (10 × 7)</option>
              <option value="compact">Compact (12 × 10)</option>
              <option value="standard">Standard (16 × 12)</option>
              <option value="large">Large (20 × 14)</option>
            </select></label>
            <label>Duration <select value={duration} disabled={running} onChange={event => setDuration(Number(event.target.value))}>
              {roundDurations.map(value => <option key={value} value={value}>{formatClock(value)}</option>)}
            </select></label>
            <button type="button" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? 'Fit board' : 'Zoom board'}</button>
            <label><input type="checkbox" checked={largeTimer} onChange={event => setLargeTimer(event.target.checked)} /> Large timer</label>
          </div>
          {running && <div className="controls tools" role="group" aria-label="Warden tools">
            <button type="button" aria-pressed={tool === 'bar'} onClick={() => setTool('bar')}>Bar · 1 ink</button>
            <button type="button" aria-pressed={tool === 'reinforce'} onClick={() => setTool('reinforce')}>Reinforce · 2 ink</button>
            <button type="button" aria-pressed={tool === 'erase'} onClick={() => setTool('erase')}>Erase</button>
          </div>}
          <div className="board-scroll">
            <div className={zoom ? 'board-zoomed' : undefined}>
              <BoardView board={round?.board ?? board} round={round} tool={tool} onPlace={paused ? undefined : (a, b) => {
                if (current.current) capture(placeBar(current.current, a, b, tool));
              }} />
            </div>
          </div>
          <div className="below-board">
            <ul className="legend" aria-label="Map legend">
              <li><img src={wall} alt="" /> Fixed wall</li>
              <li><img src={bars} alt="" /> Your bars</li>
              <li><img src={reinforced} alt="" /> Reinforced</li>
              <li><img src={breaker} alt="" /> Wall Breaker</li>
              <li><img src={surge} alt="" /> Speed Surge</li>
            </ul>
            <p className="hint">Select a passage to use your tool. Keys 1–3 switch tools. An upgrade costs 1 ink.</p>
          </div>
          <p className="status" aria-live="polite">
            {!round && `Hold the exit for ${duration} seconds.`}
            {round?.outcome === 'running' && (paused ? 'Lockdown paused.'
              : round.breaking ? 'Prisoner 0427 is breaking a bar.'
              : round.blocked ? 'All routes to the exit are blocked.'
              : round.decision?.action === 'seek' ? 'Prisoner 0427 is heading for Wall Breaker.'
              : 'Prisoner 0427 is looking for a way out.')}
            {round?.outcome === 'escaped' && 'Prisoner 0427 escaped.'}
            {round?.outcome === 'contained' && 'Lockdown complete. Prisoner 0427 is contained.'}
          </p>
          {running && lastPickup && <p className="decision" aria-live="polite">
            {formatClock(Math.floor(lastPickup.at / 1000))} · Collected {pickupNames[lastPickup.kind]}
          </p>}
          {round?.decision && running && <p className="decision">
            {decisionActions[round.decision.action]} · {round.decision.search.algorithm === 'astar' ? 'A*' : 'Dijkstra'} · {
              round.decision.search.trace.length
            } cells expanded · {round.decision.openMoves === null ? 'No open route' : `${round.decision.openMoves} open moves`}
            {round.decision.weightedMs !== null && ` · Weighted route base cost ${(round.decision.weightedMs / 1000).toFixed(1)}s`}
          </p>}
          {!running && replayFrames && <button type="button" className="study" aria-expanded={replaying} onClick={() => setReplaying(!replaying)}>
            {replaying ? 'Hide replay' : finished ? 'Study my round' : 'Study last round'}
          </button>}
          {saveFailed && <p className="hint">This browser could not save the replay for your next visit.</p>}
          {!running && replaying && replayFrames && <Replay frames={replayFrames} />}
          <details>
            <summary>How the prisoner finds a route</summary>
            <p>A* finds the shortest open route. If the exit is sealed, the prisoner can seek a reachable Wall Breaker pickup. Each one breaks one bar. Speed Surge activates when collected. Dijkstra weighs shortcuts through bars using base walking and break times.</p>
          </details>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
