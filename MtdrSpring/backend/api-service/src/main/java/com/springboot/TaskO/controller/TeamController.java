package com.springboot.TaskO.controller;
import com.springboot.TaskO.model.TeamItem;
import com.springboot.TaskO.service.TeamItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
public class TeamController {
    @Autowired
    private TeamItemService teamItemService;
    //@CrossOrigin
    @GetMapping(value = "/team/all")
    public List<TeamItem> getAllToDoItems(){
        return teamItemService.findAll();
    }
    @GetMapping(value = "/team/{ProjectId}")
    public ResponseEntity<List<TeamItem>> getTeamByProjectId(@PathVariable UUID ProjectId) {
        List<TeamItem> teamItems = teamItemService.getTeamByProjectId(ProjectId);
        if (teamItems.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(teamItems, HttpStatus.OK);
    }
    @PostMapping("/team/add")
        public ResponseEntity<TeamItem> postMethodName(@RequestBody TeamItem teamItem) {
            TeamItem savedTeam = teamItemService.addTeamItem(teamItem);
            return ResponseEntity.ok(savedTeam);
        }
    




}
