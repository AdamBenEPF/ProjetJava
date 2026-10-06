package com.takima.backskeleton.models;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class Course {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false)
private String name;

@Column(nullable = false, unique = true)
private String email;

@Column(nullable = false)
private String password;

@Column(name = "diet_preference")
private String dietPreference;

// Constructeurs vides et avec arguments
public Course() {}

public Course(String name, String email, String password, String dietPreference) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.dietPreference = dietPreference;
}

// Getters et Setters
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public String getName() { return name; }
public void setName(String name) { this.name = name; }

public String getEmail() { return email; }
public void setEmail(String email) { this.email = email; }

public String getPassword() { return password; }
public void setPassword(String password) { this.password = password; }

public String getDietPreference() { return dietPreference; }
public void setDietPreference(String dietPreference) { this.dietPreference = dietPreference; }
}