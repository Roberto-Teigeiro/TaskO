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
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.TaskO.model.TeamItem;
import com.springboot.TaskO.service.TeamItemService;
import com.springboot.TaskO.service.TaskItemService;
import com.springboot.TaskO.service.ProjectItemService;
import com.springboot.TaskO.service.SprintItemService;
import com.springboot.TaskO.service.UserItemService;

@WebMvcTest(TeamController.class)
public class TeamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeamItemService teamItemService;

    @MockBean
    private TaskItemService taskItemService;

    @MockBean
    private ProjectItemService projectItemService;

    @MockBean
    private SprintItemService sprintItemService;

    @MockBean
    private UserItemService userItemService;

    @Autowired
    private ObjectMapper objectMapper;

    private TeamItem testTeam;
    private UUID testTeamId;
    private UUID testProjectId;

    @BeforeEach
    void setUp() {
        testTeamId = UUID.randomUUID();
        testProjectId = UUID.randomUUID();
        testTeam = new TeamItem();
        testTeam.setTeamId(testTeamId);
        testTeam.setProjectId(testProjectId);
        testTeam.setName("Test Team");
    }

    @Test
    void getAllTeams_ShouldReturnAllTeams() throws Exception {
        List<TeamItem> teams = Arrays.asList(testTeam);
        when(teamItemService.findAll()).thenReturn(teams);

        mockMvc.perform(get("/team/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].teamId").value(testTeamId.toString()))
                .andExpect(jsonPath("$[0].projectId").value(testProjectId.toString()))
                .andExpect(jsonPath("$[0].name").value("Test Team"));
    }

    @Test
    void addTeam_ShouldCreateNewTeam() throws Exception {
        when(teamItemService.addTeamItem(any(TeamItem.class))).thenReturn(testTeam);

        mockMvc.perform(post("/team/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTeam)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamId").value(testTeamId.toString()))
                .andExpect(jsonPath("$.projectId").value(testProjectId.toString()))
                .andExpect(jsonPath("$.name").value("Test Team"));
    }

    @Test
    void addTeam_WhenServiceThrowsException_ShouldReturn500() throws Exception {
        when(teamItemService.addTeamItem(any(TeamItem.class)))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/team/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTeam)))
                .andExpect(status().isInternalServerError());
    }
} 