package com.springboot.TaskO.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.TaskO.model.ProjectItem;
import com.springboot.TaskO.service.ProjectItemService;
import com.springboot.TaskO.service.TaskItemService;
import com.springboot.TaskO.service.SprintItemService;
import com.springboot.TaskO.service.TeamItemService;
import com.springboot.TaskO.service.UserItemService;

@WebMvcTest(ProjectItemController.class)
public class ProjectItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectItemService projectItemService;

    @MockBean
    private TaskItemService taskItemService;

    @MockBean
    private SprintItemService sprintItemService;

    @MockBean
    private TeamItemService teamItemService;

    @MockBean
    private UserItemService userItemService;

    @Autowired
    private ObjectMapper objectMapper;

    private ProjectItem testProject;
    private UUID testProjectId;

    @BeforeEach
    void setUp() {
        testProjectId = UUID.randomUUID();
        testProject = new ProjectItem();
        testProject.setProjectId(testProjectId);
        testProject.setProjectName("Test Project");
        testProject.setDescription("Test Description");
    }

    @Test
    void getAllProjects_ShouldReturnAllProjects() throws Exception {
        List<ProjectItem> projects = Arrays.asList(testProject);
        when(projectItemService.findAll()).thenReturn(projects);

        mockMvc.perform(get("/project/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectId").value(testProjectId.toString()))
                .andExpect(jsonPath("$[0].projectName").value("Test Project"))
                .andExpect(jsonPath("$[0].description").value("Test Description"));
    }

    @Test
    void getProjectById_ShouldReturnProject() throws Exception {
        when(projectItemService.getItemById(testProjectId))
                .thenReturn(ResponseEntity.ok(testProject));

        mockMvc.perform(get("/project/{id}", testProjectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(testProjectId.toString()))
                .andExpect(jsonPath("$.projectName").value("Test Project"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void getProjectById_WhenProjectNotFound_ShouldReturn404() throws Exception {
        when(projectItemService.getItemById(testProjectId))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/project/{id}", testProjectId))
                .andExpect(status().isNotFound());
    }

    @Test
    void addProject_ShouldCreateNewProject() throws Exception {
        when(projectItemService.addProjectItem(any(ProjectItem.class)))
                .thenReturn(testProject);

        mockMvc.perform(post("/project/new")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testProject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(testProjectId.toString()))
                .andExpect(jsonPath("$.projectName").value("Test Project"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void addProject_WhenServiceThrowsException_ShouldReturn500() throws Exception {
        when(projectItemService.addProjectItem(any(ProjectItem.class)))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/project/new")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testProject)))
                .andExpect(status().isInternalServerError());
    }
} 