package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Fingerprint;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.repository.FingerprintRepository;
import com.example.biosyncapi.repository.UserRepository;
import com.example.biosyncapi.service.FingerprintService;
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
import java.util.UUID;

@Service
public class FingerprintServiceImpl implements FingerprintService {

    @Value("${fingerprints.directory}")
    private String fingerprintsDirectory;
    private final FingerprintRepository fingerprintRepository;
    private final UserRepository userRepository;

    public FingerprintServiceImpl(FingerprintRepository fingerprintRepository, UserRepository userRepository) {
        this.fingerprintRepository = fingerprintRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Fingerprint> getAllBySectionId(Long sectionId) {
        return fingerprintRepository.getAllBySectionId(sectionId);
    }

    @Override
    public void processFingerprints(Long userId, List<MultipartFile> images) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        File dir = new File(fingerprintsDirectory);
        if(!dir.exists()) {
            boolean created = dir.mkdirs();

            if(!created) throw new RuntimeException("Failed to create fingerprints directory");
        }

        for(MultipartFile image : images){
            String uniqueFileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(fingerprintsDirectory, uniqueFileName);

            try {
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                Fingerprint fingerprint = new Fingerprint();
                fingerprint.setFingerprintURL(filePath.toAbsolutePath().toString());
                fingerprint.setUser(user);
                fingerprint.setSectionId(user.getSection().getId());

                fingerprintRepository.save(fingerprint);

            }catch (IOException e) {
                throw new RuntimeException("Failed to store fingerprint file", e);
            }
        }
    }

}
