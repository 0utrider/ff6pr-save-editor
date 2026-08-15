# FF6PR Save Editor (Web)

Client-side, static web port of [AnotherFFVIPRSaveEditor](https://github.com/GiulioSamp/AnotherFFVIPRSaveEditor)
(C#/WinForms, MIT licensed, Copyright (c) 2026 Giulio Samperi). Rewritten from scratch in
TypeScript, guided by — not copied from — the original project's logic. No backend: a save file
never leaves the browser. See `HANDOFF.md` for the full format spec and design direction.

Upstream contributions from this investigation: [PR #9](https://github.com/GiulioSamp/AnotherFFVIPRSaveEditor/pull/9).

## Status

Crypto core (`src/save/`) is built and verified against real save data: Rijndael-256-CBC, raw
DEFLATE framing, base64/BOM framing, and the nested-JSON-string unwrap pattern. Data tables, the
typed model layer, and the UI are not built yet.

## Development

```
npm install
npm run dev      # dev server
npm test         # vitest — round-trips against gamesaves/ if present locally
npm run build    # typecheck + production build
```

`gamesaves/` (git-ignored) is a local-only real save directory used to verify the crypto
round-trip; it is not part of the repo.
