package com.example.biosyncapi.user;

import com.example.biosyncapi.mail.MailService;
import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.schedule.ScheduleService;

import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/users")
public class UserController {

  private final UserService userService;
  private final MailService mailService;
  private final ScheduleService scheduleService;
  private final ScheduleStudentService scheduleStudentService;

  public UserController(
      UserService userService,
      MailService mailService,
      ScheduleService scheduleService,
      ScheduleStudentService scheduleStudentService)
  {
    this.userService = userService;
    this.mailService = mailService;
    this.scheduleService = scheduleService;
    this.scheduleStudentService = scheduleStudentService;
  }

  @GetMapping()
  public List<User> getUsers() {
    return this.userService.getAllUsers();
  }

  @GetMapping("/role/{role}")
  public List<User> getUsersByRole(@PathVariable Role role) {
    return this.userService.getUsersByRole(role);
  }

  @GetMapping("students/{id}")
  public List<User> getStudentsNotInSchedule(@PathVariable Long id) {
    List<User> students = this.userService.getUsersByRole(Role.STUDENT);

    List<User> studentsAlreadyAdded =
        this.scheduleStudentService.getStudentsByScheduleId(id);

    return students.stream()
        .filter(student -> studentsAlreadyAdded.stream()
            .noneMatch(addedStudent -> addedStudent.getId().equals(student.getId())))
        .collect(Collectors.toList());
  }

  @GetMapping("/section/{id}")
  public ResponseEntity<List<User>> getUsersBySectionId(@PathVariable Long id) {
    List<User> students = this.userService.getUsersBySectionId(id);
    if (students.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(students);
  }

  @GetMapping("/profile-image/{id}")
  public ResponseEntity<Map<String, String>> getProfileImageUrl(@PathVariable Long id) {
    String profileImageUrl = this.userService.getProfileImageUrl(id);

    if (profileImageUrl == null) {
      return ResponseEntity.notFound().build();
    }

    Map<String, String> response = new HashMap<>();
    response.put("profileImageUrl", profileImageUrl);

    return ResponseEntity.ok().body(response);
  }

  @GetMapping("/{id}")
  public Optional<User> getUserById(@PathVariable long id) {
    return this.userService.getUserById(id);
  }

  @PostMapping()
  public User createUser(@RequestBody User user) {
    return this.userService.createUser(user);
  }

  @PostMapping("/profile-image")
  public ResponseEntity<?> createUserProfileImage(
      @RequestParam("userId") Long userId,
      @RequestParam("profileImage") MultipartFile profileImage,
      @RequestParam(value = "method", defaultValue = "toBucket") String method)
  {
    try {
      if (method.equals("toBucket")) {
        this.userService.processProfileImageToBucket(userId, profileImage);
      } else {
        this.userService.processProfileImage(userId, profileImage);
      }
      return ResponseEntity.status(HttpStatus.CREATED).build();
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @PostMapping("/students")
  public ResponseEntity<Map<String, Object>> addStudents(
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "scheduleId", required = false) Long scheduleId)
  {
    try {
      Optional<Schedule> schedule =
          scheduleId != null ? scheduleService.getScheduleById(scheduleId) :
              Optional.empty();
      HashMap<User, String> mailPasswords =
          userService.processCSV(file, schedule);

      mailService.autoSendCredentials(mailPasswords);

      return ResponseEntity.ok().body(Map.ofEntries(
          Map.entry("success", true),
          Map.entry("count", mailPasswords.size())
                                                   ));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.ofEntries(
          Map.entry("success", false),
          Map.entry("error", e.getMessage())
                                                           ));
    }
  }


  @PutMapping("/edit-user")
  public User updateUser(@RequestBody User user) {
    return this.userService.updateUser(user);
  }

  @PutMapping("/edit/bulk/students")
  public ResponseEntity<Map<String, Object>> updateStudents(
          @RequestParam("file") MultipartFile file)
  {
    try {
      List<User> updatedUsers = this.userService.processCSVForEditing(file);

      return ResponseEntity.ok().body(Map.ofEntries(
              Map.entry("success", true),
              Map.entry("students", updatedUsers)
      ));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.ofEntries(
              Map.entry("success", false),
              Map.entry("error", e.getMessage())
      ));
    }
  }

  @PutMapping("/edit-profile-image")
  public ResponseEntity<?> updateUserProfileImage(
      @RequestParam("userId") Long userId,
      @RequestParam("profileImage") MultipartFile profileImage)
  {
    try {
      this.userService.processEditProfileImageToBucket(userId, profileImage);

      return ResponseEntity.status(HttpStatus.CREATED).build();
    } catch (IOException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @DeleteMapping()
  public void deleteUser(@RequestBody User user) {
    this.userService.deleteUser(user.getId());
  }
}
