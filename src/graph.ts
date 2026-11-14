export type Passage = 'bar' | 'reinforced' | 'wall';
export type Pickup = { readonly kind: 'breaker' | 'surge'; readonly cell: number };
export type Board = {
  readonly cols: number;
  readonly rows: number;
  readonly start: number;
  readonly exit: number;
  readonly passages: Readonly<Partial<Record<string, Passage>>>;
  readonly pickups?: readonly Pickup[];
};

export function edgeId(a: number, b: number) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function neighbors(board: Board, cell: number) {
  const { cols, rows } = board;
  const x = cell % cols;
  const y = Math.floor(cell / cols);
  const adjacent = [];
  if (x + 1 < cols) adjacent.push(cell + 1);
  if (y > 0) adjacent.push(cell - cols);
  if (y + 1 < rows) adjacent.push(cell + cols);
  if (x > 0) adjacent.push(cell - 1);
  return adjacent;
}

export function togglePassage(board: Board, a: number, b: number): Board {
  const key = edgeId(a, b);
  if (a < 0 || a >= board.cols * board.rows || !Number.isInteger(a)
      || !neighbors(board, a).includes(b) || board.passages[key] === 'wall') {
    return board;
  }
  const passages = { ...board.passages };
  if (passages[key]) delete passages[key];
  else passages[key] = 'bar';
  return { ...board, passages };
}
