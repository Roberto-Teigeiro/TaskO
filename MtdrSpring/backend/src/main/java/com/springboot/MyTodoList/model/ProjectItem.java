package com.springboot.MyTodoList.model;

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