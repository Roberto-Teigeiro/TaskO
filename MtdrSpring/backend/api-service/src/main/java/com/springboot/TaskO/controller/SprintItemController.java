package com.springboot.TaskO.controller;

import com.springboot.TaskO.model.SprintItem;
import com.springboot.TaskO.service.SprintItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class SprintItemController {
    @Autowired
    private SprintItemService sprintItemService;

    @GetMapping(value = "/sprintlist")
    public List<SprintItem> getAllSprintItems() {
        System.out.println("Getting all Sprint Items...");
        return sprintItemService.findAll();
    }

    @GetMapping(value = "/sprintlist/{id}")
    public ResponseEntity<SprintItem> getSprintItemById(@PathVariable UUID id) {
        try {
            ResponseEntity<SprintItem> responseEntity = sprintItemService.getItemById(id);
            return new ResponseEntity<SprintItem>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PostMapping(value = "/sprint/add")
    public ResponseEntity<SprintItem> addSprintItem(@RequestBody SprintItem sprintItem) {
        try {
            SprintItem newSprintItem = sprintItemService.addSprintItem(sprintItem);
            return new ResponseEntity<>(newSprintItem, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}