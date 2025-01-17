package com.example.biosyncapi.schedule;

import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentRepository;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentService;
import com.example.biosyncapi.user.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("api/v1/schedules")
public class ScheduleController {

  private final ScheduleService scheduleService;
  private final ScheduleStudentService scheduleStudentService;
  private final UserService userService;
  private final ScheduleStudentRepository scheduleStudentRepository;

  public ScheduleController(
      ScheduleService scheduleService,
      ScheduleStudentService scheduleStudentService,
      UserService userService,
      ScheduleStudentRepository scheduleStudentRepository)
  {
    this.scheduleService = scheduleService;
    this.scheduleStudentService = scheduleStudentService;
    this.userService = userService;
    this.scheduleStudentRepository = scheduleStudentRepository;
  }

  @GetMapping
  public List<Schedule> getAllSchedules() {
    return scheduleService.getAllSchedules();
  }

  @GetMapping("/pending")
  public List<Schedule> getPendingSchedules() {
    return scheduleService.getAllPendingSchedules();
  }

  @GetMapping("/professor/{id}")
  public List<Schedule> getSchedulesByProfessorId(@PathVariable Long id) {
    return scheduleService.getAllSchedulesByProfessorId(id);
  }

  @GetMapping("/professor/requests/{id}")
  public ResponseEntity<?> getRequestedSchedules(@PathVariable Long id) {
    List<Schedule> requestedSchedules =
        scheduleService.getAllRequestedSchedules(id);

    return new ResponseEntity<>(requestedSchedules, HttpStatus.OK);
  }

  @GetMapping("/section/{id}")
  public List<Schedule> getSchedulesBySectionId(@PathVariable Long id) {
    return scheduleService.getAllSchedulesBySectionId(id);
  }

  @GetMapping("/students/{id}")
  public List<User> getSchedulesByStudentId(@PathVariable Long id) {
    return scheduleStudentService.getStudentsByScheduleId(id);
  }

  @GetMapping("students/details/{id}")
  public ResponseEntity<List<ScheduleStudent>> getSchedulesStudentByScheduleId
      (@PathVariable Long id) {
    List<ScheduleStudent> scheduleStudent =
        scheduleStudentService.getAllByScheduleId(id);

    if (scheduleStudent == null || scheduleStudent.isEmpty()) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    return ResponseEntity.status(HttpStatus.CREATED).body(scheduleStudent);
  }

  @GetMapping("/recurrence/{id}")
  public ResponseEntity<List<Schedule>> getSchedulesByRecurrenceId(@PathVariable UUID id) {
    List<Schedule> schedules = scheduleService.getSchedulesByRecurrenceId(id);

    if (schedules.isEmpty()) {
      return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    return new ResponseEntity<>(schedules, HttpStatus.OK);
  }

  @GetMapping("/role/student/{id}")
  public ResponseEntity<List<Schedule>> getStudentSchedule(@PathVariable Long id) {
    List<ScheduleStudent> ssList = scheduleStudentRepository.findByStudentId(id);
    List<Schedule> schedules = new ArrayList<>();

    ssList.forEach(scheduleStudent -> {
      schedules.add(scheduleStudent.getSchedule());
    });

    if(schedules.isEmpty()) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    return new ResponseEntity<>(schedules, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public Optional<Schedule> getScheduleById(@PathVariable Long id) {
    return scheduleService.getScheduleById(id);
  }


  @PostMapping("/sync")
  public ResponseEntity<?> syncSchedules(@RequestBody Map<String, Object> schedule) {
    try {
      List<Schedule> addedSchedules =
       this.scheduleService.syncSchedulesFromApi(schedule);

      return ResponseEntity.status(HttpStatus.CREATED).body(addedSchedules);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(e.getMessage());
    }
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
            schedule.getLaboratory(), schedule.getSchoolYear());

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

  @PostMapping("student/remove")
  public ResponseEntity<?> removeStudent(
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

      this.scheduleStudentService.removeStudentFromSchedule(schedule, student);
      return new ResponseEntity<>(HttpStatus.OK);

    } catch (DataIntegrityViolationException e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }

  @PutMapping("/students/computer")
  public ResponseEntity<?> createStudentSchedule(@RequestBody ScheduleStudent scheduleStudent) {
    Long computerNumber = scheduleStudent.getComputerNumber();

    ScheduleStudent scheduleStudentUpdate =
        this.scheduleStudentService.setStudentComputerNumber(scheduleStudent,
            computerNumber);

    if (scheduleStudentUpdate == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(scheduleStudentUpdate.getComputerNumber());
  }

  @PutMapping
  public Schedule updateSchedule(@RequestBody Schedule schedule) {
    return scheduleService.updateSchedule(schedule);
  }

  @PatchMapping("/{id}")
  public ResponseEntity<?> patchSchedule(
      @PathVariable Long id,
      @RequestParam String status)
  {
    Status statusReq = Status.valueOf(status);
    Schedule schedule = scheduleService.updatePartialSchedule(id, statusReq);
    return new ResponseEntity<>(schedule, HttpStatus.OK);
  }

  @DeleteMapping
  public void deleteSchedule(@RequestBody Schedule schedule) {
    scheduleService.deleteSchedule(schedule.getId());
  }
}
