package com.example.biosyncapi.program;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/programs")
public class ProgramController {

    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    @GetMapping()
    public List<Program> getAllPrograms() {
        return programService.getAllPrograms();
    }

    @GetMapping("/{id}")
    public Optional<Program> getProgramById(@PathVariable Long id) {
        return programService.getProgramById(id);
    }

    @PostMapping()
    public Program createProgram(@RequestBody Program program) {
        return programService.saveProgram(program);
    }

    @PutMapping()
    public Program updateProgram(@RequestBody Program program) {
        return programService.updateProgram(program);
    }

    @DeleteMapping()
    public void deleteProgram(@RequestBody Program program) {
        programService.deleteProgram(program.getId());
    }
}
