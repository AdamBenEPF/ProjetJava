package com.squadz.back_app.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.repositories.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Service
public class AiMealService {

@Value("${groq.api.key}")
private String apiKey;

@Value("${groq.api.url}")
private String apiUrl;

@Autowired
private RecipeRepository recipeRepository;

private final WebClient webClient = WebClient.create();
private final ObjectMapper objectMapper = new ObjectMapper();

public List<Recipe> generateAndSaveMultipleMeals(String dietType) {
    String prompt = "Propose une liste de 20 plats différents de type " + dietType + ". Réponds uniquement sous forme de tableau JSON valide d'objets, où chaque objet possède exactement les clés : titre, typeRepas, typeRegime, calories, proteines, glucides, lipides.";

    Map<String, Object> requestBody = Map.of(
        "model", "openai/gpt-oss-20b",
        "messages", new Object[]{
            Map.of("role", "user", "content", prompt)
        }
    );

    try {
        Map<String, Object> response = webClient.post()
            .uri(apiUrl + "/chat/completions")
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        var choices = (List<Map<String, Object>>) response.get("choices");
        var message = (Map<String, Object>) choices.get(0).get("message");
        String jsonContent = (String) message.get("content");

        // Nettoyage au cas où l'IA ajoute des balises markdown autour du JSON
        jsonContent = jsonContent.replaceAll("```json", "").replaceAll("```", "").trim();

        // Conversion du JSON en liste de Maps ou d'objets
        List<Map<String, Object>> mealsData = objectMapper.readValue(jsonContent, new TypeReference<List<Map<String, Object>>>() {});

        List<Recipe> savedRecipes = new java.util.ArrayList<>();

        for (Map<String, Object> data : mealsData) {
            Recipe recipe = new Recipe();
            // Ajuste les setters selon les noms exacts des attributs de l'entité Recipe de ton binôme
            recipe.setTitre((String) data.get("titre"));
            recipe.setTypeRepas((String) data.get("typeRepas"));
            recipe.setTypeRegime((String) data.get("typeRegime"));
            recipe.setCalories(data.get("calories") != null ? ((Number) data.get("calories")).intValue() : 0);
            recipe.setProteines(data.get("proteines") != null ? ((Number) data.get("proteines")).doubleValue() : 0.0);
            recipe.setGlucides(data.get("glucides") != null ? ((Number) data.get("glucides")).doubleValue() : 0.0);
            recipe.setLipides(data.get("lipides") != null ? ((Number) data.get("lipides")).doubleValue() : 0.0);

            savedRecipes.add(recipeRepository.save(recipe));
        }

        return savedRecipes;

    } catch (Exception e) {
        throw new RuntimeException("Erreur lors de la génération ou de l'enregistrement par l'IA : " + e.getMessage());
    }
}
}