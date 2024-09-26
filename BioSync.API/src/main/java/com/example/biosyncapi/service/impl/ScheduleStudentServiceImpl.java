package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.ScheduleStudent;
import com.example.biosyncapi.repository.ScheduleStudentRepository;
import com.example.biosyncapi.service.ScheduleStudentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleStudentServiceImpl implements ScheduleStudentService {

    private final ScheduleStudentRepository scheduleStudentRepository;

    public ScheduleStudentServiceImpl(ScheduleStudentRepository scheduleStudentRepository) {
        this.scheduleStudentRepository = scheduleStudentRepository;
    }

    @Override
    public List<ScheduleStudent> getAllByScheduleId(Long userId) {
        return scheduleStudentRepository.findByScheduleId(userId);
    }
}