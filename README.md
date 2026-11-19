# Leonida Ledger — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ranstar04/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ranstar04/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01): the complete guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 of them hidden on PlayStation.

Built for the make.fun bounty — join via my referral: https://make.fun/r/dn9c31df

## What it does

- **Tracker** — every trophy with its exact official name, description and grade, as a checklist. Click to mark earned; progress saves in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Filters** — by kind (story, side strands, activities, collectibles, exploration, combat, money), by grade, by earned status, plus search and sorting by official order, grade or name.
- **Spoiler setting** — on by default: hidden story trophies show as locked ("Hidden trophy — earn it to reveal") until earned, with a per-trophy reveal button.
- **Roadmap to the Platinum** — five stages in order: (1) play the story, (2) finish the side strands, (3) activities & skills, (4) collectibles & world, (5) cleanup & money, then 100% completion and the platinum. Each stage lists its trophies with progress bars and missable flags.
- **Missables** — 30 trophies flagged, each with the reason built from its official description. Story and side-strand trophies must be done in order (no chapter replay is confirmed); collectibles, activities and money trophies can be finished in free roam after the story.
- **A cited guide for every trophy** — each trophy's detail pane shows its official description, a guide in our own words (what to do, where and how, when it can be missed), steps, a target counter where PlayStation tracks one (for example 42 Shooting Range challenges for The Shootist), and its sources.

## Honest about sources

The official trophy names, descriptions and grades come from the official list as published by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), who agree on every name, description and grade. The guides are Leonida Ledger's own words, built from those official descriptions. The game is days old, so where a step is not in the official description the guide says so plainly instead of inventing a location or mission step — a cited guide beats an uncited one.

## Use it

Serve `app/` with any static server and open it in a desktop browser. It works with the network off — no external requests, no Rockstar logo or official artwork.

```sh
node serve.ts --port 8901
# open http://127.0.0.1:8901/
```

## Structure

- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.
- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker (static files, no build step).
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, kind, missable flag, target, roadmap stage, guide, steps and sources.
- `screenshots/` — real renders of the guide's own code:
  - `1-cover.jpg` — the tracker, 13/55 earned, spoiler setting on, a hidden trophy locked.
  - `2-roadmap.jpg` — the five-stage roadmap to the platinum.
  - `3-missable.jpg` — the 30 flagged missable trophies with their reasons.
  - `4-guide.jpg` — the guide pane for The Shootist (42 Shooting Range challenges, silver), with steps, target counter and sources.
- `vendor/makefun-frontend.ts` — the kit's library, unchanged.
- `serve.ts` — the kit's static server.
