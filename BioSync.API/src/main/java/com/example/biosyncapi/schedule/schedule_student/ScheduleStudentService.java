package com.example.biosyncapi.schedule.schedule_student;

import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.Schedule;
import org.springframework.dao.DataAccessException;

import java.util.List;

public interface ScheduleStudentService {
    List<ScheduleStudent> getAllByScheduleId(Long userId);
    void addStudentToSchedule(Schedule schedule, User student) throws DataAccessException;
    List<User> getStudentsByScheduleId(Long scheduleId) throws RuntimeException;
}