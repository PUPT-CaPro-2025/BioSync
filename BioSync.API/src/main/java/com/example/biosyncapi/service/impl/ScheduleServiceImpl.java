package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Recurrence;
import com.example.biosyncapi.model.Schedule;
import com.example.biosyncapi.model.Semester;
import com.example.biosyncapi.model.Subject;
import com.example.biosyncapi.repository.ScheduleRepository;
import com.example.biosyncapi.repository.SubjectRepository;
import com.example.biosyncapi.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SubjectRepository subjectRepository;

    public ScheduleServiceImpl(ScheduleRepository scheduleRepository, SubjectRepository subjectRepository) {
        this.scheduleRepository = scheduleRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @Override
    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }

    @Override
    public List<Schedule> createSchedule(Schedule schedule) {
        Subject subject = subjectRepository
                .findById(schedule.getSubject().getId())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND)
                );

        schedule.setSubject(subject);

        List<Schedule> conflictingSchedule =
                scheduleRepository.findConflictingSchedules(
                        schedule.getScheduleDate(),
                        schedule.getStartTime(),
                        schedule.getEndTime()
                );

        if(!conflictingSchedule.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }


        List<Schedule> schedules = new ArrayList<>();

        if(schedule.getRecurrence() == Recurrence.NONE) {
            schedules.add(schedule);
            scheduleRepository.saveAll(schedules);
            return schedules;
        }

        Semester semester = schedule.getSemester();

        Calendar startDate = Calendar.getInstance();
        startDate.setTime(schedule.getScheduleDate());  // Set to Schedule Date

        Calendar endDate = Calendar.getInstance();
        endDate.setTime(semester.getEndDate());

        while(startDate.before(endDate) || startDate.equals(endDate)) {
            // Iterate over the specified days in recurrenceDays
            for (String day : schedule.getRecurrenceDays()) {
                // Set calendar to the specified day of the week
                while (startDate.get(Calendar.DAY_OF_WEEK) != getCalendarDayOfWeek(day)) {
                    startDate.add(Calendar.DAY_OF_MONTH, 1);
                }

                // Ensure we haven't gone past the end date
                if (startDate.after(endDate)) break;

                // Create a new schedule
                Schedule newSchedule = setNewSchedule(schedule, startDate);
                schedules.add(newSchedule);
            }

            // Move startDate by the recurrence interval in weeks
            startDate.add(Calendar.WEEK_OF_YEAR, schedule.getRecurrenceInterval());
        }

        scheduleRepository.saveAll(schedules);

        return schedules;
    }

    private static int getCalendarDayOfWeek(String day) {
        return switch (day) {
            case "MON" -> Calendar.MONDAY;
            case "TUE" -> Calendar.TUESDAY;
            case "WED" -> Calendar.WEDNESDAY;
            case "THU" -> Calendar.THURSDAY;
            case "FRI" -> Calendar.FRIDAY;
            case "SAT" -> Calendar.SATURDAY;
            case "SUN" -> Calendar.SUNDAY;
            default -> throw new IllegalArgumentException("Invalid day: " + day);
        };
    }

    private static Schedule setNewSchedule(Schedule schedule, Calendar startDate) {
        Schedule newSchedule = new Schedule();
        newSchedule.setSubject(schedule.getSubject());
        newSchedule.setSection(schedule.getSection());
        newSchedule.setStartTime(schedule.getStartTime());
        newSchedule.setEndTime(schedule.getEndTime());
        newSchedule.setScheduleDate(new java.sql.Date(startDate.getTimeInMillis()));
        newSchedule.setLaboratory(schedule.getLaboratory());
        newSchedule.setProfessor(schedule.getProfessor());
        newSchedule.setSchoolYear(schedule.getSchoolYear());
        newSchedule.setSemester(schedule.getSemester());
        newSchedule.setRemarks(schedule.getRemarks());
        return newSchedule;
    }


    @Override
    public Schedule updateSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Override
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
}
