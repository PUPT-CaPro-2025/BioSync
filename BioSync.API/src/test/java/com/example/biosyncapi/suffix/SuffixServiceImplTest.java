package com.example.biosyncapi.suffix;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SuffixServiceImplTest {

  private SuffixRepository suffixRepository;
  private SuffixServiceImpl suffixService;

  @BeforeEach
  void setUp() {
    suffixRepository = mock(SuffixRepository.class);
    suffixService = new SuffixServiceImpl(suffixRepository);
  }

  @Test
  void testGetSuffixes() {
    when(suffixRepository.findAll()).thenReturn(List.of(new Suffix(), new Suffix()));

    List<Suffix> suffixes = suffixService.getSuffixes();

    assertEquals(2, suffixes.size());
    verify(suffixRepository).findAll();
  }

  @Test
  void testGetSuffixById() {
    Suffix suffix = new Suffix();
    suffix.setId(1L);
    suffix.setName("Doctor");
    suffix.setAbbreviation("Dr.");

    when(suffixRepository.findById(1L)).thenReturn(Optional.of(suffix));

    Optional<Suffix> result = suffixService.getSuffixById(1L);

    assertTrue(result.isPresent());
    assertEquals("Dr.", result.get().getAbbreviation());
    assertEquals(1L, result.get().getId());
    verify(suffixRepository).findById(1L);
  }

  @Test
  void testCreateSuffix() {
    Suffix suffix = new Suffix("Senior", "Sr.");

    when(suffixRepository.save(suffix)).thenReturn(suffix);

    Suffix result = suffixService.createSuffix(suffix);

    assertEquals("Sr.", result.getAbbreviation());
    assertEquals("Senior", result.getName());
    verify(suffixRepository).save(suffix);
  }

  @Test
  void testUpdateSuffix() {
    Suffix suffix = new Suffix();
    suffix.setId(3L);
    suffix.setAbbreviation("III");

    when(suffixRepository.save(suffix)).thenReturn(suffix);

    Suffix result = suffixService.updateSuffix(suffix);

    assertEquals("III", result.getAbbreviation());
    verify(suffixRepository).save(suffix);
  }

  @Test
  void testDeleteSuffix() {
    suffixService.deleteSuffix(5L);
    verify(suffixRepository).deleteById(5L);
  }
}
