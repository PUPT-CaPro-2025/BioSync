package com.example.biosyncapi.authentication.password_reset;

import com.example.biosyncapi.mail.MailService;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.user.UserRepository;

import java.util.Date;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetService {

  private final PasswordResetRepository tokenRepository;
  private final UserRepository userRepository;
  private final MailService mailService;
  private final PasswordEncoder passwordEncoder;
  private static final int EXPIRY_TIME_IN_MINUTES = 24 * 60;
  @Value("${cors.allowed.origins}")
  private String origin;

  public PasswordResetService(
      PasswordResetRepository tokenRepository,
      UserRepository userRepository,
      MailService mailService,
      PasswordEncoder passwordEncoder)
  {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.mailService = mailService;
    this.passwordEncoder = passwordEncoder;
  }

  public String createPasswordResetToken(User user) {
    PasswordResetToken hasExistingToken = tokenRepository.findByUser(user);

    if (hasExistingToken != null) {
      tokenRepository.deleteByUser(user);
    }

    String token = UUID.randomUUID().toString();

    PasswordResetToken resetToken = new PasswordResetToken();
    resetToken.setToken(token);
    resetToken.setUser(user);
    resetToken.setExpiryDate(getExpiryDate());

    tokenRepository.save(resetToken);
    return token;
  }

  public void sendPasswordResetToken(
      User user,
      String token)
  {
    String resetUrl = origin + "/reset-password?token=" + token;
    String subject = "Password Reset Request";
    String text = "Click the link to reset your password: " + resetUrl;

    mailService.sendMail(user.getEmail(), subject, text);
  }

  public boolean validatePasswordResetToken(String token) {
    PasswordResetToken passToken = tokenRepository.findByToken(token);

    if (passToken == null) {
      return false;
    }

    return !passToken.getExpiryDate().before(new Date());
  }

  public void resetPassword(
      String token,
      String newPassword)
  {
    PasswordResetToken resetToken = tokenRepository.findByToken(token);

    if (resetToken == null || resetToken.getExpiryDate().before(new Date())) {
      throw new RuntimeException("Invalid or expired token.");
    }

    User user = resetToken.getUser();
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
    tokenRepository.delete(resetToken);
  }


  private Date getExpiryDate() {
    Calendar cal = Calendar.getInstance();
    cal.setTime(new Timestamp(cal.getTime().getTime()));
    cal.add(Calendar.MINUTE, EXPIRY_TIME_IN_MINUTES);
    return new Date(cal.getTime().getTime());
  }
}
