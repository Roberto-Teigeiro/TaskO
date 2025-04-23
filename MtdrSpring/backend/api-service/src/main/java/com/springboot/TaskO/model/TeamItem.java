///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/api-service/src/main/java/com/springboot/TaskO/model/TeamItem.java
package com.springboot.TaskO.model;

import java.util.UUID;

import javax.persistence.*;

@Entity
@Table(name = "TEAM")
public class TeamItem {

    @Id
    @Column(name = "TEAMID", nullable = false, unique = true)
    private UUID teamId;
    
    @Column(name = "PROJECTID", nullable = false)
    private UUID projectId;
    
    @Column(name = "TEAMNAME", length = 255)
    private String name;

    // Default constructor
    public TeamItem() {
        this.teamId = UUID.randomUUID();
    }

    // Constructor with fields
    public TeamItem(UUID teamId, UUID projectId, String name) {
        this.teamId = teamId;
        this.projectId = projectId;
        this.name = name;
    }

    // Getters and setters
    public UUID getTeamId() {
        return teamId;
    }

    public void setTeamId(UUID teamId) {
        this.teamId = teamId;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Teams{" +
                "teamId=" + teamId +
                ", projectId=" + projectId +
                ", name='" + name + '\'' +
                '}';
    }
}