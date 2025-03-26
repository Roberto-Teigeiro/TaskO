package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.model.TaskItem;
import com.springboot.MyTodoList.service.TaskItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.net.URI;
import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


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
    




}
