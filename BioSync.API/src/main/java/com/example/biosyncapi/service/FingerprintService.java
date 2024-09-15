package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Fingerprint;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FingerprintService {
    List<Fingerprint> getAllBySectionId(Long sectionId);
    void processFingerprints(Long userId, List<MultipartFile> images);
}
