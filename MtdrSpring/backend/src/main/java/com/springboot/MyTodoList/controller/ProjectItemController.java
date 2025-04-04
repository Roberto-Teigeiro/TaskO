package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.ProjectItem;
import com.springboot.MyTodoList.service.ProjectItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@RequestMapping("/api")


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
        try {
            ResponseEntity<ProjectItem> responseEntity = projectItemService.getItemById(id);
            return new ResponseEntity<ProjectItem>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/project/new")
    public ProjectItem addProjectItem(@RequestBody ProjectItem  projectItem) {
        return projectItemService.addProjectItem(projectItem);
    }
}