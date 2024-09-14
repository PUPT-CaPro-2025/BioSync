package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Fingerprint;
import com.example.biosyncapi.service.FingerprintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/v1/fingerprints")
public class FingerprintController {
    private final FingerprintService fingerprintService;

    public FingerprintController(FingerprintService fingerprintService) {
        this.fingerprintService = fingerprintService;
    }

    @GetMapping("section/{id}")
    public ResponseEntity<List<Fingerprint>> getAllBySectionId(@PathVariable Long id) {
        List<Fingerprint> sectionFingerprints = fingerprintService.getAllBySectionId(id);

        if (!sectionFingerprints.isEmpty()) return ResponseEntity.ok(sectionFingerprints);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("userId") Long userId,
            @RequestParam("fingerprint") List<MultipartFile> fingerprintImage) {
        try{
            fingerprintService.processFingerprints(userId, fingerprintImage);
            return ResponseEntity.ok("Fingerprint uploaded successfully");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
