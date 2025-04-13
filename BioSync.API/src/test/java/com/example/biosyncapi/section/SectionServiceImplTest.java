package com.example.biosyncapi.section;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SectionServiceImplTest {

  private SectionRepository sectionRepository;
  private SectionServiceImpl sectionService;

  @BeforeEach
  void setUp() {
    sectionRepository = mock(SectionRepository.class);
    sectionService = new SectionServiceImpl(sectionRepository);
  }

  @Test
  void testGetAllSections() {
    when(sectionRepository.findAll()).thenReturn(List.of(new Section(), new Section()));

    List<Section> result = sectionService.getAllSections();

    assertEquals(2, result.size());
    verify(sectionRepository).findAll();
  }

  @Test
  void testGetSectionById() {
    Section section = new Section();
    section.setId(1L);

    when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

    Optional<Section> result = sectionService.getSectionById(1L);

    assertTrue(result.isPresent());
    assertEquals(1L, result.get().getId());
    verify(sectionRepository).findById(1L);
  }

  @Test
  void testGetSectionsByProgramId() {
    when(sectionRepository.findByProgramId(100L)).thenReturn(List.of(new Section(), new Section()));

    List<Section> result = sectionService.getSectionsByProgramId(100L);

    assertEquals(2, result.size());
    verify(sectionRepository).findByProgramId(100L);
  }

  @Test
  void testSaveSection() {
    Section section = new Section();
    when(sectionRepository.save(section)).thenReturn(section);

    Section result = sectionService.saveSection(section);

    assertNotNull(result);
    verify(sectionRepository).save(section);
  }

  @Test
  void testUpdateSection() {
    Section section = new Section();
    section.setId(2L);
    section.setSection(1);

    when(sectionRepository.save(section)).thenReturn(section);

    Section result = sectionService.updateSection(section);

    assertEquals(1, result.getSection());
    verify(sectionRepository).save(section);
  }

  @Test
  void testDeleteSection() {
    sectionService.deleteSection(1L);
    verify(sectionRepository).deleteById(1L);
  }
}
