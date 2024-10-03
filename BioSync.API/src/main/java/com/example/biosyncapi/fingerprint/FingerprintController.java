package com.example.biosyncapi.fingerprint;

import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/v1/fingerprints")
public class FingerprintController {
    private final FingerprintService fingerprintService;
    private final ScheduleStudentService scheduleStudentService;

    public FingerprintController(FingerprintService fingerprintService, ScheduleStudentService scheduleStudentService) {
        this.fingerprintService = fingerprintService;
        this.scheduleStudentService = scheduleStudentService;
    }

    @GetMapping("schedule/{id}")
    public ResponseEntity<List<Fingerprint>> getAllByScheduleId(@PathVariable Long id) {
        List<ScheduleStudent> students = scheduleStudentService.getAllByScheduleId(id);
        List<Fingerprint> fingerprints = new ArrayList<>();

        for (ScheduleStudent student : students) {
            List<Fingerprint> studentFingerprints = fingerprintService.getAllByUserId(student.getStudent().getId());
            fingerprints.addAll(studentFingerprints);
        }

        if (!fingerprints.isEmpty()) return ResponseEntity.ok(fingerprints);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("userId") Long userId,
            @RequestParam("fingerprint") List<MultipartFile> fingerprintImage,
            @RequestParam(value = "method", defaultValue = "toBucket") String method) {
        try{
            if(method.equals("toBucket")) {
                fingerprintService.processFingerprintsToBucket(userId, fingerprintImage);
            } else {
                fingerprintService.processFingerprints(userId, fingerprintImage);
            }
            return ResponseEntity.ok("Fingerprint uploaded successfully");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
