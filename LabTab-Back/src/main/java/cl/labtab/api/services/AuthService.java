package cl.labtab.api.services;

import cl.labtab.api.dtos.request.GuestSessionRequest;
import cl.labtab.api.dtos.request.LoginRequest;
import cl.labtab.api.dtos.request.RefreshTokenRequest;
import cl.labtab.api.dtos.response.AuthResponse;
import cl.labtab.api.dtos.response.GuestSessionResponse;
import cl.labtab.api.dtos.response.LogoutResponse;
import cl.labtab.api.dtos.response.RefreshTokenResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    RefreshTokenResponse refresh(RefreshTokenRequest request);

    LogoutResponse logout();

    GuestSessionResponse guestSession(GuestSessionRequest request);
}
