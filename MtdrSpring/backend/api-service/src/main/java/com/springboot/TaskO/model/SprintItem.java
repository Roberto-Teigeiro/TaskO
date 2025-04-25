package com.springboot.TaskO.model;

import javax.persistence.*;

import org.hibernate.annotations.Type;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "SPRINTS")
public class SprintItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Type(type = "uuid-binary")
    @Column(name = "SPRINTID", columnDefinition = "RAW(16)")
    private UUID sprintId;
    
    @Type(type = "uuid-binary")
    @Column(name = "PROJECTID", columnDefinition = "RAW(16)")
    private UUID projectId;

    @Column(name = "NAME")
    private String name;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "STARTDATE")
    private OffsetDateTime startDate;

    @Column(name = "ENDDATE")
    private OffsetDateTime endDate;

    @Column(name = "ACTIVE")
    private boolean active;

    // Constructors, getters, and setters

    public SprintItem() {
        
    }

    public SprintItem(UUID sprintId, UUID projectId, String name, String description, OffsetDateTime startDate, OffsetDateTime endDate, boolean active) {
        this.sprintId = sprintId;
        this.projectId = projectId;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.active = active;
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
                ", projectId=" + projectId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", active=" + active +
                '}';
    }
}