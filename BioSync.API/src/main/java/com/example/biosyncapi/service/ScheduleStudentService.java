package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Schedule;
import com.example.biosyncapi.model.ScheduleStudent;
import com.example.biosyncapi.model.User;

import java.util.List;

public interface ScheduleStudentService {
    List<ScheduleStudent> getAllByScheduleId(Long userId);
    void addStudentToSchedule(Schedule schedule, User student);
}