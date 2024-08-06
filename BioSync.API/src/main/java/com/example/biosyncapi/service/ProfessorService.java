package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Professor;

import java.util.List;
import java.util.Optional;

public interface ProfessorService {
    List<Professor> getAllProfessors();
    Optional<Professor> getProfessorById(Long id);
    Professor createProfessor(Professor professor);
    Professor updateProfessor(Professor professor);
    void deleteProfessor(Long id);
}
