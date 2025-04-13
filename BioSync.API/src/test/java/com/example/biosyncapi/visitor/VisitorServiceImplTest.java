package com.example.biosyncapi.visitor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VisitorServiceImplTest {

  @Mock
  private VisitorRepository visitorRepository;

  @InjectMocks
  private VisitorServiceImpl visitorService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void testGetVisitors() {
    List<Visitor> mockVisitors = List.of(new Visitor(), new Visitor());
    when(visitorRepository.findAll()).thenReturn(mockVisitors);

    List<Visitor> visitors = visitorService.getVisitors();

    assertEquals(2, visitors.size());
    verify(visitorRepository, times(1)).findAll();
  }

  @Test
  void testGetVisitorById_Found() {
    Visitor visitor = new Visitor();
    visitor.setId(1L);
    when(visitorRepository.findById(1L)).thenReturn(Optional.of(visitor));

    Optional<Visitor> result = visitorService.getVisitorById(1L);

    assertTrue(result.isPresent());
    assertEquals(1L, result.get().getId());
  }

  @Test
  void testGetVisitorById_NotFound() {
    when(visitorRepository.findById(1L)).thenReturn(Optional.empty());

    Optional<Visitor> result = visitorService.getVisitorById(1L);

    assertFalse(result.isPresent());
  }

  @Test
  void testCreateVisitor() {
    Visitor visitor = new Visitor();
    when(visitorRepository.save(visitor)).thenReturn(visitor);

    Visitor result = visitorService.createVisitor(visitor);

    assertNotNull(result);
    verify(visitorRepository).save(visitor);
  }

  @Test
  void testUpdateVisitor() {
    Visitor visitor = new Visitor();
    visitor.setId(1L);
    when(visitorRepository.save(visitor)).thenReturn(visitor);

    Visitor result = visitorService.updateVisitor(visitor);

    assertNotNull(result);
    assertEquals(1L, result.getId());
    verify(visitorRepository).save(visitor);
  }

  @Test
  void testDeleteVisitor() {
    Long id = 1L;
    doNothing().when(visitorRepository).deleteById(id);

    visitorService.deleteVisitor(id);

    verify(visitorRepository, times(1)).deleteById(id);
  }
}
