import { useId, useRef } from 'react';
import prisoner from '../assets/sprites/prisoner-walk.png';
import bars from '../assets/sprites/bars.png';
import reinforced from '../assets/sprites/reinforced-bars.png';
import breaker from '../assets/sprites/wall-breaker.png';
import surge from '../assets/sprites/speed-surge.png';
import entry from '../assets/sprites/closed-door.png';
import wall from '../assets/sprites/wall.png';
import door from '../assets/sprites/exit-door.png';
import floor from '../assets/sprites/floor-tile.png';
import sprites from '../assets/sprites/manifest.json';
import { edgeId, neighbors, type Board } from './graph.ts';
import { MOVE_MS, pickupNames, toolCost, type Round, type Tool } from './round.ts';
import type { SearchResult } from './search.ts';

const tile = 48;
const { atlasSize, frameSize, anchor, rows: directionRows, idleColumn, playbackColumns } = sprites.prisoner;
const [atlasWidth, atlasHeight] = atlasSize;
const [frameWidth, frameHeight] = frameSize;
const spriteScale = 0.3;

export function BoardView({ board, round, onPlace, tool = 'bar', analysis }: {
  board: Board;
  round: Round | null;
  onPlace?: (a: number, b: number) => void;
  tool?: Tool;
  analysis?: { search: SearchResult; steps: number };
}) {
  const { cols, rows, start, exit, passages } = board;
  const cells = Array.from({ length: cols * rows }, (_, cell) => cell);
  const center = (cell: number) => [(cell % cols + 0.5) * tile, (Math.floor(cell / cols) + 0.5) * tile];
  const [x, y] = center(round?.cell ?? start);
  const [targetX, targetY] = center(round?.to ?? round?.cell ?? start);
  const progress = (round?.moveMs ?? 0) / MOVE_MS;
  const facing = round?.facing ?? 'down';
  const walking = round?.outcome === 'running' && round.to !== null;
  const frame = walking ? playbackColumns[Math.floor(progress * playbackColumns.length)] : idleColumn;
  const row = directionRows[facing];
  const atlasView = (column: number) => `${column * frameWidth} ${row * frameHeight} ${frameWidth} ${frameHeight}`;
  const [exitX, exitY] = center(exit);
  const [startX, startY] = center(start);
  const crossing = round?.to != null ? edgeId(round.cell, round.to) : null;
  const editable = onPlace && round?.outcome === 'running';
  const stroke = useRef<{ pointer: number; seen: Set<string>; x: number; y: number } | null>(null);
  const floorId = useId();
  const trace = analysis?.search.trace ?? [];
  const drawn = trace.slice(0, analysis?.steps ?? 0);
  const path = analysis?.steps === trace.length ? analysis?.search.path ?? [] : [];

  return (
    <div className={`board${editable ? ' editing' : ''}`} style={{ aspectRatio: `${cols} / ${rows}` }} role="group" aria-label="Prison maze"
      onPointerMove={event => {
        const gesture = stroke.current;
        if (!gesture || gesture.pointer !== event.pointerId || !(event.buttons & 1)) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        const samples = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 4));
        for (let i = 1; i <= samples; i++) {
          const hit = document.elementFromPoint(gesture.x + dx * i / samples, gesture.y + dy * i / samples)
            ?.closest<HTMLButtonElement>('button[data-edge]');
          const edge = hit?.dataset.edge;
          if (!hit || !event.currentTarget.contains(hit) || hit.disabled || !edge || gesture.seen.has(edge)) continue;
          gesture.seen.add(edge);
          const [a, b] = edge.split(':').map(Number);
          onPlace?.(a, b);
        }
        gesture.x = event.clientX;
        gesture.y = event.clientY;
      }}
      onPointerUp={() => { stroke.current = null; }}
      onPointerLeave={() => { stroke.current = null; }}
      onPointerCancel={() => { stroke.current = null; }}>
      <svg viewBox={`0 0 ${cols * tile} ${rows * tile}`} aria-hidden="true">
        <defs>
          <pattern id={floorId} width={tile} height={tile} patternUnits="userSpaceOnUse">
            <image href={floor} width={tile} height={tile} preserveAspectRatio="none" opacity=".15" />
          </pattern>
        </defs>
        <rect width={cols * tile} height={rows * tile} fill={`url(#${floorId})`} />
        {cells.map(cell => (
          <rect key={cell} x={cell % cols * tile} y={Math.floor(cell / cols) * tile} width={tile} height={tile} className="tile" />
        ))}
        {drawn.map(({ cell, side }, index) => {
          const [cx, cy] = center(cell);
          return <circle key={index} cx={cx} cy={cy} r="14" className={`expanded-cell ${side}`} />;
        })}
        {path.length > 1 && <polyline className="replay-route" points={path.map(cell => center(cell).join(',')).join(' ')} />}
        <image href={entry} x={startX - 12} y={startY - 16} width="24" height="30" opacity=".38" />
        {board.pickups?.map(pickup => {
          const [cx, cy] = center(pickup.cell);
          return <g key={pickup.cell} className={`pickup pickup-${pickup.kind}`} data-pickup={pickup.kind}
            transform={`translate(${cx} ${cy})`}>
            <title>{pickupNames[pickup.kind]}</title>
            <circle r="13" />
            <image href={pickup.kind === 'breaker' ? breaker : surge} x="-10" y="-10" width="20" height="20" />
          </g>;
        })}
        <g className="exit-marker" transform={`translate(${exitX} ${exitY})`}>
          <image href={door} x="-15" y="-21" width="30" height="32" />
          <rect x="-15" y="9" width="30" height="12" rx="3" />
          <text textAnchor="middle" y="18">EXIT</text>
        </g>
        <g className={`prisoner${round && !analysis && round.surgeUntil > round.elapsed ? ' surging' : ''}`}
          data-cell={round?.cell ?? start} data-facing={facing} data-frame={frame}
          transform={`translate(${x + (targetX - x) * progress - anchor[0] * spriteScale} ${y + (targetY - y) * progress + 17 - anchor[1] * spriteScale})`}>
          <svg className="walk-frame" width={frameWidth * spriteScale} height={frameHeight * spriteScale} viewBox={atlasView(frame)}>
            <image href={prisoner} width={atlasWidth} height={atlasHeight} />
          </svg>
          <svg className="still-frame" width={frameWidth * spriteScale} height={frameHeight * spriteScale} viewBox={atlasView(idleColumn)}>
            <image href={prisoner} width={atlasWidth} height={atlasHeight} />
          </svg>
        </g>
      </svg>
      {cells.flatMap(a => neighbors(board, a).filter(b => b > a).map(b => {
        const key = edgeId(a, b);
        const kind = passages[key];
        const [ax, ay] = center(a);
        const [bx, by] = center(b);
        const vertical = ay === by;
        const style = {
          left: `${(ax + bx) / (2 * cols * tile) * 100}%`,
          top: `${(ay + by) / (2 * rows * tile) * 100}%`,
          width: `${(vertical ? 0.56 : 0.63) / cols * 100}%`,
          height: `${(vertical ? 0.63 : 0.56) / rows * 100}%`,
        };
        const breaking = !analysis && round?.breaking?.edge === key;
        const className = `edge ${vertical ? 'vertical' : 'horizontal'} ${kind ?? 'open'}${breaking ? ' breaking' : ''}`;
        const texture = kind && <img draggable={false} alt="" src={kind === 'wall' ? wall : kind === 'reinforced' ? reinforced : bars} />;
        if (!editable && !kind) return null;
        if (kind === 'wall' || !editable) return (
          <span key={key} className={className} style={style} aria-hidden="true">{texture}</span>
        );
        const from = `row ${Math.floor(a / cols) + 1}, column ${a % cols + 1}`;
        const to = `row ${Math.floor(b / cols) + 1}, column ${b % cols + 1}`;
        const cost = toolCost(kind, tool);
        const action = tool === 'erase' ? 'Erase bar' : tool === 'reinforce' ? 'Reinforce passage' : 'Place bar';
        return (
          <button key={key} type="button" className={className} style={style}
            disabled={!editable || cost === null || cost > round.ink || key === crossing}
            data-edge={key}
            aria-label={`${action} between ${from} and ${to}`}
            onPointerDown={event => {
              if (event.button !== 0) return;
              stroke.current = { pointer: event.pointerId, seen: new Set([key]), x: event.clientX, y: event.clientY };
              if (event.pointerType === 'touch') event.currentTarget.closest('.board')?.setPointerCapture(event.pointerId);
              onPlace?.(a, b);
            }}
            onClick={event => {
              if (event.detail === 0) onPlace?.(a, b);
            }}>{texture}</button>
        );
      }))}
    </div>
  );
}
