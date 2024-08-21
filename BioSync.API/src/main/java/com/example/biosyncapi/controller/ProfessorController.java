package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Professor;
import com.example.biosyncapi.service.ProfessorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequestMapping("api/v1/professors")
public class ProfessorController {

    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @GetMapping
    public List<Professor> getAllProfessors() {
        return professorService.getAllProfessors();
    }

    @GetMapping("/{id}")
    public Optional<Professor> getProfessorById(@PathVariable Long id) {
        return  professorService.getProfessorById(id);
    }

    @PostMapping
    public  Professor addProfessor(@RequestBody Professor professor) {
        return professorService.createProfessor(professor);
    }

    @PutMapping
    public Professor updateProfessor(@RequestBody Professor professor) {
        return professorService.updateProfessor(professor);
    }

    @DeleteMapping
    public void deleteProfessor(@RequestBody Professor professor) {
        professorService.deleteProfessor(professor.getId());
    }
}
