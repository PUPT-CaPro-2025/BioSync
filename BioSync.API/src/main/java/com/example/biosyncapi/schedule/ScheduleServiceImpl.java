package com.example.biosyncapi.schedule;

import com.example.biosyncapi.laboratory.Laboratory;
import com.example.biosyncapi.subject.SubjectRepository;
import com.example.biosyncapi.user.UserRepository;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentRepository;
import com.example.biosyncapi.semester.Semester;
import com.example.biosyncapi.subject.Subject;
import com.example.biosyncapi.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.*;
import java.util.logging.Logger;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ScheduleStudentRepository scheduleStudentRepository;

    public ScheduleServiceImpl(ScheduleRepository scheduleRepository, SubjectRepository subjectRepository, UserRepository userRepository, ScheduleStudentRepository scheduleStudentRepository) {
        this.scheduleRepository = scheduleRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.scheduleStudentRepository = scheduleStudentRepository;
    }

    @Override
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findByIsActiveTrueAndStatus(Status.APPROVED);
    }

    @Override
    public List<Schedule> getAllSchedulesByProfessorId(Long professorId) {
        return scheduleRepository.findSchedulesByProfessorId(professorId);
    }

    @Override
    public List<Schedule> getAllSchedulesBySectionId(Long sectionId) {
        return scheduleRepository.findSchedulesBySectionId(sectionId);
    }

    public List<Schedule> getAllRequestedSchedules(Long requesterId){
        return scheduleRepository.findByRequesterId(requesterId);
    }

    @Override
    public List<Schedule> getSchedulesByRecurrenceId(UUID recurrenceId) {
        return scheduleRepository.getSchedulesByRecurrenceId(recurrenceId);
    }

    @Override
    public List<Schedule> findConflictingSchedules(Date scheduleDate, Time startTime, Time endTime, Laboratory laboratory) {
        return scheduleRepository.findConflictingSchedules(scheduleDate, startTime, endTime, laboratory);
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
                        schedule.getEndTime(),
                        schedule.getLaboratory()
                );

        if(!conflictingSchedule.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }


        List<Schedule> schedules = new ArrayList<>();
        List<User> students = userRepository.findBySectionId(schedule.getSection().getId());

        if(schedule.getRecurrence() == Recurrence.NONE) {
            List<ScheduleStudent> scheduleStudents = new ArrayList<>();
            for (User student : students){
                ScheduleStudent scheduleStudent = new ScheduleStudent(schedule, student);
                scheduleStudents.add(scheduleStudent);
            }

            schedule.setScheduleStudents(scheduleStudents);
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
            for (int index = 0; index < schedule.getRecurrenceDays().size(); index++) {
                String day = schedule.getRecurrenceDays().get(index);

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

                List<ScheduleStudent> scheduleStudents = new ArrayList<>();
                for (User student : students) {
                    ScheduleStudent scheduleStudent = new ScheduleStudent(newSchedule, student);
                    scheduleStudents.add(scheduleStudent);
                }
                newSchedule.setScheduleStudents(scheduleStudents);

                // Set recurrenceDays to the current index day
                newSchedule.setRecurrenceDays(Collections.singletonList(day));

                newSchedule.setRecurrenceInterval(schedule.getRecurrenceInterval());
                schedules.add(newSchedule);

                // Move to the next day to avoid duplicate entries for the same day
                startDate.add(Calendar.DAY_OF_MONTH, 1);
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

            for (Schedule relatedSchedule : relatedSchedules) {

                LocalDate relatedDate = convertToLocalDate(relatedSchedule.getScheduleDate());

                LocalDate newScheduleDate = relatedDate.plusDays(gapInDays);

                relatedSchedule.setScheduleDate(convertToDate(newScheduleDate));

                scheduleRepository.save(relatedSchedule);

                logger.info("Related Date: " + relatedSchedule.getScheduleDate()
                        + "Day: " + relatedSchedule.getScheduleDate().toLocalDate().getDayOfWeek());
                scheduleRepository.updateRecurrenceDays(relatedSchedule.getId(),
                            String.valueOf(newScheduleDate.getDayOfWeek()).substring(0,3));

            }

            return schedule;
        }
        return scheduleRepository.save(schedule);
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
            List<Schedule> schedules = scheduleRepository.findByRecurrenceId(schedule.getRecurrenceId());

            for (Schedule scheduleItem : schedules) {
                scheduleStudentRepository.deleteByScheduleId(scheduleItem.getId());
            }

            scheduleRepository.deleteByRecurrenceId(schedule.getRecurrenceId());
        } else {
            scheduleStudentRepository.deleteByScheduleId(id);
            scheduleRepository.deleteById(id);
        }
    }
}
