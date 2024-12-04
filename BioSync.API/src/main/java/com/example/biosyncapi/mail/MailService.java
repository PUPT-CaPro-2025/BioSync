package com.example.biosyncapi.mail;

import com.example.biosyncapi.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.mail.javamail.MimeMessageHelper;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;
  
    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendMail(String to, String subject, String text) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("BioSync <" + from + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true); // true indicates HTML content
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }

        mailSender.send(message);
    }

    public void autoSendCredentials(HashMap<User, String> credentials) {
        for (Map.Entry<User, String> entry : credentials.entrySet()) {
            User user = entry.getKey();
            String password = entry.getValue();

            MimeMessage message = mailSender.createMimeMessage();
            try {
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                helper.setFrom("BioSync <" + from + ">");
                helper.setTo(user.getEmail());
                helper.setSubject("BioSync Account Credentials");

                String emailBody = String.format("""
                <html>
                <body>
                <p>Hello! Welcome to BioSync. Please save your account credentials below:</p>
                <p>Usercode: %s</p>
                <p>Password: %s</p>
                </body>
                </html>
                """, user.getUsercode(), password);

                helper.setText(emailBody, true); // true indicates HTML content
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }

            mailSender.send(message);
        }
    }



}
