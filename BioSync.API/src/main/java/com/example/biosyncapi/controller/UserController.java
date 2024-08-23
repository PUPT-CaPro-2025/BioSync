package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Role;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.service.UserService;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable long id) {
        return this.userService.getUserById(id);
    }

    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable Role role) {
        return this.userService.getUsersByRole(role);
    }

    @PostMapping()
    public User createUser(@RequestBody User user) {
        return this.userService.createUser(user);
    }

    @PutMapping()
    public User updateUser(@RequestBody User user) {
        return this.userService.updateUser(user);
    }

    @DeleteMapping()
    public void deleteUser(@RequestBody User user) {
        this.userService.deleteUser(user.getId());
    }
}
