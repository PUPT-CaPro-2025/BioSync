package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitorRepository extends JpaRepository<Visitor, Long> {
}
