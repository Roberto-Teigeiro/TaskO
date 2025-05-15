//Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/api-service/src/main/java/com/springboot/TaskO/model/UserItem.java
package com.springboot.TaskO.model;

import javax.persistence.*;

@Entity
@Table(name = "USERS")
public class UserItem {

    @Id
    @Column(name = "USERID", nullable = false, length = 50)
    private String userId;

    @Column(name = "NAME", length = 255)
    private String name;

    @Column(name = "EMAIL", length = 255)
    private String email;

    @Column(name="TELEGRAMUSERNAME")
    private String telegramUsername;

    public UserItem() {
    }

    public UserItem(String userId, String name, String email, String telegramUsername) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.telegramUsername= telegramUsername;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setId(String id) {
        this.userId = id;
    }

    public void setTelegramUsername(String telegramUsername) {
        this.telegramUsername = telegramUsername;
    }

    public String getTelegramUsername() {
        return telegramUsername;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "UserItem{" +
                "userId='" + userId + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", telegramUsername='" + telegramUsername + '\'' +
                '}';
    }
}