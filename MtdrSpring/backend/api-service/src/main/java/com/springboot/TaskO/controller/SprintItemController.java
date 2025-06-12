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
        // System.out.println("Getting all Sprint Items...");
        return sprintItemService.findAll();
    }

    @GetMapping(value = "/sprintlist/{id}")
    public ResponseEntity<List<SprintItem>> getSprintItemsByProjectId(@PathVariable UUID id) {
        try {
            return sprintItemService.getItemsByProjectId(id);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
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

    @DeleteMapping("/sprint/{id}")
    public ResponseEntity<Void> deleteSprintItem(@PathVariable("id") UUID id) {
        try {
            boolean deleted = sprintItemService.deleteSprintItem(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}