import { createAvatar } from "@dicebear/core";
import { croodles, bottts } from "@dicebear/collection";

const AGENT_BG = ["e7e1ff", "ded6ff"];
const HUMAN_BG = ["eceae5", "e6e8ea", "eae6e0"];

const cache = new Map<string, string>();

function memo(key: string, make: () => string) {
  const hit = cache.get(key);
  if (hit) return hit;
  const uri = make();
  cache.set(key, uri);
  return uri;
}

export function agentMascot(seed: string, size = 48) {
  return memo(`ag:${seed}:${size}`, () =>
    createAvatar(bottts, {
      seed,
      size,
      radius: 25,
      backgroundColor: AGENT_BG,
    }).toDataUri()
  );
}

export function humanAvatar(seed: string, size = 48) {
  return memo(`hu:${seed}:${size}`, () =>
    createAvatar(croodles, {
      seed,
      size,
      radius: 50,
      backgroundColor: HUMAN_BG,
    }).toDataUri()
  );
}

export function personAvatar(seed: string, kind: "human" | "agent", size = 48) {
  return kind === "agent" ? agentMascot(seed, size) : humanAvatar(seed, size);
}
