package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.AuthenticationResponse;
import com.example.biosyncapi.model.Token;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.repository.TokenRepository;
import com.example.biosyncapi.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthenticationServiceImpl {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServiceImpl jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenRepository tokenRepository;

    public AuthenticationServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtServiceImpl jwtService, AuthenticationManager authenticationManager, TokenRepository tokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.tokenRepository = tokenRepository;
    }

    public User register(User request){

        if(userRepository.existsByUsercode(request.getUsercode())){
            throw new IllegalArgumentException("Usercode already exists");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setUsercode(request.getUsercode());
        user.setSuffix(request.getSuffix());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        user = userRepository.save(user);

        return user;
    }

    public AuthenticationResponse authenticate(User request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid username or password", e);
        }


        User user = userRepository
                .findByUsercode(request.getUsercode())
                .orElseThrow();

        String jwt = jwtService.generateToken(user);

        revokeAllTokenByUser(user);

        saveUserToken(jwt, user);

        String role = String.valueOf(user.getRole());

        return new AuthenticationResponse(jwt, role);
    }

    private void revokeAllTokenByUser(User user) {
        List<Token> validTokenListByUser = tokenRepository.findAllTokenByUser(
                user.getId()
        );

        if(!validTokenListByUser.isEmpty()){
            validTokenListByUser.forEach(token -> token.setLoggedOut(true));
        }

        tokenRepository.saveAll(validTokenListByUser);
    }

    private void saveUserToken(String jwt, User user) {
        Token token = new Token();
        token.setToken(jwt);
        token.setLoggedOut(false);
        token.setUser(user);
        tokenRepository.save(token);
    }
}
