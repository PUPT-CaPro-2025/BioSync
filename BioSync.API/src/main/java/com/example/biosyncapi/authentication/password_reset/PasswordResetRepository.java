package com.example.biosyncapi.authentication.password_reset;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRepository extends JpaRepository<PasswordResetToken, Long> {
  PasswordResetToken findByToken(String token);
}
