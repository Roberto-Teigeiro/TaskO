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


@RestController
public class TeamController {
    @Autowired
    private TeamItemService teamItemService;
    //@CrossOrigin
    @GetMapping(value = "/team/all")
    public List<TeamItem> getAllToDoItems(){
        return teamItemService.findAll();
    }
  @PostMapping("/team/add")
    public ResponseEntity<TeamItem> postMethodName(@RequestBody TeamItem teamItem) {
        try {
            TeamItem savedTeam = teamItemService.addTeamItem(teamItem);
            return ResponseEntity.ok(savedTeam);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    




}
