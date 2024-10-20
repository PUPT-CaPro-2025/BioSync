package com.example.biosyncapi.semester;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SemesterServiceImpl implements SemesterService {

  private final SemesterRepository semesterRepository;

  public SemesterServiceImpl(SemesterRepository semesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  @Override
  public List<Semester> getAllSemesters() {
    return semesterRepository.findAll();
  }

  @Override
  public Optional<Semester> getSemesterById(Long id) {
    return semesterRepository.findById(id);
  }

  @Override
  public Semester createSemester(Semester semester) {
    return semesterRepository.save(semester);
  }

  @Override
  public Semester updateSemester(Semester semester) {
    return semesterRepository.save(semester);
  }

  @Override
  public void deleteSemester(Long id) {
    semesterRepository.deleteById(id);
  }
}
