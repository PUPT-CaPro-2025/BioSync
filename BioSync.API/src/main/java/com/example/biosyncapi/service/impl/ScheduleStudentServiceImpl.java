package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Schedule;
import com.example.biosyncapi.model.ScheduleStudent;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.repository.ScheduleRepository;
import com.example.biosyncapi.repository.ScheduleStudentRepository;
import com.example.biosyncapi.service.ScheduleStudentService;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

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

    @Override
    public void addStudentToSchedule(Schedule schedule, User student) throws DataAccessException {
        if(schedule.getRecurrenceId() == null){
            ScheduleStudent scheduleStudent = new ScheduleStudent(schedule, student);
            scheduleStudentRepository.save(scheduleStudent);
            return;
        }

        List<Schedule> scheduleList = scheduleRepository.findByRecurrenceId(schedule.getRecurrenceId());

        for (Schedule scheduleItem : scheduleList) {
            ScheduleStudent scheduleStudent = new ScheduleStudent(scheduleItem, student);
            scheduleStudentRepository.save(scheduleStudent);
        }

    }


}