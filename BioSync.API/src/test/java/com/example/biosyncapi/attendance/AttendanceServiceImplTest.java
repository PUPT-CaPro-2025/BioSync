package com.example.biosyncapi.attendance;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.schedule.ScheduleRepository;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentRepository;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.ZonedDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AttendanceServiceImplTest {

  @Mock
  private AttendanceRepository attendanceRepository;
  @Mock
  private ScheduleStudentRepository scheduleStudentRepository;
  @Mock
  private UserRepository userRepository;
  @Mock
  private ScheduleRepository scheduleRepository;
  @InjectMocks
  private AttendanceServiceImpl attendanceService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void testGetAttendanceByScheduleId_ShouldReturnSortedList(){
    Long scheduleId = 1L;
    User user1 = new User(); user1.setLastName("Zeta");
    User user2 = new User(); user2.setLastName("Alpha");

    Attendance att1 = new Attendance(); att1.setUser(user1);
    Attendance att2 = new Attendance(); att2.setUser(user2);

    when(attendanceRepository.findByScheduleId(scheduleId)).thenReturn(
        Arrays.asList(att1, att2));

    List<Attendance>
        result = attendanceService.getAttendanceByScheduleId(scheduleId);

    assertEquals(2, result.size());
    assertEquals("Alpha", result.get(0).getUser().getLastName());
    assertEquals("Zeta", result.get(1).getUser().getLastName());
  }

  @Test
  void testStudentTimeIn_ValidStudentAndSchedule_ShouldCreateAttendance() {
    Long scheduleId = 1L;
    String usercode = "2021-00172-TG-0";
    User student = new User(); student.setId(1L); student.setUsercode(usercode);
    Schedule schedule = new Schedule(); schedule.setId(scheduleId);

    when(userRepository.findByUsercode(usercode)).thenReturn(
        Optional.of(student));
    when(scheduleRepository.findById(scheduleId)).thenReturn(Optional.of(schedule));
    when(scheduleStudentRepository.findByStudentIdAndScheduleId(1L, scheduleId))
        .thenReturn(new ScheduleStudent());
    when(attendanceRepository.findByScheduleIdAndUserId(scheduleId, 1L))
        .thenReturn(Collections.emptyList());

    User result = attendanceService.studentTimeIn(scheduleId, usercode, "PRESENT");

    assertNotNull(result);
    assertEquals("2021-00172-TG-0", result.getUsercode());
    verify(attendanceRepository, times(1)).save(any(Attendance.class));
  }

  @Test
  void testStudentTimeOut_ValidData_ShouldSetTimeOut() {
    Long scheduleId = 1L;
    String usercode = "2021-00172-TG-0";
    User student = new User(); student.setId(1L); student.setUsercode(usercode);
    Schedule schedule = new Schedule(); schedule.setId(scheduleId);

    Attendance attendance = new Attendance();
    attendance.setUser(student);
    attendance.setSchedule(schedule);

    when(userRepository.findByUsercode(usercode)).thenReturn(Optional.of(student));
    when(scheduleRepository.findById(scheduleId)).thenReturn(Optional.of(schedule));
    when(attendanceRepository.findByScheduleIdAndUserId(scheduleId, student.getId()))
        .thenReturn(List.of(attendance));

    User result = attendanceService.studentTimeOut(scheduleId, usercode);

    assertNotNull(result);
    assertNotNull(attendance.getTimeOut());
    verify(attendanceRepository, times(1)).save(attendance);
  }

  @Test
  void testGetAttendanceCountByStudentId_ShouldReturnCorrectCount() {
    Long studentId = 1L;
    when(attendanceRepository.countByUserIdAndStatus(studentId, "PRESENT")).thenReturn(3L);
    when(attendanceRepository.countByUserIdAndStatus(studentId, "LATE")).thenReturn(2L);

    Long result = attendanceService.getAttendanceCountByStudentId(studentId);

    assertEquals(5L, result);
  }

  @Test
  void testSetTimeOut_ShouldHandleAbsentStudents() {
    Long scheduleId = 1L;
    Schedule schedule = new Schedule(); schedule.setId(scheduleId);

    User student1 = new User(); student1.setId(1L);
    ScheduleStudent ss1 = new ScheduleStudent(); ss1.setStudent(student1);

    when(scheduleStudentRepository.findByScheduleId(scheduleId)).thenReturn(List.of(ss1));
    when(attendanceRepository.findByScheduleId(scheduleId)).thenReturn(Collections.emptyList());

    attendanceService.setTimeOut(schedule);

    verify(attendanceRepository, times(1)).save(any(Attendance.class));
  }

  @Test
  void testGetStudentsLoggedByScheduleId_ShouldReturnCorrectStudents() {
    User firstUser = new User();
    firstUser.setId(1L); firstUser.setUsercode("2021-00172-TG-0");
    User secondUser = new User();
    secondUser.setId(2L); secondUser.setUsercode("2021-00173-TG-0");
    Long scheduleId = 1L;

    List<User> students = List.of(firstUser,secondUser);

    when(attendanceRepository.getStudentsByScheduleId(scheduleId)).thenReturn(students);

    List<User> result = attendanceService.getStudentsLoggedByScheduleId(scheduleId);

    assertEquals(2, result.size());
    assertEquals("2021-00172-TG-0", result.get(0).getUsercode());
    assertEquals("2021-00173-TG-0", result.get(1).getUsercode());
  }

  @Test
  void testGetStudentsLoggedOutByScheduleId_ShouldReturnCorrectStudents() {
    User firstUser = new User();
    firstUser.setId(1L); firstUser.setFirstName("StudentOne");

    User secondUser = new User();
    secondUser.setId(2L); secondUser.setFirstName("StudentTwo");
    Long scheduleId = 1L;

    Attendance firstUserAttendance = new Attendance();
    firstUserAttendance.setUser(firstUser);
    firstUserAttendance.setTimeOut(ZonedDateTime.now());

    Attendance secondUserAttendance = new Attendance();
    secondUserAttendance.setUser(secondUser);

    List<Attendance> attendances = List.of(firstUserAttendance,secondUserAttendance);

    when(attendanceRepository.findByScheduleId(scheduleId)).thenReturn(attendances);

    List<User> result = attendanceService.getStudentsLoggedOutByScheduleId(scheduleId);

    assertEquals(1, result.size());
    assertEquals("StudentOne", result.get(0).getFirstName());
  }

  @Test
  void testGetAbsentCountByStudentId_ShouldReturnCorrectCount() {
    Long studentId = 1L;

    when(attendanceRepository
        .countByUserIdAndStatus(studentId, "ABSENT")).thenReturn(3L);

    Long result = attendanceService.getAbsentCountByStudentId(studentId);

    assertEquals(3L, result);
  }

  @Test
  void testGetTardinessCountByStudentId_ShouldReturnCorrectCount() {
    Long studentId = 1L;

    when(attendanceRepository
        .countByUserIdAndStatus(studentId, "LATE")).thenReturn(7L);

    Long result = attendanceService.getTardinessCountByStudentId(studentId);

    assertEquals(7L, result);
  }

  @Test
  void testUpdateAttendance_ShouldUpdateAndReturnAttendance() {
    Long attendanceId = 1L;
    User user = new User(); user.setId(1L);
    Schedule schedule = new Schedule(); schedule.setId(1L);

    Attendance existing = new Attendance();
    existing.setId(attendanceId);
    existing.setStatus("ABSENT");

    Attendance input = new Attendance();
    input.setId(attendanceId);
    input.setStatus("PRESENT");
    input.setUser(user);
    input.setSchedule(schedule);

    when(attendanceRepository.findById(attendanceId)).thenReturn(Optional.of(existing));
    when(attendanceRepository.save(any(Attendance.class))).thenReturn(input);

    Attendance result = attendanceService.updateAttendance(input);

    assertNotNull(result);
    assertEquals("PRESENT", result.getStatus());
    assertEquals(user, result.getUser());
    assertEquals(schedule, result.getSchedule());
    verify(attendanceRepository, times(1)).save(existing);
  }


  @Test
  void testSaveAttendance_ShouldReturnSavedAttendance() {
    Attendance attendance = new Attendance();
    attendance.setStatus("PRESENT");

    when(attendanceRepository.save(attendance)).thenReturn(attendance);

    Attendance result = attendanceService.saveAttendance(attendance);

    assertEquals(attendance, result);
    verify(attendanceRepository, times(1)).save(attendance);
  }

  @Test
  void testUpdateAttendance_ShouldReturnNullIfNotFound() {
    Long attendanceId = 999L;
    Attendance input = new Attendance();
    input.setId(attendanceId);

    when(attendanceRepository.findById(attendanceId)).thenReturn(Optional.empty());

    Attendance result = attendanceService.updateAttendance(input);

    assertNull(result);
    verify(attendanceRepository, never()).save(any());
  }

}
