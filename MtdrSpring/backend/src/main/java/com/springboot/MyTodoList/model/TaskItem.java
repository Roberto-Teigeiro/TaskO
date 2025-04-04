package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.Type;

/*
    representation of the TASKITEM table that exists already
    in the autonomous database
 */
@Entity
@Table(name = "TASKS")
public class TaskItem {
    public enum Status {
        TODO, IN_PROGRESS, COMPLETED
    }
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Type(type = "uuid-binary") // Correct mapping for RAW(16)
    @Column(name = "TASKID", columnDefinition = "RAW(16)")
    private UUID taskId;
    @Type(type = "uuid-binary") // Correct mapping for RAW(16)
    @Column(name = "PROJECTID", columnDefinition = "RAW(16)")
    private UUID projectId;
    @Type(type = "uuid-binary") // Correct mapping for RAW(16)
    @Column(name = "SPRINTID", columnDefinition = "RAW(16)")
    private UUID sprintId;
    @Column(name = "TITLE")
    private String title;
    @Column(name = "DESCRIPTION")
    private String description;
    @Type(type = "uuid-binary") // Correct mapping for RAW(16)
    @Column(name = "ASSIGNEE")
    private String assignee;
    @Column(name = "STATUS")
    private Status status;
    @Column(name = "STARTDATE")
    private OffsetDateTime startDate;
    @Column(name = "ENDDATE")
    private OffsetDateTime endDate;
    @Column(name = "COMMENTS")
    private String comments;
    @Column(name = "STORYPOINTS")
    private int storyPoints;

    public TaskItem(){
    }
    public TaskItem(UUID projectId, UUID sprintId, UUID taskId, String title, String description, String assignee, Status status, OffsetDateTime startDate, OffsetDateTime endDate, String comments, int storyPoints) {
        this.projectId = projectId;
        this.sprintId = sprintId;
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.assignee = assignee;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.comments = comments;
        this.storyPoints = storyPoints;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setID(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getSprintId() {
        return sprintId;
    }

    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }

    public UUID getTaskId() {
        return taskId;
    }

    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
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

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public int getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(int storyPoints) {
        this.storyPoints = storyPoints;
    }

    public OffsetDateTime getCreation_ts() {
        return startDate;
    }
   
    @Override
    public String toString() {
        return "TaskItem{" +
                "projectId=" + projectId +
                ", sprintId=" + sprintId +
                ", taskId=" + taskId +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", assignee=" + assignee +
                ", status='" + status + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", comments='" + comments + '\'' +
                ", storyPoints=" + storyPoints +
                '}';
    }
}
