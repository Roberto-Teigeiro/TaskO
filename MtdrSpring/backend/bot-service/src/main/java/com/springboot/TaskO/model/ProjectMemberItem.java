package com.springboot.TaskO.model;

import java.util.UUID;

/**
 * DTO version of ProjectMemberItem for the bot service.
 */
public class ProjectMemberItem {
    
    private UUID memberId;
    private UUID projectId;
    private UUID userId;
    private String role;
    
    // Default constructor needed for JSON deserialization
    public ProjectMemberItem() {
    }
    
    public ProjectMemberItem(UUID memberId, UUID projectId, UUID userId, String role) {
        this.memberId = memberId;
        this.projectId = projectId;
        this.userId = userId;
        this.role = role;
    }
    
    public UUID getMemberId() {
        return memberId;
    }
    
    public void setMemberId(UUID memberId) {
        this.memberId = memberId;
    }
    
    public UUID getProjectId() {
        return projectId;
    }
    
    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
    
    public UUID getUserId() {
        return userId;
    }
    
    public void setUserId(UUID userId) {
        this.userId = userId;
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
                "memberId=" + memberId +
                ", projectId=" + projectId +
                ", userId=" + userId +
                ", role='" + role + '\'' +
                '}';
    }
}