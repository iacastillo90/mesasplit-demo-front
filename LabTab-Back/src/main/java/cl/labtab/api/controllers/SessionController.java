package cl.labtab.api.controllers;

import cl.labtab.api.common.ApiResponse;
import cl.labtab.api.dtos.request.AddGuestRequest;
import cl.labtab.api.dtos.request.CreateSessionRequest;
import cl.labtab.api.dtos.request.SessionStatusRequest;
import cl.labtab.api.dtos.response.GuestResponse;
import cl.labtab.api.dtos.response.SessionResponse;
import cl.labtab.api.services.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<SessionResponse>> create(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(sessionService.createSession(request)));
    }

    @GetMapping("/{sessionId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF','GUEST')")
    public ApiResponse<SessionResponse> get(@PathVariable UUID sessionId) {
        return ApiResponse.of(sessionService.getSession(sessionId));
    }

    @PatchMapping("/{sessionId}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    public ApiResponse<SessionResponse> updateStatus(@PathVariable UUID sessionId, @Valid @RequestBody SessionStatusRequest request) {
        return ApiResponse.of(sessionService.updateSessionStatus(sessionId, request));
    }

    @PostMapping("/{sessionId}/guests")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<GuestResponse>> addGuest(@PathVariable UUID sessionId, @Valid @RequestBody AddGuestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(sessionService.addGuest(sessionId, request)));
    }
}
