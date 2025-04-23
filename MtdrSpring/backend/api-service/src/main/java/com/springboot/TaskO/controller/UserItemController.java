///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/api-service/src/main/java/com/springboot/TaskO/controller/UserItemController.java
package com.springboot.TaskO.controller;
import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.model.UserItem;
import com.springboot.TaskO.service.TaskItemService;
import com.springboot.TaskO.service.UserItemService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
public class UserItemController {
    @Autowired
    private UserItemService userItemService;
    //@CrossOrigin
    @GetMapping(value = "/users/all")
    public List<UserItem> getAllToDoItems(){
        return userItemService.findAll();
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
            String userId = registration.get("username");
            String telegramId = registration.get("telegramId");
            
            if (userId == null || telegramId == null) {
                return ResponseEntity.badRequest().body("Username and telegramId are required");
            }
            
            // Add telegram to user and get the updated user
            UserItem updatedUser = userItemService.addTelegramToUserItem(userId, telegramId);
            
            if (updatedUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found with username: " + userId);
            }
            
            // Return the updated user
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error registering telegram user: " + e.getMessage());
        }
    }
}







