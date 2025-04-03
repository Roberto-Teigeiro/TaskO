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
public class ProjectMemberItemController {
    @Autowired
    private ProjectMemberItemService projectMemberItemService;

    @GetMapping(value = "/isinproject/{userId}")
    public ResponseEntity<Boolean> getSprintItemById(@PathVariable String userId) {
        try {
            Boolean userExists = projectMemberItemService.checkIfUserExists(userId);
            return new ResponseEntity<>(userExists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }


}