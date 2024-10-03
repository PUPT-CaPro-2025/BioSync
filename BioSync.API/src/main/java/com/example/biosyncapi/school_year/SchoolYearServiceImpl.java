package com.example.biosyncapi.school_year;

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
    public SchoolYear updateSchoolYear(SchoolYear updatedSchoolYear) throws Exception {
        Optional<SchoolYear> oldSchoolYearOpt = schoolYearRepository.findById(updatedSchoolYear.getId());

        if (oldSchoolYearOpt.isEmpty()) { throw new Exception("School Year not found"); }

        SchoolYear oldSchoolYear = oldSchoolYearOpt.get();

        oldSchoolYear.getFirstSemester().setStartDate(updatedSchoolYear.getFirstSemester().getStartDate());
        oldSchoolYear.getFirstSemester().setEndDate(updatedSchoolYear.getFirstSemester().getEndDate());

        oldSchoolYear.getSecondSemester().setStartDate(updatedSchoolYear.getSecondSemester().getStartDate());
        oldSchoolYear.getSecondSemester().setEndDate(updatedSchoolYear.getSecondSemester().getEndDate());

        oldSchoolYear.getSummerSemester().setStartDate(updatedSchoolYear.getSummerSemester().getStartDate());
        oldSchoolYear.getSummerSemester().setEndDate(updatedSchoolYear.getSummerSemester().getEndDate());
        return schoolYearRepository.save(oldSchoolYear);
    }

    @Override
    public void deleteSchoolYearById(Long id) {
        schoolYearRepository.deleteById(id);
    }
}
