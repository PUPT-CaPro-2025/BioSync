package com.example.biosyncapi.school_year;

import java.util.List;
import java.util.Optional;

public interface SchoolYearService {
    List<SchoolYear> getAllSchoolYears();
    Optional<SchoolYear> getSchoolYearById(Long id);
    SchoolYear saveSchoolYear(SchoolYear schoolYear);
    SchoolYear updateSchoolYear(SchoolYear schoolYear) throws Exception;
    void deleteSchoolYearById(Long id);
}
