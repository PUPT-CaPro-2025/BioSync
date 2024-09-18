package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Role;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.repository.FingerprintRepository;
import com.example.biosyncapi.repository.TokenRepository;
import com.example.biosyncapi.repository.UserRepository;
import com.example.biosyncapi.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Value("${profileImage.directory}")
    private String profileImageDirectory;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final FingerprintRepository fingerprintRepository;

    public UserServiceImpl(UserRepository userRepository, TokenRepository tokenRepository, FingerprintRepository fingerprintRepository) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.fingerprintRepository = fingerprintRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return this.userRepository.findAll();
    }

    @Override
    public List<User> getUsersByRole(Role role) {
        return this.userRepository.getUsersByRole(role);
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return this.userRepository.findById(id);
    }

    @Override
    public User createUser(User user) {
        return this.userRepository.save(user);
    }

    @Override
    public User updateUser(User user) {
        return this.userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        this.tokenRepository.deleteByUserId(id);
        this.fingerprintRepository.deleteByUserId(id);
        this.userRepository.deleteById(id);
    }

    @Override
    public List<User> getUsersBySectionId(Long sectionId) {
        return this.userRepository.findBySectionId(sectionId);
    }

    @Override
    public void processProfileImage(Long userId, MultipartFile image) {
        Optional<User> user = userRepository.findById(userId);
        if(user.isEmpty()) throw new RuntimeException("User not found");

        File dir = new File(profileImageDirectory);
        if(!dir.exists()) {
            boolean created = dir.mkdirs();

            if(!created) throw new RuntimeException("Failed to create fingerprints directory");
        }

        String uniqueFileName = UUID.randomUUID() + "-" + image.getOriginalFilename();
        Path filePath = Paths.get(profileImageDirectory, uniqueFileName);
        try {
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            User userToUpdate = user.get();
            userToUpdate.setUserImagePath(filePath.toAbsolutePath().toString());
            userRepository.save(userToUpdate);
        }catch (IOException e) {
            throw new RuntimeException("Failed to store fingerprint file", e);
        }
    }
}
