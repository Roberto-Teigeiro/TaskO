package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "PROJECT_MEMBERS")
public class ProjectMemberItem {
    @Id
    @Column(name = "USERID", nullable = false)
    private String userId;

    // Other fields
    @Column(name = "PROJECTID")
    private UUID projectId;

    @Column(name = "TEAMID")
    private UUID teamId;

    @Column(name = "ROLE")
    private String role;


    public ProjectMemberItem() {
    }

    public ProjectMemberItem(UUID projectId, String userId, UUID teamId, String role) {
        this.projectId = projectId;
        this.userId = userId;
        this.teamId = teamId;
        this.role = role;
    }

    // Getters and Setters

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public UUID getTeamId() {
        return teamId;
    }

    public void setTeamId(UUID teamId) {
        this.teamId = teamId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "ProjectMemberItem{" +
                ", projectId=" + projectId +
                ", userId='" + userId + '\'' +
                ", teamId=" + teamId +
                ", role='" + role + '\'' +
                '}';
    }
}