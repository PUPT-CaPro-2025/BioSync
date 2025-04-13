package com.example.biosyncapi.attendance;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.schedule.ScheduleRepository;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentRepository;
import com.example.biosyncapi.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

  private final AttendanceRepository attendanceRepository;
  private final ScheduleStudentRepository scheduleStudentRepository;
  private final UserRepository userRepository;
  private final ScheduleRepository scheduleRepository;

  public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
      ScheduleStudentRepository scheduleStudentRepository, UserRepository userRepository,
      ScheduleRepository scheduleRepository) {
    this.attendanceRepository = attendanceRepository;
    this.scheduleStudentRepository = scheduleStudentRepository;
    this.userRepository = userRepository;
    this.scheduleRepository = scheduleRepository;
  }

  @Override
  public List<Attendance> getAttendanceByScheduleId(Long scheduleId) {
    List<Attendance> attendances = attendanceRepository.findByScheduleId(scheduleId);

    attendances.sort((a1, a2) -> {
      String lastName1 = a1.getUser().getLastName();
      String lastName2 = a2.getUser().getLastName();
      if (lastName1 == null) lastName1 = "";
      if (lastName2 == null) lastName2 = "";
      return lastName1.compareToIgnoreCase(lastName2);
    });

    return attendances;
  }

  @Override
  public List<User> getStudentsLoggedByScheduleId(Long scheduleId) {
    return attendanceRepository.getStudentsByScheduleId(scheduleId);
  }

  @Override
  public List<User> getStudentsLoggedOutByScheduleId(Long scheduleId) {
    List<Attendance> attendanceList = attendanceRepository.findByScheduleId(scheduleId);
    List<User> studentsLoggedOut = new ArrayList<>();

    for (Attendance attendance : attendanceList) {
      if (attendance.getTimeOut() != null) {
        studentsLoggedOut.add(attendance.getUser());
      }
    }

    return studentsLoggedOut;
  }

  @Override
  public Long getAttendanceCountByStudentId(Long studentId) {
    Long present =  attendanceRepository.countByUserIdAndStatus(studentId,
        "PRESENT");
    Long late = attendanceRepository.countByUserIdAndStatus(studentId,
        "LATE");

    return late + present;
  }

  @Override
  public Long getAbsentCountByStudentId(Long studentId) {
    return attendanceRepository.countByUserIdAndStatus(studentId, "ABSENT");
  }

  @Override
  public Long getTardinessCountByStudentId(Long studentId) {
    return attendanceRepository.countByUserIdAndStatus(studentId, "LATE");
  }

  @Override
  public Attendance saveAttendance(Attendance attendance) {
    return attendanceRepository.save(attendance);
  }

  @Override
  public Attendance updateAttendance(Attendance attendance) {
    Optional<Attendance> existingAttendance = attendanceRepository.findById(attendance.getId());

    if (existingAttendance.isEmpty())
      return null;

    Attendance updatedAttendance = existingAttendance.get();
    updatedAttendance.setStatus(attendance.getStatus());
    updatedAttendance.setUser(attendance.getUser());
    updatedAttendance.setSchedule(attendance.getSchedule());

    return attendanceRepository.save(updatedAttendance);
  }

  @Override
  public User studentTimeIn(Long scheduleId, String usercode,
      String attendanceStatus) {
    Optional<User> studentOpt = userRepository.findByUsercode(usercode);
    Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);

    if (studentOpt.isEmpty() || scheduleOpt.isEmpty()) {
      return null;
    }

    Long studentId = studentOpt.get().getId();

    ScheduleStudent scheduleStudentRecord = scheduleStudentRepository.findByStudentIdAndScheduleId(studentId,
        scheduleId);
    if (scheduleStudentRecord == null)
      return null;

    if (!attendanceRepository.findByScheduleIdAndUserId(scheduleId, studentId).isEmpty())
      return studentOpt.get();

    Attendance attendance = new Attendance(attendanceStatus, studentOpt.get(), scheduleOpt.get(),
        ZonedDateTime.now(ZoneId.of("UTC+8")));
    attendanceRepository.save(attendance);

    return studentOpt.get();
  }

  @Override
  public User studentTimeOut(Long scheduleId, String usercode) {
    Optional<User> studentOpt = userRepository.findByUsercode(usercode);
    Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);

    if (studentOpt.isEmpty() || scheduleOpt.isEmpty()) {
      return null;
    }

    List<Attendance> attendance =
        this.attendanceRepository.findByScheduleIdAndUserId(scheduleOpt.get().getId(), studentOpt.get().getId());

    Attendance attendance1 = attendance.get(0);

    attendance1.setTimeOut(ZonedDateTime.now(ZoneId.of("UTC+8")));

    attendanceRepository.save(attendance1);

    return studentOpt.get();
  }

  @Override
  public void setTimeOut(Schedule schedule) {
    List<ScheduleStudent> scheduleStudents = scheduleStudentRepository.findByScheduleId(schedule.getId());
    List<Attendance> existingAttendances = attendanceRepository.findByScheduleId(schedule.getId());
    Set<Long> studentsWithAttendance = existingAttendances.stream().map(attendance -> attendance.getUser().getId())
        .collect(Collectors.toSet());
    for (ScheduleStudent scheduleStudent : scheduleStudents) {
      User student = scheduleStudent.getStudent();

      if (studentsWithAttendance.contains(student.getId())) {
        Attendance existingAttendance = existingAttendances.stream()
            .filter(attendance -> attendance.getUser().getId().equals(student.getId()))
            .findFirst()
            .orElse(null);

        if (existingAttendance != null && existingAttendance.getTimeOut() == null) {
          existingAttendance.setTimeOut(ZonedDateTime.now(ZoneId.of("UTC+8")));
          attendanceRepository.save(existingAttendance);
        }
      } else {
        Attendance absentAttendance = new Attendance();
        absentAttendance.setStatus("ABSENT");
        absentAttendance.setUser(student);
        absentAttendance.setSchedule(schedule);
        attendanceRepository.save(absentAttendance);
      }
    }
  }
}
