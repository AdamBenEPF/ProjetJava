package com.squadz.back_app.controllers;

import com.squadz.back_app.DTO.UserDTO;
import com.squadz.back_app.DTO.UserUpdateDTO;
import com.squadz.back_app.services.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint de modification du profil : PUT /api/users/{id}
    @PutMapping("/{id}")
    public UserDTO updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO userUpdateDTO) {
        return userService.update(id, userUpdateDTO);
    }
}
