package com.example.biosyncapi.user;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
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

  void processProfileImageToBucket(Long userId, MultipartFile image) throws IOException;

  void processEditProfileImageToBucket(Long userId, MultipartFile image) throws IOException;

  String getProfileImageUrl(Long userId);

  HashMap<User, String> processCSV(MultipartFile file) throws Exception;

  User mapToUser(String[] csvRow, String password);

}
