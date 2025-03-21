package com.example.biosyncapi.program;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class ProgramServiceImplTest {

  private ProgramRepository programRepository;
  private ProgramServiceImpl programService;

  @BeforeEach
  void setUp() {
    programRepository = mock(ProgramRepository.class);
    programService = new ProgramServiceImpl(programRepository);
  }

  @Test
  void testGetAllPrograms() {
    List<Program> mockPrograms = Arrays.asList(new Program(), new Program());
    when(programRepository.findAll()).thenReturn(mockPrograms);

    List<Program> result = programService.getAllPrograms();

    assertEquals(2, result.size());
    verify(programRepository, times(1)).findAll();
  }

  @Test
  void testGetProgramById_Found() {
    Program program = new Program();
    program.setId(1L);
    when(programRepository.findById(1L)).thenReturn(Optional.of(program));

    Optional<Program> result = programService.getProgramById(1L);

    assertTrue(result.isPresent());
    assertEquals(1L, result.get().getId());
    verify(programRepository).findById(1L);
  }

  @Test
  void testGetProgramById_NotFound() {
    when(programRepository.findById(999L)).thenReturn(Optional.empty());

    Optional<Program> result = programService.getProgramById(999L);

    assertFalse(result.isPresent());
    verify(programRepository).findById(999L);
  }

  @Test
  void testSaveProgram() {
    Program program =
        new Program(1L, null, "IT", null);
    program.setProgramName("Information Technology");
    program.setProgramDescription("Computers");

    when(programRepository.save(program)).thenReturn(program);

    Program result = programService.saveProgram(program);

    assertEquals("Information Technology", result.getProgramName());
    assertEquals("Computers", result.getProgramDescription());
    verify(programRepository).save(program);
  }

  @Test
  void testUpdateProgram() {
    Program program = new Program();
    program.setId(2L);
    program.setProgramAbbreviation("CS");

    when(programRepository.save(program)).thenReturn(program);

    Program result = programService.updateProgram(program);

    assertEquals("CS", result.getProgramAbbreviation());
    verify(programRepository).save(program);
  }

  @Test
  void testDeleteProgram() {
    Long id = 1L;

    programService.deleteProgram(id);

    verify(programRepository).deleteById(id);
  }
}
