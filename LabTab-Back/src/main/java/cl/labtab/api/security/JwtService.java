package cl.labtab.api.security;

import cl.labtab.api.models.Person;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final String jwtSecret;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtService(@Value("${jwt.secret}") String jwtSecret,
                      @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
                      @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.jwtSecret = jwtSecret;
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(Person person, UUID branchId, String role) {
        return Jwts.builder()
                .subject(person.getId().toString())
                .claim("personId", person.getId().toString())
                .claim("branchId", branchId.toString())
                .claim("role", role)
                .claim("email", person.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration * 1000))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(Person person) {
        return Jwts.builder()
                .subject(person.getId().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration * 1000))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateGuestToken(UUID guestId, UUID sessionId, UUID branchId) {
        return Jwts.builder()
                .subject(guestId.toString())
                .claim("guestId", guestId.toString())
                .claim("sessionId", sessionId.toString())
                .claim("branchId", branchId.toString())
                .claim("role", "GUEST")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration * 1000))
                .signWith(getSigningKey())
                .compact();
    }

    public UUID extractPersonId(String token) {
        return UUID.fromString(getClaims(token).get("personId", String.class));
    }

    public UUID extractBranchId(String token) {
        return UUID.fromString(getClaims(token).get("branchId", String.class));
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public UUID extractSessionId(String token) {
        return UUID.fromString(getClaims(token).get("sessionId", String.class));
    }

    public String extractSubject(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, Person person) {
        Claims claims = getClaims(token);
        return person.getId().toString().equals(claims.getSubject())
                && claims.getExpiration().after(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}
