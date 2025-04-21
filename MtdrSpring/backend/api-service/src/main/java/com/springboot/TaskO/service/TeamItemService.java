package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TeamItem;
import com.springboot.MyTodoList.repository.TeamItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TeamItemService {

    @Autowired
    private TeamItemRepository teamItemRepository;

    public TeamItem createTeam(String teamName) {
        TeamItem team = new TeamItem(UUID.randomUUID(), teamName);
        return teamItemRepository.save(team);
    }

    public List<TeamItem> getAllTeams() {
        return teamItemRepository.findAll();
    }

    public Optional<TeamItem> getTeamById(UUID teamId) {
        return teamItemRepository.findById(teamId);
    }

    public TeamItem updateTeam(UUID teamId, String newTeamName) {
        Optional<TeamItem> existingTeam = teamItemRepository.findById(teamId);
        if (existingTeam.isPresent()) {
            TeamItem team = existingTeam.get();
            team.setTeamName(newTeamName);
            return teamItemRepository.save(team);
        }
        return null;
    }

    public void deleteTeam(UUID teamId) {
        teamItemRepository.deleteById(teamId);
    }
} 