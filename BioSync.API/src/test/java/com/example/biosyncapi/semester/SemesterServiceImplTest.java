package com.example.biosyncapi.semester;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SemesterServiceImplTest {

  private SemesterRepository semesterRepository;
  private SemesterServiceImpl semesterService;

  @BeforeEach
  void setUp() {
    semesterRepository = mock(SemesterRepository.class);
    semesterService = new SemesterServiceImpl(semesterRepository);
  }

  @Test
  void testGetAllSemesters() {
    when(semesterRepository.findAll()).thenReturn(List.of(new Semester(), new Semester()));

    List<Semester> semesters = semesterService.getAllSemesters();

    assertEquals(2, semesters.size());
    verify(semesterRepository).findAll();
  }

  @Test
  void testGetSemesterById() {
    Semester semester = new Semester();
    semester.setId(1L);

    when(semesterRepository.findById(1L)).thenReturn(Optional.of(semester));

    Optional<Semester> result = semesterService.getSemesterById(1L);

    assertTrue(result.isPresent());
    assertEquals(1L, result.get().getId());
    verify(semesterRepository).findById(1L);
  }

  @Test
  void testCreateSemester() {
    Semester semester = new Semester();
    semester.setName("1st Semester");

    Date startDate = new Date();

    Calendar calendar = Calendar.getInstance();
    calendar.setTime(startDate);
    calendar.add(Calendar.DAY_OF_MONTH, 90);
    Date endDate = calendar.getTime();

    semester.setStartDate(startDate);
    semester.setEndDate(endDate);

    when(semesterRepository.save(semester)).thenReturn(semester);

    Semester result = semesterService.createSemester(semester);

    assertEquals("1st Semester", result.getName());
    verify(semesterRepository).save(semester);
  }

  @Test
  void testUpdateSemester() {
    Semester semester = new Semester();
    semester.setId(2L);
    semester.setName("Updated Semester");

    when(semesterRepository.save(semester)).thenReturn(semester);

    Semester result = semesterService.updateSemester(semester);

    assertEquals("Updated Semester", result.getName());
    verify(semesterRepository).save(semester);
  }

  @Test
  void testDeleteSemester() {
    semesterService.deleteSemester(1L);
    verify(semesterRepository).deleteById(1L);
  }
}
