package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Semester;

import java.util.List;
import java.util.Optional;

public interface SemesterService {
    List<Semester> getAllSemesters();
    Optional<Semester> getSemesterById(Long id);
    Semester createSemester(Semester semester);
    Semester updateSemester(Semester semester);
    void deleteSemester(Long id);
}
