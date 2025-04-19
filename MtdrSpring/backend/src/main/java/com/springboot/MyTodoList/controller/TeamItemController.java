package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.TeamItem;
import com.springboot.MyTodoList.service.TeamItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamItemController {

    @Autowired
    private TeamItemService teamItemService;

    @PostMapping
    public ResponseEntity<TeamItem> createTeam(@RequestParam String teamName) {
        TeamItem newTeam = teamItemService.createTeam(teamName);
        return ResponseEntity.ok(newTeam);
    }

    @GetMapping
    public ResponseEntity<List<TeamItem>> getAllTeams() {
        List<TeamItem> teams = teamItemService.getAllTeams();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<TeamItem> getTeamById(@PathVariable UUID teamId) {
        return teamItemService.getTeamById(teamId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<TeamItem> updateTeam(
            @PathVariable UUID teamId,
            @RequestParam String newTeamName) {
        TeamItem updatedTeam = teamItemService.updateTeam(teamId, newTeamName);
        if (updatedTeam != null) {
            return ResponseEntity.ok(updatedTeam);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable UUID teamId) {
        teamItemService.deleteTeam(teamId);
        return ResponseEntity.ok().build();
    }
} 