package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.ProfileImage;
import com.example.biosyncapi.model.Role;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.repository.FingerprintRepository;
import com.example.biosyncapi.repository.ProfileImageRepository;
import com.example.biosyncapi.repository.TokenRepository;
import com.example.biosyncapi.repository.UserRepository;
import com.example.biosyncapi.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

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
    private final ProfileImageRepository profileImageRepository;
    @Value("${aws.s3.bucket.name}")
    private String bucketName;
    private final S3Client s3Client;

    public UserServiceImpl(UserRepository userRepository, TokenRepository tokenRepository, FingerprintRepository fingerprintRepository, S3Client s3Client, ProfileImageRepository profileImageRepository) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.fingerprintRepository = fingerprintRepository;
        this.s3Client = s3Client;
        this.profileImageRepository = profileImageRepository;
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
            String imagePath = filePath.toAbsolutePath().toString();
            ProfileImage profileImage = new ProfileImage(imagePath, user.get());
            profileImageRepository.save(profileImage);
        }catch (IOException e) {
            throw new RuntimeException("Failed to store fingerprint file", e);
        }
    }

    @Override
    public void processProfileImageToBucket(Long userId, MultipartFile image) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String uniqueFileName = UUID.randomUUID() + "-" + image.getOriginalFilename();

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(uniqueFileName)
                        .build(),
                RequestBody.fromInputStream(image.getInputStream(), image.getSize())
        );

        String s3Url = String.format("https://%s.s3.amazonaws.com/%s", bucketName, uniqueFileName);

        ProfileImage profileImage = new ProfileImage(s3Url, user);

        profileImageRepository.save(profileImage);
    }

    /*
     * process to update the profile picture of the user
     *
     * @param userId The ID of the user whose profile image is being updated.
     * @param image The new profile image to be uploaded.
     * @throws IOException If an error occurs while processing the image.
     */
    @Override
    public void processEditProfileImageToBucket(Long userId, MultipartFile image) throws IOException {
        User user = userRepository.findByUserId(userId);

        if(user == null) throw new RuntimeException("User not found");

        ProfileImage profileImage = profileImageRepository.findByUserId(user.getId());

        String currentImagePath = profileImage.getImageUrl();

        if(currentImagePath != null){
            String existingFileName = currentImagePath.replace("https://pupt-biosync-team.s3.amazonaws.com/", "");

            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(existingFileName)
                            .build()
            );
        }
        processProfileImageToBucket(userId, image);
    }
}
