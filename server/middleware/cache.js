const DEFAULT_TTL_MS = 1000; // 1 second TTL — enough for 100 VUs per second

const cache = new Map();

function clearCache() {
  cache.clear();
}

function invalidatePrefix(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

function memoryCache({ ttl = DEFAULT_TTL_MS, ignoreQuery = true } = {}) {
  return (req, res, next) => {
    if (req.method !== "GET") return next();

    let key = req.originalUrl || req.url;
    if (ignoreQuery) {
      key = key.split("?")[0];
    }
    
    const now = Date.now();
    const entry = cache.get(key);

    if (entry && entry.expiresAt > now) {
      res.set("X-Memory-Cache", "HIT");
      res.type(entry.contentType || "application/json");
      return res.status(200).send(entry.body);
    }

    const originalSend = res.send.bind(res);
    let sentBody = null;
    let capturedType = res.getHeader("content-type");

    res.send = (body) => {
      if (res.statusCode === 200 && body != null) {
        const contentType =
          res.getHeader("content-type") || capturedType || "application/json";
        cache.set(key, {
          body,
          contentType: contentType && typeof contentType === "string"
            ? contentType
            : "application/json",
          expiresAt: now + ttl,
        });
        res.set("X-Memory-Cache", "MISS");
      }
      return originalSend(body);
    };

    next();
  };
}

export default memoryCache;
export { memoryCache, clearCache, invalidatePrefix };
