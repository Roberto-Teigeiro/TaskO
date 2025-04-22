package com.springboot.TaskO.model;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO version of SprintItem for the bot service.
 */
public class SprintItem {
    
    private UUID sprintId;
    private String sprintName;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private UUID projectId;
    private boolean active;
    
    // Default constructor needed for JSON deserialization
    public SprintItem() {
    }
    
    public SprintItem(UUID sprintId, String sprintName, OffsetDateTime startDate,
                    OffsetDateTime endDate, UUID projectId, boolean active) {
        this.sprintId = sprintId;
        this.sprintName = sprintName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.projectId = projectId;
        this.active = active;
    }
    
    public UUID getSprintId() {
        return sprintId;
    }
    
    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }
    
    public String getSprintName() {
        return sprintName;
    }
    
    public void setSprintName(String sprintName) {
        this.sprintName = sprintName;
    }
    
    public OffsetDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(OffsetDateTime startDate) {
        this.startDate = startDate;
    }
    
    public OffsetDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(OffsetDateTime endDate) {
        this.endDate = endDate;
    }
    
    public UUID getProjectId() {
        return projectId;
    }
    
    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    @Override
    public String toString() {
        return "SprintItem{" +
                "sprintId=" + sprintId +
                ", sprintName='" + sprintName + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", projectId=" + projectId +
                ", active=" + active +
                '}';
    }
}