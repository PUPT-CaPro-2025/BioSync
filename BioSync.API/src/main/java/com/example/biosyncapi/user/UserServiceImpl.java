package com.example.biosyncapi.user;

import com.example.biosyncapi.attendance.AttendanceRepository;
import com.example.biosyncapi.authentication.AuthenticationServiceImpl;
import com.example.biosyncapi.authentication.password_reset.PasswordResetRepository;
import com.example.biosyncapi.program.Program;
import com.example.biosyncapi.program.ProgramRepository;
import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentRepository;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentService;
import com.example.biosyncapi.section.Section;
import com.example.biosyncapi.section.SectionRepository;
import com.example.biosyncapi.user.profile_image.ProfileImage;
import com.example.biosyncapi.fingerprint.FingerprintRepository;
import com.example.biosyncapi.user.profile_image.ProfileImageRepository;
import com.example.biosyncapi.authentication.token.TokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.util.*;

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
  private final ProgramRepository programRepository;
  private final SectionRepository sectionRepository;
  private final AuthenticationServiceImpl authenticationService;
  private final ScheduleStudentService scheduleStudentService;
  private final PasswordResetRepository resetTokenRepository;
  private final ScheduleStudentRepository scheduleStudentRepository;
  private final AttendanceRepository attendanceRepository;

  public UserServiceImpl(UserRepository userRepository, TokenRepository tokenRepository,
      FingerprintRepository fingerprintRepository, S3Client s3Client, ProfileImageRepository profileImageRepository,
      ProgramRepository programRepository, SectionRepository sectionRepository,
      AuthenticationServiceImpl authenticationService, ScheduleStudentService scheduleStudentService,
      ScheduleStudentRepository scheduleStudentRepository, PasswordResetRepository resetTokenRepository,
      AttendanceRepository attendanceRepository) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.fingerprintRepository = fingerprintRepository;
    this.s3Client = s3Client;
    this.profileImageRepository = profileImageRepository;
    this.programRepository = programRepository;
    this.sectionRepository = sectionRepository;
    this.authenticationService = authenticationService;
    this.scheduleStudentService = scheduleStudentService;
    this.scheduleStudentRepository = scheduleStudentRepository;
    this.resetTokenRepository = resetTokenRepository;
    this.attendanceRepository = attendanceRepository;
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
    Optional<User> user = this.userRepository.findById(id);
    if (user.isEmpty())
      throw new IllegalArgumentException("User does not exist");

    this.profileImageRepository.deleteByUserId(id);
    this.attendanceRepository.deleteByUserId(id);
    this.scheduleStudentRepository.deleteAllByUserId(user.get());
    this.resetTokenRepository.deleteByUser(user.get());
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
    if (user.isEmpty())
      throw new RuntimeException("User not found");

    File dir = new File(profileImageDirectory);
    if (!dir.exists()) {
      boolean created = dir.mkdirs();

      if (!created)
        throw new RuntimeException("Failed to create fingerprints directory");
    }

    String uniqueFileName = UUID.randomUUID() + "-" + image.getOriginalFilename();
    Path filePath = Paths.get(profileImageDirectory, uniqueFileName);
    try {
      Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
      String imagePath = filePath.toAbsolutePath().toString();
      ProfileImage profileImage = new ProfileImage(imagePath, user.get());
      profileImageRepository.save(profileImage);
    } catch (IOException e) {
      throw new RuntimeException("Failed to store fingerprint file", e);
    }
  }

  @Override
  public void processProfileImageToBucket(Long userId, MultipartFile image) throws IOException {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    ProfileImage profileImage = profileImageRepository.findByUserId(user.getId());

    if (profileImage == null) {
      profileImage = new ProfileImage();
      profileImage.setUser(user);
    } else {
      String currentImagePath = profileImage.getImageUrl();

      if (currentImagePath != null) {
        String existingFileName = currentImagePath
            .replace("https://pupt-biosync-team.s3.amazonaws.com/", "");
        s3Client.deleteObject(
            DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(existingFileName)
                .build());

      }
    }

    String uniqueFileName = UUID.randomUUID() + "-" + image.getOriginalFilename();

    s3Client.putObject(
        PutObjectRequest.builder()
            .bucket(bucketName)
            .key(uniqueFileName)
            .build(),
        RequestBody.fromInputStream(image.getInputStream(), image.getSize()));

    String s3Url = String.format("https://%s.s3.amazonaws.com/%s", bucketName, uniqueFileName);

    profileImage.setImageUrl(s3Url);

    profileImageRepository.save(profileImage);
  }

  /*
   * process to update the profile picture of the user
   *
   * @param userId The ID of the user whose profile image is being updated.
   * 
   * @param image The new profile image to be uploaded.
   * 
   * @throws IOException If an error occurs while processing the image.
   */
  @Override
  public void processEditProfileImageToBucket(Long userId, MultipartFile image) throws IOException {
    User user = userRepository.findByUserId(userId);

    if (user == null)
      throw new RuntimeException("User not found");

    ProfileImage profileImage = profileImageRepository.findByUserId(user.getId());

    String currentImagePath = profileImage.getImageUrl();

    if (currentImagePath != null) {
      String existingFileName = currentImagePath.replace("https://pupt-biosync-team.s3.amazonaws.com/", "");

      s3Client.deleteObject(
          DeleteObjectRequest.builder()
              .bucket(bucketName)
              .key(existingFileName)
              .build());
    }
    processProfileImageToBucket(userId, image);
  }

  @Override
  public String getProfileImageUrl(Long userId) {
    ProfileImage profileImage = profileImageRepository.findByUserId(userId);

    return profileImage.getImageUrl();
  }

  /*
   * for adding multiple students
   *
   * @param file - csv of student data
   * 
   * @param <optional> schedule id - include student in schedule
   */
  @Override
  public HashMap<User, String> processCSV(MultipartFile file, Optional<Schedule> schedule) throws Exception {
    HashMap<User, String> mailPassword = new HashMap<>();
    try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
      String line;
      boolean isHeader = true;
      while ((line = reader.readLine()) != null) {
        if (isHeader) {
          isHeader = false;
          continue;
        }
        String[] csvRow = line.split(",");

        Optional<User> user = this.userRepository.findByUsercode(csvRow[0]);

        if (user.isPresent()) {
          schedule.ifPresent(sch -> addStudentToScheduleIfNotPresent(user.get(), sch));
          continue;
        }

        String generatedPassword = generatePassword(8);
        User createdUser = this.authenticationService.register(mapToUser(csvRow, generatedPassword));
        schedule.ifPresent(value -> this.scheduleStudentService.addStudentToSchedule(value, createdUser));

        mailPassword.put(createdUser, generatedPassword);
      }
    }

    return mailPassword;
  }

  @Override
  public User mapToUser(String[] csvRow, String password) {
    User user = new User();
    user.setUsercode(getValue(csvRow[0]));
    user.setLastName(getValue(csvRow[1]));
    user.setFirstName(getValue(csvRow[2]));
    user.setMiddleName(getValue(csvRow[3]));
    user.setSection(getSection(csvRow[5]));
    user.setProgram(getProgram(csvRow[5]));
    user.setEmail(getEmail(csvRow[6]));
    user.setPassword(password);
    user.setRole(Role.STUDENT);
    return user;
  }

  // region Helper methods
  private String getValue(String value) {
    if (value.isEmpty())
      return null;

    return value;
  }

  private String getEmail(String value) {
    if (!value.contains("(locked)"))
      return value;

    int extraIndex = value.indexOf("(locked)");

    return value.substring(0, extraIndex);
  }

  private Section getSection(String sectionCode) {
    int tgIndex = sectionCode.indexOf("TG");

    String yearSection = sectionCode.substring(tgIndex + 2).trim();
    String[] yearSectionArr = yearSection.split("-");

    Program program = getProgram(sectionCode);

    if (program == null)
      return null;

    String year = yearSectionArr[0];
    int section = Integer.parseInt(yearSectionArr[1]);

    return this.sectionRepository.findByProgramAndYearAndSection(program, year, section);
  }

  private Program getProgram(String sectionCode) {
    int tgIndex = sectionCode.indexOf("TG");

    String programAbb = sectionCode.substring(0, tgIndex).trim();

    if (programAbb.endsWith("-")) {
      programAbb = programAbb.substring(0, programAbb.length() - 1);
    }

    return this.programRepository.findByProgramAbbreviation(programAbb).orElse(null);
  }

  private String generatePassword(int length) {
    String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    String specialCharacters = "!@#$%^&*()_+[]{}|;:,.<>?";

    String allCharacters = characters + specialCharacters;

    SecureRandom random = new SecureRandom();
    StringBuilder password = new StringBuilder(length);

    for (int i = 0; i < length; i++) {
      int randomIndex = random.nextInt(allCharacters.length());
      password.append(allCharacters.charAt(randomIndex));
    }

    return password.toString();
  }

  private void addStudentToScheduleIfNotPresent(
      User user,
      Schedule schedule)
  {
    ScheduleStudent scheduleStudent =
        this.scheduleStudentRepository.findByStudentIdAndScheduleId(user.getId(), schedule.getId());
    if(scheduleStudent == null) {
      this.scheduleStudentService.addStudentToSchedule(schedule, user);
    }
  }
  // endregion
}
