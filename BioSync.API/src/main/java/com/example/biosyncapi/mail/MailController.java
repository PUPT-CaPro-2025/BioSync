package com.example.biosyncapi.mail;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/mail")
public class MailController {

  private final MailService mailService;

  public MailController(MailService mailService) {
    this.mailService = mailService;
  }

  @PostMapping("/send")
  public ResponseEntity<?> sendMessage(@RequestBody Mail mail) {
    try {
      mailService.sendMail(mail.getTo(), mail.getSubject(), mail.getText());
      return ResponseEntity.ok("Email sent successfully to " + mail.getTo());
    } catch (Exception e) {
      return ResponseEntity.status(500).body(e.getMessage());
    }

  }

}
