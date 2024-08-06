package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramRepository extends JpaRepository<Program, Long> {
}
