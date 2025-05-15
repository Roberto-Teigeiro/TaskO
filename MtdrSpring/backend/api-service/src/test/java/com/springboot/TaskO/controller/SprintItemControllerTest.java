package com.springboot.TaskO.controller;

import static org.mockito.ArgumentMatchers.any;
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
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.TaskO.model.SprintItem;
import com.springboot.TaskO.service.SprintItemService;
import com.springboot.TaskO.service.TaskItemService;
import com.springboot.TaskO.service.ProjectItemService;
import com.springboot.TaskO.service.TeamItemService;
import com.springboot.TaskO.service.UserItemService;

@WebMvcTest(SprintItemController.class)
public class SprintItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SprintItemService sprintItemService;

    @MockBean
    private TaskItemService taskItemService;

    @MockBean
    private ProjectItemService projectItemService;

    @MockBean
    private TeamItemService teamItemService;

    @MockBean
    private UserItemService userItemService;

    @Autowired
    private ObjectMapper objectMapper;

    private SprintItem testSprint;
    private UUID testSprintId;
    private UUID testProjectId;

    @BeforeEach
    void setUp() {
        testSprintId = UUID.randomUUID();
        testProjectId = UUID.randomUUID();
        testSprint = new SprintItem();
        testSprint.setSprintId(testSprintId);
        testSprint.setProjectId(testProjectId);
        testSprint.setSprintName("Test Sprint");
        testSprint.setDescription("Test Description");
    }

    @Test
    void getAllSprints_ShouldReturnAllSprints() throws Exception {
        List<SprintItem> sprints = Arrays.asList(testSprint);
        when(sprintItemService.findAll()).thenReturn(sprints);

        mockMvc.perform(get("/sprintlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sprintId").value(testSprintId.toString()))
                .andExpect(jsonPath("$[0].projectId").value(testProjectId.toString()))
                .andExpect(jsonPath("$[0].name").value("Test Sprint"))
                .andExpect(jsonPath("$[0].description").value("Test Description"));
    }

    @Test
    void getSprintsByProjectId_ShouldReturnSprints() throws Exception {
        List<SprintItem> sprints = Arrays.asList(testSprint);
        when(sprintItemService.getItemsByProjectId(testProjectId))
                .thenReturn(ResponseEntity.ok(sprints));

        mockMvc.perform(get("/sprintlist/{id}", testProjectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sprintId").value(testSprintId.toString()))
                .andExpect(jsonPath("$[0].projectId").value(testProjectId.toString()))
                .andExpect(jsonPath("$[0].name").value("Test Sprint"))
                .andExpect(jsonPath("$[0].description").value("Test Description"));
    }

    @Test
    void getSprintsByProjectId_WhenServiceThrowsException_ShouldReturn500() throws Exception {
        when(sprintItemService.getItemsByProjectId(testProjectId))
                .thenReturn(ResponseEntity.status(500).build());

        mockMvc.perform(get("/sprintlist/{id}", testProjectId))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void addSprint_ShouldCreateNewSprint() throws Exception {
        when(sprintItemService.addSprintItem(any(SprintItem.class)))
                .thenReturn(testSprint);

        mockMvc.perform(post("/sprint/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSprint)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sprintId").value(testSprintId.toString()))
                .andExpect(jsonPath("$.projectId").value(testProjectId.toString()))
                .andExpect(jsonPath("$.name").value("Test Sprint"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void addSprint_WhenServiceThrowsException_ShouldReturn500() throws Exception {
        when(sprintItemService.addSprintItem(any(SprintItem.class)))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/sprint/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSprint)))
                .andExpect(status().isInternalServerError());
    }
} 