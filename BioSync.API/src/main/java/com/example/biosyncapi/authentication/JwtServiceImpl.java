package com.example.biosyncapi.authentication;

import com.example.biosyncapi.user.User;
import com.example.biosyncapi.authentication.token.TokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtServiceImpl {

  @Value("${app.secret.key}")
  private String secretKey;
  private final TokenRepository tokenRepository;

  public JwtServiceImpl(TokenRepository tokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  String generateToken(User user) {
    return Jwts
        .builder()
        .subject(user.getUsercode())
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(
            new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000))
        .signWith(getSigningKey())
        .compact();
  }

  private SecretKey getSigningKey() {
    byte[] keyBytes = Decoders.BASE64URL.decode(secretKey);

    return Keys.hmacShaKeyFor(keyBytes);
  }

  private Claims getClaimsFromToken(String token) {
    return Jwts
        .parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  <T> T extractClaims(
      String token,
      Function<Claims, T> claimsResolver)
  {
    Claims claims = getClaimsFromToken(token);
    return claimsResolver.apply(claims);
  }

  public String extractUsercode(String token) {
    return extractClaims(token, Claims::getSubject);
  }

  public boolean isValid(
      String token,
      UserDetails user)
  {
    String username = extractUsercode(token);
    boolean isValidToken = tokenRepository
        .findByToken(token)
        .map(t -> !t.isLoggedOut()).orElse(false);

    return (username.equals(user.getUsername()))
        && !isTokenExpired(token) && isValidToken;
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Date extractExpiration(String token) {
    return extractClaims(token, Claims::getExpiration);
  }
}
