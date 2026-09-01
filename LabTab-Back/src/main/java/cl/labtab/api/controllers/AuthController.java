package cl.labtab.api.controllers;

import cl.labtab.api.common.ApiResponse;
import cl.labtab.api.dtos.request.GuestSessionRequest;
import cl.labtab.api.dtos.request.LoginRequest;
import cl.labtab.api.dtos.request.LogoutRequest;
import cl.labtab.api.dtos.request.RefreshTokenRequest;
import cl.labtab.api.dtos.response.AuthResponse;
import cl.labtab.api.dtos.response.GuestSessionResponse;
import cl.labtab.api.dtos.response.LogoutResponse;
import cl.labtab.api.dtos.response.RefreshTokenResponse;
import cl.labtab.api.services.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticación", description = "Login, refresh, logout y onboarding de comensal por QR.")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(authService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.of(authService.refresh(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<LogoutResponse>> logout(@RequestBody(required = false) LogoutRequest request) {
        return ResponseEntity.ok(ApiResponse.of(authService.logout(request)));
    }

    @PostMapping("/guest-session")
    public ResponseEntity<ApiResponse<GuestSessionResponse>> guestSession(@Valid @RequestBody GuestSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(authService.guestSession(request)));
    }
}
