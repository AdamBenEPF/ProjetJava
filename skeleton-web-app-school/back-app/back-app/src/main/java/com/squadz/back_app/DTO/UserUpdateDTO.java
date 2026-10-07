package com.squadz.back_app.DTO;

// Corps de PUT /api/users/{id} : champs modifiables depuis la page Préférences
public record UserUpdateDTO(String name, String dietPreference) {}
