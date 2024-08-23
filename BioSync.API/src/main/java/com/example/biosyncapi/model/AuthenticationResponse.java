package com.example.biosyncapi.model;

public class AuthenticationResponse {

    private String token;

    private String role;

    public AuthenticationResponse(String token, String role) {
        this.token = token;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getRole() { return role; }
}
