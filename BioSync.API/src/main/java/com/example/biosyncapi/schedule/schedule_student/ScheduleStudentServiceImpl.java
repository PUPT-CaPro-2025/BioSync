package com.example.biosyncapi.schedule.schedule_student;

import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.schedule.ScheduleRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleStudentServiceImpl implements ScheduleStudentService {

    private final ScheduleStudentRepository scheduleStudentRepository;
    private final ScheduleRepository scheduleRepository;


    public ScheduleStudentServiceImpl(ScheduleStudentRepository scheduleStudentRepository, ScheduleRepository scheduleRepository) {
        this.scheduleStudentRepository = scheduleStudentRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Override
    public List<ScheduleStudent> getAllByScheduleId(Long userId) {
        return scheduleStudentRepository.findByScheduleId(userId);
    }

    public List<User> getStudentsByScheduleId(Long scheduleId) throws RuntimeException {
        Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
        if(schedule == null) throw new RuntimeException("Schedule not found");

        List<ScheduleStudent> scheduleStudents = scheduleStudentRepository.findByScheduleId(schedule.getId());

        List<User> users = new ArrayList<>();

        for (ScheduleStudent scheduleStudent : scheduleStudents) {
            users.add(scheduleStudent.getStudent());
        }

        return users;
    }

    @Override
    public void addStudentToSchedule(Schedule schedule, User student) throws DataAccessException {
        if(schedule.getRecurrenceId() == null){
            ScheduleStudent scheduleStudent = new ScheduleStudent(schedule, student);
            scheduleStudentRepository.save(scheduleStudent);
            return;
        }

        List<Schedule> scheduleList = scheduleRepository.findByRecurrenceId(schedule.getRecurrenceId());

        for (Schedule scheduleItem : scheduleList) {
            List<User> students = this.getStudentsByScheduleId(scheduleItem.getId());

            boolean isUserOnList = students.stream()
                    .anyMatch(existingStudent -> existingStudent.getId().equals(student.getId()));

            if(isUserOnList) continue;

            ScheduleStudent scheduleStudent = new ScheduleStudent(scheduleItem, student);
            scheduleStudentRepository.save(scheduleStudent);
        }

    }

}