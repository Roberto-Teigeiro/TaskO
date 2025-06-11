package com.springboot.TaskO.controller;
import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.model.UserItem;
import com.springboot.TaskO.service.TaskItemService;
import com.springboot.TaskO.service.UserItemService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
public class UserItemController {
    @Autowired
    private UserItemService userItemService;
    //@CrossOrigin
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String clerkSecretKey = "sk_test_6Ib6VO3fmCDHpSNC2eJUXgkO9DrE70NusLvT7NmWFI";
    
    @GetMapping(value = "/users/all")
    public List<UserItem> getAllToDoItems(){
        return userItemService.findAll();
    }
    @GetMapping("/users/by-telegram/{telegramUsername}")
    public ResponseEntity<UserItem> getUserByTelegramUsername(@PathVariable String telegramUsername) {
        List<UserItem> users = userItemService.findAll();
        for (UserItem user : users) {
            if (telegramUsername.equals(user.getTelegramUsername())) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping("/newuser")
    public ResponseEntity<String> addNewUser(@RequestHeader("Authorization") String jwt) {
        // Verify the JWT and extract user details
        UserItem userItem = userItemService.verifyJwtWithClerk(jwt);

        if (userItem == null) {
            return new ResponseEntity<>("Invalid JWT"+ jwt, HttpStatus.UNAUTHORIZED);
        }

        // Save the user to the database
        userItemService.addUserItem(userItem);

        return new ResponseEntity<>("User verified and created successfully", HttpStatus.CREATED);
    }
    @PostMapping("/users/register")
    public ResponseEntity<?> registerTelegramUser(@RequestBody Map<String, String> registration) {
        try {
            String email = registration.get("email");
            String telegramId = registration.get("telegramId");
            
            if (email == null || telegramId == null) {
                return ResponseEntity.badRequest().body("Email y telegramId son requeridos");
            }
            
            // Busca el usuario por email
            List<UserItem> users = userItemService.findAll();
            UserItem user = users.stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst()
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Usuario no encontrado con ese correo: " + email);
            }
            
            // Actualiza el telegramUsername
            user.setTelegramUsername(telegramId);
            userItemService.addUserItem(user);
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error registrando usuario de telegram: " + e.getMessage());
        }
    }
      @PostMapping("/resolveusername")
    public ResponseEntity<Map<String, String>> resolveUsers(@RequestBody List<String> userIds) {
        try {
            Map<String, String> userNames = new HashMap<>();
            
            for (String userId : userIds) {
                try {
                    // Hacer llamada HTTP directa a la API de Clerk
                    String url = "https://api.clerk.com/v1/users/" + userId;
                    
                    HttpHeaders headers = new HttpHeaders();
                    headers.set("Authorization", "Bearer " + clerkSecretKey);
                    headers.set("Content-Type", "application/json");
                    
                    HttpEntity<String> entity = new HttpEntity<>(headers);
                    
                    ResponseEntity<String> response = restTemplate.exchange(
                        url, HttpMethod.GET, entity, String.class);
                    
                    if (response.getStatusCode() == HttpStatus.OK) {
                        JsonNode userJson = objectMapper.readTree(response.getBody());
                        
                        String displayName = "";
                        String firstName = userJson.path("first_name").asText(null);
                        String lastName = userJson.path("last_name").asText(null);
                        String username = userJson.path("username").asText(null);
                        
                        if (firstName != null && !firstName.isEmpty() && lastName != null && !lastName.isEmpty()) {
                            displayName = firstName + " " + lastName;
                        } else if (username != null && !username.isEmpty()) {
                            displayName = username;
                        } else {
                            JsonNode emailAddresses = userJson.path("email_addresses");
                            if (emailAddresses.isArray() && emailAddresses.size() > 0) {
                                String email = emailAddresses.get(0).path("email_address").asText();
                                if (email != null && !email.isEmpty()) {
                                    displayName = email;
                                } else {
                                    displayName = "User " + userId.replace("user_", "").substring(0, 8);
                                }
                            } else {
                                displayName = "User " + userId.replace("user_", "").substring(0, 8);
                            }
                        }
                        
                        userNames.put(userId, displayName);
                    } else {
                        userNames.put(userId, "User " + userId.replace("user_", "").substring(0, 8));
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching user " + userId + ": " + e.getMessage());
                    userNames.put(userId, "User " + userId.replace("user_", "").substring(0, 8));
                }
            }
            
            return ResponseEntity.ok(userNames);
        } catch (Exception e) {
            System.err.println("Error in resolveUsers: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}







