package com.springboot.TaskO.controller;

import com.springboot.TaskO.model.ProjectItem;
import com.springboot.TaskO.service.ProjectItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
public class ProjectItemController {
    @Autowired
    private ProjectItemService projectItemService;

    @GetMapping(value = "/project/all")
    public List<ProjectItem> getAllSprintItems() {
        System.out.println("Getting all projects...");
        return projectItemService.findAll();
    }

    @GetMapping(value = "/project/{id}")
    public ResponseEntity<ProjectItem> getSprintItemById(@PathVariable UUID id) {
        ResponseEntity<ProjectItem> responseEntity = projectItemService.getItemById(id);
        if (responseEntity.getBody() == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(responseEntity.getBody(), HttpStatus.OK);
    }

    @PostMapping("/project/new")
    public ResponseEntity<ProjectItem> addProjectItem(@RequestBody ProjectItem projectItem) {
        try {
            ProjectItem savedProject = projectItemService.addProjectItem(projectItem);
            return ResponseEntity.ok(savedProject);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}