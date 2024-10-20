package com.example.biosyncapi.section;

import com.example.biosyncapi.program.Program;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, Long> {
    Section findByProgramAndYearAndSection(Program program, String year, int section);
}
