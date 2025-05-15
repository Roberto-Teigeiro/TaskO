package com.springboot.TaskO.model;

import javax.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "PROJECTS")
public class ProjectItem {

    @Id
    @Column(name = "PROJECTID", nullable = false, unique = true)
    private UUID projectId;

    @Column(name = "PROJECTNAME", length = 255)
    private String projectName;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    public ProjectItem() {
    }

    public ProjectItem(UUID projectId, String projectName, String description) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "ProjectItem{" +
                "projectId=" + projectId +
                ", projectName='" + projectName + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}