package com.springboot.TaskO.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.model.SprintItem;
import com.springboot.TaskO.model.UserItem;

@ExtendWith(MockitoExtension.class)
public class ApiClientServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private ApiClientService apiClientService;

    @BeforeEach
    void setUp() {
        apiClientService = new ApiClientService(restTemplate, "http://localhost:8080");
    }

    @Test
    void testCreateTask() {
        // Arrange
        TaskItem task = new TaskItem();
        task.setTitle("Test Task");
        task.setDescription("Test Description");
        
        TaskItem expectedResponse = new TaskItem();
        expectedResponse.setId(UUID.randomUUID());
        expectedResponse.setTitle(task.getTitle());
        expectedResponse.setDescription(task.getDescription());

        when(restTemplate.postForObject(
            eq("http://localhost:8080/task/add"),
            eq(task),
            eq(TaskItem.class)
        )).thenReturn(expectedResponse);

        // Act
        TaskItem result = apiClientService.addTask(task);

        // Assert
        assertNotNull(result);
        assertEquals(expectedResponse.getId(), result.getId());
        assertEquals(expectedResponse.getTitle(), result.getTitle());
        assertEquals(expectedResponse.getDescription(), result.getDescription());
    }

    @Test
    void testGetCompletedTasksInSprint() {
        // Arrange
        UUID sprintId = UUID.randomUUID();
        TaskItem task1 = new TaskItem();
        task1.setId(UUID.randomUUID());
        task1.setTitle("Completed Task 1");
        task1.setCompleted(true);

        TaskItem task2 = new TaskItem();
        task2.setId(UUID.randomUUID());
        task2.setTitle("Completed Task 2");
        task2.setCompleted(true);

        TaskItem[] tasks = {task1, task2};

        when(restTemplate.getForObject(
            eq("http://localhost:8080/task/all"),
            eq(TaskItem[].class)
        )).thenReturn(tasks);

        // Act
        List<TaskItem> result = apiClientService.getAllTasks();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(TaskItem::isCompleted));
    }

    @Test
    void testGetUserCompletedTasksInSprint() {
        // Arrange
        UUID userId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();

        TaskItem task1 = new TaskItem();
        task1.setId(UUID.randomUUID());
        task1.setTitle("User Completed Task 1");
        task1.setCompleted(true);
        task1.setAssignedTo(userId);

        TaskItem task2 = new TaskItem();
        task2.setId(UUID.randomUUID());
        task2.setTitle("User Completed Task 2");
        task2.setCompleted(true);
        task2.setAssignedTo(userId);

        TaskItem[] tasks = {task1, task2};

        when(restTemplate.getForObject(
            eq("http://localhost:8080/task/all"),
            eq(TaskItem[].class)
        )).thenReturn(tasks);

        // Act
        List<TaskItem> result = apiClientService.getAllTasks();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(task -> 
            task.isCompleted() && task.getAssignedTo().equals(userId)
        ));
    }
} 