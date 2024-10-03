package com.example.biosyncapi.program;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class ProgramServiceImpl implements ProgramService {

    private final ProgramRepository programRepository;

    private ProgramServiceImpl(ProgramRepository programRepository) {
        this.programRepository = programRepository;
    }

    @Override
    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    @Override
    public Optional<Program> getProgramById(Long id) {
        return programRepository.findById(id);
    }

    @Override
    public Program saveProgram(Program program) {
        return programRepository.save(program);
    }

    @Override
    public Program updateProgram(Program program) {
        return programRepository.save(program);
    }

    @Override
    public void deleteProgram(Long id) {
        programRepository.deleteById(id);
    }
}
