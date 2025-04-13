package com.example.biosyncapi.visitor;

import com.example.biosyncapi.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class VisitorServiceImpl implements VisitorService {

    private final VisitorRepository visitorRepository;
    private final UserService userService;

    public VisitorServiceImpl(VisitorRepository visitorRepository,
        UserService userService) {
        this.visitorRepository = visitorRepository;
        this.userService = userService;
    }

    @Override
    public List<Visitor> getVisitors() {
        return visitorRepository.findAll();
    }

    @Override
    public Optional<Visitor> getVisitorById(Long id) {
        return visitorRepository.findById(id);
    }

    @Override
    public Visitor createVisitor(Visitor visitor) {
        visitor.setVisitDate(ZonedDateTime.now(ZoneId.of("UTC+8")));
        return visitorRepository.save(visitor);
    }

    @Override
    public Visitor updateVisitor(Visitor visitor) {
        return visitorRepository.save(visitor);
    }

    @Override
    public void deleteVisitor(Long id) {
        visitorRepository.deleteById(id);
    }

    @Override
    public int addBulkVisitorsCSV(MultipartFile file) throws IOException {
        List<Visitor> visitorsToAdd = new ArrayList<>();

        File tempFile = File.createTempFile("converted_", ".csv");
        tempFile.deleteOnExit();

        String detectedEncoding = userService.detectEncoding(file);

        userService.encodeToUtf8TempFile(file, detectedEncoding, tempFile);

        try (BufferedReader reader = new BufferedReader(
            new InputStreamReader(new FileInputStream(tempFile), StandardCharsets.UTF_8))) {

            String line;
            boolean isHeader = true;
            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    validateHeader(line);
                    continue;
                }

                String[] csvRow = line.split(",");

                try {

                    Visitor visitor = new Visitor();
                    visitor.setName(csvRow[0]);
                    visitor.setPurposeOfVisit(csvRow[1]);
                    visitor.setVisitDate(getTimeCSV(csvRow[2], csvRow[3]));
                    visitor.setDestination(csvRow[4]);

                    visitorsToAdd.add(visitorRepository.save(visitor));
                } catch (Exception e) {
                    System.out.println("Error: " + e.getMessage());
                }
            }
        } finally {
            tempFile.delete();
        }

        return visitorsToAdd.size();
    }

    private ZonedDateTime getTimeCSV(
        String date,
        String time) {

        LocalDate localDate = LocalDate.parse(date);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("h:mm a");
        String cleanedTime = time.trim()
            .toUpperCase().replaceAll("(?<=\\d)(AM|PM)", " $1");
        LocalTime localTime = LocalTime.parse(cleanedTime, formatter);
        LocalDateTime localDateTime = LocalDateTime.of(localDate, localTime);

        ZoneId zoneId = ZoneId.of("UTC+8");

        return ZonedDateTime.of(localDateTime, zoneId);
    }

    private static void validateHeader(String line) {
        String expectedHeader = "Name,Purpose,Date,Time,Destination";
        if (!line.trim().equalsIgnoreCase(expectedHeader)) {
            throw new IllegalArgumentException("Invalid CSV");
        }
    }
}
