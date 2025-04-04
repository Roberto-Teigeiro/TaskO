package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.SprintItem;
import com.springboot.MyTodoList.service.SprintItemService;
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
}