package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
}
