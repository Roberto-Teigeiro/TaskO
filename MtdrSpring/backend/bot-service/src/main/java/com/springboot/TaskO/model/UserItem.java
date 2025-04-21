package com.springboot.TaskO.model;

/**
 * DTO version of UserItem for the bot service.
 */
public class UserItem {
    
    // Change from UUID to String type
    private String userId;
    private String username;
    private String email;
    private String telegramUsername;
    
    // Default constructor needed for JSON deserialization
    public UserItem() {
    }
    
    public UserItem(String userId, String username, String email, String telegramUsername) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.telegramUsername = telegramUsername;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getTelegramUsername() {
        return telegramUsername;
    }
    
    public void setTelegramUsername(String telegramUsername) {
        this.telegramUsername = telegramUsername;
    }
    
    @Override
    public String toString() {
        return "UserItem{" +
                "userId='" + userId + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", telegramUsername='" + telegramUsername + '\'' +
                '}';
    }
}