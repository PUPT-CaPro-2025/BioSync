package com.example.biosyncapi.fingerprint;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.ScheduleRepository;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentRepository;
import com.example.biosyncapi.user.UserRepository;
import com.machinezoo.sourceafis.FingerprintImage;
import com.machinezoo.sourceafis.FingerprintMatcher;
import com.machinezoo.sourceafis.FingerprintTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

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

  private final ScheduleRepository scheduleRepository;
  @Value("${fingerprints.directory}")
  private String fingerprintsDirectory;
  @Value("${aws.s3.bucket.name}")
  private String bucketName;
  private final S3Client s3Client;
  private final double threshold = 40;
  private final FingerprintRepository fingerprintRepository;
  private final UserRepository userRepository;
  private final ScheduleStudentRepository scheduleStudentRepository;

  public FingerprintServiceImpl(
      FingerprintRepository fingerprintRepository,
      UserRepository userRepository,
      S3Client s3Client1,
      ScheduleRepository scheduleRepository,
      ScheduleStudentRepository scheduleStudentRepository)
  {
    this.fingerprintRepository = fingerprintRepository;
    this.userRepository = userRepository;
    this.s3Client = s3Client1;
    this.scheduleRepository = scheduleRepository;
    this.scheduleStudentRepository = scheduleStudentRepository;
  }

  @Override
  public List<Fingerprint> getAllByUserId(Long userId) {
    return fingerprintRepository.getAllByUserId(userId);
  }

  //system file storage support for when it isn't hosted
  @Override
  public void processFingerprints(
      Long userId,
      List<MultipartFile> images)
  {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    File dir = new File(fingerprintsDirectory);
    if (!dir.exists()) {
      boolean created = dir.mkdirs();

      if (!created) {
        throw new RuntimeException("Failed to create fingerprints directory");
      }
    }

    for (MultipartFile image : images) {
      String uniqueFileName =
          UUID.randomUUID() + "_" + image.getOriginalFilename();
      Path filePath = Paths.get(fingerprintsDirectory, uniqueFileName);

      try {
        Files.copy(image.getInputStream(), filePath,
            StandardCopyOption.REPLACE_EXISTING);

        Fingerprint fingerprint = new Fingerprint();
        fingerprint.setFingerprintURL(filePath.toAbsolutePath().toString());
        fingerprint.setUser(user);

        fingerprintRepository.save(fingerprint);

      } catch (IOException e) {
        throw new RuntimeException("Failed to store fingerprint file", e);
      }
    }
  }

  //uploading to S3
  @Override
  public void processFingerprintsToBucket(
      Long userId,
      List<MultipartFile> images) throws IOException
  {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    for (MultipartFile image : images) {
      String uniqueFileName =
          UUID.randomUUID() + "_" + image.getOriginalFilename();
      s3Client.putObject(
          PutObjectRequest.builder().bucket(bucketName).key(uniqueFileName)
              .build(), RequestBody.fromInputStream(image.getInputStream(),
              image.getSize()));

      String s3Url =
          String.format("https://%s.s3.amazonaws.com/%s", bucketName,
              uniqueFileName);

      Fingerprint fingerprint = new Fingerprint();
      fingerprint.setFingerprintURL(s3Url);
      fingerprint.setUser(user);

      fingerprintRepository.save(fingerprint);
    }
  }

  @Override
  public Boolean verifyProfessorFingerprintForAttendance(
      Long professorId,
      MultipartFile scannedFingerprintImage) throws IOException
  {
    List<Fingerprint> professorFingerprints =
        fingerprintRepository.getAllByUserId(professorId);

    if (professorFingerprints.isEmpty()) {
      return false;
    }

    byte[] scannedFingerprintImageBytes = scannedFingerprintImage.getBytes();

    FingerprintTemplate probeTemplate = new FingerprintTemplate(
        new FingerprintImage(scannedFingerprintImageBytes));

    for (Fingerprint professorFingerprint : professorFingerprints) {
      byte[] candidateImageBytes = Files.readAllBytes(
          Paths.get(professorFingerprint.getFingerprintURL()));
      FingerprintTemplate candidateTemplate =
          new FingerprintTemplate(new FingerprintImage(candidateImageBytes));
      if (match(probeTemplate, candidateTemplate)) {
        return true;
      }
    }

    return false;
  }

  @Override
  public User verifyProfessorFingerprintForAttendanceInBucket(
      Long professorId,
      MultipartFile scannedFingerprintImage) throws IOException
  {
    List<Fingerprint> professorFingerprints =
        fingerprintRepository.getAllByUserId(professorId);

    if (professorFingerprints.isEmpty()) {
      return null;
    }

    byte[] scannedFingerprintImageBytes = scannedFingerprintImage.getBytes();

    FingerprintTemplate probeTemplate = new FingerprintTemplate(
        new FingerprintImage(scannedFingerprintImageBytes));

    for (Fingerprint professorFingerprint : professorFingerprints) {

      String objectKey =
          extractObjectKeyFromS3Url(professorFingerprint.getFingerprintURL());

      GetObjectRequest getObjectRequest =
          GetObjectRequest.builder().bucket(bucketName).key(objectKey).build();

      try (ResponseInputStream<GetObjectResponse> objectInputStream =
               s3Client.getObject(
                   getObjectRequest))
      {
        byte[] candidateImageBytes = objectInputStream.readAllBytes();

        FingerprintTemplate candidateTemplate =
            new FingerprintTemplate(new FingerprintImage(candidateImageBytes));

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
  public User verifyStudentFingerprintForAttendance(
      Long scheduleId,
      MultipartFile scannedFingerprintImage) throws IOException
  {
    Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
    if (schedule == null) {
      return null;
    }

    List<ScheduleStudent> students =
        scheduleStudentRepository.findByScheduleId(schedule.getId());
    if (students.isEmpty()) {
      return null;
    }

    byte[] scannedFingerprintImageBytes = scannedFingerprintImage.getBytes();

    FingerprintTemplate probeTemplate = new FingerprintTemplate(
        new FingerprintImage(scannedFingerprintImageBytes));

    var matcher = new FingerprintMatcher(probeTemplate);
    Fingerprint fingerprint = null;
    double max = Double.NEGATIVE_INFINITY;

    for (ScheduleStudent student : students) {
      List<Fingerprint> studentFingerprints =
          fingerprintRepository.getAllByUserId(student.getStudent().getId());
      if (studentFingerprints.isEmpty()) {
        continue;
      }

      for (Fingerprint studentFingerprint : studentFingerprints) {
        byte[] candidateImageBytes = Files.readAllBytes(
            Paths.get(studentFingerprint.getFingerprintURL()));

        FingerprintTemplate candidateTemplate =
            new FingerprintTemplate(new FingerprintImage(candidateImageBytes));

        double similarity = matcher.match(candidateTemplate);

        if (similarity > max) {
          max = similarity;
          if (similarity > threshold) {
            fingerprint = studentFingerprint;
          }
        }
      }
    }

    if (fingerprint == null) {
      return null;
    }

    ScheduleStudent scheduleStudent =
        scheduleStudentRepository.findByStudentIdAndScheduleId(
            fingerprint.getUser().getId(), schedule.getId());
    scheduleStudent.setHasLogged(true);
    scheduleStudentRepository.save(scheduleStudent);
    return userRepository.findByUserId(fingerprint.getUser().getId());
  }

  @Override
  public User verifyStudentFingerprintForAttendanceInBucket(
      Long scheduleId,
      MultipartFile scannedFingerprintImage) throws IOException
  {
    Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
    if (schedule == null) {
      return null;
    }

    List<ScheduleStudent> students =
        scheduleStudentRepository.findByScheduleId(schedule.getId());
    if (students.isEmpty()) {
      return null;
    }

    byte[] scannedImageBytes = scannedFingerprintImage.getBytes();
    FingerprintTemplate probeTemplate =
        new FingerprintTemplate(new FingerprintImage(scannedImageBytes));

    var matcher = new FingerprintMatcher(probeTemplate);
    double max = Double.NEGATIVE_INFINITY;
    Fingerprint fingerprint = null;

    for (ScheduleStudent student : students) {
      List<Fingerprint> studentFingerprints =
          fingerprintRepository.getAllByUserId(student.getStudent().getId());
      if (studentFingerprints.isEmpty()) {
        continue;
      }

      for (Fingerprint studentFingerprint : studentFingerprints) {
        String objectKey =
            extractObjectKeyFromS3Url(studentFingerprint.getFingerprintURL());

        GetObjectRequest getObjectRequest =
            GetObjectRequest.builder().bucket(bucketName).key(objectKey)
                .build();

        try (ResponseInputStream<GetObjectResponse> objectInputStream =
                 s3Client.getObject(
                     getObjectRequest))
        {
          byte[] candidateImageBytes = objectInputStream.readAllBytes();

          FingerprintTemplate candidateTemplate = new FingerprintTemplate(
              new FingerprintImage(candidateImageBytes));

          double similarity = matcher.match(candidateTemplate);

          if (similarity > max) {
            max = similarity;
            if (similarity > threshold) {
              fingerprint = studentFingerprint;
            }
          }

        } catch (IOException e) {
          throw new RuntimeException("Failed to retrieve fingerprint", e);
        }
      }
    }

    if (fingerprint == null) {
      return null;
    }

    ScheduleStudent scheduleStudent =
        scheduleStudentRepository.findByStudentIdAndScheduleId(
            fingerprint.getUser().getId(), schedule.getId());
    scheduleStudent.setHasLogged(true);
    scheduleStudentRepository.save(scheduleStudent);
    return userRepository.findByUserId(fingerprint.getUser().getId());
  }

  private boolean match(
      FingerprintTemplate probe,
      FingerprintTemplate candidate)
  {
    var matcher = new FingerprintMatcher(probe);
    double similarity = matcher.match(candidate);

    return similarity >= threshold;
  }

  private String extractObjectKeyFromS3Url(String s3Url) {
    return Paths.get(s3Url.split(".com/")[1]).toString();
  }

}
