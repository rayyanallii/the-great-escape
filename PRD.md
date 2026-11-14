# The Great Escape

The Great Escape is an educational warden minigame for IdeaLab Hacks. Each round uses a sparse random maze. The warden places bars to delay prisoner 0427 while the prisoner searches for the exit. The replay teaches how graph search responds to changes in the maze.

## Release scope

| Area | Implementation |
| --- | --- |
| Start and settings | One-screen start, four maze sizes, five round lengths, board zoom, large timer, and locally saved preferences. |
| Warden tools | Edge-based bars, reinforcement, erasing, replenishing ink, drag placement, keyboard activation, and tool shortcuts. |
| Prisoner | Animated movement in four directions, open-route A*, weighted Dijkstra, and collectible one-use Wall Breaker and Speed Surge. |
| Study | Live decision summary, recorded round playback, pickup bookmarks, historical search traces, and five-way post-round comparison on captured positions. |
| Art | User-supplied character reference and transparent GPT Image sprites. Frame geometry and provenance are in the [sprite manifest](assets/sprites/manifest.json). |

The [InkRoute brief](INKROUTE_CODEX_PRD_v2.md) is historical. The current scope folds algorithm study into replay and uses random mazes throughout. The former standalone lab and scripted showcase are superseded. The optional Q-learning and additional abilities are outside this release.

## Judge walkthrough

1. Start a lockdown and place a bar ahead of the prisoner. Watch him replan.
2. Watch the hammer and shoe pickups disappear when he reaches their cells. See the live status change when a power is collected or used.
3. Open **Study my round**. Jump to a pickup or inspect a recorded search.
4. Choose **Compare this position**. Switch to Bidirectional BFS and step through its two search fronts. The comparison runs after the match on the selected maze snapshot.

See the [setup guide](README_START_HERE.md) for running, testing, and building the project.
