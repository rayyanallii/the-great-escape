# InkRoute: The Great Escape — MVP / Product Requirements Document

**Version:** 2.0 — unified Codex implementation brief  
**Prepared:** 14 November 2026  
**Target:** IdeaLab Hacks 2026 (submission deadline: 1 December 2026, 10:15 AM IST)  
**Product:** Zero-setup browser strategy game + real algorithm education + truthful decision replay  
**Working title:** **InkRoute: The Great Escape**  
**Pitch:** *You are the warden. Draw prison bars to contain a clever prisoner for 60 seconds. After the match, discover exactly how his algorithms tried to escape.*

> **CODEx: READ THIS FIRST.** This document supersedes the previous InkRoute PRD wherever it conflicts. Build an actual working game, not static mockups. Inspect and reuse working code from the earlier `inkroute-mvp-v2.html` if present, but do not preserve its misleading algorithm/path preview behavior. Use the bundled `assets/reference/prisoner_reference.png` as the **authoritative visual reference** for all game artwork. Generate consistent new assets with **GPT Image** if image-generation tooling or authorized API credentials are available. Do not claim generation occurred if it did not. Prioritize a playable, truthful P0 over unfinished polish. Report what actually works and what remains.

---

## 1. Locked product vision

InkRoute is a top-down / storybook-style **2D prison defense game**. The user is the warden, attempting to stop a mischievous hand-inked prisoner from reaching a prison exit. The prisoner is the AI-controlled character. He uses real graph-search algorithms, considers wall-breaking and speed boosts when allowed, and replans when the player adds or removes bars.

The player has a limited resource called **Ink** and builds **regular bars** or **reinforced bars** across passages **between adjacent floor cells**. The default challenge lasts 60 seconds, but **board dimensions, board display size, and match duration must be configurable** before play.

Two complementary interfaces must share a single authoritative engine:

1. **During a match:** fast, clean gameplay. A compact **Live Prisoner Thoughts / Decision Feed** on the side states what the prisoner just decided and why, in readable text, using true computed facts. **No noisy multi-path search waves during active play.**
2. **After a match:** a detailed **Decision Replay**. Scrub the actual game, click critical moments, view BFS expansion layers, the two Bidirectional BFS frontiers, A* priorities, Dijkstra weighted choices, alternative paths, actual executed decisions, and (if implemented) Q-Learning updates. Replay is reconstructed from recorded events/traces, not a newly invented explanation.

A separate **Algorithm Lab** lets the user create/edit a maze and run a strictly selected algorithm at their own pace, with real-world educational examples.

### Essential judge journey (no setup)

- Open deployed URL, see art and one-sentence rules, click **Play**. No account, installation, API key, camera, printing, or permissions.
- Move mouse or finger across grid edges to add bars. The prisoner reacts and changes course.
- Watch the Live Decision Feed say e.g. “A* found a 14-step detour; a weighted break route is estimated 2.1s faster. I’m breaking the east gate.” This statement **must be computed**.
- End by successfully containing him or losing to an escape. See authentic round stats.
- Click **Study My Match** and see actual decision-by-decision algorithm traces and multiple colored frontiers.
- Optionally open Algorithm Lab for full comparisons and real-world examples.

### Success criteria

- Playable within two clicks and comprehensible within ten seconds.
- The player can win with thoughtful defenses; the prisoner can escape against weak defenses. Neither outcome is hardcoded.
- Mouse + touch drag placement, real collision, and resource rules work without softlocks.
- At least **five legitimate algorithms** are implemented and tested: BFS, Bidirectional BFS, A*, Dijkstra, Greedy Best-First.
- On-screen statements and replay paths match the algorithm and actions **actually used in that game**.
- P0 game has actual prisoner/bar/door sprites consistent with the user's supplied reference, subject to image tooling access.
- Judge can choose a **larger prison grid** or **longer/shorter lockdown** without breaking layout or balance.

---

## 2. Scope / priority (do not expand this casually)

### P0 — must ship

- Polished game with **Play**, **Algorithm Lab**, **Watch a Strategy Showcase**, **Settings**.
- User's prisoner image integrated as a visible, properly scaled 2D character sprite with preserved identity (prisoner hat, striped clothing, cartoon gloves and black-ink-on-paper cutout treatment).
- GPT Image asset-generation workflow; deliver generated **regular bars, reinforced bars, entry/spawn, exit door, prison floor, break effect, speed boost, power-up icons** consistent with the reference if credentials/tooling available. Maintain a bundled reference file and prompt manifest regardless.
- Bar placement **on cell edges** (not entire cells), regular/reinforced variants, eraser, Ink costs/regeneration and collision.
- Configurable **grid dimensions** and **match length**; also **board zoom / maximize** and readable HUD timer display.
- Fixed-step game loop, configurable 60-second default match, time-scaled movement, prisoner's wall breaking and surge, real win/loss outcomes, pause/retry.
- Working BFS, Bidirectional BFS, A*, Dijkstra, Greedy with accurate traces.
- Game Mode defaults to **Auto Brain** with honest cost comparison between an open detour, break route, and available surge; no fake learning claims.
- **Live text Decision Feed** during the match. It must disclose actual algorithm/plan, action, reason, candidate metrics when computed.
- **Post-game replay** of real state changes (movement, bar placements, breaks, boosts), critical-moment bookmarks, and algorithm expansion traces with step controls.
- **Algorithm Lab** strict selection (BFS actually means BFS, never secretly Dijkstra), pause/step, visuals, real-world educational notes.
- Example prison and one-click Strategy Showcase; no manual setup needed to see a genuine wall-break decision.
- Unit tests, deterministic simulation tests, browser smoke test, static site deployment, source attribution.

### P1 — only once P0 is reliable

- **Adaptive Learner: genuine tabular Q-Learning** for high-level action strategy, local persistence, learning history, training/evaluation against automated warden policies, honest behavior changes and Q-value replay.
- Algorithm Race split-screen, multiple level themes, additional sprite animations, sound with mute, scenario sharing, selectable challenge difficulties, exportable replay JSON.
- More power-ups: Phase Shift / Decoy / temporary shield (implement only if game balance supports them).

### P2 — outside hackathon MVP

- D* Lite with real incremental-replanning tests; multiplayer, accounts, cloud leaderboards, real physics simulation, AR, print-to-camera maze scanning, LLM chatbot, paid plans.

**No PayPal, payments, order processing, or requirements imported from unrelated hackathons.**

---

## 3. Visual art direction: USE THE ACTUAL ATTACHED REFERENCE

### 3.1 Authoritative reference image

File included with this handoff:

`assets/reference/prisoner_reference.png`

This is the original user-provided prisoner illustration, not a generated stand-in. **Open and inspect the image before making assets.** It depicts a cheerful stylized prison escapee with striped prison clothes, cuffed arms and a chain, expressive face, striped cap, badge `0427`, oversized shoes/gloves, distressed heavy black ink, and an irregular layered paper cutout silhouette. Keep him as the same recognizable original prisoner design; do not arbitrarily redesign him as a generic robot or new character.

**Art bible:**

- **Black ink and near-white/off-white neutral paper only** for actual printed/cutout assets. Match the original drawing's ink weight, imperfect hand-drawn curves, light distress/scratches, soft paper grain, thick rubber-hose shapes, expressive faces and imperfect paper die-cut outline.
- **Do not introduce a yellow/sepia filter**, neon, gradients, 3D extrusion, polished plastic, glossy UI icon art or photorealism. Neutral paper warmth is fine; no yellow cast.
- Separate character/prop art from its surroundings. Exterior around die-cut paper silhouette must be **truly transparent** (`PNG` or `WebP` alpha); white/off-white paper is **inside** the cutout only. No white rectangular sprite backgrounds.
- Keep identical light direction, thickness of paper layer, black/white balance, visual scale, stroke style and camera perspective between pieces.
- Only the UI and gameplay overlays may use small restrained functional colors (e.g. green exit indicator, red damage, amber breaking target, blue/orange search waves in Replay); do not recolor the art itself.
- The art style is defined by the **provided user asset**, not by reproducing any named franchise's distinctive characters or logos.
- Game perspective: 2D top-down **floor-plan gameplay** with flat overhead tiles and readable bars; prisoner appears as a slightly raised storybook paper cutout laid on the board. Keep props consistent with this intentional hybrid. Do not generate isometric assets.

### 3.2 Required sprite manifest

Generate **separate usable assets**, not a single inaccessible mood board. Keep stable filenames. At minimum:

| Output asset | Purpose and silhouette requirements | Priority |
| --- | --- | --- |
| `prisoner_idle.png` | Faithful cutout of reference prisoner, no arbitrary outfit redesign | P0 |
| `prisoner_walk_01..04.png` | Same character, consistent proportions, readable directional 2D walking loop; if identity drifts, use cutout/transform animation on idle rather than inconsistent frames | P0 / best effort |
| `prisoner_break_01..03.png` | Same prisoner preparing/striking bars; readable silhouette | P1 if difficult |
| `prisoner_win.png`, `prisoner_trapped.png` | Escape celebration / frustrated defeated pose, same character | P1 |
| `bars_regular_h.png`, `bars_regular_v.png` | Thin ordinary iron prison bars, **edge-length pieces** with transparent outer alpha; tileable or 9-slice-ready | P0 |
| `bars_reinforced_h.png`, `bars_reinforced_v.png` | Visibly stronger bars with rivets, thicker frame, maybe cross-bracing; same geometry/anchors | P0 |
| `bars_break_fx.png`, `metal_fragments.png` | Black-ink shatter and paper scrap effect; transparent alpha | P0 simplified / P1 detailed |
| `door_entry.png` | Cellblock entry / starting cell marker; clearly distinct from exit | P0 |
| `door_exit_open.png`, `door_exit_closed.png` | Legible escape exit, consistent with walls | P0 |
| `floor_tile.png`, `floor_corner.png` | Subtle neutral off-white paper floor with light black ink tile structure; repeatable | P0 |
| `wall_fixed_h.png`, `wall_fixed_v.png` | Immutable architectural boundaries, unmistakably different from placeable bars | P0 |
| `powerup_wallbreaker.png` | Stylized hammer/force icon for Wall Breaker | P0 |
| `powerup_surge.png` | Stylized winged shoe/ink speed lines for Speed Surge | P0 |
| `powerup_phase.png` | Ghost / phase symbol (only if ability is implemented) | P1 |
| `tool_ink.png`, `tool_eraser.png`, `tool_reinforce.png` | Matching HUD tool icons | P0 |
| `paper_panel.png`, `paper_button.png` | Optional parchment cutout UI panels/buttons | P1 |

**Sprite dimensions:** generate source art at generous resolution (typically 1024² per isolated asset or a carefully labeled atlas) and convert to optimized game-ready textures. Define a consistent virtual cell unit (e.g. `tilePx=64`); preserve proportions across all art; bars must fit an **edge**, not fill the traversable cell. Use transparent padding for safe cropping, trim/pack without clipping paper borders. Include `assets/manifest.json` with `name`, `path`, `virtualDimensions`, `anchor`, and `sourcePromptId`.

### 3.3 GPT Image generation — explicit task for Codex

**Codex MUST attempt actual asset generation using GPT Image** when the environment has an authorized image-generation tool or `OPENAI_API_KEY` with access to a supported GPT Image API. Do **not** substitute search-result images or unrelated stock graphics. Use image **editing / reference-conditioned generation** with `assets/reference/prisoner_reference.png` as visual input whenever supported. Check the current API documentation and choose an available supported model (for example `gpt-image-2.5-sunburst` for high-fidelity edits or `gpt-image-2.5-flare` for faster iterative generations); do not hardcode retired models. Official API docs: https://developers.openai.com/api/docs/guides/image-generation and https://developers.openai.com/api/docs/guides/image-prompting.

**Required workflow:**

1. Inspect the reference; generate `assets/style_bible.md` describing actual visible traits, plus a small approved palette and sprite geometry guide. Preserve the image as-is in the project and record that it was user-provided.
2. Create reusable generation prompt templates in `scripts/sprite-prompts.json` with a common mandatory style prefix and a per-sprite description. Every prompt tells the model to use the original prisoner image as the sole visual style reference.
3. First generate **one regular bar, one reinforced bar, one exit door, one power-up, and a cutout prisoner variant**. Inspect these as a small contact sheet, compare stroke widths, paper outline, and perspective, and correct issues before generating the whole set.
4. Use GPT Image's supported **edit endpoint / image inputs** (not a plain text-only call that ignores the reference). When possible request `background: "transparent"`, PNG output, and appropriate quality. Do not commit API secrets. If transparency is imperfect, process alpha carefully and visually inspect before shipping.
5. Produce individual source PNGs, game-ready optimized WebP/PNG textures, and a sprite manifest; keep transparent backgrounds and consistent file naming/anchors. Preserve full-resolution source art separately.
6. For walking/breaking animations, prioritize identity consistency. If independently generated frames drift, create cutout/rigged transforms based on the best matching prisoner art, or use a simple honest 2–4 frame loop. Don't ship a morphing character.
7. Preview inside the **actual game at smallest supported cell size** and at enlarged board size. Check that bars are legible, doors recognizable, paper edges not chopped, assets seamless/tileable, and sprites do not overlap adjacent walls excessively.
8. Track prompts, model used, files created, and known inconsistencies in `assets/ASSET_ATTRIBUTION.md`. Describe model-generated assets honestly in README and submission.

**Fallback if GPT Image cannot be called:** do not pretend assets were generated. Produce the full prompt manifest and asset checklist, use visually coherent programmatic SVG/Canvas placeholders to keep the game playable, and explicitly state what access is missing. Do not silently block the core game on credentials. Do not use publicly exposed browser-side API keys. Sprite generation should be a **development-time task**, not an API call made every time a judge opens the website.

**Shared GPT Image style prompt prefix — include in every prompt:**

> "Use the supplied original prisoner illustration as the exact visual style and character-consistency reference. Produce a single isolated 2D game sprite in the same playful distressed black India ink on clean neutral off-white paper-cutout aesthetic. Preserve slightly uneven thick hand-inked outlines, rubber-hose curves, sparse speckled ink wear, subtle paper grain inside an irregular cream-white die-cut margin, and the same cartoon proportions/perspective and line weight. Strict monochrome printed artwork, no yellow or sepia cast, no full scene, no photographic lighting, no 3D, no shadows beyond a tiny die-cut paper edge, no text unless explicitly requested, truly transparent background outside the cutout. Centered object with safe padding and useful game-scale silhouette."

**Example object prompts (append after prefix):**

- `bars_regular_h`: “A single horizontal row of ordinary jail cell bars between two short end posts, frontally readable top-down/storybook 2D edge asset, thin dark metal outlines with distressed marks, both endpoints aligned for tiling across cell edges; no background or floor.”
- `bars_reinforced_h`: “Same exact footprint and anchors as regular bars, but visibly thicker iron, heavy bolted brace and two reinforced rivet plates; visually distinct in 64px grid scale; no full wall or background.”
- `door_exit_open`: “A compact, unmistakable open prison escape doorway for a paper maze, heavy uneven black ink outline, white paper inside and negative open threshold; isolated sprite, no surrounding building.”
- `powerup_wallbreaker`: “A chunky cartoon hammer-and-cracked-bar icon that clearly conveys breaking a barrier, isolated cutout sticker, strongly recognizable at 32px.”
- `powerup_surge`: “A single oversized rubber-hose cartoon shoe with bold speed strokes; readable speed ability icon at 32px.”
- `prisoner_idle`: “Faithfully preserve the supplied original prisoner's face, hair, cap, striped suit, gloves, shoes, badge 0427 and shackles. Create a game-ready cutout variant suitable for a top-down maze board. Avoid changing his identity or facial expression unnecessarily.”

**Other assets must have similar per-item prompts; don't invent new art direction for each object.**

---

## 4. Board settings: larger grid, larger display, longer timer

This is a **required user-facing feature**, not an undocumented developer config. There are THREE independent concepts:

1. **Maze/Grid size** = number of logical cells, so the prison can be bigger and require longer routes.
2. **Board display size / zoom** = the physical on-screen size of those cells, so users can make the play area visually larger.
3. **Lockdown duration** = real game seconds to survive, so rounds can be longer than one minute.

### 4.1 Grid size presets

Pre-match Settings -> **Prison Size**:

- **Compact:** 12 columns × 10 rows.
- **Standard (default):** 16 × 12.
- **Large:** 20 × 14.
- **Custom (if feasible in P0):** columns 10–24, rows 8–18, integer bounds. If custom implementation threatens P0, implement all three presets first, with explicit extensible configuration.

For each preset, generate/choose a valid maze, spawn and exit such that the baseline undisturbed game has at least one reachable open route. Ensure reachability checks, graph dimensions, seeded generation, spawn/exits, pathfinding IDs, sprite scale, and collision all come from the selected `GridConfig`, not hardcoded `16`, `12`, or `192`.

Do not simply enlarge the pixels and call it a bigger maze. Board dimension changes affect pathfinding, world length, difficulty, map generation and balance. **Changing dimensions mid-round** prompts a restart/confirmation or is disabled until a new round; never silently mutate active coordinates.

### 4.2 Board display zoom / maximize

Within game and replay:

- **Fit board** (default): responsive grid fits available content while preserving aspect ratio.
- **Zoom controls** 75%, 100%, 125%, 150% or continuous clamped scale (desktop and touch). Mouse-wheel/pinch may be optional.
- **Expand board** button enlarges play area and temporarily collapses the side decision feed (allow reopening it); use Fullscreen API only as enhancement with fallback to CSS expanded layout.
- When zoomed beyond viewport, allow pan/scroll; keep coordinate hit testing accurate, no stretched or blurry sprites, support device-pixel ratio for Canvas.
- Reposition player controls on narrow screens; ensure side feed doesn't make maze too small to tap.
- Optional **Large countdown display** accessibility toggle increases font scale; never changes countdown mechanics.

### 4.3 Timer options

Pre-match Settings -> **Lockdown Duration** presets:

- **30 seconds** — Quick Match.
- **60 seconds** — Standard (default).
- **90 seconds** — Extended.
- **120 seconds** — Long Game.
- **180 seconds** — Marathon.
- **Custom (optional)** — 30–300 seconds in 15-second increments.

Format `MM:SS` for all durations, show a prominent countdown. Pause stops game time, agent movement, resource regeneration, timed abilities and event clock; no timeout or win while backgrounded. Round ends exactly according to configured duration, not hardcoded 60. The results and replay timeline must use actual selected duration, including a completed 180-second game.

**Balance by size and time:** larger boards and longer rounds must not automatically become trivial or impossible. Start with deterministic seeded scenario sets per size; make difficulty multipliers explicit and playtest. Preserve absolute values (ink cap, regen, speed) centrally in typed config and adjust only with documented tuning, not invisible cheating.

### 4.4 Required settings contracts

```ts
type GridPreset = "compact" | "standard" | "large" | "custom";
interface MatchSettings {
  grid: { cols: number; rows: number; preset: GridPreset };
  durationSeconds: number; // default 60
  difficulty: "casual" | "challenge" | "brutal";
  boardZoom: number;       // e.g. 1.0; view only
  largeTimerText: boolean; // view only
  seed: string;
}
```

Store setting selections locally. Reset to a new board before the next game; avoid accidental changes to saved replay metadata. Replay includes the exact original settings.

---

## 5. Game mechanics and correct edge-bar geometry

### 5.1 The grid is a graph of *cells and passages*

**Unlike the previous PRD's solid-cell walls**, the finalized prison design puts **bars on the edge between neighboring cells**. Free floor cells remain traversable; moving through a passage is blocked by a regular/reinforced barrier. This change must be reflected in collision, AI, input hit testing, rendering, and replay.

- Each cell is a walkable floor tile, optionally decorated.
- Each **undirected passage edge** connects orthogonally adjacent cells (no diagonal moves).
- An edge state is `open`, `regular-bars`, `reinforced-bars`, or `fixed-wall`.
- The prisoner cannot traverse barred/fixed edges without a legal, time-consuming break action; fixed structural walls are never breakable.
- Breaking modifies **the exact passage** in the graph and updates `boardVersion`.
- Bars are rendered horizontally/vertically at exact shared boundaries. No duplicate mismatched edge entries between A→B and B→A.
- The **entry/spawn** and **exit door** are distinct cell markers. Cannot place or erase barriers that overlap required protected exit/entry visuals.

```ts
type CellId = number;
type EdgeId = string; // canonical unordered neighboring pair, e.g. "21:22"
type PassageKind = "open" | "regular-bars" | "reinforced-bars" | "fixed-wall";
interface Passage { id: EdgeId; a: CellId; b: CellId; kind: PassageKind; durability: number; builtByPlayer: boolean; }
interface PrisonMap { cols: number; rows: number; passages: Record<EdgeId, Passage>; spawn: CellId; exit: CellId; boardVersion: number; }
```

### 5.2 Warden controls

- **Regular bars:** cost 2 Ink, quick placement.
- **Reinforced bars:** cost 4 Ink, heavier break cost and stronger sprite.
- **Upgrade** regular to reinforced: cost 2 Ink (difference); explicitly show cost.
- **Erase tool:** may erase player-built bars; **no Ink refund** by default; may not erase fixed walls.
- **Ink:** max 10, begin 6, regenerate ~0.45/sec; tunable and visible.
- Edge-based pointer hit testing must snap to the nearest *internal passage edge* and show a visible hover ghost before placement. Mouse-down drag interpolates passage edges; prevent repeat-charging same edge.
- Block placement onto currently traversed/interpolating prisoner passage and a small protected spawn/exit region when necessary for fairness. Give feedback if invalid.
- Keyboard accessibility: choose adjacent passage from selected cell via directional controls or an equivalent non-pointer method, plus tool selection shortcuts.
- Undo single most recent placement (P1) if practical; cannot undo an enemy break.

### 5.3 Prisoner's real capabilities

- Move along currently legal passages at a time-based speed (initial 1.1–1.4 cells/sec on Challenge; tune).
- **Wall Breaker:** may choose and attack regular/reinforced bars if strategically worthwhile; normal break ~1.5s, reinforced ~3.5s, cooldown ~5s. Telegraph the exact edge visually with subtle pulse/damage cracks and sound (if enabled).
- **Speed Surge:** temporarily ~1.7× travel speed for ~2s, cooldown ~14s; affects physics/timing, not mere animation.
- **No teleport, fake breaking, or ghosts through walls.** Phase Shift is P1 and requires explicit legal passage/cooldown rules.
- Adaptive route planner reassesses after a newly placed bar, erased bar, broken bar, waypoint arrival, or material ability-state change.
- At no point may an unbreakable `fixed-wall` passage be treated as breakable in Dijkstra.

### 5.4 Round rules

- **Warden wins** only if prisoner has not reached exit when configured timer hits zero.
- **Prisoner wins** upon reaching exit while time remains; specify exact tie boundary in tests.
- Pausing freezes all simulation time. A background tab should safely pause, not advance invisibly.
- Restart restores ink, layout/seed, timer, movement, cooldowns, learning flag, log and replay state.
- Victory is possible for either side, with several measured test strategies across sizes/durations.

---

## 6. Algorithms: real implementations, real data

All algorithms read the same immutable `PrisonMap` snapshot. Shared `SearchResult` must include a legal passage route, cost, visited order, expansion count and trace metadata recorded **while computing**.

| Algorithm | Contract | Educational example |
| --- | --- | --- |
| **BFS** | FIFO queue, open passages only, fewest moves if equal move cost; actual expansion layers. | Degrees of separation in an unweighted social network. |
| **Bidirectional BFS** | Independent start/exit BFS frontiers; correct layered stopping, meeting cell or edge and valid parent-chain reconstruction; same fewest-move count as BFS. | Finding connection chains in huge unweighted graphs, searching from two endpoints. |
| **A*** | `f=g+h`, appropriate Manhattan heuristic with four-direction unit movement; correct optimal route in strict open-path mode. | Heuristic path planning in games and robotics. |
| **Dijkstra** | Priority queue by nonnegative accumulated cost; open-only mode for fair Lab comparisons; optional explicit weighted-break graph including true wall-break times. | Link-state routing (e.g. OSPF) and weighted navigation networks. |
| **Greedy Best-First** | Prioritize estimated distance to goal; may be suboptimal; demonstrate realistic dead-end failure. | Fast heuristic-driven search when first plausible answer matters more than optimum. |
| **Q-Learning (P1)** | Genuine action-value learning for strategy, **not** mislabeled as shortest-path search. Can learn when to detour/break/surge against defender behaviors. | Reinforcement-learning methods used in simplified robot-control/game-agent research. |

**D* Lite is P2**, only if genuinely implemented and tested as an incremental algorithm, never a relabeled A* rerun.

### 6.1 Fair comparison and modes

- **Algorithm Lab:** selecting BFS means BFS search and BFS route. The selected algorithm cannot secretly defer to a different algorithm. BFS, Bidirectional, A*, and Greedy strict modes treat bars as closed edges; Dijkstra offers explicitly labeled `open passages only` and `allow costly breaks` variants.
- **Game Mode Auto Brain:** evaluates BFS/A*/Bidirectional as reachability/alternatives, weighted Dijkstra as cost-aware break candidate, and possible surge variants. It chooses an actionable plan and identifies the controlling algorithm. Do not call its aggregate decision “BFS” just because the inspector is previewing BFS.
- Every comparison uses the same map version, start and exit. Show **moves** vs **estimated seconds** with explicit units. `visitedCount` definition must be consistent; route length and performance may differ by algorithm/tie-breaking.
- Weighted break estimate must account for actual break durations, and cooldown restrictions must be handled honestly. If future cooldown interactions are approximated, label an ETA as an estimate, not a mathematically proven optimal solution.
- The algorithm must return the **specific passage edges** the prisoner will traverse or break, not a path of cell centers that implicitly crosses blocked edges.

### 6.2 Algorithm result / decision data

```ts
type AlgorithmId = "bfs" | "bidirectional-bfs" | "astar" | "dijkstra" | "greedy";
type AgentAction = "move" | "break" | "surge" | "wait";
interface SearchTraceFrame {
  index: number;
  expanded?: CellId;
  forwardFrontier?: CellId[];
  backwardFrontier?: CellId[];
  costUpdates?: Array<{ cell: CellId; g?: number; h?: number; f?: number }>;
  meetingCell?: CellId;
}
interface SearchResult {
  algorithm: AlgorithmId;
  found: boolean;
  pathCells: CellId[];
  pathEdges: EdgeId[];
  visitedOrder: CellId[];
  trace: SearchTraceFrame[];
  expandedCount: number;
  pathCost: number | null;
  costUnit: "moves" | "estimated-seconds";
  breakEdges: EdgeId[];
}
interface CandidatePlan {
  id: string;
  algorithm: AlgorithmId | "surge-policy";
  pathCells: CellId[];
  pathEdges: EdgeId[];
  action: AgentAction;
  targetEdge?: EdgeId;
  etaSeconds: number | null;
  steps: number;
  breaksRequired: number;
  executableNow: boolean;
  why?: string;
}
interface DecisionEvent {
  id: number;
  tick: number;
  gameSeconds: number;
  boardVersion: number;
  prisonerCell: CellId;
  mode: "auto-brain" | AlgorithmId | "q-learning";
  candidates: CandidatePlan[];
  chosenPlanId: string;
  chosenAction: AgentAction;
  reasonCode: string;
  reasonFacts: Record<string, string | number | boolean>;
  searchTraceIds: string[];
}
```

**No fabricated algorithm quotes or metrics.** Text is templated from computed `reasonFacts`. If a value is missing, show “not evaluated”, not an invented number.

---

## 7. During the match: Live Prisoner Thoughts (text only)

The **side panel should show decisions** so judges appreciate the algorithms during play, but gameplay shouldn't become a wall of route overlays.

### Required panel layout

- Header: **PRISONER'S THOUGHTS**; actual active mode (default `Auto Brain`) visible at all times.
- **Latest decision** (one short sentence in character, but factually accurate), the algorithm that supplied the selected route, action and estimated duration when computed.
- **Comparison rows** showing candidates actually evaluated *on the same snapshot*; label e.g. `BFS open route: 18 moves`, `Bidirectional BFS: 18 moves`, `A*: 18 moves`, `Dijkstra break route: ≈6.4s`; never imply moves and seconds are directly equivalent.
- Recent **3–5 decision events** with timestamps and small icons (rerouted, break, boost, trapped, escaped), newest first.
- A **Details after match** affordance or bookmark symbol linked to post-game replay.
- On mobile: show the latest thought in a compact card under the board, with an expandable activity feed.

### Strict honesty rule

If the user switches a comparison dropdown to BFS during the match, label it **“Compare BFS (not controlling prisoner)”**. Do not let a preview replace the controlling planner. If allowing strict game-play modes, label them `Control with BFS` vs `Compare BFS` explicitly and use the requested algorithm for all actual movement. For P0, Game Mode can default to Auto Brain while full strict controls live in Algorithm Lab.

### In-match board policy

- Render prisoner, bars, entry, exit, break-charge effect, collision and optional one-step intended direction.
- **Do not show the full BFS/A*/Dijkstra route lines, frontiers or expansions during match by default.** This is intentional: judge is playing a game.
- Break target can subtly glow/animate; full route lines and blue/orange search waves belong to replay or Lab.

---

## 8. After match: Decision Replay (required P0)

Replay is a headline feature. **Record what occurred, do not run a different simulation and pretend it was the round.**

### Match recording

Record:

- Round configuration: cols, rows, duration, seed, difficulty and model/training status.
- Initial map + immutable reference to `PrisonMap` version.
- Fixed simulation ticks or timestamped positions and motion state (enough to reproduce movement), clock, Ink changes.
- Warden interactions: bars placed/removed/upgraded and legality outcomes; agent moves, wall breaks, damage, surge, cooldown changes.
- Every meaningful `DecisionEvent` containing candidate comparisons and selected action + `SearchResult` traces **from that run**.
- End result, critical statistics and game state snapshots every N ticks/seconds to permit responsive seeking.
- If Q-learning used, model identifier or hash, relevant **actual Q-values before/after update**, observed state/action/reward; do not label speculative motives as real Q-values.

### Replay player

- Play/pause, jump-to-start/end, seek bar, step backward/forward, speeds 0.25× / 0.5× / 1× / 2× / 4×.
- Two levels of playback: **match playback** (what occurred) and **decision deep dive** (step through the chosen algorithm's original trace).
- **Critical Moments** automatically generated from actual events: first reroute, path blocked, wall-break decision, surge, trapped state, escape/win.
- Clicking a moment loads its corresponding map snapshot, agent position, actual decision, candidate routes and trace.
- Visual search layers: BFS concentric expansion, Bidirectional BFS **blue from prisoner and orange from exit**, meet marker; A* search with g/h/f; Dijkstra cost changes and break edges; Greedy heuristic bias and dead ends.
- Route legend: actual chosen line (gold), rejected preview routes (dashed/gray), target break edge (amber). All diagrams reference the same board snapshot.
- Plain-English explanation with measured facts and short **real-world application** linked to authoritative sources in educational copy.
- Local saved last replay (IndexedDB if large; localStorage only if small enough); export replay JSON (P1) is optional.

If the app computes **post-game counterfactual comparisons** against algorithms the agent did not evaluate during play, label them **“Post-game analysis — not considered by prisoner during this decision.”** Do not mix these with historical evidence.

### Replay integrity tests

- Scrubbing replays the *same* bar, location, ability, win and loss facts.
- Search traces correspond to exactly the logged map version and chosen decision.
- Following the gold path never contradicts the actual movement/breaks performed before a later replan.
- Bidirectional search visuals have two authentic expansion streams and a correct meeting criterion; not two decorative circles.
- End result is derived from logged gameplay; replay doesn't accidentally run the learning model again.

---

## 9. Algorithm Lab: education and real-world examples

A separate untimed environment for learning, not the normal game HUD.

- Maze creator with **edge-bar draw/erase**, configurable grid dimensions, start/exit markers.
- Strict algorithm picker, run, pause, step, rewind, replay, playback speed.
- Use actual expansion traces; show comparison of expanded nodes, path length, cost units, legal passages and optimality assumptions.
- Every algorithm lesson has four concise areas: **How it thinks**, **Watch actual search**, **Where it's used**, **When it fails / limitations**.
- Accurate grounded real-world examples: BFS unweighted connection networks; bidirectional search in large two-endpoint graph queries; Dijkstra in weighted network routing such as OSPF; A* in game/robot planning; Greedy for heuristic-driven searches where quick feasible result matters; Q-learning in reinforcement learning for action selection (P1). **Do not assert Google's proprietary current routing implementation uses a specific one of these without evidence.**
- Include a counterexample maze where Greedy reaches the goal but takes longer than A*; actual replay confirms difference.
- Lab and Game Mode share the same map graph/search engine, not duplicate approximate implementations.

---

## 10. Q-Learning Adaptive Learner (P1 but architect for it)

**Q-Learning is real reinforcement learning, not a sixth geometric shortest-path solver.** Model high-level action strategy, using pathfinder outputs as features/actions.

- State features: distance-to-exit band, open-route availability/ETA, break-route ETA, remaining time band, ability readiness, local barrier density, recent player barrier placement rate and placement area.
- Actions: prefer detour, prefer break, prefer surge (each must be legal); action-specific route is still computed with standard pathfinders.
- Rewards: escape win positive, time wasted negative, progress toward exit positive, unnecessary break negative; document and test. Update a real tabular Q table via standard update equation.
- Allow accelerated training vs controlled scripted wardens, deterministic seeds, held-out evaluation, initial vs trained comparison, honest measured win rates; never fake a monotonic learning graph.
- Persist locally and allow Reset Learning. Q values shown in replay must be actual recorded numbers; no invented thought bubbles or LLM rationalizations.
- If not implemented by deadline, visibly mark **Coming later** or omit the control. Do not call a heuristic adaptive planner “machine learning.”

---

## 11. Screens, UI layout and visual hierarchy

### Home

- Compact title **InkRoute: The Great Escape**, sentence: “Keep prisoner #0427 locked up until the clock runs out.”
- **Play Now** primary. **Watch AI Strategy** for a one-click honest demo. **Algorithm Lab** secondary. Settings visible.
- Artwork derived from the supplied prisoner image; no giant marketing landing page before the playable game.

### Pre-match Settings

- Prison Size: Compact / Standard / Large (+Custom if implemented).
- Match Duration: 30 / 60 / 90 / 120 / 180 seconds (+Custom if implemented).
- Difficulty: Casual / Challenge / Brutal (Challenge default; do not expose an unimplemented setting).
- Board Zoom preview: Fit / 100 / 125 / 150%, Large Timer toggle, Mute toggle.
- Preview actual grid dimensions, estimated level size and correct selected duration.
- Changes apply only to the **next round**. Reset / use defaults button.

### Game (desktop)

- **Largest area left (~70%):** prison floor game grid with paper-cutout prisoner, barred passages, exit, effects; zoom/fullscreen.
- **Right (~30%):** compact Prisoner's Thoughts Live Feed + recent decisions. Never make the grid tiny to accommodate a full analytics dashboard.
- **Top:** prominent timer (MM:SS), ink meter, active difficulty, speed/Wall Breaker cooldowns.
- **Bottom:** Draw Regular Bars, Reinforce, Erase, Start/Pause/Restart; costs on buttons; keyboard shortcuts and touch support.
- Clear end overlays: **Warden Wins** / **Prisoner Escaped**, score and **Study My Match** CTA.
- Responsive mobile: entire grid first, feed below expandable, tools easy to tap, scalable scroll/zoom.

### Replay

- Wide, readable prison board; multi-colored algorithm visualizations only here or Algorithm Lab.
- Seek bar, speed, critical-moment navigation, side-by-side data about alternative decisions, selected path, expandable technical explanations.
- Toggle Search Waves / Selected Path / Rejected Alternatives / Cost Labels.

### Algorithm Lab

- Shared grid editor, full algorithm trace display, strict selection, beginner lessons and sourced real-world examples.

### Accessibility

- High contrast between neutral paper/bold ink and functional overlays; overlays have patterns and labels, not color alone.
- Reduced-motion preference, visible keyboard focus, semantic DOM controls, mute by default until interaction, touch-friendly drag handles.
- UI uses restrained neutral tones and compact accent colors, keeping printed art monochrome. No yellow/sepia haze.

---

## 12. Technical architecture and file structure

Use **Vite + React + TypeScript**, Tailwind CSS for layout, HTML Canvas or Phaser only if justified for sprite rendering and animation. Keep game logic separate from rendering. Prefer HTML Canvas + React for a lightweight static deployment; Phaser is acceptable if it reduces animation complexity without introducing inconsistent state. Static deploy to Vercel, Netlify or GitHub Pages.

- State engine: pure functions / typed transitions; graph passages and grid dimensions from config.
- Fixed-step simulation (e.g., 60Hz) independent of render frames; clamp frame gaps and pause on lost visibility.
- Deterministic seeded scenario and time-based actor movement.
- Search algorithms in separate modules, never UI loops; record frontiers and metrics during actual computation.
- Decision source-of-truth event log feeds the **live textual panel**, result stats and post-game **visual replay**.
- Use a stateless render path for different board zooms and responsive aspect ratios; logical cell IDs do not depend on pixel size.
- Local persistence for settings and last replay. No login/server required during judging.
- **Asset generation is developer-side:** an optional `scripts/generate-sprites.*` job with GPT Image image references. Game itself should run offline with generated local assets; never expose API keys client-side.

Suggested files:

```text
inkroute/
  INKROUTE_CODEX_PRD_v2.md
  .env.example                         # OPENAI_API_KEY only for local asset generation
  assets/
    reference/prisoner_reference.png   # USER-SUPPLIED, immutable
    style_bible.md
    ASSET_ATTRIBUTION.md
    manifest.json
    source/                           # full-resolution generated PNGs
  public/sprites/                      # optimized isolated sprites
  scripts/sprite-prompts.json
  scripts/generate-sprites.ts
  src/
    app/App.tsx
    components/Home.tsx
    components/MatchSettings.tsx
    components/PrisonBoard.tsx
    components/LiveDecisionFeed.tsx
    components/ToolPalette.tsx
    components/GameHUD.tsx
    components/ResultsScreen.tsx
    components/ReplayViewer.tsx
    components/AlgorithmLab.tsx
    engine/config.ts
    engine/passages.ts
    engine/gameLoop.ts
    engine/agent.ts
    engine/actions.ts
    engine/autoBrain.ts
    engine/decisionLog.ts
    engine/replayRecorder.ts
    engine/replayPlayer.ts
    algorithms/bfs.ts
    algorithms/bidirectionalBfs.ts
    algorithms/aStar.ts
    algorithms/dijkstra.ts
    algorithms/greedyBestFirst.ts
    algorithms/types.ts
    learning/qLearning.ts             # P1 only
    renderer/drawMap.ts
    renderer/drawSprites.ts
    renderer/drawReplay.ts
    utils/seededRandom.ts
  tests/algorithms.test.ts
  tests/passages.test.ts
  tests/config.test.ts
  tests/planner.test.ts
  tests/replay.test.ts
  tests/gameplay.test.ts
  e2e/judge-flow.spec.ts
  README.md
  package.json
```

If Codex has native image tools but no OpenAI API key, document which generation mechanism is used and obtain the same output artifacts. If image generation is unavailable, create and use placeholders *without misrepresenting their origin*. Never require a judge to supply a key.

---

## 13. Testing / acceptance criteria

### Core game

1. Launch immediately without login. Play round with at most two clicks.
2. Place regular and reinforced bars **between** cells; collisions match the drawn edge, not neighboring floor tiles.
3. Drag across multiple adjacent boundaries; no skipped edges, ink charged once per new bar.
4. Ink never negative or above cap; erase doesn't refund; immutable fixed walls remain.
5. Break a real bar: prisoner spends time, respects cooldown, destroys only that exact passage, passes afterward; reinforced takes longer.
6. Speed Surge alters actual movement time; no movement through closed/fixed passages.
7. Both warden and prisoner can win in seeded simulations and manual playtests; default game is neither trivial nor impossible.
8. Pause/backgrounding freeze all mechanics and timers.
9. Restart fully resets the match and its recorded events.

### Algorithms / explainability

10. BFS, Bidirectional BFS, A* shortest move counts agree on numerous open-edge mazes (including random seeds); Dijkstra agrees when every edge has unit cost.
11. Every route contains only adjacent cells and **legal edge traversals**, or explicitly recorded break actions in weighted mode.
12. Greedy can produce valid but suboptimal route and is not labeled optimal.
13. Weighted Dijkstra chooses lowest defined nonnegative cost; breaking fixed walls is impossible; its ETA breakdown shows actual speed/break model.
14. Bidirectional BFS has two authentic frontier streams, correct stopping condition, and valid meeting reconstruction.
15. The Live Decision Feed uses the actual current DecisionEvent; no incorrect “BFS controls prisoner” label when Auto Brain chooses Dijkstra.
16. No multi-colored search waves clutter normal gameplay. Replay and Lab render genuine recorded traces.
17. In Lab strict mode, selected BFS/A*/etc. controls the execution, with no hidden override.
18. Decision Replay records and reproduces wall placements, agent position, ability use, map changes, match clock and outcomes.
19. Replay critical-moment jumps and seek operate correctly; step-through trace refers to same board version as original decision.
20. Any replay-only counterfactual is labeled as post-game analysis, not a claimed historical thought.

### Settings / responsive UI

21. Compact 12×10, Standard 16×12 and Large 20×14 maps play, pathfind, render and replay correctly; no hardcoded dimension failures.
22. Changing grid size before a round regenerates a valid map. Changing grid mid-match is prevented or requires a clearly confirmed restart.
23. 30, 60, 90, 120, and 180-second durations terminate on correct game clock; results and replay scale to selected length.
24. Zoom and enlarged board keep accurate pointer hit testing, sprite anchors, image quality and legibility across desktop/mobile; zoom does not change logical maze size.
25. Large Timer setting only changes legibility, not timing.

### Asset quality / submission

26. All available generated sprites share the prisoner reference's bold black ink, neutral paper cutout, no yellow cast, consistent angles and line thickness.
27. Isolated sprite files have actual alpha transparency outside their die-cut shape; optimized textures do not crop the border.
28. The prisoner remains recognizable at normal and minimum supported cell display sizes. Bars have separately identifiable regular/reinforced silhouettes.
29. README lists user-supplied reference asset, GPT Image outputs/models/prompt attribution, coding assistance and pre-existing code; no false claim about access or generation.
30. `npm run build`, `npm test`, and an end-to-end Playwright smoke test succeed. No critical console errors or broken user-facing controls.

### Definition of done

- Live demo link opens and starts a functional game immediately.
- The attached prisoner is visibly used, and game props are cohesive (or asset-generation blocker is transparently documented).
- Configurable prison size, display zoom, and lockdown duration are actual working controls.
- Game Mode has honest readable **live text decisions**, and after the game **Replay** animates actual search frontiers.
- Five tested search algorithms, responsive controls, real win/loss, visible wall-breaking, educational Lab and basic reference-backed real-world notes.
- Honest Devpost attribution and a working source repository.

---

## 14. Codex build phases (prioritized)

**Phase 0 — Inspect.** Read this file, existing code, and actual prisoner PNG. Write a feature inventory, note v0.2 discrepancies and choose Canvas/Phaser pragmatically.

**Phase 1 — Rebuild world geometry and algorithms.** Implement canonical edge passages, scalable rectangular maps, BFS/Bidirectional/A*/Dijkstra/Greedy and correctness tests; ensure path cells and passage edges correspond.

**Phase 2 — Playable prison game.** Build fixed-step movement, drag-to-place bars, ink, breaker/surge, win/loss and configurable match length. Ship working mechanics before polish.

**Phase 3 — Decisions + replay.** Record authoritative events, display real live text feed, build end-of-round replay with search-front animations and critical moments. Test historical consistency.

**Phase 4 — GPT Image asset pipeline and visual integration.** Reference-conditioned generation of consistent sprites; first-run validation set, then full manifest; integrate at multiple zooms. Work in parallel with implementation where convenient, but don't stop progress if image API unavailable.

**Phase 5 — Algorithm Lab and education.** Strict algorithm picker, actual trace controls, concise explanations and sourced real-world examples.

**Phase 6 — Settings, QA and deployment.** Validate grid presets, timer choices, board zoom, mobile interactions, balance harness, screenshots, README, source disclosures and deployed URL.

**P1 if time remains — true Q-Learning.** Train and evaluate with held-out scenarios and real Q-values, not invented progress bars. Do not sacrifice replay correctness to include it.

**At each phase, Codex must report:** changed files, actual screenshots/tests, commands executed, failures found, remaining scope, and whether GPT Image was available. Do not claim completion without verification.

---

## 15. Hackathon demo plan (120 seconds maximum target)

1. **0–10s:** Show the custom ink-and-paper prisoner and challenge: “Can you keep him locked up?” Click Play.
2. **10–30s:** Place bars; prisoner reroutes. Show the side **Prisoner's Thoughts** feed describing actual decisions without overlay clutter.
3. **30–50s:** Block his shortcut; prisoner finds a break-through route, attacks actual reinforced/regular bars and moves through. Show that the player is in control of defenses.
4. **50–75s:** Show result and click **Study My Match**. Jump to the wall-break critical moment; play actual BFS expansion, then two Bidirectional BFS frontiers meeting, with a short cost comparison. State clearly whether each was actual decision data or labeled replay-only alternative analysis.
5. **75–95s:** Open settings, choose **Large Prison** and **120s Lockdown**; board regenerates, timer shows 02:00, expand/zoom board; all interactions still work.
6. **95–110s:** Show Algorithm Lab and one real-world example; demonstrate that strict selection doesn't secretly change algorithms.
7. **110–120s:** Show source/test evidence, credit the user-provided prisoner reference and GPT Image-generated assets (only if truly generated), and summarize what was learned.

A recorded video may legitimately be edited or sped up with disclosure, but do not fake game behavior, result data or learning progress. Public demo should use cached image assets; judge never needs image-generation credentials.

---

## 16. Risks and guardrails

| Risk | Mitigation |
| --- | --- |
| Generated sprites drift away from reference | Always provide original image input, shared prompt prefix, approve contact sheet, preserve character ID, use cutout rigging if frames drift. |
| GPT Image not accessible to Codex | Script + prompt manifest + honest placeholders; do not claim assets exist. |
| Old solid-wall engine conflicts with bars between cells | Canonical undirected passage graph; rewrite collision and pathfinding together. |
| Live feed lies about the algorithm | Single DecisionEvent source of truth and regression test for BFS-vs-break mismatch. |
| Replay re-simulates and changes decisions | Record precise original actions, board version, search traces and Q-values at decision time. |
| Search animations distract active player | Live match text only; full overlays restricted to replay and Lab. |
| Grid larger but player loses click accuracy | Logical/pixel separation, correct coordinate transform and zoom pan. |
| Longer timer creates trivial strategy | Balance harness across each size × timer setting, transparent rules and honest tune report. |
| Too many unimplemented algorithms / ML | P0 five verified algorithms. Q-Learning only as genuine P1. |
| Novel art but weak game | Gameplay correctness, fairness, repeatable demo and accessible zero-setup first. |

---

## 17. Copy-paste kickoff instruction for Codex

```text
Read INKROUTE_CODEX_PRD_v2.md completely. This v2 document supersedes earlier
InkRoute PRDs. Inspect existing InkRoute MVP code and the user-supplied image
assets/reference/prisoner_reference.png BEFORE implementing.

Build a polished, genuinely playable 2D ink-and-paper prison defense game called
InkRoute: The Great Escape. The player is a warden, the AI is prisoner #0427,
and the objective is to stop his escape before the configurable timer expires.

CRITICAL ART TASK: Use GPT Image with the supplied prisoner's image as a real
reference input to generate cohesive transparent black-ink / neutral paper-cutout
sprites: ordinary jail bars, reinforced bars, floor tiles, entry, exit door,
Wall Breaker, Speed Surge, ink/eraser tools and compatible prisoner art. Create
a repeatable developer-side asset generation script, prompt manifest, source
artwork and game-ready textures. Use a currently supported GPT Image model and
inspect generated sprites for consistency. If image tooling/credentials are
unavailable, report the blocker truthfully, supply exact prompts and usable
placeholders, and continue implementing the functional game. Never expose keys
in the browser or claim images were generated when they were not.

CRITICAL GAME SETTINGS: Add visible pre-match settings for Compact 12x10,
Standard 16x12, Large 20x14 prison grids; 30/60/90/120/180-second lockdowns;
board zoom / maximize, and optional large countdown display. Do not confuse
logical maze size with pixel zoom. Changing grid/time during a round must not
silently break the game. Test every preset.

CRITICAL MECHANICS: Bars occupy graph EDGES between neighboring walkable cells,
not whole floor tiles. Use real BFS, Bidirectional BFS, A*, Dijkstra, and Greedy
Best-First, with tested routes, correct expansion traces and weighted wall-break
planning. Implement breaker/surge, ink economy, responsive drag placement, real
collision, actual 60-second default and truthful victory outcomes.

CRITICAL EXPLAINABILITY: During a match show a concise textual side panel of
REAL prisoner decisions and candidate metrics, not a board covered in paths.
After the round, let the player replay REAL recorded actions and step through
ACTUAL algorithm search frontiers, including two colored Bidirectional BFS
waves. Counterfactuals must be explicitly labeled. Algorithm Lab selections
are strict, with real-world explanations. Do not repeat the old BFS-preview
versus Dijkstra-wall-break contradiction.

Prioritize P0 and produce working code, accessible controls, tests, a public
static build, source/model attribution, and a clean README. Q-Learning is P1:
only call it machine learning if real training, policy updates and held-out
evaluation actually work. After each phase, report exactly what was completed,
tested, and blocked. Do not stop at a mockup.
```

---

**Final project principle:** *Play first. See what the prisoner decided. Then rewind time and watch the real algorithms think.*
