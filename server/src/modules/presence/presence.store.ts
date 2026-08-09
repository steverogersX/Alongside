export type Activity = "viewing" | "editing";

export type PresenceEntry = {
  key: string;
  name: string;
  avatarSeed: string;
  kind: "member" | "guest" | "agent";
  activity: Activity;
  lastSeen: number;
};

const TTL_MS = 30_000;
const SWEEP_MS = 60_000;

const rooms = new Map<string, Map<string, PresenceEntry>>();

function live(room: Map<string, PresenceEntry>) {
  const cutoff = Date.now() - TTL_MS;

  for (const [key, entry] of room) {
    if (entry.lastSeen < cutoff) room.delete(key);
  }

  return room;
}

export const presenceStore = {
  touch(documentId: string, entry: Omit<PresenceEntry, "lastSeen">) {
    const room = rooms.get(documentId) ?? new Map<string, PresenceEntry>();
    room.set(entry.key, { ...entry, lastSeen: Date.now() });
    rooms.set(documentId, room);
    return this.list(documentId, entry.key);
  },

  list(documentId: string, selfKey?: string) {
    const room = rooms.get(documentId);
    if (!room) return [];

    return [...live(room).values()]
      .map((entry) => ({ ...entry, isYou: entry.key === selfKey }))
      .sort((a, b) => {
        if (a.isYou !== b.isYou) return a.isYou ? -1 : 1;
        if (a.kind !== b.kind) return a.kind === "agent" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  },

  leave(documentId: string, key: string) {
    rooms.get(documentId)?.delete(key);
  },
};

const sweep = setInterval(() => {
  for (const [documentId, room] of rooms) {
    if (live(room).size === 0) rooms.delete(documentId);
  }
}, SWEEP_MS);

sweep.unref();
