package com.example.biosyncapi.schedule;

import com.example.biosyncapi.laboratory.Laboratory;
import com.example.biosyncapi.laboratory.LaboratoryRepository;
import com.example.biosyncapi.program.Program;
import com.example.biosyncapi.program.ProgramRepository;
import com.example.biosyncapi.school_year.SchoolYear;
import com.example.biosyncapi.school_year.SchoolYearRepository;
import com.example.biosyncapi.section.Section;
import com.example.biosyncapi.section.SectionRepository;
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
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.*;
import java.util.logging.Logger;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ScheduleStudentRepository scheduleStudentRepository;
    private final ProgramRepository programRepository;
    private final SectionRepository sectionRepository;
    private final SchoolYearRepository schoolYearRepository;
    private final LaboratoryRepository laboratoryRepository;

    public ScheduleServiceImpl(ScheduleRepository scheduleRepository, SubjectRepository subjectRepository, UserRepository userRepository, ScheduleStudentRepository scheduleStudentRepository, ProgramRepository programRepository, SectionRepository sectionRepository, SchoolYearRepository schoolYearRepository, LaboratoryRepository laboratoryRepository) {
        this.scheduleRepository = scheduleRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.scheduleStudentRepository = scheduleStudentRepository;
        this.programRepository = programRepository;
        this.sectionRepository = sectionRepository;
        this.schoolYearRepository = schoolYearRepository;
        this.laboratoryRepository = laboratoryRepository;
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

    public List<Schedule> getAllPendingSchedules(){
        return scheduleRepository.findAllByStatus(Status.PENDING);
    }

    public List<Schedule> getAllRequestedSchedules(Long requesterId){
        return scheduleRepository.findByRequesterId(requesterId);
    }

    @Override
    public List<Schedule> getSchedulesByRecurrenceId(UUID recurrenceId) {
        return scheduleRepository.getSchedulesByRecurrenceId(recurrenceId);
    }

    @Override
    public List<Schedule> findConflictingSchedules(Date scheduleDate,
        Time startTime, Time endTime, Laboratory laboratory,
        SchoolYear schoolYear, Semester semester) {
        return scheduleRepository.findConflictingSchedules(scheduleDate,
            startTime, endTime, laboratory, schoolYear, semester);
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
                        schedule.getLaboratory(),
                        schedule.getSchoolYear(),
                        schedule.getSemester()
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
            if(schedule.getRequester() != null){
                schedule.setRequester(schedule.getProfessor());
            }
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
                if(schedule.getRequester() != null){
                    newSchedule.setRequester(schedule.getProfessor());
                }
                newSchedule.setStatus(schedule.getStatus());

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

        Schedule existingSchedule = scheduleRepository.findById(schedule.getId())
            .orElseThrow();

        if (schedule.getScheduleStudents() != null) {
            List<ScheduleStudent> existingStudents = existingSchedule.getScheduleStudents();

            existingStudents.clear();

            schedule.getScheduleStudents().forEach(newStudent -> {
                newStudent.setSchedule(existingSchedule);
                existingStudents.add(newStudent);
            });
        }

        existingSchedule.setStartTime(schedule.getStartTime());
        existingSchedule.setEndTime(schedule.getEndTime());
        existingSchedule.setSubject(schedule.getSubject());
        existingSchedule.setSection(schedule.getSection());
        existingSchedule.setLaboratory(schedule.getLaboratory());
        existingSchedule.setProfessor(schedule.getProfessor());
        existingSchedule.setSemester(schedule.getSemester());
        existingSchedule.setRemarks(schedule.getRemarks());
        existingSchedule.setScheduleDate(schedule.getScheduleDate());
        existingSchedule.setRecurrenceDays(schedule.getRecurrenceDays());

        return scheduleRepository.save(existingSchedule);
    }



    public Schedule updatePartialSchedule(Long id, Status updates) {
        Schedule existingSchedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));

        if(existingSchedule.getRecurrence() != Recurrence.NONE) {
            List<Schedule> relatedSchedules = scheduleRepository.findByRecurrenceId(existingSchedule.getRecurrenceId());

            for (Schedule relatedSchedule : relatedSchedules) {
                relatedSchedule.setStatus(updates);
            }

            scheduleRepository.saveAll(relatedSchedules);
            return existingSchedule;
        }

        existingSchedule.setStatus(updates);

        return scheduleRepository.save(existingSchedule);
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

    @Override
    public List<Schedule> syncSchedulesFromApi(Map<String, Object> jsonFromSite) {
        Map<String, Object> apiData =
            (Map<String, Object>) jsonFromSite.get("computer_laboratory_schedules");

        List<Schedule> addedSchedules = new ArrayList<>();

        int academicYearStart = (int) apiData.get("academic_year_start");
        int academicYearEnd = (int) apiData.get("academic_year_end");
        int semesterNumber =  (int) apiData.get("semester");

        List<Map<String, Object>> rooms = (List<Map<String, Object>>) apiData.get("rooms");

        for (Map<String, Object> room : rooms) {
            String roomCode = (String) room.get("room_code");
            List<Map<String, Object>> schedules = (List<Map<String, Object>>) room.get("schedules");

            Laboratory laboratory = this.laboratoryRepository
                    .findByRoomCode(extractRoomName(roomCode));

            System.out.print("Labojhean: " + laboratory.toString());

            for (Map<String, Object> scheduleData : schedules) {
                Schedule schedule = new Schedule();

                Map<String, Object> courseDetails = (Map<String, Object>) scheduleData.get("course_details");

                //Map Subject
                Subject subject;
                String subjectCode = (String) courseDetails.get("course_code");
                subject = this.subjectRepository.findByCode(subjectCode);
                schedule.setSubject(subject);

                System.out.print("Subjhean: " + subject.toString());

                // Map professor
                User professor;
                String facultyCode = (String) scheduleData.get("faculty_code");
                professor = this.userRepository.findByUsercode(facultyCode).get();
                schedule.setProfessor(professor);

                // Map program
                Program program;
                String abbreviation = (String) scheduleData.get("program_code");
                program = this.programRepository.findByProgramAbbreviation(abbreviation).get();

                System.out.println("MUSTAAARD");
                //Map Section
                Section section;

                System.out.println(scheduleData.get("section_name").getClass().getName());
                System.out.println(scheduleData.get("year_level").getClass().getName());
                int sectionSelected = Integer.parseInt((String) scheduleData.get("section_name"));
                String yearLevel =  scheduleData.get("year_level").toString();
                section = this.sectionRepository.findByProgramAndYearAndSection(program, yearLevel, sectionSelected);
                schedule.setSection(section);

                // Map schedule time and date
                schedule.setStartTime(Time.valueOf(LocalTime.parse((String) scheduleData.get("start_time"))));
                schedule.setEndTime(Time.valueOf(LocalTime.parse((String) scheduleData.get("end_time"))));
                schedule.setScheduleDate(calculateDate((String) scheduleData.get("day")));

                // Map laboratory
                schedule.setLaboratory(laboratory);

                // Map school year
                SchoolYear schoolYear;
                schoolYear = this.schoolYearRepository.
                        findByStartYearAndEndYear(academicYearStart, academicYearEnd);

                schedule.setSchoolYear(schoolYear);

                // Map semester
                if(semesterNumber == 1){
                    schedule.setSemester(schoolYear.getFirstSemester());
                } else if (semesterNumber == 2){
                    schedule.setSemester(schoolYear.getSecondSemester());
                } else {
                    schedule.setSemester(schoolYear.getSummerSemester());
                }

                // Map recurrence (weekly based on day)
                schedule.setRecurrence(Recurrence.WEEKLY);
                schedule.setRecurrenceDays(Collections.singletonList(mapDayToShortForm((String) scheduleData.get("day"))));

                // Set remarks and status
                schedule.setRemarks("Laboratory");
                schedule.setStatus(Status.APPROVED);

                // Call createSchedule
                try {
                    List<Schedule> created = createSchedule(schedule);
                    addedSchedules.addAll(created);
                } catch (ResponseStatusException e) {
                    System.err.println("Conflict or error creating schedule: " + e.getMessage());
                }
            }
        }
        return addedSchedules;
    }

    // Utility to calculate date based on the day (assumes Monday of the current week)
    private Date calculateDate(String day) {
        LocalDate today = LocalDate.now();
        DayOfWeek targetDay = DayOfWeek.valueOf(day.toUpperCase());
        return Date.valueOf(today.with(TemporalAdjusters.nextOrSame(targetDay)));
    }

    // Utility to map day to short form (e.g., "Monday" -> "MON")
    private String mapDayToShortForm(String day) {
        return day.substring(0, 3).toUpperCase();
    }

    public String extractRoomName(String fullRoomCode) {
        String[] parts = fullRoomCode.split(" - ");
        return parts.length > 1 ? parts[1].trim() : fullRoomCode.trim();
    }

}
