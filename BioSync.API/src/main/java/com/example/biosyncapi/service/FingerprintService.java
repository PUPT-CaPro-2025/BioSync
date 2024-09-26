package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Fingerprint;
import com.example.biosyncapi.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FingerprintService {
    List<Fingerprint> getAllByUserId(Long userId);
    void processFingerprints(Long userId, List<MultipartFile> images);
    void processFingerprintsToBucket(Long userId, List<MultipartFile> images) throws IOException;
    Boolean verifyProfessorFingerprintForAttendance(Long professorId, MultipartFile image) throws IOException;
    User verifyProfessorFingerprintForAttendanceInBucket(Long professorId, MultipartFile image) throws IOException;
    User verifyStudentFingerprintForAttendance(Long scheduleId, MultipartFile image) throws IOException;
    User verifyStudentFingerprintForAttendanceInBucket(Long scheduleId, MultipartFile image) throws IOException;
}
