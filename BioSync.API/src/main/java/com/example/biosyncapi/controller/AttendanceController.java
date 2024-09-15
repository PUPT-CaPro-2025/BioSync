package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.User;
import com.example.biosyncapi.service.FingerprintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("api/v1/attendance")
public class AttendanceController {

    private final FingerprintService fingerprintService;

    public AttendanceController(FingerprintService fingerprintService) {
        this.fingerprintService = fingerprintService;
    }

    @PostMapping("/verify/start")
    public ResponseEntity<?> verifyProfessorFingerprintForAttendance(
            @RequestParam("userId") Long userId,
            @RequestParam("fingerprint") MultipartFile fingerprint
    ) throws IOException {
        Boolean match = fingerprintService.verifyProfessorFingerprintForAttendance(userId,fingerprint);

        if (match) return ResponseEntity.ok("Fingerprint verified.");

        return ResponseEntity.status(401).body("Fingerprint verification failed.");
    }

    @PostMapping("/student/check-in")
    public ResponseEntity<?> verifyStudentTimeInAttendance(
            @RequestParam("sectionId") Long sectionId,
            @RequestParam("fingerprint") MultipartFile fingerprint
    ) throws IOException {

        User student = fingerprintService.verifyStudentFingerprintForAttendance(sectionId,fingerprint);

        if (student == null) return ResponseEntity.status(401).body("Fingerprint verification failed.");

        return ResponseEntity.ok().body(Map.of("message", "Fingerprint verified.", "student", student));
    }
}
