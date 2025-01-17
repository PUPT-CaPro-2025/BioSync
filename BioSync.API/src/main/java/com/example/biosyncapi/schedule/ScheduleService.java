package com.example.biosyncapi.schedule;

import com.example.biosyncapi.laboratory.Laboratory;
import com.example.biosyncapi.school_year.SchoolYear;

import java.sql.Date;
import java.sql.Time;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleService {
    List<Schedule> getAllSchedules();
    List<Schedule> getAllSchedulesByProfessorId(Long userId);
    List<Schedule> getAllSchedulesBySectionId(Long sectionId);
    List<Schedule> getSchedulesByRecurrenceId(UUID recurrenceId);
    List<Schedule> findConflictingSchedules(Date scheduleDate,
        Time startTime, Time endTime, Laboratory laboratory, SchoolYear schoolYear);
    Optional<Schedule> getScheduleById(Long id);
    List<Schedule> createSchedule(Schedule schedule);
    List<Schedule> getAllRequestedSchedules(Long requesterId);
    List<Schedule> getAllPendingSchedules();
    Schedule updateSchedule(Schedule schedule);
    Schedule updatePartialSchedule(Long id, Status updates);
    void deleteSchedule(Long id);
    List<Schedule> syncSchedulesFromApi(Map<String, Object> apiData);
}
