const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

type Entry = {
  count: number;
  windowStart: number;
};

const store = new Map<string, Entry>();

export const rateLimit = (key: string) => {
  const now = Date.now();
  const current = store.get(key);
  if (!current || now - current.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  current.count += 1;
  store.set(key, current);
  return { allowed: true, remaining: MAX_REQUESTS - current.count };
};

