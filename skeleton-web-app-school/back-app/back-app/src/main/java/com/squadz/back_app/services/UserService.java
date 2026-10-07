package com.squadz.back_app.services;

import com.squadz.back_app.DAO.UserRepository;
import com.squadz.back_app.DTO.LoginDTO;
import com.squadz.back_app.DTO.RegisterDTO;
import com.squadz.back_app.DTO.UserDTO;
import com.squadz.back_app.DTO.UserUpdateDTO;
import com.squadz.back_app.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. Créer un compte : email unique, mot de passe stocké haché (BCrypt)
    @Transactional
    public UserDTO register(RegisterDTO dto) {
        String name = requireText(dto.name(), "Le nom est obligatoire.");
        String email = requireText(dto.email(), "L'email est obligatoire.").toLowerCase();
        if (dto.password() == null || dto.password().length() < MIN_PASSWORD_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le mot de passe doit contenir au moins " + MIN_PASSWORD_LENGTH + " caractères.");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email.");
        }

        User user = new User(name, email, passwordEncoder.encode(dto.password()), dto.dietPreference());
        return UserDTO.from(userRepository.save(user));
    }

    // 2. Se connecter : même message d'erreur que l'email soit inconnu ou le mot de passe faux
    public UserDTO login(LoginDTO dto) {
        if (dto.email() == null || dto.password() == null) {
            throw invalidCredentials();
        }
        User user = userRepository.findByEmailIgnoreCase(dto.email().trim()).orElseThrow(this::invalidCredentials);
        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw invalidCredentials();
        }
        return UserDTO.from(user);
    }

    // 3. Modifier le profil (nom et régime alimentaire)
    @Transactional
    public UserDTO update(Long id, UserUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));
        user.setName(requireText(dto.name(), "Le nom est obligatoire."));
        user.setDietPreference(dto.dietPreference());
        return UserDTO.from(userRepository.save(user));
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect.");
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }
}
