package com.example.biosyncapi.authentication.password_reset;

import com.example.biosyncapi.user.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRepository extends JpaRepository<PasswordResetToken, Long> {
  PasswordResetToken findByToken(String token);
  PasswordResetToken findByUser(User user);
  @Transactional
  void deleteByUser(User user);
}
