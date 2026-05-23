package com.uz.taxi.samarkand_tashkent.config;

import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();
        String ip = extractClientIp(request);

        Bucket bucket = selectBucket(path, ip);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            writeTooManyRequests(response, path);
        }
    }

    private Bucket selectBucket(String path, String ip) {
        if (path.equals("/api/auth/login")) {
            return rateLimitService.resolveLoginBucket(ip);
        }
        if (path.equals("/api/auth/register")) {
            return rateLimitService.resolveRegisterBucket(ip);
        }
        return rateLimitService.resolveGeneralBucket(ip);
    }

    /**
     * Извлекает реальный IP клиента.
     * Учитывает X-Forwarded-For — пригодится когда будет nginx/CDN на проде.
     */
    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private void writeTooManyRequests(HttpServletResponse response, String path) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", "60");

        String message = "Too many requests. Please try again later.";
        if (path.equals("/api/auth/login")) {
            message = "Too many login attempts. Please wait 1 minute and try again.";
        } else if (path.equals("/api/auth/register")) {
            message = "Too many registration attempts. Please try again later.";
        }

        String json = String.format(
                "{\"timestamp\":\"%s\",\"status\":429,\"error\":\"%s\"}",
                LocalDateTime.now(),
                message.replace("\"", "\\\"")
        );

        response.getWriter().write(json);
    }
}