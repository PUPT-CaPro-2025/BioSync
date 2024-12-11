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
                              UserRepository userRepository, MailService mailService, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.mailService = mailService;
    this.passwordEncoder = passwordEncoder;
  }

  public String createPasswordResetToken(User user) {
      PasswordResetToken hasExistingToken = tokenRepository.findByUser(user);

      if(hasExistingToken != null) tokenRepository.deleteByUser(user);

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
    String subject = "Password Reset Request";
    String text = """
    <!DOCTYPE html>
    <html xmlns='http://www.w3.org/1999/xhtml'>
    <head>
      <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum=1'>
      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>
      <style type='text/css'>
        body, p, div {
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
          font-size: 14px;
          color: #000;
        }
        body a {
          color: #0074a6;
          text-decoration: none;
        }
        body a:visited {
          color: #0074a6;
          text-decoration: none;
        }
        .code-block, .code-block a {
          background-color: #68191F;
          color: #fff !important;
          border: none;
          border-radius: 6px;
          display: inline-block;
          padding: 16px 24px;
          font-size: 18px;
          margin-top: 2rem;
          text-decoration: none;
        }
        .code-block a:visited {
          color: #fff !important;
          text-decoration: none;
        }
        .code-block a:hover {
          color: #fff !important;
          text-decoration: none;
        }
        .code-block a:active {
          color: #fff !important;
          text-decoration: none;
        }
        p {
          margin: 0;
          padding: 0;
        }
        table.wrapper {
          width: 100% !important;
          table-layout: fixed;
          -webkit-font-smoothing: antialiased;
          -webkit-text-size-adjust: 100%;
          -moz-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        img.max-width {
          max-width: 100% !important;
        }
        .title {
          font-weight: bold;
          font-size: 24px;
        }
        .app-name {
          color: #68191F;
          font-weight: bold;
        }
        .link p {
          font-size: 12px;
        }
        .link-copy, .link-copy:visited {
          color: #0074a6;
          text-decoration: none;
        }
        .contact-text {
          font-size: 12px;
        }
        @media screen and (max-width:480px) {
          table.wrapper-mobile {
            width: 100% !important;
            table-layout: fixed;
          }
          img.max-width {
            height: auto !important;
            max-width: 100% !important;
          }
          .columns, .column {
            width: 100% !important;
            display: block !important;
          }
        }
      </style>
    </head>
    <body>
      <center class='wrapper' style='font-size: 14px; font-family: Arial, Helvetica, sans-serif; color: #000; background-color: #f6f7f8;'>
        <div class='webkit'>
          <table cellpadding='0' cellspacing='0' border='0' width='100%' class='wrapper' bgcolor='#f6f7f8'>
            <tr>
              <td valign='top' bgcolor='#f6f7f8' width='100%'>
                <table width='100%' role='content-container' align='center' cellpadding='0' cellspacing='0' border='0'>
                  <tr>
                    <td width='100%'>
                      <table width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width: 600px;' align='center'>
                        <tr>
                          <td style='padding: 0; color: #000; text-align: left;' bgcolor='#fff' width='100%' align='left'>
                            <table width='100%' border='0' cellpadding='0' cellspacing='0'>
                              <tr>
                                <td style='padding: 0;' height='20px' bgcolor='#68191F'></td>
                              </tr>
                              <tr>
                                <td style='padding: 15px 0 0px;' align='center'>
                                  <img class='max-width' src='https://pupt.biosyncapp.site/assets/BioSyncLogo_WithoutText.png' alt='' width='100'>
                                </td>
                              </tr>
                              <tr>
                                <td style='padding: 10px;' align='center'>
                                  <div class='title' style='text-align: center;'>We got your back!</div>
                                  <div style='text-align: center; margin-top: 1rem;'>
                                    <p>You have requested to reset your password for your <span class='app-name'>BioSync</span> account.</p>
                                  </div>
                                  <div style='text-align: center; margin-top: 2.5rem;'>
                                    <p>Click the button below to set your new password:</p>
                                  </div>
                                  <div style='text-align: center; margin-top: -1rem;'>
                                    <a href='{{resetUrl}}' class='code-block'>Change Password</a>
                                  </div>
                                  <div class='link' style='text-align: center; margin-top: 1rem;'>
                                    <p>or copy and paste this link in your browser</p>
                                    <p class='link-copy'>{{resetUrl}}</p>
                                  </div>
                                  <div class='link' style='text-align: center; margin-top: 1rem;'>
                                    <p>Please note that the validity of this link does expire.</p>
                                  </div>
                                  <div style='text-align: center; margin-top: 3rem;'>
                                    <p>If you did not request this, please ignore this email. Your account security remains unchanged.</p>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style='padding: 10px 0;' align='center'></td>
                              </tr>
                              <tr>
                                <td style='padding: 30px 50px; background-color: #f6f7f8;' align='center'>
                                  <div style='text-align: center;'>
                                    <span class='contact-text'>Need a hand? 👋 </span>
                                  </div>
                                  <div style='text-align: center;'>
                                    <span class='contact-text'>If you have any questions or need help,</span>
                                  </div>
                                  <div style='text-align: center;'>
                                    <span class='contact-text'>you can reach us at <a href='mailto:pupt.biosync+support@gmail.com'>pupt.biosync+support@gmail.com</a>.</span>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </center>
    </body>
    </html>
    """;

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
