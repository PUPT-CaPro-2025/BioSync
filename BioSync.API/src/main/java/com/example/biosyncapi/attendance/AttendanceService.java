package com.example.biosyncapi.attendance;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.user.User;

import java.util.List;

public interface AttendanceService {
  List<Attendance> getAttendanceByScheduleId(Long scheduleId);

  List<User> getStudentsLoggedByScheduleId(Long scheduleId);

  Long getAttendanceCountByStudentId(Long studentId);

  Long getAbsentCountByStudentId(Long studentId);

  Long getTardinessCountByStudentId(Long studentId);

  Attendance saveAttendance(Attendance attendance);

  Attendance updateAttendance(Attendance attendance);

  User studentTimeIn(Long scheduleId, Long studentId, String attendanceStatus);

  void setTimeOut(Schedule schedule);
}
