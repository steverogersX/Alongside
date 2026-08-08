import { createAvatar } from "@dicebear/core";
import { bottts, notionists } from "@dicebear/collection";

const cache = new Map<string, string>();

function memo(key: string, make: () => string) {
  const hit = cache.get(key);
  if (hit) return hit;
  const uri = make();
  if (cache.size > 400) cache.clear();
  cache.set(key, uri);
  return uri;
}

export function agentMascot(seed: string, size = 48) {
  return memo(`ag:${seed}:${size}`, () =>
    createAvatar(bottts, {
      seed,
      size,
      radius: 25,
      backgroundColor: ["transparent"],
    }).toDataUri()
  );
}

export function humanAvatar(seed: string, size = 48) {
  return memo(`hu:${seed}:${size}`, () =>
    createAvatar(notionists, {
      seed,
      size,
      radius: 50,
      scale: 130,
      translateY: 6,
      backgroundColor: ["transparent"],
    }).toDataUri()
  );
}

export function personAvatar(
  seed: string,
  kind: "human" | "bot" | "agent",
  size = 48
) {
  return kind === "human" ? humanAvatar(seed, size) : agentMascot(seed, size);
}
