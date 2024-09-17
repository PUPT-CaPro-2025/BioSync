package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Schedule;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleService {
    List<Schedule> getAllSchedules();
    List<Schedule> getAllSchedulesByProfessorId(Long userId);
    List<Schedule> getAllSchedulesBySectionId(Long sectionId);
    List<Schedule> getSchedulesByRecurrenceId(UUID recurrenceId);
    Optional<Schedule> getScheduleById(Long id);
    List<Schedule> createSchedule(Schedule schedule);
    Schedule updateSchedule(Schedule schedule);
    void deleteSchedule(Long id);
}
