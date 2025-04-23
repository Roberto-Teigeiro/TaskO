///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/api-service/src/main/java/com/springboot/TaskO/service/TeamItemService.java
package com.springboot.TaskO.service;

import com.springboot.TaskO.model.TeamItem;
import com.springboot.TaskO.repository.TeamItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Service
public class TeamItemService {

    @Autowired
    private TeamItemRepository teamItemRepository;

    public TeamItem createTeam(String teamName) {
        TeamItem newTeam = new TeamItem();
        newTeam.setName(teamName);
        // You may need to set projectId here or make it optional in your entity
        return teamItemRepository.save(newTeam);
    }

    public List<TeamItem> getAllTeams() {
        return teamItemRepository.findAll();
    }

    public Optional<TeamItem> getTeamById(UUID id) {
        return teamItemRepository.findById(id);
    }

    public TeamItem updateTeam(UUID teamId, String newTeamName) {
        Optional<TeamItem> teamOptional = teamItemRepository.findById(teamId);
        if (teamOptional.isPresent()) {
            TeamItem team = teamOptional.get();
            team.setName(newTeamName);
            return teamItemRepository.save(team);
        }
        return null;
    }

    public void deleteTeam(UUID teamId) {
        teamItemRepository.deleteById(teamId);
    }

    // Your existing methods can remain, but you may want to remove duplicates or refactor
    public List<TeamItem> findAll() {
        return teamItemRepository.findAll();
    }

    public ResponseEntity<TeamItem> getTeamItemById(UUID id) {
        Optional<TeamItem> teamData = teamItemRepository.findById(id);
        if (teamData.isPresent()) {
            return new ResponseEntity<>(teamData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public TeamItem addTeamItem(TeamItem teamItem) {
        return teamItemRepository.save(teamItem);
    }
}