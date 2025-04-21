package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.ProjectMemberItem;
import com.springboot.MyTodoList.service.ProjectMemberItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectMemberItemController {
    @Autowired
    private ProjectMemberItemService projectMemberItemService;

    @PostMapping("/{projectId}/members")
    public ResponseEntity<?> addProjectMember(
            @PathVariable UUID projectId,
            @RequestParam String userId,
            @RequestParam String role) {
        try {
            ProjectMemberItem member = new ProjectMemberItem(projectId, userId, null, role);
            ProjectMemberItem savedMember = projectMemberItemService.addProjectItem(member);
            return ResponseEntity.ok(savedMember);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add project member: " + e.getMessage());
        }
    }

    @GetMapping("/members/{userId}/exists")
    public ResponseEntity<Boolean> checkIfUserInProject(@PathVariable String userId) {
        try {
            Boolean userExists = projectMemberItemService.checkIfUserExists(userId);
            return ResponseEntity.ok(userExists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    @GetMapping("/members/{userId}")
    public ResponseEntity<ProjectMemberItem> getUserProjectData(@PathVariable String userId) {
        try {
            return projectMemberItemService.getProjectMemberItemById(userId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<ProjectMemberItem>> getProjectMembers(@PathVariable UUID projectId) {
        try {
            List<ProjectMemberItem> members = projectMemberItemService.findByProjectId(projectId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}