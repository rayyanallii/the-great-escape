# The Great Escape

The Great Escape is a browser minigame for IdeaLab Hacks. You are the warden. Place bars between cells and keep prisoner 0427 away from the exit until lockdown ends.

The default is a 30-second lockdown on a 10 × 7 maze. Choose a larger maze or change the duration before starting. Each layout gets sparse random fixed walls and at least one open route to the exit.

A bar costs one ink. Reinforcing an open passage costs two. Upgrading an existing bar costs one. The eraser opens a passage without an ink refund. Ink refills every four seconds. Use the board zoom if passage targets are too small on your screen.

Each maze has two pickups along its initial open route. Wall Breaker grants one charge when the prisoner reaches it. A standard bar takes 1.6 seconds to break and a reinforced bar takes 3.5 seconds. Structural walls are permanent. Speed Surge starts on collection and boosts movement to 1.7× for two seconds.

The prisoner uses A* for open routes and weighted Dijkstra for shortcuts through bars when carrying a charge. If the exit is blocked, he can take an open route to an uncollected Wall Breaker. The weighted route estimate uses base walking and breaking times.

After lockdown, select **Study my round** to replay movement, pickups, ability use, and maze changes or step through an original search. Pickup bookmarks jump to the moment each was collected. Select **Compare this position** to run five algorithms on that saved position. These comparisons are calculated after the round. The browser keeps your latest completed replay and display settings locally.

## Run locally

Use Node.js 24 or later.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

The production build is static. Serve the contents of `dist/` from any static host.

GPT Image generated the directional walk cycle and maze props using the [supplied prisoner artwork](./assets/reference/prisoner_reference.png). The transparent sprites and frame geometry are documented in the [sprite manifest](./assets/sprites/manifest.json). The left-facing animation mirrors the right-facing poses. The [InkRoute PRD](./INKROUTE_CODEX_PRD_v2.md) and [v0.2 demo](./legacy/inkroute-mvp-v2.html) are historical references.
