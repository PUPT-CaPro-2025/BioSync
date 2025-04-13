package com.example.biosyncapi.laboratory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class LaboratoryServiceImplTest {

  private LaboratoryRepository laboratoryRepository;
  private LaboratoryServiceImpl laboratoryService;

  @BeforeEach
  void setUp() {
    laboratoryRepository = mock(LaboratoryRepository.class);
    laboratoryService = new LaboratoryServiceImpl(laboratoryRepository);
  }

  @Test
  void testGetAllLaboratories() {
    List<Laboratory> expectedLabs = Arrays.asList(new Laboratory(), new Laboratory());
    when(laboratoryRepository.findAll()).thenReturn(expectedLabs);

    List<Laboratory> actualLabs = laboratoryService.getAllLaboratories();

    assertEquals(expectedLabs.size(), actualLabs.size());
    verify(laboratoryRepository, times(1)).findAll();
  }

  @Test
  void testGetLaboratoryById_Found() {
    Laboratory lab = new Laboratory();
    lab.setId(1L);

    when(laboratoryRepository.findById(1L)).thenReturn(Optional.of(lab));

    Optional<Laboratory> result = laboratoryService.getLaboratoryById(1L);

    assertTrue(result.isPresent());
    assertEquals(1L, result.get().getId());
    verify(laboratoryRepository).findById(1L);
  }

  @Test
  void testGetLaboratoryById_NotFound() {
    when(laboratoryRepository.findById(999L)).thenReturn(Optional.empty());

    Optional<Laboratory> result = laboratoryService.getLaboratoryById(999L);

    assertFalse(result.isPresent());
    verify(laboratoryRepository).findById(999L);
  }

  @Test
  void testCreateLaboratory() {
    Laboratory lab = new Laboratory();
    lab.setName("Lab A");

    when(laboratoryRepository.save(lab)).thenReturn(lab);

    Laboratory result = laboratoryService.createLaboratory(lab);

    assertEquals("Lab A", result.getName());
    verify(laboratoryRepository).save(lab);
  }

  @Test
  void testUpdateLaboratory() {
    Laboratory lab = new Laboratory();
    lab.setId(1L);
    lab.setName("Updated Lab");

    when(laboratoryRepository.save(lab)).thenReturn(lab);

    Laboratory result = laboratoryService.updateLaboratory(lab);

    assertEquals("Updated Lab", result.getName());
    verify(laboratoryRepository).save(lab);
  }

  @Test
  void testDeleteLaboratory() {
    laboratoryService.deleteLaboratory(1L);
    verify(laboratoryRepository).deleteById(1L);
  }
}
