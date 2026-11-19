# Leonida Ledger — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ranstar04/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ranstar04/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01): the complete guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Checklist saved in the browser, export and import, filters by kind, a spoiler setting that hides story trophies until earned, a roadmap to the platinum, and missable trophies flagged — built from the official trophy descriptions.

Built for the make.fun bounty — join via my referral: https://make.fun/r/dn9c31df

## Use it

Serve `app/` with any static server and open it in a desktop browser, or just open `app/index.html`. It works with the network off — no external requests, no Rockstar logo or official artwork.

```sh
node serve.ts --port 8901
# open http://127.0.0.1:8901/
```

## What is inside

- All 55 official trophies: exact name, official description and grade, plus a guide in our own words with its sources cited.
- Tracker: tick trophies off, progress saves in localStorage, export your progress to a file and import it back.
- Filters by kind (story, missable, collectibles, activities) and a spoiler setting.
- Roadmap to the platinum and a missable-trophies page, built from the official descriptions.
- `app/data/trophies.json` holds the trophy list with a guide for every trophy.

## Structure

- `main.ts` — copies `app/` and `screenshots/` to the output and writes `dossier.json`.
- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker.
- `app/data/trophies.json` — the 55 trophies with guides and sources.
- `screenshots/` — real renders of the guide's own code.
