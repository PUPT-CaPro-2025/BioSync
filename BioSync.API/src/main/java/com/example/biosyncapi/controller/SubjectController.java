package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Subject;
import com.example.biosyncapi.service.SubjectService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequestMapping("/api/v1/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping()
    public List<Subject> getAllSubjects() {
        return subjectService.getAllSubjects();
    }

    @GetMapping("/{id}")
    public Optional<Subject> getSubject(@PathVariable Long id) {
        return subjectService.getSubjectById(id);
    }

    @PostMapping()
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectService.createSubject(subject);
    }

    @PutMapping()
    public Subject updateSubject(@RequestBody Subject subject) {
        return subjectService.updateSubject(subject.getId(), subject);
    }

    @DeleteMapping()
    public void deleteSubject(@RequestBody Subject subject) {
        subjectService.deleteSubject(subject.getId());
    }
}
