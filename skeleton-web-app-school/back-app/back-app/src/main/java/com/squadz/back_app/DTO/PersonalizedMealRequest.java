package com.squadz.back_app.DTO;

public class PersonalizedMealRequest {

    private String dietType;
    private String mealType;
    private Integer targetCalories;
    private Double targetProteins;
    private String mandatoryIngredient;
    private String preferences;

    public PersonalizedMealRequest() {}

    public String getDietType() { return dietType; }
    public void setDietType(String dietType) { this.dietType = dietType; }

    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }

    public Integer getTargetCalories() { return targetCalories; }
    public void setTargetCalories(Integer targetCalories) { this.targetCalories = targetCalories; }

    public Double getTargetProteins() { return targetProteins; }
    public void setTargetProteins(Double targetProteins) { this.targetProteins = targetProteins; }

    public String getMandatoryIngredient() { return mandatoryIngredient; }
    public void setMandatoryIngredient(String mandatoryIngredient) { this.mandatoryIngredient = mandatoryIngredient; }

    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }
}
