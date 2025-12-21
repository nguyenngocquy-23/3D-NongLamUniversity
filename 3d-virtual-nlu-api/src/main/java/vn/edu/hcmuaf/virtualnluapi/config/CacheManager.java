package vn.edu.hcmuaf.virtualnluapi.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Duration;

@ApplicationScoped
public class CacheManager {

    private final Cache<String, Object> cache = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofMinutes(10))
            .recordStats()
            .build();

    public <T> T get(String key, Class<T> type) {
        return type.cast(cache.getIfPresent(key));
    }

    public void put(String key, Object value) {
        cache.put(key, value);
    }

    public void invalidate(String key) {
        cache.invalidate(key);
    }

    public void clear() {
        cache.invalidateAll();
    }

    public String stats() {
        return cache.stats().toString();
    }
}
