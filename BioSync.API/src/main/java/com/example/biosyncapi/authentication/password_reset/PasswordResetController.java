package com.example.biosyncapi.authentication.password_reset;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.biosyncapi.user.User;
import com.example.biosyncapi.user.UserRepository;

@RestController
@RequestMapping("api/v1/password")
public class PasswordResetController {

  private final PasswordResetService passwordResetService;
  private final UserRepository userRepository;

  public PasswordResetController(PasswordResetService passwordResetService, UserRepository userRepository) {
    this.userRepository = userRepository;
    this.passwordResetService = passwordResetService;
  }

  @PostMapping("/forgot")
  public ResponseEntity<?> processForgotPassword(@RequestParam String email) {
    User user = userRepository.findByEmail(email);

    if (user == null)
      return ResponseEntity.badRequest().body("Email not found.");

    String token = passwordResetService.createPasswordResetToken(user);
    passwordResetService.sendPasswordResetToken(user, token);

    return ResponseEntity.ok().body("Password reset email sent.");
  }

  @PostMapping("/reset")
  public ResponseEntity<?> passwordReset(
      @RequestParam String token,
      @RequestParam String newPassword) {

    if (!passwordResetService.validatePasswordResetToken(token)) {
      return ResponseEntity.badRequest().body("Invalid or expired token.");
    }

    passwordResetService.resetPassword(token, newPassword);
    return ResponseEntity.ok().body("Password reset successful");
  }
}
