package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Schedule;

import java.util.List;
import java.util.Optional;

public interface ScheduleService {
    List<Schedule> getAllSchedules();
    List<Schedule> getAllSchedulesByProfessorId(Long userId);
    List<Schedule> getAllSchedulesBySectionId(Long sectionId);
    Optional<Schedule> getScheduleById(Long id);
    List<Schedule> createSchedule(Schedule schedule);
    Schedule updateSchedule(Schedule schedule);
    void deleteSchedule(Long id);
}
