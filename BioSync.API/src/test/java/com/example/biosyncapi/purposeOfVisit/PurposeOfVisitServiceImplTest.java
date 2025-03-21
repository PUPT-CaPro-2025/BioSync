package com.example.biosyncapi.purposeOfVisit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class PurposeOfVisitServiceImplTest {

  private PurposeOfVisitRepository purposeOfVisitRepository;
  private PurposeOfVisitServiceImpl purposeOfVisitService;

  @BeforeEach
  void setUp() {
    purposeOfVisitRepository = mock(PurposeOfVisitRepository.class);
    purposeOfVisitService = new PurposeOfVisitServiceImpl(purposeOfVisitRepository);
  }

  @Test
  void testGetPurposeOfVisit() {
    List<PurposeOfVisit> mockList = Arrays.asList(new PurposeOfVisit(), new PurposeOfVisit());
    when(purposeOfVisitRepository.findAll()).thenReturn(mockList);

    List<PurposeOfVisit> result = purposeOfVisitService.getPurposeOfVisit();

    assertEquals(2, result.size());
    verify(purposeOfVisitRepository).findAll();
  }

  @Test
  void testAddPurposeOfVisit() {
    PurposeOfVisit pv = new PurposeOfVisit("Research");

    when(purposeOfVisitRepository.save(pv)).thenReturn(pv);

    PurposeOfVisit result = purposeOfVisitService.addPurposeOfVisit(pv);

    assertEquals("Research", result.getPurposeOfVisit());
    verify(purposeOfVisitRepository).save(pv);
  }

  @Test
  void testUpdatePurposeOfVisit() {
    PurposeOfVisit pv = new PurposeOfVisit();
    pv.setPurposeOfVisit("Consultation");

    when(purposeOfVisitRepository.save(pv)).thenReturn(pv);

    PurposeOfVisit result = purposeOfVisitService.updatePurposeOfVisit(pv);

    assertEquals("Consultation", result.getPurposeOfVisit());
    verify(purposeOfVisitRepository).save(pv);
  }

  @Test
  void testDeletePurposeOfVisitById() {
    Long id = 1L;

    purposeOfVisitService.deletePurposeOfVisitById(id);

    verify(purposeOfVisitRepository).deleteById(id);
  }
}
