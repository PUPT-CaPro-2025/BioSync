package com.example.biosyncapi.service.impl;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.example.biosyncapi.model.Fingerprint;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.repository.FingerprintRepository;
import com.example.biosyncapi.repository.UserRepository;
import com.example.biosyncapi.service.FingerprintService;
import com.machinezoo.sourceafis.FingerprintImage;
import com.machinezoo.sourceafis.FingerprintMatcher;
import com.machinezoo.sourceafis.FingerprintTemplate;
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
    @Value("${aws.s3.bucket.name}")
    private String bucketName;
    private final AmazonS3 amazonS3;
    private final double threshold = 40;
    private final FingerprintRepository fingerprintRepository;
    private final UserRepository userRepository;

    public FingerprintServiceImpl(FingerprintRepository fingerprintRepository, UserRepository userRepository, AmazonS3 amazonS3) {
        this.fingerprintRepository = fingerprintRepository;
        this.userRepository = userRepository;
        this.amazonS3 = amazonS3;
    }

    @Override
    public List<Fingerprint> getAllBySectionId(Long sectionId) {
        return fingerprintRepository.getAllBySectionId(sectionId);
    }

    //system file storage support for when it isn't hosted
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
                if(user.getSection() != null) {
                    fingerprint.setSectionId(user.getSection().getId());
                }

                fingerprintRepository.save(fingerprint);

            }catch (IOException e) {
                throw new RuntimeException("Failed to store fingerprint file", e);
            }
        }
    }

    //uploading to S3
    @Override
    public void processFingerprintsToBucket(Long userId, List<MultipartFile> images) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        for (MultipartFile image : images) {
            String uniqueFileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            amazonS3.putObject(bucketName, uniqueFileName, image.getInputStream(), null);

            String s3Url = amazonS3.getUrl(bucketName, uniqueFileName).toString();
            Fingerprint fingerprint = new Fingerprint();
            fingerprint.setFingerprintURL(s3Url);
            fingerprint.setUser(user);
            if(user.getSection() != null) {
                fingerprint.setSectionId(user.getSection().getId());
            }

            fingerprintRepository.save(fingerprint);
        }
    }

    @Override
    public Boolean verifyProfessorFingerprintForAttendance(Long professorId, MultipartFile scannedFingerprintImage) throws IOException {
        List<Fingerprint> professorFingerprints = fingerprintRepository.getAllByUserId(professorId);

        if (professorFingerprints.isEmpty()) return false;

        byte[] scannedFingerprintImageBytes = scannedFingerprintImage.getBytes();

        FingerprintTemplate probeTemplate = new FingerprintTemplate(
                new FingerprintImage(scannedFingerprintImageBytes));

        for (Fingerprint professorFingerprint : professorFingerprints) {
            byte[] candidateImageBytes = Files.readAllBytes(
                    Paths.get(professorFingerprint.getFingerprintURL()));
            FingerprintTemplate candidateTemplate = new FingerprintTemplate(
                    new FingerprintImage(candidateImageBytes));
            if (match(probeTemplate, candidateTemplate)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public User verifyProfessorFingerprintForAttendanceInBucket(Long professorId, MultipartFile scannedFingerprintImage) throws IOException {
        List<Fingerprint> professorFingerprints = fingerprintRepository.getAllByUserId(professorId);

        if (professorFingerprints.isEmpty()) return null;

        byte[] scannedFingerprintImageBytes = scannedFingerprintImage.getBytes();

        FingerprintTemplate probeTemplate = new FingerprintTemplate(
                new FingerprintImage(scannedFingerprintImageBytes)
        );

        for(Fingerprint professorFingerprint : professorFingerprints){

            String objectKey = extractObjectKeyFromS3Url(professorFingerprint.getFingerprintURL());

            S3Object s3Object = amazonS3.getObject(bucketName, objectKey);

            try(S3ObjectInputStream objectInputStream = s3Object.getObjectContent()) {
                byte[] candidateImageBytes = objectInputStream.readAllBytes();

                FingerprintTemplate candidateTemplate = new FingerprintTemplate(
                        new FingerprintImage(candidateImageBytes)
                );

                if (match(probeTemplate, candidateTemplate)) {
                    return professorFingerprint.getUser();
                }

            } catch (IOException e) {
                throw new RuntimeException("Failed to retrieve fingerprint", e);
            }
        }

        return null;
    }

    @Override
    public User verifyStudentFingerprintForAttendance(Long sectionId, MultipartFile scannedFingerprintImage) throws IOException {
        List<Fingerprint> studentFingerprints = fingerprintRepository.getAllBySectionId(sectionId);

        if (studentFingerprints.isEmpty()) return null;

        byte[] scannedFingerprintImageBytes = scannedFingerprintImage.getBytes();

        FingerprintTemplate probeTemplate = new FingerprintTemplate(
                new FingerprintImage(scannedFingerprintImageBytes));

        var matcher = new FingerprintMatcher(probeTemplate);
        Fingerprint fingerprint = null;
        double max = Double.NEGATIVE_INFINITY;

        for (Fingerprint studentFingerprint : studentFingerprints) {
            byte[] candidateImageBytes = Files.readAllBytes(
                    Paths.get(studentFingerprint.getFingerprintURL()));

            FingerprintTemplate candidateTemplate = new FingerprintTemplate(
                    new FingerprintImage(candidateImageBytes)
            );

            double similarity = matcher.match(candidateTemplate);

            if(similarity > max){
                max = similarity;
                if(similarity > threshold){
                    fingerprint = studentFingerprint;
                }
            }
        }

        if(fingerprint == null) return null;

        return userRepository.findByUserId(fingerprint.getUser().getId());
    }

    @Override
    public User verifyStudentFingerprintForAttendanceInBucket(Long sectionId, MultipartFile scannedFingerprintImage) throws IOException {
        List<Fingerprint> studentFingerprints = fingerprintRepository.getAllBySectionId(sectionId);

        if (studentFingerprints.isEmpty()) return null;

        byte[] scannedImageBytes = scannedFingerprintImage.getBytes();

        FingerprintTemplate probeTemplate = new FingerprintTemplate(
                new FingerprintImage(scannedImageBytes)
        );

        var matcher = new FingerprintMatcher(probeTemplate);
        double max = Double.NEGATIVE_INFINITY;
        Fingerprint fingerprint = null;

        for (Fingerprint studentFingerprint : studentFingerprints) {

            String ObjectKey = extractObjectKeyFromS3Url(studentFingerprint.getFingerprintURL());

            S3Object s3Object = amazonS3.getObject(bucketName, ObjectKey);

            try(S3ObjectInputStream objectInputStream = s3Object.getObjectContent()) {
                byte[] candidateImageBytes = objectInputStream.readAllBytes();

                FingerprintTemplate candidateTemplate = new FingerprintTemplate(
                        new FingerprintImage(candidateImageBytes)
                );

                double similarity = matcher.match(candidateTemplate);

                if(similarity > max){
                    max = similarity;
                    if(similarity > threshold){
                        fingerprint = studentFingerprint;
                    }
                }

            } catch (IOException e) {
                throw new RuntimeException("Failed to retrieve fingerprint", e);
            }
        }

        if(fingerprint == null) return null;

        return userRepository.findByUserId(fingerprint.getUser().getId());
    }

    private boolean match(FingerprintTemplate probe, FingerprintTemplate candidate){
        var matcher = new FingerprintMatcher(probe);
        double similarity = matcher.match(candidate);

        return similarity >= threshold;
    }

    private String extractObjectKeyFromS3Url(String s3Url) {
        return Paths.get(s3Url.split(".com/")[1]).toString(); // Returns the object key
    }


}
