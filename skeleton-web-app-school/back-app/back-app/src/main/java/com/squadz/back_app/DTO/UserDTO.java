package com.squadz.back_app.DTO;

import com.squadz.back_app.models.User;

// Utilisateur renvoyé au front : jamais le mot de passe
public record UserDTO(Long id, String name, String email, String dietPreference) {

    public static UserDTO from(User user) {
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getDietPreference());
    }
}
