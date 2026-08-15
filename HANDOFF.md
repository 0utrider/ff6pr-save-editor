# FF6 PR Save Editor — Web Port Handoff

## Goal

Build a from-scratch, client-side web tool that does everything
[AnotherFFVIPRSaveEditor](https://github.com/GiulioSamp/AnotherFFVIPRSaveEditor) (C#/WinForms) does,
as a static site hostable on GitHub Pages. No backend, no server round-trip — a save file never
leaves the user's machine. This is a rewrite (TypeScript, not Blazor), guided by, but not copying
code from, the original project. Source project is MIT-licensed (Copyright (c) 2026 Giulio Samperi);
keep attribution in the new repo's README/LICENSE regardless of how much logic ends up shared
verbatim vs. reimplemented.

Upstream contributions already made from this same investigation: PR #9 (Rage/Bushido/Blitz/Lore
owner auto-detect + manual override dropdown, DPI/scaling fix, skill search filter) —
https://github.com/GiulioSamp/AnotherFFVIPRSaveEditor/pull/9. Anything below marked "(fixed
upstream)" reflects lessons already paid for once; don't reintroduce the bug in the new build.

## Critical blocker: Web Crypto cannot do this decrypt

The save format uses **Rijndael with a 256-bit block size**, not AES. AES is Rijndael fixed to a
128-bit block; the browser's native `crypto.subtle` only implements AES, so its block size is
hardcoded to 128 bits and cannot be configured. The original C# project hit this same wall on
.NET Core (`RijndaelManaged` is AES-only there too) and pulled in BouncyCastle for a real
256-bit-block Rijndael engine. A JS/TS port needs an equivalent — either a JS Rijndael
implementation with configurable block size (search for one, or port the reference algorithm
directly — it's a few hundred lines of well-defined math, not a security-sensitive design, just
an unusual parameter choice), or hand-roll it. **Do not assume `AES-CBC` via Web Crypto will work
here — it will silently produce wrong output or throw on block alignment.**

DEFLATE is fine: the game writes raw DEFLATE (no zlib header/checksum), which matches the
browser's `CompressionStream('deflate-raw')` / `DecompressionStream('deflate-raw')` exactly. Supported
in current Chrome/Edge/Firefox/Safari 16.4+. Fall back to `pako.js` (`raw: true` mode) only if
broader Safari support turns out to matter.

## Save file format (verified against `SaveCrypto.cs`, `SaveFile.cs`, `NestedJson.cs`)

**Decrypt pipeline** (reverse for encrypt):
1. File bytes may start with a UTF-8 BOM (`EF BB BF`) — strip it if present.
2. Remaining bytes are ASCII text: base64. Trim whitespace, then re-pad to a multiple of 4 with
   `=` before decoding (the file on disk is sometimes missing trailing `=`, but re-adding it is
   always safe since decoding is padding-tolerant either way).
3. Base64-decode to ciphertext bytes.
4. Decrypt with Rijndael-256 (256-bit block, 256-bit key), CBC mode, using the hardcoded key/IV
   below. Because block size is 256 bits = 32 bytes, process in 32-byte chunks, not the usual 16.
5. Strip custom zero-byte padding (**not PKCS7**): decode scans backward from the end and drops
   trailing zero bytes, but only within the last 32-byte block (i.e. it will not eat legitimate
   zero bytes that are actual DEFLATE data further back). See exact scan logic below — this is a
   correctness-critical detail, a naive `TrimEnd(0)` over the whole buffer will corrupt real data.
6. Raw-DEFLATE-decompress the result.
7. UTF-8-decode to get the save's JSON text.

**Encrypt pipeline** mirrors this: UTF-8 bytes → raw DEFLATE compress → zero-pad up to the next
32-byte boundary (add 0 bytes if already aligned — do **not** add a full extra block when the
length is already a multiple of 32) → Rijndael-256-CBC encrypt → base64-encode (keep the `=`
padding, don't trim it — the game's own parser rejects unpadded base64 on read) → prepend BOM,
append `\r\n` (CRLF), write bytes to disk.

**Key** (32 bytes):
```
97, 9, 7, 0, 185, 195, 184, 185, 66, 21, 153, 231, 156, 165, 123, 135,
190, 169, 50, 211, 121, 123, 173, 118, 99, 237, 77, 222, 10, 148, 60, 197
```

**IV** (32 bytes):
```
2, 36, 249, 119, 31, 219, 110, 14, 59, 213, 8, 215, 183, 149, 191, 46,
12, 189, 23, 105, 66, 104, 10, 99, 123, 18, 188, 98, 115, 219, 46, 187
```

**Zero-padding strip, exact algorithm** (block size 32):
```
minEnd = data.length - 32 + 1
offset = data.length
while offset > minEnd:
    offset -= 1
    if data[offset] != 0:
        return data[0:offset+1]
return data[0:minEnd]   // whole last block was zero — keep exactly one byte's worth of margin
```

**Zero-padding add, exact algorithm**:
```
count = 32 - ((data.length + 32 - 1) % 32 + 1)
if count == 0: return data unchanged
else: append `count` zero bytes
```

## JSON structure: nested-string unwrap pattern

The top-level JSON has fields (`userData`, `mapData`, and inside those, many more —
`ownedCharacterList`, `abilityList`, `equipmentList`, `commandList`, etc.) whose *value* is not a
nested object but a **JSON-encoded string** containing the real object. Reading requires
`JSON.parse()` on the string value; writing requires `JSON.stringify()`-ing the object back into
the parent as a string, replacing the original field. This nests multiple levels deep (e.g. each
element of a character array is itself a JSON string). Port `NestedJson.Unwrap`/`Rewrap`
(`NestedJson.cs`) as a small pair of helpers — every other module leans on this pattern
constantly, so getting it right once matters more than any individual field mapping.

One serialization detail to preserve: the original uses relaxed/unescaped JSON encoding
(`JavaScriptEncoder.UnsafeRelaxedJsonEscaping` in .NET terms — i.e. don't over-escape characters
like `<`, `>`, `&`, non-ASCII) when re-stringifying, since the game's own writer does the same and
an overly defensive JSON encoder could produce byte-different (though technically equivalent)
output. Probably harmless either way since it round-trips through JSON.parse, but flagging in case
a save mismatch ever gets reported.

## Data model (field names are load-bearing — many have upstream typos, keep them verbatim)

Top-level save object: `id` (slot id, unstable — do not use for character identity, see below),
`timeStamp`, `playTime`, `pictureData` (presence of `id`+`pictureData` = "this is a slot file").

`userData` (unwrapped) →
- `owendGil` (int, **sic** — "owend" not "owned"), `totalGil`, `steps`, `battleCount`,
  `monstersKilledCount`
- `ownedCharacterList` (unwrapped) → `.target[]`, each entry itself a JSON string → character object
- `ownedMagicStoneList` (unwrapped) → `.target[]` → array of owned Esper ids
- `normalOwnedItemList`, `importantOwendItemList` (**sic**), `warehouseItemList` — each an
  "inventory" (unwrapped) → `.target[]`, each entry `{contentId, count}`

Character object (per entry in `ownedCharacterList.target`):
- `id` (int) — **the save-slot roster id. Shifts based on Three Scenarios recruitment order.
  Do NOT use this to identify "which character owns the Rage/Bushido/Blitz/Lore list" — this was
  the exact bug in issue #8.**
- `jobId` (int) — stable, tied to the actual character regardless of recruitment order. Use this
  for identity/ownership checks. Known ids: Gau=12 (Rages), Cyan=3 (Bushido), Sabin=6 (Blitz),
  Strago=8 (Lore). Full roster table below.
- `name` (string) — **do not use for identity either**: it's the localized display name (differs
  by save language) and the player can rename characters in-game.
- `currentExp` (int), `magicStoneId` (equipped Esper)
- Level is derived server-side by the game from `currentExp` on every battle — writing a level
  value alone gets silently discarded and the player sees a spurious "Level Up". Always compute
  and write `currentExp` for the target level together with any level field.
- `parameter` (unwrapped) → stats object, e.g. `currentHP`, `currentMP`, and a set of
  `addtional*` fields (**sic**, "addtional" not "additional" throughout — `addtionalLevel`,
  `addtionalMaxHp`, `addtionalMaxMp`, `addtionalPower`, `addtionalVitality`, `addtionalAgility`,
  `addtionalIntelligence`, `addtionalSpirit`, `addtionalAttack`, `addtionalDefense`,
  `addtionalMagic`, `addtionalLuck`, `addtionalAccuracyRate`, `addtionalEvasionRate`,
  `addtionalCriticalRate`, `addtionalAbilityDefense` (= magic defense), `addtionalAbilityEvasionRate`
  (= magic evasion; "Ability" in the save's own vocabulary means "Magic" everywhere)).
- `abilityList` (unwrapped) → `.target[]`, each `{abilityId, contentId, skillLevel}`. This is
  where spells AND Rages/Bushidos/Blitzes/Lores/Dances all live — `skillLevel >= 100` means known.
  `contentId = abilityId + offset`, offset differs per skill type (Rages: +168; general default
  used elsewhere in the codebase: +330 — check `Data/*.cs` id ranges per skill type before
  guessing an offset for a new category).
- `abilityDictionary` (unwrapped) → `{keys: [], values: []}` parallel arrays, `keys[i]` is a
  category id (7 = Magic; other category ids for skills are not documented/reverse-engineered —
  treat as opaque and always scrub across *all* categories, never just one), `values[i]` is
  itself an unwrapped JSON string → `{target: [...]}` of the same `{abilityId, contentId,
  skillLevel}` shape.
- **Forgetting an ability is not just zeroing `skillLevel` in `abilityList`.** The game also
  tracks learned abilities in `abilityDictionary` (merged in, not rebuilt, apparently) and in two
  ownership-order arrays on the character node: `additionOrderOwnedAbilityIds` and
  `sortOrderOwnedAbilityIds` (both unwrapped, both hold `contentId`s, not `abilityId`s). All three
  places must be scrubbed or the ability stays visible in-game after being "unlearned" in the
  editor — this was reported exactly this way for Rages (tick added it, untick didn't remove it).
- `equipmentList` (unwrapped) → `{keys: [], values: []}` parallel arrays. Slot keys: 1=Weapon,
  2=Shield, 3=Armor, 4=Helmet, 5=Relic1, 6=Relic2. Each `values[i]` unwrapped → `{contentId,
  count}`. Empty-slot placeholder ids: weapon/shield=93, helmet=198, armor=199, relic=200 (also
  treat 0 and 197 as "empty" when reading). Armor/helmet placeholder ids are swapped relative to
  a commonly-cited reference (`KiameV/final-fantasy-vi-save-editor`'s Go port) — verified against
  its own save-writer code, which is authoritative over its constants file.
- **Equipment `count` must mirror the actual inventory count of that item** (default 1 if the
  item isn't separately in inventory at all — that's legitimate game state for a
  worn-but-not-stocked item, don't "fix" it by injecting a phantom inventory entry). A mismatch
  between equipment slot count and inventory count causes the game to reject the save file as
  corrupted on load.
- `commandList` (unwrapped) → `.target[]`, 8 ints, battle command slot assignments (see `Commands`
  table). Assigning a command id the character doesn't legitimately own (e.g. Magitek on a
  non-Magitek character) can soft-lock the game — the original UI restricts the picker to each
  character's original slot values plus a safe universal set; keep that guardrail in the port.

Inventory rules (`normalOwnedItemList` etc.): stacks are `{contentId, count}`, max stack 99.
**Duplicate `contentId` entries are rejected by the game** — always merge/dedupe by id before
writing (sum counts, cap at 99). Drop zero-count/zero-id rows on write. Two item ids are known to
crash the game if present: 184 and 243 — drop them on write regardless of source.

`mapData` (unwrapped, top-level, only present on some saves) → `beastFieldEncountExchangeFlags`:
flat int array (0/1) of Veldt monster-formation-seen flags, one bit of state per known formation
(see `Data/VeldtFormations.cs`, 385 lines — largest lookup table in the project by line count).

## Roster table (id, jobId, English name, isNpc) — port verbatim, id is the array/save key, jobId drives skill-tab ownership

```
1  1  Terra   false
2  18 Wedge   false
3  18 Biggs   false
4  21 Kefka   true   // absent from some reference tables; confirmed present in real saves
5  2  Locke   false
6  11 Moglin  true
7  11 Mogret  true
8  11 Moggie  true
9  11 Molulu  true
10 11 Moghan  true
11 11 Moguel  true
12 11 Mogsy   true
13 11 Mogwin  true
14 11 Mugmug  true
15 11 Cosmog  true
16 11 Mog     false
17 5  Edgar   false
18 6  Sabin   false
19 4  Shadow  false
20 15 Banon   false
22 3  Cyan    false
23 17 ??????  true
24 12 Gau     false
25 7  Celes   false
26 10 Setzer  false
27 20 Maduin  true
28 8  Strago  false
29 9  Relm    false
30 16 Leo     false
32 14 Umaro   false
33 13 Gogo    false
```
Note: id 21 and 31 are intentionally absent (gaps in the game's own table, not a bug). `jobId` is
NOT unique (Mog shares 11 with the nine NPC moogles; Wedge/Biggs share 18) — never use jobId as a
primary key, only for "which skill list does this belong to" lookups where the ambiguous cases
don't own skill lists anyway.

Skill-owner job ids: Gau=12 (Rages), Cyan=3 (Bushido), Strago=8 (Lore), Sabin=6 (Blitz), Mog=11
(Dance), Setzer=10 (Slot).

## Data tables to port (line counts = rough size signal, all in `Ffvi.SaveTool.Lib/Data/*.cs`)

`Items.cs` (307 lines), `Rages.cs` (269 lines, ids 800–1055, this is the list the user specifically
asked for a search/filter over — 250+ entries with no sensible in-game order), `VeldtFormations.cs`
(385 lines), `LevelGrowth.cs` (136 lines, exp-per-level table + clamp bounds), `CharacterBaseStats.cs`
(50), `Lores.cs` (42), `Commands.cs` (29), `Blitzes.cs` (26), `Bushido.cs` (26), `Espers.cs` (25),
`Spells.cs` (35). These are static id→name lookup tables — mechanical to port, just copy the data
straight across into TS `const` arrays/objects. Not a design or logic decision, pure data entry.

## Feature checklist (parity with original + already-shipped improvements)

- Load a save file (drag-drop / file picker — browser File API, no filesystem path assumptions
  like the original's `MyDocuments\My Games\...` default directory lookup, which doesn't apply on
  the web anyway)
- Edit: Gil, Total Gil, Steps, Battle Count, Monsters Killed
- Per-character: stats (HP/MP/stat additions), level (via exp, keep them coupled), equipped Esper,
  equipment (6 slots), battle commands (8 slots, restricted picker)
- Per-character skill tabs: Rages (Gau), Bushido (Cyan), Blitz (Sabin), Lore (Strago) — **must**
  auto-detect owner by `jobId`, with a manual override selector for edge cases (this was the
  headline bug fix upstream — issue #8 — don't regress to `id`-based lookup)
- Search/filter box on skill ability lists (shipped upstream for Rages' 250+ entries — extend to
  all skill lists in the new build, filter by name or id substring)
- "Learn All" / "Forget All" bulk actions — must always act on the *full* unfiltered list, not
  whatever the search box currently narrows to (deliberate, to avoid a user filtering the list and
  then a bulk action silently doing less than its label says)
- Inventory management (add/remove/edit stacks across normal/important/warehouse, dedupe on save)
- Owned Espers toggle list
- Veldt encounter flags (seen/unseen per formation, mark-all/clear-all)
- Save back out to a file download (browser: construct the encrypted bytes client-side, trigger a
  `Blob` download — there's no filesystem write API to mirror the original's direct file save, so
  the web app's affordance is closer to "download the edited save" than "save in place")

## Recommended stack

TypeScript + Vite, static output, deployed to GitHub Pages (no backend — everything above runs in
the browser, so a save file never gets uploaded anywhere). Framework choice is open (plain
TS/Web Components vs. a light framework like Preact/Svelte/React) — not dictated by anything
save-format-specific, pick based on what the actual UI build wants. Recommend organizing the port
as:
- `src/save/` — crypto (Rijndael-256 port), compression, base64/BOM framing, `NestedJson`
  unwrap/rewrap helpers — the "port `Ffvi.SaveTool.Lib`" layer, framework-agnostic
- `src/data/` — the static id/name lookup tables (mechanical port from `Data/*.cs`)
- `src/model/` — typed wrappers over the raw JSON (Character, Inventory, Equipment, etc.),
  mirroring the original's class boundaries since they map cleanly to the save's own structure
- `src/ui/` — the actual web frontend (see design direction below)

Test against real save files early — get the crypto round-trip (decrypt → re-encrypt unchanged →
byte-compare, and decrypt → edit → re-encrypt → load in-game) working and verified before building
UI on top of it. This is the part with real correctness risk; the UI is comparatively low-stakes.

## Design direction (frontend-design skill output — guidance for the UI build, not yet implemented)

Subject-grounded direction, avoiding generic "AI tool" defaults (cream+serif, dark+neon-accent,
broadsheet-hairline): lean into SNES-JRPG status-menu vocabulary — the actual mental model a
player has of this data — without literally skinning the game's own assets.

**Palette** (dark-first, matches the tool's technical/editing nature and the source game's own
dark save-menu chrome):
- `--bg`: `#10131A` (near-black indigo, not flat black)
- `--surface`: `#1B2130` (panel fill)
- `--accent`: `#F2B84B` (warm gold — menu-cursor/gil-counter gold, used for primary actions and
  active states)
- `--accent-alt`: `#5FD0C0` (teal-cyan — secondary interactive state, deliberately shifted off
  the game's own magic-blue so it reads as "this tool," not "this game")
- `--danger`: `#E15C4D` (coral-red — destructive actions: Forget/delete/clear)
- `--text`: `#EAE6DA` (warm off-white, parchment-adjacent, not stark white)
- `--border`: `#384158` (hairline/panel edges)

**Type**: a display face with pixel/bitmap character (e.g. Departure Mono or similar — avoid
Press Start 2P, it's the overused default for "retro game UI") used sparingly for the wordmark and
section headers only; a clean humanist sans (e.g. Inter or IBM Plex Sans) for actual data-entry UI
where legibility matters more than character; tabular-figure monospace (IBM Plex Mono or the same
display face) for numeric stat fields and ids, so columns of numbers align.

**Layout concept**: not a generic sidebar-dashboard SPA. Landing screen = a "load a save" moment
styled like a save-slot picker (drop a file, see it resolve into a party-roster card — character
names/levels, no fabricated portraits). Editor = a grid of bordered "status window" panels
(party rail + detail panel), echoing the game's own status-menu layout, since that's the actual
structure of the data being edited — this is a structural choice justified by the content, not
decoration for its own sake.

**Signature element**: a consistent corner-notched "window frame" panel component (bordered card
with clipped/notched corners, evoking SNES dialogue-box chrome) used for every panel in the UI —
the one unifying, memorable visual motif tying the whole interface back to its subject without
copying game assets. Pair with a small `▶` cursor glyph for active nav/list-selection state
instead of a generic highlight bar, echoing the classic menu pointer.

Spend the "boldness budget" on the window-frame motif and the cursor glyph; keep everything else
(spacing, form controls, data density) restrained and functional — this is a tool people will use
for precise editing, not a game menu to admire.

## Open questions for whoever picks this up

- Framework choice for `src/ui/` (plain TS vs. Preact/Svelte/React) — no format-driven constraint,
  pick based on the UI build's needs.
- Whether to vendor a JS Rijndael-256 implementation or hand-port the reference algorithm —
  evaluate available libraries first; only hand-roll if nothing suitable exists.
- Whether "save" should offer a Web File System Access API path (in-place overwrite, Chromium-only)
  in addition to a universal download-a-file fallback.
