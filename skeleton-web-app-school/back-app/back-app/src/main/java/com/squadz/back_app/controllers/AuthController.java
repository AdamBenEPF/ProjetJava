package com.squadz.back_app.controllers;

import com.squadz.back_app.DTO.LoginDTO;
import com.squadz.back_app.DTO.RegisterDTO;
import com.squadz.back_app.DTO.UserDTO;
import com.squadz.back_app.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint d'inscription : POST /api/auth/register
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO register(@RequestBody RegisterDTO registerDTO) {
        return userService.register(registerDTO);
    }

    // Endpoint de connexion : POST /api/auth/login
    @PostMapping("/login")
    public UserDTO login(@RequestBody LoginDTO loginDTO) {
        return userService.login(loginDTO);
    }
}
