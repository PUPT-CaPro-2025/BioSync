package com.example.biosyncapi.school_year;

import com.example.biosyncapi.semester.Semester;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SchoolYearServiceImplTest {

  private SchoolYearRepository schoolYearRepository;
  private SchoolYearServiceImpl schoolYearService;

  @BeforeEach
  void setUp() {
    schoolYearRepository = mock(SchoolYearRepository.class);
    schoolYearService = new SchoolYearServiceImpl(schoolYearRepository);
  }

  @Test
  void testGetAllSchoolYears() {
    when(schoolYearRepository.findAll()).thenReturn(List.of(new SchoolYear(), new SchoolYear()));

    List<SchoolYear> result = schoolYearService.getAllSchoolYears();

    assertEquals(2, result.size());
    verify(schoolYearRepository).findAll();
  }

  @Test
  void testGetSchoolYearById() {
    SchoolYear schoolYear = new SchoolYear();
    schoolYear.setId(1L);

    when(schoolYearRepository.findById(1L)).thenReturn(Optional.of(schoolYear));

    Optional<SchoolYear> result = schoolYearService.getSchoolYearById(1L);

    assertTrue(result.isPresent());
    assertEquals(1L, result.get().getId());
    verify(schoolYearRepository).findById(1L);
  }

  @Test
  void testSaveSchoolYear() {
    SchoolYear schoolYear = new SchoolYear();
    when(schoolYearRepository.save(schoolYear)).thenReturn(schoolYear);

    SchoolYear result = schoolYearService.saveSchoolYear(schoolYear);

    assertNotNull(result);
    verify(schoolYearRepository).save(schoolYear);
  }

  @Test
  void testUpdateSchoolYear_Success() throws Exception {
    // Original SchoolYear
    Semester oldFirst = new Semester();
    Semester oldSecond = new Semester();
    Semester oldSummer = new Semester();

    SchoolYear oldSchoolYear = new SchoolYear(1L, 2024, 2025, oldFirst, oldSecond, oldSummer);

    // Updated Semester dates using Calendar for java.util.Date
    Semester newFirst = new Semester();
    newFirst.setStartDate(getDate(2024, Calendar.JUNE, 1));
    newFirst.setEndDate(getDate(2024, Calendar.OCTOBER, 31));

    Semester newSecond = new Semester();
    newSecond.setStartDate(getDate(2024, Calendar.NOVEMBER, 1));
    newSecond.setEndDate(getDate(2025, Calendar.MARCH, 31));

    Semester newSummer = new Semester();
    newSummer.setStartDate(getDate(2025, Calendar.APRIL, 1));
    newSummer.setEndDate(getDate(2025, Calendar.MAY, 31));

    SchoolYear updatedSchoolYear = new SchoolYear(1L, 2024, 2025, newFirst, newSecond, newSummer);

    when(schoolYearRepository.findById(1L)).thenReturn(Optional.of(oldSchoolYear));
    when(schoolYearRepository.save(any())).thenReturn(oldSchoolYear);

    SchoolYear result = schoolYearService.updateSchoolYear(updatedSchoolYear);

    assertEquals(newFirst.getStartDate(), result.getFirstSemester().getStartDate());
    assertEquals(newSecond.getEndDate(), result.getSecondSemester().getEndDate());
    assertEquals(newSummer.getStartDate(), result.getSummerSemester().getStartDate());

    verify(schoolYearRepository).findById(1L);
    verify(schoolYearRepository).save(oldSchoolYear);
  }

  @Test
  void testUpdateSchoolYear_NotFound() {
    SchoolYear updated = new SchoolYear();
    updated.setId(99L);

    when(schoolYearRepository.findById(99L)).thenReturn(Optional.empty());

    Exception exception = assertThrows(Exception.class, () -> {
      schoolYearService.updateSchoolYear(updated);
    });

    assertEquals("School Year not found", exception.getMessage());
    verify(schoolYearRepository).findById(99L);
    verify(schoolYearRepository, never()).save(any());
  }

  @Test
  void testDeleteSchoolYearById() {
    schoolYearService.deleteSchoolYearById(1L);
    verify(schoolYearRepository).deleteById(1L);
  }

  //region Helper Methods
  private Date getDate(int year, int month, int day) {
    Calendar calendar = Calendar.getInstance();
    calendar.set(Calendar.YEAR, year);
    calendar.set(Calendar.MONTH, month);
    calendar.set(Calendar.DAY_OF_MONTH, day);
    calendar.set(Calendar.HOUR_OF_DAY, 0);
    calendar.set(Calendar.MINUTE, 0);
    calendar.set(Calendar.SECOND, 0);
    calendar.set(Calendar.MILLISECOND, 0);
    return calendar.getTime();
  }
  //endregion
}
