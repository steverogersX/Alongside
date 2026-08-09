type Entry<V> = { value: V; expiresAt: number };

/**
 * Small in-process TTL cache. In-process is the right scope while there is one
 * server: nothing here is worth a network hop, and a second instance would
 * bring its own cache along with the Redis work that makes that safe.
 */
export function createCache<V>(options: { ttlMs: number; max: number }) {
  const entries = new Map<string, Entry<V>>();
  let hits = 0;
  let misses = 0;

  function get(key: string): V | undefined {
    const entry = entries.get(key);

    if (!entry) {
      misses += 1;
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      entries.delete(key);
      misses += 1;
      return undefined;
    }

    // Re-insert so the oldest key is always the least recently used.
    entries.delete(key);
    entries.set(key, entry);
    hits += 1;

    return entry.value;
  }

  function set(key: string, value: V) {
    if (entries.size >= options.max) {
      const oldest = entries.keys().next().value;
      if (oldest !== undefined) entries.delete(oldest);
    }

    entries.set(key, { value, expiresAt: Date.now() + options.ttlMs });
  }

  return {
    get,
    set,
    async wrap(key: string, load: () => Promise<V>) {
      const cached = get(key);
      if (cached !== undefined) return cached;

      const value = await load();
      set(key, value);
      return value;
    },
    delete: (key: string) => entries.delete(key),
    clear: () => entries.clear(),
    stats: () => ({ size: entries.size, hits, misses }),
  };
}
