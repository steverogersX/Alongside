export type Viewer = {
  key: string;
  name: string;
  avatarSeed: string;
  kind: "member" | "guest" | "agent";
  activity: "viewing" | "editing";
  isYou: boolean;
  lastSeen: number;
};

const TYPING_WINDOW_MS = 10_000;

let lastTypedAt = 0;

export function reportTyping() {
  lastTypedAt = Date.now();
}

export function currentActivity(): Viewer["activity"] {
  return Date.now() - lastTypedAt < TYPING_WINDOW_MS ? "editing" : "viewing";
}
