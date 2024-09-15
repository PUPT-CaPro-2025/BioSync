package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Fingerprint;
import com.example.biosyncapi.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FingerprintService {
    List<Fingerprint> getAllBySectionId(Long sectionId);
    void processFingerprints(Long userId, List<MultipartFile> images);
    Boolean verifyProfessorFingerprintForAttendance(Long professorId, MultipartFile image) throws IOException;
    User verifyStudentFingerprintForAttendance(Long sectionId, MultipartFile image) throws IOException;
}
