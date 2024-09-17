package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Role;
import com.example.biosyncapi.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();
    List<User> getUsersByRole(Role role);
    List<User> getUsersBySectionId(Long sectionId);
    Optional<User> getUserById(Long id);
    User createUser(User user);
    User updateUser(User user);
    void deleteUser(Long id);
    void processProfileImage(Long userId, MultipartFile image);
}
