package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Attendance;
import com.example.biosyncapi.model.Schedule;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.repository.AttendanceRepository;
import com.example.biosyncapi.service.AttendanceService;
import com.example.biosyncapi.service.FingerprintService;
import com.example.biosyncapi.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final FingerprintService fingerprintService;
    private final ScheduleService scheduleService;
    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceService attendanceService, FingerprintService fingerprintService, ScheduleService scheduleService, AttendanceRepository attendanceRepository) {
        this.attendanceService = attendanceService;
        this.fingerprintService = fingerprintService;
        this.scheduleService = scheduleService;
        this.attendanceRepository = attendanceRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<Attendance>> getAttendance(@PathVariable Long id) {
        List<Attendance> attendance = attendanceService.getAttendanceByScheduleId(id);

        return ResponseEntity.ok(attendance);
    }

    @GetMapping("count/present/{id}")
    public ResponseEntity<Long> getAttendanceCountByStudentId(@PathVariable Long id) {
        Long presentCount = attendanceService.getAttendanceCountByStudentId(id);

        return ResponseEntity.ok(presentCount);
    }

    @GetMapping("count/absent/{id}")
    public ResponseEntity<Long> getAbsentCountByStudentId(@PathVariable Long id) {
        Long absentCount = attendanceService.getAbsentCountByStudentId(id);

        return ResponseEntity.ok(absentCount);
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
            @RequestParam("scheduleId") Long scheduleId,
            @RequestParam("fingerprint") MultipartFile fingerprint
    ) throws IOException {

        User student = fingerprintService.verifyStudentFingerprintForAttendance(sectionId,fingerprint);
        if (student == null) return ResponseEntity.status(401).body("Fingerprint verification failed.");

        Optional<Schedule> schedule = scheduleService.getScheduleById(scheduleId);
        if(schedule.isEmpty()) return ResponseEntity.status(400).body("Schedule not found.");

        List<Attendance> hasExistingAttendance = attendanceRepository.findByScheduleIdAndUserId(scheduleId, student.getId());
        boolean hasLogged = !hasExistingAttendance.isEmpty();
        if(hasLogged) return ResponseEntity.status(409).body("User has already logged.");

        Attendance attendance = new Attendance("PRESENT", student, schedule.get());

        Attendance recordedAttendance = attendanceService.saveAttendance(attendance);

        return ResponseEntity.ok().body(Map.of(
                "message", "Fingerprint verified.",
                "student", student,
                "attendance", recordedAttendance));
    }

    @PostMapping("/verify/stop")
    public ResponseEntity<?> stopAttendance(@RequestParam("scheduleId") Long scheduleId){
        Optional<Schedule> schedule = scheduleService.getScheduleById(scheduleId);
        if(schedule.isEmpty()) return ResponseEntity.status(400).body("Schedule not found.");

        attendanceService.markAttendanceAsAbsent(schedule.get());
        return ResponseEntity.ok().body("Attendance stopped.");
    }

    @PutMapping()
    public ResponseEntity<?> updateAttendance(@RequestBody Attendance attendance) {
        Attendance updatedAttendance = attendanceService.updateAttendance(attendance);
        if(updatedAttendance == null) return ResponseEntity.status(400).body("Attendance not found");

        return ResponseEntity.ok(updatedAttendance);
    }
}
