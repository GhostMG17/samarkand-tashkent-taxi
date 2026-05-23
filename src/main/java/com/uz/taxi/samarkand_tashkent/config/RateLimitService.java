package com.uz.taxi.samarkand_tashkent.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class RateLimitService {

    private final ConcurrentMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> generalBuckets = new ConcurrentHashMap<>();

    /**
     * Лимит на логин: 5 попыток / минуту с IP
     */
    public Bucket resolveLoginBucket(String key) {
        return loginBuckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.simple(5, Duration.ofMinutes(1)))
                .build());
    }

    /**
     * Лимит на регистрацию: 3 / час с IP
     */
    public Bucket resolveRegisterBucket(String key) {
        return registerBuckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.simple(3, Duration.ofHours(1)))
                .build());
    }

    /**
     * Общий лимит: 60 запросов / минуту с IP
     */
    public Bucket resolveGeneralBucket(String key) {
        return generalBuckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.simple(60, Duration.ofMinutes(1)))
                .build());
    }
}