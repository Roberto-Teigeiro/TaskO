package com.springboot.TaskO.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.model.ProjectItem;
import com.springboot.TaskO.model.SprintItem;
import com.springboot.TaskO.model.UserItem;
import com.springboot.TaskO.model.ProjectMemberItem;

import org.apache.tomcat.jni.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ApiClientService {
    
    private final RestTemplate restTemplate;
    private final String apiBaseUrl;
    private static final Logger logger = LoggerFactory.getLogger(ApiClientService.class);
    
    public ApiClientService(
            RestTemplate restTemplate,
            @Value("${api.service.url:http://localhost:8080}") String apiBaseUrl) {
        this.restTemplate = restTemplate;
        this.apiBaseUrl = apiBaseUrl;
    }
    
    // Task operations
    public List<TaskItem> getAllTasks() {
        TaskItem[] tasks = restTemplate.getForObject(
                apiBaseUrl + "/task/all", 
                TaskItem[].class);
        return Arrays.asList(tasks != null ? tasks : new TaskItem[0]);
    }
    
    public TaskItem createTask(TaskItem task) {
        return restTemplate.postForObject(
                apiBaseUrl + "/tasks",
                task,
                TaskItem.class);
    }
    
    public TaskItem addTask(TaskItem task) {
        return restTemplate.postForObject(
                apiBaseUrl + "/task/add",
                task,
                TaskItem.class);
    }
    
    public TaskItem getTaskById(UUID id) {
        return restTemplate.getForObject(
                apiBaseUrl + "/task/{id}", 
                TaskItem.class,
                id);
    }
    
    public void updateTask(TaskItem task, UUID id) {
        restTemplate.put(apiBaseUrl + "/task/{id}", task, id);
    }
    
    public void deleteTask(UUID id) {
        restTemplate.delete(apiBaseUrl + "/task/{id}", id);
    }
    
    // User operations
    public UserItem registerUser(String username, String telegramId) {
        try {
            return restTemplate.postForObject(
                    apiBaseUrl + "/users/register",
                    Map.of("username", username, "telegramId", telegramId),
                    UserItem.class);
        } catch (Exception e) {
            logger.error("Failed to register user: " + username + " with telegram: " + telegramId, e);
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }
    
    public List<UserItem> getAllUsers() {
        UserItem[] users = restTemplate.getForObject(
                apiBaseUrl + "/users",
                UserItem[].class);
        return Arrays.asList(users != null ? users : new UserItem[0]);
    }
    
    // Project operations
    public List<ProjectItem> getAllProjects() {
        ProjectItem[] projects = restTemplate.getForObject(
                apiBaseUrl + "/projects",
                ProjectItem[].class);
        return Arrays.asList(projects != null ? projects : new ProjectItem[0]);
    }
    
    // Sprint operations
    public List<SprintItem> getActiveSprintsByProject(UUID projectId) {
        SprintItem[] sprints = restTemplate.getForObject(
                apiBaseUrl + "/projects/{projectId}/sprints/active",
                SprintItem[].class,
                projectId);
        return Arrays.asList(sprints != null ? sprints : new SprintItem[0]);
    }
    
    // Project member operations
    public List<ProjectMemberItem> getProjectMembers(UUID projectId) {
        ProjectMemberItem[] members = restTemplate.getForObject(
                apiBaseUrl + "/projects/{projectId}/members",
                ProjectMemberItem[].class,
                projectId);
        return Arrays.asList(members != null ? members : new ProjectMemberItem[0]);
    }

    public UserItem getUserByTelegramUsername(String telegramUsername) {
        return restTemplate.getForObject(
            apiBaseUrl + "/users/by-telegram/" + telegramUsername,
            UserItem.class
        );
    }

    public List<SprintItem> getAllSprints() {
        SprintItem[] sprints = restTemplate.getForObject(
                apiBaseUrl + "/sprintlist",
                SprintItem[].class);
        return Arrays.asList(sprints != null ? sprints : new SprintItem[0]);
    }

    public UserItem registerUserByEmail(String email, String telegramId) {
        try {
            return restTemplate.postForObject(
                    apiBaseUrl +  "/users/register",
                    Map.of("email", email, "telegramId", telegramId),
                    UserItem.class);
        } catch (Exception e) {
            logger.error("Failed to register user with email: " + email + " and telegram: " + telegramId, e);
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }
}