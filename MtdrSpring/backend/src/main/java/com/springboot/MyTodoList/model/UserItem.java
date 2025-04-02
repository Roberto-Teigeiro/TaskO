package com.springboot.MyTodoList.model;

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

    public UserItem() {
    }

    public UserItem(String userId, String name, String email) {
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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
                '}';
    }
}