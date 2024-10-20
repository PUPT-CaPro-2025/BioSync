package com.example.biosyncapi.authentication;

public class AuthenticationResponse {

    private String token;

    private String role;

    private String userId;

    public AuthenticationResponse(String token, String role, String userId) {
        this.token = token;
        this.role = role;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public String getRole() { return role; }

    public String getUserId() { return userId; }
}
