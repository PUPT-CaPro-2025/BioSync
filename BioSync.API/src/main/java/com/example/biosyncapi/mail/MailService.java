package com.example.biosyncapi.mail;

import com.example.biosyncapi.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;
  
    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendMail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("BioSync <"+ from + ">");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    public void autoSendCredentials(HashMap<User, String> credentials) {
        for (Map.Entry<User, String> entry : credentials.entrySet()) {
            User user = entry.getKey();
            String password = entry.getValue();

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("BioSync <" + from + ">");
            message.setTo(user.getEmail());
            message.setSubject("BioSync Account Credentials");

            String emailBody = String.format("""
            Hello! Welcome to BioSync. Please save your account credentials below:
            
            Usercode: %s \n
            Password: %s \n
            """, user.getUsercode(), password);

            message.setText(emailBody);

            mailSender.send(message);
        }
    }