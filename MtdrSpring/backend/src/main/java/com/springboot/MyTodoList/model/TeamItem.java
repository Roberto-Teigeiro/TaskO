package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "TEAMS")
public class TeamItem {

    @Id
    @Column(name = "TEAMID", nullable = false, unique = true, columnDefinition = "RAW(16)")
    private UUID teamId;

    @Column(name = "TEAMNAME", length = 255)
    private String teamName;

    public TeamItem() {
        this.teamId = UUID.randomUUID();
    }

    public TeamItem(UUID teamId, String teamName) {
        this.teamId = teamId;
        this.teamName = teamName;
    }

    public UUID getTeamId() {
        return teamId;
    }

    public void setTeamId(UUID teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    @Override
    public String toString() {
        return "TeamItem{" +
                "teamId=" + teamId +
                ", teamName='" + teamName + '\'' +
                '}';
    }
} 