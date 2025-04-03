package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.model.TaskItem;
import com.springboot.MyTodoList.model.UserItem;
import com.springboot.MyTodoList.service.TaskItemService;
import com.springboot.MyTodoList.service.UserItemService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.net.URI;
import java.util.List;
@RequestMapping("/api")

@RestController
public class UserItemController {
    @Autowired
    private UserItemService userItemService;
    //@CrossOrigin
    @GetMapping(value = "/users/all")
    public List<UserItem> getAllToDoItems(){
        return userItemService.findAll();
    }
    @PostMapping("/newuser")
    public ResponseEntity<String> addNewUser(@RequestHeader("Authorization") String jwt) {
        // Verify the JWT and extract user details
        UserItem userItem = userItemService.verifyJwtWithClerk(jwt);

        if (userItem == null) {
            return new ResponseEntity<>("Invalid JWT"+ jwt, HttpStatus.UNAUTHORIZED);
        }

        // Save the user to the database
        userItemService.addUserItem(userItem);

        return new ResponseEntity<>("User verified and created successfully", HttpStatus.CREATED);
    }
}







