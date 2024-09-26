package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Attendance;
import com.example.biosyncapi.model.Schedule;

import java.util.List;

public interface AttendanceService {
    List<Attendance> getAttendanceByScheduleId(Long scheduleId);
    Long getAttendanceCountByStudentId(Long studentId);
    Long getAbsentCountByStudentId(Long studentId);
    Attendance saveAttendance(Attendance attendance);
    Attendance updateAttendance(Attendance attendance);
    void setTimeOut(Schedule schedule);
}
