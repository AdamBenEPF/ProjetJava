package com.squadz.back_app.DTO;

// Corps de POST /api/auth/register
public record RegisterDTO(String name, String email, String password, String dietPreference) {}
