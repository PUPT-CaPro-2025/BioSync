package com.example.biosyncapi.laboratory;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LaboratoryRepository extends JpaRepository<Laboratory, Long> {
    Laboratory findByRoomCode(String roomCode);
}
