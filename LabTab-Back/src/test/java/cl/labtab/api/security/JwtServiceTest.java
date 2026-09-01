package cl.labtab.api.security;

import cl.labtab.api.models.Person;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    private static final String SECRET = "NHgAqvIIPq2Qtem/Z6gLjZZvooi3iDxGuUc3/6Dfrko=";

    private Person person(UUID id) {
        Person person = mock(Person.class);
        when(person.getId()).thenReturn(id);
        when(person.getEmail()).thenReturn("test@example.com");
        return person;
    }

    @Test
    void extractType_distinguishesAccessAndRefresh() {
        JwtService jwt = new JwtService(SECRET, 14400, 604800);
        String access = jwt.generateAccessToken(person(UUID.randomUUID()), UUID.randomUUID(), "MANAGER");
        String refresh = jwt.generateRefreshToken(person(UUID.randomUUID()));

        assertThat(jwt.extractType(access)).isEqualTo("access");
        assertThat(jwt.extractType(refresh)).isEqualTo("refresh");
    }

    @Test
    void extractJti_returnsNonBlankJtiForRefreshTokens() {
        JwtService jwt = new JwtService(SECRET, 14400, 604800);
        String refresh = jwt.generateRefreshToken(person(UUID.randomUUID()));

        assertThat(jwt.extractJti(refresh)).isNotBlank();
    }

    @Test
    void isTokenExpired_returnsTrueForExpiredToken() {
        JwtService jwt = new JwtService(SECRET, -3600, 604800);
        String expired = jwt.generateAccessToken(person(UUID.randomUUID()), UUID.randomUUID(), "MANAGER");

        assertThat(jwt.isTokenExpired(expired)).isTrue();
    }

    @Test
    void isTokenExpired_returnsFalseForValidToken() {
        JwtService jwt = new JwtService(SECRET, 14400, 604800);
        String token = jwt.generateAccessToken(person(UUID.randomUUID()), UUID.randomUUID(), "MANAGER");

        assertThat(jwt.isTokenExpired(token)).isFalse();
    }
}
