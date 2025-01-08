package com.example.biosyncapi.fingerprint;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.user.Role;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.ScheduleRepository;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentRepository;
import com.example.biosyncapi.user.UserRepository;
import com.machinezoo.sourceafis.FingerprintImage;
import com.machinezoo.sourceafis.FingerprintMatcher;
import com.machinezoo.sourceafis.FingerprintTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class FingerprintServiceImpl implements FingerprintService {

    private final ScheduleRepository scheduleRepository;
    private final double threshold = 40;
    private final FingerprintRepository fingerprintRepository;
    private final UserRepository userRepository;
    private final ScheduleStudentRepository scheduleStudentRepository;

    public FingerprintServiceImpl(FingerprintRepository fingerprintRepository, UserRepository userRepository, ScheduleRepository scheduleRepository, ScheduleStudentRepository scheduleStudentRepository) {
        this.fingerprintRepository = fingerprintRepository;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.scheduleStudentRepository = scheduleStudentRepository;

    }

    @Override
    public List<Fingerprint> getAllByUserId(Long userId) {
        return fingerprintRepository.getAllByUserId(userId);
    }

    @Override
    public boolean hasFingerprintByUserId(Long userId) {
        return fingerprintRepository.existsById(userId);
    }

    @Override
    public void processFingerprints(Long userId, List<MultipartFile> images) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        for(MultipartFile image : images){
            try {
                byte[] imageData = image.getBytes();

                Fingerprint fingerprint = new Fingerprint();
                fingerprint.setFingerprint(imageData);
                fingerprint.setUser(user);

                fingerprintRepository.save(fingerprint);

            }catch (IOException e) {
                throw new RuntimeException("Failed to store fingerprint file", e);
            }
        }
    }

    @Override
    public void updateFingerprints(Long userId, List<MultipartFile> images) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        List<Fingerprint> existingFingerprints = fingerprintRepository.getAllByUserId(userId);

        if(!existingFingerprints.isEmpty()){
            fingerprintRepository.deleteAll(existingFingerprints);
        }


        for (MultipartFile image : images) {
            try {
                byte[] imageData = image.getBytes();

                Fingerprint fingerprint = new Fingerprint();
                fingerprint.setFingerprint(imageData);
                fingerprint.setUser(user);

                fingerprintRepository.save(fingerprint);
            }catch (Exception e) {
                throw new RuntimeException("Failed to store fingerprint file", e);
            }
        }
    }

    @Override
    public User verifyProfessorFingerprintForAttendance(Long professorId, MultipartFile scannedFingerprintImage) throws IOException {
        List<Fingerprint> professorFingerprints = fingerprintRepository.getAllByUserId(professorId);
        List<User> adminUsers = userRepository.getUsersByRole(Role.ADMIN);

        if (!adminUsers.isEmpty()) {
            List<Long> adminIds = adminUsers.stream().map(User::getId).toList();
            List<Fingerprint> adminFingerprints = fingerprintRepository.getAllByUserIds(adminIds);
            professorFingerprints.addAll(adminFingerprints);
        }

        // If no fingerprints exist, return null
        if (professorFingerprints.isEmpty()) return null;

        // Convert scanned fingerprint to template
        byte[] scannedFingerprintImageBytes = scannedFingerprintImage.getBytes();
        FingerprintTemplate probeTemplate = new FingerprintTemplate(new FingerprintImage(scannedFingerprintImageBytes));

        // Map all database fingerprints to templates in parallel
        Map<User, FingerprintTemplate> userTemplates = professorFingerprints.parallelStream()
                .collect(Collectors.toMap(
                        Fingerprint::getUser,
                        fingerprint -> new FingerprintTemplate(new FingerprintImage(fingerprint.getFingerprint())),
                        (existing, replacement) -> existing // Handle duplicate user templates, if any
                ));

        // Perform bulk matching
        return userTemplates.entrySet().parallelStream()
                .filter(entry -> match(probeTemplate, entry.getValue()))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);
    }

    @Override
    public User verifyStudentFingerprintForAttendance(Long scheduleId, MultipartFile scannedFingerprintImage) throws IOException {
        // Cache the scanned template first to avoid redundant conversions
        byte[] scannedFingerprintImageBytes = scannedFingerprintImage.getBytes();
        FingerprintTemplate probeTemplate = new FingerprintTemplate(
                new FingerprintImage(scannedFingerprintImageBytes)
        );

        // Fetch schedule and students in parallel using CompletableFuture
        CompletableFuture<Schedule> scheduleFuture = CompletableFuture.supplyAsync(() ->
                scheduleRepository.findById(scheduleId).orElse(null)
        );

        CompletableFuture<List<ScheduleStudent>> studentsFuture = scheduleFuture.thenApplyAsync(schedule ->
                schedule != null ? scheduleStudentRepository.findByScheduleId(schedule.getId()) : Collections.emptyList()
        );

        // Wait for both futures to complete
        Schedule schedule = scheduleFuture.join();
        List<ScheduleStudent> students = studentsFuture.join();

        if (schedule == null || students.isEmpty()) return null;

        // Extract student IDs and fetch fingerprints
        List<Long> studentIds = students.stream()
                .map(s -> s.getStudent().getId())
                .collect(Collectors.toList());

        // Use batch fetching for fingerprints
        List<Fingerprint> fingerprints = fingerprintRepository.getOneFingerprintPerUser(studentIds);
        if (fingerprints.isEmpty()) return null;

        // Create a thread pool with the number of available processors
        int processors = Runtime.getRuntime().availableProcessors();
        ExecutorService executorService = Executors.newFixedThreadPool(processors);

        try {
            // Process fingerprints in batches
            int batchSize = Math.max(1, fingerprints.size() / processors);
            List<List<Fingerprint>> batches = partitionList(fingerprints, batchSize);

            // Create tasks for parallel processing
            List<CompletableFuture<Optional<Map.Entry<Fingerprint, Double>>>> futures = batches.stream()
                    .map(batch -> CompletableFuture.supplyAsync(() -> processFingerprintBatch(batch, probeTemplate), executorService))
                    .toList();

            // Find the best match across all batches
            Optional<Map.Entry<Fingerprint, Double>> bestMatch = futures.stream()
                    .map(CompletableFuture::join)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .max(Map.Entry.comparingByValue());

            if (bestMatch.isEmpty() || bestMatch.get().getValue() < threshold) {
                return null;
            }

            // Update attendance status
            Fingerprint matchedFingerprint = bestMatch.get().getKey();
            ScheduleStudent matchedStudent = students.stream()
                    .filter(s -> s.getStudent().getId().equals(matchedFingerprint.getUser().getId()))
                    .findFirst()
                    .orElse(null);

            if (matchedStudent != null) {
                matchedStudent.setHasLogged(true);
                scheduleStudentRepository.save(matchedStudent);
                return matchedFingerprint.getUser();
            }

            return null;
        } finally {
            executorService.shutdown();
        }
    }

    private <T> List<List<T>> partitionList(List<T> list, int batchSize) {
        if (batchSize <= 0) throw new IllegalArgumentException("Batch size must be positive");

        int numBatches = (list.size() + batchSize - 1) / batchSize; // Round up division
        return IntStream.range(0, numBatches)
                .mapToObj(i -> list.subList(
                        i * batchSize,
                        Math.min((i + 1) * batchSize, list.size())
                ))
                .collect(Collectors.toList());
    }

    private Optional<Map.Entry<Fingerprint, Double>> processFingerprintBatch(
            List<Fingerprint> batch,
            FingerprintTemplate probeTemplate
    ) {
        FingerprintMatcher matcher = new FingerprintMatcher(probeTemplate);

        return batch.parallelStream()
                .map(fingerprint -> {
                    FingerprintTemplate template = new FingerprintTemplate(
                            new FingerprintImage(fingerprint.getFingerprint())
                    );
                    return Map.entry(fingerprint, matcher.match(template));
                })
                .filter(entry -> entry.getValue() >= threshold)
                .max(Map.Entry.comparingByValue());
    }

    private boolean match(FingerprintTemplate probe, FingerprintTemplate candidate){
        var matcher = new FingerprintMatcher(probe);
        double similarity = matcher.match(candidate);

        return similarity >= threshold;
    }

}
