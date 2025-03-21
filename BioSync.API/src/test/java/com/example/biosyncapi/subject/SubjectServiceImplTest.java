package com.example.biosyncapi.subject;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SubjectServiceImplTest {

  private SubjectRepository subjectRepository;
  private SubjectServiceImpl subjectService;

  @BeforeEach
  void setUp() {
    subjectRepository = mock(SubjectRepository.class);
    subjectService = new SubjectServiceImpl(subjectRepository);
  }

  @Test
  void testGetAllSubjects() {
    when(subjectRepository.findAll()).thenReturn(List.of(new Subject(), new Subject()));

    List<Subject> subjects = subjectService.getAllSubjects();

    assertEquals(2, subjects.size());
    verify(subjectRepository).findAll();
  }

  @Test
  void testGetSubjectById() {
    Subject subject =
        new Subject(1L, "COMPROG1", "Computer Programming 1",
        "The Best");

    when(subjectRepository.findById(1L)).thenReturn(Optional.of(subject));

    Optional<Subject> result = subjectService.getSubjectById(1L);

    assertTrue(result.isPresent());
    assertEquals("COMPROG1", result.get().getCode());
    assertEquals(1L, result.get().getId());
    assertEquals("The Best", result.get().getDescription());
    verify(subjectRepository).findById(1L);
  }

  @Test
  void testCreateSubject() {
    Subject subject = new Subject();
    subject.setCode("ENG102");
    subject.setName("English 102");

    when(subjectRepository.save(subject)).thenReturn(subject);

    Subject result = subjectService.createSubject(subject);

    assertEquals("ENG102", result.getCode());
    assertEquals("English 102", result.getName());
    verify(subjectRepository).save(subject);
  }

  @Test
  void testUpdateSubject_Success() {
    Subject subject = new Subject();
    subject.setId(2L);
    subject.setCode("SCI202");

    when(subjectRepository.existsById(2L)).thenReturn(true);
    when(subjectRepository.save(subject)).thenReturn(subject);

    Subject result = subjectService.updateSubject(2L, subject);

    assertEquals("SCI202", result.getCode());
    verify(subjectRepository).save(subject);
  }

  @Test
  void testUpdateSubject_NotFound() {
    Subject subject = new Subject();
    subject.setId(99L);

    when(subjectRepository.existsById(99L)).thenReturn(false);

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      subjectService.updateSubject(99L, subject);
    });

    assertEquals("Subject not found", exception.getMessage());
    verify(subjectRepository, never()).save(any());
  }

  @Test
  void testDeleteSubject() {
    subjectService.deleteSubject(1L);
    verify(subjectRepository).deleteById(1L);
  }
}
