package com.example.biosyncapi.schedule;

import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentService;
import com.example.biosyncapi.user.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/schedules")
public class ScheduleController {

  private final ScheduleService scheduleService;
  private final ScheduleStudentService scheduleStudentService;
  private final UserService userService;

  public ScheduleController(
      ScheduleService scheduleService,
      ScheduleStudentService scheduleStudentService,
      UserService userService)
  {
    this.scheduleService = scheduleService;
    this.scheduleStudentService = scheduleStudentService;
    this.userService = userService;
  }

  @GetMapping
  public List<Schedule> getAllSchedules() {
    return scheduleService.getAllSchedules();
  }

  @GetMapping("/professor/{id}")
  public List<Schedule> getSchedulesByProfessorId(@PathVariable Long id) {
    return scheduleService.getAllSchedulesByProfessorId(id);
  }

  @GetMapping("/section/{id}")
  public List<Schedule> getSchedulesBySectionId(@PathVariable Long id) {
    return scheduleService.getAllSchedulesBySectionId(id);
  }

  @GetMapping("/students/{id}")
  public List<User> getSchedulesByStudentId(@PathVariable Long id) {
    return scheduleStudentService.getStudentsByScheduleId(id);
  }

  @GetMapping("/recurrence/{id}")
  public ResponseEntity<List<Schedule>> getSchedulesByRecurrenceId(@PathVariable UUID id) {
    List<Schedule> schedules = scheduleService.getSchedulesByRecurrenceId(id);

      if (schedules.isEmpty()) {
          return new ResponseEntity<>(HttpStatus.NO_CONTENT);
      }

    return new ResponseEntity<>(schedules, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public Optional<Schedule> getScheduleById(@PathVariable Long id) {
    return scheduleService.getScheduleById(id);
  }

  @PostMapping("/create")
  public ResponseEntity<List<Schedule>> createSchedule(@RequestBody Schedule schedule) {
    try {
      List<Schedule> createdSchedule =
          scheduleService.createSchedule(schedule);
      return ResponseEntity.status(HttpStatus.CREATED).body(createdSchedule);
    } catch (ResponseStatusException e) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(null);
    }
  }

  @PostMapping("/conflicts")
  public ResponseEntity<List<Schedule>> getScheduleConflicts(@RequestBody Schedule schedule) {
    List<Schedule> conflictingSchedules = scheduleService
        .findConflictingSchedules(schedule.getScheduleDate(),
            schedule.getStartTime(), schedule.getEndTime(),
            schedule.getLaboratory());

    return new ResponseEntity<>(conflictingSchedules, HttpStatus.OK);
  }

  @PostMapping("student/add")
  public ResponseEntity<?> addStudent(
      @RequestParam("schedule_id") Long scheduleId,
      @RequestParam("student_id") Long studentId)
  {
    try {
      Schedule schedule =
          scheduleService.getScheduleById(scheduleId).orElse(null);
        if (schedule == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

      User student = userService.getUserById(studentId).orElse(null);
        if (student == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

      this.scheduleStudentService.addStudentToSchedule(schedule, student);
      return new ResponseEntity<>(HttpStatus.CREATED);

    } catch (DataIntegrityViolationException e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }

  @PutMapping
  public Schedule updateSchedule(@RequestBody Schedule schedule) {
    return scheduleService.updateSchedule(schedule);
  }

  @DeleteMapping
  public void deleteSchedule(@RequestBody Schedule schedule) {
    scheduleService.deleteSchedule(schedule.getId());
  }
}
