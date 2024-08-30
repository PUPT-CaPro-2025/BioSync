package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Visitor;

import java.util.List;
import java.util.Optional;

public interface VisitorService {
    List<Visitor> getVisitors();
    Optional<Visitor> getVisitorById(Long id);
    Visitor createVisitor(Visitor visitor);
    Visitor updateVisitor(Visitor visitor);
    void deleteVisitor(Long id);
}
