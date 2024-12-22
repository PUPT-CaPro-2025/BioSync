package com.example.biosyncapi.authentication.password_reset;

import com.example.biosyncapi.mail.MailService;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.user.UserRepository;

import java.util.Date;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.UUID;

import jakarta.mail.MessagingException;
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

  public PasswordResetService(PasswordResetRepository tokenRepository,
                              UserRepository userRepository,
                              MailService mailService,
                              PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.mailService = mailService;
    this.passwordEncoder = passwordEncoder;
  }

  public String createPasswordResetToken(User user) {
    PasswordResetToken existingToken = tokenRepository.findByUser(user);

    if (existingToken != null) {
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

  public void sendPasswordResetToken(User user, String token) throws MessagingException {
    String resetUrl = origin + "/reset-password?token=" + token;
    String subject = "Reset your password for BioSync";

    String text = String.format("""
            <!DOCTYPE html>
            <html xmlns='http://www.w3.org/1999/xhtml'>
            <head>
              <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
              <meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum=1'>
              <meta http-equiv='X-UA-Compatible' content='IE=Edge'>
            </head>
            <body style="font-family: 'Poppins', Arial, Helvetica, sans-serif; font-size: 14px; color: #000; background-color: #f6f7f8;">
              <center style="width: 100%; table-layout: fixed;">
                <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                  <img src="https://pupt.biosyncapp.site/assets/BioSyncLogo_WithoutText.png" alt="BioSync" width="100" style="margin-bottom: 20px;">
                  <h2 style="color: #68191F; font-size: 24px; margin-bottom: 10px;">We got your back!</h2>
                  <p style="margin-bottom: 20px;">You have requested to reset your password for your <strong style="color: #68191F;">BioSync</strong> account.</p>
                  <p style="margin-bottom: 20px;">Click the button below to set your new password:</p>
                  <a href="%s" style="display: inline-block; background-color: #68191F; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-size: 16px;">Change Password</a>
                  <p style="margin-top: 20px; margin-bottom: 10px;">If the button doesn’t work, copy and paste this link into your browser:</p>
                  <p style="word-break: break-word; color: #0074a6;">%s</p>
                  <p style="margin-top: 30px; font-size: 12px; color: #555;">If you did not request this, please ignore this email. Your account security remains unchanged.</p>
                  <p style="margin-top: 10px; font-size: 12px; color: #555;">Need help? Contact us at <a href="mailto:pupt.biosync+support@gmail.com" style="color: #0074a6;">pupt.biosync+support@gmail.com</a>.</p>
                </div>
              </center>
            </body>
            </html>
            """, resetUrl, resetUrl);

    mailService.sendMail(user.getEmail(), subject, text);
  }

  public boolean validatePasswordResetToken(String token) {
    PasswordResetToken passToken = tokenRepository.findByToken(token);

    if (passToken == null) {
      return false;
    }

    return !passToken.getExpiryDate().before(new Date());
  }

  public void resetPassword(String token, String newPassword) {
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
