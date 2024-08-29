package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.*;
import com.example.biosyncapi.repository.ScheduleRepository;
import com.example.biosyncapi.repository.SubjectRepository;
import com.example.biosyncapi.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.*;
import java.util.logging.Logger;
import java.time.DayOfWeek;
import java.time.format.TextStyle;
import java.util.stream.Collectors;

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

        UUID recurrenceId = UUID.randomUUID();
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
                newSchedule.setRecurrenceId(recurrenceId);
                newSchedule.setRecurrence(schedule.getRecurrence());
                newSchedule.setRecurrenceDays(schedule.getRecurrenceDays());
                newSchedule.setRecurrenceInterval(schedule.getRecurrenceInterval());
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

    private static final Logger logger = Logger.getLogger(ScheduleServiceImpl.class.getName());

    @Override
    public Schedule updateSchedule(Schedule schedule) {
        if (schedule.getRecurrence() != Recurrence.NONE) {
            Schedule existingSchedule = scheduleRepository.findById(schedule.getId())
                    .orElseThrow();

            int updatedRows = scheduleRepository.updateSchedule(
                    schedule.getRecurrenceId(),
                    schedule.getStartTime(),
                    schedule.getEndTime(),
                    schedule.getSubject(),
                    schedule.getSection(),
                    schedule.getLaboratory(),
                    schedule.getProfessor(),
                    schedule.getSemester(),
                    schedule.getRemarks(),
                    schedule.getRecurrence(),
                    schedule.getRecurrenceInterval()
            );
            if (updatedRows == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found for update");
            }

            // Convert java.util.Date to LocalDate
            LocalDate oldDate = convertToLocalDate(existingSchedule.getScheduleDate());
            LocalDate newDate = convertToLocalDate(schedule.getScheduleDate());
            long gapInDays = ChronoUnit.DAYS.between(oldDate, newDate);
            logger.info("Old Date: " + oldDate + ", New Date: " + newDate + ", Gap in Days: " + gapInDays);

            List<Schedule> relatedSchedules = scheduleRepository.findByRecurrenceId(schedule.getRecurrenceId());
            List<Long> updatedScheduleIds = new ArrayList<>();

            for (Schedule relatedSchedule : relatedSchedules) {
                // Convert the existing schedule date to LocalDate
                LocalDate relatedDate = convertToLocalDate(relatedSchedule.getScheduleDate());
                logger.info("Related Date: " + relatedDate + ", New Schedule Date: " + relatedDate);
                // Calculate the new date while maintaining the same day-of-week alignment
                LocalDate newScheduleDate = relatedDate.plusDays(gapInDays);
                logger.info("Related Date: " + relatedDate + ", New Schedule Date: " + newScheduleDate);

                relatedSchedule.setScheduleDate(convertToDate(newScheduleDate));

                List<String> updatedRecurrenceDays = updateRecurrenceDays(relatedSchedule.getRecurrenceDays(), gapInDays);
                relatedSchedule.setRecurrenceDays(updatedRecurrenceDays);

                scheduleRepository.save(relatedSchedule);
                updatedScheduleIds.add(relatedSchedule.getId());
            }

            return schedule;
        }
        return scheduleRepository.save(schedule);
    }

    private List<String> updateRecurrenceDays(List<String> recurrenceDays, long gapInDays) {
        return recurrenceDays.stream()
                .map(day -> updateDayOfWeek(day, gapInDays))
                .collect(Collectors.toList());
    }

    private String updateDayOfWeek(String dayOfWeekStr, long gapInDays) {
        DayOfWeek dayOfWeek = getDayOfWeekFromAbbreviation(dayOfWeekStr);
        LocalDate updatedDate = LocalDate.now().plusDays(gapInDays).with(dayOfWeek);
        return updatedDate.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ROOT).toUpperCase(Locale.ROOT);
    }

    private DayOfWeek getDayOfWeekFromAbbreviation(String abbreviation) {
        return switch (abbreviation) {
            case "MON" -> DayOfWeek.MONDAY;
            case "TUE" -> DayOfWeek.TUESDAY;
            case "WED" -> DayOfWeek.WEDNESDAY;
            case "THU" -> DayOfWeek.THURSDAY;
            case "FRI" -> DayOfWeek.FRIDAY;
            case "SAT" -> DayOfWeek.SATURDAY;
            case "SUN" -> DayOfWeek.SUNDAY;
            default -> throw new IllegalArgumentException("Invalid day: " + abbreviation);
        };
    }

    private LocalDate convertToLocalDate(java.sql.Date date) {
        if(date == null) return null;

        return date.toLocalDate();
    }

    private java.sql.Date convertToDate(LocalDate localDate) {
        if (localDate == null) return null;
        return java.sql.Date.valueOf(localDate);
    }



    @Override
    public void deleteSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id).orElseThrow();

        if(schedule.getRecurrence() != Recurrence.NONE) {
            scheduleRepository.deleteByRecurrenceId(schedule.getRecurrenceId());
        } else {
            scheduleRepository.deleteById(id);
        }
    }
}
