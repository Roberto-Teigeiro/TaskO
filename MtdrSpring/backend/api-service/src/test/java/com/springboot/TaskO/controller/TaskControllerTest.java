package com.springboot.TaskO.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.service.TaskItemService;
import com.springboot.TaskO.service.ProjectItemService;
import com.springboot.TaskO.service.SprintItemService;
import com.springboot.TaskO.service.TeamItemService;
import com.springboot.TaskO.service.UserItemService;

@WebMvcTest(TaskController.class)
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskItemService taskItemService;

    @MockBean
    private ProjectItemService projectItemService;

    @MockBean
    private SprintItemService sprintItemService;

    @MockBean
    private TeamItemService teamItemService;

    @MockBean
    private UserItemService userItemService;

    @Autowired
    private ObjectMapper objectMapper;

    private TaskItem testTask;
    private UUID testTaskId;

    @BeforeEach
    void setUp() {
        testTaskId = UUID.randomUUID();
        testTask = new TaskItem();
        testTask.setId(testTaskId);
        testTask.setTitle("Test Task");
        testTask.setDescription("Test Description");
    }

    @Test
    void getAllTasks_ShouldReturnAllTasks() throws Exception {
        List<TaskItem> tasks = Arrays.asList(testTask);
        when(taskItemService.findAll()).thenReturn(tasks);

        mockMvc.perform(get("/task/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].taskId").value(testTaskId.toString()))
                .andExpect(jsonPath("$[0].title").value("Test Task"))
                .andExpect(jsonPath("$[0].description").value("Test Description"));
    }

    @Test
    void addTask_ShouldCreateNewTask() throws Exception {
        when(taskItemService.addTaskItem(any(TaskItem.class))).thenReturn(testTask);

        mockMvc.perform(post("/task/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTask)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.taskId").value(testTaskId.toString()))
                .andExpect(jsonPath("$.title").value("Test Task"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void getTasksBySprintId_ShouldReturnTasks() throws Exception {
        UUID sprintId = UUID.randomUUID();
        List<TaskItem> tasks = Arrays.asList(testTask);
        when(taskItemService.findAllBySprintId(sprintId)).thenReturn(tasks);

        mockMvc.perform(get("/task/sprint/{sprintId}", sprintId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].taskId").value(testTaskId.toString()))
                .andExpect(jsonPath("$[0].title").value("Test Task"))
                .andExpect(jsonPath("$[0].description").value("Test Description"));
    }

    @Test
    void getTaskById_ShouldReturnTask() throws Exception {
        when(taskItemService.getItemById(testTaskId)).thenReturn(new org.springframework.http.ResponseEntity<>(testTask, org.springframework.http.HttpStatus.OK));

        mockMvc.perform(get("/task/{id}", testTaskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskId").value(testTaskId.toString()))
                .andExpect(jsonPath("$.title").value("Test Task"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void getTaskById_WhenTaskNotFound_ShouldReturn404() throws Exception {
        when(taskItemService.getItemById(testTaskId)).thenReturn(new org.springframework.http.ResponseEntity<>(org.springframework.http.HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/task/{id}", testTaskId))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateTask_ShouldUpdateTask() throws Exception {
        TaskItem updatedTask = new TaskItem();
        updatedTask.setTaskId(testTaskId);
        updatedTask.setTitle("Updated Task");
        updatedTask.setDescription("Updated Description");
        
        when(taskItemService.updateTaskItem(eq(testTaskId), any(TaskItem.class)))
                .thenReturn(updatedTask);

        mockMvc.perform(put("/task/{taskId}", testTaskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskId").value(testTaskId.toString()))
                .andExpect(jsonPath("$.title").value("Updated Task"))
                .andExpect(jsonPath("$.description").value("Updated Description"));
    }

    @Test
    void updateTask_WhenTaskNotFound_ShouldReturn404() throws Exception {
        when(taskItemService.updateTaskItem(testTaskId, testTask))
                .thenReturn(null);

        mockMvc.perform(put("/task/{taskId}", testTaskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTask)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTask_ShouldDeleteTask() throws Exception {
        when(taskItemService.deleteTaskItem(testTaskId))
                .thenReturn(true);

        mockMvc.perform(delete("/task/{id}", testTaskId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteTask_WhenTaskNotFound_ShouldReturn404() throws Exception {
        when(taskItemService.deleteTaskItem(testTaskId))
                .thenReturn(false);

        mockMvc.perform(delete("/task/{id}", testTaskId))
                .andExpect(status().isNotFound());
    }
} 