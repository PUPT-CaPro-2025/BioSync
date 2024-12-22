package com.example.biosyncapi.mail;

import com.example.biosyncapi.user.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    public void sendMail(String to, String subject, String text) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        helper.setFrom("BioSync <" + from + ">");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);

        mailSender.send(message);
    }

    public void autoSendCredentials(HashMap<User, String> credentials) throws MessagingException {
        for (Map.Entry<User, String> entry : credentials.entrySet()) {
            User user = entry.getKey();
            String password = entry.getValue();

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("BioSync <" + from + ">");
            helper.setTo(user.getEmail());
            helper.setSubject("Get Started with BioSync");

            String emailBody = String.format("""
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
                    .code-block {
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
                    p {
                        margin: 0;
                        padding: 0;
                    }
                    table.wrapper {
                        width: 100% !important;
                        table-layout: fixed;
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
                    }
                </style>
            </head>
            <body>
                <center class='wrapper' style='font-size: 14px; font-family: Arial, Helvetica, sans-serif; color: #000; background-color: #f6f7f8;'>
                    <div class='webkit'>
                        <table cellpadding='0' cellspacing='0' border='0' width='100%' class='wrapper' bgcolor='#f6f7f8'>
                            <tr>
                                <td valign='top' bgcolor='#f6f7f8' width='100%'>
                                    <table width='100%' align='center' cellpadding='0' cellspacing='0' border='0'>
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
                                                                    <td style='padding: 15px 0 10px;' align='center'>
                                                                        <img class='max-width' src='https://pupt.biosyncapp.site/assets/BioSyncLogo_WithoutText.png' alt='' width='100'>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style='padding: 18px;' align='center'>
                                                                        <div class='title' style='text-align: center;'>
                                                                            Welcome to <span style='color: #68191F;'>BioSync</span>!
                                                                        </div>
                                                                        <div style='text-align: center; margin-top: 1rem;'>
                                                                            <p>We’re thrilled to have you on board! This platform offers a seamless way to manage attendance and scheduling with ease and precision.</p>
                                                                        </div>
                                                                        <div style='text-align: center; margin-top: 2.5rem;'>
                                                                            <p>Here are your account credentials:</p>
                                                                        </div>
                                                                        <div style='text-align: center; margin-top: 1rem;'>
                                                                            <p><strong>Username:</strong> Usercode: %s</p>
                                                                            <p><strong>Password:</strong> Password: %s</p>
                                                                        </div>
                                                                        <div style='text-align: center; margin-top: 2rem;'>
                                                                            <p>You may log in to your account at 
                                                                                <a href='https://pupt.biosyncapp.site' style='color: #68191F;'>https://pupt.biosyncapp.site</a> 
                                                                                to explore and make the most out of the features available.
                                                                            </p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style='padding: 10px 0;' align='center'></td>
                                                                </tr>
                                                                <tr>
                                                                    <td style='padding: 30px 50px; background-color: #f6f7f8;' align='center'>
                                                                        <div style='text-align: center;'>
                                                                            <span class='contact-text'>Need a hand? 👋</span>
                                                                        </div>
                                                                        <div style='text-align: center;'>
                                                                            <span class='contact-text'>If you have any questions or need help,</span>
                                                                        </div>
                                                                        <div style='text-align: center;'>
                                                                            <span class='contact-text'>you can reach us at 
                                                                                <a href='mailto:pupt.biosync+support@gmail.com'>pupt.biosync+support@gmail.com</a>.
                                                                            </span>
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
            """, user.getUsercode(), password);

            helper.setText(emailBody, true);

            mailSender.send(message);
        }
    }
}
