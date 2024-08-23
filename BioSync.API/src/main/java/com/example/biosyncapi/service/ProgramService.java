package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Program;

import java.util.List;
import java.util.Optional;

public interface ProgramService {
    List<Program> getAllPrograms();
    Optional<Program> getProgramById(Long id);
    Program saveProgram(Program program);
    Program updateProgram(Program program);
    void deleteProgram(Long id);
}
