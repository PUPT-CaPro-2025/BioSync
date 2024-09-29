package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Role;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    public List<User> getUsers() {
        return this.userService.getAllUsers();
    }

    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable Role role) {
        return this.userService.getUsersByRole(role);
    }

    @GetMapping("/section/{id}")
    public ResponseEntity<List<User>> getUsersBySectionId(@PathVariable Long id) {
        List<User> students = this.userService.getUsersBySectionId(id);
        if (students.isEmpty()) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable long id) {
        return this.userService.getUserById(id);
    }

    @PostMapping()
    public User createUser(@RequestBody User user) {
        return this.userService.createUser(user);
    }

    @PostMapping("/profile-image")
    public ResponseEntity<?> createUserProfileImage(
            @RequestParam("userId") Long userId,
            @RequestParam("profileImage") MultipartFile profileImage,
            @RequestParam(value = "method", defaultValue = "toBucket") String method) {
        try {
            if (method.equals("toBucket")) {
                this.userService.processProfileImageToBucket(userId, profileImage);
            } else {
                this.userService.processProfileImage(userId, profileImage);
            }
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/edit-user")
    public User updateUser(@RequestBody User user) {
        return this.userService.updateUser(user);
    }

    @PutMapping("/edit-profile-image")
    public ResponseEntity<?> updateUserProfileImage(
            @RequestParam("userId") Long userId,
            @RequestParam("profileImage") MultipartFile profileImage)  {
        try {
            this.userService.processEditProfileImageToBucket(userId, profileImage);

            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping()
    public void deleteUser(@RequestBody User user) {
        this.userService.deleteUser(user.getId());
    }
}
