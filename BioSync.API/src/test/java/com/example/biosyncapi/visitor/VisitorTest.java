package com.example.biosyncapi.visitor;

import org.junit.jupiter.api.Test;

import java.time.ZoneId;
import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.*;

class VisitorTest {

  @Test
  void testCreateVisitorDateInUTCPlus8() {
    Visitor visitor = new Visitor();
    assertNull(visitor.getVisitDate());

    visitor.setVisitDate(ZonedDateTime.now(ZoneId.of("UTC+8")));

    assertNotNull(visitor.getVisitDate());
    assertEquals(ZoneId.of("UTC+8"), visitor.getVisitDate().getZone());
  }

  @Test
  void testConstructorAndGetters() {
    ZonedDateTime now = ZonedDateTime.now(ZoneId.of("UTC+8"));
    Visitor visitor = new Visitor(1L, "John Doe", "Business", "N/A", "Room 101", now);

    assertEquals(1L, visitor.getId());
    assertEquals("John Doe", visitor.getName());
    assertEquals("Business", visitor.getPurposeOfVisit());
    assertEquals("N/A", visitor.getOtherDetails());
    assertEquals("Room 101", visitor.getDestination());
    assertEquals(now, visitor.getVisitDate());
  }

  @Test
  void testSetters() {
    Visitor visitor = new Visitor();
    visitor.setId(5L);
    visitor.setName("Jane");
    visitor.setPurposeOfVisit("Meeting");
    visitor.setOtherDetails("Important");
    visitor.setDestination("Admin Office");

    ZonedDateTime now = ZonedDateTime.now(ZoneId.of("UTC+8"));
    visitor.setVisitDate(now);

    assertEquals(5L, visitor.getId());
    assertEquals("Jane", visitor.getName());
    assertEquals("Meeting", visitor.getPurposeOfVisit());
    assertEquals("Important", visitor.getOtherDetails());
    assertEquals("Admin Office", visitor.getDestination());
    assertEquals(now, visitor.getVisitDate());
  }
}
