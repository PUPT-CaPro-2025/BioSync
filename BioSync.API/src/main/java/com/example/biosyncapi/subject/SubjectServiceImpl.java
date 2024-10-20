package com.example.biosyncapi.subject;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubjectServiceImpl implements SubjectService {

  private final SubjectRepository subjectRepository;

  public SubjectServiceImpl(SubjectRepository subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  @Override
  public List<Subject> getAllSubjects() {
    return subjectRepository.findAll();
  }

  @Override
  public Optional<Subject> getSubjectById(Long id) {
    return subjectRepository.findById(id);
  }

  @Override
  public Subject createSubject(Subject subject) {
    return subjectRepository.save(subject);
  }

  @Override
  public Subject updateSubject(
      Long id,
      Subject subject)
  {
      if (!subjectRepository.existsById(id)) {
          throw new RuntimeException("Subject not found");
      }

    return subjectRepository.save(subject);
  }

  @Override
  public void deleteSubject(Long id) {
    subjectRepository.deleteById(id);
  }
}
