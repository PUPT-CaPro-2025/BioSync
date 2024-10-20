package com.example.biosyncapi.program;

import java.util.List;
import java.util.Optional;

public interface ProgramService {
  List<Program> getAllPrograms();

  Optional<Program> getProgramById(Long id);

  Program saveProgram(Program program);

  Program updateProgram(Program program);

  void deleteProgram(Long id);
}
