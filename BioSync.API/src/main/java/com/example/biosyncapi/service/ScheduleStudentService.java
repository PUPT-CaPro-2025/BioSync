package com.example.biosyncapi.service;

import com.example.biosyncapi.model.ScheduleStudent;

import java.util.List;

public interface ScheduleStudentService {
    List<ScheduleStudent> getAllByScheduleId(Long userId);
}