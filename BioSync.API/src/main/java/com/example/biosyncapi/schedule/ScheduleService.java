package com.example.biosyncapi.schedule;

import com.example.biosyncapi.laboratory.Laboratory;

import java.sql.Date;
import java.sql.Time;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleService {
    List<Schedule> getAllSchedules();
    List<Schedule> getAllSchedulesByProfessorId(Long userId);
    List<Schedule> getAllSchedulesBySectionId(Long sectionId);
    List<Schedule> getSchedulesByRecurrenceId(UUID recurrenceId);
    List<Schedule> findConflictingSchedules(Date scheduleDate, Time startTime, Time endTime, Laboratory laboratory);
    Optional<Schedule> getScheduleById(Long id);
    List<Schedule> createSchedule(Schedule schedule);
    Schedule updateSchedule(Schedule schedule);
    void deleteSchedule(Long id);
}
