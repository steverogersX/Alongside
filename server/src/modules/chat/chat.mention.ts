const MENTION = /@([\p{L}\p{N}_-]+)/gu;

export function findMentions(body: string) {
  return [...body.matchAll(MENTION)].map((match) => match[1]!.toLowerCase());
}

export function stripMention(body: string, name: string) {
  const pattern = new RegExp(`@${name}\\b[,:]?\\s*`, "iu");
  return body.replace(pattern, "").trim();
}

export const firstName = (displayName: string) =>
  displayName.trim().split(/\s+/)[0]!.toLowerCase();
