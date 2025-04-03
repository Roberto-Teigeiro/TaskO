package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.ProjectMemberItem;
import com.springboot.MyTodoList.service.ProjectMemberItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RequestMapping("/api")
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
    


}