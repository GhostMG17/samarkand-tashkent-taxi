package com.uz.taxi.samarkand_tashkent.config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();

        // Открытые пути проходят без проверки токена
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        // Нет заголовка или не Bearer — пропускаем дальше,
        // Spring Security сам решит нужна ли аутентификация
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7).trim();

        // Пустой токен после "Bearer "
        if (jwt.isEmpty()) {
            writeError(response, HttpStatus.UNAUTHORIZED, "Token is empty");
            return;
        }

        try {
            String userPhone = jwtService.extractUsername(jwt);

            if (userPhone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userPhone);
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    writeError(response, HttpStatus.UNAUTHORIZED, "Invalid token");
                    return;
                }
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException ex) {
            log.debug("Expired JWT: {}", ex.getMessage());
            writeError(response, HttpStatus.UNAUTHORIZED, "Token expired");
        } catch (JwtException ex) {
            log.debug("Invalid JWT: {}", ex.getMessage());
            writeError(response, HttpStatus.UNAUTHORIZED, "Invalid token");
        } catch (Exception ex) {
            log.error("Authentication error", ex);
            writeError(response, HttpStatus.UNAUTHORIZED, "Authentication failed");
        }
    }

    /**
     * Открытые пути - без проверки токена.
     */
    private boolean isPublicPath(String path) {
        return path.equals("/api/auth/register")
                || path.equals("/api/auth/login")
                || path.equals("/error")
                || path.startsWith("/swagger")
                || path.startsWith("/v3/api-docs")
                || (path.startsWith("/api/trips") && !path.contains("/my"));
    }

    /**
     * Возвращает чистый JSON с ошибкой, без stack trace.
     */
    private void writeError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String escapedMessage = message.replace("\"", "\\\"");

        String json = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\"}",
                LocalDateTime.now(),
                status.value(),
                escapedMessage
        );

        response.getWriter().write(json);
    }
}