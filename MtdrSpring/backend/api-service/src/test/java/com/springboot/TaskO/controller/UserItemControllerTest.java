package com.springboot.TaskO.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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
import com.springboot.TaskO.model.UserItem;
import com.springboot.TaskO.service.UserItemService;
import com.springboot.TaskO.service.TaskItemService;
import com.springboot.TaskO.service.ProjectItemService;
import com.springboot.TaskO.service.SprintItemService;
import com.springboot.TaskO.service.TeamItemService;

@WebMvcTest(UserItemController.class)
public class UserItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserItemService userItemService;

    @MockBean
    private TaskItemService taskItemService;

    @MockBean
    private ProjectItemService projectItemService;

    @MockBean
    private SprintItemService sprintItemService;

    @MockBean
    private TeamItemService teamItemService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserItem testUser;
    private String testUserId;
    private String testTelegramUsername;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID().toString();
        testTelegramUsername = "testuser";
        testUser = new UserItem();
        testUser.setId(testUserId);
        testUser.setTelegramUsername(testTelegramUsername);
        testUser.setEmail("test@example.com");
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() throws Exception {
        List<UserItem> users = Arrays.asList(testUser);
        when(userItemService.findAll()).thenReturn(users);

        mockMvc.perform(get("/users/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(testUserId))
                .andExpect(jsonPath("$[0].telegramUsername").value(testTelegramUsername))
                .andExpect(jsonPath("$[0].email").value("test@example.com"));
    }

    @Test
    void getUserByTelegramUsername_ShouldReturnUser() throws Exception {
        when(userItemService.findAll()).thenReturn(Arrays.asList(testUser));

        mockMvc.perform(get("/users/by-telegram/{telegramUsername}", testTelegramUsername))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(testUserId))
                .andExpect(jsonPath("$.telegramUsername").value(testTelegramUsername))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getUserByTelegramUsername_WhenUserNotFound_ShouldReturn404() throws Exception {
        when(userItemService.findAll()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/users/by-telegram/{telegramUsername}", "nonexistent"))
                .andExpect(status().isNotFound());
    }

    @Test
    void addNewUser_WithValidJwt_ShouldCreateUser() throws Exception {
        when(userItemService.verifyJwtWithClerk(anyString())).thenReturn(testUser);
        when(userItemService.addUserItem(any(UserItem.class))).thenReturn(testUser);

        mockMvc.perform(post("/newuser")
                .header("Authorization", "valid.jwt.token"))
                .andExpect(status().isCreated())
                .andExpect(content().string("User verified and created successfully"));
    }

    @Test
    void addNewUser_WithInvalidJwt_ShouldReturn401() throws Exception {
        when(userItemService.verifyJwtWithClerk(anyString())).thenReturn(null);

        mockMvc.perform(post("/newuser")
                .header("Authorization", "invalid.jwt.token"))
                .andExpect(status().isUnauthorized());
    }
} 