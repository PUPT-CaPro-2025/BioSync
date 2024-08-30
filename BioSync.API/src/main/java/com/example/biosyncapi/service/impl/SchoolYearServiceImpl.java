package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.SchoolYear;
import com.example.biosyncapi.repository.SchoolYearRepository;
import com.example.biosyncapi.service.SchoolYearService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SchoolYearServiceImpl implements SchoolYearService {

    private final SchoolYearRepository schoolYearRepository;

    public SchoolYearServiceImpl(SchoolYearRepository schoolYearRepository) {
        this.schoolYearRepository = schoolYearRepository;
    }

    @Override
    public List<SchoolYear> getAllSchoolYears() {
        return schoolYearRepository.findAll();
    }

    @Override
    public Optional<SchoolYear> getSchoolYearById(Long id) {
        return schoolYearRepository.findById(id);
    }

    @Override
    public SchoolYear saveSchoolYear(SchoolYear schoolYear) {
        return schoolYearRepository.save(schoolYear);
    }

    @Override
    public SchoolYear updateSchoolYear(SchoolYear schoolYear) {
        return schoolYearRepository.save(schoolYear);
    }

    @Override
    public void deleteSchoolYearById(Long id) {
        schoolYearRepository.deleteById(id);
    }
}
