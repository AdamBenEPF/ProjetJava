package com.squadz.back_app.controllers;

import com.squadz.back_app.models.User;
import com.squadz.back_app.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.squadz.back_app.DTO.UserDTO;
import com.squadz.back_app.DTO.UserUpdateDTO;
import com.squadz.back_app.services.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

@Autowired
private UserService userService;

@GetMapping
public List<User> getAllUsers() {
    return userService.getAllUsers();
}

@GetMapping("/{id}")
public ResponseEntity<User> getUserById(@PathVariable Long id) {
    return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@PostMapping
public User createUser(@RequestBody User user) {
    return userService.saveUser(user);
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.ok().build();
}

    @PutMapping("/{id}")
    public UserDTO updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO userUpdateDTO) {
        return userService.update(id, userUpdateDTO);
    }
}
