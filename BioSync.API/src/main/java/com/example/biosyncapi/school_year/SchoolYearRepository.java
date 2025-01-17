package com.example.biosyncapi.school_year;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolYearRepository extends JpaRepository<SchoolYear, Long> {
    SchoolYear findByStartYearAndEndYear(int startYear, int endYear);
}
