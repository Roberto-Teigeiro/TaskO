package com.springboot.TaskO.controller;

import com.springboot.TaskO.model.ProjectMemberItem;
import com.springboot.TaskO.model.UserItem;
import com.springboot.TaskO.service.ProjectMemberItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ProjectMemberItem> getUserProjectData(@PathVariable String userId) {
        try {
            // Directly return the ResponseEntity from the service
            return projectMemberItemService.getProjectMemberItemById(userId);
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