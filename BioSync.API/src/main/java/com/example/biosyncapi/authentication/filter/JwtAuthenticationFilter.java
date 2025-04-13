package com.example.biosyncapi.authentication.filter;

import com.example.biosyncapi.authentication.JwtServiceImpl;
import com.example.biosyncapi.authentication.UserDetailsServiceImpl;
import com.example.biosyncapi.authentication.token.Token;
import com.example.biosyncapi.authentication.token.TokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtServiceImpl jwtService;
    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final TokenRepository tokenRepository;

    public JwtAuthenticationFilter(JwtServiceImpl jwtService,
        UserDetailsServiceImpl userDetailsServiceImpl, TokenRepository tokenRepository) {
        this.jwtService = jwtService;
        this.userDetailsServiceImpl = userDetailsServiceImpl;
        this.tokenRepository = tokenRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        Token tokenEntity = tokenRepository.findByToken(token).orElse(null);

        if (tokenEntity != null) {
            boolean isJwtExpired = !jwtService.isValid(token, tokenEntity.getUser());

            if (tokenEntity.isLoggedOut() || isJwtExpired) {
                response.setStatus(419);
                response.getWriter().write("Token is either expired or has been logged out.");
                return;
            }
        }

        String username = jwtService.extractUsercode(token);

        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(username);

            if(jwtService.isValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                authenticationToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
