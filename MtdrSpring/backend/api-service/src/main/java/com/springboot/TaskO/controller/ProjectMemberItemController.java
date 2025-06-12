package com.springboot.TaskO.controller;

import com.springboot.TaskO.model.ProjectMemberItem;
import com.springboot.TaskO.service.ProjectMemberItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.UUID;
import java.util.Map;
@RestController
public class ProjectMemberItemController {
    @Autowired
    private ProjectMemberItemService projectMemberItemService;

    @GetMapping(value = "/projects/{userId}/any")
    public ResponseEntity<Boolean> checkIfUserInProject(@PathVariable String userId) {
        try {
            Boolean userExists = projectMemberItemService.checkIfUserExists(userId);
            return new ResponseEntity<>(userExists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/projects/{userId}")
    public ResponseEntity<List<ProjectMemberItem>> getUserProjects(@PathVariable String userId) {
        try {
            List<ProjectMemberItem> projects = projectMemberItemService.getUserProjects(userId);
            return new ResponseEntity<>(projects, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/projects/{projectId}/members")
    public ResponseEntity<List<ProjectMemberItem>> getProjectMembers(@PathVariable UUID projectId) {
        try {
            List<ProjectMemberItem> members = projectMemberItemService.getProjectMembers(projectId);
            return new ResponseEntity<>(members, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    

    @PostMapping(value = "/project/{projectId}/adduser/{teamId}")
    public ResponseEntity<ProjectMemberItem> addUserToProject(@RequestBody Map<String, String> payload, @PathVariable UUID projectId, @PathVariable UUID teamId) {
        String userId = payload.get("userId");
        return projectMemberItemService.addUserToProject(userId, projectId, teamId);
    }


}