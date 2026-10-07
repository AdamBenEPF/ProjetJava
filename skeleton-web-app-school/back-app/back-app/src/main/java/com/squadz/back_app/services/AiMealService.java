package com.squadz.back_app.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.squadz.back_app.DAO.RecipeRepository;
import com.squadz.back_app.DTO.RecipeDetailsDTO;
import com.squadz.back_app.models.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiMealService {

    // Valeurs de meal_type utilisées en base (voir V2__insert_default_data.sql)
    private static final List<String> MEAL_TYPES = List.of("Breakfast", "Lunch", "Dinner");

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Autowired
    private RecipeRepository recipeRepository;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Une proposition de recette avec ses ingrédients, NON enregistrée : le front l'affiche puis l'ajoute si validée
    public RecipeDetailsDTO generateMealSuggestion(String dietType, String mealType, String instructions) {
        String prompt = "Propose une recette de type " + mealType + " pour un régime " + dietType + "."
                + (instructions != null && !instructions.isBlank() ? " Consignes : " + instructions + "." : "")
                + " Réponds uniquement avec un objet JSON valide possédant exactement les clés :"
                + " titre, calories, proteines, glucides, lipides, ingredients."
                + " ingredients est un tableau d'objets avec les clés nom, quantite (nombre) et unite"
                + " (une valeur parmi : grammes, millilitres, pieces, cuilleres a soupe, cuilleres a cafe).";

        Map<String, Object> data = parseJson(askAi(prompt), new TypeReference<>() {});

        List<RecipeDetailsDTO.IngredientLine> ingredients = new ArrayList<>();
        if (data.get("ingredients") instanceof List<?> lines) {
            for (Object line : lines) {
                if (line instanceof Map<?, ?> ingredient && ingredient.get("nom") instanceof String name) {
                    ingredients.add(new RecipeDetailsDTO.IngredientLine(null, name,
                            (String) ingredient.get("unite"), toBigDecimal(ingredient.get("quantite"))));
                }
            }
        }

        return new RecipeDetailsDTO(null, (String) data.get("titre"), mealType, dietType,
                toInteger(data.get("calories")), toDouble(data.get("proteines")),
                toDouble(data.get("glucides")), toDouble(data.get("lipides")), ingredients);
    }

    // 2. Une liste d'idées de plats, en texte brut (un plat par ligne)
    public String generateMultipleMeals(String dietType) {
        return askAi("Propose une liste de 10 plats différents pour un régime " + dietType
                + ". Réponds avec un plat par ligne, sans autre texte.");
    }

    // 3. Génère 20 recettes et les enregistre directement dans le catalogue
    public List<Recipe> generateAndSaveMultipleMeals(String dietType) {
        String prompt = "Propose une liste de 20 plats différents de type " + dietType + ". Réponds uniquement sous forme"
                + " de tableau JSON valide d'objets, où chaque objet possède exactement les clés : titre, typeRepas,"
                + " calories, proteines, glucides, lipides. typeRepas vaut Breakfast, Lunch ou Dinner.";

        List<Map<String, Object>> mealsData = parseJson(askAi(prompt), new TypeReference<>() {});

        List<Recipe> savedRecipes = new ArrayList<>();
        for (Map<String, Object> data : mealsData) {
            String mealType = MEAL_TYPES.contains(data.get("typeRepas")) ? (String) data.get("typeRepas") : "Lunch";
            Recipe recipe = new Recipe((String) data.get("titre"), mealType, dietType,
                    toInteger(data.get("calories")), toDouble(data.get("proteines")),
                    toDouble(data.get("glucides")), toDouble(data.get("lipides")));
            savedRecipes.add(recipeRepository.save(recipe));
        }
        return savedRecipes;
    }

    // Appel à l'API Groq (format OpenAI) : renvoie le texte de la réponse, sans les balises markdown
    @SuppressWarnings("unchecked")
    private String askAi(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Génération IA indisponible : la variable d'environnement GROQ_API_KEY n'est pas définie.");
        }

        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-20b",
                "messages", new Object[]{Map.of("role", "user", "content", prompt)}
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
            String content = (String) message.get("content");

            // Nettoyage au cas où l'IA ajoute des balises markdown autour du JSON
            return content.replaceAll("```json", "").replaceAll("```", "").trim();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Erreur lors de l'appel à l'IA : " + e.getMessage());
        }
    }

    private <T> T parseJson(String json, TypeReference<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "La réponse de l'IA est illisible, réessayez.");
        }
    }

    private static Integer toInteger(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private static Double toDouble(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }

    private static BigDecimal toBigDecimal(Object value) {
        return value instanceof Number number ? new BigDecimal(number.toString()) : BigDecimal.ONE;
    }
}
