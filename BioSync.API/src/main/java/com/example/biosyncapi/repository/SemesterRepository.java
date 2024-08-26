package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
}
