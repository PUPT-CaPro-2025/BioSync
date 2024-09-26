package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Schedule;
import com.example.biosyncapi.model.ScheduleStudent;
import com.example.biosyncapi.model.User;
import org.springframework.dao.DataAccessException;

import java.util.List;

public interface ScheduleStudentService {
    List<ScheduleStudent> getAllByScheduleId(Long userId);
    void addStudentToSchedule(Schedule schedule, User student) throws DataAccessException;
    List<User> getStudentsByScheduleId(Long scheduleId) throws RuntimeException;
}