import { useState } from "preact/hooks";
import { SubTabBar } from "../components/SubTabBar.tsx";
import { CheckboxList } from "../components/CheckboxList.tsx";
import { Dropdown } from "../components/Dropdown.tsx";
import { WarningBanner } from "../components/WarningBanner.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as bushido from "../../data/bushido.ts";
import * as blitzes from "../../data/blitzes.ts";
import * as dances from "../../data/dances.ts";
import * as lores from "../../data/lores.ts";
import * as rages from "../../data/rages.ts";
import * as characterRoster from "../../data/characterRoster.ts";
import type { SaveFile } from "../../model/saveFile.ts";
import type { Character } from "../../model/character.ts";

type SubTabKey = "bushido" | "blitz" | "dances" | "lore" | "rage";

interface SkillConfig {
  key: SubTabKey;
  label: string;
  emoji: string;
  all: { id: number; name: string }[];
  contentIdOffset: number;
  ownerJobId: number;
}

// Each skill type's canonical owner is auto-detected by jobId, with a
// manual override — this is HANDOFF's documented fix for issue #8 (the
// original bug used the save-slot `id`, which shifts with Three Scenarios
// recruitment order, instead of the stable `jobId`).
const CONFIGS: SkillConfig[] = [
  {
    key: "bushido",
    label: "Bushido",
    emoji: "🗡️",
    all: bushido.All,
    contentIdOffset: bushido.ContentIdOffset,
    ownerJobId: characterRoster.SkillOwnerJobId.Bushido,
  },
  {
    key: "blitz",
    label: "Blitz",
    emoji: "👊",
    all: blitzes.All,
    contentIdOffset: blitzes.ContentIdOffset,
    ownerJobId: characterRoster.SkillOwnerJobId.Blitz,
  },
  {
    key: "dances",
    label: "Dances",
    emoji: "💃",
    all: dances.All,
    contentIdOffset: dances.ContentIdOffset,
    ownerJobId: characterRoster.SkillOwnerJobId.Dance,
  },
  {
    key: "lore",
    label: "Lore",
    emoji: "📖",
    all: lores.All,
    contentIdOffset: lores.ContentIdOffset,
    ownerJobId: characterRoster.SkillOwnerJobId.Lore,
  },
  {
    key: "rage",
    label: "Rage",
    emoji: "👹",
    all: rages.All,
    contentIdOffset: rages.ContentIdOffset,
    ownerJobId: characterRoster.SkillOwnerJobId.Rages,
  },
];

const NOT_DETECTED = -1;

// The roster's own englishName for a job — display-only, never used to
// find a character (see findAutoOwner for why).
function ownerDisplayName(jobId: number): string | undefined {
  return characterRoster.All.find((r) => r.jobId === jobId && !r.isNpc)?.englishName;
}

// jobId is the stable identifier (per HANDOFF: the save's own `id` shifts
// with Three Scenarios recruitment order and must never be used for
// identity) — so matching must go through the SAVE's characters by their
// own jobId field, never through the static roster table's id. An earlier
// version of this function did exactly the id-based lookup HANDOFF warns
// against, which is exactly why Rage picked "??????" (roster id 24) instead
// of the save's actual Gau, and Bushido picked Celes instead of Cyan — this
// save's own character ids don't match the roster table's assumed order.
//
// jobId alone still isn't quite enough: several jobIds are shared with
// NPCs (jobId 11 — Dance's owner, Mog — is also shared by nine NPC
// moogles, all of whom appear as full character entries in the save). The
// tiebreaker is ability data: every real playable character's abilityList
// is seeded with all spell slots (never empty), while these NPC entries
// have a completely empty abilityList. Prefer whichever jobId-matching
// candidate has the most ability entries.
function findAutoOwner(characters: readonly Character[], jobId: number): Character | undefined {
  const candidates = characters.filter((c) => c.jobId === jobId);
  if (candidates.length === 0) return undefined;
  return candidates.reduce((best, c) =>
    c.abilities.allAbilities().length > best.abilities.allAbilities().length ? c : best,
  );
}

export function SkillsTab({ save }: { save: SaveFile }) {
  const [sub, setSub] = useState<SubTabKey>("bushido");
  const [overrides, setOverrides] = useState<Partial<Record<SubTabKey, number>>>({});
  const forceUpdate = useForceUpdate();

  const config = CONFIGS.find((c) => c.key === sub)!;
  const characters = save.userData.characters;

  const autoOwner = findAutoOwner(characters, config.ownerJobId);

  const selectedId = overrides[sub] ?? autoOwner?.id ?? NOT_DETECTED;
  const character = characters.find((c) => c.id === selectedId);

  return (
    <div>
      <SubTabBar tabs={CONFIGS} active={sub} onSelect={setSub} />
      <Dropdown
        label="Character"
        value={selectedId}
        options={[
          { value: NOT_DETECTED, label: "Not detected!" },
          ...characters.map((c) => ({ value: c.id, label: `${c.name} (id ${c.id})` })),
        ]}
        onChange={(v) => setOverrides((o) => ({ ...o, [sub]: Number(v) }))}
      />
      <div style={{ height: "0.9rem" }} />
      {!character ? (
        <WarningBanner tone="info">
          {ownerDisplayName(config.ownerJobId) ?? "This character"} wasn't auto-detected in this save —
          that's expected if they haven't joined your party yet. Pick a character above once
          they've joined, or manually select one now.
        </WarningBanner>
      ) : (
        <CheckboxList
          items={config.all}
          isChecked={(id) => character.abilities.knowsAbility(id)}
          onToggle={(id) => {
            if (character.abilities.knowsAbility(id)) character.abilities.forgetSkill(id);
            else character.abilities.learnSkill(id, config.contentIdOffset);
            forceUpdate();
          }}
          onSetAll={(ids, checked) => {
            for (const id of ids) {
              if (checked) character.abilities.learnSkill(id, config.contentIdOffset);
              else character.abilities.forgetSkill(id);
            }
            forceUpdate();
          }}
        />
      )}
    </div>
  );
}
