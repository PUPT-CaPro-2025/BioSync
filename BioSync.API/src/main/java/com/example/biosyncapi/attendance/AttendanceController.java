package com.example.biosyncapi.attendance;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.ScheduleRepository;
import com.example.biosyncapi.fingerprint.FingerprintService;
import com.example.biosyncapi.schedule.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.ZoneId;
import java.time.ZonedDateTime;
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
  private final ScheduleRepository scheduleRepository;

  public AttendanceController(
      AttendanceService attendanceService,
      FingerprintService fingerprintService,
      ScheduleService scheduleService,
      AttendanceRepository attendanceRepository,
      ScheduleRepository scheduleRepository)
  {
    this.attendanceService = attendanceService;
    this.fingerprintService = fingerprintService;
    this.scheduleService = scheduleService;
    this.attendanceRepository = attendanceRepository;
    this.scheduleRepository = scheduleRepository;
  }

  @GetMapping()
  public ResponseEntity<List<Attendance>> getAttendance() {
    List<Attendance> attendances = attendanceRepository.findAll();

    return ResponseEntity.ok(attendances);
  }

  @GetMapping("/{id}")
  public ResponseEntity<List<Attendance>> getAttendance(
      @PathVariable Long id)
  {
    List<Attendance> attendance =
        attendanceService.getAttendanceByScheduleId(id);

    return ResponseEntity.ok(attendance);
  }

  @GetMapping("/schedule/{id}")
  public ResponseEntity<List<Attendance>> getAttendanceByScheduleId(
      @PathVariable Long id)
  {
    List<Attendance> attendance =
        attendanceService.getAttendanceByScheduleId(id);
    if (attendance.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(attendance);
  }

  @GetMapping("count/present/{id}")
  public ResponseEntity<Long> getAttendanceCountByStudentId(
      @PathVariable Long id)
  {
    Long presentCount = attendanceService.getAttendanceCountByStudentId(id);

    return ResponseEntity.ok(presentCount);
  }

  @GetMapping("count/absent/{id}")
  public ResponseEntity<Long> getAbsentCountByStudentId(
      @PathVariable Long id)
  {
    Long absentCount = attendanceService.getAbsentCountByStudentId(id);

    return ResponseEntity.ok(absentCount);
  }

  @PostMapping("/verify/start")
  public ResponseEntity<?> verifyProfessorFingerprintForAttendance(
      @RequestParam("userId") Long userId,
      @RequestParam("fingerprint") MultipartFile fingerprint,
      @RequestParam(value = "method", defaultValue = "toBucket") String method)
      throws IOException
  {
    Boolean match;

    if (method.equals("toBucket")) {
      User user =
          fingerprintService.verifyProfessorFingerprintForAttendanceInBucket(
              userId, fingerprint);
      match = user != null;
    } else {
      match =
          fingerprintService.verifyProfessorFingerprintForAttendance(userId,
              fingerprint);
    }

    if (match) {
      return ResponseEntity.ok("Fingerprint verified.");
    }

    return ResponseEntity.status(401).body("Fingerprint verification failed.");
  }

  @PostMapping("/student/check-in")
  public ResponseEntity<?> verifyStudentTimeInAttendance(
      @RequestParam("scheduleId") Long scheduleId,
      @RequestParam("fingerprint") MultipartFile fingerprint,
      @RequestParam(value = "method", defaultValue = "toBucket") String method)
      throws IOException
  {

    User student;

    if (method.equals("toBucket")) {
      student =
          fingerprintService.verifyStudentFingerprintForAttendanceInBucket(
              scheduleId, fingerprint);
    } else {
      student =
          fingerprintService.verifyStudentFingerprintForAttendance(scheduleId,
              fingerprint);
    }

    if (student == null) {
      return ResponseEntity.status(401)
          .body("Fingerprint verification " + "failed.");
    }

    Optional<Schedule> schedule = scheduleService.getScheduleById(scheduleId);
    if (schedule.isEmpty()) {
      return ResponseEntity.status(400).body("Schedule not found.");
    }

    List<Attendance> hasExistingAttendance =
        attendanceRepository.findByScheduleIdAndUserId(scheduleId,
            student.getId());
    boolean hasLogged = !hasExistingAttendance.isEmpty();
    if (hasLogged) {
      return ResponseEntity.status(409).body("User has already logged.");
    }

    Attendance attendance = new Attendance("PRESENT", student, schedule.get(),
        ZonedDateTime.now(ZoneId.of("UTC+8")));

    Attendance recordedAttendance =
        attendanceService.saveAttendance(attendance);

    return ResponseEntity.ok().body(
        Map.of("message", "Fingerprint verified" + ".", "student", student,
            "attendance", recordedAttendance));
  }

  @PostMapping("/student/time-in")
  public ResponseEntity<?> studentTimeIn(
      @RequestParam("scheduleId") Long scheduleId,
      @RequestParam("studentId") Long studentId,
      @RequestParam("attendanceStatus") String attendanceStatus)
  {

    User timedInStudent =
        this.attendanceService.studentTimeIn(scheduleId, studentId,
            attendanceStatus);

    if (timedInStudent == null) {
      return ResponseEntity.badRequest().body("Request Invalid");
    }

    return ResponseEntity.ok().body(timedInStudent);
  }

  @PostMapping("/verify/stop")
  public ResponseEntity<?> stopAttendance(
      @RequestParam("scheduleId") Long scheduleId)
  {
    Optional<Schedule> schedule = scheduleService.getScheduleById(scheduleId);
    if (schedule.isEmpty()) {
      return ResponseEntity.status(400).body("Schedule not found.");
    }
    schedule.get().setHasFinished(true);
    scheduleRepository.save(schedule.get());
    attendanceService.setTimeOut(schedule.get());
    return ResponseEntity.ok().body("Attendance stopped.");
  }

  @PutMapping()
  public ResponseEntity<?> updateAttendance(
      @RequestBody Attendance attendance)
  {
    Attendance updatedAttendance =
        attendanceService.updateAttendance(attendance);
    if (updatedAttendance == null) {
      return ResponseEntity.status(400).body("Attendance not found");
    }

    return ResponseEntity.ok(updatedAttendance);
  }
}
