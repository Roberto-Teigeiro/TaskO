package com.springboot.TaskO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.springboot.TaskO.service.SprintItemService;
import com.springboot.TaskO.service.TaskItemService;
import com.springboot.TaskO.service.UserItemService;

@SpringBootApplication
public class ApiServiceApplication implements CommandLineRunner {

    @Autowired
    private TaskItemService taskItemService;

    @Autowired
    private SprintItemService sprintItemService;

    @Autowired
    private UserItemService userItemService;

    public static void main(String[] args) {
        SpringApplication.run(ApiServiceApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize API-specific services here
        // Maybe load some data, check database connection, etc.
        
        // Test database connection if needed
        //sprintItemService.testDatabaseConnection();
    }
}