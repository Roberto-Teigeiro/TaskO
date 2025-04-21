package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "PROJECT_MEMBERS")
@IdClass(ProjectMemberItem.ProjectMemberKey.class)
public class ProjectMemberItem {
    
    @Id
    @Column(name = "PROJECTID", nullable = false, columnDefinition = "RAW(16)")
    private UUID projectId;

    @Id
    @Column(name = "USERID", nullable = false)
    private String userId;

    @Column(name = "TEAMID", columnDefinition = "RAW(16)")
    private UUID teamId;

    @Column(name = "ROLE", length = 255)
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

    // Composite key class
    public static class ProjectMemberKey implements Serializable {
        private UUID projectId;
        private String userId;

        public ProjectMemberKey() {
        }

        public ProjectMemberKey(UUID projectId, String userId) {
            this.projectId = projectId;
            this.userId = userId;
        }

        // Getters and setters for the key class
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

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ProjectMemberKey that = (ProjectMemberKey) o;
            return projectId.equals(that.projectId) &&
                   userId.equals(that.userId);
        }

        @Override
        public int hashCode() {
            int result = projectId.hashCode();
            result = 31 * result + userId.hashCode();
            return result;
        }
    }

    @Override
    public String toString() {
        return "ProjectMemberItem{" +
                "projectId=" + projectId +
                ", userId='" + userId + '\'' +
                ", teamId=" + teamId +
                ", role='" + role + '\'' +
                '}';
    }
}