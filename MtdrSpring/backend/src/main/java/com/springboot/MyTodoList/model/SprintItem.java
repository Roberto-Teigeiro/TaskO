package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
@Entity
@Table(name = "TASKS")
public class SprintItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TASKID")
    private UUID id;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "ASSIGNEE")
    private String assignee;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "STARTDATE")
    private OffsetDateTime startDate;

    @Column(name = "ENDDATE")
    private OffsetDateTime endDate;

    @Column(name = "COMMENTS")
    private String comments;

    @Column(name = "STORYPOINTS")
    private int storyPoints;

    // Constructors, getters, and setters

    public SprintItem() {
    }

    public SprintItem(UUID id, String title, String description, String assignee, String status, OffsetDateTime startDate, OffsetDateTime endDate, String comments, int storyPoints) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.assignee = assignee;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.comments = comments;
        this.storyPoints = storyPoints;
    }

    // Getters and setters for all fields

    @Override
    public String toString() {
        return "SprintItem{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", assignee='" + assignee + '\'' +
                ", status='" + status + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", comments='" + comments + '\'' +
                ", storyPoints=" + storyPoints +
                '}';
    }
}