package com.springboot.TaskO.model;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO version of TaskItem for the bot service.
 * No JPA annotations needed for microservice communication.
 */
public class TaskItem {
    
    // Add Status enum inside TaskItem class
    public enum Status {
        TODO, IN_PROGRESS, COMPLETED
    }
    
    private UUID taskId; // Changed from id to taskId to match controller usage
    private String name;
    private String description;
    private Status status; // Changed from boolean completed to Status
    private OffsetDateTime startDate; // Added to match controller
    private OffsetDateTime dateCreated;
    private OffsetDateTime dateCompleted;
    private UUID sprintId;
    private UUID projectId;
    private UUID assignedTo;
    
    // Default constructor needed for JSON deserialization
    public TaskItem() {
    }
    
    public TaskItem(UUID taskId, String name, String description, Status status, 
                  OffsetDateTime startDate, OffsetDateTime dateCreated, OffsetDateTime dateCompleted,
                  UUID sprintId, UUID projectId, UUID assignedTo) {
        this.taskId = taskId;
        this.name = name;
        this.description = description;
        this.status = status;
        this.startDate = startDate;
        this.dateCreated = dateCreated;
        this.dateCompleted = dateCompleted;
        this.sprintId = sprintId;
        this.projectId = projectId;
        this.assignedTo = assignedTo;
    }

    // Updated getters and setters
    public UUID getTaskId() {
        return taskId;
    }

    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    // For backward compatibility
    public boolean isCompleted() {
        return status == Status.COMPLETED;
    }

    public void setCompleted(boolean completed) {
        this.status = completed ? Status.COMPLETED : Status.TODO;
    }

    public OffsetDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(OffsetDateTime startDate) {
        this.startDate = startDate;
    }

    public OffsetDateTime getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(OffsetDateTime dateCreated) {
        this.dateCreated = dateCreated;
    }

    public OffsetDateTime getDateCompleted() {
        return dateCompleted;
    }

    public void setDateCompleted(OffsetDateTime dateCompleted) {
        this.dateCompleted = dateCompleted;
    }
    
    public UUID getSprintId() {
        return sprintId;
    }
    
    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }
    
    public UUID getProjectId() {
        return projectId;
    }
    
    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
    
    public UUID getAssignedTo() {
        return assignedTo;
    }
    
    public void setAssignedTo(UUID assignedTo) {
        this.assignedTo = assignedTo;
    }
    
    @Override
    public String toString() {
        return "TaskItem{" +
                "taskId=" + taskId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", status=" + status +
                ", startDate=" + startDate +
                ", dateCreated=" + dateCreated +
                ", dateCompleted=" + dateCompleted +
                ", sprintId=" + sprintId +
                ", projectId=" + projectId +
                ", assignedTo=" + assignedTo +
                '}';
    }
}