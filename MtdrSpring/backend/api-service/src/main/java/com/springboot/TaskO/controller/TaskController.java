package com.springboot.TaskO.controller;
import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.service.TaskItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.net.URI;
import java.util.List;

import java.util.Optional;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.UUID;


@RestController
public class TaskController {
    @Autowired
    private TaskItemService taskItemService;
    //@CrossOrigin
    @GetMapping(value = "/task/all")
    public List<TaskItem> getAllToDoItems(){
        return taskItemService.findAll();
    }
    @PostMapping("/task/add")
    public ResponseEntity<TaskItem> addTaskItem(@RequestBody TaskItem task){
        TaskItem newTask = taskItemService.addTaskItem(task);
        HttpHeaders headers = new HttpHeaders();
        return new ResponseEntity<>(newTask, headers, HttpStatus.CREATED);
    }

    
    @GetMapping(value = "/task/{sprintId}")
    public List<TaskItem> getAllToDoItemsBySprintId(@PathVariable("sprintId") UUID sprintId){
        return taskItemService.findAllBySprintId(sprintId);
    }

    


    @GetMapping("/task/{id}")
    public ResponseEntity<TaskItem> getTaskItemById(@PathVariable("id") UUID id){
        return taskItemService.getItemById(id);
    }

    @PutMapping("/task/{id}")
    public ResponseEntity<TaskItem> updateTaskItem(@PathVariable("id") UUID id, @RequestBody TaskItem task) {
        TaskItem updatedTask = taskItemService.updateTaskItem(id, task);
        if (updatedTask != null) {
            return new ResponseEntity<>(updatedTask, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/task/{id}")
    public ResponseEntity<Void> deleteTaskItem(@PathVariable("id") UUID id) {
        boolean deleted = taskItemService.deleteTaskItem(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
