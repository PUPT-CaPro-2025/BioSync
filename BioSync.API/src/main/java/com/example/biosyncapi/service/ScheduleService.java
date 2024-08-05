package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Schedule;

import java.util.List;
import java.util.Optional;

public interface ScheduleService {
    List<Schedule> getAllSchedules();
    Optional<Schedule> getScheduleById(Long id);
    Schedule createSchedule(Schedule schedule);
    Schedule updateSchedule(Schedule schedule);
    void deleteSchedule(Long id);
}
