package com.springboot.TaskO.model;

import java.util.UUID;

/**
 * DTO version of ProjectItem for the bot service.
 * No JPA annotations needed for the bot service.
 */
public class ProjectItem {

    private UUID projectId;
    private String projectName;

    // Default constructor needed for JSON deserialization
    public ProjectItem() {
    }

    public ProjectItem(UUID projectId, String projectName) {
        this.projectId = projectId;
        this.projectName = projectName;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    @Override
    public String toString() {
        return "ProjectItem{" +
                "projectId=" + projectId +
                ", projectName='" + projectName + '\'' +
                '}';
    }
}