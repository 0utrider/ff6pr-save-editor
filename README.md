# FF6PR Save Editor (Web)

Client-side, static web port of [AnotherFFVIPRSaveEditor](https://github.com/GiulioSamp/AnotherFFVIPRSaveEditor)
(C#/WinForms, MIT licensed, Copyright (c) 2026 Giulio Samperi). Rewritten from scratch in
TypeScript, guided by — not copied from — the original project's logic. No backend: a save file
never leaves the browser. See `HANDOFF.md` for the full format spec and design direction.

Upstream contributions from this investigation: [PR #9](https://github.com/GiulioSamp/AnotherFFVIPRSaveEditor/pull/9).

## Status

Crypto core (`src/save/`), data tables (`src/data/`), typed model layer (`src/model/`), and the
editor UI (`src/ui/`) are built. Crypto/model verified against real save data with automated tests;
the UI was verified by driving it end-to-end in a real browser (load → edit → download → reload,
edits persist). Feature-complete per the original spec: load a save, edit stats/magic/equipment/
commands per character, items & quest items, Bushido/Blitz/Dances/Lore/Rage skill lists with
owner auto-detect, Espers, and Veldt encounter flags — then download the edited save.

Not yet wired into the UI: `warehouseItemList` (model support exists, no tab for it yet).

## Development

```
npm install
npm run dev      # dev server
npm test         # vitest — round-trips against gamesaves/ if present locally
npm run build    # typecheck + production build
```

`gamesaves/` (git-ignored) is a local-only real save directory used to verify the crypto
round-trip; it is not part of the repo.
